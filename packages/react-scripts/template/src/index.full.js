import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';

const appName = process.env.BMR_APP_NAME;

function domElementGetter() {
  // Make sure there is a `div` for us to render to.
  const container = appName;
  let el = document.getElementById(container);
  if (!el) {
    el = document.createElement('div');
    el.id = container;
    document.body.appendChild(el);
  }
  return el;
}

function hyphenToCamelCase(str) {
  return str.replace(/-([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
}

const app = singleSpaReact({
  React,
  ReactDOM,
  domElementGetter,
  rootComponent: App,
});

export function bootstrap(props) {
  return app.bootstrap(props);
}

export function mount(props) {
  return app.mount(props);
}

export function unmount(props) {
  return app.unmount(props);
}

window.bmr = window.bmr || {};
window.bmr[hyphenToCamelCase(appName)] = app;
