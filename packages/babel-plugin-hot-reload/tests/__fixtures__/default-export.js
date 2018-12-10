import React from 'react';
import Hello from './components/Hello';
import Layout from './components/Layout';
import './App.css';

export default function App({ children }) {
  return (
    <Layout>
      <Hello />
    </Layout>
  );
}

module.hot.accept(['./Layout', './Hello'], window.__invalidate);
