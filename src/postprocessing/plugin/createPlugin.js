import { getWebGl2Context } from "../gl/context";
import { PingPongTargets } from "../gl/pingPong";
import { createTexture, resizeTexture } from "../gl/framebuffer";
import { createColorGradePass } from "../passes/colorGradePass";
import { createFxaaPass } from "../passes/fxaaPass";
import { createVignettePass } from "../passes/vignettePass";
import { bindMapLifecycle } from "./lifecycle";
import { getEnabledPasses, registerPassRecord, setPassOrder, unregisterPassRecord } from "./registry";
import { createPluginState, getPassRecord, toPluginStats } from "./state";
const BUILT_IN_FACTORIES = {
    fxaa: createFxaaPass,
    vignette: createVignettePass,
    colorGrade: createColorGradePass,
};
function getCanvasSize(gl) {
    return {
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
    };
}
function createRuntimeResources(gl) {
    const size = getCanvasSize(gl);
    return {
        gl,
        size,
        captureTexture: createTexture(gl, size),
        pingPong: new PingPongTargets(gl, size),
    };
}
function disposeRuntimeResources(resources) {
    resources.pingPong.dispose();
    resources.gl.deleteTexture(resources.captureTexture);
}
function resizeRuntimeResources(resources) {
    const nextSize = getCanvasSize(resources.gl);
    if (nextSize.width === resources.size.width && nextSize.height === resources.size.height) {
        return;
    }
    resources.size = nextSize;
    resizeTexture(resources.gl, resources.captureTexture, nextSize);
    resources.pingPong.resize(nextSize);
}
function initializePasses(state, resources) {
    for (const record of state.passRecords) {
        record.pass.init?.({
            gl: resources.gl,
            width: resources.size.width,
            height: resources.size.height,
        });
        record.pass.resize?.({
            gl: resources.gl,
            width: resources.size.width,
            height: resources.size.height,
        });
    }
}
function disposePasses(state, gl) {
    for (const record of state.passRecords) {
        record.pass.dispose?.({ gl });
    }
}
function applyInitialPasses(state, options) {
    for (const pass of options?.customPasses ?? []) {
        registerPassRecord(state.passRecords, pass, { enabled: true });
    }
    for (const config of options?.passes ?? []) {
        const existing = state.passRecords.find((record) => record.id === config.id);
        if (existing) {
            existing.enabled = config.enabled ?? existing.enabled;
            if (config.uniforms) {
                for (const [name, value] of Object.entries(config.uniforms)) {
                    existing.pass.setUniform?.(name, value);
                }
            }
            continue;
        }
        const factory = BUILT_IN_FACTORIES[config.id];
        if (!factory) {
            throw new Error(`Unknown built-in pass "${config.id}". Register custom passes via customPasses/registerPass.`);
        }
        const pass = factory({ uniforms: config.uniforms });
        registerPassRecord(state.passRecords, pass, { enabled: config.enabled });
    }
}
export function createPostprocessingPlugin(options) {
    const state = createPluginState(options?.enabled ?? true);
    let runtime = null;
    applyInitialPasses(state, options);
    const debug = (message) => {
        if (!options?.debug) {
            return;
        }
        console.debug(`[maplibre-gl-postprocessing] ${message}`);
    };
    const renderFrame = () => {
        if (!runtime || !state.enabled) {
            return;
        }
        const enabledPasses = getEnabledPasses(state.passRecords);
        if (enabledPasses.length === 0) {
            return;
        }
        const startedAt = performance.now();
        const { resources } = runtime;
        const { gl } = resources;
        resizeRuntimeResources(resources);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, resources.captureTexture);
        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, resources.size.width, resources.size.height);
        gl.bindTexture(gl.TEXTURE_2D, null);
        let inputTexture = resources.captureTexture;
        for (let index = 0; index < enabledPasses.length; index += 1) {
            const record = enabledPasses[index];
            const isLastPass = index === enabledPasses.length - 1;
            const outputFramebuffer = isLastPass ? null : resources.pingPong.write.framebuffer;
            record.pass.render({
                gl,
                width: resources.size.width,
                height: resources.size.height,
                inputTexture,
                outputFramebuffer,
                timeMs: startedAt,
            });
            if (!isLastPass) {
                inputTexture = resources.pingPong.write.texture;
                resources.pingPong.swap();
            }
        }
        state.lastFrameMs = performance.now() - startedAt;
    };
    const handleResize = () => {
        if (!runtime) {
            return;
        }
        resizeRuntimeResources(runtime.resources);
        for (const record of state.passRecords) {
            record.pass.resize?.({
                gl: runtime.resources.gl,
                width: runtime.resources.size.width,
                height: runtime.resources.size.height,
            });
        }
    };
    const plugin = {
        attach(map) {
            if (runtime) {
                throw new Error("Plugin is already attached.");
            }
            const gl = getWebGl2Context(map.getCanvas());
            const resources = createRuntimeResources(gl);
            initializePasses(state, resources);
            const unbindLifecycle = bindMapLifecycle(map, {
                onRender: renderFrame,
                onResize: handleResize,
                onRemove: () => {
                    plugin.detach();
                },
            });
            runtime = { map, resources, unbindLifecycle };
            debug("Attached to map.");
            map.triggerRepaint();
        },
        detach() {
            if (!runtime) {
                return;
            }
            runtime.unbindLifecycle();
            disposePasses(state, runtime.resources.gl);
            disposeRuntimeResources(runtime.resources);
            runtime = null;
            debug("Detached from map.");
        },
        registerPass(pass, passOptions) {
            const record = registerPassRecord(state.passRecords, pass, passOptions);
            if (runtime) {
                record.pass.init?.({
                    gl: runtime.resources.gl,
                    width: runtime.resources.size.width,
                    height: runtime.resources.size.height,
                });
                record.pass.resize?.({
                    gl: runtime.resources.gl,
                    width: runtime.resources.size.width,
                    height: runtime.resources.size.height,
                });
                runtime.map.triggerRepaint();
            }
        },
        unregisterPass(id) {
            const removed = unregisterPassRecord(state.passRecords, id);
            if (runtime) {
                removed.pass.dispose?.({ gl: runtime.resources.gl });
                runtime.map.triggerRepaint();
            }
        },
        enablePass(id) {
            getPassRecord(state, id).enabled = true;
            runtime?.map.triggerRepaint();
        },
        disablePass(id) {
            getPassRecord(state, id).enabled = false;
            runtime?.map.triggerRepaint();
        },
        setUniform(passId, uniform, value) {
            const record = getPassRecord(state, passId);
            if (!record.pass.setUniform) {
                throw new Error(`Pass "${passId}" does not support uniforms.`);
            }
            record.pass.setUniform(uniform, value);
            runtime?.map.triggerRepaint();
        },
        setPassOrder(idsInExecutionOrder) {
            setPassOrder(state.passRecords, idsInExecutionOrder);
            runtime?.map.triggerRepaint();
        },
        setEnabled(enabled) {
            state.enabled = enabled;
            runtime?.map.triggerRepaint();
        },
        getStats() {
            return toPluginStats(state);
        },
    };
    return plugin;
}
