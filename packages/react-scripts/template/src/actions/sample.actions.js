// TODO: remove this file
import { fetchPostsUrl } from '../constants/api.constants';
import type { Posts } from 'types/sample.types';
import type { ActionCreator, ApiAction } from 'types/redux.types';

export const FETCH_POSTS = '[posts] Fetch Posts';
export const SET_POSTS = '[posts] Set Posts';

export const fetchPosts: ActionCreator = (): ApiAction => ({
  type: FETCH_POSTS,
  payload: {
    label: 'posts',
    method: 'GET',
    url: fetchPostsUrl(),
    onSuccess: (posts, dispatch) => dispatch(setPosts(posts))
  },
  meta: {
    api: true
  }
});

const setPosts: ActionCreator = (posts: Posts) => ({
  type: SET_POSTS,
  payload: {
    posts
  }
});
