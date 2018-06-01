import React from 'react'
import ReactDOM from 'react-dom'
import Loadable from 'react-loadable'
import LoadingComponent from 'rmw-shell/lib/components/LoadingComponent'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import registerServiceWorker from 'rmw-shell/lib/registerServiceWorker'

const MainAsync = Loadable({
  loader: () => import('./Main'),
  loading: () => <LoadingComponent />
});

const LPAsync = Loadable({
  loader: () => import('./LandingPage'),
  loading: () => <LoadingComponent />
});

ReactDOM.render(
  <Router>
    <Switch>
      <Route path='/' exact component={LPAsync} />
      <Route component={MainAsync} />
    </Switch>
  </Router>
  , document.getElementById('root')
  , () => {
    setTimeout(() => {
      MainAsync.preload()
    }, 1500)
  }
)


registerServiceWorker()
