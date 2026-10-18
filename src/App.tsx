import { useState, type MouseEvent as ReactMouseEvent } from 'react';
import { DEFAULT_RULES, newGame } from './engine/reducer';
import { EDITIONS } from './data/editions';
import { TOKENS } from './ui/Token';
import { getName } from './ui/profile';
import { useWallet } from './ui/Cosmetics';
import type { GameState } from './engine/types';
import { Game, loadGame, saveGame } from './screens/Game';
import { Menu } from './screens/Menu';
import { Online } from './screens/Online';
import { Setup } from './screens/Setup';
import { Shop } from './screens/Shop';
import { sfx } from './ui/sound';
import { hasChosenLang, t, useLang } from './i18n';
import { Welcome } from './screens/Welcome';
import { Settings } from './screens/Settings';
import { Profile } from './screens/Profile';

/** A click sound for every button on the opening screens (the game screen has its own sounds). */
const tapSound = (e: ReactMouseEvent) => {
  if ((e.target as HTMLElement).closest('button')) sfx.tap();
};

type Screen =
  | { s: 'welcome' }
  | { s: 'menu' }
  | { s: 'settings' }
  | { s: 'profile' }
  | { s: 'setup' }
  | { s: 'online'; quick?: boolean }
  | { s: 'shop' }
  | { s: 'game'; game: GameState; key: number };

export function App() {
  // the first time ever: a short questionnaire (language, name)
  const [screen, setScreen] = useState<Screen>(() => (hasChosenLang() ? { s: 'menu' } : { s: 'welcome' }));
  // every screen re-renders in the new language when it changes
  const lang = useLang();
  const wallet = useWallet();
  const saved = screen.s === 'menu' ? loadGame() : null;

  return (
    <>
      <div className="intro-screens" key={lang} onClickCapture={screen.s === 'game' ? undefined : tapSound}>
        {screen.s === 'welcome' && <Welcome onDone={() => setScreen({ s: 'menu' })} />}
        {screen.s === 'settings' && <Settings onBack={() => setScreen({ s: 'menu' })} />}
        {screen.s === 'profile' && <Profile onBack={() => setScreen({ s: 'menu' })} />}
        {screen.s === 'menu' && (
          <Menu
            onPlay={() => setScreen({ s: 'setup' })}
            onShop={() => setScreen({ s: 'shop' })}
            onSettings={() => setScreen({ s: 'settings' })}
            onProfile={() => setScreen({ s: 'profile' })}
            onResume={saved ? () => setScreen({ s: 'game', game: saved, key: Date.now() }) : undefined}
          />
        )}
        {screen.s === 'setup' && (
          <Setup
            onBack={() => setScreen({ s: 'menu' })}
            onOnline={() => setScreen({ s: 'online' })}
            onQuick={() => setScreen({ s: 'online', quick: true })}
            onStart={(players, rules) => {
              sfx.start();
              setScreen({ s: 'game', game: newGame(players, Math.random, rules, lang), key: Date.now() });
            }}
          />
        )}
        {screen.s === 'online' && (
          <Online
            quick={screen.quick}
            onBack={() => setScreen({ s: 'setup' })}
            onBotGame={() => {
              // nobody free for 1v1: me against one bot
              const me = getName() || t('player');
              const bot = TOKENS.find((tk) => tk.id !== wallet.char)!;
              sfx.start();
              setScreen({
                s: 'game',
                game: newGame(
                  [
                    { name: me, token: wallet.char, isBot: false },
                    { name: EDITIONS[lang].bots[0], token: bot.id, isBot: true },
                  ],
                  Math.random,
                  DEFAULT_RULES,
                  lang,
                ),
                key: Date.now(),
              });
            }}
          />
        )}
        {screen.s === 'shop' && <Shop onBack={() => setScreen({ s: 'menu' })} />}
      </div>
      {screen.s === 'game' && (
        <Game
          key={screen.key}
          initial={screen.game}
          onExit={() => setScreen({ s: 'menu' })}
          onNewGame={() => {
            saveGame(null);
            setScreen({ s: 'setup' });
          }}
        />
      )}
    </>
  );
}
