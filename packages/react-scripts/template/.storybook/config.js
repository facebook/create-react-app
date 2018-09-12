import { configure } from '@storybook/react'

// automatically import all files ending in *.stories.js
const req = require.context('../src/components', true, /.stories.js$/)
function loadStories() {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
