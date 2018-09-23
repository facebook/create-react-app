import React from 'react';

import { md } from './../../utils/';
import { Preview } from './../';

export default md`
# Preview

## Variants

### Default

${(
  <Preview>
    {({ bgTheme }) => `Default preview with ${bgTheme} background color`}
  </Preview>
)}

### Different default background color

${(
  <Preview bgTheme="dark">
    {({ bgTheme }) => `Default preview with ${bgTheme} background color`}
  </Preview>
)}

### Disable colors in background color chooser

${(
  <Preview bgThemeExcludedColors={['accent']}>
    Accent background color is not available
  </Preview>
)}

### Disable background color chooser

${<Preview bgTheme="">Disabled background color chooser</Preview>}

### Disable code preview

${(
  <Preview hasCodePreview={false}>
    <div>this is component preview</div>
  </Preview>
)}

### Custom code in show code

${(
  <Preview code={<div>this is custom code preview of component</div>}>
    <div>this is component preview</div>
  </Preview>
)}

### Code JSX options

Library [react-element-to-jsx-string](https://github.com/algolia/react-element-to-jsx-string) is used to generate JSX in code example. To overide options of this library, use \`codeJSXOptions\`. This can be usefull to filter some props code preview. 

${(
  <Preview codeJSXOptions={{ filterProps: ['key'] }}>
    <div key={"key won't show at code example"}>
      This component has key, but code example hides it
    </div>
  </Preview>
)}

### Preview HTML string

${<Preview html="<div class='html'>preview of html string</div>" />}
`;
