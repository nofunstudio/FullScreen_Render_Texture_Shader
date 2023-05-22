import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { DoubleSide } from 'three'

export const VideoMaskShader = shaderMaterial(
  {
    textureSrc: undefined,
    alphaSrc: undefined,
    resolution: new THREE.Vector2(0.0, 0.0),
    side: DoubleSide,
    transparent: true,
    opacity: 1.0,
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    varying vec2 vUv;
    uniform sampler2D textureSrc;
    uniform sampler2D alphaSrc;
    uniform vec2 resolution;
    uniform float opacity;
    
    void main() {
      vec4 color = texture2D(textureSrc, vUv);
      
      vec4 alpha = texture2D(alphaSrc, vUv);
      float grayscale = dot(alpha.rgb, vec3(0.299, 0.587, 0.114));
      float tolerance = 0.01;
      if (grayscale < tolerance) {
        discard;  // Don't draw this pixel.
      } else {
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    
    }
  `,
)
extend({ VideoMaskShader })
