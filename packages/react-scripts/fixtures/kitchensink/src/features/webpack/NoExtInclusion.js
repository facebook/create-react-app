import React from 'react'
import aFileWithoutExt from './assets/aFileWithoutExt'

const text = aFileWithoutExt.includes('base64')
  ? atob(aFileWithoutExt.split('base64,')[1]).trim()
  : aFileWithoutExt

export default () => (
  <p id="feature-no-ext-inclusion">{text}.</p>
)
