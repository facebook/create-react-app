import apps from './app';

apps.map(App =>
  (window.app = window.app || []).push([
    App,
    {
      regions: [App.frintAppName.toLowerCase()],
      weight: 5,
    },
  ])
);
