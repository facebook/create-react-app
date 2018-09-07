import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Main from '../containers/main'

const Routes = () => (
  <Router>
    <div>
      <Route path="/" component={Main} />
    </div>
  </Router>
)

export default Routes
