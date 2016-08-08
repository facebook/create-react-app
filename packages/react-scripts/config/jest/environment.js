// Currently, Jest mocks setTimeout() and similar functions by default:
// https://facebook.github.io/jest/docs/timer-mocks.html
// We think this is confusing, so we disable this feature.
// If you see value in it, run `jest.useFakeTimers()` in individual tests.
beforeEach(() => {
  jest.useRealTimers();
});
