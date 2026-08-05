// Local storage utilities
const PREFIX = 'quotepro_'

export const storage = {
  get: (key: string, defaultValue?: any) => {
    try {
      const item = localStorage.getItem(PREFIX + key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage set failed:', error)
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch (error) {
      console.error('Storage remove failed:', error)
    }
  },
  clear: () => {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Storage clear failed:', error)
    }
  },
}
