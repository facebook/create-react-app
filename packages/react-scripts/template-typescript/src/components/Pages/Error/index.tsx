
import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { URLS } from '../../../constants/urls'
import styles from '../../../styles/pages/error/index.module.scss'
import NotFound from './NotFound'

export default class Error extends React.PureComponent<{}, {}>
{
	public render()
	{
		return (
			<section className={`${styles.errorpage}`}>
				<Switch>
					<Route path={URLS.NOT_FOUND} component={NotFound} />
					<Redirect to={URLS.NOT_FOUND} />
				</Switch>
			</section>
		);
	}
}