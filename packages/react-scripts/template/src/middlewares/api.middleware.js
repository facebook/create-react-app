// @flow
import { stringify } from 'query-string';
import superagent from 'superagent';
import { get } from 'lodash/fp';

import * as AT from 'constants/action-types.constants';
import { startNetwork, endNetwork } from 'actions/network.actions';
import { SERVER_URL } from 'constants/api.constants';

import { Middleware } from 'types/redux.types';
// import type { Middleware } from 'redux'; doesn't work?

type Params = {
  headers: Object,
  data?: string,
} & RequestOptions;

const apiMiddleware: Middleware = ({ dispatch, getState }) => next => action => {
  if (action.type !== AT.API) {
    return next(action);
  }

  let { url } = action.payload;
  const { label, data, method = 'get' } = action.payload;

  const params: Params = {
    method,
    headers: {},
    withCredentials: true,
  };

  if (data) {
    if (method === 'get') {
      url = url + '?' + stringify(data);
    } else {
      params.data = JSON.stringify(data);
      params.headers['Content-type'] = 'application/json';
    }
  }

  if (getState().user.token) {
    params.headers['auth'] = getState().user.token;
  }

  dispatch(startNetwork(label));

  return superagent
    .request({
      ...params,
      url: SERVER_URL + url,
    })
    .then(({ data }) => {
      dispatch(endNetwork(label));

      return data;
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
