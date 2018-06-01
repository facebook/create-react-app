import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withTheme } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Icon from '@material-ui/core/Icon'
import Button from '@material-ui/core/Button'
import { withRouter } from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar'
import { withFirebase } from 'firekit-provider'
import isGranted from 'rmw-shell/lib/utils/auth'
import { Activity, Scrollbar } from 'rmw-shell'

class Companies extends Component {
  componentDidMount () {
    const { watchList, firebaseApp } = this.props

    let ref = firebaseApp.database().ref('companies').limitToFirst(20)

    watchList(ref)
  }

  renderList (companies) {
    const { history } = this.props

    if (companies === undefined) {
      return <div />
    }

    return companies.map((company, index) => {
      return <div key={index}>
        <ListItem
          key={index}
          onClick={() => { history.push(`/companies/edit/${company.key}`) }}
          id={index}>
          {company.val.photoURL && <Avatar src={company.val.photoURL} alt='bussines' />}
          {!company.val.photoURL && <Avatar> <Icon > business </Icon>  </Avatar>}
          <ListItemText primary={company.val.name} secondary={company.val.full_name} />
        </ListItem>
        <Divider inset />
      </div>
    })
  }

  render () {
    const { intl, companies, theme, history, isGranted } = this.props

    return (
      <Activity
        isLoading={companies === undefined}
        containerStyle={{ overflow: 'hidden' }}
        title={intl.formatMessage({ id: 'companies' })}>
        <Scrollbar>

          <div style={{ overflow: 'none', backgroundColor: theme.palette.convasColor }}>
            <List id='test' style={{ height: '100%' }} ref={(field) => { this.list = field }}>
              {this.renderList(companies)}
            </List>
          </div>

          <div style={{ position: 'fixed', right: 18, zIndex: 3, bottom: 18 }}>
            {
              isGranted('create_company') &&
              <Button variant='fab' color='secondary' onClick={() => { history.push(`/companies/create`) }} >
                <Icon className='material-icons' >add</Icon>
              </Button>
            }
          </div>

        </Scrollbar>

      </Activity>
    )
  }
}

Companies.propTypes = {
  companies: PropTypes.array,
  history: PropTypes.object,
  isGranted: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  const { auth, lists } = state

  return {
    companies: lists.companies,
    auth,
    isGranted: grant => isGranted(state, grant)
  }
}

export default connect(
  mapStateToProps
)(injectIntl(withTheme()(withRouter(withFirebase(Companies)))))
