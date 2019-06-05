import React from 'react'
import { Link, Switch, Route, AuthRoute, NotFound } from '@fs/zion-router'
import Subnav from '@fs/zion-subnav'
import { Trans } from 'react-i18next'

// Dynamically load components to reduce bundle size
// https://reactjs.org/docs/react-api.html#reactlazy
const ExamplePage = React.lazy(() => import('./components/example/ExamplePage'))
const UserInfo = React.lazy(() => import('./components/user/UserInfo'))

function App() {
  return (
    <>
      <Subnav>
        <Link to="./">
          <Trans i18nKey="nav.home">Home</Trans>
        </Link>
        <Link to="/user">
          <Trans i18nKey="nav.userInfo">User Info</Trans>
        </Link>
      </Subnav>

      <Switch>
        <Route exact path="/" component={ExamplePage} />
        <AuthRoute path="/user" component={UserInfo} />
        <Route component={NotFound} />
      </Switch>
    </>
  )
}
export default App
