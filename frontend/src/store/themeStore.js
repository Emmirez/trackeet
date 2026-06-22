import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((s) => {
        const next = !s.isDark
        document.documentElement.classList.toggle('dark', next)
        return { isDark: next }
      }),
      init: (isDark) => {
        document.documentElement.classList.toggle('dark', isDark)
      }
    }),
    { name: 'trackeet-theme' }
  )
)

export default useThemeStore
