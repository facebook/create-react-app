import makeEnhancers, { middlewares } from './middleware';

describe('store/middlewares', () => {
  it('is an array of middleware functions', () => {
    expect(middlewares).toHaveLength(3);
  });
});

describe('store/makeEnhancers', () => {
  it('returns a functions', () => {
    const enhancers = makeEnhancers();
    expect(typeof enhancers).toBe('function');
  });
});
