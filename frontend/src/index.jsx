import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PortfolioProvider } from './context/PortfolioContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PortfolioProvider>
      <App />
    </PortfolioProvider>
  </React.StrictMode>
);