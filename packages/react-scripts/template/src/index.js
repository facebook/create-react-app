import { render } from 'frint-react';
import Amplify from 'aws-amplify';

import 'assets/index.css';
import Root from './app';
import awsConfig from './config/aws.config';

const apps = window.app || [];
const rootApp = (window.app = new Root());
rootApp.push = options => app.registerApp(...options);
apps.forEach(app.push);

Amplify.configure(awsConfig);

render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
