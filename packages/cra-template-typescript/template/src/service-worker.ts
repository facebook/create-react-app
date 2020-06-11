declare const self: ServiceWorkerGlobalScope;

import {clientsClaim} from 'workbox-core';
import {precacheAndRoute, createHandlerBoundToURL} from 'workbox-precaching';
import {registerRoute, NavigationRoute} from 'workbox-routing';

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

const handler = createHandlerBoundToURL('index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [
    // Exclude URLs starting with /_, as they're likely an API call
    new RegExp('^/_'),
    // Exclude any URLs whose last part seems to be a file extension
    // as they're likely a resource and not a SPA route.
    // URLs containing a "?" character won't be blacklisted as they're likely	            // URLs containing a "?" character won't be blacklisted as they're likely
    // a route with query params (e.g. auth callbacks).
    new RegExp('/[^/?]+\\.[^/]+$'),
  ],
});
registerRoute(navigationRoute);
