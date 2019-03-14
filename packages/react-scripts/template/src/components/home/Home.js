import React from 'react'
import { css } from '@emotion/core'

import Logo from './Logo'
import HomeHeader from './HomeHeader'

const Home = () => (
  <div
    css={css`
      text-align: center;
    `}
  >
    <HomeHeader>
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
    </HomeHeader>
  </div>
)

export default Home
