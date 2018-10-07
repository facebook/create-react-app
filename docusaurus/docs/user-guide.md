---
id: user-guide
title: User guide
sidebar_label: User guide
---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Below you will find some information on how to perform common tasks.<br>
You can find the most recent version of this guide [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Table of Contents

- [Integrating with an API Backend](#integrating-with-an-api-backend)
  - [Node](#node)
  - [Ruby on Rails](#ruby-on-rails)
- [Using HTTPS in Development](#using-https-in-development)
- [Generating Dynamic `<meta>` Tags on the Server](#generating-dynamic-meta-tags-on-the-server)
- [Pre-Rendering into Static HTML Files](#pre-rendering-into-static-html-files)
- [Injecting Data from the Server into the Page](#injecting-data-from-the-server-into-the-page)
- [Making a Progressive Web App](#making-a-progressive-web-app)
  - [Why Opt-in?](#why-opt-in)
  - [Offline-First Considerations](#offline-first-considerations)
  - [Progressive Web App Metadata](#progressive-web-app-metadata)
- [Advanced Configuration](#advanced-configuration)
- [Alternatives to Ejecting](#alternatives-to-ejecting)

## Integrating with an API Backend

These tutorials will help you to integrate your app with an API backend running on another port,
using `fetch()` to access it.

### Node

Check out [this tutorial](https://www.fullstackreact.com/articles/using-create-react-app-with-a-server/).
You can find the companion GitHub repository [here](https://github.com/fullstackreact/food-lookup-demo).

### Ruby on Rails

Check out [this tutorial](https://www.fullstackreact.com/articles/how-to-get-create-react-app-to-work-with-your-rails-api/).
You can find the companion GitHub repository [here](https://github.com/fullstackreact/food-lookup-demo-rails).

### API Platform (PHP and Symfony)

[API Platform](https://api-platform.com) is a framework designed to build API-driven projects.
It allows to create hypermedia and GraphQL APIs in minutes.
It is shipped with an official Progressive Web App generator as well as a dynamic administration interface, both built for Create React App.
Check out [this tutorial](https://api-platform.com/docs/distribution).

## Using HTTPS in Development

> Note: this feature is available with `react-scripts@0.4.0` and higher.

You may require the dev server to serve pages over HTTPS. One particular case where this could be useful is when using [the "proxy" feature](#proxying-api-requests-in-development) to proxy requests to an API server when that API server is itself serving HTTPS.

To do this, set the `HTTPS` environment variable to `true`, then start the dev server as usual with `npm start`:

#### Windows (cmd.exe)

```cmd
set HTTPS=true&&npm start
```

(Note: the lack of whitespace is intentional.)

#### Windows (Powershell)

```Powershell
($env:HTTPS = $true) -and (npm start)
```

#### Linux, macOS (Bash)

```bash
HTTPS=true npm start
```

Note that the server will use a self-signed certificate, so your web browser will almost definitely display a warning upon accessing the page.

## Generating Dynamic `<meta>` Tags on the Server

Since Create React App doesn’t support server rendering, you might be wondering how to make `<meta>` tags dynamic and reflect the current URL. To solve this, we recommend to add placeholders into the HTML, like this:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta property="og:title" content="__OG_TITLE__">
    <meta property="og:description" content="__OG_DESCRIPTION__">
```

Then, on the server, regardless of the backend you use, you can read `index.html` into memory and replace `__OG_TITLE__`, `__OG_DESCRIPTION__`, and any other placeholders with values depending on the current URL. Just make sure to sanitize and escape the interpolated values so that they are safe to embed into HTML!

If you use a Node server, you can even share the route matching logic between the client and the server. However duplicating it also works fine in simple cases.

## Pre-Rendering into Static HTML Files

If you’re hosting your `build` with a static hosting provider you can use [react-snapshot](https://www.npmjs.com/package/react-snapshot) or [react-snap](https://github.com/stereobooster/react-snap) to generate HTML pages for each route, or relative link, in your application. These pages will then seamlessly become active, or “hydrated”, when the JavaScript bundle has loaded.

There are also opportunities to use this outside of static hosting, to take the pressure off the server when generating and caching routes.

The primary benefit of pre-rendering is that you get the core content of each page _with_ the HTML payload—regardless of whether or not your JavaScript bundle successfully downloads. It also increases the likelihood that each route of your application will be picked up by search engines.

You can read more about [zero-configuration pre-rendering (also called snapshotting) here](https://medium.com/superhighfives/an-almost-static-stack-6df0a2791319).

## Injecting Data from the Server into the Page

Similarly to the previous section, you can leave some placeholders in the HTML that inject global variables, for example:

```js
<!doctype html>
<html lang="en">
  <head>
    <script>
      window.SERVER_DATA = __SERVER_DATA__;
    </script>
```

Then, on the server, you can replace `__SERVER_DATA__` with a JSON of real data right before sending the response. The client code can then read `window.SERVER_DATA` to use it. **Make sure to [sanitize the JSON before sending it to the client](https://medium.com/node-security/the-most-common-xss-vulnerability-in-react-js-applications-2bdffbcc1fa0) as it makes your app vulnerable to XSS attacks.**

## Making a Progressive Web App

The production build has all the tools necessary to generate a first-class
[Progressive Web App](https://developers.google.com/web/progressive-web-apps/),
but **the offline/cache-first behavior is opt-in only**. By default,
the build process will generate a service worker file, but it will not be
registered, so it will not take control of your production web app.

In order to opt-in to the offline-first behavior, developers should look for the
following in their [`src/index.js`](src/index.js) file:

```js
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
```

As the comment states, switching `serviceWorker.unregister()` to
`serviceWorker.register()` will opt you in to using the service worker.

### Why Opt-in?

Offline-first Progressive Web Apps are faster and more reliable than traditional web pages, and provide an engaging mobile experience:

- All static site assets are cached so that your page loads fast on subsequent visits, regardless of network connectivity (such as 2G or 3G). Updates are downloaded in the background.
- Your app will work regardless of network state, even if offline. This means your users will be able to use your app at 10,000 feet and on the subway.
- On mobile devices, your app can be added directly to the user's home screen, app icon and all. This eliminates the need for the app store.

However, they [can make debugging deployments more challenging](https://github.com/facebook/create-react-app/issues/2398) so, starting with Create React App 2, service workers are opt-in.

The [`workbox-webpack-plugin`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin)
is integrated into production configuration,
and it will take care of generating a service worker file that will automatically
precache all of your local assets and keep them up to date as you deploy updates.
The service worker will use a [cache-first strategy](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#cache-falling-back-to-network)
for handling all requests for local assets, including
[navigation requests](https://developers.google.com/web/fundamentals/primers/service-workers/high-performance-loading#first_what_are_navigation_requests)
for your HTML, ensuring that your web app is consistently fast, even on a slow
or unreliable network.

### Offline-First Considerations

If you do decide to opt-in to service worker registration, please take the
following into account:

1. Service workers [require HTTPS](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers#you_need_https),
   although to facilitate local testing, that policy
   [does not apply to `localhost`](http://stackoverflow.com/questions/34160509/options-for-testing-service-workers-via-http/34161385#34161385).
   If your production web server does not support HTTPS, then the service worker
   registration will fail, but the rest of your web app will remain functional.

1. Service workers are [not supported](https://jakearchibald.github.io/isserviceworkerready/#moar)
   in older web browsers. Service worker registration [won't be attempted](src/registerServiceWorker.js)
   on browsers that lack support.

1. The service worker is only enabled in the [production environment](#deployment),
   e.g. the output of `npm run build`. It's recommended that you do not enable an
   offline-first service worker in a development environment, as it can lead to
   frustration when previously cached assets are used and do not include the latest
   changes you've made locally.

1. If you _need_ to test your offline-first service worker locally, build
   the application (using `npm run build`) and run a simple http server from your
   build directory. After running the build script, `create-react-app` will give
   instructions for one way to test your production build locally and the [deployment instructions](#deployment) have
   instructions for using other methods. _Be sure to always use an
   incognito window to avoid complications with your browser cache._

1. Users aren't always familiar with offline-first web apps. It can be useful to
   [let the user know](https://developers.google.com/web/fundamentals/instant-and-offline/offline-ux#inform_the_user_when_the_app_is_ready_for_offline_consumption)
   when the service worker has finished populating your caches (showing a "This web
   app works offline!" message) and also let them know when the service worker has
   fetched the latest updates that will be available the next time they load the
   page (showing a "New content is available; please refresh." message). Showing
   this messages is currently left as an exercise to the developer, but as a
   starting point, you can make use of the logic included in [`src/registerServiceWorker.js`](src/registerServiceWorker.js), which
   demonstrates which service worker lifecycle events to listen for to detect each
   scenario, and which as a default, just logs appropriate messages to the
   JavaScript console.

1. By default, the generated service worker file will not intercept or cache any
   cross-origin traffic, like HTTP [API requests](#integrating-with-an-api-backend),
   images, or embeds loaded from a different domain.

### Progressive Web App Metadata

The default configuration includes a web app manifest located at
[`public/manifest.json`](public/manifest.json), that you can customize with
details specific to your web application.

When a user adds a web app to their homescreen using Chrome or Firefox on
Android, the metadata in [`manifest.json`](public/manifest.json) determines what
icons, names, and branding colors to use when the web app is displayed.
[The Web App Manifest guide](https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/)
provides more context about what each field means, and how your customizations
will affect your users' experience.

Progressive web apps that have been added to the homescreen will load faster and
work offline when there's an active service worker. That being said, the
metadata from the web app manifest will still be used regardless of whether or
not you opt-in to service worker registration.

## Advanced Configuration

You can adjust various development and production settings by setting environment variables in your shell or with [.env](#adding-development-environment-variables-in-env).

| Variable            |      Development       |     Production     | Usage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| :------------------ | :--------------------: | :----------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BROWSER             |   :white_check_mark:   |        :x:         | By default, Create React App will open the default system browser, favoring Chrome on macOS. Specify a [browser](https://github.com/sindresorhus/opn#app) to override this behavior, or set it to `none` to disable it completely. If you need to customize the way the browser is launched, you can specify a node script instead. Any arguments passed to `npm start` will also be passed to this script, and the url where your app is served will be the last argument. Your script's file name must have the `.js` extension.                                                                                                                                       |
| HOST                |   :white_check_mark:   |        :x:         | By default, the development web server binds to `localhost`. You may use this variable to specify a different host.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| PORT                |   :white_check_mark:   |        :x:         | By default, the development web server will attempt to listen on port 3000 or prompt you to attempt the next available port. You may use this variable to specify a different port.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| HTTPS               |   :white_check_mark:   |        :x:         | When set to `true`, Create React App will run the development server in `https` mode.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| PUBLIC_URL          |          :x:           | :white_check_mark: | Create React App assumes your application is hosted at the serving web server's root or a subpath as specified in [`package.json` (`homepage`)](#building-for-relative-paths). Normally, Create React App ignores the hostname. You may use this variable to force assets to be referenced verbatim to the url you provide (hostname included). This may be particularly useful when using a CDN to host your application.                                                                                                                                                                                                                                               |
| CI                  | :large_orange_diamond: | :white_check_mark: | When set to `true`, Create React App treats warnings as failures in the build. It also makes the test runner non-watching. Most CIs set this flag by default.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| REACT_EDITOR        |   :white_check_mark:   |        :x:         | When an app crashes in development, you will see an error overlay with clickable stack trace. When you click on it, Create React App will try to determine the editor you are using based on currently running processes, and open the relevant source file. You can [send a pull request to detect your editor of choice](https://github.com/facebook/create-react-app/issues/2636). Setting this environment variable overrides the automatic detection. If you do it, make sure your systems [PATH](<https://en.wikipedia.org/wiki/PATH_(variable)>) environment variable points to your editor’s bin folder. You can also set it to `none` to disable it completely. |
| CHOKIDAR_USEPOLLING |   :white_check_mark:   |        :x:         | When set to `true`, the watcher runs in polling mode, as necessary inside a VM. Use this option if `npm start` isn't detecting changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| GENERATE_SOURCEMAP  |          :x:           | :white_check_mark: | When set to `false`, source maps are not generated for a production build. This solves OOM issues on some smaller machines.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| NODE_PATH           |   :white_check_mark:   | :white_check_mark: | Same as [`NODE_PATH` in Node.js](https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders), but only relative folders are allowed. Can be handy for emulating a monorepo setup by setting `NODE_PATH=src`.                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Alternatives to Ejecting

[Ejecting](#npm-run-eject) lets you customize anything, but from that point on you have to maintain the configuration and scripts yourself. This can be daunting if you have many similar projects. In such cases instead of ejecting we recommend to _fork_ `react-scripts` and any other packages you need. [This article](https://auth0.com/blog/how-to-configure-create-react-app/) dives into how to do it in depth. You can find more discussion in [this issue](https://github.com/facebook/create-react-app/issues/682).

