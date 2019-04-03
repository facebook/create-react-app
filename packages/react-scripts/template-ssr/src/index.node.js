import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import './index.css';
import App from './App';

const renderer = async (request, response) => {
  // The index.html file is a template, which will have environment variables
  // and bundled scripts and stylesheets injected during the build step, and
  // placed at the location specified by `process.env.HTML_TEMPLATE_PATH`.
  //
  // To customize the rendered HTML, you can add other placeholder strings,
  // and replace them within this function -- just as %RENDERED_CONTENT% is
  // replaced. Note however that if you name the placeholder after an
  // environment variable available at build time, then it will be
  // automatically replaced by the build script.
  let template = fs.readFileSync(process.env.HTML_TEMPLATE_PATH, 'utf8');
  let [header, footer] = template.split('%RENDERED_CONTENT%');
  let body = renderToString(<App />);
  let html = header + body + footer;
  response.send(html);
};

export default renderer;
