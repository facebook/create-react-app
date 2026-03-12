import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

function getStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function getSystemTheme(): Theme {
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
}

export function useDarkMode() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    return getStoredTheme() ?? getSystemTheme()
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore storage errors
    }
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(MEDIA_QUERY)

    const handleChange = (event: MediaQueryListEvent) => {
      const storedTheme = getStoredTheme()

      if (!storedTheme) {
        setThemeState(event.matches ? 'dark' : 'light')
      }
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme)
  }

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme
  }
}

