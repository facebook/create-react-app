import Auth from './app';

(window.app = window.app || []).push([
  Auth,
  {
    regions: ['auth'],
  },
]);
