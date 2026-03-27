/**
 * Wraps a pass so `resize` updates a vec2 uniform (default `u_resolution`) from the canvas size.
 * Use for shader passes that sample with pixel stride (blur, FXAA, etc.).
 */
export function withResizeUniform(pass, uniformName = "u_resolution") {
    return {
        ...pass,
        init(ctx) {
            pass.init?.(ctx);
            pass.setUniform?.(uniformName, [ctx.width, ctx.height]);
        },
        resize(ctx) {
            pass.setUniform?.(uniformName, [ctx.width, ctx.height]);
            pass.resize?.(ctx);
        },
        render(ctx) {
            pass.render(ctx);
        },
        dispose(ctx) {
            pass.dispose?.(ctx);
        },
        setUniform(name, value) {
            pass.setUniform?.(name, value);
        },
    };
}
