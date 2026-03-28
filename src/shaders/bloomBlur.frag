#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_texelSize;
uniform int u_horizontal;
uniform float u_spread;
out vec4 outColor;

void main() {
  vec2 off = u_texelSize * u_spread;
  vec3 result = texture(u_image, v_uv).rgb * 0.227027;
  if (u_horizontal == 1) {
    result += texture(u_image, v_uv + vec2(off.x * 1.0, 0.0)).rgb * 0.1945946;
    result += texture(u_image, v_uv - vec2(off.x * 1.0, 0.0)).rgb * 0.1945946;
    result += texture(u_image, v_uv + vec2(off.x * 2.0, 0.0)).rgb * 0.1216216;
    result += texture(u_image, v_uv - vec2(off.x * 2.0, 0.0)).rgb * 0.1216216;
    result += texture(u_image, v_uv + vec2(off.x * 3.0, 0.0)).rgb * 0.054054;
    result += texture(u_image, v_uv - vec2(off.x * 3.0, 0.0)).rgb * 0.054054;
    result += texture(u_image, v_uv + vec2(off.x * 4.0, 0.0)).rgb * 0.016216;
    result += texture(u_image, v_uv - vec2(off.x * 4.0, 0.0)).rgb * 0.016216;
  } else {
    result += texture(u_image, v_uv + vec2(0.0, off.y * 1.0)).rgb * 0.1945946;
    result += texture(u_image, v_uv - vec2(0.0, off.y * 1.0)).rgb * 0.1945946;
    result += texture(u_image, v_uv + vec2(0.0, off.y * 2.0)).rgb * 0.1216216;
    result += texture(u_image, v_uv - vec2(0.0, off.y * 2.0)).rgb * 0.1216216;
    result += texture(u_image, v_uv + vec2(0.0, off.y * 3.0)).rgb * 0.054054;
    result += texture(u_image, v_uv - vec2(0.0, off.y * 3.0)).rgb * 0.054054;
    result += texture(u_image, v_uv + vec2(0.0, off.y * 4.0)).rgb * 0.016216;
    result += texture(u_image, v_uv - vec2(0.0, off.y * 4.0)).rgb * 0.016216;
  }
  outColor = vec4(result, 1.0);
}
