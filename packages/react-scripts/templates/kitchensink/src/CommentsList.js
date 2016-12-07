// @flow
import React, { Component, PropTypes } from 'react';
import loadComments from './loadComments';

class CommentsList extends Component {
  static propTypes = {
    user: PropTypes.string,
  };

  state : {
    loading: boolean,
    comments: string[],
  } = { loading: true, comments: [] };

  componentDidMount() {
    loadComments().then(comments => this.setState({ loading: false, comments }))
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
            : <ul>{comments.map((comment, i) => <li key={i}>{comment}</li>)}</ul>
        }
      </div>
    )
  }
}

export default CommentsList;
