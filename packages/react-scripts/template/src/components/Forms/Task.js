import Avatar from '@material-ui/core/Avatar'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TextField from 'rmw-shell/lib/components/ReduxFormFields/TextField'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import { VirtualizedSelectField } from 'muishift'
import { connect } from 'react-redux'
import { getList } from 'firekit'
import { injectIntl } from 'react-intl'
import { setDialogIsOpen } from 'rmw-shell/lib/store/dialogs/actions'
import { withRouter } from 'react-router-dom'
import { withTheme } from '@material-ui/core/styles'

class Form extends Component {
  render() {
    const { handleSubmit, intl, initialized, users } = this.props

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

        <div>
          <div>
            <Field
              name="title"
              disabled={!initialized}
              component={TextField}
              placeholder={intl.formatMessage({ id: 'title_hint' })}
              label={intl.formatMessage({ id: 'title_label' })}
            />
          </div>

          <div>
            <Field
              name="description"
              disabled={!initialized}
              component={TextField}
              multiline
              placeholder={intl.formatMessage({ id: 'description_hint' })}
              label={intl.formatMessage({ id: 'description_label' })}
            />
          </div>

          <br />
          <div>
            <Field
              name="helper"
              rowHeight={54}
              component={VirtualizedSelectField}
              items={users.map(snap => (snap && snap.val ? snap.val : {}))}
              itemToString={item => (item ? item.displayName : '')}
              inputProps={{
                placeholder: intl.formatMessage({ id: 'helper_hint' }),
                label: intl.formatMessage({ id: 'helper_label' })
              }}
              renderSuggestion={({ rootProps, downshiftProps, suggestion, index }) => {
                const { getItemProps, highlightedIndex } = downshiftProps
                const itemProps = getItemProps({ item: suggestion })
                const isHighlighted = highlightedIndex === index

                return (
                  <MenuItem {...itemProps} selected={isHighlighted} key={index}>
                    <Avatar alt="avatar" src={suggestion.photoURL} />
                    <ListItemText primary={suggestion.displayName} />
                  </MenuItem>
                )
              }}
            />
          </div>
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

const selector = formValueSelector('task')

const mapStateToProps = state => {
  const { intl, vehicleTypes, dialogs } = state

  return {
    intl,
    vehicleTypes,
    users: getList(state, 'users'),
    dialogs,
    photoURL: selector(state, 'photoURL')
  }
}

export default connect(
  mapStateToProps,
  { setDialogIsOpen }
)(injectIntl(withRouter(withTheme(reduxForm({ form: 'task' })(Form)))))
