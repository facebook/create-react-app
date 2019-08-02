import AltIconAvatar from 'rmw-shell/lib/components/AltIconAvatar'
import Delete from '@material-ui/icons/Delete'
import CollectionActivity from 'rmw-shell/lib/containers/Activities/CollectionActivity'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import React, { Component } from 'react'
import { compose } from 'redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { withTheme } from '@material-ui/core/styles'

class Tasks extends Component {
  renderItem = (key, val) => {
    const { history } = this.props

    const { title = '', full_name = '', photoURL } = val

    return (
      <div key={key}>
        <ListItem onClick={() => history.push(`/tasks/edit/${key}`)} key={key}>
          <AltIconAvatar alt="task" src={photoURL} icon={<Delete />} />
          <ListItemText primary={title} secondary={full_name} style={{ minWidth: 120 }} />
        </ListItem>
        <Divider variant="inset" />
      </div>
    )
  }

  render() {
    const filterFields = [{ name: 'name' }, { name: 'full_name' }]

    return (
      <CollectionActivity
        name="tasks"
        createGrant="create_task"
        filterFields={filterFields}
        renderItem={this.renderItem}
      />
    )
  }
}

export default compose(
  injectIntl,
  withRouter,
  withTheme
)(Tasks)
