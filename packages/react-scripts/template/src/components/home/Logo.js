import React from 'react'
import { css } from '@emotion/core'
import { i18n } from '@fs/zion-locale'
import logo from './Logo.svg'

const styles = css`
  animation: spin infinite 20s linear;
  height: 30vmin;
  margin: 10px;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const Logo = () => <img src={logo} css={styles} alt={i18n.t('logo', 'Spinning Frontier Logo')} />

export default Logo
