import { MENU, DELIVERY_FEE, parseOrder, orderTotal } from './src/orders.js';

/* ---------- state ---------- */
const STATUSES = [
  { id: 'new', label: 'New', next: 'Start cooking', msg: null },
  { id: 'cooking', label: 'Cooking', next: 'Mark ready', msg: n => `Your order #${n} is being prepared 🍳` },
  { id: 'ready', label: 'Ready', next: 'Send rider', msg: n => `Order #${n} is packed and ready.` },
  { id: 'out', label: 'Out for delivery', next: 'Delivered', msg: n => `Your rider is on the way with order #${n} 🛵` }
];
const KEY = 'orderline.v1';
const now = () => Date.now();
const mins = m => now() - m * 60000;

function seed() {
  const mk = (n, items, address, status, placedMinAgo) => ({
    n, status, address, placed: mins(placedMinAgo), lines: items.map(([id, qty]) => ({ ...MENU.find(m => m.id === id), qty }))
  });
  return {
    nextN: 1043,
    delivered: [{ total: 2150 }, { total: 1890 }, { total: 3250 }, { total: 1200 }, { total: 2600 }, { total: 980 }, { total: 1750 }],
    orders: [
      mk(1042, [['zinger', 2], ['fries', 1]], 'Rafi Gardens', 'new', 1),
      mk(1041, [['pizza', 1], ['drink', 2]], 'Farid Town', 'cooking', 9),
      mk(1040, [['shawarma', 3]], 'Civil Lines', 'cooking', 14),
      mk(1039, [['beef', 2], ['wings', 1], ['drink', 2]], 'Jahaz Ground', 'ready', 21),
      mk(1038, [['burger', 4], ['fries', 2]], 'Officers Colony', 'out', 33)
    ],
    chat: [
      { dir: 'in', text: 'Assalam o alaikum! Welcome to Burger Point. Send your order in one message, for example "2 zinger burgers and 1 fries to Rafi Gardens".', t: mins(3) },
      { dir: 'out', text: '2 zinger burgers and 1 fries to Rafi Gardens', t: mins(1) },
      { dir: 'in', text: 'Order #1042 confirmed ✅\n2 × Zinger burger\n1 × Fries\nDelivery to Rafi Gardens\nTotal Rs 1,750, cash on delivery.', t: mins(1) }
    ]
  };
}
let state;
try { state = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { state = seed(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } };

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const rs = v => 'Rs ' + v.toLocaleString('en-PK');
const total = orderTotal;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clock = t => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function say(dir, text) { state.chat.push({ dir, text, t: now() }); save(); renderChat(); }

/* ---------- chat ---------- */
function handleMessage(text) {
  say('out', text);
  const { lines, address } = parseOrder(text);
  setTimeout(() => {
    if (!lines.length) { say('in', "Sorry, I couldn't find menu items in that message. Try something like \"1 pizza and 2 cokes to Farid Town\"."); return; }
    if (!address) { pending = lines; say('in', 'Got it. What is the delivery address?'); return; }
    placeOrder(lines, address);
  }, 600);
}
let pending = null;
function placeOrder(lines, address) {
  const o = { n: state.nextN++, status: 'new', address, placed: now(), lines };
  state.orders.unshift(o); pending = null;
  say('in', `Order #${o.n} confirmed ✅\n${lines.map(l => `${l.qty} × ${l.name}`).join('\n')}\nDelivery to ${address}\nTotal ${rs(total(o))}, cash on delivery.`);
  renderBoard(o.n);
}

$('#chatForm').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('#chatInput').value.trim(); if (!v) return;
  $('#chatInput').value = '';
  if (pending) { say('out', v); setTimeout(() => placeOrder(pending, v.replace(/\b\w/g, c => c.toUpperCase())), 500); return; }
  handleMessage(v);
});
const EXAMPLES = ['1 pizza and 2 cokes to Farid Town', 'three shawarmas', '2 beef burgers, wings and 2 drinks to Civil Lines'];
$('#chips').innerHTML = EXAMPLES.map(x => `<button class="chip" type="button">${esc(x)}</button>`).join('');
$('#chips').addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { $('#chatInput').value = c.textContent; $('#chatInput').focus(); } });

function renderChat() {
  const body = $('#chatBody');
  body.innerHTML = state.chat.map(m => `<div class="msg msg--${m.dir}">${esc(m.text)}<time>${clock(m.t)}</time></div>`).join('');
  body.scrollTop = body.scrollHeight;
}

/* ---------- kitchen board ---------- */
function renderBoard(highlight) {
  $('#cols').innerHTML = STATUSES.map((st, i) => {
    const list = state.orders.filter(o => o.status === st.id);
    return `<div class="col"><div class="col__head">${st.label}<span>${list.length}</span></div>` +
      (list.map(o => {
        const age = Math.floor((now() - o.placed) / 60000);
        return `<article class="ticket${o.n === highlight ? ' is-new' : ''}">
          <div class="ticket__top"><b>#${o.n}</b><span class="age${age >= 30 ? ' late' : ''}" data-placed="${o.placed}">${age} min</span></div>
          <ul>${o.lines.map(l => `<li><span>${l.qty} × ${esc(l.name)}</span><span>${rs(l.price * l.qty)}</span></li>`).join('')}</ul>
          <p class="addr">📍 ${esc(o.address)}</p>
          <div class="ticket__foot"><b>${rs(total(o))}</b><button class="adv" data-adv="${o.n}">${st.next}</button></div>
        </article>`;
      }).join('') || '<p class="empty">No orders</p>') + '</div>';
  }).join('');
  renderStats();
}
$('#cols').addEventListener('click', e => {
  const b = e.target.closest('[data-adv]'); if (!b) return;
  const o = state.orders.find(x => x.n === +b.dataset.adv);
  const i = STATUSES.findIndex(s => s.id === o.status);
  if (i === STATUSES.length - 1) {
    state.orders = state.orders.filter(x => x !== o); state.delivered.push({ total: total(o) });
    say('in', `Order #${o.n} delivered. Thank you for ordering from Burger Point! ⭐`);
  } else {
    o.status = STATUSES[i + 1].id;
    const msg = STATUSES[i + 1].msg; if (msg) say('in', msg(o.n));
  }
  save(); renderBoard();
});

function renderStats() {
  const all = [...state.delivered.map(d => d.total), ...state.orders.map(total)];
  const revenue = all.reduce((a, b) => a + b, 0);
  $('#stats').innerHTML = [
    ['Orders today', all.length],
    ['Revenue', rs(revenue)],
    ['Open tickets', state.orders.length],
    ['Average order', rs(Math.round(revenue / Math.max(1, all.length)))]
  ].map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');
}

$('#menuList').innerHTML = MENU.map(m => `<li>${m.name}<span>${rs(m.price)}</span></li>`).join('') + `<li>Delivery<span>${rs(DELIVERY_FEE)}</span></li>`;
$('#resetBtn').addEventListener('click', () => { state = seed(); pending = null; save(); renderChat(); renderBoard(); });
setInterval(() => document.querySelectorAll('.age').forEach(el => {
  const a = Math.floor((now() - +el.dataset.placed) / 60000); el.textContent = a + ' min'; el.classList.toggle('late', a >= 30);
}), 15000);

renderChat();
renderBoard();
