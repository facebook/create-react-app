import React, {Component} from 'react';
import {connect} from 'react-redux';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { injectIntl, intlShape } from 'react-intl'
import { Activity } from 'rmw-shell'
import RaisedButton from 'material-ui/RaisedButton'
import {withFirebase} from 'firekit-provider';
import TextField from 'material-ui/TextField'
import {List, ListItem} from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
// eslint-disable-next-line
import firestore from 'firebase/firestore'

class Collection extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
  }

  componentDidMount(){
    this.handleWatch()
  }

  componentWillUnmount(){
    this.handleUnwatch()
  }

  handleAdd = () => {
    const { firebaseApp }= this.props

    let firestore=firebaseApp.firestore()

    const docRef=firestore.collection('posts')

    docRef.add({
      title: this.state.value
    })
  }

  handleDelete = (id) => {
    const { firebaseApp }= this.props

    console.log(id);

    let firestore=firebaseApp.firestore()

    firestore.collection('posts').doc(id).delete()

  }

  handleWatch = () => {
    const { watchCol }= this.props

    watchCol('posts')
  }

  handleUnwatch = () => {
    const { unwatchCol }= this.props

    unwatchCol('posts')
  }

  handleDestroy = () => {
    const { destroyCol }= this.props

    destroyCol('posts')
  }

  render() {
    const { intl, muiTheme, posts, isWatching }= this.props

    return (
      <Activity title={intl.formatMessage({id: 'collection'})}>

        <div style={{padding: 15}}>

        <TextField
          value={this.state.value}
          onChange={(ev, value)=>{
            this.setState({value})
          }}
          hintText={intl.formatMessage({id: 'hot_dog_status'})}
          ref={(input)=>{if(input){this.input=input}}}
        />
        <RaisedButton
          onClick={this.handleAdd}
          label="Add"
          primary={true}
          style={{margin: 12}}
        />
        <RaisedButton
          disabled={isWatching}
          onClick={this.handleWatch}
          label="Watch"
          primary={true}
          style={{margin: 12, marginLeft:0}}
        />
        <RaisedButton
          disabled={!isWatching}
          onClick={this.handleUnwatch}
          label="Unwatch"
          primary={true}
          style={{margin: 12, marginLeft:0}}
        />
        <RaisedButton
          onClick={this.handleDestroy}
          label="Destroy"
          primary={true}
          style={{margin: 12, marginLeft:0}}
        /><br />
        <List>
          {posts.map((post, i)=>{
            return  <ListItem
              primaryText={post.data.title}
              rightIconButton={<IconButton
                onClick={()=>{this.handleDelete(post.id)}}
                tooltip="Delete">
                <FontIcon className="material-icons" color={muiTheme.palette.accent1Color}>delete</FontIcon>
              </IconButton>
            } />
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

  const posts=collections['posts']?collections['posts']:[]
  const isWatching=initialization['posts']?true:false

  return {
    posts,
    isWatching
  };
};

export default connect(
  mapStateToProps, {}
)(injectIntl(withFirebase(muiThemeable()(Collection))));
