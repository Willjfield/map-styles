export class FullscreenQuad {
    constructor(gl) {
        this.gl = gl;
        const vao = gl.createVertexArray();
        const buffer = gl.createBuffer();
        if (!vao || !buffer) {
            throw new Error("Failed to create fullscreen quad resources.");
        }
        this.vao = vao;
        this.buffer = buffer;
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        const vertices = new Float32Array([
            -1, -1, 0, 0,
            1, -1, 1, 0,
            -1, 1, 0, 1,
            1, 1, 1, 1,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
    draw() {
        const { gl } = this;
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);
    }
    dispose() {
        const { gl } = this;
        gl.deleteBuffer(this.buffer);
        gl.deleteVertexArray(this.vao);
    }
}
