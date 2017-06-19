import { actionLoadingMiddleware, actionLoadingReducer } from './loading';
import mockStore from 'test/mock-store';

describe('store/actionLoadingMiddleware', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
  });

  it('does nothing if payload is not a promise', () => {
    const next = jest.fn();
    const action = {
      type: 'test/dummy',
      payload: 'value',
    };

    actionLoadingMiddleware(store)(next)(action);

    expect(store.getActions()).toEqual([]);
  });

  it('dispatches loading action if payload is a promise', () => {
    const next = jest.fn();
    const action = {
      type: 'test/asyncDummy',
      payload: Promise.resolve('foo'),
    };

    actionLoadingMiddleware(store)(next)(action);

    expect(store.getActions()).toEqual([
      {
        type: 'test/loading',
        payload: true,
      },
    ]);
  });

  it('dispatches original action with promise result', async () => {
    const promise = Promise.resolve('foo');
    const next = jest.fn();
    const action = {
      type: 'test/asyncDummy',
      payload: promise,
    };

    actionLoadingMiddleware(store)(next)(action);

    await promise;

    expect(store.getActions()).toEqual([
      {
        type: 'test/loading',
        payload: true,
      },
      {
        type: 'test/asyncDummy',
        payload: 'foo',
      },
    ]);
  });

  it('dispatches unloading action after promise payload is resolved', async () => {
    const promise = Promise.resolve('foo');
    const next = jest.fn();
    const action = {
      type: 'test/asyncDummy',
      payload: promise,
    };

    actionLoadingMiddleware(store)(next)(action);

    await new Promise((resolve) => {
      setTimeout(() => resolve('foo'), 10);
    });

    expect(store.getActions()).toEqual([
      {
        type: 'test/loading',
        payload: true,
      },
      {
        type: 'test/asyncDummy',
        payload: 'foo',
      },
      {
        type: 'test/loading',
        payload: false,
      },
    ]);
  });

  it('dispatches original action with error', async () => {
    const err = new Error('bar');
    const promise = Promise.reject(err);
    const next = jest.fn();
    const action = {
      type: 'test/asyncDummy',
      payload: promise,
    };

    actionLoadingMiddleware(store)(next)(action);

    await new Promise((resolve) => {
      setTimeout(() => resolve('foo'), 10);
    });

    expect(store.getActions()).toEqual([
      {
        type: 'test/loading',
        payload: true,
      },
      {
        type: 'test/asyncDummy',
        payload: undefined,
        error: err,
      },
      {
        type: 'test/loading',
        payload: false,
      },
    ]);
  });
});

describe('store/actionLoadingReducer', () => {
  const state = {};

  it('returns state without loading action', () => {
    const action = {
      type: 'test/dummy',
      payload: 'foo',
    };
    const result = actionLoadingReducer(state, action);
    expect(result).toEqual(state);
  });

  it('returns true with loading action and true payload', () => {
    const action = {
      type: 'test/loading',
      payload: true,
    };
    const result = actionLoadingReducer(state, action);
    expect(result).toEqual(true);
  });

  it('returns false with loading action and false payload', () => {
    const action = {
      type: 'test/loading',
      payload: false,
    };
    const result = actionLoadingReducer(state, action);
    expect(result).toEqual(false);
  });
});
