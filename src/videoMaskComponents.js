import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, extend, useFrame, createPortal, useThree } from '@react-three/fiber'
import {
  Billboard,
  RenderTexture,
  useFBO,
  PerspectiveCamera,
  OrthographicCamera,
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
export default function VideoMask({ position, scale, opacityProp, ...props }) {
  const url = '11.mp4'
  const animateRef = useRef()
  const videoRef = useRef()
  //const colorTex = useVideoTexture(url)
  //const alphaTex = useVideoTexture(url)
  const videoUrlRef = useRef(url)
  const colorTex = useVideoTexture(url)
  const alphaTex = useVideoTexture(url)

  const [videoHeight, setVideoHeight] = useState(null)
  const [videoWidth, setVideoWidth] = useState(null)
  const res = [16, 9]
  const sizeScreen = useThree()
  const size = useAspect(window.innerWidth, window.innerHeight)

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
    <>
      <Billboard follow={false} lockX={false} lockY={false} lockZ={false}>
        <group scale={0.02}>
          <VideoMask position={[0, 0, -200]} scale={1} opacityProp={0.1} />
        </group>
      </Billboard>
      <group ref={spinRef} scale={[0.005, 0.005, 1]}>
        <VideoMask position={[0, 0, 0]} scale={1} opacityProp={0.9} />
        <VideoMask position={[0, 0, 0.25]} scale={1} opacityProp={0.8} />
        <VideoMask position={[0, 0, 0.5]} scale={1} opacityProp={0.7} />
        <VideoMask position={[0, 0, 0.75]} scale={1} opacityProp={0.6} />
        <VideoMask position={[0, 0, 1]} scale={1} opacityProp={0.5} />
        <VideoMask position={[0, 0, 1.25]} scale={1} opacityProp={0.4} />
        <VideoMask position={[0, 0, 1.5]} scale={1} opacityProp={0.3} />
        <VideoMask position={[0, 0, 1.75]} scale={1} opacityProp={0.2} />
        <VideoMask position={[0, 0, 2]} scale={1} opacityProp={0.1} />
      </group>
    </>
  )
}
