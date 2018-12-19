import React from 'react';
import styleguide from './styleguide';

import Page from './components/Page';

import Hello from './pages/Hello.mdx';
import KitchenSink from './pages/KitchenSink.mdx';
import PreviewDocs from './components/Preview/Preview.docs.mdx';

styleguide({
  config: {
    version: 'lighter-styleguide',
    name: 'Lighter',
    styleguideBasePath: '/'
  },
  routes: [
    {
      title: 'Hello',
      path: '/',
      render: <Page render={Hello} />
    },
    {
      title: 'Kitchen Sink',
      path: '/Kitchen Sink',
      render: <Page render={KitchenSink} />
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
