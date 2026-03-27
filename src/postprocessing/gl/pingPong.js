import { createRenderTarget, disposeRenderTarget, resizeTexture } from "./framebuffer";
export class PingPongTargets {
    constructor(gl, size) {
        this.activeIndex = 0;
        this.gl = gl;
        this.targets = [createRenderTarget(gl, size), createRenderTarget(gl, size)];
    }
    get read() {
        return this.targets[this.activeIndex];
    }
    get write() {
        return this.targets[this.activeIndex === 0 ? 1 : 0];
    }
    swap() {
        this.activeIndex = this.activeIndex === 0 ? 1 : 0;
    }
    resize(size) {
        const { gl } = this;
        resizeTexture(gl, this.targets[0].texture, size);
        resizeTexture(gl, this.targets[1].texture, size);
    }
    dispose() {
        const { gl } = this;
        disposeRenderTarget(gl, this.targets[0]);
        disposeRenderTarget(gl, this.targets[1]);
    }
}
