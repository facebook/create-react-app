
import * as React from 'react';
import { Route } from 'react-router';
import App from './components/App';
import { URLS } from './constants/urls';
import { Store } from 'redux';
import { Home } from './components/Pages';


export default (store: Store<any>) => (
    <App>
    <Route exact path={URLS.HOME} component={Home} />
    </App>
);