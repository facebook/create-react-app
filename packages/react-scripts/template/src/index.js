/*
 * This is the main entry point for the browser. It's pre-configured
 * to boot the Deskpro Apps system and render your App. You usually
 * don't need to modify this unless you want to add some special
 * bootup behaviour.
 */

import React from 'react';
import { bootReactApp } from '@deskpro/apps-sdk-react';
import './styles.css';
import App from './App';

bootReactApp(dpapp => <App />);
