// @flow
import React from 'react'

type Props = {
  text: string,
}

export default (props: Props) => {
  return <button>{props.text}</button>
}
