// @flow
function fakeApiCall() : Promise<string[]> {
  return Promise.resolve(['Comment 1', 'Comment 2', 'Comment 3'])
}

export default async function loadComments() : Promise<string[]> {
  const comments = await fakeApiCall();
  return comments;
}
