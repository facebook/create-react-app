// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://bit.ly/CRA-PWA

import * as ServiceWorkerRegister from 'register-service-worker';

export function register(config) {
  if (process.env.NODE_ENV === 'production') {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);

    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    ServiceWorkerRegister.register(
      `${process.env.PUBLIC_URL}/service-worker.js`,
      {
        ready() {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://bit.ly/CRA-PWA'
          );
        },
        cached(registration) {
          console.log('Content is cached for offline use.');
          if (config && config.onSuccess) {
            config.onSuccess(registration);
          }
        },
        updated(registration) {
          console.log(
            'New content is available and will be used when all ' +
              'tabs for this page are closed. See https://bit.ly/CRA-PWA.'
          );

          if (config && config.onUpdate) {
            config.onUpdate(registration);
          }
        },
        offline() {
          console.log(
            'No internet connection found. App is running in offline mode.'
          );
        },
        error(error) {
          console.error('Error during service worker registration:', error);
        },
      }
    );
  }
}
