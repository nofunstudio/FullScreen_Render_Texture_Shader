import { useRef, useState, useEffect } from 'react'
import './nav.css'
import { useScoreStore } from './ScoreStore'
export default function Nav() {
  const button1 = useRef()
  const button2 = useRef()
  const button3 = useRef()
  const button4 = useRef()

  const [active, setActive] = useState(1)
  const { controller, setController, blueprint, setBlueprint, isMobileDevice } = useScoreStore()

  useEffect(() => {
    if (controller === 1) {
      setActive(1)
    } else if (controller === 2) {
      setActive(2)
    } else if (controller === 3) {
      setActive(3)
    } else if (controller === 4) {
      setActive(4)
    }
  }, [controller])

  return (
    <>
      <div className={window.innerWidth < 499 ? 'mobileContainer' : 'mobileContainer hidden'}>
        <img src="../mobile.jpg" loading="lazy" alt="" className={window.innerWidth < 499 ? 'mobileImage' : 'mobileImage hidden'}></img>
      </div>
      <img src="../joyblaster_type.svg" loading="lazy" alt="" className={active === 2 ? 'svg' : 'svg hidden'}></img>
      <img src="../megadome_type.svg" loading="lazy" alt="" className={active === 3 ? 'svg' : 'svg hidden'}></img>
      <img src="../powerbase_type.svg" loading="lazy" alt="" className={active === 4 ? 'svg' : 'svg hidden'}></img>
      <img src="../cyberpad_type.svg" loading="lazy" alt="" className={active === 1 ? 'svg' : 'svg hidden'}></img>
      <div className="navcenter">
        <div className="navcenterbuttoncontainer">
          <a
            className="centernavbuttoncontroller w-inline-block"
            onPointerDown={() => {
              setController(3)
            }}>
            <img
              src="../MegadomeTurboBtn.png"
              loading="lazy"
              alt=""
              className={active === 3 ? 'controllericon' : 'controllericon inactive'}
            />
          </a>
          <a
            className="centernavbuttoncontroller w-inline-block"
            onPointerDown={() => {
              setController(4)
            }}>
            <img
              src="../PowerBaseUltraBtn.png"
              loading="lazy"
              alt=""
              className={active === 4 ? 'controllericon' : 'controllericon inactive'}
            />
          </a>
          <a
            className="centernavbuttoncontroller w-inline-block"
            onPointerDown={() => {
              setController(2)
            }}>
            <img
              src="../Joyblaster3000Btn.png"
              loading="lazy"
              alt=""
              className={active === 2 ? 'controllericon' : 'controllericon inactive'}
            />
          </a>
          <a
            className="centernavbuttoncontroller w-inline-block"
            onPointerDown={() => {
              setController(1)
            }}>
            <img
              src="../CyberPadXtremeBtn.png"
              loading="lazy"
              alt=""
              className={active === 1 ? 'controllericon' : 'controllericon inactive'}
            />
          </a>
        </div>
        <div className="roadmaptab" onClick={() => window.open('https://roadmapscroll.webflow.io/', '_blank')}>
          <img src="../roadmap.svg" loading="lazy" alt="" />
        </div>
      </div>
    </>
  )
}
