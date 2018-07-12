import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { withTheme } from '@material-ui/core/styles'
import { injectIntl, intlShape } from 'react-intl'
import { Activity } from 'rmw-shell'
import { setDialogIsOpen } from 'rmw-shell/lib/store/dialogs/actions'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Divider from '@material-ui/core/Divider'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import Avatar from '@material-ui/core/Avatar'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import { withRouter } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withFirebase } from 'firekit-provider'
import green from '@material-ui/core/colors/green'
import Scrollbar from 'rmw-shell/lib/components/Scrollbar'
import withWidth from '@material-ui/core/withWidth'
import moment from 'moment'

class Tasks extends Component {

  constructor(props) {
    super(props);
    this.name = null;
    this.listEnd = null
    this.new_task_title = null;
    this.state = { value: '' }
  }

  scrollToBottom = () => {
    const node = ReactDOM.findDOMNode(this.listEnd);
    if (node) {
      node.scrollIntoView({ behavior: "smooth" });
    }

  }

  componentDidUpdate(prevProps, prevState) {

    this.scrollToBottom();

  }

  componentDidMount() {
    const { watchList, firebaseApp } = this.props;

    let tasksRef = firebaseApp.database().ref('public_tasks').orderByKey().limitToLast(20);
    watchList(tasksRef)
    this.scrollToBottom();
  }

  handleKeyDown = (event, onSucces) => {
    if (event.keyCode === 13) {
      onSucces();
    }
  }

  handleAddTask = () => {
    const { auth, firebaseApp } = this.props;

    const newTask = {
      title: this.state.value,
      created: moment.now(),
      userName: auth.displayName,
      userPhotoURL: auth.photoURL,
      userId: auth.uid,
      completed: false
    }

    if (this.state.value.length > 0) {
      firebaseApp.database().ref('public_tasks').push(newTask).then(() => {
        this.setState({ value: '' })
      })
    }



  }

  handleUpdateTask = (key, task) => {
    const { firebaseApp } = this.props;
    firebaseApp.database().ref(`public_tasks/${key}`).update(task);
  }


  userAvatar = (key, task) => {

    if (task.completed) {
      return <Avatar style={{ backgroundColor: green[500] }}> <Icon > done </Icon>  </Avatar>
    }
    return <div>
      {task.userPhotoURL && <Avatar src={task.userPhotoURL} alt='person' />}
      {!task.userPhotoURL && <Avatar> <Icon > person </Icon>  </Avatar>}
    </div>
  }

  renderList(tasks) {
    const { auth, intl, history, setDialogIsOpen } = this.props;

    if (tasks === undefined) {
      return <div></div>
    }

    return tasks.map((row, i) => {

      const task = row.val;
      const key = row.key;

      return <div key={key}>

        <ListItem
          id={key}
          key={key}
          onClick={auth.uid === task.userId ? () => { this.handleUpdateTask(key, { ...task, completed: !task.completed }) } : undefined}>
          {this.userAvatar(key, task)}
          <ListItemText primary={task.title} secondary={`${task.userName} ${task.created ? intl.formatRelative(new Date(task.created)) : undefined}`} />
          <ListItemSecondaryAction>
            {
              task.userId === auth.uid ?
                <IconButton
                  color='primary'
                  onClick={task.userId === auth.uid ? () => { history.push(`/tasks/edit/${key}`) } : undefined}>
                  <Icon >{'edit'}</Icon>
                </IconButton> : undefined
            }
            {
              task.userId === auth.uid ?
                <IconButton
                  color='secondary'
                  //style={{ display: isWidthDown('md', width) ? 'none' : undefined }}
                  onClick={() => { setDialogIsOpen('delete_task_from_list', key); }}>
                  <Icon >{'delete'}</Icon>
                </IconButton> : undefined
            }
          </ListItemSecondaryAction>
        </ListItem>
        <Divider inset={true} />
      </div >
    });
  }

  handleClose = () => {
    const { setDialogIsOpen } = this.props;
    setDialogIsOpen('delete_task_from_list', undefined);
  }

  handleDelete = (key) => {
    const { firebaseApp, dialogs, unwatchList, watchList } = this.props;

    unwatchList('public_tasks');

    firebaseApp.database().ref(`public_tasks/${dialogs.delete_task_from_list}`).remove();

    let messagesRef = firebaseApp.database().ref('public_tasks').orderByKey().limitToLast(20);
    watchList(messagesRef)

    this.handleClose();

  }

  render() {
    const { intl, tasks, theme, dialogs } = this.props;

    return (
      <Activity
        isLoading={tasks === undefined}
        containerStyle={{ overflow: 'hidden' }}
        title={intl.formatMessage({ id: 'tasks' })}>

        <Scrollbar>

          <div style={{ overflow: 'none', backgroundColor: theme.palette.convasColor, paddingBottom: 56 }}>
            <List id='test' style={{ height: '100%' }} ref={(field) => { this.list = field; }}>
              {this.renderList(tasks)}
            </List>
            <div style={{ float: "left", clear: "both" }}
              ref={(el) => { this.listEnd = el; }}
            />
          </div>

        </Scrollbar>


        {tasks &&
          <BottomNavigation style={{ width: '100%', position: 'absolute', bottom: 0, right: 0, left: 0, zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 15 }}>
              <TextField
                id="public_task"
                fullWidth={true}
                value={this.state.value}
                onKeyDown={(event) => { this.handleKeyDown(event, this.handleAddTask) }}
                onChange={e => this.setState({ value: e.target.value })}
                type="Text"
              />
              <IconButton
                disabled={this.state.value === ''}
                onClick={this.handleAddTask}>
                <Icon className="material-icons" color={theme.palette.primary1Color}>send</Icon>
              </IconButton>
            </div>
          </BottomNavigation>
        }




        <Dialog
          open={dialogs.delete_task_from_list !== undefined}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{intl.formatMessage({ id: 'delete_task_title' })}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {intl.formatMessage({ id: 'delete_task_message' })}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" >
              {intl.formatMessage({ id: 'cancel' })}
            </Button>
            <Button onClick={this.handleDelete} color="secondary" >
              {intl.formatMessage({ id: 'delete' })}
            </Button>
          </DialogActions>
        </Dialog>





      </Activity>
    );

  }

}

Tasks.propTypes = {
  intl: intlShape.isRequired,
  theme: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  const { lists, auth, dialogs } = state;

  return {
    tasks: lists.public_tasks,
    auth,
    dialogs
  };
};




export default connect(
  mapStateToProps,
  { setDialogIsOpen }
)(injectIntl(withWidth()(withTheme()(withRouter(withFirebase(Tasks))))))
