import React from 'react'
import aFileWithExtUnknown from './assets/aFileWithExt.unknown'

const text = aFileWithExtUnknown.includes('base64')
  ? atob(aFileWithExtUnknown.split('base64,')[1]).trim()
  : aFileWithExtUnknown

export default () => (
  <p id="feature-unknown-ext-inclusion">{text}.</p>
)
