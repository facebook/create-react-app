import AvatarImageField from 'rmw-shell/lib/components/ReduxFormFields/AvatarImageField'
import Business from '@material-ui/icons/Business'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TextField from 'rmw-shell/lib/components/ReduxFormFields/TextField'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import { ImageCropDialog } from 'rmw-shell/lib/containers/ImageCropDialog'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { setDialogIsOpen } from 'rmw-shell/lib/store/dialogs/actions'
import { withRouter } from 'react-router-dom'
import { withTheme } from '@material-ui/core/styles'

class Form extends Component {
  render() {
    const { handleSubmit, intl, initialized, setDialogIsOpen, dialogs, match } = this.props

    const uid = match.params.uid

    return (
      <form
        onSubmit={handleSubmit}
        style={{
          height: '100%',
          width: '100%',
          alignItems: 'strech',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        <button type="submit" style={{ display: 'none' }} />

        <div style={{ margin: 15, display: 'flex', flexDirection: 'column' }}>
          <AvatarImageField
            name="photoURL"
            disabled={!initialized}
            uid={uid}
            change={this.props.change}
            initialized={initialized}
            icon={<Business fontSize="large" />}
            intl={intl}
            path={'companies'}
          />

          <div>
            <Field
              name="name"
              disabled={!initialized}
              component={TextField}
              placeholder={intl.formatMessage({ id: 'name_hint' })}
              label={intl.formatMessage({ id: 'name_label' })}
            />
          </div>

          <div>
            <Field
              name="full_name"
              disabled={!initialized}
              component={TextField}
              placeholder={intl.formatMessage({ id: 'full_name_hint' })}
              label={intl.formatMessage({ id: 'full_name_label' })}
            />
          </div>

          <div>
            <Field
              name="vat"
              disabled={!initialized}
              component={TextField}
              placeholder={intl.formatMessage({ id: 'vat_hint' })}
              label={intl.formatMessage({ id: 'vat_label' })}
            />
          </div>

          <div>
            <Field
              name="description"
              disabled={!initialized}
              component={TextField}
              multiline
              rows={2}
              placeholder={intl.formatMessage({ id: 'description_hint' })}
              label={intl.formatMessage({ id: 'description_label' })}
            />
          </div>

          <ImageCropDialog
            path={`companies/${uid}`}
            fileName={'photoURL'}
            onUploadSuccess={s => {
              this.handlePhotoUploadSuccess(s)
            }}
            open={dialogs.new_company_photo !== undefined}
            src={dialogs.new_company_photo}
            handleClose={() => {
              setDialogIsOpen('new_company_photo', undefined)
            }}
            title={intl.formatMessage({ id: 'change_photo' })}
          />
        </div>
      </form>
    )
  }
}

Form.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialized: PropTypes.bool.isRequired,
  setDialogIsOpen: PropTypes.func.isRequired,
  dialogs: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
}

Form = reduxForm({ form: 'company' })(Form)
const selector = formValueSelector('company')

const mapStateToProps = state => {
  const { intl, vehicleTypes, users, dialogs } = state

  return {
    intl,
    vehicleTypes,
    users,
    dialogs,
    photoURL: selector(state, 'photoURL')
  }
}

export default connect(
  mapStateToProps,
  { setDialogIsOpen }
)(injectIntl(withRouter(withTheme(Form))))
