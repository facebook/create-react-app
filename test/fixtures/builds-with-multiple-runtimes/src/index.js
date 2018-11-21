import React from 'react';
import dva from 'dva';
import createHistory from 'history/createHashHistory';
import ky from 'ky';

const app = dva({ history: createHistory() });
app.router(() => {
  ky.get('https://canihazip.com/s')
    .then(r => r.text())
    .then(console.log, console.error)
    .then(() => console.log('ok'));
  return <div>Test</div>;
});
app.start('#root');
