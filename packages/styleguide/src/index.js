import React from 'react';
import styleguide from './styleguide';

import Page from './components/Page';

import KitchenSink from './pages/KitchenSink';
import PreviewDocs from './components/Preview/Preview.docs';

import HelloMdx from './pages/Hello.mdx';
import KitchenSinkMdx from './pages/KitchenSink.mdx';
import PreviewMdx from './components/Preview/Preview.docs.mdx';

styleguide({
  config: {
    version: 'lighter-styleguide',
    name: 'Lighter',
    styleguideBasePath: '/'
  },
  routes: [
    {
      title: 'Hello Mdx',
      path: '/',
      render: <Page render={HelloMdx} />
    },
    {
      title: 'Kitchen Sink',
      path: '/Kitchen Sink',
      render: <Page render={KitchenSink} />
    },
    {
      title: 'Kitchen Sink Mdx',
      path: '/kitchen-mdx',
      render: <Page render={KitchenSinkMdx} />
    },
    {
      title: 'Components',
      path: '/components',
      nodes: [
        {
          title: 'Preview',
          path: '/preview',
          render: <Page render={PreviewDocs} />
        },
        {
          title: 'Preview Mdx',
          path: '/preview-mdx',
          render: <Page render={PreviewMdx} />
        }
      ]
    }
  ]
});
