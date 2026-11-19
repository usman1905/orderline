import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseOrder, orderTotal, DELIVERY_FEE } from '../src/orders.js';

const summary = text => Object.fromEntries(parseOrder(text).lines.map(l => [l.id, l.qty]));

test('reads digits and items', () => {
  assert.deepEqual(summary('2 zinger burgers and 1 fries'), { zinger: 2, fries: 1 });
});

test('reads number words and articles', () => {
  assert.deepEqual(summary('three shawarmas'), { shawarma: 3 });
  assert.deepEqual(summary('a burger and a coke'), { burger: 1, drink: 1 });
});

test('longest phrase wins, so a zinger burger is not also a burger', () => {
  assert.deepEqual(summary('1 zinger burger'), { zinger: 1 });
  assert.deepEqual(summary('1 beef burger and 1 burger'), { beef: 1, burger: 1 });
});

test('item without a number counts as one', () => {
  assert.deepEqual(summary('wings and 2 drinks'), { wings: 1, drink: 2 });
});

test('same item mentioned twice is added up', () => {
  assert.deepEqual(summary('2 fries and 1 fries'), { fries: 3 });
});

test('reads the delivery address after "to"', () => {
  assert.equal(parseOrder('1 pizza and 2 cokes to Farid Town').address, 'Farid Town');
  assert.equal(parseOrder('1 pizza').address, '');
});

test('punctuation and capitals do not matter', () => {
  assert.deepEqual(summary('2 Beef Burgers, Wings & 2 DRINKS!'), { beef: 2, wings: 1, drink: 2 });
});

test('messages with no menu items return nothing', () => {
  assert.deepEqual(parseOrder('hello, are you open?').lines, []);
});

test('quantity is capped to stop typos like 500 burgers', () => {
  assert.equal(summary('500 burgers').burger, 50);
});

test('total adds the delivery fee', () => {
  const o = { lines: parseOrder('2 zinger burgers and 1 fries').lines };
  assert.equal(orderTotal(o), 2 * 650 + 300 + DELIVERY_FEE);
});
