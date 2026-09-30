import { useState } from 'react';
import { newGame } from './engine/reducer';
import type { GameState } from './engine/types';
import { Game, loadGame, saveGame } from './screens/Game';
import { Menu } from './screens/Menu';
import { Online } from './screens/Online';
import { Setup } from './screens/Setup';

type Screen = { s: 'menu' } | { s: 'setup' } | { s: 'online' } | { s: 'game'; game: GameState; key: number };

export function App() {
  const [screen, setScreen] = useState<Screen>({ s: 'menu' });
  const saved = screen.s === 'menu' ? loadGame() : null;

  return (
    <>
      {screen.s === 'menu' && (
        <Menu
          onPlay={() => setScreen({ s: 'setup' })}
          onResume={saved ? () => setScreen({ s: 'game', game: saved, key: Date.now() }) : undefined}
        />
      )}
      {screen.s === 'setup' && (
        <Setup
          onBack={() => setScreen({ s: 'menu' })}
          onOnline={() => setScreen({ s: 'online' })}
          onStart={(players, rules) => setScreen({ s: 'game', game: newGame(players, Math.random, rules), key: Date.now() })}
        />
      )}
      {screen.s === 'online' && <Online onBack={() => setScreen({ s: 'setup' })} />}
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
