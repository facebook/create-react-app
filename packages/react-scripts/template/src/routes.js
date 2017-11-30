import React from 'react';
import makeLoadable from 'rmw-shell/lib/containers/MyLoadable';
import RestrictedRoute from 'rmw-shell/lib/containers/RestrictedRoute';

const MyLoadable = (opts, preloadComponents) =>
  makeLoadable(
    { ...opts, firebase: () => import('./firebase') },
    preloadComponents
  );

const AsyncDashboard = MyLoadable({
  loader: () => import('./containers/Dashboard/Dashboard'),
});

const Routes = [
  <RestrictedRoute type="private" path="/" exact component={AsyncDashboard} />,
  <RestrictedRoute
    type="private"
    path="/dashboard"
    exact
    component={AsyncDashboard}
  />,
];

export default Routes;
