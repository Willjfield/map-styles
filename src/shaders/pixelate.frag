#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_input;
uniform vec2 u_resolution;
uniform float u_blockSize;
out vec4 outColor;

void main() {
  float b = max(u_blockSize, 1.0);
  vec2 blocks = max(floor(u_resolution / b), vec2(1.0));
  vec2 cell = floor(v_uv * blocks);
  vec2 uv = (cell + 0.5) / blocks;
  outColor = texture(u_input, uv);
}
