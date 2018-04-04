import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Activity } from 'rmw-shell'
import { setDialogIsOpen } from 'rmw-shell/lib/store/dialogs/actions';
import TaskForm from '../../components/Forms/TaskForm';
import { withRouter } from 'react-router-dom';
import firebase from 'firebase';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import { withFirebase } from 'firekit-provider'
import FireForm from 'fireform'

const path = '/public_tasks/';

class Task extends Component {

  componentDidMount() {
    this.props.watchList('users');
  }


  handleCreateValues = (values) => {

    const { auth } = this.props;

    return {
      created: firebase.database.ServerValue.TIMESTAMP,
      userName: auth.displayName,
      userPhotoURL: auth.photoURL,
      userId: auth.uid,
      completed: false,
      ...values
    }
  }

  handleClose = () => {
    const { setDialogIsOpen } = this.props;

    setDialogIsOpen('delete_vehicle', false);

  }

  handleDelete = () => {

    const { history, match, firebaseApp } = this.props;
    const uid = match.params.uid;

    if (uid) {
      firebaseApp.database().ref().child(`${path}${uid}`).remove().then(() => {
        this.handleClose();
        history.goBack();
      })
    }
  }

  render() {

    const { history, intl, dialogs, match, setDialogIsOpen, firebaseApp } = this.props;

    const actions = [
      <FlatButton
        label={intl.formatMessage({ id: 'cancel' })}
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label={intl.formatMessage({ id: 'delete' })}
        secondary={true}
        onClick={this.handleDelete}
      />,
    ];

    return (
      <Activity
        iconElementRight={
          match.params.uid ? <FlatButton
            style={{ marginTop: 4 }}
            onClick={() => { setDialogIsOpen('delete_vehicle', true); }}
            icon={<FontIcon className="material-icons" >delete</FontIcon>}
          /> : undefined
        }
        onBackClick={() => { history.goBack() }}
        title={intl.formatMessage({ id: this.props.match.params.uid ? 'edit_task' : 'create_task' })}>
        <div style={{ margin: 15, display: 'flex' }}>
          <FireForm
            firebaseApp={firebaseApp}
            name={'task'}
            path={path}
            onSubmitSuccess={(values) => { history.push('/tasks'); }}
            onDelete={(values) => { history.push('/tasks'); }}
            handleCreateValues={this.handleCreateValues}
            uid={this.props.match.params.uid}>
            <TaskForm />
          </FireForm>
        </div>
        <Dialog
          title={intl.formatMessage({ id: 'delete_task_title' })}
          actions={actions}
          modal={false}
          open={dialogs.delete_vehicle === true}
          onRequestClose={this.handleClose}>
          {intl.formatMessage({ id: 'delete_task_message' })}
        </Dialog>
      </Activity>
    );
  }
}


const mapStateToProps = (state) => {
  const { auth, intl, dialogs } = state;

  return {
    auth,
    intl,
    dialogs
  };
};

export default connect(
  mapStateToProps, { setDialogIsOpen }
)(injectIntl(withRouter(withFirebase(Task))));
