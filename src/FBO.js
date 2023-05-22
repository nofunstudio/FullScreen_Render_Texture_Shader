import { Suspense, useRef, useEffect, useMemo } from 'react'
import { RenderTexture, Canvas, extend, useFrame, createPortal, useThree } from '@react-three/fiber'
import {
  useFBO,
  PerspectiveCamera,
  Environment,
  OrbitControls,
  useAspect,
  useVideoTexture,
  useTexture,
  shaderMaterial,
} from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { DoubleSide } from 'three'

import { VideoMaskShader } from './VideoMaskShader'
import { RenderTargetShader } from './RenderTagetShader'

function VideoMask({ position, scale, opacityProp, ...props }) {
  const url = 'G.mp4'
  const animateRef = useRef()
  const videoRef = useRef()
  const colorTex = useVideoTexture(url)
  const alphaTex = useVideoTexture(url)
  const res = [colorTex.width, colorTex.height]
  const size = useAspect(9, 9)
  //console.log(size)
  return (
    <mesh ref={animateRef} position={position} scale={size}>
      <planeGeometry />
      <Suspense>
        <videoMaskShader ref={videoRef} textureSrc={colorTex} alphaSrc={alphaTex} resolution={res} opacity={opacityProp} />
      </Suspense>
    </mesh>
  )
}

function FallbackMaterial({ url }) {
  const texture = useTexture(url)
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function VideoMaskStack() {
  const spinRef = useRef()
  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 }) // Create a GSAP timeline with infinite repeats
    tl.to(spinRef.current.rotation, {
      y: Math.PI * 4, // Two revolutions (2 * 2π radians)
      duration: 50, // Duration of the animation in seconds
      ease: 'linear', // Linear easing for constant speed
    })
  }, [])

  return (
    <group ref={spinRef}>
      <VideoMask position={[0, 0, 0]} scale={10} opacityProp={0.9} />
      <VideoMask position={[0, 0, 0.5]} scale={10} opacityProp={0.8} />
      <VideoMask position={[0, 0, 1]} scale={10} opacityProp={0.7} />
      <VideoMask position={[0, 0, 1.5]} scale={10} opacityProp={0.6} />
      <VideoMask position={[0, 0, 2]} scale={10} opacityProp={0.5} />
      <VideoMask position={[0, 0, 2.5]} scale={10} opacityProp={0.4} />
      <VideoMask position={[0, 0, 3]} scale={10} opacityProp={0.3} />
      <VideoMask position={[0, 0, 3.5]} scale={10} opacityProp={0.2} />
      <VideoMask position={[0, 0, 4.0]} scale={10} opacityProp={0.1} />
    </group>
  )
}

export function Cube() {
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial>
        <RenderTexture attach="map" anisotropy={16}>
          <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[0, 0, 5]} />
          <color attach="background" args={['orange']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} />
          <VideoMaskStack />
        </RenderTexture>
      </meshStandardMaterial>
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas style={{ background: '#000000' }} camera={{ position: [0, 0, 5], near: 0.1, far: 1000 }}>
      <Suspense fallback={null}>
        <Cube />
      </Suspense>
    </Canvas>
  )
}
