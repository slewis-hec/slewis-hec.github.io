# How to update the site

Everything on the dashboard is drawn from **one file: `assets/data.js`**.
You never need to touch the HTML, CSS or JavaScript for a routine update.

## Monthly routine (15 to 30 minutes)

1. On GitHub, open `assets/data.js` and click the pencil icon (Edit).
2. Change the numbers:
   - `asOf`: today's date.
   - `performance`: portfolio and benchmark return since inception.
   - `allocation`: your weights and the benchmark weights. Each list should add up to 100.
   - Each open call: `currentPrice` and `indexCurrent`.
3. Click **Commit changes**. The site updates at the same link in a minute or two.

## Opening a new stock call

Copy an existing call block inside `calls: [ ... ]` and change every field.
`region` and `sector` must match an `id` from the allocation lists, so the
ticker shows up on the right bar of the dashboard.

## Closing a call

Never delete a call. Set `status: "closed"` and fill in `dateClosed`,
`closePrice`, `indexAtClose`, `closeReason`, `outcome` ("Hit" or "Miss"),
`whatHappened` and `lesson`. It moves to the Closed calls table automatically.

## Closing a macro call

Add a line to `macroCalls` with the call, dates, relative result (%),
outcome and a one-line note.

## Before launch

- Replace all sample data with your own numbers.
- Set `sampleData: false` to remove the yellow banner.
- Fill in `profile` (name, about sentences, email, LinkedIn).

## How returns are calculated

- Position return: stock return since the call. For a Sell (short) the sign is flipped.
- Relative return ("vs Index"): position return minus the index return for a Buy or Hold,
  index return minus stock return for a Sell.
- Hit rate: closed calls (stock and macro) marked "Hit" divided by all closed calls.

Tip: every commit is dated in the repository history, which is your proof
that past calls were never edited after the fact.
