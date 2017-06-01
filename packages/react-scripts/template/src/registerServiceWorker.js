// In production, we register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the "N+1" visit to a page, since previously
// cached resources are updated in the background.

// To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// This link also includes instructions on opting out of this behavior.

export default function register() {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // this would become service-work-hash.js
      const swUrl = `${process.env.PUBLIC_URL}/service-worker-${process.env.PACKAGE_NAME}.js`;
      if (!navigator.serviceWorker.controller) {
        // No service worker yet
        registerServiceWorker(swUrl);
      } else {
        fetch(swUrl).then(res => {
          // Check to see if the SW URL is valid
          if (res.ok) {
            // Matches. All good. Continue with registering SW
            registerServiceWorker(swUrl);
          } else {
            // SW URL was invalid.
            fetch(
              `${window.location.protocol}//${window.location.host}`
            ).then(res2 => {
              // Just check if online
              if (res2.ok) {
                // Unregister and refresh page
                unregister();
                window.location.reload(true);
              } else {
                console.log('Offline. Using cached copy');
              }
            });
          }
        });
      }
    });
  }
}

function registerServiceWorker(url) {
  navigator.serviceWorker
    .register(url)
    .then(registration => {
      console.log('reg.scope', registration.scope);
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the old content will have been purged and
              // the fresh content will have been added to the cache.
              // It's the perfect time to display a "New content is
              // available; please refresh." message in your web app.
              console.log('New content is available; please refresh.');
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    })
    .catch(error => {
      console.log('No service worker found');
      console.error('Error during service worker registration:', error);
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
