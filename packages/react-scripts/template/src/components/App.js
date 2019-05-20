import React from 'react'
import { Router, Link, RequiresAuth } from '@fs/zion-router'
import Subnav from '@fs/zion-subnav'
import { Trans } from 'react-i18next'
import ExamplePage from './example/ExamplePage'
import UserInfo from './user/UserInfo'

function App() {
  return (
    <>
      <Subnav>
        <Link to="./">
          <Trans i18nKey="nav.home">Home</Trans>
        </Link>
        <Link to="user">
          <Trans i18nKey="nav.userInfo">User Info</Trans>
        </Link>
      </Subnav>

      <Router>
        <ExamplePage path="/" />
        <RequiresAuth path="user" component={UserInfo} />
      </Router>
    </>
  )
}
export default App
