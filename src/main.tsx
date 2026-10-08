import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { captureRef } from './online/referral';
import { applyDocLang } from './i18n';
import { applySmooth } from './ui/smooth';

// came from a friend's share link? (before anything is saved on this device)
captureRef();
// the page direction and language follow the chosen language (rtl for Hebrew and Arabic)
applyDocLang();
// smooth mode, if this phone turned it on
applySmooth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Installable as an app on the hosted site; skipped inside the claude.ai page, which has no sw.js.
if ('serviceWorker' in navigator && location.hostname.endsWith('github.io')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// An app opened from the home screen can keep an old version in memory for days. When it
// comes back to the front, check whether a newer build was published and reload into it.
if (location.hostname.endsWith('github.io')) {
  const current = document.querySelector<HTMLScriptElement>('script[src*="assets/index-"]')?.src.match(/index-[\w-]+\.js/)?.[0];
  const check = () =>
    fetch('./', { cache: 'no-store' })
      .then((r) => r.text())
      .then((html) => {
        const latest = html.match(/index-[\w-]+\.js/)?.[0];
        if (current && latest && latest !== current) location.reload();
      })
      .catch(() => {});
  check();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });
}
