/* =====================================================================
   SITE DATA: the only file you edit for a routine update.
   Everything on the dashboard is drawn from the numbers below.
   See UPDATING.md for the step-by-step routine.

   !!! EVERYTHING BELOW IS SAMPLE DATA. Replace it with your own   !!!
   !!! numbers before launch, then set sampleData to false.        !!!
   ===================================================================== */

window.SITE = {
  // Shows the yellow "sample data" banner on every page while true.
  sampleData: true,

  profile: {
    name: "Samuel [Last name]",
    title: "Equity Research & Macro Asset Allocation",
    subtitle: "Bottom-up stock research and top-down allocation, tracked in one portfolio.",
    // Sentence 1: who you are. Sentence 2: why this site exists.
    about: [
      "[Placeholder] Who I am: school, program, and what I'm working toward.",
      "[Placeholder] Why I built this site: to show my work and track every call honestly."
    ],
    email: "",      // e.g. "you@example.com" (leave empty to hide)
    linkedin: ""    // full URL (leave empty to hide)
  },

  // Date the prices and weights below were last refreshed.
  asOf: "2026-11-27",

  // Paper portfolio performance since inception, in % (total return).
  performance: {
    inception: "2026-01-01",
    portfolio: 6.4,
    benchmark: 4.9,
    benchmarkName: "60/40 MSCI ACWI / US Aggregate Bond"
  },

  /* -------------------------------------------------------------------
     ALLOCATION. weight = your weight, benchmark = benchmark weight (%).
     Each list should add up to 100. "id" builds the link to the
     matching section of the Macro page (macro.html#region-us, etc.).
     ------------------------------------------------------------------- */
  allocation: {
    assetClasses: [
      { id: "equities",    name: "Equities",    weight: 65, benchmark: 60 },
      { id: "bonds",       name: "Bonds",       weight: 25, benchmark: 40 },
      { id: "commodities", name: "Commodities", weight: 5,  benchmark: 0  },
      { id: "cash",        name: "Cash",        weight: 5,  benchmark: 0  }
    ],
    // Inside the equity sleeve.
    regions: [
      { id: "us",      name: "United States", weight: 58, benchmark: 64 },
      { id: "canada",  name: "Canada",        weight: 8,  benchmark: 3  },
      { id: "europe",  name: "Europe",        weight: 14, benchmark: 12 },
      { id: "japan",   name: "Japan",         weight: 7,  benchmark: 5  },
      { id: "pacific", name: "Pacific ex-Japan", weight: 3, benchmark: 3 },
      { id: "em",      name: "Emerging Markets", weight: 10, benchmark: 13 }
    ],
    // Inside the equity sleeve.
    sectors: [
      { id: "tech",        name: "Info Tech",      weight: 22, benchmark: 25 },
      { id: "financials",  name: "Financials",     weight: 18, benchmark: 16 },
      { id: "industrials", name: "Industrials",    weight: 14, benchmark: 11 },
      { id: "health",      name: "Health Care",    weight: 9,  benchmark: 10 },
      { id: "discretionary", name: "Cons. Discretionary", weight: 9, benchmark: 11 },
      { id: "comms",       name: "Comm. Services", weight: 7,  benchmark: 8  },
      { id: "staples",     name: "Cons. Staples",  weight: 6,  benchmark: 6  },
      { id: "energy",      name: "Energy",         weight: 6,  benchmark: 4  },
      { id: "materials",   name: "Materials",      weight: 4,  benchmark: 4  },
      { id: "utilities",   name: "Utilities",      weight: 3,  benchmark: 3  },
      { id: "realestate",  name: "Real Estate",    weight: 2,  benchmark: 2  }
    ]
  },

  /* -------------------------------------------------------------------
     STOCK CALLS. rating: "Buy", "Hold" or "Sell" (a Sell is a short).
     region / sector must match an id above, so the company shows up on
     that bar. Prices in the stock's own currency.
     A call stays "open" until it is closed by a rule in the methodology
     (target hit, thesis broken, or 12 months up). To close one, set
     status to "closed" and fill the close fields. Never delete a call.
     ------------------------------------------------------------------- */
  calls: [
    {
      id: "exa", company: "Example Industrial Co.", ticker: "EXA", exchange: "TSX",
      region: "canada", sector: "industrials", rating: "Buy",
      dateOpened: "2026-03-15", priceAtCall: 40.00, target: 52.00, currentPrice: 46.10,
      indexName: "S&P/TSX Composite", indexAtCall: 24000, indexCurrent: 25300,
      thesis: "Sample thesis: margin recovery the market isn't pricing in.",
      status: "open"
    },
    {
      id: "exb", company: "Example Software Inc.", ticker: "EXB", exchange: "NASDAQ",
      region: "us", sector: "tech", rating: "Sell",
      dateOpened: "2026-06-02", priceAtCall: 120.00, target: 95.00, currentPrice: 112.50,
      indexName: "S&P 500", indexAtCall: 6100, indexCurrent: 6350,
      thesis: "Sample thesis: growth is slowing faster than consensus expects.",
      status: "open"
    },
    {
      id: "exc", company: "Example Bank plc", ticker: "EXC", exchange: "LSE",
      region: "europe", sector: "financials", rating: "Hold",
      dateOpened: "2026-09-10", priceAtCall: 8.00, target: 8.60, currentPrice: 7.70,
      indexName: "MSCI Europe", indexAtCall: 2200, indexCurrent: 2240,
      thesis: "Sample thesis: fairly valued; waiting for a better entry point.",
      status: "open"
    },
    {
      id: "exd", company: "Example Retail Corp.", ticker: "EXD", exchange: "TSX",
      region: "canada", sector: "discretionary", rating: "Buy",
      dateOpened: "2026-01-20", priceAtCall: 30.00, target: 36.00,
      indexName: "S&P/TSX Composite", indexAtCall: 23500,
      status: "closed", dateClosed: "2026-07-20", closePrice: 36.20, indexAtClose: 24400,
      closeReason: "Target reached",
      outcome: "Hit",
      whatHappened: "Sample: margins beat in Q2 and the stock re-rated to target.",
      lesson: "Sample: the catalyst came earlier than modeled."
    },
    {
      id: "exe", company: "Example Energy Ltd.", ticker: "EXE", exchange: "NYSE",
      region: "us", sector: "energy", rating: "Buy",
      dateOpened: "2026-02-05", priceAtCall: 55.00, target: 68.00,
      indexName: "S&P 500", indexAtCall: 5900,
      status: "closed", dateClosed: "2026-08-05", closePrice: 49.50, indexAtClose: 6200,
      closeReason: "Thesis broken",
      outcome: "Miss",
      whatHappened: "Sample: oil fell 15% and capex guidance went up.",
      lesson: "Sample: I underweighted commodity price risk in the thesis."
    }
  ],

  /* -------------------------------------------------------------------
     CLOSED MACRO / ALLOCATION CALLS: so the top-down side is held to
     account too. result = relative return of the call, in %.
     ------------------------------------------------------------------- */
  macroCalls: [
    { call: "Overweight US vs EAFE equities", region: "us", opened: "2026-01-01", closed: "2026-03-31",
      result: 2.1, outcome: "Hit", note: "Sample: US earnings revisions stayed stronger." },
    { call: "Underweight duration (short bonds vs long)", region: null, opened: "2026-02-01", closed: "2026-05-31",
      result: -1.3, outcome: "Miss", note: "Sample: growth scare pulled long yields down." }
  ]
};
