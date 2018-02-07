// @flow
// TODO: remove this file
export type Post = {
  id: number,
  userId: number,
  title: string,
  body: string
};
export type Posts = Array<Post>;
export type PostsMap = {
  [key: number]: Post
};
