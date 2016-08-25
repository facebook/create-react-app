import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';

import AppIntro from './components/AppIntro'
import SampleComponent from './components/SampleComponent'


import App from './App';
import './index.css';

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={AppIntro}></IndexRoute>
            <Route path="samplecomponent" component={SampleComponent}></Route>
        </Route>
    </Router>
), document.getElementById('root'));
