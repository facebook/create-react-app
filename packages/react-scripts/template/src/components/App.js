import React from 'react'
import { Router, Link, NotFound, RequiresAuth } from '@fs/router'
import { Trans } from 'react-i18next'
import Home from './home/Home'
import UserInfo from './user/UserInfo'

function App() {
  return (
    <>
      <nav>
        <Link to="/"><Trans i18nkey="nav.home">Home</Trans></Link>
        <Link to="user"><Trans i18nkey="nav.userInfo">User Info</Trans></Link>
      </nav>

      <Router>
        <Home path="/" />
        <RequiresAuth path="/user" component={UserInfo} />
        <NotFound default />
      </Router>
    </>
  )
}
export default App
