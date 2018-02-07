// @flow
import { stringify } from 'query-string';
import superagent from 'superagent';
import { get } from 'lodash/fp';

import * as NETWORK from 'actions/network.actions';
import { startNetwork, endNetwork } from 'actions/network.actions';

import { Middleware } from 'types/redux.types';
// import type { Middleware } from 'redux'; doesn't work?

console.log(superagent);

type Params = {
  headers: Object,
  data?: string,
} & RequestOptions;

const apiMiddleware: Middleware = ({ dispatch, getState }) => next => action => {
  if (action.type !== NETWORK.API) {
    return next(action);
  }
  
  let { url } = action.payload;
  const { label, data, method = 'GET' } = action.payload;
  const request = superagent(method, url).set('Accept', 'application/json');
  
  if (data) {
    if (method === 'GET') {
      request.query(data);
    } else {
      request.send(data)
        .set('Content-type', 'application/json');
    }
  }

  if (getState().user.token) {
    request.set('auth', getState().user.token);
  }

  dispatch(startNetwork(label));

  return request
    .then(({ body }) => {
      dispatch(endNetwork(label));

      return body;
    })
    .catch(error => {
      console.error('API error', error, action);

      dispatch(endNetwork(label));

      if (get('response.status', error) === 401) {
        // TODO: handle 401
      }

      return error;
    });
};

export default apiMiddleware;
