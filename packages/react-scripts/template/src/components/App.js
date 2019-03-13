import React from 'react'
import { css } from '@emotion/core'

import Logo from './Logo'
import AppHeader from './AppHeader'

const App = () => (
  <div
    css={css`
      text-align: center;
    `}
  >
    <AppHeader>
      <Logo />
      <p>
        Edit <code>src/components/App.js</code> and save to reload.
      </p>
      <a
        css={css`
          color: #61dafb;
        `}
        href="https://www.familysearch.org/frontier/docs/#/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn Frontier
      </a>
    </AppHeader>
  </div>
)

export default App
