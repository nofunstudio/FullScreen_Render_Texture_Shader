// ========================================================
// shader
export const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

export const fragmentShader = `
uniform sampler2D disp;
uniform float dispFactor;
uniform float u_transitionShader;
uniform vec2 u_amounts;
uniform sampler2D u_texture;
uniform vec2 u_uvScale;
uniform vec2 u_absoluteUv;
uniform float u_time;
uniform float u_aspectRatio; // New uniform for viewport aspect ratio
varying vec2 vUv;

#define PI 3.14159265359

float Xor(float a, float b){
    return a * (1.0 - b) + b*(1.0-a);
}

float random(vec2 st) {
  return fract(sin(dot(st.xy,
                       vec2(12.9898,78.233)))
               * 43758.5453123);
}


void main() {
  vec2 uv = vUv / u_amounts + u_absoluteUv;

  // Adjust the UV coordinates based on the aspect ratio
  float textureAspectRatio = u_amounts.x / u_amounts.y;
  float viewportAspectRatio = u_aspectRatio;
  
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

  uv = (uv - 0.5) * u_uvScale + 0.5; // scale aspect ratio
  
 
  float effectFactor = 0.4;
  vec4 disp = texture2D(disp, vUv);
  vec2 distortedPosition = vec2(vUv.x + dispFactor * (disp.r*effectFactor), vUv.y);
  ///noise displace///////////



;
  vec4 tex = texture2D(u_texture, vUv);
  vec2 mixUV = mix(uv, distortedPosition, dispFactor);
  
  vec4 texGrid = texture2D(u_texture, mixUV);

  
  if(u_transitionShader < 1.0){
    //float grayscale = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
      //float tolerance = 0.01;
      
        gl_FragColor = vec4(tex.rgb, 1.0 );
      
    }
    
    
    if(u_transitionShader > 0.9){
      gl_FragColor = texGrid;
    }

    

}
`
