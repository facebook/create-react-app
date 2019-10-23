import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import createRoutes from './routes';
import configureStore from './configureStore';

import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

export const store = configureStore();
const routes = createRoutes(store);

require('cesium/Source/Widgets/widgets.css');

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

// @todo - temp solution for BD and PM team to add configuration, need to remove when this become part of our features
(window as any).addProjectionConfig = (projectionKey: string, projectionName: string, projectionSettings) =>
{
    store.dispatch(new AddAvailableCoordinateAction({
        name: projectionName,
        key: projectionKey,
    }));
    proj4.defs(projectionKey,projectionSettings);
}