import React from 'react';
import styleguide from './lib/styleguide';
import pkg from '../package.json';

const Page = React.lazy(() => import('./components/Page'));

const AppDocs = React.lazy(() => import('./components/App/App.docs.mdx'));

const PreviewDocs = React.lazy(() =>
  import('./components/Preview/Preview.docs.mdx')
);
const ComponentDocsDocs = React.lazy(() =>
  import('./components/ComponentDocs/ComponentDocs.docs.mdx')
);
const CodeDocs = React.lazy(() => import('./components/Code/Code.docs.mdx'));
const ColorPaletteDocs = React.lazy(() =>
  import('./components/ColorPalette/ColorPalette.docs.mdx')
);
const ComponentInfoDocs = React.lazy(() =>
  import('./components/ComponentInfo/ComponentInfo.docs.mdx')
);
const BadgeDocs = React.lazy(() => import('./components/Badge/Badge.docs.mdx'));
const NoteDocs = React.lazy(() => import('./components/Note/Note.docs.mdx'));
const TableDocs = React.lazy(() => import('./components/Table/Table.docs.mdx'));
const PageDocs = React.lazy(() => import('./components/Page/Page.docs.mdx'));
const TypographyDocs = React.lazy(() =>
  import('./components/Typography/Typography.docs.mdx')
);

const ContributingGuidelines = React.lazy(() =>
  import('./pages/ContributingGuidelines.mdx')
);
const MaintainingCRAFork = React.lazy(() =>
  import('./pages/Maintining-CRA-fork.mdx')
);

const Hello = React.lazy(() => import('./pages/Hello.mdx'));

styleguide({
  config: {
    version: pkg.version,
    name: 'Lighter',
    styleguideBasePath: '/',
    logo: <img src="/logo/logo.svg" alt="Lighter" />,
    logoSmall: <img src="/logo/logo-small.svg" alt="Lighter" />,
  },
  routes: [
    {
      title: 'Hello',
      path: '/',
      render: <Page render={<Hello />} />,
    },
    {
      title: 'Components',
      path: '/components',
      nodes: [
        {
          title: 'App',
          path: '/app',
          render: <Page render={<AppDocs />} />,
        },
        {
          title: 'Badge',
          path: '/badge',
          render: <Page render={<BadgeDocs />} />,
        },
        {
          title: 'Code',
          path: '/code',
          render: <Page render={<CodeDocs />} />,
        },
        {
          title: 'ColorPalette',
          path: '/color-palette',
          render: <Page render={<ColorPaletteDocs />} />,
        },
        {
          title: 'ComponentDocs',
          path: '/component-docs',
          render: <Page render={<ComponentDocsDocs />} />,
        },
        {
          title: 'ComponentInfo',
          path: '/component-info',
          render: <Page render={<ComponentInfoDocs />} />,
        },
        {
          title: 'Note',
          path: '/note',
          render: <Page render={<NoteDocs />} />,
        },
        {
          title: 'Page',
          path: '/page',
          render: <Page render={<PageDocs />} />,
        },
        {
          title: 'Preview',
          path: '/preview',
          render: <Page render={<PreviewDocs />} />,
        },
        {
          title: 'Table',
          path: '/table',
          render: <Page render={<TableDocs />} />,
        },
        {
          title: 'Typography',
          path: '/typography',
          render: <Page render={<TypographyDocs />} />,
        },
      ],
    },
    {
      title: 'Guides',
      path: '/guides',
      nodes: [
        {
          title: 'Contributing guidelines',
          path: '/contributing-guidelines',
          render: <Page render={<ContributingGuidelines />} />,
        },
        {
          title: 'Maintaining CRA fork',
          path: '/maintaining-CRA-fork',
          render: <Page render={<MaintainingCRAFork />} />,
        },
      ],
    },
  ],
});
