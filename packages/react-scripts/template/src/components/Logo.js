import React from 'react'
import { css } from '@emotion/core'
import logo from './Logo.svg'

const styles = css`
  animation: spin infinite 20s linear;
  height: 40vmin;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const Logo = () => <img src={logo} css={styles} alt="logo" />

export default Logo
