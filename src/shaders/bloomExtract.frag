#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_input;
uniform float u_threshold;
uniform float u_knee;
out vec4 outColor;

void main() {
  vec3 color = texture(u_input, v_uv).rgb;
  float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float contrib = smoothstep(u_threshold - u_knee, u_threshold + u_knee, brightness);
  outColor = vec4(color * contrib, 1.0);
}
