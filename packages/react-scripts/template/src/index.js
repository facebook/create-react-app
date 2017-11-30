import App from 'rmw-shell/lib/App';
import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from './store';
import config from './config';
import locales from './locales';
import registerServiceWorker from 'rmw-shell/lib/registerServiceWorker';
import { addLocalizationData } from 'rmw-shell/lib/locales';

addLocalizationData(locales);

ReactDOM.render(
  <App appConfig={{ configureStore, ...config }} />,
  document.getElementById('root')
);

registerServiceWorker();
