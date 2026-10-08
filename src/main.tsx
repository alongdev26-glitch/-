import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { captureRef } from './online/referral';
import { applyDocLang } from './i18n';

// came from a friend's share link? (before anything is saved on this device)
captureRef();
// the page direction and language follow the chosen language (rtl for Hebrew and Arabic)
applyDocLang();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Installable as an app on the hosted site; skipped inside the claude.ai page, which has no sw.js.
if ('serviceWorker' in navigator && location.hostname.endsWith('github.io')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
