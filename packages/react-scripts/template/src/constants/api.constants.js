const PRODUCTION_URL = 'http://prod.com'; // eslint-disable-line no-unused-vars
const STAGING_URL = 'http://jsonplaceholder.typicode.com'; // eslint-disable-line no-unused-vars
const DEVELOPMENT_URL = 'http://localhost:8080'; // eslint-disable-line no-unused-vars

const BASE_URL = STAGING_URL;

export const fetchPostsUrl = () => `${BASE_URL}/posts`;
