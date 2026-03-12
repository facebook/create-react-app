import React from 'react'
import { useDarkMode } from '../hooks/useDarkMode'

const Header: React.FC = () => {
  const { isDark, toggle } = useDarkMode()

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}
    >
      <button
        onClick={toggle}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '8px',
          border: '2px solid #61dafb',
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          color: isDark ? '#ffffff' : '#282c34',
          transition: 'all 0.3s ease'
        }}
        aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
      >
        {isDark ? '🌙 深色模式' : '☀️ 浅色模式'}
      </button>
    </div>
  )
}

export default Header
