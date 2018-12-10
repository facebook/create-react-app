import React from 'react';
import Hello from './Hello';
import Layout from './Layout';
import './App.css';

export default function App({ children }) {
  return (
    <Layout>
      <Hello />
    </Layout>
  );
}
