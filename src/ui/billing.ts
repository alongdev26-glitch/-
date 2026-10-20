// Buying diamonds with Google Play Billing, for the app installed from Google Play (a Trusted Web
// Activity built with Play Billing on). Google shows its own payment sheet and takes the payment;
// the page never sees card details. Outside the Play app none of this exists and the shop says so.
import { addBoughtGems } from './shop';

const PLAY = 'https://play.google.com/billing';

/** The in-app products to create in the Play Console (Monetize → In-app products), as consumables. */
export const PACK_IDS = ['gems_5000', 'gems_15000', 'gems_50000', 'gems_150000'] as const;
export const PACK_GEMS: Record<string, number> = { gems_5000: 5000, gems_15000: 15000, gems_50000: 50000, gems_150000: 150000 };

interface ItemDetails {
  itemId: string;
  title: string;
  price: { currency: string; value: string };
}
interface Purchase {
  itemId: string;
  purchaseToken: string;
}
interface DigitalGoodsService {
  getDetails(ids: string[]): Promise<ItemDetails[]>;
  listPurchases(): Promise<Purchase[]>;
  consume(token: string): Promise<void>;
}
declare global {
  interface Window {
    getDigitalGoodsService?: (provider: string) => Promise<DigitalGoodsService>;
  }
}

let service: Promise<DigitalGoodsService | null> | null = null;

/** Google Play's billing, or null when this isn't the app from Google Play. */
export function billing(): Promise<DigitalGoodsService | null> {
  service ??= (async () => {
    if (!window.getDigitalGoodsService || typeof PaymentRequest === 'undefined') return null;
    try {
      return await window.getDigitalGoodsService(PLAY);
    } catch {
      return null;
    }
  })();
  return service;
}

/** The prices Google shows in the player's own currency, e.g. { gems_5000: '₪4.90' }. */
export async function packPrices(): Promise<Record<string, string>> {
  const s = await billing();
  if (!s) return {};
  try {
    const items = await s.getDetails([...PACK_IDS]);
    const out: Record<string, string> = {};
    for (const it of items) {
      out[it.itemId] = new Intl.NumberFormat(undefined, { style: 'currency', currency: it.price.currency }).format(Number(it.price.value));
    }
    return out;
  } catch {
    return {};
  }
}

/** Turn a paid purchase into diamonds, then tell Google it's used so it can be bought again. */
async function deliver(s: DigitalGoodsService, p: Purchase): Promise<number> {
  const gems = PACK_GEMS[p.itemId] ?? 0;
  if (!gems) return 0;
  const added = addBoughtGems(p.purchaseToken, gems);
  try {
    await s.consume(p.purchaseToken);
  } catch {
    /* consumed next time the app opens */
  }
  return added ? gems : 0;
}

export type BuyResult = { ok: true; gems: number } | { ok: false; cancelled: boolean };

/** Open Google Play's payment sheet for one pack. */
export async function buyPack(itemId: string): Promise<BuyResult> {
  const s = await billing();
  if (!s) return { ok: false, cancelled: false };
  try {
    const request = new PaymentRequest([{ supportedMethods: PLAY, data: { sku: itemId } }], {
      // the real amount comes from the Play Console; this is required but not used
      total: { label: 'Total', amount: { currency: 'USD', value: '0' } },
    });
    const response = await request.show();
    const { purchaseToken } = response.details as { purchaseToken: string };
    await response.complete('success');
    const gems = await deliver(s, { itemId, purchaseToken });
    return { ok: true, gems: gems || PACK_GEMS[itemId] };
  } catch (e) {
    return { ok: false, cancelled: (e as Error)?.name === 'AbortError' };
  }
}

/** Purchases that were paid but not delivered (the app closed in the middle): deliver them now. */
export async function restorePurchases(): Promise<number> {
  const s = await billing();
  if (!s) return 0;
  try {
    let total = 0;
    for (const p of await s.listPurchases()) total += await deliver(s, p);
    return total;
  } catch {
    return 0;
  }
}
