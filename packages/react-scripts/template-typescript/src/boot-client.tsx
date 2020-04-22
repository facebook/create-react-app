import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import createRoutes from './route';
import configureStore from './configureStore';
import { Provider } from "react-redux";
import { createBrowserHistory } from "history";
import { Router } from 'react-router-dom';
import IntlContainer from "./components/Elements/IntlContainer";
import { ConfigProvider } from 'antd';
import HttpManager from './http/HttpManager'
import '@babel/polyfill'

/**
 * resolve the issues that crash in browser which base on X5 kernel
 * see https://github.com/ant-design/ant-design-pro/issues/2149#issuecomment-418254535
 */
global.Intl = require('intl');
(window as any).Intl = require('intl');

const history = createBrowserHistory({ basename: "mesh-react-app" })

const store = configureStore(history);

const routes = createRoutes(store);

HttpManager.getInstance().init(store);

const render = () =>
{
	ReactDOM.render(
		<AppContainer>
			<Provider store={store}>
				<IntlContainer>
					<ConfigProvider autoInsertSpaceInButton={false}>
						<Router history={history} >{routes}</Router>
					</ConfigProvider>
				</IntlContainer>
			</Provider>
		</AppContainer>,
		document.getElementById('react-app')
	);
}

render();
