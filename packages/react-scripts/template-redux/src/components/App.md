For help getting styleguidist to work with redux, read the docs [ there ](https://github.com/styleguidist/react-styleguidist/blob/master/docs/Thirdparties.md#working-with-third-party-libraries)

App Example

```jsx
// In order to make styleguidist work with redux, we need to setup the
// store here for App, cause it uses ExampleTimestamp

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from '../reducers';

const startState = {
  example: {
    timestamp: Date.now(),
  },
};
const store = createStore(rootReducer, startState);

<Provider store={store}>
  <App />
</Provider>;
```
