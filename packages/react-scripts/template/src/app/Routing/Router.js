import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import MainPage from '../modules/MainPage';
import Page404 from '../shared/Page404';

export default function Router() {
  return (
    <BrowserRouter>
      <React.Fragment>
        <Switch>
          <Route exact path="/" component={MainPage} />
          <Route component={Page404} />
        </Switch>
      </React.Fragment>
    </BrowserRouter>
  );
}
