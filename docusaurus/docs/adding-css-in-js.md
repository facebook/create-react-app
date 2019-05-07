---
id: adding-css-in-js
title: Adding CSS in JS
sidebar_label: Adding CSS in JS
---

> Note: this feature is an **optional feature** available with `react-scripts@3.1.0` and higher. Regular `<link>` stylesheets and CSS files are fully supported.

This project supports zero-runtime CSS in JSX via [Linaria](https://linaria.now.sh/), complete with dynamic properties, source maps and linting support.

## [Setup](https://github.com/callstack/linaria#setup)

Add the `linaria/babel` [preset](https://babeljs.io/docs/en/presets) to `package.json`:

```json
"babel": {
  "presets": [
    "react-app",
    "linaria/babel"
  ]
}
```

The [webpack configuration](https://github.com/callstack/linaria/blob/master/docs/BUNDLERS_INTEGRATION.md#webpack) is already provided for you.

## Writing CSS

Import the `styled` helper from `linaria/react` to write a React component with dynamic styles.

### `App.jsx`

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { styled } from 'linaria/react';

const App = styled.div`
  background-color: ${props => (props.theme === 'dark') ? 'black' : 'white'};
`;

const App = props => (
  <div theme={props.theme}>
    {props.children}
  </div>
)

App.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']),
};

export default App
```

### `App.tsx`

```tsx
import React from 'react';
import { styled } from 'linaria/react';

interface AppProps {
  theme: 'light' | 'dark'
}

const App = styled.button<AppProps>`
  background-color: ${props => (props.theme === 'dark') ? 'black' : 'white'};
`;

const App: React.FC<AppProps> = props => (
  <div theme={props.theme}>
    {props.children}
  </div>
)

export default App
```

See [Linaria documentation](https://github.com/callstack/linaria#documentation) for more information.
