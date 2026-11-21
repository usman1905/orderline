<p align="center"><img src="https://usman1905.github.io/logos/orderline.webp" alt="OrderLine logo" width="140"></p>

<h1 align="center">OrderLine</h1>

<p align="center">Chat-based ordering for small restaurants. A customer sends one message, the kitchen gets a ticket, and the customer is updated at every step.</p>

**Live demo:** [usman1905.github.io/orderline](https://usman1905.github.io/orderline/)

[![Tests](https://github.com/usman1905/orderline/actions/workflows/ci.yml/badge.svg)](https://github.com/usman1905/orderline/actions/workflows/ci.yml)

## What it does

- Reads a plain chat message such as `2 zinger burgers and 1 fries to Rafi Gardens` and turns it into an order
- Understands quantities as digits or words, plurals and short forms like `coke` for soft drink
- Asks for the delivery address when the message has none
- Confirms the order with an itemised total and cash on delivery
- Kitchen board with New, Cooking, Ready and Out for delivery columns
- Moving a ticket forward sends the matching status message to the customer
- Ticket age turns red after 30 minutes so late orders stand out
- Live totals: orders today, revenue, open tickets and average order value

The chat panel is a preview of the customer side. Data is stored in the browser with `localStorage`; use **Reset demo** to restore the sample day.

## Tech

Plain HTML, CSS and JavaScript, no framework.

| Path | Purpose |
| --- | --- |
| `index.html` | Chat panel, kitchen board and menu |
| `style.css` | Kitchen display styling, responsive layout |
| `app.js` | User interface: rendering, events and storage |
| `src/orders.js` | Menu, chat message parser and order pricing (no DOM, fully tested) |
| `tests/orders.test.js` | 10 tests for the order parser and totals |
| `.github/workflows/ci.yml` | Runs the tests on every push |

The parser matches the longest menu phrase first, so `zinger burger` is never counted as a plain `burger`.

## Run locally

The app uses ES modules, so serve the folder rather than opening the file directly:

```bash
npm start
```

Then open the address it prints.

## Tests

Needs Node.js 18 or newer. No dependencies to install.

```bash
npm test
```

## Roadmap

- Connect the WhatsApp Business Cloud API through a Node.js webhook
- Rider assignment and live location
- End-of-day sales report export

## License

MIT. Built by [Usman](https://usman1905.github.io).
