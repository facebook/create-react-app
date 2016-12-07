// @flow
function fakeApiCall() : Promise<string[]> {
  return Promise.resolve({
    comments: {
      'id1': { id: 1, body: 'comment 1' },
      'id2': { id: 2, body: 'comment 2' },
      'id3': { id: 3, body: 'comment 3' },
      'id4': { id: 3, body: 'comment 4' },
    }
  });
}

export default async function loadComments({ max, ...comments } = {}) : Promise<string[]> {
  const { comments: fetchedComments } = await fakeApiCall();
  const totalComments = {
    ...comments,
    ...fetchedComments,
  };

  return Object.keys(totalComments)
    .slice(0, max)
    .reduce((slicedComments, key) => ({ ...slicedComments, [key]: totalComments[key] }), {});
}
