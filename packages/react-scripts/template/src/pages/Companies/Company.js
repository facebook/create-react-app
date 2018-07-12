import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Activity } from 'rmw-shell'
//import { ResponsiveMenu } from 'material-ui-responsive-menu';
import { withTheme, withStyles } from '@material-ui/core/styles'
import { setDialogIsOpen } from 'rmw-shell/lib/store/dialogs/actions'
import CompanyForm from '../../components/Forms/Company';
import { withRouter } from 'react-router-dom';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withFirebase } from 'firekit-provider'
import FireForm from 'fireform'
import { isLoading } from 'firekit'
import { change, submit } from 'redux-form';
import isGranted from 'rmw-shell/lib/utils/auth';
import IconButton from '@material-ui/core/IconButton';

const path = '/companies/';
const form_name = 'company';

const styles = teheme => ({

})


class Company extends Component {

  validate = (values) => {
    const { intl } = this.props;
    const errors = {}

    errors.name = !values.name ? intl.formatMessage({ id: 'error_required_field' }) : '';
    errors.full_name = !values.full_name ? intl.formatMessage({ id: 'error_required_field' }) : '';
    errors.vat = !values.vat ? intl.formatMessage({ id: 'error_required_field' }) : '';

    return errors
  }

  handleClose = () => {
    const { setDialogIsOpen } = this.props;

    setDialogIsOpen('delete_company', false);

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

    const {
      history,
      intl,
      setDialogIsOpen,
      dialogs,
      match,
      submit,
      isGranted,
      firebaseApp,
      uid,
      isLoading
    } = this.props;

    //const uid = match.params.uid;

    return (
      <Activity
        isLoading={isLoading}
        iconStyleRight={{ width: '50%' }}
        appBarContent={
          <div style={{ display: 'flex' }}>
            {((!uid && isGranted(`create_${form_name}`)) || (!!uid && isGranted(`edit_${form_name}`))) &&
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => { submit('company') }}
              >
                <Icon className="material-icons" >save</Icon>
              </IconButton>
            }

            {(isGranted(`delete_${form_name}`)) &&
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => { setDialogIsOpen('delete_company', true) }}
              >
                <Icon className="material-icons" >delete</Icon>
              </IconButton>
            }
          </ div>
        }

        onBackClick={() => { history.goBack() }}
        title={intl.formatMessage({ id: match.params.uid ? 'edit_company' : 'create_company' })}>

        <div style={{ margin: 15, display: 'flex' }}>

          <FireForm
            firebaseApp={firebaseApp}
            name={'company'}
            path={`${path}`}
            validate={this.validate}
            onSubmitSuccess={(values) => { history.push('/companies'); }}
            onDelete={(values) => { history.push('/companies'); }}
            uid={uid}>
            <CompanyForm />
          </FireForm>
        </div>

        <Dialog
          open={dialogs.delete_company === true}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{intl.formatMessage({ id: 'delete_company_title' })}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {intl.formatMessage({ id: 'delete_company_message' })}
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

Company.propTypes = {
  history: PropTypes.object,
  intl: intlShape.isRequired,
  setDialogIsOpen: PropTypes.func.isRequired,
  dialogs: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  submit: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  isGranted: PropTypes.func.isRequired,
};


const mapStateToProps = (state, ownProps) => {
  const { intl, dialogs } = state;
  const { match } = ownProps

  const uid = match.params.uid

  return {
    intl,
    dialogs,
    uid,
    isGranted: grant => isGranted(state, grant),
    isLoading: isLoading(state, `${path}/${uid}`)
  };
};

export default connect(
  mapStateToProps, { setDialogIsOpen, change, submit }
)(injectIntl(withRouter(withFirebase(withTheme()(withStyles(styles, { withTheme: true })(Company))))))
