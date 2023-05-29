import { create } from 'zustand'

const isMobile = () => {
  const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}

export const useScoreStore = create((set) => ({
  controller: 1,
  setController: (controller) => set({ controller }),
  blueprint: false,
  setBlueprint: (blueprint) => set({ blueprint }),
  isMobileDevice: isMobile(),
}))
