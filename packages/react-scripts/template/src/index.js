import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import registerServiceWorker from './utils/registerServiceWorker';

import Shell from './containers/shell';
import Home from './containers/home';

// eslint-disable-next-line
import './css/app.scss';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route component={Shell}>
      <Route path="/" component={Home} />
    </Route>
  </Router>,
  document.getElementById('root')
);

registerServiceWorker();