import {
  HELLO_WORLD,
  default as actions,
  reducer,
} from './hello';

describe('actions/greet', () => {
  it('should create a greet action', () => {
    expect(actions.greet('foo')).toEqual({
      type: HELLO_WORLD,
      payload: Promise.resolve('Hello, foo'),
    });
  });
});

describe('reducer', () => {
  it('should greeting on new state', () => {
    const state = { foo: true };
    const result = reducer(state, { type: HELLO_WORLD, payload: 'foo' });
    expect(result).not.toEqual(state);
    expect(result).toEqual({
      foo: true,
      greeting: 'foo',
    });
  });
});
