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
  navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => {
      // coming back to the app checks for a new version
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    })
    .catch(() => {});
  // a new version took over: load it (once)
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded || !navigator.serviceWorker.controller) return;
    reloaded = true;
    location.reload();
  });
}

// A file of an older version went missing after an update: reload once to get the new one.
window.addEventListener('vite:preloadError', (e) => {
  try {
    if (sessionStorage.getItem('dc-reloaded')) return;
    sessionStorage.setItem('dc-reloaded', '1');
  } catch {
    return;
  }
  e.preventDefault();
  location.reload();
});
window.addEventListener('load', () => {
  // a good load clears the guard, so a later update can reload again
  setTimeout(() => {
    try {
      sessionStorage.removeItem('dc-reloaded');
    } catch {
      /* storage off */
    }
  }, 10000);
});
