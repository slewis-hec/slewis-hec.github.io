/* Rendering code. You normally never need to edit this file:
   update assets/data.js instead (see UPDATING.md). */
(function () {
  "use strict";
  var S = window.SITE;

  /* ---------- helpers ---------- */
  function $(sel) { return document.querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pct(x, dp) {
    if (x == null || isNaN(x)) return "–";
    var d = dp == null ? 1 : dp;
    return (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(d) + "%";
  }
  function pp(x) { return (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(0) + " pp"; }
  function cls(x) { return x > 0 ? "pos" : x < 0 ? "neg" : "zero"; }
  function fmtDate(iso) {
    if (!iso) return "–";
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function money(x) { return x == null ? "–" : x.toFixed(2); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function stance(active) {
    if (active >= 1) return '<span class="stance ow">Overweight ' + pp(active) + "</span>";
    if (active <= -1) return '<span class="stance uw">Underweight ' + pp(active) + "</span>";
    return '<span class="stance n">Neutral</span>';
  }
  function ratingBadge(r) { return '<span class="badge ' + esc(r.toLowerCase()) + '">' + esc(r) + "</span>"; }
  function outcomeBadge(o) { return o ? '<span class="badge ' + esc(o.toLowerCase()) + '">' + esc(o) + "</span>" : "–"; }

  /* ---------- call maths ---------- */
  // Position return: a Sell (short) gains when the stock falls.
  function callStats(c) {
    var end = c.status === "closed" ? c.closePrice : c.currentPrice;
    var idxEnd = c.status === "closed" ? c.indexAtClose : c.indexCurrent;
    var stock = (end / c.priceAtCall - 1) * 100;
    var index = (idxEnd / c.indexAtCall - 1) * 100;
    var dir = c.rating === "Sell" ? -1 : 1;
    return {
      end: end,
      stock: stock,
      index: index,
      position: dir * stock,
      relative: dir * (stock - index),
      upside: (c.target / end - 1) * 100
    };
  }
  function openCalls() { return S.calls.filter(function (c) { return c.status === "open"; }); }
  function closedCalls() { return S.calls.filter(function (c) { return c.status === "closed"; }); }
  function hitRate() {
    var all = closedCalls().map(function (c) { return c.outcome; })
      .concat(S.macroCalls.map(function (m) { return m.outcome; }));
    if (!all.length) return null;
    var hits = all.filter(function (o) { return o === "Hit"; }).length;
    return { hits: hits, total: all.length, rate: hits / all.length * 100 };
  }
  function companyUrl(id) { return "company.html?id=" + encodeURIComponent(id); }

  /* ---------- shared layout ---------- */
  var NAV = [
    ["index.html", "Dashboard"],
    ["equity.html", "Equity Research"],
    ["macro.html", "Macro & Allocation"],
    ["track-record.html", "Track Record"],
    ["about.html", "About"]
  ];
  function layout() {
    var page = (location.pathname.split("/").pop() || "index.html");
    if (page === "company.html") page = "equity.html";
    var nav = NAV.map(function (n) {
      return '<a href="' + n[0] + '"' + (n[0] === page ? ' class="active"' : "") + ">" + n[1] + "</a>";
    }).join("");
    var banner = S.sampleData
      ? '<div class="sample-banner">Preview with <b>sample data</b>. Companies, prices and calls shown are placeholders, not real views.</div>'
      : "";
    var header = $("#site-header");
    if (header) {
      header.outerHTML = banner +
        '<header class="site-header"><div class="wrap">' +
        '<a class="brand" href="index.html">' + esc(S.profile.name) + "</a>" +
        '<button class="nav-toggle" aria-label="Menu">Menu</button>' +
        '<nav class="nav">' + nav + "</nav></div></header>";
      var t = $(".nav-toggle");
      t.addEventListener("click", function () { $(".nav").classList.toggle("open"); });
    }
    var footer = $("#site-footer");
    if (footer) {
      var contact = [];
      if (S.profile.email) contact.push('<a href="mailto:' + esc(S.profile.email) + '">Email</a>');
      if (S.profile.linkedin) contact.push('<a href="' + esc(S.profile.linkedin) + '">LinkedIn</a>');
      footer.outerHTML = '<footer class="site-footer"><div class="wrap">' +
        "<div>For educational purposes only. Nothing on this site is investment advice. Calls are a paper portfolio.</div>" +
        "<div>" + (contact.join(" · ") || "") + (contact.length ? " · " : "") + "Data as of " + fmtDate(S.asOf) + "</div>" +
        "</div></footer>";
    }
    document.title = document.title.replace("{name}", S.profile.name);
  }

  /* ---------- homepage pieces ---------- */
  var PALETTE = ["#2f6fed", "#0fa3a3", "#e89a0c", "#8b5cf6", "#d93b3b", "#12a150"];

  function donut(el, items, linkPrefix) {
    var total = items.reduce(function (s, i) { return s + i.weight; }, 0) || 1;
    var R = 80, r = 52, cx = 90, cy = 90, a0 = -Math.PI / 2, paths = "";
    items.forEach(function (it, i) {
      var frac = it.weight / total;
      if (frac <= 0) return;
      var a1 = a0 + frac * Math.PI * 2 - (frac < 1 ? 0.0001 : 0.0002);
      var large = frac > 0.5 ? 1 : 0;
      var p = function (rad, a) { return (cx + rad * Math.cos(a)).toFixed(2) + " " + (cy + rad * Math.sin(a)).toFixed(2); };
      var d = "M " + p(R, a0) + " A " + R + " " + R + " 0 " + large + " 1 " + p(R, a1) +
              " L " + p(r, a1) + " A " + r + " " + r + " 0 " + large + " 0 " + p(r, a0) + " Z";
      paths += '<a href="' + linkPrefix + esc(it.id) + '"><path d="' + d + '" fill="' + PALETTE[i % PALETTE.length] +
        '"><title>' + esc(it.name) + ": " + it.weight + "% (benchmark " + it.benchmark + "%)</title></path></a>";
      a0 = a0 + frac * Math.PI * 2;
    });
    var eq = items[0];
    var svg = '<svg class="donut" viewBox="0 0 180 180" role="img" aria-label="Asset allocation">' + paths +
      '<text x="90" y="88" text-anchor="middle" class="center-big">' + eq.weight + "%</text>" +
      '<text x="90" y="106" text-anchor="middle" class="center-small">' + esc(eq.name) + "</text></svg>";
    var legend = items.map(function (it, i) {
      var a = it.weight - it.benchmark;
      return '<a href="' + linkPrefix + esc(it.id) + '"><span class="swatch" style="background:' + PALETTE[i % PALETTE.length] + '"></span>' +
        "<span>" + esc(it.name) + '</span><span class="num"><b>' + it.weight + '%</b> <span class="bm">vs ' + it.benchmark + "%</span></span>" +
        '<span class="num bar-val ' + cls(a) + '">' + pp(a) + "</span></a>";
    }).join("");
    el.innerHTML = '<div class="donut-wrap">' + svg + '<div class="legend">' + legend + "</div></div>";
  }

  function activeBars(el, items, linkPrefix, key) {
    var maxAbs = Math.max.apply(null, items.map(function (i) { return Math.abs(i.weight - i.benchmark); }).concat([1]));
    var open = openCalls();
    var rows = items.map(function (it) {
      var a = it.weight - it.benchmark;
      var w = Math.abs(a) / maxAbs * 50;
      var tickers = open.filter(function (c) { return c[key] === it.id; });
      var tags = tickers.length
        ? '<div class="ticker-tags">' + tickers.map(function (c) {
            return '<a class="ticker-tag" href="' + companyUrl(c.id) + '" title="' + esc(c.company) + " (" + esc(c.rating) + ')">' + esc(c.ticker) + "</a>";
          }).join("") + "</div>"
        : "";
      return '<div><a class="bar-row" href="' + linkPrefix + esc(it.id) + '" title="' + esc(it.name) + ": you " + it.weight + "%, benchmark " + it.benchmark + '%">' +
        '<span class="bar-name">' + esc(it.name) + "</span>" +
        '<span class="bar-track"><span class="bar-fill ' + (a >= 0 ? "pos" : "neg") + '" style="width:' + w.toFixed(1) + '%"></span></span>' +
        '<span class="num bar-val ' + cls(a) + '">' + pp(a) + "</span></a>" + tags + "</div>";
    }).join("");
    el.innerHTML = '<div class="bars">' + rows + '</div><div class="bars-legend"><span>◀ Underweight</span><span>Overweight ▶</span></div>';
  }

  function pricebar(c, st) {
    var vals = [c.priceAtCall, st.end, c.target];
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var pad = (hi - lo) * 0.08 || 1;
    lo -= pad; hi += pad;
    var pos = function (v) { return ((v - lo) / (hi - lo) * 100).toFixed(1); };
    var a = Math.min(c.priceAtCall, st.end), b = Math.max(c.priceAtCall, st.end);
    var towardTarget = (c.target - c.priceAtCall) * (st.end - c.priceAtCall) >= 0;
    var fillColor = c.rating === "Hold" ? "var(--amber)" : towardTarget ? "var(--green)" : "var(--red)";
    return '<div class="pricebar" aria-label="Price at call, current price and target">' +
      '<div class="track"></div>' +
      '<div class="fill" style="left:' + pos(a) + "%;width:" + (pos(b) - pos(a)).toFixed(1) + "%;background:" + fillColor + '"></div>' +
      '<div class="mark call" style="left:' + pos(c.priceAtCall) + '%"><div class="lbl up">Call ' + money(c.priceAtCall) + '</div><div class="dot"></div></div>' +
      '<div class="mark target" style="left:' + pos(c.target) + '%"><div class="lbl up">Target ' + money(c.target) + '</div><div class="dot"></div></div>' +
      '<div class="mark current" style="left:' + pos(st.end) + '%"><div class="dot"></div><div class="lbl down">Now ' + money(st.end) + "</div></div>" +
      "</div>";
  }

  function callCard(c) {
    var st = callStats(c);
    return '<a class="card card-link call-card" href="' + companyUrl(c.id) + '">' +
      '<div class="top"><div><div class="ticker">' + esc(c.ticker) + ' <span class="co">' + esc(c.exchange) + "</span></div>" +
      '<div class="co">' + esc(c.company) + "</div>" +
      '<div style="margin-top:6px">' + ratingBadge(c.rating) + "</div></div>" +
      '<div class="rel"><div class="big num ' + cls(st.relative) + '">' + pct(st.relative) + "</div>" +
      '<div class="small">vs ' + esc(c.indexName) + "</div></div></div>" +
      pricebar(c, st) +
      '<div class="call-meta">' +
      "<div>Opened<b>" + fmtDate(c.dateOpened) + "</b></div>" +
      '<div>Position<b class="num ' + cls(st.position) + '">' + pct(st.position) + "</b></div>" +
      '<div>Index<b class="num">' + pct(st.index) + "</b></div>" +
      '<div>To target<b class="num">' + pct(st.upside) + "</b></div>" +
      "</div></a>";
  }

  function closedTable(el) {
    var rows = closedCalls().map(function (c) {
      var st = callStats(c);
      return '<tr class="clickable" data-href="' + companyUrl(c.id) + '">' +
        '<td><span class="type-tag">Stock</span><br><b>' + esc(c.ticker) + "</b> " + ratingBadge(c.rating) + "</td>" +
        '<td class="num">' + fmtDate(c.dateOpened) + "<br>→ " + fmtDate(c.dateClosed) + "</td>" +
        '<td class="num">' + money(c.priceAtCall) + " → " + money(c.closePrice) + "<br><span class=\"lesson\">target " + money(c.target) + "</span></td>" +
        '<td class="num ' + cls(st.relative) + '"><b>' + pct(st.relative) + "</b></td>" +
        "<td>" + outcomeBadge(c.outcome) + '<br><span class="lesson">' + esc(c.closeReason || "") + "</span></td>" +
        "<td>" + esc(c.whatHappened || "") + '<div class="lesson">Lesson: ' + esc(c.lesson || "–") + "</div></td></tr>";
    });
    rows = rows.concat(S.macroCalls.map(function (m) {
      var href = m.region ? "macro.html#region-" + m.region : "macro.html";
      return '<tr class="clickable" data-href="' + href + '">' +
        '<td><span class="type-tag">Macro</span><br><b>' + esc(m.call) + "</b></td>" +
        '<td class="num">' + fmtDate(m.opened) + "<br>→ " + fmtDate(m.closed) + "</td>" +
        "<td>–</td>" +
        '<td class="num ' + cls(m.result) + '"><b>' + pct(m.result) + "</b></td>" +
        "<td>" + outcomeBadge(m.outcome) + "</td>" +
        "<td>" + esc(m.note || "") + "</td></tr>";
    }));
    el.innerHTML = '<div class="card table-wrap"><table><thead><tr>' +
      "<th>Call</th><th>Dates</th><th>Price</th><th>vs Index</th><th>Outcome</th><th>What actually happened</th>" +
      "</tr></thead><tbody>" + (rows.join("") || '<tr><td colspan="6">No closed calls yet.</td></tr>') + "</tbody></table></div>";
    el.querySelectorAll("tr.clickable").forEach(function (tr) {
      tr.addEventListener("click", function () { location.href = tr.getAttribute("data-href"); });
    });
  }

  function home() {
    var p = S.profile;
    $("#hero").innerHTML = '<div class="wrap">' +
      "<h1>" + esc(p.name) + "</h1>" +
      '<p class="title">' + esc(p.title) + "</p>" +
      '<p class="subtitle">' + esc(p.subtitle) + "</p>" +
      '<a class="about-snippet" href="about.html">' + p.about.map(function (s) { return "<p>" + esc(s) + "</p>"; }).join("") +
      '<span class="more">Learn more about me →</span></a></div>';

    var perf = S.performance, alpha = perf.portfolio - perf.benchmark, hr = hitRate();
    $("#kpis").innerHTML =
      '<a class="kpi card-link" href="track-record.html"><div class="label">Portfolio since ' + fmtDate(perf.inception) + "</div>" +
      '<div class="value num ' + cls(perf.portfolio) + '">' + pct(perf.portfolio) + '</div><div class="sub">Benchmark ' + pct(perf.benchmark) + "</div></a>" +
      '<a class="kpi card-link" href="track-record.html"><div class="label">Excess return</div>' +
      '<div class="value num ' + cls(alpha) + '">' + pct(alpha) + '</div><div class="sub">vs ' + esc(perf.benchmarkName) + "</div></a>" +
      '<a class="kpi card-link" href="#open-calls"><div class="label">Open calls</div>' +
      '<div class="value num">' + openCalls().length + '</div><div class="sub">' + closedCalls().length + " stock + " + S.macroCalls.length + " macro closed</div></a>" +
      '<a class="kpi card-link" href="#closed-calls"><div class="label">Hit rate</div>' +
      '<div class="value num">' + (hr ? hr.rate.toFixed(0) + "%" : "–") + '</div><div class="sub">' + (hr ? hr.hits + " of " + hr.total + " closed calls" : "No closed calls yet") + "</div></a>";

    donut($("#donut"), S.allocation.assetClasses, "macro.html#asset-");
    activeBars($("#regions"), S.allocation.regions, "macro.html#region-", "region");
    activeBars($("#sectors"), S.allocation.sectors, "macro.html#sector-", "sector");
    $("#open-calls-list").innerHTML = openCalls().map(callCard).join("") || '<div class="card">No open calls yet.</div>';
    closedTable($("#closed-calls-list"));
    $("#asof").textContent = "Data as of " + fmtDate(S.asOf);
  }

  /* ---------- inner pages ---------- */
  function equityPage() {
    var all = openCalls().concat(closedCalls());
    $("#coverage").innerHTML = '<div class="calls">' + all.map(function (c) {
      var st = callStats(c);
      return '<a class="card card-link" href="' + companyUrl(c.id) + '">' +
        '<div class="top" style="display:flex;justify-content:space-between;gap:10px"><div><div style="font-size:18px;font-weight:700">' + esc(c.ticker) +
        '</div><div class="card-sub" style="margin:0">' + esc(c.company) + "</div></div><div>" + ratingBadge(c.rating) + "</div></div>" +
        '<p style="margin:12px 0 0;font-size:14px">' + esc(c.thesis || c.whatHappened || "") + "</p>" +
        '<div class="call-meta"><div>Status<b>' + (c.status === "open" ? "Open" : "Closed") + "</b></div>" +
        "<div>Opened<b>" + fmtDate(c.dateOpened) + "</b></div>" +
        "<div>Target<b class=\"num\">" + money(c.target) + "</b></div>" +
        '<div>vs Index<b class="num ' + cls(st.relative) + '">' + pct(st.relative) + "</b></div></div></a>";
    }).join("") + "</div>";
  }

  function companyPage() {
    var c = byId(S.calls, param("id"));
    if (!c) { $("#company").innerHTML = '<div class="wrap page-body"><div class="card">Company not found. <a href="equity.html">Back to coverage</a></div></div>'; return; }
    var st = callStats(c);
    document.title = c.ticker + " · " + S.profile.name;
    var region = byId(S.allocation.regions, c.region), sector = byId(S.allocation.sectors, c.sector);
    var ph = function (t) { return '<div class="placeholder">' + t + "</div>"; };
    $("#company").innerHTML =
      '<section class="page-hero"><div class="wrap"><a class="back" href="equity.html">← All coverage</a>' +
      "<h1>" + esc(c.company) + " (" + esc(c.exchange) + ": " + esc(c.ticker) + ")</h1>" +
      "<p>" + ratingBadge(c.rating) + " &nbsp;Call opened " + fmtDate(c.dateOpened) + (c.status === "closed" ? " · closed " + fmtDate(c.dateClosed) : "") + "</p></div></section>" +
      '<div class="wrap page-body">' +
      '<div class="card strip">' +
      '<div class="cell"><div class="label">Price at call</div><div class="value num">' + money(c.priceAtCall) + "</div></div>" +
      '<div class="cell"><div class="label">' + (c.status === "closed" ? "Close price" : "Current") + '</div><div class="value num">' + money(st.end) + "</div></div>" +
      '<div class="cell"><div class="label">Target</div><div class="value num">' + money(c.target) + "</div></div>" +
      '<div class="cell"><div class="label">To target</div><div class="value num">' + pct(st.upside) + "</div></div>" +
      '<div class="cell"><div class="label">vs ' + esc(c.indexName) + '</div><div class="value num ' + cls(st.relative) + '">' + pct(st.relative) + "</div></div>" +
      "</div>" +
      '<div class="card"><h3>Investment thesis</h3><p class="card-sub">Three bullets, conclusion first.</p>' + ph(esc(c.thesis || "To be written.")) + "</div>" +
      '<div class="sub-grid">' +
      '<div class="card"><h3>Variant view</h3><p class="card-sub">What the market is missing, in one sentence.</p>' + ph("To be written.") + "</div>" +
      '<div class="card"><h3>Macro read-through</h3><p class="card-sub">How the top-down view feeds this call.</p>' +
      ph("Sits in " + (region ? '<a href="macro.html#region-' + region.id + '">' + esc(region.name) + "</a> " + stance(region.weight - region.benchmark) : "–") +
        " and " + (sector ? '<a href="macro.html#sector-' + sector.id + '">' + esc(sector.name) + "</a> " + stance(sector.weight - sector.benchmark) : "–") +
        ". Explain how the macro view supports or conflicts with this call.") + "</div>" +
      "</div>" +
      '<div class="card"><h3>Valuation</h3><p class="card-sub">Football field: DCF, trading comps, precedent transactions.</p>' + ph("Chart and key assumptions to come.") + "</div>" +
      '<div class="sub-grid">' +
      '<div class="card"><h3>Catalysts</h3>' + ph("To be written.") + "</div>" +
      '<div class="card"><h3>What would prove me wrong</h3>' + ph("To be written.") + "</div>" +
      "</div>" +
      '<div class="sub-grid">' +
      '<div class="card"><h3>Downloads</h3>' + ph("Full note (PDF) and model (Excel).") + "</div>" +
      '<div class="card"><h3>Update history</h3>' + ph("Initiation " + fmtDate(c.dateOpened) + ". Earnings updates are listed here.") + "</div>" +
      "</div></div>";
  }

  function macroPage() {
    var a = S.allocation;
    var sec = function (prefix, it) {
      return '<div class="card anchor-section" id="' + prefix + esc(it.id) + '"><h3>' + esc(it.name) + stance(it.weight - it.benchmark) + "</h3>" +
        '<p class="card-sub">Your weight ' + it.weight + "% vs benchmark " + it.benchmark + "%</p>" +
        '<div class="placeholder">Why: the view, what drives it, and what would change it.</div></div>';
    };
    $("#macro-body").innerHTML =
      '<div class="card"><h3>Macro regime</h3><p class="card-sub">Growth, inflation, rates, policy, geopolitics.</p><div class="placeholder">This month’s regime call goes here.</div></div>' +
      "<h2 style=\"margin:20px 0 0\">Asset classes</h2>" + a.assetClasses.map(function (i) { return sec("asset-", i); }).join("") +
      "<h2 style=\"margin:20px 0 0\">Regions (equities)</h2>" + a.regions.map(function (i) { return sec("region-", i); }).join("") +
      "<h2 style=\"margin:20px 0 0\">Sectors (equities)</h2>" + a.sectors.map(function (i) { return sec("sector-", i); }).join("") +
      '<div class="card"><h3>Hedging and sizing</h3><p class="card-sub">FX, duration, position sizes.</p><div class="placeholder">To be written.</div></div>';
  }

  function trackPage() {
    closedTable($("#track-closed"));
    var perf = S.performance;
    $("#track-perf").innerHTML = '<div class="card strip">' +
      '<div class="cell"><div class="label">Inception</div><div class="value">' + fmtDate(perf.inception) + "</div></div>" +
      '<div class="cell"><div class="label">Portfolio</div><div class="value num ' + cls(perf.portfolio) + '">' + pct(perf.portfolio) + "</div></div>" +
      '<div class="cell"><div class="label">Benchmark</div><div class="value num">' + pct(perf.benchmark) + "</div></div>" +
      '<div class="cell"><div class="label">Excess</div><div class="value num ' + cls(perf.portfolio - perf.benchmark) + '">' + pct(perf.portfolio - perf.benchmark) + "</div></div>" +
      '<div class="cell"><div class="label">Benchmark used</div><div style="font-size:13px;font-weight:600">' + esc(perf.benchmarkName) + "</div></div></div>";
  }

  function aboutPage() {
    $("#about-body").innerHTML = '<div class="card"><h3>About me</h3>' +
      S.profile.about.map(function (s) { return "<p>" + esc(s) + "</p>"; }).join("") +
      '<div class="placeholder">Longer bio, education, experience and a CV download go here.</div></div>';
  }

  /* ---------- boot ---------- */
  layout();
  var page = document.body.getAttribute("data-page");
  ({ home: home, equity: equityPage, company: companyPage, macro: macroPage, track: trackPage, about: aboutPage }[page] || function () {})();
})();
