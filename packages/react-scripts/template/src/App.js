import React from 'react';
import Hello from './Hello';
import Layout from './Layout';
import './App.css';

let App = window.__assign(module, 'App', function App({ children }) {
  return (
    <Layout>
      <Hello />
    </Layout>
  );
});
module.hot.accept(['./Layout', './Hello'], window.__invalidate);

export default App;
