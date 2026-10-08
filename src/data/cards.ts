export type CardEffect =
  | { type: 'move'; to: number }
  | { type: 'back'; steps: number }
  | { type: 'nearest'; kind: 'railroad' | 'utility' }
  | { type: 'money'; amount: number }
  | { type: 'payEach'; amount: number }
  | { type: 'collectEach'; amount: number }
  | { type: 'repairs'; house: number; hotel: number }
  | { type: 'gotojail' }
  | { type: 'jailfree' };

export type Deck = 'chance' | 'chest';

export interface Card {
  text: string;
  effect: CardEffect;
}

// Our own decks. The text of each card comes from the edition in play (data/editions.ts),
// filled in from the effect, so amounts and places always match the rules.
const card = (effect: CardEffect): Card => ({ text: '', effect });

export const CHANCE: Card[] = [
  card({ type: 'move', to: 0 }), // taxi to the start
  card({ type: 'move', to: 24 }), // weekend trip
  card({ type: 'move', to: 11 }), // a concert in town
  card({ type: 'nearest', kind: 'utility' }), // a visit to the utility office
  card({ type: 'nearest', kind: 'railroad' }), // catch a train
  card({ type: 'money', amount: 60 }), // a winning scratch card
  card({ type: 'jailfree' }), // a lawyer friend
  card({ type: 'back', steps: 2 }), // forgot your keys
  card({ type: 'gotojail' }), // caught crossing on red
  card({ type: 'repairs', house: 30, hotel: 110 }), // the roof leaks
  card({ type: 'money', amount: -20 }), // a parking ticket
  card({ type: 'move', to: 15 }), // a train trip
  card({ type: 'move', to: 38 }), // shopping on the top street
  card({ type: 'payEach', amount: 40 }), // you threw a party
  card({ type: 'money', amount: 120 }), // your app went viral
  card({ type: 'collectEach', amount: 15 }), // crowdfunding
  card({ type: 'money', amount: 50 }), // returned a lost wallet
  card({ type: 'move', to: 31 }), // visiting a friend
  card({ type: 'back', steps: 3 }), // a wrong turn
  card({ type: 'money', amount: -50 }), // a speeding ticket
  card({ type: 'collectEach', amount: 10 }), // sold cookies
  card({ type: 'move', to: 4 }), // breakfast in town
];

export const CHEST: Card[] = [
  card({ type: 'move', to: 0 }), // a free bus to the start
  card({ type: 'money', amount: 150 }), // won a cooking contest
  card({ type: 'money', amount: -60 }), // the dentist
  card({ type: 'money', amount: 40 }), // sold your old bike
  card({ type: 'jailfree' }),
  card({ type: 'gotojail' }),
  card({ type: 'money', amount: 90 }), // a bonus at work
  card({ type: 'money', amount: 25 }), // money in an old coat
  card({ type: 'collectEach', amount: 20 }), // your birthday
  card({ type: 'money', amount: 110 }), // a savings plan matures
  card({ type: 'money', amount: -90 }), // the car needs fixing
  card({ type: 'money', amount: -40 }), // gym membership
  card({ type: 'money', amount: 30 }), // babysitting
  card({ type: 'repairs', house: 35, hotel: 100 }), // home renovation
  card({ type: 'money', amount: 15 }), // won a raffle
  card({ type: 'money', amount: 80 }), // a gift from grandma
  card({ type: 'money', amount: 100 }), // an inheritance
  card({ type: 'money', amount: -30 }), // the vet
  card({ type: 'money', amount: 20 }), // bottle deposit
  card({ type: 'payEach', amount: 10 }), // pizza for everyone
  card({ type: 'money', amount: -70 }), // a cracked phone screen
  card({ type: 'money', amount: 60 }), // sold a painting
];

export const DECKS: Record<Deck, Card[]> = { chance: CHANCE, chest: CHEST };
