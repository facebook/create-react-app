import React from 'react';
import ReactDOM from 'react-dom';
// Include the default polyfills to enable modern javascript features
// in legacy browsers. Learn more: http://bit.ly/2Bt1Yjk
import './polyfills';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
