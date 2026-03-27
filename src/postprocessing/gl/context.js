export function getWebGl2Context(canvas) {
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        throw new Error("WebGL2 is required for maplibre-gl-postprocessing.");
    }
    return gl;
}
