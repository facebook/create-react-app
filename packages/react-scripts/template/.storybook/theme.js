import { create } from '@storybook/theming'
import packageJson from '../package.json'

export default create({
  base: 'light',

  colorPrimary: '#27C4F4',
  colorSecondary: '#87B940',

  // UI
  // appBg: 'white',
  // appContentBg: 'white',
  // appBorderColor: 'grey',
  // appBorderRadius: 4,

  // Typography
  fontBase: 'verdana, sans-serif',
  fontCode: 'monospace',

  // Text colors
  // textColor: 'black',
  // textInverseColor: 'rgba(255,255,255,0.9)',

  // Toolbar default and active colors
  // barTextColor: 'silver',
  // barSelectedColor: 'black',
  // barBg: 'hotpink',

  // Form colors
  // inputBg: 'white',
  // inputBorder: 'silver',
  // inputTextColor: 'black',
  // inputBorderRadius: 4,

  brandTitle: packageJson.name,
  brandImage: null,
  // brandImage: 'https://edge.fscdn.org/assets/components/hf/assets/img/logos/tree-logotype-2x-750ccbd315132e50d07ad40c8e639a34.png',
})
