import React from 'react'
import { Router, Link, NotFound, RequiresAuth } from '@fs/zion-router'
import Subnav from '@fs/zion-subnav'
import { Trans } from 'react-i18next'
import Home from './home/Home'
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
        <Home path="/" />
        <RequiresAuth path="user" component={UserInfo} />
        <NotFound default />
      </Router>
    </>
  )
}
export default App
