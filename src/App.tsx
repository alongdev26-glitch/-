import { useState, type MouseEvent as ReactMouseEvent } from 'react';
import { newGame } from './engine/reducer';
import type { GameState } from './engine/types';
import { Game, loadGame, saveGame } from './screens/Game';
import { Menu } from './screens/Menu';
import { Online } from './screens/Online';
import { Setup } from './screens/Setup';
import { Shop } from './screens/Shop';
import { sfx } from './ui/sound';

/** A click sound for every button on the opening screens (the game screen has its own sounds). */
const tapSound = (e: ReactMouseEvent) => {
  if ((e.target as HTMLElement).closest('button')) sfx.tap();
};

type Screen = { s: 'menu' } | { s: 'setup' } | { s: 'online' } | { s: 'shop' } | { s: 'game'; game: GameState; key: number };

export function App() {
  const [screen, setScreen] = useState<Screen>({ s: 'menu' });
  const saved = screen.s === 'menu' ? loadGame() : null;

  return (
    <>
      <div className="intro-screens" onClickCapture={screen.s === 'game' ? undefined : tapSound}>
        {screen.s === 'menu' && (
          <Menu
            onPlay={() => setScreen({ s: 'setup' })}
            onShop={() => setScreen({ s: 'shop' })}
            onResume={saved ? () => setScreen({ s: 'game', game: saved, key: Date.now() }) : undefined}
          />
        )}
        {screen.s === 'setup' && (
          <Setup
            onBack={() => setScreen({ s: 'menu' })}
            onOnline={() => setScreen({ s: 'online' })}
            onStart={(players, rules) => {
              sfx.start();
              setScreen({ s: 'game', game: newGame(players, Math.random, rules), key: Date.now() });
            }}
          />
        )}
        {screen.s === 'online' && <Online onBack={() => setScreen({ s: 'setup' })} />}
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
