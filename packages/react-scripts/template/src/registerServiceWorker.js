// In production, we register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the "N+1" visit to a page, since previously
// cached resources are updated in the background.

// To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// This link also includes instructions on opting out of this behavior.

export default function register() {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // Hide document while we decide if this is the correct service worker
    const bodyStyle = document.body.style.display;
    document.body.style.display = 'none';

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/${process.env.SERVICE_WORKER_NAME}`;

      // This is used to check validaity of service worker. And reload page if changed had been made.
      fetch(swUrl)
        .then(response => {
          // Ensure service worker exists, and that we really are getting a JS file.
          if (
            response.status === 404 ||
            response.headers.get('content-type').indexOf('javascript') === -1
          ) {
            navigator.serviceWorker.ready.then(registration => {
              registration.unregister().then(() => {
                window.location.reload();
              });
            });
          } else {
            // Found original service worker.
            document.body.style.display = bodyStyle;
            registerValidSW(swUrl);
          }
        })
        .catch(() => {
          document.body.style.display = bodyStyle;
          console.log(
            'No internet connection found. App is running in offline mode.'
          );
        });
    });
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
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
