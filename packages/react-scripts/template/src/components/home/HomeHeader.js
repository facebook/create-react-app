import React from 'react'
import { css } from '@emotion/core'

const styles = css`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`

const HomeHeader = ({ children }) => <header css={styles}>{children}</header>

export default HomeHeader
