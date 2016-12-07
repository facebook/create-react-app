// @flow
import React, { Component, PropTypes } from 'react';
import loadComments from './loadComments';

const previousComments = {
  'idOld': { id: 'old', body: 'comment old' },
};

class CommentsList extends Component {
  static propTypes = {
    user: PropTypes.string,
  };

  state : {
    loading: boolean,
    comments: string[],
  } = { loading: true, comments: [] };

  componentDidMount() {
    loadComments({ max: 4, ...previousComments })
      .then(comments => {
        const commentArray = Object.keys(comments).map(key => comments[key]);
        this.setState({ loading: false, comments: commentArray });
      })
  }

  render() {
    const { loading, comments } = this.state;
    const { user } = this.props;
    return (
      <div>
        <h3>Comments from {user}</h3>
        {
          loading
            ? <div>Comments are loading</div>
            : <ul>{comments.map((comment) => <li key={comment.id}>{`message: ${comment.body}`}</li>)}</ul>
        }
      </div>
    )
  }
}

export default CommentsList;
