// utils/GoogleAnalytics.js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { Route } from 'react-router-dom';

const GoogleAnalytics = ({ location, ...options }) => {
  const { pathname, search } = location;

  useEffect(
    () => {
      logPageChange(pathname, search, options);
    },
    [pathname, search]
  );

  return null;
};

GoogleAnalytics.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
  options: PropTypes.object,
};

export default GoogleAnalytics;

function logPageChange(pathname, search = '', options) {
  const page = pathname + search;
  const { location } = window;
  ReactGA.set({
    page,
    location: `${location.origin}${page}`,
    ...options,
  });
  ReactGA.pageview(page);
}

export const RouteTracker = () => <Route component={GoogleAnalytics} />;

export const init = ({ gaId, testMode, ...other }) => {
  const isGAEnabled = true; //process.env.NODE_ENV === 'production';
  console.log('gaId:', gaId);
  if (isGAEnabled && !window.ga) {
    ReactGA.initialize(gaId, { testMode, ...other });
  }

  return isGAEnabled;
};
