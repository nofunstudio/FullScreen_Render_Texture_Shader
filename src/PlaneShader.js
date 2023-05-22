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
  // float effectFactor = 0.2;
  // vec4 disp = texture2D(disp, uv);
  // vec2 distortedPosition = vec2(uv.x + dispFactor * (disp.r*effectFactor), uv.y);
  float effectFactor = 0.4;
  vec4 disp = texture2D(disp, vUv);
  vec2 distortedPosition = vec2(vUv.x + dispFactor * (disp.r*effectFactor), vUv.y);
  ///noise displace///////////

  //circle parametric//////////
  vec2 uvCirc = vUv;
  float amount = 15.0;
  uvCirc.y -= (0.5 + 1.0 / amount * 0.5);
  uvCirc.x -= (0.5 - 1.0 / amount * 0.5);
  float a = PI * 0.5; //angle;
  float c= cos(a);
  float s= sin(a);
  uvCirc*= mat2(c,-s,s,c);
  uvCirc *= amount;
  
  vec3 col = vec3(0.0);
  vec2 gv = fract(uvCirc) - 0.5;//grid uv
  vec2 id = floor( uvCirc);

  float d = length(gv);
  float m = 0.0;

  float t = u_time;

  for(float y = -1.0; y<=1.0; y++){
      for(float x = -1.0; x<=1.0; x++){
          vec2 offs = vec2(x,y);

          float d = length(gv - offs);
          float dist = length(id + offs) * 0.3;
          float r = mix(0.3, 1.5, sin(dist - t)*0.5 + 0.5);
          m = Xor(m, smoothstep(r, r * 0.95, d));
      }
  }

  // col.rg = gv;
  col += m;
  vec3 col_normalized = normalize(col);
  vec2 distortedCircleUV = vUv + col.xy * .05; // adjust the 0.1 multiplier to control the amount of distortion

//circle parametric//////////


  vec4 tex = texture2D(u_texture, vUv);
  //vec4 texGrid = texture2D(u_texture, distortedPosition);
  vec2 mixUV = mix(uv, distortedPosition, dispFactor);
  vec4 texGrid = texture2D(u_texture, mixUV);
  if(u_transitionShader < 1.0){
    float grayscale = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
      float tolerance = 0.01;
      if (grayscale < tolerance) {
        discard;  // Don't draw this pixel.
      } else {
        gl_FragColor = vec4(tex.rgb, 1.0 );
      }
    }
    
    
    if(u_transitionShader > 0.9){
      gl_FragColor = texGrid;
    }

    

}
`
