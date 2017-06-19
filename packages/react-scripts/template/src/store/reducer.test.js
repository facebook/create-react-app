import makeReducer from './reducer';

describe('store/makeReducer', () => {
  it('returns a function', () => {
    const reducer = makeReducer();
    expect(typeof reducer).toBe('function');
  });
});
