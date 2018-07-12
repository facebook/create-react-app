import React from 'react'
import ReactDOM from 'react-dom'
import Loadable from 'react-loadable'
import LoadingComponent from 'rmw-shell/lib/components/LoadingComponent'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import registerServiceWorker from 'rmw-shell/lib/utils/registerServiceWorker'
import A2HSProvider from 'a2hs'

const MainAsync = Loadable({
  loader: () => import('../src/containers/Main'),
  loading: () => <LoadingComponent />
});

const LPAsync = Loadable({
  loader: () => import('../src/pages/LandingPage'),
  loading: () => <LoadingComponent />
});

ReactDOM.render(
  <A2HSProvider>
    <Router>
      <Switch>
        <Route path='/' exact component={LPAsync} />
        <Route component={MainAsync} />
      </Switch>
    </Router>
  </A2HSProvider>
  , document.getElementById('root')
  , () => {
    setTimeout(() => {
      MainAsync.preload()
    }, 1500)
  }
)


registerServiceWorker()
