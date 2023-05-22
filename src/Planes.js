import { useTexture, useVideoTexture, Plane } from '@react-three/drei'
import { useMemo, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { vertexShader, fragmentShader } from './PlaneShader'

export const Planes = ({ url }) => {
  const [centered, setCentered] = useState(false)
  const { size } = useThree() // access viewport size
  const videoRef = useRef(url)
  const texture = useVideoTexture(url)
  const noiseTexture = useTexture('noise.jpg')
  const videoHeight = texture.video?.videoHeight
  const videoWidth = texture.video?.videoWidth
  const textureAspect = texture.video ? videoWidth / videoHeight : 1

  const gap = { x: 2.0, y: 2.0 } // constant gap size

  // Calculate the maximum number of planes that can fit in the viewport
  const maxAmount = useMemo(() => {
    return {
      x: Math.min(Math.floor((size.width - gap.x) / (gap.x + textureAspect)), 4),
      y: Math.min(Math.floor((size.height - gap.y) / gap.y), 4),
    }
  }, [size, gap, textureAspect])

  // Calculate the plane size based on the viewport size and the calculated number of planes
  const planeSize = useMemo(() => {
    return {
      width: (size.width - gap.x * maxAmount.x) / maxAmount.x,
      height: (size.height - gap.y * maxAmount.y) / maxAmount.y,
    }
  }, [size, gap, maxAmount])

  // calc plane positions and absolute uvs
  const datas = useMemo(() => {
    const datas = []
    const offset = {
      x: (maxAmount.x - 1) * (planeSize.width + gap.x) * 0.5,
      y: (maxAmount.y - 1) * (planeSize.height + gap.y) * 0.5,
    }
    for (let ix = 0; ix < maxAmount.x; ix++) {
      for (let iy = 0; iy < maxAmount.y; iy++) {
        const x = ix * (planeSize.width + gap.x) - offset.x
        const y = iy * (planeSize.height + gap.y) - offset.y
        const position = new THREE.Vector3(x, y, 0)
        const uv = new THREE.Vector2(ix / maxAmount.x, iy / maxAmount.y)
        datas.push({ position, uv })
      }
    }
    return datas
  }, [maxAmount, planeSize, gap])

  // calc uv scale for covered texture
  const uvScale = useMemo(() => {
    const textureAspect = texture.video ? videoWidth / videoHeight : 1
    const aspect = (maxAmount.x * planeSize.width) / (maxAmount.y * planeSize.height)
    const ratio = aspect / textureAspect
    const [x, y] = aspect < textureAspect ? [ratio, 1] : [1, 1 / ratio]
    return new THREE.Vector2(x, y)
  }, [maxAmount, planeSize, textureAspect, videoHeight, videoWidth])

  return (
    <group>
      {datas.map((data, i) => (
        <FragmentPlane
          key={i}
          maxAmount={new THREE.Vector2(maxAmount.x, maxAmount.y)}
          planeSize={planeSize}
          zIndex={i * 10}
          texture={texture}
          noiseTexture={noiseTexture}
          uvScale={uvScale}
          data={data}
          centered={centered}
          setCentered={setCentered}
        />
      ))}
    </group>
  )
}

const FragmentPlane = ({ noiseTexture, zIndex, maxAmount, planeSize, uvScale, texture, data, centered, setCentered, ...props }) => {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const initialPos = useRef(data.position)
  const { size } = useThree()
  const aspectRatio = size.width / size.height
  const shaderRef = useRef()

  const shader = {
    uniforms: {
      dispFactor: { value: 0 },
      u_time: { value: 0 },
      u_transitionShader: { value: centered ? 0 : 1 },
      u_amounts: { value: maxAmount },
      disp: { value: noiseTexture },
      u_texture: { value: texture },
      u_uvScale: { value: uvScale },
      u_absoluteUv: { value: data.uv },
      u_aspectRatio: { value: aspectRatio }, // Pass the aspect ratio as a uniform
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  }
  useEffect(() => {
    const anim = gsap.fromTo(
      meshRef.current.position,

      {
        x: centered ? initialPos.current.x : 0,
        y: centered ? initialPos.current.y : 0,
        z: centered ? initialPos.current.z : zIndex, // set z offset when not centered
        duration: 0.8,
      },
      {
        x: centered ? 0 : initialPos.current.x,
        y: centered ? 0 : initialPos.current.y,
        z: centered ? zIndex : initialPos.current.z, // set z offset when centered
        duration: 0.8,
      },
    )

    // Clean up GSAP animation when component unmounts or when centered state changes
    return () => {
      anim.kill()
    }
  }, [centered, setCentered])

  useEffect(() => {
    if (isHovered && !centered) {
      gsap.to(meshRef.current.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.9 })

      gsap.to(shaderRef.current.uniforms.dispFactor, { value: 0.9, duration: 0.9, ease: 'power2.out' })
      // gsap.to(shaderRef.current.uniforms.u_time, { value: 3.0, duration: 8.0 })
    }
  }, [isHovered, centered])

  useEffect(() => {
    if (centered || !isHovered) {
      shaderRef.current.uniforms.dispFactor.value = 0.9
      gsap.to(shaderRef.current.uniforms.dispFactor, { value: 0.0, duration: 0.9, ease: 'power2.out' })
    }
  }, [isHovered, centered])

  return (
    <Plane
      ref={meshRef}
      args={[planeSize.width, planeSize.height]}
      position={data.position}
      onClick={() => {
        setCentered(!centered)
      }}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}>
      <shaderMaterial ref={shaderRef} args={[shader]} side={THREE.DoubleSide} />
    </Plane>
  )
}
