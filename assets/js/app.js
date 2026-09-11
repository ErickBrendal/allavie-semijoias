/* Allavie — vitrine, sacola e pedido pelo Direct do Instagram */
(() => {
  "use strict";
  const CATALOG = window.ALLAVIE_CATALOG || [];
  const DEST = window.ALLAVIE_DESTAQUES || [];
  const CFG = window.ALLAVIE_CONFIG || { instagram: "allavie.semijoias", dona: "Neyla" };
  const IG_DM = `https://ig.me/m/${CFG.instagram}`;
  const BY_ID = Object.fromEntries(CATALOG.map(p => [p.id, p]));
  const CATS = [
    { key: "todos", label: "Todos" },
    { key: "brincos", label: "Brincos" },
    { key: "pulseiras", label: "Pulseiras" },
    { key: "aneis", label: "Anéis" },
    { key: "colares", label: "Colares" },
    { key: "especiais", label: "Especiais" },
  ];
  const CAT_LABEL = Object.fromEntries(CATS.map(c => [c.key, c.label]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const img = id => `/assets/img/${id}.webp`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Storage seguro ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  /* ---------- Estado ---------- */
  let cart = store.get("allavie:cart", []).filter(l => BY_ID[l.id] && l.qty > 0);
  const state = { cat: "todos", tom: "todos", q: "", sort: "catalogo" };

  /* ---------- Cards ---------- */
  const bagIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
  function cardHTML(p, lazy = true) {
    const tag = p.social
      ? '<span class="card__tag card__tag--social">Coleção Inclusão</span>'
      : `<span class="card__tag"><i class="dot dot--${p.tom === "dourado" ? "gold" : "silver"}"></i>${p.tom}</span>`;
    return `<article class="card" data-id="${p.id}">
      <button class="card__media" data-view="${p.id}" aria-label="Ver detalhes: ${esc(p.nome)}">
        ${tag}
        <img src="${img(p.id)}" alt="${esc(p.nome)}" ${lazy ? 'loading="lazy"' : ""} decoding="async" width="800" height="800">
        <span class="card__view">Ver peça</span>
      </button>
      <div class="card__body">
        <h3 class="card__name">${esc(p.nome)}</h3>
        <span class="card__cod">Cód. ${esc(p.cod)} · ${CAT_LABEL[p.cat]}</span>
        <div class="card__row">
          <span class="price">${brl(p.preco)}</span>
          <button class="add" data-add="${p.id}" aria-label="Adicionar ${esc(p.nome)} à sacola">${bagIcon}<span>Adicionar</span></button>
        </div>
      </div>
    </article>`;
  }

  /* ---------- Destaques ---------- */
  const rail = $("#rail");
  rail.innerHTML = DEST.map(id => BY_ID[id]).filter(Boolean).map(p => cardHTML(p)).join("");
  $$("[data-rail]").forEach(b => b.addEventListener("click", () => {
    rail.scrollBy({ left: Number(b.dataset.rail) * rail.clientWidth * 0.8, behavior: "smooth" });
  }));

  /* ---------- Fatos do hero ---------- */
  $("#factCount").textContent = CATALOG.length;
  $("#factFrom").textContent = brl(Math.min(...CATALOG.map(p => p.preco))).replace(",00", "");

  /* ---------- Filtros ---------- */
  const chips = $("#chips");
  chips.innerHTML = CATS.map(c => {
    const n = c.key === "todos" ? CATALOG.length : CATALOG.filter(p => p.cat === c.key).length;
    return `<button class="chip${c.key === state.cat ? " is-active" : ""}" role="tab" aria-selected="${c.key === state.cat}" data-cat="${c.key}">${c.label}<small>${n}</small></button>`;
  }).join("");
  chips.addEventListener("click", e => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    state.cat = b.dataset.cat;
    $$(".chip", chips).forEach(c => { const on = c === b; c.classList.toggle("is-active", on); c.setAttribute("aria-selected", on); });
    render(true);
  });
  $$(".tone__btn").forEach(b => b.addEventListener("click", () => {
    state.tom = b.dataset.tom;
    $$(".tone__btn").forEach(x => x.classList.toggle("is-active", x === b));
    render(true);
  }));
  let t; $("#search").addEventListener("input", e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 140); });
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; render(); });
  $("#clearFilters").addEventListener("click", () => {
    state.cat = "todos"; state.tom = "todos"; state.q = ""; state.sort = "catalogo";
    $("#search").value = ""; $("#sort").value = "catalogo";
    $$(".chip").forEach(c => c.classList.toggle("is-active", c.dataset.cat === "todos"));
    $$(".tone__btn").forEach(x => x.classList.toggle("is-active", x.dataset.tom === "todos"));
    render();
  });

  const grid = $("#grid");
  function render(scroll = false) {
    const q = norm(state.q.trim());
    let list = CATALOG.filter(p =>
      (state.cat === "todos" || p.cat === state.cat) &&
      (state.tom === "todos" || p.tom === state.tom) &&
      (!q || norm(`${p.nome} ${p.cod} ${CAT_LABEL[p.cat]} ${p.tom}`).includes(q)));
    if (state.sort === "menor") list = [...list].sort((a, b) => a.preco - b.preco);
    if (state.sort === "maior") list = [...list].sort((a, b) => b.preco - a.preco);
    if (state.sort === "az") list = [...list].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    grid.innerHTML = list.map((p, i) => cardHTML(p, i > 7)).join("");
    $$(".card", grid).forEach((c, i) => c.style.animationDelay = `${Math.min(i, 12) * 35}ms`);
    $("#results").textContent = `${list.length} ${list.length === 1 ? "peça" : "peças"}`;
    $("#empty").hidden = list.length > 0;
    syncAddedButtons();
    if (scroll) {
      const top = $("#colecao").getBoundingClientRect().top;
      if (top < -200) $("#filters").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ---------- Sacola ---------- */
  const qtyOf = id => (cart.find(l => l.id === id) || {}).qty || 0;
  function save() { store.set("allavie:cart", cart); updateCartUI(); }
  function add(id, qty = 1, sourceEl) {
    const p = BY_ID[id]; if (!p) return;
    const line = cart.find(l => l.id === id);
    if (line) line.qty = Math.min(line.qty + qty, 20); else cart.push({ id, qty });
    save();
    flyToCart(id, sourceEl);
    toast(`✦ ${p.nome.split(" ").slice(0, 4).join(" ")} na sacola`);
  }
  function setQty(id, qty) {
    if (qty <= 0) cart = cart.filter(l => l.id !== id);
    else { const l = cart.find(l => l.id === id); if (l) l.qty = Math.min(qty, 20); }
    save();
  }
  const count = () => cart.reduce((s, l) => s + l.qty, 0);
  const total = () => cart.reduce((s, l) => s + l.qty * BY_ID[l.id].preco, 0);

  function syncAddedButtons() {
    $$("[data-add]").forEach(b => {
      if (!b.classList.contains("add")) return;
      const q = qtyOf(b.dataset.add);
      b.classList.toggle("is-added", q > 0);
      const s = b.querySelector("span"); if (s) s.textContent = q > 0 ? `Na sacola (${q})` : "Adicionar";
    });
  }
  function updateCartUI() {
    const n = count(), tot = total();
    const badge = $("#cartCount");
    badge.hidden = n === 0; badge.textContent = n;
    $("#cartItems").innerHTML = cart.map(l => {
      const p = BY_ID[l.id];
      return `<div class="line" data-id="${p.id}">
        <img src="${img(p.id)}" alt="" width="78" height="78" loading="lazy">
        <div><p class="line__name">${esc(p.nome)}</p><span class="line__cod">Cód. ${esc(p.cod)} · ${brl(p.preco)}</span>
          <div class="qty"><button data-dq="-1" aria-label="Diminuir">−</button><span>${l.qty}</span><button data-dq="1" aria-label="Aumentar">+</button></div></div>
        <div class="line__right"><span class="line__price">${brl(p.preco * l.qty)}</span><button class="line__rm" data-rm>Remover</button></div>
      </div>`;
    }).join("");
    $("#cartTotal").textContent = brl(tot);
    $("#cartEmpty").hidden = n > 0;
    $("#cartItems").hidden = n === 0;
    $("#cartFoot").hidden = n === 0;
    const mbar = $("#mbar");
    $("#mbarCount").textContent = `${n} ${n === 1 ? "item" : "itens"}`;
    $("#mbarTotal").textContent = brl(tot);
    mbar.hidden = false;
    requestAnimationFrame(() => {
      const show = n > 0 && !drawer.classList.contains("is-open");
      mbar.classList.toggle("is-visible", show);
      document.body.classList.toggle("has-mbar", show && matchMedia("(max-width: 980px)").matches);
    });
    syncAddedButtons();
  }
  $("#cartItems").addEventListener("click", e => {
    const line = e.target.closest(".line"); if (!line) return;
    const id = line.dataset.id;
    if (e.target.closest("[data-rm]")) setQty(id, 0);
    const dq = e.target.closest("[data-dq]"); if (dq) setQty(id, qtyOf(id) + Number(dq.dataset.dq));
  });
  $("#clearCart").addEventListener("click", () => { if (confirm("Esvaziar a sacola?")) { cart = []; save(); } });

  /* ---------- Drawer ---------- */
  const drawer = $("#drawer"), overlay = $("#overlay");
  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    overlay.hidden = false; requestAnimationFrame(() => overlay.classList.add("is-open"));
    drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false");
    $("#mbar").classList.remove("is-visible");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#closeCart").focus(), 50);
  }
  function closeCart() {
    overlay.classList.remove("is-open"); setTimeout(() => { if (!overlay.classList.contains("is-open")) overlay.hidden = true; }, 400);
    drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    updateCartUI();
    lastFocus && lastFocus.focus && lastFocus.focus();
  }
  $("#openCart").addEventListener("click", openCart);
  $("#mbar").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  $$("[data-close]", drawer).forEach(a => a.addEventListener("click", closeCart));

  /* ---------- Modais ---------- */
  function openModal(m) { m.hidden = false; requestAnimationFrame(() => m.classList.add("is-open")); document.body.style.overflow = "hidden"; }
  function closeModal(m) { m.classList.remove("is-open"); setTimeout(() => { m.hidden = true; }, 320); if (!drawer.classList.contains("is-open")) document.body.style.overflow = ""; }
  $$(".modal").forEach(m => {
    m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close-modal]")) closeModal(m); });
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const open = $$(".modal").find(m => !m.hidden);
    if (open) closeModal(open); else if (drawer.classList.contains("is-open")) closeCart();
  });

  /* Quick view */
  const quick = $("#quick"); let qvId = null, qvQty = 1;
  function openQuick(id) {
    const p = BY_ID[id]; if (!p) return;
    qvId = id; qvQty = 1;
    $("#qvImg").src = img(id); $("#qvImg").alt = p.nome;
    $("#qvCat").textContent = p.social ? "Coleção Inclusão" : CAT_LABEL[p.cat];
    $("#qvName").textContent = p.nome;
    $("#qvMeta").innerHTML = `<span>Cód. ${esc(p.cod)}</span><span><i class="dot dot--${p.tom === "dourado" ? "gold" : "silver"}"></i> ${p.tom}</span>`;
    $("#qvPrice").textContent = brl(p.preco);
    $("#qvSocial").hidden = !p.social;
    $("#qvQty").textContent = qvQty;
    openModal(quick);
  }
  $$("[data-q]", quick).forEach(b => b.addEventListener("click", () => { qvQty = Math.max(1, Math.min(20, qvQty + Number(b.dataset.q))); $("#qvQty").textContent = qvQty; }));
  $("#qvAdd").addEventListener("click", () => { add(qvId, qvQty, $("#qvImg")); closeModal(quick); });
  $("#qvBuy").addEventListener("click", () => { add(qvId, qvQty, $("#qvImg")); closeModal(quick); setTimeout(openCart, 450); });
  // zoom com o mouse na foto
  const qvImgBox = $(".qv__img");
  qvImgBox.addEventListener("mousemove", e => {
    const r = qvImgBox.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
    $("#qvImg").style.transformOrigin = `${x}% ${y}%`; $("#qvImg").style.transform = "scale(1.8)";
  });
  qvImgBox.addEventListener("mouseleave", () => { $("#qvImg").style.transform = ""; });

  /* Cliques globais (adicionar / ver) */
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-add]");
    if (a) { e.preventDefault(); const card = a.closest(".card"); add(a.dataset.add, 1, card ? card.querySelector("img") : a); return; }
    const v = e.target.closest("[data-view]");
    if (v) { e.preventDefault(); openQuick(v.dataset.view); }
  });

  /* ---------- Checkout via Instagram ---------- */
  const checkout = $("#checkout");
  function orderCode() {
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    return `ALV-${ymd}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  }
  function buildMessage({ name, city, note, code }) {
    const lines = cart.map(l => { const p = BY_ID[l.id]; return `• ${l.qty}x ${p.nome} (Cód. ${p.cod}) — ${brl(p.preco * l.qty)}`; });
    return [
      `Olá, ${CFG.dona}! 💎 Vim pelo site da Allavie e quero fazer um pedido:`,
      ``,
      `🧾 Pedido ${code}`,
      ...lines,
      ``,
      `Total: ${brl(total())} (${count()} ${count() === 1 ? "peça" : "peças"})`,
      ``,
      `👤 Nome: ${name}`,
      city ? `📍 Cidade/bairro: ${city}` : null,
      note ? `📝 Obs.: ${note}` : null,
      ``,
      `Pode confirmar a disponibilidade, forma de pagamento e entrega? Obrigada! ✨`,
    ].filter(l => l !== null).join("\n");
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0;top:0";
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      let ok = false; try { ok = document.execCommand("copy"); } catch {}
      ta.remove(); return ok;
    }
  }
  $("#checkoutBtn").addEventListener("click", () => {
    if (!cart.length) return;
    $("#coSummary").innerHTML = `<ul>${cart.map(l => { const p = BY_ID[l.id]; return `<li><span>${l.qty}x ${esc(p.nome)}</span><span>${brl(p.preco * l.qty)}</span></li>`; }).join("")}</ul><div class="t"><span>Total</span><span>${brl(total())}</span></div>`;
    const saved = store.get("allavie:cliente", {});
    $("#coName").value = saved.name || ""; $("#coCity").value = saved.city || "";
    $("#coForm").hidden = false; $("#coDone").hidden = true; $("#coError").hidden = true;
    openModal(checkout);
    setTimeout(() => $("#coName").focus(), 120);
  });
  let lastMsg = "";
  $("#coSend").addEventListener("click", async () => {
    const name = $("#coName").value.trim(), city = $("#coCity").value.trim(), note = $("#coNote").value.trim();
    if (!name) { $("#coError").hidden = false; $("#coName").focus(); return; }
    store.set("allavie:cliente", { name, city });
    lastMsg = buildMessage({ name, city, note, code: orderCode() });
    const ok = await copy(lastMsg);
    $("#coMsg").value = lastMsg;
    $("#coForm").hidden = true; $("#coDone").hidden = false;
    $("#coDone h3").textContent = ok ? "Pedido copiado!" : "Seu pedido está pronto!";
    if (!ok) $("#coDone details").open = true;
    // abre o Direct automaticamente (mesmo gesto do clique)
    window.open(IG_DM, "_blank", "noopener");
  });
  $("#coCopy").addEventListener("click", async () => { const ok = await copy(lastMsg); toast(ok ? "Pedido copiado ✦ agora é só colar no Direct" : "Selecione o texto abaixo e copie"); if (!ok) $("#coDone details").open = true; });

  /* Personalizada */
  $("#customBtn").addEventListener("click", async () => {
    const msg = `Olá, ${CFG.dona}! 💎 Vim pelo site da Allavie e quero criar uma joia personalizada. Minha ideia é: `;
    const ok = await copy(msg);
    toast(ok ? "Mensagem copiada ✦ cole no Direct e conte sua ideia" : "Abrindo o Direct da Allavie…");
    setTimeout(() => window.open(IG_DM, "_blank", "noopener"), ok ? 700 : 0);
  });

  /* ---------- Micro-interações ---------- */
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.classList.add("is-show");
    clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("is-show"), 2300);
  }
  function flyToCart(id, fromEl) {
    const btn = $("#openCart");
    btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
    if (reduceMotion || !fromEl) return;
    const r = fromEl.getBoundingClientRect(), to = btn.getBoundingClientRect();
    if (!r.width) return;
    const f = document.createElement("img");
    f.src = img(id); f.className = "fly";
    const size = Math.min(r.width, 140);
    Object.assign(f.style, { left: `${r.left + r.width / 2 - size / 2}px`, top: `${r.top + r.height / 2 - size / 2}px`, width: `${size}px`, height: `${size}px` });
    document.body.appendChild(f);
    requestAnimationFrame(() => {
      const dx = to.left + to.width / 2 - (r.left + r.width / 2), dy = to.top + to.height / 2 - (r.top + r.height / 2);
      f.style.transform = `translate(${dx}px, ${dy}px) scale(.18)`; f.style.opacity = ".6";
    });
    setTimeout(() => {
      f.remove();
      for (let i = 0; i < 10; i++) {
        const s = document.createElement("span"); s.className = "burst";
        const a = (Math.PI * 2 * i) / 10, d = 22 + Math.random() * 16;
        s.style.left = `${to.left + to.width / 2}px`; s.style.top = `${to.top + to.height / 2}px`;
        s.style.setProperty("--dx", `${Math.cos(a) * d}px`); s.style.setProperty("--dy", `${Math.sin(a) * d}px`);
        document.body.appendChild(s); setTimeout(() => s.remove(), 750);
      }
    }, 800);
  }

  /* Header com sombra ao rolar */
  const header = $(".header");
  addEventListener("scroll", () => header.classList.toggle("is-scrolled", scrollY > 10), { passive: true });

  /* Reveal ao rolar */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  } else $$(".reveal").forEach(el => el.classList.add("is-in"));

  /* Brilhos no hero */
  (function sparkles() {
    const c = $("#sparkles"); if (!c || reduceMotion) return;
    const ctx = c.getContext("2d"); let w, h, dpr, parts = [], running = true;
    function size() { dpr = Math.min(devicePixelRatio || 1, 2); w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spawn() { return { x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .4, a: 0, v: Math.random() * .012 + .004, up: Math.random() * .25 + .05, star: Math.random() < .18 }; }
    size(); addEventListener("resize", size);
    const N = Math.round(Math.min(70, w / 16)); for (let i = 0; i < N; i++) { const p = spawn(); p.a = Math.random(); parts.push(p); }
    new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) requestAnimationFrame(tick); }).observe(c);
    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.a += p.v; p.y -= p.up; const al = Math.sin(p.a * Math.PI);
        if (p.a >= 1 || p.y < -10) Object.assign(p, spawn(), { a: 0 });
        ctx.globalAlpha = Math.max(0, al) * .9;
        if (p.star) {
          const s = p.r * 4; ctx.strokeStyle = "#D9B56F"; ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(p.x - s, p.y); ctx.lineTo(p.x + s, p.y); ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x, p.y + s); ctx.stroke();
        }
        ctx.fillStyle = p.star ? "#FFF6E3" : "#D9B56F"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* Balão "fale com a Neyla" aparece uma vez */
  const chat = $("#chat");
  if (chat) setTimeout(() => { chat.classList.add("show-bubble"); setTimeout(() => chat.classList.remove("show-bubble"), 6000); }, 4500);

  $("#year").textContent = new Date().getFullYear();

  render();
  updateCartUI();
})();
