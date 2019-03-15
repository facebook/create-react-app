import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { UserProvider } from '@fs/user'
import RootErrorBoundary from '@fs/error-boundary'
import { I18nProvider, addTranslations } from '@fs/locale'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import translations from './locales'

addTranslations(translations)

const FrontierRoot = () => (
  <RootErrorBoundary>
    <Suspense fallback="Loading ...">
      <I18nProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </I18nProvider>
    </Suspense>
  </RootErrorBoundary>
)

ReactDOM.render(<FrontierRoot />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
