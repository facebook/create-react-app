import App from './App';

it('creates instance without', () => {
  const app = new App();
  expect(app.foo()).toBe('bar');
});
