import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Resource from '@guestyci/agni';
import { BrowserRouter as Router } from 'react-router-dom';
import '@guestyci/foundation/style/styles.css';
import App from './app/App';
import configureStore from './store';
import * as serviceWorker from './serviceWorker';

//This is your main project entry
//Add the global css and the required initializations here

//Create a global api to be injected into thunk middleware
//for further customization check https://github.com/guestyorg/agni
const { api } = Resource.createWithDomain();
//Configure your redux store with your initial stare and global api
//Store is configured with thunk as its default middleware
configureStore({}, api);
ReactDOM.render(
  <Provider store={configureStore({}, api)}>
    <Router>
      <App />
    </Router>
  </Provider>,

  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
