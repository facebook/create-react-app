import logo from '../logo.svg'
import { useDarkMode } from '../hooks/useDarkMode'

export function Header() {
  const { theme, toggleTheme } = useDarkMode()

  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />

      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>

      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>

      <button
        className="App-theme-toggle"
        type="button"
        onClick={toggleTheme}
      >
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    </header>
  )
}
