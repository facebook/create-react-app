import * as serviceWorker from 'rmw-shell/lib/utils/serviceWorker'
import React from 'react'
import ReactDOM from 'react-dom'
import Loadable from 'react-loadable'
import LoadingComponent from 'rmw-shell/lib/components/LoadingComponent'
//import App from './App'

const Loading = () => <LoadingComponent />
export const AppAsync = Loadable({
  loader: () => import('./App'),
  loading: Loading
})

ReactDOM.render(<AppAsync />, document.getElementById('root'))

serviceWorker.register({})
