import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { captureRef } from './online/referral';

// came from a friend's share link? (before anything is saved on this device)
captureRef();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Installable as an app on the hosted site; skipped inside the claude.ai page, which has no sw.js.
if ('serviceWorker' in navigator && location.hostname.endsWith('github.io')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
