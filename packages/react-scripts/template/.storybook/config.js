/* eslint global-require: 0 */
import React from 'react'
import { css } from '@emotion/core'
import { configure, addParameters, addDecorator } from '@storybook/react'
import { addReadme } from 'storybook-readme'
import '@storybook/addon-console'
import { withA11y } from '@storybook/addon-a11y'
import { withKnobs } from '@storybook/addon-knobs'
import theme from './theme'
import StyleNormalize from '@fs/zion-style-normalize'
import { theme as zionTheme, ThemeProvider } from '@fs/zion-ui'
import { I18nProvider, i18n } from '@fs/zion-locale'

const baseCss = css`
  // Markdown inside of stories has no padding
  padding: 12px;
  .markdown-body p code {
    // Inline code snippets look like normal text
    background-color: #f0f0f0;
    padding: 4px 0;
  }
`

addDecorator(withKnobs)
addDecorator(withA11y)
addDecorator(addReadme)
addDecorator(storyFn => (
  <I18nProvider i18nInstance={i18n}>
    <ThemeProvider theme={zionTheme}>
      <StyleNormalize>
        <div css={baseCss}>{storyFn()}</div>
      </StyleNormalize>
    </ThemeProvider>
  </I18nProvider>
))

// eslint-disable-next-line no-extend-native
String.prototype.injectInnerMarkdown = function injectInnerMarkdown(innerMarkdown) {
  return this.replace('<!-- INNER_MARKDOWN -->', innerMarkdown)
}

addParameters({
  info: { disable: true },
  readme: { sidebar: '<!-- PROPS -->' },
  options: {
    showPanel: true,
    theme,
  },
})

function loadStories() {
  const req = require.context('../src', true, /\.stories\.js$/)
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
