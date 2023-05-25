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
  
 
 //noise displace///////////
  // float effectFactor = 0.5;
  // vec4 disp = texture2D(disp, uv);
  // vec2 distortedPosition = vec2(uv.x + dispFactor * (disp.r*effectFactor), uv.y);
  float effectFactor = 0.4;
  vec4 disp = texture2D(disp, vUv);
  vec2 distortedPosition = vec2(vUv.x + dispFactor * (disp.r*effectFactor), vUv.y);
  ///noise displace///////////
//other noise
vec2 p = 2.0 * vUv - vec2(1.0);
    // distortion Shader
	float scale = 0.54;
    p += 0.1 * cos(scale * 3.0 * p.yx + u_time + vec2(1.2, 3.4));
    p += 0.1 * cos(scale * 3.7 * p.yx + 1.4 * u_time + vec2(2.2, 3.4));
    p += 0.1 * cos(scale * 5.0 * p.yx + 2.6 * u_time + vec2(4.2, 1.4));
    p += 0.3 * cos(scale * 7.0 * p.yx + 3.6 * u_time + vec2(10.2, 3.4));
	
    p += random(p);
    distortedPosition.x = mix(vUv.x, length(p), dispFactor);
    distortedPosition.y = mix(vUv.y, 0.0, dispFactor);


;
  vec4 tex = texture2D(u_texture, vUv);
  //vec4 texGrid = texture2D(u_texture, distortedPosition);
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
