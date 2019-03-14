import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { UserProvider } from '@fs/user'
import RootErrorBoundary from '@fs/error-boundary'
import App from './components/App'
import * as serviceWorker from './serviceWorker'

const FrontierRoot = () => (
  <RootErrorBoundary>
    <Suspense>
      <UserProvider>
        <App />
      </UserProvider>
    </Suspense>
  </RootErrorBoundary>
)

ReactDOM.render(<FrontierRoot />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
