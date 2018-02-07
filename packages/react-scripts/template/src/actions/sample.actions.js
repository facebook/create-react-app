import { API } from './network.actions';
import { fetchPostsUrl } from '../constants/api.constants';
import type { Posts } from 'types/api.types';

export const SET = '[posts] Set';

export const fetchPosts: ThunkActionCreator = () => (dispatch: Dispatch) => {
  return dispatch({
    type: API,
    payload: {
      label: 'posts',
      method: 'get',
      url: fetchPostsUrl()
    }
  }).then((posts: Posts) => {
    dispatch(setPosts(posts));
  });
};

const setPosts: ActionCreator = (posts: Posts) => ({
  type: SET,
  payload: {
    posts
  }
});
