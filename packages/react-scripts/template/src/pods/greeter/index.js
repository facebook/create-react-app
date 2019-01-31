import Greeter from './app';

(window.app = window.app || []).push([
  Greeter,
  {
    regions: ['greeter'],
  },
]);
