// @flow
declare var process: any;

const BASE_URL: string = process.env.REACT_APP_BASE_URL;

export const fetchPostsUrl = () => `${BASE_URL}/posts`;
