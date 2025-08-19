/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react"

const initialState= {
  theme: "system",
  setTheme: () => null,
  colorTheme: "orange",
  setColorTheme: () => null,
}

const ThemeProviderContext = createContext(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorTheme = "orange",
  storageKey = "vite-ui-theme",
  colorStorageKey = "vite-ui-color-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => (localStorage.getItem(storageKey) ) || defaultTheme
  )
  const [colorTheme, setColorTheme] = useState(
    () => (localStorage.getItem(colorStorageKey) ) || defaultColorTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all color theme classes
    root.classList.remove("color-orange", "color-blue", "color-green", "color-purple", "color-red")
    
    // Add the current color theme class
    root.classList.add(`color-${colorTheme}`)
  }, [colorTheme])

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    colorTheme,
    setColorTheme: (colorTheme) => {
      localStorage.setItem(colorStorageKey, colorTheme)
      setColorTheme(colorTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}