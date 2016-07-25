import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'fs';

import App from '../client/App.js';
import template from './template.js';

const isDevelopment = () => process.env.NODE_ENV === 'development';

const config = !isDevelopment() ? JSON.parse(fs.readFileSync('./build/client/stats.json', { encoding: 'utf8' })) : null;

const jsPath = config ? config.main.find(fileName => fileName.endsWith('.js')) : '/bundle.js';
const cssPath = config ? config.main.find(fileName => fileName.endsWith('.css')) : null;

const server = express();
server.use('/', express.static('build/client'));
server.get('*', (req, res) => res
  .send(template(renderToString(<App />), jsPath, cssPath)));

const port = process.env.NODE_ENV === 'development' ? 3001 : 3000;
server.listen(port);

