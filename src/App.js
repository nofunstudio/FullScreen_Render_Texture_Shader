import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, extend, useFrame, createPortal, useThree } from '@react-three/fiber'
import { Billboard, RenderTexture, PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { useScoreStore } from './ScoreStore'
import * as THREE from 'three'
import { gsap } from 'gsap'
import VideoMask from './videoMaskComponents'
import { Planes } from './Planes'
import { renderTargetShader } from './RenderTargetShaderPlain'
import Nav from './Nav'
import { VideoMaskShader } from './VideoMaskShader'

export function RenderTexSetup() {
  const renderTexRef = useRef()
  const shaderRef = useRef()
  const cameraRef = useRef()
  const [centered, setCentered] = useState(true)
  const { controller, setController, blueprint, setBlueprint, isMobileDevice } = useScoreStore()

  const { viewport } = useThree()
  let x = 0
  let y = 0
  const lerpSpeed = 0.025
  const [vec] = useState(() => new THREE.Vector3())

  useFrame((state, delta) => {
    shaderRef.current.t = renderTexRef.current
    // Calculate the distance of the mouse from the center of the quadrant
    const dx = Math.abs(state.mouse.x) // Assuming quadrant center is at 0.5, 0.5
    const dy = Math.abs(state.mouse.y)
    //lerp the target position
    x += (dx - x) * lerpSpeed
    y += (dy - y) * lerpSpeed
    const dSum = (x + y) * 1 // Sum of the distances in the x and y direction

    // Normalize the distance to [0,1]
    const dist = Math.min(Math.max(dSum, 0.0), 1) // Ensure the distance stays within 0 and 1
    shaderRef.current.scale = dSum / 8 + 4.1

    // Use the normalized distance to update progressDistortion
    if (!centered) {
      //  shaderRef.current.progressDistortion = (1 - dist) / 4 // Subtracting from 1 so that pro
    }
    shaderRef.current.time += delta * dSum + 0.01
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0)
      if (centered) {
        cameraRef.current.position.lerp(vec.set(state.mouse.x, state.mouse.y * 50, 100), 0.05)
      } else {
        cameraRef.current.position.lerp(vec.set(0, 0, 100), 0.05)
      }
    }
  })
  useEffect(() => {
    shaderRef.current.t = renderTexRef.current
  }, [renderTexRef])

  useEffect(() => {
    if (centered) {
      shaderRef.current.progressDistortion = 0.0
      shaderRef.current.time = 0.0

      // gsap.to(shaderRef.current, {
      //   progressDistortion: 0.0,
      //   duration: 0.05,
      //   ease: 'power2.inOut',
      // })
    }
  }, [centered])

  return (
    <>
      <RenderTexture ref={renderTexRef} attach="map" anisotropy={0}>
        <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 0, 100]} />
        <color attach="background" args={['black']} />
        {/* <OrbitControls /> */}
        <ambientLight intensity={0.5} />
        {/* <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <group scale={0.1}>
            <VideoMask position={[0, 0, -100]} scale={1} opacityProp={0.1} />
          </group>
        </Billboard> */}
        <Planes centered={centered} setCentered={setCentered} />
        {/* <VideoMaskStack /> */}
      </RenderTexture>
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry />

        <renderTargetShader ref={shaderRef} scale={2.5} t={shaderRef.current} time={0.1} progressDistortion={0.0} />
      </mesh>
    </>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <Canvas orthographic>
        <Suspense fallback={null}>
          <RenderTexSetup />
        </Suspense>
      </Canvas>
    </>
  )
}
