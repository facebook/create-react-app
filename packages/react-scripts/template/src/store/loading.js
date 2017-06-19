import { isEmpty } from 'lodash';

const loadingByType = {};
const loadingType = action => action.type.replace(/\/.*/, '/loading');

function setActionLoading(dispatch, action) {
  loadingByType[action.type] = true;
  dispatch({
    type: loadingType(action),
    payload: true,
  });
}

function unsetActionLoading(dispatch, action) {
  delete loadingByType[action.type];
  setTimeout(() => {
    dispatch({
      type: loadingType(action),
      payload: false,
    });
  }, 1);
}

export function actionLoadingMiddleware({ dispatch }) {
  return next => (action) => {
    // If promise
    if (action.payload && action.payload.then) {
      setActionLoading(dispatch, action);
      return action.payload
        .then((result) => {
          unsetActionLoading(dispatch, action);
          dispatch({ ...action, payload: result });
          return result;
        })
        .catch((err) => {
          unsetActionLoading(dispatch, action);
          dispatch({ ...action, payload: undefined, error: err });
          if (typeof __DEV__ !== 'undefined') {
            console.error(err); // eslint-disable-line no-console
          }
        });
    }

    // Continue
    return next(action);
  };
}

export function actionLoadingReducer(state = false, action) {
  if (action.type.indexOf('/loading') > 0) {
    if (action.payload) {
      return true;
    } else if (isEmpty(loadingByType)) {
      return false;
    }
  }
  return state;
}
