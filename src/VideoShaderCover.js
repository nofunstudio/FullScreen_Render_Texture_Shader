import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

export const VideoMaskShader = shaderMaterial(
  {
    textureSrc: undefined,
    alphaSrc: undefined,
    resolution: new THREE.Vector2(0.0, 0.0),
    textureAspectRatio: 16.0 / 9.0,
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
    uniform float textureAspectRatio;
    uniform float opacity;
    
    void main() {
      // Adjust the UV coordinates based on the aspect ratio
      float viewportAspectRatio = resolution.x / resolution.y;
      
      vec2 uv = vUv;
      
      if (textureAspectRatio < viewportAspectRatio) {
        // Texture is narrower than the viewport
        float scale = textureAspectRatio / viewportAspectRatio;
        float translation = (1.0 - scale) / 2.0;
        uv = vec2(uv.x * scale + translation, uv.y);
      } else {
        // Texture is wider than the viewport
        float scale = viewportAspectRatio / textureAspectRatio;
        float translation = (1.0 - scale) / 2.0;
        uv = vec2(uv.x, uv.y * scale + translation);
      }
      
      vec4 color = texture2D(textureSrc, uv);
      gl_FragColor = vec4(color.rgb, color.a * opacity);
    }
  `,
)
extend({ VideoMaskShader })
