import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

export const RenderTargetShader = shaderMaterial(
  {
    time: 0,
    progressDistortion: 1.0,
    scale: 10.0,
    t: undefined,
  },
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
	`,
  `
uniform float time;
uniform sampler2D t;
uniform float scale;
uniform float progressDistortion;

varying vec2 vUv;



void main() {
	
    vec2 newUV = vUv;
	vec2 newUV2 = vUv;
    vec2 p = 2.0 * vUv - vec2(1.0);
    // distortion Shader
	if(progressDistortion > 0.01) {
    p += 0.1 * cos(scale * 3.0 * p.yx + time + vec2(1.2, 3.4));
    p += 0.1 * cos(scale * 3.7 * p.yx + 1.4 * time + vec2(2.2, 3.4));
    p += 0.1 * cos(scale * 5.0 * p.yx + 2.6 * time + vec2(4.2, 1.4));
    p += 0.3 * cos(scale * 7.0 * p.yx + 3.6 * time + vec2(10.2, 3.4));
	}

    newUV2.x = mix(vUv.x, length(p), progressDistortion);
    newUV2.y = mix(vUv.y, 0.0, progressDistortion);
    vec3 textureColor = texture2D(t, newUV2).rgb;
    vec4 color = vec4(textureColor, 1.0);
	gl_FragColor = color;
}

`,
)

extend({ RenderTargetShader })
