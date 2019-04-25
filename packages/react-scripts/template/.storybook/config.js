import { configure, addParameters, addDecorator } from '@storybook/react'
import { addReadme } from 'storybook-readme'
import '@storybook/addon-console'
import StyleNormalize from '@fs/zion-style-normalize/'

addDecorator(addReadme)
addDecorator(storyFn => <StyleNormalize>{storyFn()}</StyleNormalize>)

String.prototype.injectInnerMarkdown = function(innerMarkdown) {
  return this.replace('<!-- INNER_MARKDOWN -->', innerMarkdown)
}

function loadStories() {
  const req = require.context('../src', true, /\.stories\.js$/)
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
