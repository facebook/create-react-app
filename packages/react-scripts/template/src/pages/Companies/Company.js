import EditActivity from 'rmw-shell/lib/containers/Activities/EditActivity'
import Form from '../../components/Forms/Company'
import React from 'react'
import { injectIntl } from 'react-intl'

const name = 'company'
const path = 'companies'

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
    <EditActivity
      name={name}
      path={path}
      fireFormProps={{
        validate
      }}
    >
      <Form {...props} />
    </EditActivity>
  )
}

export default injectIntl(Edit)
