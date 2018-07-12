import React, { Component } from 'react'
import IconButton from '@material-ui/core/IconButton'
import { injectIntl, intlShape } from 'react-intl'
import { GitHubIcon } from 'rmw-shell/lib/components/Icons'
import Activity from 'rmw-shell/lib/containers/Activity'
import Scrollbar from 'rmw-shell/lib/components/Scrollbar'

class About extends Component {
  // Sorry for using setState here but I have to remove 'marked' from the dependencies
  // because of a vulnerability issue
  constructor (props) {
    super(props)
    this.state = {
      text: ''
    }
  }

  render () {
    const { intl } = this.props

    return (
      <Activity
        appBarContent={
          <IconButton

            href='https://github.com/TarikHuber/react-most-wanted'
            target='_blank'
            rel='noopener'
          >
            <GitHubIcon />
          </IconButton>
        }
        title={intl.formatMessage({ id: 'about' })}>

        <Scrollbar>
          <div style={{ backgroundColor: 'white', padding: 5 }} />
        </Scrollbar>

      </Activity>
    )
  }
}

About.propTypes = {
  intl: intlShape.isRequired
}

export default injectIntl(About)
