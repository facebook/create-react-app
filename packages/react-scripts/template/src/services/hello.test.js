import hello from './hello';

describe('services/hello', () => {
  it('says hello', async () => {
    expect.assertions(1);
    const result = await hello('world');
    expect(result).toEqual('Hello, world');
  });

  it('says nothing if name is empty', async () => {
    expect.assertions(1);
    const result = await hello('');
    expect(result).toEqual(null);
  });
});
