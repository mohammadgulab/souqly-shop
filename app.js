/* Souqly demo shop. Front end only: all data lives in localStorage. */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $("#app");
  const CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))];
  const byId = id => PRODUCTS.find(p => p.id === id);
  const VAT = 0.15, FREE_SHIP = 200, SHIP_FEE = 15;
  const COUPONS = { WELCOME10: { type: "pct", value: 10, label: "10% off" }, SOUQ25: { type: "flat", value: 25, label: "SAR 25 off orders over 150", min: 150 } };

  /* ---------- storage ---------- */
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem("souqly_" + k)); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { localStorage.setItem("souqly_" + k, JSON.stringify(v)); }
  };
  const state = {
    cart: store.get("cart", []),          // [{id, qty}]
    wish: store.get("wish", []),          // [id]
    users: store.get("users", []),        // [{name,email,phone,pass,city,address}]
    session: store.get("session", null),  // email
    orders: store.get("orders", []),
    coupon: store.get("coupon", null),
    buyNow: null
  };
  const save = () => { ["cart", "wish", "users", "session", "orders", "coupon"].forEach(k => store.set(k, state[k])); updateBadges(); };
  const currentUser = () => state.users.find(u => u.email === state.session) || null;

  /* ---------- helpers ---------- */
  const money = n => "SAR " + Number(n).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const off = p => Math.round((1 - p.price / p.mrp) * 100);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.3 4.5 7 4.5c2 0 3.6 1.1 5 2.8 1.4-1.7 3-2.8 5-2.8 3.7 0 5.9 3.8 4.5 7.2C19.5 16.4 12 21 12 21z"/></svg>',
    star: '<svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:#fff;stroke:none"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    ret: '<svg viewBox="0 0 24 24"><path d="M4 9h12a4 4 0 0 1 0 8H8"/><path d="M8 5 4 9l4 4"/></svg>',
    cash: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/></svg>',
    cart: '<svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17" cy="20.5" r="1.3"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    filter: '<svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    alert: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>'
  };
  const stars = p => `<span class="stars"><span class="s">${p.rating.toFixed(1)} ${icon.star}</span>(${p.reviews.toLocaleString("en-US")})</span>`;
  const priceHtml = p => `<div class="price"><span class="now"><span class="cur">SAR</span>${p.price.toLocaleString("en-US")}</span><span class="was">${money(p.mrp)}</span><span class="save">${off(p)}% off</span></div>`;

  function toast(msg, link, isErr) {
    const t = document.createElement("div");
    t.className = "toast" + (isErr ? " err" : "");
    t.innerHTML = (isErr ? icon.alert : icon.check) + `<span>${msg}</span>` + (link ? `<a href="${link.href}">${link.text}</a>` : "");
    const wrap = $("#toasts");
    while (wrap.children.length >= 2) wrap.firstChild.remove();
    wrap.appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2600);
  }

  function updateBadges() {
    const c = state.cart.reduce((a, l) => a + l.qty, 0);
    const cc = $("#cartCount"), wc = $("#wishCount");
    if (cc.textContent !== String(c)) { cc.textContent = c; cc.classList.remove("pop"); void cc.offsetWidth; cc.classList.add("pop"); }
    cc.hidden = c === 0;
    wc.textContent = state.wish.length;
    wc.hidden = state.wish.length === 0;
    const u = currentUser();
    $("#accountLabel").textContent = u ? "Hi, " + u.name.split(" ")[0] : "Sign in";
  }

  const go = h => { if (location.hash === h) route(); else location.hash = h; };

  /* ---------- cart and wishlist ---------- */
  function addToCart(id, qty = 1, silent) {
    const p = byId(id); if (!p) return;
    const line = state.cart.find(l => l.id === id);
    const have = line ? line.qty : 0;
    const n = Math.min(have + qty, p.stock, 10);
    if (n === have) { toast("You already have the maximum quantity of this item", null, true); return; }
    if (line) line.qty = n; else state.cart.push({ id, qty: n });
    save();
    if (!silent) toast("Added to cart", { href: "#/cart", text: "View cart" });
  }
  function setQty(id, qty) {
    const p = byId(id), line = state.cart.find(l => l.id === id);
    if (!line) return;
    line.qty = Math.max(1, Math.min(qty, p.stock, 10));
    save();
  }
  function removeFromCart(id) { state.cart = state.cart.filter(l => l.id !== id); save(); }
  function toggleWish(id) {
    const i = state.wish.indexOf(id);
    if (i > -1) { state.wish.splice(i, 1); toast("Removed from wishlist"); }
    else { state.wish.push(id); toast("Saved to wishlist", { href: "#/wishlist", text: "View" }); }
    save();
    $$(`.heart[data-id="${id}"]`).forEach(b => { b.classList.toggle("on", state.wish.includes(id)); b.setAttribute("aria-pressed", state.wish.includes(id)); });
  }

  function totals(lines) {
    const items = lines.map(l => ({ ...l, p: byId(l.id) })).filter(l => l.p);
    const subtotal = items.reduce((a, l) => a + l.p.price * l.qty, 0);
    const mrp = items.reduce((a, l) => a + l.p.mrp * l.qty, 0);
    let discount = 0, coupon = state.coupon && COUPONS[state.coupon];
    if (coupon && coupon.min && subtotal < coupon.min) coupon = null;
    if (coupon) discount = coupon.type === "pct" ? Math.round(subtotal * coupon.value) / 100 : coupon.value;
    const afterDisc = subtotal - discount;
    const shipping = items.length === 0 || afterDisc >= FREE_SHIP ? 0 : SHIP_FEE;
    const vat = Math.round(afterDisc * VAT / (1 + VAT) * 100) / 100; // prices include VAT
    const total = afterDisc + shipping;
    return { items, subtotal, mrp, discount, shipping, vat, total, coupon: coupon ? state.coupon : null, count: items.reduce((a, l) => a + l.qty, 0) };
  }

  /* ---------- product card ---------- */
  function card(p) {
    const w = state.wish.includes(p.id);
    return `<article class="pcard card">
      <a class="thumb" href="#/product/${p.id}"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy" width="320" height="320"></a>
      <span class="off-tag">-${off(p)}%</span>
      ${p.stock <= 8 ? `<span class="low-tag">Only ${p.stock} left</span>` : ""}
      <button class="heart${w ? " on" : ""}" data-id="${p.id}" data-act="wish" aria-label="Save ${esc(p.name)} to wishlist" aria-pressed="${w}">${icon.heart}</button>
      <div class="body">
        <span class="cat">${p.category}</span>
        <a class="name" href="#/product/${p.id}">${esc(p.name)}</a>
        ${stars(p)}
        <div class="bottom">${priceHtml(p)}
          <button class="btn btn-accent btn-block" data-act="add" data-id="${p.id}">${icon.cart} Add to cart</button>
        </div>
      </div>
    </article>`;
  }

  /* ---------- views ---------- */
  function viewHome() {
    const deals = [...PRODUCTS].sort((a, b) => off(b) - off(a)).slice(0, 8);
    const top = [...PRODUCTS].sort((a, b) => b.rating * Math.log(b.reviews) - a.rating * Math.log(a.reviews)).slice(0, 8);
    const catImg = c => PRODUCTS.find(p => p.category === c).image;
    app.innerHTML = `
    <div class="wrap">
      <section class="hero">
        <div class="hero-text">
          <span class="tag">Mega Deals Week</span>
          <h1>Everything you need, delivered fast.</h1>
          <p>Gadgets, fashion, home and more at prices that make sense. Up to ${Math.max(...PRODUCTS.map(off))}% off this week.</p>
          <a href="#/shop" class="btn btn-accent">Shop all deals</a>
        </div>
        <div class="hero-imgs">
          ${["headphones", "sneakers", "perfume", "smartwatch"].map(id => `<img src="${byId(id).image}" alt="">`).join("")}
        </div>
      </section>
      <div class="perks">
        <div class="perk card">${icon.truck}<div><b>Fast delivery</b><span>1 to 3 days across KSA</span></div></div>
        <div class="perk card">${icon.ret}<div><b>Easy returns</b><span>Within 14 days</span></div></div>
        <div class="perk card">${icon.shield}<div><b>Secure checkout</b><span>Your data stays safe</span></div></div>
        <div class="perk card">${icon.cash}<div><b>Cash on delivery</b><span>Pay when it arrives</span></div></div>
      </div>
      <section class="section">
        <div class="section-head"><h2>Shop by category</h2></div>
        <div class="cats">${CATEGORIES.map(c => `<a class="cat-tile card" href="#/shop?cat=${encodeURIComponent(c)}"><img src="${catImg(c)}" alt="" loading="lazy"><b>${c}</b></a>`).join("")}</div>
      </section>
      <section class="section">
        <div class="section-head"><h2>Today's best deals</h2><a class="link" href="#/shop?sort=discount">See all</a></div>
        <div class="grid">${deals.map(card).join("")}</div>
      </section>
      <section class="section">
        <div class="section-head"><h2>Top rated</h2><a class="link" href="#/shop?sort=rating">See all</a></div>
        <div class="grid">${top.map(card).join("")}</div>
      </section>
    </div>`;
  }

  function viewShop(q) {
    const f = {
      q: (q.get("q") || "").trim(),
      cats: q.getAll("cat"),
      min: q.get("min") || "",
      max: q.get("max") || "",
      rating: q.get("rating") || "",
      sort: q.get("sort") || "relevance"
    };
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    let list = PRODUCTS.filter(p => {
      const hay = (p.name + " " + p.category + " " + p.description + " " + p.highlights.join(" ")).toLowerCase();
      if (words.length && !words.every(w => hay.includes(w))) return false;
      if (f.cats.length && !f.cats.includes(p.category)) return false;
      if (f.min && p.price < +f.min) return false;
      if (f.max && p.price > +f.max) return false;
      if (f.rating && p.rating < +f.rating) return false;
      return true;
    });
    const sorters = {
      relevance: (a, b) => a.added - b.added,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      discount: (a, b) => off(b) - off(a),
      popular: (a, b) => b.reviews - a.reviews
    };
    list.sort(sorters[f.sort] || sorters.relevance);

    const countIn = c => PRODUCTS.filter(p => p.category === c).length;
    const chips = [];
    if (f.q) chips.push(["q", f.q, `"${esc(f.q)}"`]);
    f.cats.forEach(c => chips.push(["cat", c, esc(c)]));
    if (f.min || f.max) chips.push(["price", "", `SAR ${f.min || 0} to ${f.max || "any"}`]);
    if (f.rating) chips.push(["rating", f.rating, `${f.rating}+ stars`]);
    const title = f.q ? `Results for "${esc(f.q)}"` : f.cats.length === 1 ? esc(f.cats[0]) : "All products";

    app.innerHTML = `
    <div class="wrap">
      <div class="crumbs"><a href="#/">Home</a> / Shop</div>
      <div class="listing">
        <aside class="filters card" id="filters" aria-label="Filters">
          <h3>Filters <button type="button" id="clearF">Clear all</button></h3>
          <div class="fgroup"><h4>Category</h4>
            ${CATEGORIES.map(c => `<label class="check"><input type="checkbox" name="cat" value="${esc(c)}" ${f.cats.includes(c) ? "checked" : ""}>${c}<span class="n">${countIn(c)}</span></label>`).join("")}
          </div>
          <div class="fgroup"><h4>Price (SAR)</h4>
            <div class="range-row"><input type="number" min="0" inputmode="numeric" placeholder="Min" id="fmin" value="${esc(f.min)}" aria-label="Minimum price"><span>to</span><input type="number" min="0" inputmode="numeric" placeholder="Max" id="fmax" value="${esc(f.max)}" aria-label="Maximum price"></div>
          </div>
          <div class="fgroup"><h4>Customer rating</h4>
            ${[4.5, 4, 3].map(r => `<label class="check"><input type="radio" name="rating" value="${r}" ${f.rating == r ? "checked" : ""}>${r} stars and up</label>`).join("")}
            <label class="check"><input type="radio" name="rating" value="" ${!f.rating ? "checked" : ""}>Any rating</label>
          </div>
          <button class="btn btn-primary btn-block filter-btn" id="applyF" type="button">Show ${list.length} results</button>
        </aside>
        <section>
          <div class="toolbar">
            <div><h1>${title}</h1><span class="count">${list.length} item${list.length === 1 ? "" : "s"}</span></div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost filter-btn" id="openF" type="button">${icon.filter} Filters</button>
              <select id="sort" aria-label="Sort by">
                ${[["relevance", "Featured"], ["popular", "Most popular"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["rating", "Customer rating"], ["discount", "Biggest discount"]].map(([v, t]) => `<option value="${v}" ${f.sort === v ? "selected" : ""}>${t}</option>`).join("")}
              </select>
            </div>
          </div>
          ${chips.length ? `<div class="chips">${chips.map(([k, v, t]) => `<button class="chip" data-k="${k}" data-v="${esc(v)}">${t} ${icon.x}</button>`).join("")}</div>` : ""}
          ${list.length ? `<div class="grid">${list.map(card).join("")}</div>` :
            `<div class="empty card"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><h2>No products found</h2><p class="muted">Try a different search or clear the filters.</p><a href="#/shop" class="btn btn-primary">Clear filters</a></div>`}
        </section>
      </div>
    </div>`;

    const push = mut => {
      const p = new URLSearchParams(q.toString());
      mut(p);
      location.hash = "#/shop" + (p.toString() ? "?" + p.toString() : "");
    };
    $("#sort").onchange = e => push(p => p.set("sort", e.target.value));
    $$('#filters input[name="cat"]').forEach(i => i.onchange = () => push(p => { p.delete("cat"); $$('#filters input[name="cat"]:checked').forEach(c => p.append("cat", c.value)); }));
    $$('#filters input[name="rating"]').forEach(i => i.onchange = () => push(p => i.value ? p.set("rating", i.value) : p.delete("rating")));
    const priceApply = () => push(p => { const mn = $("#fmin").value, mx = $("#fmax").value; mn ? p.set("min", mn) : p.delete("min"); mx ? p.set("max", mx) : p.delete("max"); });
    ["#fmin", "#fmax"].forEach(s => { $(s).onchange = priceApply; });
    $("#clearF").onclick = () => { location.hash = "#/shop"; };
    $$(".chip").forEach(c => c.onclick = () => push(p => {
      const k = c.dataset.k;
      if (k === "price") { p.delete("min"); p.delete("max"); }
      else if (k === "cat") { const rest = p.getAll("cat").filter(x => x !== c.dataset.v); p.delete("cat"); rest.forEach(x => p.append("cat", x)); }
      else p.delete(k);
    }));
    const fl = $("#filters");
    $("#openF").onclick = () => { fl.classList.add("open"); $("#drawerBg").classList.add("open"); };
    $("#applyF").onclick = () => { fl.classList.remove("open"); $("#drawerBg").classList.remove("open"); };
    $("#searchInput").value = f.q;
  }

  const REVIEWS = [
    ["Faisal A.", 5, "Exactly as described and arrived a day early. Very happy with it."],
    ["Sara M.", 4, "Good quality for the price. Packaging was neat."],
    ["Imran K.", 5, "Using it every day now. Would buy again."]
  ];
  function viewProduct(id) {
    const p = byId(id);
    if (!p) return viewNotFound();
    const w = state.wish.includes(p.id);
    const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
    const eta = new Date(Date.now() + 2 * 864e5).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
    let qty = 1;
    app.innerHTML = `
    <div class="wrap">
      <div class="crumbs"><a href="#/">Home</a> / <a href="#/shop?cat=${encodeURIComponent(p.category)}">${p.category}</a> / ${esc(p.name)}</div>
      <div class="pdp">
        <div class="gallery card"><div class="frame"><img class="main-img" id="mainImg" src="${p.image}" alt="${esc(p.name)}" width="640" height="640"></div></div>
        <div class="pinfo">
          <span class="muted">${p.category}</span>
          <h1>${esc(p.name)}</h1>
          ${stars(p)}
          <div style="margin-top:14px">${priceHtml(p)}</div>
          <div class="tax">Inclusive of VAT. Free delivery over SAR ${FREE_SHIP}.</div>
          <p>${esc(p.description)}</p>
          <ul class="hl">${p.highlights.map(h => `<li>${icon.check}${esc(h)}</li>`).join("")}</ul>
          <div class="stock ${p.stock <= 8 ? "low" : "ok"}">${p.stock <= 8 ? `Hurry, only ${p.stock} left in stock` : "In stock"}</div>
          <div style="display:flex;align-items:center;gap:14px">
            <span class="muted">Quantity</span>
            <div class="qty"><button id="qMinus" aria-label="Decrease quantity">&minus;</button><span id="qVal" aria-live="polite">1</span><button id="qPlus" aria-label="Increase quantity">+</button></div>
          </div>
          <div class="buy-row">
            <button class="btn btn-accent" id="addBtn">${icon.cart} Add to cart</button>
            <button class="btn btn-primary" id="buyBtn">Buy now</button>
            <button class="btn btn-ghost heart-btn" id="wishBtn" aria-pressed="${w}">${icon.heart} <span>${w ? "Saved" : "Wishlist"}</span></button>
          </div>
          <div class="delivery card">
            <div>${icon.truck}<span>Get it by <b>${eta}</b> in Jeddah</span></div>
            <div>${icon.ret}<span>14 day easy returns</span></div>
            <div>${icon.cash}<span>Cash on delivery available</span></div>
          </div>
          <div class="reviews card">
            <h3 style="margin:0 0 6px">Customer reviews</h3>
            ${REVIEWS.map(([n, r, t]) => `<div class="review"><b>${n}</b> <span class="muted">${"★".repeat(r)}${"☆".repeat(5 - r)}</span><p>${t}</p></div>`).join("")}
          </div>
        </div>
      </div>
      ${related.length ? `<section class="section"><div class="section-head"><h2>You may also like</h2></div><div class="grid">${related.map(card).join("")}</div></section>` : ""}
    </div>`;
    const max = Math.min(p.stock, 10);
    const setQ = n => { qty = Math.max(1, Math.min(max, n)); $("#qVal").textContent = qty; };
    $("#qMinus").onclick = () => setQ(qty - 1);
    $("#qPlus").onclick = () => { if (qty >= max) toast(`Maximum ${max} per order`, null, true); setQ(qty + 1); };
    $("#addBtn").onclick = () => addToCart(p.id, qty);
    $("#buyBtn").onclick = () => { state.buyNow = [{ id: p.id, qty }]; location.hash = "#/checkout?mode=buynow"; };
    $("#wishBtn").onclick = () => { toggleWish(p.id); const on = state.wish.includes(p.id); $("#wishBtn span").textContent = on ? "Saved" : "Wishlist"; $("#wishBtn").setAttribute("aria-pressed", on); };
    $("#mainImg").onclick = e => e.target.classList.toggle("zoom");
  }

  function summaryHtml(t, cta) {
    const left = Math.max(0, FREE_SHIP - (t.subtotal - t.discount));
    return `<aside class="summary card">
      <h3>Order summary</h3>
      ${t.items.length ? `<div class="free-bar">${left > 0 ? `Add <b>${money(left)}</b> more for free delivery` : "You get <b>free delivery</b> on this order"}<div class="bar"><i style="width:${Math.min(100, (t.subtotal - t.discount) / FREE_SHIP * 100)}%"></i></div></div>` : ""}
      <div class="srow"><span>Price (${t.count} item${t.count === 1 ? "" : "s"})</span><span>${money(t.mrp)}</span></div>
      <div class="srow"><span>Product discount</span><span class="green">&minus; ${money(t.mrp - t.subtotal)}</span></div>
      ${t.coupon ? `<div class="srow"><span>Coupon ${t.coupon}</span><span class="green">&minus; ${money(t.discount)}</span></div>` : ""}
      <div class="srow"><span>Delivery</span><span>${t.shipping ? money(t.shipping) : '<span class="green">Free</span>'}</span></div>
      <div class="srow total"><span>Total</span><span>${money(t.total)}</span></div>
      <div class="muted" style="font-size:12.5px">Includes VAT of ${money(t.vat)}</div>
      <form class="coupon" id="couponForm"><input id="couponIn" placeholder="Coupon code" aria-label="Coupon code" value="${t.coupon || ""}"><button class="btn btn-ghost" type="submit">${t.coupon ? "Remove" : "Apply"}</button></form>
      <div class="muted" style="font-size:12.5px;margin:-6px 0 12px">Try WELCOME10 or SOUQ25</div>
      ${cta}
    </aside>`;
  }
  function bindCoupon(rerender) {
    $("#couponForm").onsubmit = e => {
      e.preventDefault();
      if (state.coupon) { state.coupon = null; save(); toast("Coupon removed"); return rerender(); }
      const code = $("#couponIn").value.trim().toUpperCase();
      const c = COUPONS[code];
      if (!c) { toast("That coupon code is not valid", null, true); return; }
      const sub = totals(state.buyNow || state.cart).subtotal;
      if (c.min && sub < c.min) { toast(`${code} needs an order over SAR ${c.min}`, null, true); return; }
      state.coupon = code; save(); toast(`${code} applied: ${c.label}`); rerender();
    };
  }

  function viewCart() {
    const t = totals(state.cart);
    if (!t.items.length) {
      app.innerHTML = `<div class="wrap"><div class="empty card" style="margin:30px 0">${icon.cart}<h2>Your cart is empty</h2><p class="muted">Looks like you have not added anything yet.</p><a class="btn btn-primary" href="#/shop">Start shopping</a>${state.wish.length ? ` <a class="btn btn-ghost" href="#/wishlist">View wishlist (${state.wish.length})</a>` : ""}</div></div>`;
      return;
    }
    app.innerHTML = `<div class="wrap">
      <h1 class="page-title">Shopping cart</h1>
      <div class="cart-layout">
        <section class="card">
          ${t.items.map(l => `<div class="line">
            <a href="#/product/${l.p.id}"><img src="${l.p.image}" alt="${esc(l.p.name)}"></a>
            <div>
              <a class="t" href="#/product/${l.p.id}">${esc(l.p.name)}</a>
              <div class="muted" style="font-size:13px">${l.p.category} &middot; ${l.p.stock <= 8 ? `<span style="color:#c2410c">Only ${l.p.stock} left</span>` : '<span style="color:var(--green)">In stock</span>'}</div>
              <div style="margin-top:6px">${priceHtml(l.p)}</div>
              <div class="acts">
                <div class="qty"><button data-q="-1" data-id="${l.p.id}" aria-label="Decrease">&minus;</button><span>${l.qty}</span><button data-q="1" data-id="${l.p.id}" aria-label="Increase">+</button></div>
                <button class="txt" data-save="${l.p.id}">Save for later</button>
                <button class="txt rm" data-rm="${l.p.id}">Remove</button>
              </div>
            </div>
            <div class="lp">${money(l.p.price * l.qty)}</div>
          </div>`).join("")}
        </section>
        ${summaryHtml(t, `<a class="btn btn-primary btn-block" href="#/checkout">Proceed to checkout</a><a class="btn btn-ghost btn-block" style="margin-top:8px" href="#/shop">Continue shopping</a>`)}
      </div>
    </div>`;
    $$("[data-q]").forEach(b => b.onclick = () => { const l = state.cart.find(x => x.id === b.dataset.id); setQty(l.id, l.qty + +b.dataset.q); viewCart(); });
    $$("[data-rm]").forEach(b => b.onclick = () => { removeFromCart(b.dataset.rm); toast("Item removed"); viewCart(); });
    $$("[data-save]").forEach(b => b.onclick = () => { const id = b.dataset.save; removeFromCart(id); if (!state.wish.includes(id)) state.wish.push(id); save(); toast("Moved to wishlist"); viewCart(); });
    bindCoupon(viewCart);
  }

  function viewWishlist() {
    const items = state.wish.map(byId).filter(Boolean);
    app.innerHTML = `<div class="wrap">
      <h1 class="page-title">My wishlist <span class="muted" style="font-size:16px;font-weight:500">(${items.length})</span></h1>
      ${items.length ? `<div style="margin:-6px 0 14px"><button class="btn btn-ghost" id="allToCart">${icon.cart} Move all to cart</button></div><div class="grid">${items.map(card).join("")}</div>` :
        `<div class="empty card">${icon.heart}<h2>Your wishlist is empty</h2><p class="muted">Tap the heart on any product to save it here.</p><a class="btn btn-primary" href="#/shop">Explore products</a></div>`}
    </div>`;
    const all = $("#allToCart");
    if (all) all.onclick = () => { items.forEach(p => addToCart(p.id, 1, true)); state.wish = []; save(); toast("All items moved to cart", { href: "#/cart", text: "View cart" }); viewWishlist(); };
  }

  /* ---------- checkout ---------- */
  function luhn(num) {
    let s = 0, alt = false;
    for (let i = num.length - 1; i >= 0; i--) { let d = +num[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; }
    return s % 10 === 0;
  }
  function viewCheckout(q) {
    const buyNow = q.get("mode") === "buynow" && state.buyNow;
    if (!buyNow) state.buyNow = null;
    const lines = buyNow ? state.buyNow : state.cart;
    const t = totals(lines);
    if (!t.items.length) { location.hash = "#/cart"; return; }
    const u = currentUser() || {};
    const cities = ["Jeddah", "Riyadh", "Mecca", "Medina", "Dammam", "Khobar", "Taif", "Tabuk", "Abha"];
    app.innerHTML = `<div class="wrap">
      <h1 class="page-title">Checkout</h1>
      ${currentUser() ? "" : `<div class="note" style="margin:-4px 0 16px">Have an account? <a class="link" href="#/account?next=checkout">Sign in</a> to fill your details faster, or continue as a guest.</div>`}
      <div class="cart-layout">
        <form id="coForm" novalidate>
          <section class="form-card card"><h3><span class="step">1</span>Delivery address</h3>
            <div class="fields">
              <div class="field"><label for="fName">Full name</label><input id="fName" autocomplete="name" value="${esc(u.name || "")}" required><span class="msg"></span></div>
              <div class="field"><label for="fPhone">Mobile number</label><input id="fPhone" type="tel" inputmode="tel" placeholder="05XXXXXXXX" autocomplete="tel" value="${esc(u.phone || "")}" required><span class="msg"></span></div>
              <div class="field full"><label for="fEmail">Email</label><input id="fEmail" type="email" autocomplete="email" value="${esc(u.email || "")}" required><span class="msg"></span></div>
              <div class="field full"><label for="fAddr">Street address, building, apartment</label><input id="fAddr" autocomplete="street-address" value="${esc(u.address || "")}" required><span class="msg"></span></div>
              <div class="field"><label for="fCity">City</label><select id="fCity" required><option value="">Select city</option>${cities.map(c => `<option ${u.city === c ? "selected" : ""}>${c}</option>`).join("")}</select><span class="msg"></span></div>
              <div class="field"><label for="fZip">Postal code</label><input id="fZip" inputmode="numeric" placeholder="5 digits" autocomplete="postal-code" required><span class="msg"></span></div>
            </div>
          </section>
          <section class="form-card card"><h3><span class="step">2</span>Payment method</h3>
            <div class="pay-opts">
              <label class="pay-opt"><input type="radio" name="pay" value="cod" checked><div><b>Cash on delivery</b><small>Pay with cash or card when your order arrives</small></div></label>
              <label class="pay-opt"><input type="radio" name="pay" value="card"><div><b>Credit or debit card</b><small>Visa, Mastercard, mada</small></div></label>
            </div>
            <div class="card-fields" id="cardFields" hidden>
              <div class="fields">
                <div class="field full"><label for="cNum">Card number</label><input id="cNum" inputmode="numeric" autocomplete="off" placeholder="4242 4242 4242 4242" maxlength="19"><span class="msg"></span></div>
                <div class="field"><label for="cExp">Expiry (MM/YY)</label><input id="cExp" inputmode="numeric" autocomplete="off" placeholder="MM/YY" maxlength="5"><span class="msg"></span></div>
                <div class="field"><label for="cCvv">CVV</label><input id="cCvv" inputmode="numeric" autocomplete="off" placeholder="123" maxlength="4"><span class="msg"></span></div>
              </div>
              <div class="note">Demo store: no payment is taken and card details are never saved or sent anywhere. Use the test number 4242 4242 4242 4242.</div>
            </div>
          </section>
          <section class="form-card card"><h3><span class="step">3</span>Review items</h3>
            ${t.items.map(l => `<div class="mini-line"><img src="${l.p.image}" alt=""><span>${esc(l.p.name)} <span class="muted">x ${l.qty}</span></span><b>${money(l.p.price * l.qty)}</b></div>`).join("")}
          </section>
        </form>
        ${summaryHtml(t, `<button class="btn btn-primary btn-block" id="placeBtn" type="button">Place order &middot; ${money(t.total)}</button><div class="muted" style="font-size:12px;margin-top:10px;text-align:center">${icon.shield.replace("<svg", '<svg style="width:14px;height:14px;vertical-align:-2px"')} This is a demo. No real order or payment.</div>`)}
      </div>
    </div>`;
    const cf = $("#cardFields");
    $$('input[name="pay"]').forEach(r => r.onchange = () => { cf.hidden = r.value !== "card" || !r.checked; });
    $("#cNum").oninput = e => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "); };
    $("#cExp").oninput = e => { let v = e.target.value.replace(/\D/g, "").slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2); e.target.value = v; };
    bindCoupon(() => viewCheckout(q));
    $("#placeBtn").onclick = () => placeOrder(t, buyNow);
  }

  function fieldErr(id, msg) {
    const el = $("#" + id).closest(".field");
    el.classList.toggle("err", !!msg);
    el.querySelector(".msg").textContent = msg || "";
    return !msg;
  }
  function placeOrder(t, buyNow) {
    const v = id => $("#" + id).value.trim();
    let ok = true;
    ok = fieldErr("fName", v("fName").length < 3 ? "Please enter your full name" : "") && ok;
    ok = fieldErr("fPhone", /^(05\d{8}|\+9665\d{8})$/.test(v("fPhone").replace(/\s/g, "")) ? "" : "Enter a valid Saudi mobile number, for example 0512345678") && ok;
    ok = fieldErr("fEmail", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("fEmail")) ? "" : "Enter a valid email address") && ok;
    ok = fieldErr("fAddr", v("fAddr").length < 6 ? "Please enter your full address" : "") && ok;
    ok = fieldErr("fCity", v("fCity") ? "" : "Please select a city") && ok;
    ok = fieldErr("fZip", /^\d{5}$/.test(v("fZip")) ? "" : "Postal code must be 5 digits") && ok;
    const pay = $('input[name="pay"]:checked').value;
    if (pay === "card") {
      const n = v("cNum").replace(/\s/g, "");
      ok = fieldErr("cNum", n.length >= 13 && luhn(n) ? "" : "Card number is not valid") && ok;
      const m = v("cExp").match(/^(\d{2})\/(\d{2})$/);
      let expOk = false;
      if (m) { const mm = +m[1], yy = 2000 + +m[2], now = new Date(); expOk = mm >= 1 && mm <= 12 && (yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1)); }
      ok = fieldErr("cExp", expOk ? "" : "Enter a valid future date") && ok;
      ok = fieldErr("cCvv", /^\d{3,4}$/.test(v("cCvv")) ? "" : "3 or 4 digits") && ok;
    }
    if (!ok) { const first = $(".field.err input, .field.err select"); if (first) first.focus(); toast("Please check the highlighted fields", null, true); return; }
    const btn = $("#placeBtn");
    btn.disabled = true; btn.textContent = "Placing your order...";
    setTimeout(() => {
      const id = "SQ" + Date.now().toString().slice(-8);
      const order = {
        id, date: new Date().toISOString(), status: "Confirmed",
        items: t.items.map(l => ({ id: l.p.id, name: l.p.name, price: l.p.price, qty: l.qty, image: l.p.image })),
        total: t.total, subtotal: t.subtotal, discount: t.discount, shipping: t.shipping,
        pay: pay === "card" ? "Card ending " + v("cNum").replace(/\s/g, "").slice(-4) : "Cash on delivery",
        address: { name: v("fName"), phone: v("fPhone"), email: v("fEmail"), line: v("fAddr"), city: v("fCity"), zip: v("fZip") },
        user: state.session
      };
      state.orders.unshift(order);
      if (buyNow) state.buyNow = null; else state.cart = [];
      state.coupon = null;
      const u = currentUser();
      if (u) { u.address = u.address || order.address.line; u.city = u.city || order.address.city; u.phone = u.phone || order.address.phone; }
      save();
      location.hash = "#/order/" + id;
    }, 900);
  }

  function viewOrder(id) {
    const o = state.orders.find(x => x.id === id);
    if (!o) return viewNotFound();
    const eta = new Date(new Date(o.date).getTime() + 3 * 864e5).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    app.innerHTML = `<div class="wrap">
      <section class="confirm card">
        <div class="tick">${icon.check}</div>
        <h1>Thank you, your order is placed!</h1>
        <p class="muted">A confirmation would be sent to ${esc(o.address.email)}.</p>
        <div class="oid">Order ${o.id}</div>
        <p>Estimated delivery: <b>${eta}</b><br><span class="muted">${esc(o.address.line)}, ${esc(o.address.city)} ${esc(o.address.zip)}</span></p>
        <div class="track">
          <div class="st done"><i>&#10003;</i>Ordered</div>
          <div class="st"><i>2</i>Packed</div>
          <div class="st"><i>3</i>Shipped</div>
          <div class="st"><i>4</i>Delivered</div>
        </div>
        <div class="items">
          ${o.items.map(i => `<div class="mini-line"><img src="${i.image}" alt=""><span>${esc(i.name)} <span class="muted">x ${i.qty}</span></span><b>${money(i.price * i.qty)}</b></div>`).join("")}
          <div class="srow total"><span>Total</span><span>${money(o.total)}</span></div>
          <div class="srow"><span class="muted">Payment</span><span>${esc(o.pay)}</span></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap">
          <a class="btn btn-primary" href="#/shop">Continue shopping</a>
          <a class="btn btn-ghost" href="#/orders">View my orders</a>
        </div>
        <p class="note">This is a portfolio demo. No real order was placed and no payment was taken.</p>
      </section>
    </div>`;
  }

  /* ---------- account ---------- */
  async function hash(s) {
    if (window.crypto && crypto.subtle) {
      const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
    }
    return btoa(s);
  }
  function viewAuth(q, mode = "login") {
    app.innerHTML = `<div class="wrap"><section class="auth card">
      <div class="tabs" role="tablist"><button class="${mode === "login" ? "on" : ""}" data-m="login" role="tab">Sign in</button><button class="${mode === "signup" ? "on" : ""}" data-m="signup" role="tab">Create account</button></div>
      <form id="authForm" novalidate>
        <div class="fields">
          ${mode === "signup" ? `<div class="field"><label for="aName">Full name</label><input id="aName" autocomplete="name"><span class="msg"></span></div>` : ""}
          <div class="field"><label for="aEmail">Email</label><input id="aEmail" type="email" autocomplete="email"><span class="msg"></span></div>
          <div class="field"><label for="aPass">Password</label><input id="aPass" type="password" autocomplete="${mode === "signup" ? "new-password" : "current-password"}"><span class="msg"></span></div>
        </div>
        <button class="btn btn-primary btn-block" style="margin-top:18px" type="submit">${mode === "signup" ? "Create account" : "Sign in"}</button>
      </form>
      <p class="note">Accounts are stored only in this browser (localStorage) for the demo. Do not use a real password.</p>
    </section></div>`;
    $$(".tabs button").forEach(b => b.onclick = () => viewAuth(q, b.dataset.m));
    $("#authForm").onsubmit = async e => {
      e.preventDefault();
      const email = $("#aEmail").value.trim().toLowerCase(), pass = $("#aPass").value;
      let ok = fieldErr("aEmail", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter a valid email address");
      ok = fieldErr("aPass", pass.length >= 6 ? "" : "Password must be at least 6 characters") && ok;
      if (mode === "signup") ok = fieldErr("aName", $("#aName").value.trim().length >= 3 ? "" : "Please enter your name") && ok;
      if (!ok) return;
      const h = await hash(pass);
      if (mode === "signup") {
        if (state.users.some(u => u.email === email)) return fieldErr("aEmail", "An account with this email already exists");
        state.users.push({ name: $("#aName").value.trim(), email, pass: h, phone: "", city: "", address: "", since: new Date().toISOString() });
        toast("Welcome to Souqly!");
      } else {
        const u = state.users.find(x => x.email === email);
        if (!u || u.pass !== h) return fieldErr("aPass", "Email or password is incorrect");
        toast("Signed in");
      }
      state.session = email; save();
      go(q.get("next") === "checkout" ? "#/checkout" : "#/account");
    };
  }
  function viewAccount(q, tab = "profile") {
    const u = currentUser();
    if (!u) return viewAuth(q);
    const myOrders = state.orders.filter(o => o.user === u.email);
    const spent = myOrders.reduce((a, o) => a + o.total, 0);
    const ordersHtml = myOrders.length ? myOrders.map(o => `<div class="order card">
        <div class="order-head"><span><b>Order ${o.id}</b> &middot; ${new Date(o.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span><span class="pill">${o.status}</span></div>
        ${o.items.map(i => `<div class="mini-line"><img src="${i.image}" alt=""><span><a href="#/product/${i.id}">${esc(i.name)}</a> <span class="muted">x ${i.qty}</span></span><b>${money(i.price * i.qty)}</b></div>`).join("")}
        <div class="srow" style="border-top:1px solid var(--line);margin-top:6px;padding-top:10px"><span class="muted">${esc(o.pay)}</span><b>${money(o.total)}</b></div>
      </div>`).join("") : `<div class="empty card">${icon.box}<h2>No orders yet</h2><p class="muted">Your orders will show up here.</p><a class="btn btn-primary" href="#/shop">Start shopping</a></div>`;
    app.innerHTML = `<div class="wrap"><div class="profile">
      <aside class="pside card">
        <div class="avatar">${esc(u.name[0].toUpperCase())}</div>
        <b>${esc(u.name)}</b><div class="muted" style="font-size:13px">${esc(u.email)}</div>
        <nav>
          <a href="#/account" class="${tab === "profile" ? "on" : ""}">Profile</a>
          <a href="#/orders" class="${tab === "orders" ? "on" : ""}">My orders</a>
          <a href="#/wishlist">Wishlist</a>
          <button id="logout">Sign out</button>
        </nav>
      </aside>
      <section>
        <div class="stats">
          <div class="stat card"><b>${myOrders.length}</b><span>Orders</span></div>
          <div class="stat card"><b>${state.wish.length}</b><span>Wishlist</span></div>
          <div class="stat card"><b>${money(spent).replace("SAR ", "")}</b><span>SAR spent</span></div>
        </div>
        ${tab === "orders" ? `<h2 style="margin:0 0 12px">My orders</h2>${ordersHtml}` : `
        <form class="form-card card" id="profForm" novalidate>
          <h3>Personal details</h3>
          <div class="fields">
            <div class="field"><label for="pName">Full name</label><input id="pName" value="${esc(u.name)}"><span class="msg"></span></div>
            <div class="field"><label for="pPhone">Mobile number</label><input id="pPhone" type="tel" value="${esc(u.phone || "")}" placeholder="05XXXXXXXX"><span class="msg"></span></div>
            <div class="field full"><label for="pAddr">Default address</label><input id="pAddr" value="${esc(u.address || "")}"><span class="msg"></span></div>
            <div class="field"><label for="pCity">City</label><input id="pCity" value="${esc(u.city || "")}"><span class="msg"></span></div>
            <div class="field"><label>Member since</label><input value="${new Date(u.since || Date.now()).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}" disabled></div>
          </div>
          <button class="btn btn-primary" style="margin-top:16px" type="submit">Save changes</button>
        </form>`}
      </section>
    </div></div>`;
    $("#logout").onclick = () => { state.session = null; save(); toast("Signed out"); go("#/"); };
    const pf = $("#profForm");
    if (pf) pf.onsubmit = e => {
      e.preventDefault();
      const name = $("#pName").value.trim(), phone = $("#pPhone").value.trim().replace(/\s/g, "");
      let ok = fieldErr("pName", name.length >= 3 ? "" : "Please enter your name");
      ok = fieldErr("pPhone", !phone || /^(05\d{8}|\+9665\d{8})$/.test(phone) ? "" : "Enter a valid Saudi mobile number") && ok;
      if (!ok) return;
      Object.assign(u, { name, phone, address: $("#pAddr").value.trim(), city: $("#pCity").value.trim() });
      save(); toast("Profile updated"); viewAccount(q);
    };
  }

  function viewNotFound() {
    app.innerHTML = `<div class="wrap"><div class="empty card" style="margin:30px 0">${icon.box}<h2>Page not found</h2><p class="muted">The page you are looking for does not exist.</p><a class="btn btn-primary" href="#/">Back to home</a></div></div>`;
  }

  /* ---------- router ---------- */
  function route() {
    const h = location.hash.slice(1) || "/";
    const [path, qs] = h.split("?");
    const q = new URLSearchParams(qs || "");
    const parts = path.split("/").filter(Boolean);
    closeDrawer();
    $("#suggest").classList.remove("open");
    $$("#catbarInner a").forEach(a => a.classList.toggle("on", parts[0] === "shop" && q.getAll("cat").length === 1 && a.dataset.cat === q.get("cat")));
    switch (parts[0]) {
      case undefined: viewHome(); break;
      case "shop": viewShop(q); break;
      case "product": viewProduct(parts[1]); break;
      case "cart": viewCart(); break;
      case "wishlist": viewWishlist(); break;
      case "checkout": viewCheckout(q); break;
      case "order": viewOrder(parts[1]); break;
      case "account": viewAccount(q); break;
      case "orders": viewAccount(q, "orders"); break;
      default: viewNotFound();
    }
    if (parts[0] !== "shop") $("#searchInput").value = "";
    const titles = { shop: "Shop", product: (byId(parts[1]) || {}).name, cart: "Cart", wishlist: "Wishlist", checkout: "Checkout", order: "Order confirmed", account: "My account", orders: "My orders" };
    document.title = (titles[parts[0]] ? titles[parts[0]] + " | " : "") + "Souqly";
    window.scrollTo(0, 0);
  }

  /* ---------- global UI ---------- */
  function openDrawer() { $("#drawer").classList.add("open"); $("#drawerBg").classList.add("open"); }
  function closeDrawer() { $("#drawer").classList.remove("open"); $("#drawerBg").classList.remove("open"); const f = $("#filters"); if (f) f.classList.remove("open"); }

  function initChrome() {
    const catLinks = CATEGORIES.map(c => `<a href="#/shop?cat=${encodeURIComponent(c)}" data-cat="${esc(c)}">${c}</a>`).join("");
    $("#catbarInner").innerHTML = `<a href="#/shop">All products</a>` + catLinks + `<a href="#/shop?sort=discount">Top deals</a>`;
    $("#drawerLinks").innerHTML = `<a href="#/">Home</a><a href="#/shop">All products</a>` + catLinks + `<a href="#/account">My account</a><a href="#/orders">My orders</a>`;
    $("#footCats").innerHTML = CATEGORIES.slice(0, 5).map(c => `<a href="#/shop?cat=${encodeURIComponent(c)}">${c}</a>`).join("");
    $("#searchCat").innerHTML = `<option value="">All</option>` + CATEGORIES.map(c => `<option>${c}</option>`).join("");
    $("#year").textContent = new Date().getFullYear();
    $("#menuBtn").onclick = openDrawer;
    $("#drawerClose").onclick = closeDrawer;
    $("#drawerBg").onclick = closeDrawer;
    document.addEventListener("keydown", e => { if (e.key === "Escape") { closeDrawer(); $("#suggest").classList.remove("open"); } });

    // delegated product-card actions
    app.addEventListener("click", e => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      e.preventDefault();
      if (b.dataset.act === "add") addToCart(b.dataset.id);
      if (b.dataset.act === "wish") toggleWish(b.dataset.id);
    });

    // search with live suggestions
    const input = $("#searchInput"), sug = $("#suggest");
    let active = -1;
    const renderSug = () => {
      const v = input.value.trim().toLowerCase();
      if (v.length < 2) { sug.classList.remove("open"); return; }
      const m = PRODUCTS.filter(p => (p.name + " " + p.category).toLowerCase().includes(v)).slice(0, 6);
      active = -1;
      sug.innerHTML = m.length ? m.map(p => `<li><a href="#/product/${p.id}"><img src="${p.image}" alt=""><span>${esc(p.name)}<small>${p.category} &middot; ${money(p.price)}</small></span></a></li>`).join("") : `<li style="padding:10px;color:var(--muted)">No matches. Press Enter to search.</li>`;
      sug.classList.add("open");
    };
    input.addEventListener("input", renderSug);
    input.addEventListener("keydown", e => {
      const items = $$("a", sug);
      if (!sug.classList.contains("open") || !items.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach((a, i) => a.classList.toggle("active", i === active));
      } else if (e.key === "Enter" && active > -1) { e.preventDefault(); location.hash = items[active].getAttribute("href"); input.blur(); }
    });
    document.addEventListener("click", e => { if (!e.target.closest(".search")) sug.classList.remove("open"); });
    $("#searchForm").onsubmit = e => {
      e.preventDefault();
      const p = new URLSearchParams();
      if (input.value.trim()) p.set("q", input.value.trim());
      if ($("#searchCat").value) p.set("cat", $("#searchCat").value);
      sug.classList.remove("open"); input.blur();
      location.hash = "#/shop" + (p.toString() ? "?" + p : "");
    };
    window.addEventListener("storage", () => { state.cart = store.get("cart", []); state.wish = store.get("wish", []); updateBadges(); });
  }

  initChrome();
  updateBadges();
  window.addEventListener("hashchange", route);
  route();
})();
