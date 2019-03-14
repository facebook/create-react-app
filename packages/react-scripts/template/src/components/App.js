import React from 'react'
import { Router, Link, NotFound, RequiresAuth } from '@fs/router'
import Home from './home/Home'
import UserInfo from './user/UserInfo'

function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="user">User Info</Link>
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
