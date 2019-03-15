import React from 'react'
import { css } from '@emotion/core'
import { Trans } from 'react-i18next'

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
          <Trans i18nkey="update.instructions">Edit <code>src/components/App.js</code> and save to reload.</Trans>
        </p>
        <a
          css={css`
          color: #61dafb;
        `}
          href="https://www.familysearch.org/frontier/docs/#/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans i18nkey="learn.frontier">Learn Frontier</Trans>
        </a>
      </HomeHeader>
    </div>
  )

export default Home
