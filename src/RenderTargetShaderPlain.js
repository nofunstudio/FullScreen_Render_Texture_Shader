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
    vec3 textureColor = texture2D(t, newUV).rgb;
    vec4 color = vec4(textureColor, 1.0);
	gl_FragColor = color;
}

`,
)

extend({ RenderTargetShader })
