import React from 'react'
import PropTypes from 'prop-types'
import { css } from '@emotion/core'
import logo from './Logo.svg'

const logoCss = (color, animationDuration) => css`
  animation: spin infinite ${animationDuration}s linear;
  height: 36vmin;
  max-height: 280px;
  margin: 10px;

  svg {
    width: 100%;
    height: 100%;
    fill: ${color};
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`
const Logo = ({ color = 'black', animationDuration = 20 }) => {
  const [svgContent, setSvgContent] = React.useState()

  React.useEffect(() => {
    fetch(logo).then(response => {
      response.text().then(content => setSvgContent(content))
    })
  })

  return (
    <div
      css={logoCss(color, animationDuration)}
      astyle={{ fill: 'blue' }}
      /* eslint-disable-next-line react/no-danger */
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

Logo.propTypes = {
  /** Used to set the color of the logo. */
  color: PropTypes.string,
  /** Used to set the duration of animation of the logo. */
  animationDuration: PropTypes.number,
}
export default React.memo(Logo)
