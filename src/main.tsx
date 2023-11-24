import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

CapacitorUpdater.notifyAppReady();


const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);