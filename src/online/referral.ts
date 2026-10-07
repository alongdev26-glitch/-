// Share with a friend: everyone has a personal link (?ref=CODE). When a brand-new
// player opens it, their phone writes referrals/CODE/<their device> to a small
// Firebase Realtime Database, and the sharer's phone collects 150 coins for each.
import { creditReferrals, getWallet, isNewPlayer, setPendingRef } from '../ui/shop';
import { t } from '../i18n';

/** The Firebase Realtime Database address (https://xxxx-default-rtdb.firebaseio.com). Empty = rewards off. */
export const FIREBASE_DB = 'https://big-dil-be1cd-default-rtdb.europe-west1.firebasedatabase.app';
/** where the requests go (tests point it elsewhere) */
export const config = { db: FIREBASE_DB };

/** The installed app's address: the link friends get. */
export const APP_URL = 'https://alongdev26-glitch.github.io/-1/';

const CODE_RE = /^[A-Z2-9]{6}$/;

/** Rewards work where the database can be reached: on the hosted app, not inside the claude.ai page. */
export const rewardsOn = () =>
  !!config.db && typeof location !== 'undefined' && !location.hostname.endsWith('claude.ai') && !location.hostname.endsWith('claudeusercontent.com');

// v= changes when the preview card changes, so WhatsApp fetches a fresh one
export const shareLink = () => `${APP_URL}?ref=${getWallet().refCode}&v=3`;


/** Open the phone's share sheet; fall back to WhatsApp. */
export async function share(): Promise<'shared' | 'whatsapp' | 'cancelled'> {
  const url = shareLink();
  try {
    if (navigator.share) {
      await navigator.share({ title: t('appName'), text: t('shareText'), url });
      return 'shared';
    }
  } catch {
    return 'cancelled';
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${t('shareText')} ${url}`)}`, '_blank');
  return 'whatsapp';
}

/** On start: if a new player came from a friend's link, remember the friend's code, and tidy the address bar. */
export function captureRef(href = location.href) {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return;
  }
  const code = url.searchParams.get('ref')?.toUpperCase();
  if (!code) return;
  const fresh = isNewPlayer();
  if (CODE_RE.test(code) && fresh) {
    const w = getWallet(); // makes this device's own id and code
    if (code !== w.refCode) setPendingRef(code);
  }
  url.searchParams.delete('ref');
  url.searchParams.delete('v');
  try {
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  } catch {
    /* not allowed here: fine */
  }
}

/** Tell the friend's code that I joined (retried on every start until it works). */
export async function reportPending(): Promise<boolean> {
  const w = getWallet();
  if (!w.pendingRef || !rewardsOn()) return false;
  try {
    const r = await fetch(`${config.db}/referrals/${w.pendingRef}/${w.deviceId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ t: Date.now() }),
    });
    if (r.ok) {
      setPendingRef(undefined);
      return true;
    }
  } catch {
    /* offline: try again next time */
  }
  return false;
}

/** Collect coins for friends who joined from my link. Returns how many new friends. */
export async function collectRewards(): Promise<number> {
  if (!rewardsOn()) return 0;
  try {
    const r = await fetch(`${config.db}/referrals/${getWallet().refCode}.json?shallow=true`);
    if (!r.ok) return 0;
    const data = (await r.json()) as Record<string, unknown> | null;
    return data ? creditReferrals(Object.keys(data)) : 0;
  } catch {
    return 0;
  }
}
