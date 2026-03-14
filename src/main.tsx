import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { ensureDemoSession } from './app/lib/demoMode';
import './styles/index.css';

ensureDemoSession();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
