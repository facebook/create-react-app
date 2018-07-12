import App from 'rmw-shell'
import React, { Component } from 'react'
import config from '../../config'
import configureStore from '../../store'
import locales from '../../config/locales'
import { Helmet } from 'react-helmet'
import { addLocalizationData } from 'rmw-shell/lib/config/locales'
import { withA2HS } from 'a2hs'

addLocalizationData(locales)

class Main extends Component {
  componentDidMount () {
    // const { setA2HPState } = this.props
    // console.log(this.props)
    // setA2HPState({ isAppInstallable: true })
  }

  render () {
    return <div>
      <Helmet>
        <link async type='text/css' rel='stylesheet' href='https://cdn.firebase.com/libs/firebaseui/3.0.0/firebaseui.css' />
        <link async rel='stylesheet' href='https://fonts.googleapis.com/icon?family=Material+Icons' />
        <link async rel='stylesheet' href='index.css' />
      </Helmet>

      <App appConfig={{ configureStore, ...config }} />

    </div>
  }
}

export default withA2HS(Main)
