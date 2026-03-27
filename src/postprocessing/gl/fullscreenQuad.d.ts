export declare class FullscreenQuad {
    private readonly gl;
    private readonly vao;
    private readonly buffer;
    constructor(gl: WebGL2RenderingContext);
    draw(): void;
    dispose(): void;
}
