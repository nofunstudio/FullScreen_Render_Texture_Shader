import { useTexture, useVideoTexture, Plane, Text3D, Center } from '@react-three/drei'
import { useMemo, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { vertexShader, fragmentShader } from './PlaneShader'
import { useScoreStore } from './ScoreStore'

export const Planes = ({ centered, setCentered, ...props }) => {
  const { size, mouse, set } = useThree() // access viewport size
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
      x: Math.min(Math.floor((size.width - gap.x) / (gap.x + textureAspect)), 3),
      y: Math.min(Math.floor((size.height - gap.y) / gap.y), 3),
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
    // If a previous animation is still running, kill it.
    if (window.tl) {
      window.tl.kill()
    }

    // Create a new timeline.
    window.tl = gsap.timeline({ repeat: -1 })

    if (centered) {
      let rotationDuration = 12
      let scaleDuration = 0.5
      let scaleDelay = rotationDuration * 0.3 // Changed from 0.25 to 0.3 to delay the start of the scaling to 30% of the rotation

      window.tl.to(scaleRef.current.rotation, {
        y: Math.PI * -2,
        duration: rotationDuration,
        ease: 'power2.inOut',
      })

      window.tl.to(
        scaleRef.current.scale,
        {
          x: 0.1,
          y: 0.1,
          z: 0.35,
          duration: scaleDuration,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: 1,
        },
        scaleDelay,
      )

      window.tl.set(
        scaleRef.current.scale,
        {
          x: 0.1,
          y: 0.1,
          z: 0.2,
        },
        scaleDelay + scaleDuration * 2,
      )
    } else {
      // Before starting a new animation, kill any ongoing animations.
      gsap.killTweensOf(scaleRef.current.rotation)

      gsap.to(scaleRef.current.rotation, {
        y: 0,
        duration: 0.2,
        ease: 'power2.inOut',
      })
    }

    // Clear the timeline when the component unmounts.
    return () => {
      window.tl.kill()
      window.tl = null
    }
  }, [centered])

  return (
    <>
      <group ref={scaleRef} scale={[0.1, 0.1, 0.2]} position={[0, 0, 15]}>
        <group position={[0, 0, 0 - 20]}>
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
    </>
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
  const { controller, setController, blueprint, setBlueprint, isMobileDevice } = useScoreStore()

  //const aspectRatio = new THREE.Vector2(size.width, size.height)
  const aspectRatio = 16 / 9
  const shaderRef = useRef()
  const [quad, setQuad] = useState(1)
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
  const SCALE_DURATION = 1.2
  const DISPFACTOR_HOVERED = 0.5
  const DISPFACTOR_NOT_HOVERED = 0.9
  const DISPFACTOR_DURATION_HOVERED = 0.9
  const DISPFACTOR_DURATION_NOT_HOVERED = 0.5

  useEffect(() => {
    const anim = gsap.fromTo(
      meshRef.current.position,
      {
        x: centered ? initialPos.current.x : 0,
        y: centered ? initialPos.current.y : 0,
        z: centered ? initialPos.current.z : zIndex,
        duration: centered ? SCALE_DURATION : SCALE_DURATION,
        onComplete: () => {
          shaderRef.current.uniforms.u_texture.value = textures[controller - 1]
        },
      },
      {
        x: centered ? 0 : initialPos.current.x,
        y: centered ? 0 : initialPos.current.y,
        z: centered ? zIndex : initialPos.current.z,
        duration: centered ? SCALE_DURATION : SCALE_DURATION,
        ease: centered ? 'power2.out' : 'elastic.out(.8, .6)',
        onComplete: () => {
          shaderRef.current.uniforms.u_texture.value = textures[controller - 1]
        },
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
    gsap.to(shaderRef.current.uniforms.u_time, { value: 1.0, duration: 2.0 })
    return () => {
      anim2.kill()
    }
  }, [isHovered])
  //quadrant hover function fights with nav because of mouse position
  // useFrame(() => {
  //   if (!centered) {
  //     if (mouse.x < 0) {
  //       if (mouse.y < 0 && quad !== 1) {
  //         //1 top right
  //         setQuad(1)
  //         setController(1)
  //       } else if (mouse.y > 0 && quad !== 3) {
  //         // 3 bottom left
  //         setQuad(3)
  //         setController(3)
  //       }
  //     } else {
  //       if (mouse.y < 0 && quad !== 2) {
  //         //2 top left
  //         setQuad(2)
  //         setController(2)
  //       } else if (mouse.y > 0 && quad !== 4) {
  //         // 4 bottom right
  //         setQuad(4)
  //         setController(4)
  //       }
  //     }
  //   }
  // })

  useEffect(() => {
    shaderRef.current.uniforms.u_texture.value = textures[controller - 1]

    gsap.fromTo(
      shaderRef.current.uniforms.dispFactor,
      {
        value: 1.5,
        duration: 1.9,
        ease: 'power2.out',
      },
      {
        value: 0.0,
        duration: 1.5,
        ease: 'power2.out',
      },
    )
  }, [quad])

  useEffect(() => {
    if (controller !== quad) {
      setQuad(controller)
      setController(controller)
      if (centered) {
        setCentered(!centered)
        setTimeout(() => {
          setCentered(centered)
        }, 650)
      }
    }
  }, [controller])

  return (
    <>
      <Plane
        ref={meshRef}
        args={[planeSize.width, planeSize.height]}
        position={data.position}
        onClick={(e) => {
          e.stopPropagation()
          setCentered(!centered)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()

          if (!centered) {
            document.body.className = 'zoomed'
            document.body.classList.add('zoomed')
            setIsHovered(true)
          } else {
            document.body.className = 'zoomedOut'
            document.body.classList.add('zoomedOut')
          }
        }}
        onPointerOut={(e) => {
          document.body.className = ''
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
