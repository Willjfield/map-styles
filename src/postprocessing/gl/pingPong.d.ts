import { type RenderTarget } from "./framebuffer";
import type { Size } from "../types/internal";
export declare class PingPongTargets {
    private readonly gl;
    private readonly targets;
    private activeIndex;
    constructor(gl: WebGL2RenderingContext, size: Size);
    get read(): RenderTarget;
    get write(): RenderTarget;
    swap(): void;
    resize(size: Size): void;
    dispose(): void;
}
