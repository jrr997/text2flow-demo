import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ReactFlowProvider } from '@xyflow/react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);
