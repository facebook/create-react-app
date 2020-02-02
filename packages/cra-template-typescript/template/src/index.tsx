import 'reflect-metadata';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { resolveContainer } from "inversify-constructor-injection";
import { ClockService } from './services/clock-service';

resolveContainer().bind(ClockService).to(ClockService);

ReactDOM.render(<App />, document.getElementById('root'));
