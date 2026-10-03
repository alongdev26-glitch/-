import { createContext, useContext, useEffect, useState } from 'react';
import { getWallet, onWallet, type Wallet } from './shop';

/** Which players wear this device's skin, and which board design is on. */
interface Cosmetics {
  skinFor: (playerId: number) => string;
  board: string;
}

const Ctx = createContext<Cosmetics>({ skinFor: () => 'skin-none', board: 'board-classic' });

export const CosmeticsProvider = Ctx.Provider;
export const useCosmetics = () => useContext(Ctx);

/** The wallet, kept fresh when something is bought or equipped. */
export function useWallet(): Wallet {
  const [w, setW] = useState(getWallet);
  useEffect(() => onWallet(setW), []);
  return w;
}
