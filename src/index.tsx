// CryptoSense Dashboard - Application Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { IntegratedDashboard } from './components/IntegratedDashboard';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <IntegratedDashboard />
  </React.StrictMode>
);