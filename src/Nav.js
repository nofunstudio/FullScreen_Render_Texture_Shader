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
    <div className="navcenter">
      <div className="navcenterbuttoncontainer">
        <a
          href="#"
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
          href="#"
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
          href="#"
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
          href="#"
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
    </div>
  )
}
