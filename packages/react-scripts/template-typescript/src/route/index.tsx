
import * as React from 'react'
import { Store } from 'redux'
import { Route, Switch, Redirect } from 'react-router-dom'
import App from '../components/App'
import { URLS } from '../constants/urls'
import { Home, Error } from '../components/Pages'
import FilterRoute from './FilterRoute'

export default (store: Store<any>) => (
	<App>
		<FilterRoute>
			<div>
				<Switch>
					<Route path={URLS.ERROR} component={Error} />
					<Route path={URLS.HOME} component={Home} />
					<Redirect to={URLS.HOME} />
				</Switch>
			</div>

		</FilterRoute>
	</App>
);