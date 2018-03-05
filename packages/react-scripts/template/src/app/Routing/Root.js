import React from 'react';
import { Provider } from 'react-redux';

import Router from './Router';

export default function Root({ store }) {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
}
