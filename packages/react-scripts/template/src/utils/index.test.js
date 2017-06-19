import { helloUtil } from './index';

describe('utils/helloUtil', () => {
  it('says hello', () => {
    const result = helloUtil('world');
    expect(result).toEqual('Hello, world');
  });
});
