// Menu, order parser and pricing. Pure functions, used by the app and the tests.
/* ---------- menu and parser ---------- */
export const MENU = [
  { id: 'zinger', name: 'Zinger burger', price: 650, words: ['zinger', 'zingers', 'zinger burger', 'zinger burgers'] },
  { id: 'beef', name: 'Beef burger', price: 750, words: ['beef burger', 'beef burgers', 'beef'] },
  { id: 'burger', name: 'Chicken burger', price: 550, words: ['burger', 'burgers', 'chicken burger', 'chicken burgers'] },
  { id: 'shawarma', name: 'Chicken shawarma', price: 350, words: ['shawarma', 'shawarmas'] },
  { id: 'pizza', name: 'Pizza (medium)', price: 1450, words: ['pizza', 'pizzas'] },
  { id: 'fries', name: 'Fries', price: 300, words: ['fries', 'fry', 'chips'] },
  { id: 'wings', name: 'Hot wings (6)', price: 690, words: ['wings', 'hot wings'] },
  { id: 'drink', name: 'Soft drink', price: 150, words: ['drink', 'drinks', 'coke', 'cokes', 'pepsi', 'sprite'] }
];
export const NUMBER_WORDS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
export const DELIVERY_FEE = 150;

// Longest phrases first, so "zinger burger" wins over "burger".
export const PHRASES = MENU.flatMap(m => m.words.map(w => ({ w, m }))).sort((a, b) => b.w.length - a.w.length);

export function parseOrder(text) {
  let s = ' ' + text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
  let address = '';
  const addr = s.match(/ (?:to|at|deliver to|address) ([a-z0-9 ]{3,})$/);
  if (addr) { address = addr[1].trim(); s = s.slice(0, addr.index) + ' '; }
  const items = {};
  for (const { w, m } of PHRASES) {
    const re = new RegExp(`(?:(\\d+|${Object.keys(NUMBER_WORDS).join('|')}) )?${w.replace(/ /g, ' ')}(?= )`, 'g');
    s = s.replace(re, (full, n) => {
      const qty = n ? (NUMBER_WORDS[n] || parseInt(n, 10)) : 1;
      items[m.id] = (items[m.id] || 0) + Math.min(qty, 50);
      return ' ';
    });
  }
  const lines = Object.entries(items).map(([id, qty]) => ({ ...MENU.find(m => m.id === id), qty }));
  return { lines, address: address.replace(/\b\w/g, c => c.toUpperCase()) };
}

/** Order total in rupees, including the delivery fee. */
export const orderTotal = o => o.lines.reduce((s, l) => s + l.price * l.qty, 0) + DELIVERY_FEE;
