import React from 'react';
import styleguide from './styleguide';

import Page from './components/Page';

import KichenSink from './pages/KitchenSink';

styleguide({
  config: {
    version: 'lighter-styleguide',
    name: 'Lighter',
    styleguideBasePath: '/'
  },
  routes: [
    {
      title: 'Kitchen Sink',
      path: '/',
      render: <Page render={KichenSink} />
    }
  ]
});
