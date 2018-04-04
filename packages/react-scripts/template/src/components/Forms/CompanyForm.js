import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { TextField } from 'redux-form-material-ui';
import { Avatar } from 'rmw-shell/lib/containers/Avatar';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import { setDialogIsOpen } from 'rmw-shell/lib/store/dialogs/actions';
import { ImageCropDialog } from 'rmw-shell/lib/containers/ImageCropDialog';
import { withRouter } from 'react-router-dom';
import muiThemeable from 'material-ui/styles/muiThemeable';
import PropTypes from 'prop-types';



class Form extends Component {

  handlePhotoUploadSuccess = (snapshot) => {
    const { setDialogIsOpen, change } = this.props;
    change('photoURL', snapshot.downloadURL);
    setDialogIsOpen('new_company_photo', undefined);
  }

  render() {
    const {
      handleSubmit,
      intl,
      initialized,
      setDialogIsOpen,
      dialogs,
      match,
    } = this.props;

    const uid = match.params.uid;

    return (
      <form onSubmit={handleSubmit} style={{
        height: '100%',
        alignItems: 'strech',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button type="submit" style={{ display: 'none' }} />

        <div style={{ margin: 15, display: 'flex', flexDirection: 'column' }}>

          <div>
            <Field
              name="photoURL"
              size={120}
              component={Avatar}
              icon={
                <FontIcon
                  className="material-icons">
                  business
              </FontIcon>
              }
              ref="photoURL"
              withRef
            />
          </div>


          <FlatButton
            onClick={() => {
              setDialogIsOpen('new_company_photo', true)
            }}
            disabled={uid === undefined || !initialized}
            containerElement='label'
            primary={true}
            icon={
              <FontIcon
                className="material-icons">
                photo_camera
            </FontIcon>
            }
          />
        </div>

        <div>
          <div>
            <Field
              name="name"
              disabled={!initialized}
              component={TextField}
              hintText={intl.formatMessage({ id: 'name_hint' })}
              floatingLabelText={intl.formatMessage({ id: 'name_label' })}
              ref="name"
              withRef
            />
          </div>

          <div>
            <Field
              name="full_name"
              disabled={!initialized}
              component={TextField}
              hintText={intl.formatMessage({ id: 'full_name_hint' })}
              floatingLabelText={intl.formatMessage({ id: 'full_name_label' })}
              ref="full_name"
              withRef
            />
          </div>

          <div>
            <Field
              name="vat"
              disabled={!initialized}
              component={TextField}
              hintText={intl.formatMessage({ id: 'vat_hint' })}
              floatingLabelText={intl.formatMessage({ id: 'vat_label' })}
              ref="vat"
              withRef
            />
          </div>


          <div>
            <Field
              name="description"
              disabled={!initialized}
              component={TextField}
              multiLine={true}
              rows={2}
              hintText={intl.formatMessage({ id: 'description_hint' })}
              floatingLabelText={intl.formatMessage({ id: 'description_label' })}
              ref="description"
              withRef
            />
          </div>

          <ImageCropDialog
            path={`companies/${uid}`}
            fileName={`photoURL`}
            onUploadSuccess={(s) => { this.handlePhotoUploadSuccess(s) }}
            open={dialogs.new_company_photo !== undefined}
            src={dialogs.new_company_photo}
            handleClose={() => { setDialogIsOpen('new_company_photo', undefined) }}
            title={intl.formatMessage({ id: 'change_photo' })}
          />
        </div>

      </form>
    );
  }
}

Form.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  initialized: PropTypes.bool.isRequired,
  setDialogIsOpen: PropTypes.func.isRequired,
  dialogs: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};


Form = reduxForm({ form: 'company' })(Form);
const selector = formValueSelector('company')

const mapStateToProps = state => {
  const { intl, vehicleTypes, users, dialogs } = state;

  return {
    intl,
    vehicleTypes,
    users,
    dialogs,
    photoURL: selector(state, 'photoURL')
  };
};

export default connect(
  mapStateToProps, { setDialogIsOpen }
)(injectIntl(withRouter(muiThemeable()(Form))));
