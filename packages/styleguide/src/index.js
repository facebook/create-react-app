import React from 'react';
import styleguide from './styleguide';

import Page from './components/Page';

import KichenSink from './pages/KitchenSink';
import PreviewDocs from './components/Preview/Preview.docs';

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
    },
    {
      title: 'Components',
      path: '/components',
      nodes: [
        {
          title: 'Preview',
          path: '/preview',
          render: <Page render={PreviewDocs} />
        }
      ]
    }
  ]
});
