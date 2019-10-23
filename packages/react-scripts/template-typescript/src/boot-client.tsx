import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import createRoutes from './routes';
import configureStore from './configureStore';

import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

export const store = configureStore();
const routes = createRoutes(store);

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <BrowserRouter>{routes}</BrowserRouter>
            </Provider>
        </AppContainer>,
        document.getElementById('react-app')
    );
}

render();