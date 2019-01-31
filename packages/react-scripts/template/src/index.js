import { render } from 'frint-react';
import Amplify from 'aws-amplify';

import awsConfig from './config/aws.config';
import serviceWorker from './config/serviceWorker';

import 'assets/index.css';
import Root from './app';

const apps = window.app || [];
const rootApp = (window.app = new Root());
rootApp.push = options => rootApp.registerApp(...options);
apps.forEach(rootApp.push);

Amplify.configure(awsConfig);

render(rootApp, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
