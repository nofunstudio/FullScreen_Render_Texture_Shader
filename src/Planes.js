import { useTexture, useVideoTexture, Plane } from '@react-three/drei'
import { useMemo, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { vertexShader, fragmentShader } from './PlaneShader'

export const Planes = () => {
  const [centered, setCentered] = useState(false)
  const { size, mouse } = useThree() // access viewport size
  const urls = ['Cyberpad_x.mp4', 'JoyBlaster_3000.mp4', 'Megadome.mp4', 'Powerbase_Ultra.mp4']
  const textures = urls.map((url) => useVideoTexture(url))
  const noiseTexture = useTexture('noise.jpg')
  const videoHeight = textures[0].video?.videoHeight
  const videoWidth = textures[0].video?.videoWidth
  const textureAspect = textures[0].video ? videoWidth / videoHeight : 1
  const scaleRef = useRef()

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
    const textureAspect = textures[0].video ? videoWidth / videoHeight : 1
    const aspect = (maxAmount.x * planeSize.width) / (maxAmount.y * planeSize.height)
    const ratio = aspect / textureAspect
    const [x, y] = aspect < textureAspect ? [ratio, 1] : [1, 1 / ratio]
    return new THREE.Vector2(x, y)
  }, [maxAmount, planeSize, textureAspect, videoHeight, videoWidth])

  useEffect(() => {
    if (centered) {
      let tl = gsap.timeline({ repeat: -1 })
      let rotationDuration = 12
      let scaleDuration = 0.5
      let scaleDelay = rotationDuration * 0.3 // Changed from 0.25 to 0.3 to delay the start of the scaling to 30% of the rotation

      tl.to(scaleRef.current.rotation, {
        y: Math.PI * -2,
        duration: rotationDuration,
        ease: 'power2.inOut',
      })

      tl.to(
        scaleRef.current.scale,
        {
          x: 0.1,
          y: 0.1,
          z: 0.25,
          duration: scaleDuration,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: 1,
        },
        scaleDelay,
      )

      tl.set(
        scaleRef.current.scale,
        {
          x: 0.1,
          y: 0.1,
          z: 0.1,
        },
        scaleDelay + scaleDuration * 2,
      )
    }
  }, [centered])
  return (
    <group ref={scaleRef} scale={[0.1, 0.1, 0.1]}>
      <group position={[0, 0, 0.2]}>
        {datas.map((data, i) => (
          <FragmentPlane
            key={i}
            maxAmount={new THREE.Vector2(maxAmount.x, maxAmount.y)}
            planeSize={planeSize}
            zIndex={i * 10}
            textures={textures}
            noiseTexture={noiseTexture}
            uvScale={uvScale}
            data={data}
            centered={centered}
            setCentered={setCentered}
            mouse={mouse}
            size={size}
          />
        ))}
      </group>
    </group>
  )
}

const FragmentPlane = ({
  noiseTexture,
  size,
  zIndex,
  maxAmount,
  planeSize,
  uvScale,
  textures,
  data,
  centered,
  setCentered,
  mouse,
  ...props
}) => {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const initialPos = useRef(data.position)

  //const aspectRatio = new THREE.Vector2(size.width, size.height)
  const aspectRatio = 16 / 9
  const shaderRef = useRef()
  const [quad, setQuad] = useState(1)
  const [quadStore, setQuadStore] = useState(1)
  const shader = {
    uniforms: {
      dispFactor: { value: 0 },
      u_time: { value: 0 },
      u_transitionShader: { value: centered ? 0 : 1 },
      mixFactor: { value: 0 },
      u_amounts: { value: maxAmount },
      disp: { value: noiseTexture },
      u_texture: { value: textures[0] },
      u_uvScale: { value: uvScale },
      u_absoluteUv: { value: data.uv },
      u_aspectRatio: { value: aspectRatio }, // Pass the aspect ratio as a uniform
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  }
  const SCALE_DURATION = 0.9
  const DISPFACTOR_HOVERED = 0.5
  const DISPFACTOR_NOT_HOVERED = 0.9
  const DISPFACTOR_DURATION_HOVERED = 0.9
  const DISPFACTOR_DURATION_NOT_HOVERED = 0.5
  // useState called Quad

  useEffect(() => {
    shaderRef.current.uniforms.u_texture.value = textures[quad - 1]
    const anim = gsap.fromTo(
      meshRef.current.position,
      {
        x: centered ? initialPos.current.x : 0,
        y: centered ? initialPos.current.y : 0,
        z: centered ? initialPos.current.z : zIndex,
        duration: SCALE_DURATION,
      },
      {
        x: centered ? 0 : initialPos.current.x,
        y: centered ? 0 : initialPos.current.y,
        z: centered ? zIndex : initialPos.current.z,
        duration: SCALE_DURATION,
        onComplete: () => {},
      },
    )

    return () => {
      anim.kill()
    }
  }, [centered, setCentered])

  useEffect(() => {
    const anim2 = gsap.fromTo(
      shaderRef.current.uniforms.dispFactor,
      {
        value: isHovered ? 0 : 0.5,
        duration: SCALE_DURATION,
        onComplete: () => {
          shaderRef.current.uniforms.u_texture.value = textures[quad - 1]
        },
      },
      {
        value: isHovered ? 0.5 : 0,
        duration: SCALE_DURATION,
      },
    )
    gsap.to(shaderRef.current.uniforms.u_time, { value: 1.0, duration: 3.0 })
    return () => {
      anim2.kill()
    }
  }, [isHovered])

  useFrame(() => {
    if (!centered) {
      if (mouse.x < 0) {
        if (mouse.y < 0) {
          //1 top right
          setQuad(1)
        } else {
          // 3 bottom left
          setQuad(3)
        }
      } else {
        if (mouse.y < 0) {
          //2 top left
          setQuad(2)
        } else {
          // 4 bottom right
          setQuad(4)
        }
      }
    }
  }, [mouse])

  useEffect(() => {
    //console.log(quad)
    if (!centered) {
      gsap.fromTo(
        shaderRef.current.uniforms.dispFactor,
        {
          value: 1.5,
          duration: 1.9,
          ease: 'power2.out',
          onProgress: () => {
            shaderRef.current.uniforms.u_texture.value = textures[quad - 1]
          },
        },
        {
          value: 0.0,
          duration: 1.5,
          ease: 'power2.out',
        },
      )
    }
  }, [quad])

  return (
    <>
      <Plane
        ref={meshRef}
        args={[planeSize.width, planeSize.height]}
        position={data.position}
        onClick={(e) => {
          e.stopPropagation()
          setQuadStore(quad)
          setCentered(!centered)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (!centered) {
            setIsHovered(true)
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          if (!centered) {
            setIsHovered(false)
          }
        }}>
        <shaderMaterial ref={shaderRef} args={[shader]} side={THREE.DoubleSide} />
      </Plane>
    </>
  )
}
