import { BOARD, GROUP_COLORS, isOwnable, type Group } from '../data/board';

export interface SetInfo {
  key: string;
  title: string;
  color: string;
  ids: number[];
}

const GROUP_ORDER: Group[] = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkblue'];

/** All ownable spaces, grouped into color sets, then railways, then companies. */
export const SETS: SetInfo[] = [
  ...GROUP_ORDER.map((g) => {
    const ids = BOARD.filter((s) => s.group === g).map((s) => s.id);
    return { key: g, title: BOARD[ids[0]].city!, color: GROUP_COLORS[g], ids };
  }),
  {
    key: 'railroad',
    title: 'רכבות',
    color: '#333',
    ids: BOARD.filter((s) => s.kind === 'railroad').map((s) => s.id),
  },
  {
    key: 'utility',
    title: 'חברות',
    color: '#6b737c',
    ids: BOARD.filter((s) => s.kind === 'utility').map((s) => s.id),
  },
];

export const OWNABLE_COUNT = BOARD.filter(isOwnable).length;
