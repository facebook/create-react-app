// @flow
// TODO: remove this file
import { set, keyBy } from 'lodash/fp';
import { handleActions } from 'redux-actions';

import type { Action } from 'types/redux.types';
import type { PostsMap } from 'types/sample.types';

import * as AT from 'actions/sample.actions';

export type PostsState = {|
  posts: PostsMap,
|};

const initialState: PostsState = {
  posts: {},
};

const sampleReducer = handleActions(
  {
    [AT.SET_POSTS]: (
      state: PostsState,
      { payload: { posts } }: Action
    ): PostsState => set('posts', keyBy('id', posts), state),
  },
  initialState
);

export default sampleReducer;
