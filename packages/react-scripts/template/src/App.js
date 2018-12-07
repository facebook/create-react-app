import React from 'react';
import Hello from './Hello';
import Layout from './Layout';
import './App.css';

console.log('running App');

let App = window.__assign(module, 'App', function App({ children }) {
  return (
    <Layout>
      <Hello />
    </Layout>
  );
});
window.__commit(module);

export default App;
