import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl'
import { Activity } from 'rmw-shell'
import Button from '@material-ui/core/Button'
import { withFirebase } from 'firekit-provider';
import TextField from '@material-ui/core/TextField'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
// eslint-disable-next-line
import firestore from 'firebase/firestore'

class Collection extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
  }

  componentDidMount() {
    this.handleWatch()
  }

  componentWillUnmount() {
    this.handleUnwatch()
  }

  handleAdd = () => {
    const { firebaseApp } = this.props

    let firestore = firebaseApp.firestore()

    const docRef = firestore.collection('posts')

    docRef.add({
      title: this.state.value
    }).then(() => {
      this.setState({ value: '' })
    })
  }

  handleDelete = (id) => {
    const { firebaseApp } = this.props

    let firestore = firebaseApp.firestore()

    firestore.collection('posts').doc(id).delete()

  }

  handleWatch = () => {
    const { watchCol } = this.props

    watchCol('posts')
  }

  handleUnwatch = () => {
    const { unwatchCol } = this.props

    unwatchCol('posts')
  }

  handleDestroy = () => {
    const { destroyCol } = this.props

    destroyCol('posts')
  }

  render() {
    const { intl, posts, isWatching } = this.props

    return (
      <Activity title={intl.formatMessage({ id: 'collection' })}>

        <div style={{ padding: 15 }}>

          <TextField
            value={this.state.value}
            onChange={(e) => {
              this.setState({ value: e.target.value })
            }}
            hintText={intl.formatMessage({ id: 'hot_dog_status' })}
            ref={(input) => { if (input) { this.input = input } }}
          />
          <Button variant="raised" color="primary" onClick={this.handleAdd} disabled={this.state.value === ''} style={{ margin: 12 }} > Add </Button>
          <Button variant="raised" color="primary" onClick={this.handleWatch} disabled={isWatching} style={{ margin: 12 }} > Watch </Button>
          <Button variant="raised" color="primary" onClick={this.handleUnwatch} disabled={!isWatching} style={{ margin: 12 }} > Unwatch </Button>
          <Button variant="raised" color="secondary" onClick={this.handleDestroy} style={{ margin: 12 }} > Destroy </Button>
          <br />
          <List>
            {posts.map((post, i) => {
              return <ListItem
                id={i}
                key={i}>
                <ListItemText primary={post.data.title} />
                <ListItemSecondaryAction>
                  <IconButton
                    color='secondary'
                    onClick={() => { this.handleDelete(post.id) }}>
                    <Icon >{'delete'}</Icon>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>

            })

            }
          </List>
        </div>

      </Activity>
    );

  }
}

Collection.propTypes = {
  intl: intlShape.isRequired,
};

const mapStateToProps = (state) => {
  const { collections, initialization } = state;

  const posts = collections['posts'] ? collections['posts'] : []
  const isWatching = initialization['posts'] ? true : false

  return {
    posts,
    isWatching
  };
};

export default connect(
  mapStateToProps, {}
)(injectIntl(withFirebase(Collection)))
