import EditDocumentActivity from 'rmw-shell/lib/containers/Activities/EditDocumentActivity'
import Form from '../../components/Forms/Task'
import React from 'react'
import { injectIntl } from 'react-intl'

const name = 'task'
const path = 'tasks'

const Edit = props => {
  const { intl } = props
  const validate = values => {
    const errors = {}

    errors.name = !values.name ? intl.formatMessage({ id: 'error_required_field' }) : ''
    errors.full_name = !values.full_name ? intl.formatMessage({ id: 'error_required_field' }) : ''
    errors.vat = !values.vat ? intl.formatMessage({ id: 'error_required_field' }) : ''

    return errors
  }

  return (
    <EditDocumentActivity
      name={name}
      path={path}
      fireFormProps={{
        validate
      }}
    >
      <Form {...props} />
    </EditDocumentActivity>
  )
}

export default injectIntl(Edit)
