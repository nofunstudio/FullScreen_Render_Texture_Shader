import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, extend, useFrame, createPortal, useThree } from '@react-three/fiber'
import { Billboard, RenderTexture, PerspectiveCamera, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import VideoMask from './videoMaskComponents'
import { Planes } from './Planes'
import { renderTargetShader } from './RenderTagetShader'

import { VideoMaskShader } from './VideoMaskShader'

export function RenderTexSetup() {
  const renderTexRef = useRef()
  const shaderRef = useRef()
  const viewport = useThree((state) => state.viewport)

  useFrame((state, delta) => {
    shaderRef.current.t = renderTexRef.current
    //shaderRef.current.progressDistortion = state.mouse.y / 2
    shaderRef.current.time += delta * 0.3
  })

  return (
    <>
      <RenderTexture ref={renderTexRef} attach="map" anisotropy={0}>
        <PerspectiveCamera makeDefault position={[0, 0, 790]} />
        <color attach="background" args={['black']} />
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <group scale={1}>
            <VideoMask position={[0, 0, -100]} scale={1} opacityProp={0.1} />
          </group>
        </Billboard>
        <Planes url="11.mp4" />
        {/* <VideoMaskStack /> */}
      </RenderTexture>
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry />

        <renderTargetShader ref={shaderRef} scale={2} t={shaderRef.current} time={0.1} progressDistortion={0.0} />
      </mesh>
    </>
  )
}

export default function App() {
  return (
    <Canvas orthographic>
      <Suspense fallback={null}>
        <RenderTexSetup />
      </Suspense>
    </Canvas>
  )
}
