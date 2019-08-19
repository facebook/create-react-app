/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const siteConfig = {
  title: 'Create React App', // Title for your website.
  tagline: 'Set up a modern web app by running one command.',
  // For github.io type URLs, you would set the url and baseUrl like:
  url: 'https://create-react-app.dev',
  baseUrl: '/',
  cname: 'create-react-app.dev',
  editUrl:
    'https://github.com/facebook/create-react-app/edit/master/docusaurus/docs/',

  // Used for publishing and more
  projectName: 'create-react-app',
  organizationName: 'facebook',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'getting-started', label: 'Docs' },
    { href: 'https://reactjs.org/community/support.html', label: 'Help' },
    {
      href: 'https://www.github.com/facebook/create-react-app',
      label: 'GitHub',
    },
  ],

  /* path to images for header/footer */
  headerIcon: 'img/logo.svg',
  footerIcon: 'img/logo.svg',
  favicon: 'img/favicon/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#20232a',
    secondaryColor: '#61dafb',
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Facebook Inc.`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/logo-og.png',
  twitterImage: 'img/logo-og.png',

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/facebook/create-react-app',

  algolia: {
    apiKey: '3be60f4f8ffc24c75da84857d6323791',
    indexName: 'create-react-app',
  },

  scrollToTop: true,
  enableUpdateTime: true,
  enableUpdateBy: true,
  docsSideNavCollapsible: true,
};

module.exports = siteConfig;
