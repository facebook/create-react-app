import React from 'react';
import styleguide from './styleguide';
import pkg from '../package.json';

import Page from './components/Page';

import Hello from './pages/Hello.mdx';
import PreviewDocs from './components/Preview/Preview.docs.mdx';
import ComponentDocsDocs from './components/ComponentDocs/ComponentDocs.docs.mdx';
import CodeDocs from './components/Code/Code.docs.mdx';
import ColorPaletteDocs from './components/ColorPalette/ColorPalette.docs.mdx';
import ComponentInfoDocs from './components/ComponentInfo/ComponentInfo.docs.mdx';
import BadgeDocs from './components/Badge/Badge.docs.mdx';
import NoteDocs from './components/Note/Note.docs.mdx';
import TableDocs from './components/Table/Table.docs.mdx';
import PageDocs from './components/Page/Page.docs.mdx';
import TypographyDocs from './components/Typography/Typography.docs.mdx';

styleguide({
  config: {
    version: pkg.version,
    name: 'Lighter',
    styleguideBasePath: '/',
    logo: <img src="/logo/logo.svg" alt="Lighter" />,
    logoSmall: <img src="/logo/logo-small.svg" alt="Lighter" />
  },
  routes: [
    {
      title: 'Hello',
      path: '/',
      render: <Page render={Hello} />
    },
    {
      title: 'Components',
      path: '/components',
      nodes: [
        {
          title: 'Badge',
          path: '/badge',
          render: <Page render={BadgeDocs} />
        },
        {
          title: 'Code',
          path: '/code',
          render: <Page render={CodeDocs} />
        },
        {
          title: 'ColorPalette',
          path: '/color-palette',
          render: <Page render={ColorPaletteDocs} />
        },
        {
          title: 'ComponentDocs',
          path: '/component-docs',
          render: <Page render={ComponentDocsDocs} />
        },
        {
          title: 'ComponentInfo',
          path: '/component-info',
          render: <Page render={ComponentInfoDocs} />
        },
        {
          title: 'Note',
          path: '/note',
          render: <Page render={NoteDocs} />
        },
        {
          title: 'Page',
          path: '/page',
          render: <Page render={PageDocs} />
        },
        {
          title: 'Preview',
          path: '/preview',
          render: <Page render={PreviewDocs} />
        },
        {
          title: 'Table',
          path: '/table',
          render: <Page render={TableDocs} />
        },
        {
          title: 'Typography',
          path: '/typography',
          render: <Page render={TypographyDocs} />
        }
      ]
    }
  ]
});
