/* CN Study Notebook — app engine (vanilla JS, no build step).
   Each topic is laid out into fixed-height pages and shown as a two-page spread (one page on narrow screens). */
(function () {
  'use strict';

  var UNIT_NAMES = { '0': 'Start here', '1': 'Unit 1 · Internet & Application Layer', '2': 'Unit 2 · Transport & Network Layer', '3': 'Unit 3 · Link Layer, Physical Layer & SDN', 'qb': 'Question Bank & Practice' };
  var UNIT_SHORT = { '0': 'Intro', '1': 'Unit 1', '2': 'Unit 2', '3': 'Unit 3', 'qb': 'Practice' };
  var KIND = {
    qb: ['qb', 'Question bank · verbatim'],
    qbnum: ['qb', 'Question bank · numerical'],
    lec: ['lec', 'From lecture slides'],
    extra: ['extra', 'Additional practice (generated)']
  };
  var DUAL_MIN_WIDTH = Infinity; // single column always (user preference: one landscape page, no split)

  var $ = function (id) { return document.getElementById(id); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable: memory only */ } }
  };

  /* ---------- Questions → HTML ---------- */
  function defaultAnsLabel(kind) {
    if (kind === 'qbnum') return 'Solution as given in CN_Practice_QuestionBank.pdf, with step annotations added.';
    if (kind === 'qb') return 'Model answer written from the lecture materials (the question bank gives no official answer).';
    if (kind === 'lec') return 'Answer reasoned from the lecture slides (the slides give no official answer).';
    return 'Answer reasoned from the course materials — not an official solution.';
  }
  // Answer HTML is emitted as separate top-level blocks so long answers can flow across pages.
  function answerParts(q) {
    var tmp = document.createElement('div');
    tmp.innerHTML = q.a;
    var out = '<div class="ans-part ans-head" data-qa="' + q.id + '">' + (q.aLabel || defaultAnsLabel(q.kind)) + '</div>';
    Array.prototype.forEach.call(tmp.childNodes, function (n) {
      if (n.nodeType === 3) { if (n.nodeValue.trim()) out += '<p class="ans-part">' + CN.esc(n.nodeValue.trim()) + '</p>'; return; }
      if (n.nodeType !== 1) return;
      n.classList.add('ans-part');
      out += n.outerHTML;
    });
    return out;
  }
  function questionHTML(q, withTopicLink, open) {
    var k = KIND[q.kind] || KIND.extra;
    var topic = withTopicLink && q.topic ? spreadById[q.topic] : null;
    var h = '<div class="q" id="q-' + q.id + '"><div class="q-top"><div class="q-meta">' +
      '<span class="badge ' + k[0] + '">' + k[1] + '</span>' +
      '<span class="badge plain">' + q.id + '</span>' +
      (q.marks ? '<span class="badge plain">' + q.marks + '</span>' : '') + '</div>' +
      '<div class="q-text">' + q.q + '</div>';
    if (q.cover) h += '<div class="q-cover">Cover in your answer:<ul>' + q.cover.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul></div>';
    if (topic) h += '<a class="q-link" href="#' + topic.id + '">Study topic: ' + topic.title + ' →</a>';
    if (q.a) h += '<div class="q-actions"><button type="button" class="ans-btn" data-q="' + q.id + '" aria-expanded="' + !!open + '">' + (open ? '− Hide answer' : '+ Show answer') + '</button></div>';
    h += '</div></div>';
    if (q.a && open) h += answerParts(q);
    return h;
  }

  /* ---------- Build the topic list ---------- */
  var order = ['0', '1', '2', '3', 'qb'];
  var spreads = [];
  var spreadById = {};
  order.forEach(function (u) { CN.spreads.forEach(function (s) { if (s.unit === u) spreads.push(s); }); });
  spreads.forEach(function (s) { spreadById[s.id] = s; });

  // Question-bank index topics, generated from the single question list (no duplicated text).
  [
    { id: 'qb-u1-desc', title: 'Unit 1 — Descriptive questions (question bank)', unit: '1', kinds: ['qb'], src: 'CN_Practice_QuestionBank.pdf', intro: 'All Section A questions for Unit 1, wording preserved. Each links to the topic where it is explained.' },
    { id: 'qb-u1-num', title: 'Unit 1 — Numerical problems (question bank)', unit: '1', kinds: ['qbnum'], src: 'CN_Practice_QuestionBank.pdf', intro: 'Section B numericals UN-1 to UN-9 with the bank’s own solutions, annotated step by step.' },
    { id: 'qb-u2-desc', title: 'Unit 2 — Descriptive questions (question bank)', unit: '2', kinds: ['qb'], src: 'CN_Practice_QuestionBank.pdf', intro: 'All Section A questions for Unit 2. The bank covers only the transport-layer half of Unit 2 (mid-term bank).' },
    { id: 'qb-u2-num', title: 'Unit 2 — Numerical problems (question bank)', unit: '2', kinds: ['qbnum'], src: 'CN_Practice_QuestionBank.pdf', intro: 'Section B numericals TN-1 to TN-9 with the bank’s own solutions, annotated.' },
    { id: 'qb-lec', title: 'Lecture-slide questions (all units)', unit: null, kinds: ['lec'], src: 'Lecture slide decks, Units 1–3', intro: 'Questions printed on the lecture slides. The slides give no answers; answers here are reasoned from slide content.' },
    { id: 'qb-extra', title: 'Additional practice (generated)', unit: null, kinds: ['extra'], src: 'Generated from the course materials', intro: 'Newly written questions — <b>not</b> from the question bank or slides — for areas the bank does not reach (network-layer half of Unit 2, all of Unit 3).' }
  ].forEach(function (set) {
    var qs = CN.questions.filter(function (q) { return set.kinds.indexOf(q.kind) >= 0 && (!set.unit || q.unit === set.unit); });
    if (!qs.length) return;
    var s = { id: set.id, unit: 'qb', group: 'Question Bank & Practice', title: set.title, kicker: 'PRACTICE', src: [set.src], intro: set.intro, qlist: qs, isQB: true };
    spreads.push(s); spreadById[s.id] = s;
  });
  spreads.forEach(function (s, i) { s.index = i; });

  function topicQuestions(s) { return s.isQB ? s.qlist : CN.questions.filter(function (q) { return q.topic === s.id; }); }

  /* Full content of a topic as one flow of blocks. open: map of question ids to show answers, or 'all'. */
  function flowHTML(s, open) {
    open = open || {};
    var isOpen = function (q) { return open === 'all' || !!open[q.id]; };
    var h = '<div class="kicker">' + (s.kicker || '') + '</div><h1>' + s.title + '</h1>' + (s.src ? CN.src.apply(null, s.src) : '');
    var qs = topicQuestions(s);
    if (s.isQB) {
      h += '<p class="lead">' + s.intro + '</p><p class="small muted">' + qs.length + ' questions. Attempt each before opening its answer.</p>';
      return h + qs.map(function (q) { return questionHTML(q, true, isOpen(q)); }).join('');
    }
    h += s.left + (s.right || '');
    if (qs.length) h += '<div class="qset-head">Practice for this topic (' + qs.length + ')</div>' + qs.map(function (q) { return questionHTML(q, false, isOpen(q)); }).join('');
    return h;
  }
  function numberFigures(root, s) {
    root.querySelectorAll('.fig-no').forEach(function (el, i) { el.textContent = 'Fig ' + s.index + '.' + (i + 1); });
  }

  /* ---------- Mermaid ---------- */
  var mmdReady = typeof window.mermaid !== 'undefined';
  var mmdCache = {};
  var mmdCount = 0;
  if (mmdReady) {
    mermaid.initialize({
      startOnLoad: false, securityLevel: 'strict', theme: 'neutral',
      fontFamily: 'Geist, ui-sans-serif, system-ui, Segoe UI, Arial, sans-serif',
      themeVariables: { fontSize: '15px' },
      flowchart: { htmlLabels: true, curve: 'basis', padding: 12, nodeSpacing: 36, rankSpacing: 42, useMaxWidth: true },
      sequence: { useMaxWidth: true, mirrorActors: false, actorFontSize: 15, messageFontSize: 14, noteFontSize: 13, boxMargin: 8, messageMargin: 30 },
      state: { useMaxWidth: true }
    });
  }
  function renderMermaid(root) {
    var nodes = Array.prototype.slice.call(root.querySelectorAll('.mmd.loading'));
    var chain = Promise.resolve();
    nodes.forEach(function (el) {
      chain = chain.then(function () {
        var code = decodeURIComponent(el.getAttribute('data-code'));
        el.classList.remove('loading');
        if (!mmdReady) { el.innerHTML = '<div class="mmd-error">Diagram library failed to load (vendor/mermaid.min.js missing).</div>'; return; }
        if (mmdCache[code]) { el.innerHTML = mmdCache[code]; return; }
        var id = 'mmd-' + (++mmdCount);
        return mermaid.render(id, code).then(function (out) {
          mmdCache[code] = out.svg; el.innerHTML = out.svg;
        }).catch(function (err) {
          el.innerHTML = '<div class="mmd-error">This diagram could not be rendered. <details><summary>Show diagram source</summary><pre>' + CN.esc(code) + '</pre></details></div>';
          if (window.console) console.warn('Mermaid render failed', err);
          var stray = document.getElementById('d' + id); if (stray) stray.remove();
        });
      });
    });
    return chain;
  }

  /* ---------- Pagination ---------- */
  var deskEl = $('notebook'), wrap = $('spreadWrap'), pagerEl = document.querySelector('.pager');
  var openAns = {};       // topicId -> {questionId: true}
  var layoutCache = {};
  var state = { s: null, view: 0, pages: [], geo: null, token: 0 };

  function geometry() {
    var cs = getComputedStyle(deskEl);
    var h = deskEl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - pagerEl.offsetHeight - parseFloat(getComputedStyle(pagerEl).marginTop);
    return { ppv: deskEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) >= DUAL_MIN_WIDTH ? 2 : 1, pageH: Math.max(380, Math.floor(h)), w: deskEl.clientWidth };
  }
  function rect(el) { return el.getBoundingClientRect(); }
  function isKeepWithNext(el) { return /^H[1-4]$/.test(el.tagName) || el.classList.contains('kicker') || el.classList.contains('qset-head') || el.classList.contains('src-ref') || el.classList.contains('ans-head'); }

  // Split a container into pieces: the first fits `first` px, the rest fit H. Items are grouped by rendered position.
  function chunk(el, items, first, H, make, post) {
    if (items.length < 2) return null;
    var er = rect(el), f = rect(items[0]), l = rect(items[items.length - 1]);
    var overhead = (f.top - er.top) + Math.max(0, er.bottom - l.bottom);
    var groups = [], cur = [], start = null, limit = first;
    for (var i = 0; i < items.length; i++) {
      var r = rect(items[i]);
      if (start === null) start = r.top;
      if (r.bottom - start + overhead > limit) {
        if (!groups.length && !cur.length) return null; // first item alone does not fit the first slot
        if (cur.length) { groups.push(cur); cur = []; start = r.top; limit = H; }
      }
      cur.push(items[i]);
    }
    if (cur.length) groups.push(cur);
    if (groups.length < 2) return null;
    var count = 0;
    return groups.map(function (g) {
      var sh = make();
      g.forEach(function (it) { sh.holder.appendChild(it); });
      if (post) post(sh.shell, count);
      count += g.length;
      return sh.shell;
    });
  }
  function splitEl(el, first, H) {
    var kids = function (p) { return Array.prototype.slice.call(p.children); };
    var shallow = function () { var c = el.cloneNode(false); return { shell: c, holder: c }; };
    if (el.tagName === 'UL' || el.tagName === 'OL') {
      return chunk(el, kids(el), first, H, shallow, function (c, n) { if (el.tagName === 'OL' && n) { c.setAttribute('start', n + 1); c.style.counterReset = 's ' + n; } });
    }
    if (el.classList.contains('tbl-wrap')) {
      var tb = el.querySelector('tbody');
      if (!tb) return null;
      return chunk(el, kids(tb), first, H, function () { var c = el.cloneNode(true); var b = c.querySelector('tbody'); b.innerHTML = ''; return { shell: c, holder: b }; });
    }
    if (el.classList.contains('cols-2') || el.classList.contains('legend-grid')) return chunk(el, kids(el), first, H, shallow);
    if (el.classList.contains('calc')) {
      var body = el.querySelector('.calc-body');
      return body ? chunk(el, kids(body), first, H, function () { var c = el.cloneNode(true); var b = c.querySelector('.calc-body'); b.innerHTML = ''; return { shell: c, holder: b }; }) : null;
    }
    return null;
  }
  // Guarantee every block fits one page: split it, or scale it down (no scrolling anywhere).
  function fitBlocks(mb, H) {
    for (var guard = 0; guard < 400; guard++) {
      var big = null;
      for (var i = 0; i < mb.children.length; i++) {
        var k = mb.children[i];
        if (rect(k).height > H + 1) { big = k; break; }
      }
      if (!big) return;
      var parts = big.dataset.nosplit ? null : splitEl(big, H, H);
      if (parts) { parts.forEach(function (p) { mb.insertBefore(p, big); }); big.remove(); continue; }
      big.dataset.nosplit = '1';
      big.style.zoom = ((parseFloat(big.style.zoom) || 1) * (H - 4) / rect(big).height).toFixed(3);
    }
  }
  // Greedy page filling with live measurement: a block that would leave a gap is split (lists, tables,
  // worked examples) or, for figures, shrunk into the remaining space.
  function paginate(mb, H) {
    var pages = [], cur = [], start = null, pageStart = 0;
    for (var i = 0, guard = 0; i < mb.children.length && guard < 3000; guard++) {
      var base = rect(mb).top, el = mb.children[i], top = rect(el).top - base;
      if (start === null) start = top;
      var j = i;
      while (isKeepWithNext(mb.children[j]) && mb.children[j + 1]) j++;
      var target = mb.children[j], tr = rect(target);
      if (cur.length && tr.bottom - base - start > H) {
        var remain = H - (tr.top - base - start);
        if (remain > 80 && target.dataset.tried !== String(pages.length)) {
          target.dataset.tried = String(pages.length);
          var parts = splitEl(target, remain - 4, H);
          if (parts) { parts.forEach(function (p) { mb.insertBefore(p, target); }); target.remove(); continue; }
          if (target.classList.contains('fig') && remain >= 0.45 * tr.height) {
            target.style.zoom = ((parseFloat(target.style.zoom) || 1) * (remain - 4) / tr.height).toFixed(3);
            continue;
          }
        }
        pages.push(cur); cur = []; start = top;
      }
      if (!cur.length) pageStart = top;
      cur.push(el); i++;
    }
    if (cur.length) pages.push(cur);
    var lastEl = cur[cur.length - 1];
    var lastFill = lastEl ? (rect(lastEl).bottom - rect(mb).top - pageStart) / H : 1;
    return { pages: pages.map(function (pg) { return pg.map(function (e) { return e.outerHTML; }).join(''); }), lastFill: lastFill };
  }
  // One landscape page; geo.ppv text columns inside it (always 1 by user preference).
  function bodyStyle(res) { return 'zoom:' + res.scale + ';--fig-max:' + res.figMax + 'px'; }
  function spreadShell(geo, head, bodies, s) {
    var html = '<section class="spread" style="--page-h:' + geo.pageH + 'px"' + (s ? ' data-id="' + s.id + '" aria-label="' + CN.esc(s.title.replace(/<[^>]+>/g, '')) + '"' : '') + '>' +
      '<article class="page"><div class="page-head">' + head + '</div><div class="page-cols' + (geo.ppv === 2 ? ' two' : '') + '">';
    for (var k = 0; k < geo.ppv; k++) {
      var b = bodies[k] || { body: '' };
      html += '<div class="page-body" style="' + (b.style || '') + '">' + b.body + '</div>';
    }
    return html + '</div></article></section>';
  }
  function layoutTopic(s, geo) {
    var open = openAns[s.id] || {};
    var key = [s.id, geo.ppv, geo.pageH, geo.w, Object.keys(open).sort().join(',')].join('|');
    if (layoutCache[key]) return Promise.resolve(layoutCache[key]);
    // Measure the real page-body box with an invisible skeleton.
    var sk = document.createElement('div');
    sk.style.cssText = 'position:absolute;left:0;right:0;top:0;visibility:hidden;pointer-events:none';
    sk.innerHTML = spreadShell(geo, '<span>x</span>', []);
    wrap.style.position = 'relative';
    wrap.appendChild(sk);
    var refBody = sk.querySelector('.page-body');
    var rcs = getComputedStyle(refBody);
    var H = refBody.clientHeight, W = refBody.clientWidth - parseFloat(rcs.paddingLeft) - parseFloat(rcs.paddingRight);
    sk.remove();
    // Lay the whole topic out in an off-screen page of the same width, at a given text scale.
    function attempt(scale) {
      var res = { scale: scale, figMax: Math.round(H * 0.6 / scale) };
      var m = document.createElement('article');
      m.className = 'page measure-page';
      m.innerHTML = '<div class="page-body" style="' + bodyStyle(res) + ';width:' + (W / scale) + 'px">' + flowHTML(s, open) + '</div>';
      deskEl.appendChild(m);
      var mb = m.firstChild;
      numberFigures(mb, s);
      return renderMermaid(mb).then(function () {
        fitBlocks(mb, H);
        var p = paginate(mb, H);
        m.remove();
        res.pages = p.pages; res.lastFill = p.lastFill;
        return res;
      });
    }
    return attempt(1).then(function (r1) {
      // Avoid a final page holding only a few lines: try a slightly tighter flow.
      if (r1.pages.length > 1 && r1.lastFill < 0.35) {
        return attempt(0.93).then(function (r2) {
          if (r2.pages.length < r1.pages.length) return r2;
          return attempt(0.87).then(function (r3) { return r3.pages.length < r1.pages.length ? r3 : r1; });
        });
      }
      return r1;
    }).then(function (res) { layoutCache[key] = res; return res; });
  }

  /* ---------- Rendering a view (two pages) ---------- */
  function lastView() { return Math.max(0, Math.ceil(state.pages.length / state.geo.ppv) - 1); }
  function renderView() {
    var s = state.s, geo = state.geo, pages = state.pages, total = pages.length;
    state.view = Math.max(0, Math.min(state.view, lastView()));
    var bodies = [];
    for (var k = 0; k < geo.ppv; k++) {
      var pg = pages[state.view * geo.ppv + k];
      var next = spreads[s.index + 1];
      var body = pg || '<div class="page-blank">' + (next ? 'Next topic → ' + next.title : 'End of notebook') + '</div>';
      bodies.push({ body: body, style: bodyStyle(state.res) });
    }
    var head = '<span>' + UNIT_SHORT[s.unit] + (s.group ? ' · ' + s.group : '') + ' · ' + s.title.replace(/<[^>]+>/g, '') + '</span><span class="pg">page ' + (state.view + 1) + ' / ' + (lastView() + 1) + '</span>';
    wrap.innerHTML = spreadShell(geo, head, bodies, s);
    updatePager();
  }
  function updatePager() {
    var s = state.s, prevT = spreads[s.index - 1], nextT = spreads[s.index + 1];
    var atStart = state.view === 0, atEnd = state.view >= lastView();
    $('prevBtn').disabled = atStart && !prevT;
    $('nextBtn').disabled = atEnd && !nextT;
    var n = lastView() + 1, plain = function (x) { return x.title.replace(/<[^>]+>/g, ''); };
    $('prevLabel').textContent = !atStart ? 'Previous page' : (prevT ? plain(prevT) : 'Previous');
    $('nextLabel').textContent = !atEnd ? 'Next page' : (nextT ? plain(nextT) : 'Next');
    $('prevBtn').title = atStart && prevT ? 'Previous topic: ' + plain(prevT) : 'Previous page';
    $('nextBtn').title = atEnd && nextT ? 'Next topic: ' + plain(nextT) : 'Next page';
    $('pagerInfo').innerHTML = '<b>' + s.title + '</b>' + (mode === 'notebook' ? ' · page ' + (state.view + 1) + ' of ' + n : '');
  }
  function textOf(html) { return html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').toLowerCase(); }

  /* ---------- Article view (GFG-style scrolling page; default) ---------- */
  var mode = store.get('cn-mode', 'article');
  function applyMode() {
    var root = document.documentElement;
    root.classList.toggle('mode-article', mode === 'article');
    root.classList.toggle('mode-notebook', mode === 'notebook');
    var b = $('modeToggle');
    b.setAttribute('aria-label', mode === 'article' ? 'Switch to notebook view' : 'Switch to article view');
    b.title = mode === 'article' ? 'Notebook view (fixed pages)' : 'Article view (scrolling page)';
  }
  function renderArticle(s, opts) {
    var prevT = spreads[s.index - 1], nextT = spreads[s.index + 1];
    var plain = function (x) { return x.title.replace(/<[^>]+>/g, ''); };
    var nav = '<nav class="art-nav" aria-label="Previous and next topic">' +
      (prevT ? '<a class="art-card" href="#' + prevT.id + '"><small>← Previous</small>' + plain(prevT) + '</a>' : '<span></span>') +
      (nextT ? '<a class="art-card next" href="#' + nextT.id + '"><small>Next →</small>' + plain(nextT) + '</a>' : '<span></span>') + '</nav>';
    var keep = opts.keepScroll ? deskEl.scrollTop : 0;
    wrap.innerHTML = '<article class="article" data-id="' + s.id + '"><div class="art-crumb">' + UNIT_NAMES[s.unit] + (s.group ? ' › ' + s.group : '') + '</div>' + flowHTML(s, openAns[s.id] || {}) + nav + '</article>';
    numberFigures(wrap, s);
    state.pages = ['']; state.view = 0; state.geo = { ppv: 1 };
    updatePager();
    deskEl.scrollTop = keep;
    return renderMermaid(wrap).then(function () {
      if (opts.keepScroll) deskEl.scrollTop = keep;
      if (opts.findText) {
        highlightText(wrap, opts.findText);
        var m = wrap.querySelector('mark'); if (m) m.scrollIntoView({ block: 'center' });
      }
    });
  }

  function show(id, opts) {
    opts = opts || {};
    var s = spreadById[id] || spreads[0];
    var tok = ++state.token;
    var changed = state.s !== s;
    state.s = s;
    if (changed) {
      document.title = s.title.replace(/<[^>]+>/g, '') + ' · CN Study Notebook';
      $('reviewedChk').checked = reviewed.indexOf(s.id) >= 0;
      markTOC(s.id);
      if (document.body.classList.contains('nav-open')) { document.body.classList.remove('nav-open'); syncToggle(); }
    }
    if (mode === 'article') {
      if (opts.findText && !opts.retried) {
        // A search hit may sit inside a closed answer: open it first.
        var tt = opts.findText.toLowerCase();
        var hitQ = textOf(flowHTML(s, {})).indexOf(tt) < 0 && topicQuestions(s).filter(function (q) { return q.a && textOf(q.a).indexOf(tt) >= 0; })[0];
        if (hitQ) (openAns[s.id] = openAns[s.id] || {})[hitQ.id] = true;
      }
      return renderArticle(s, opts);
    }
    var geo = geometry();
    return layoutTopic(s, geo).then(function (res) {
      if (tok !== state.token) return;
      var pages = res.pages;
      var oldTotal = state.pages.length || 1, oldFirst = state.view * (state.geo ? state.geo.ppv : 1);
      state.res = res; state.pages = pages; state.geo = geo;
      var findIn = function (needle) { for (var i = 0; i < pages.length; i++) if (pages[i].indexOf(needle) >= 0) return Math.floor(i / geo.ppv); return null; };
      if (opts.view === 'last') state.view = lastView();
      else if (typeof opts.view === 'number') state.view = opts.view;
      else if (opts.keepFraction) state.view = Math.floor(Math.round(oldFirst / oldTotal * pages.length) / geo.ppv);
      else if (opts.findQ) { var v = findIn(opts.findQ); state.view = v === null ? state.view : v; }
      else if (opts.findText) {
        var t = opts.findText.toLowerCase(), hit = null;
        for (var i = 0; i < pages.length; i++) if (textOf(pages[i]).indexOf(t) >= 0) { hit = Math.floor(i / geo.ppv); break; }
        if (hit === null && !opts.retried) {
          // The match may sit inside a closed answer: open it and lay out again.
          var q = topicQuestions(s).filter(function (q) { return q.a && textOf(q.a).indexOf(t) >= 0; })[0];
          if (q) { (openAns[s.id] = openAns[s.id] || {})[q.id] = true; return show(s.id, { findText: opts.findText, retried: true }); }
        }
        state.view = hit === null ? 0 : hit;
      } else if (changed) state.view = 0;
      renderView();
      if (opts.findText) highlightText(wrap, opts.findText);
    });
  }
  function go(id, opts) {
    if (location.hash.slice(1) === id) show(id, opts);
    else { pendingOpts = opts || null; location.hash = id; }
  }
  var pendingOpts = null;
  window.addEventListener('hashchange', function () {
    var id = decodeURIComponent(location.hash.slice(1));
    if (spreadById[id]) { var o = pendingOpts; pendingOpts = null; show(id, o); }
  });
  function nextPage() {
    if (state.view < lastView()) { state.view++; renderView(); return; }
    var n = spreads[state.s.index + 1]; if (n) go(n.id);
  }
  function prevPage() {
    if (state.view > 0) { state.view--; renderView(); return; }
    var p = spreads[state.s.index - 1]; if (p) go(p.id, { view: 'last' });
  }

  function highlightText(root, term) {
    var t = term.toLowerCase();
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      var i = n.nodeValue.toLowerCase().indexOf(t);
      if (i >= 0 && n.parentElement && !n.parentElement.closest('.mmd, svg, .page-head')) {
        var r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + term.length);
        try { r.surroundContents(document.createElement('mark')); } catch (e) { /* match spans elements: skip */ }
        return;
      }
    }
  }

  /* Answer toggles and any <details> re-flow the pages so nothing is clipped. */
  wrap.addEventListener('click', function (ev) {
    var b = ev.target.closest('.ans-btn');
    if (!b) return;
    var qid = b.getAttribute('data-q'), map = openAns[state.s.id] = openAns[state.s.id] || {};
    if (mode === 'article') { if (map[qid]) delete map[qid]; else map[qid] = true; renderArticle(state.s, { keepScroll: true }); return; }
    if (map[qid]) { delete map[qid]; show(state.s.id, { findQ: 'id="q-' + qid + '"' }); }
    else { map[qid] = true; show(state.s.id, { findQ: 'data-qa="' + qid + '"' }); }
  });

  /* ---------- TOC ---------- */
  var reviewed = store.get('cn-reviewed', []);
  function markTOC(id) {
    document.querySelectorAll('#tocTree a').forEach(function (a) {
      if (a.dataset.id === id) { a.setAttribute('aria-current', 'page'); var d = a.closest('details'); if (d) d.open = true; }
      else a.removeAttribute('aria-current');
    });
    var active = document.querySelector('#tocTree a[aria-current]');
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
  }
  function buildTOC() {
    var openState = {};
    document.querySelectorAll('#tocTree details').forEach(function (d) { openState[d.dataset.unit] = d.open; });
    var html = '';
    order.forEach(function (u) {
      var list = spreads.filter(function (s) { return s.unit === u; });
      if (!list.length) return;
      var done = list.filter(function (s) { return reviewed.indexOf(s.id) >= 0; }).length;
      var open = u in openState ? openState[u] : (u === '0' || u === '1');
      html += '<details data-unit="' + u + '"' + (open ? ' open' : '') + '><summary>' + UNIT_NAMES[u] + '<span class="sum-count">' + done + '/' + list.length + '</span></summary><ol>';
      list.forEach(function (s, i) {
        var num = u === '0' ? '·' : u === 'qb' ? 'Q' + (i + 1) : u + '.' + (i < 10 ? '0' : '') + i;
        html += '<li data-title="' + CN.esc((s.title + ' ' + (s.group || '')).toLowerCase()) + '"><a href="#' + s.id + '" data-id="' + s.id + '"><span class="num">' + num + '</span><span>' + s.title + '</span>' + (reviewed.indexOf(s.id) >= 0 ? '<span class="tick" title="Reviewed">✓</span>' : '') + '</a></li>';
      });
      html += '</ol></details>';
    });
    $('tocTree').innerHTML = html;
    if (state.s) markTOC(state.s.id);
  }
  $('tocFilter').addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    document.querySelectorAll('#tocTree li').forEach(function (li) { li.hidden = !!q && li.dataset.title.indexOf(q) < 0; });
    document.querySelectorAll('#tocTree details').forEach(function (d) {
      var any = d.querySelectorAll('li:not([hidden])').length;
      d.hidden = !!q && !any; if (q && any) d.open = true;
    });
  });

  /* ---------- Progress ---------- */
  function updateProgress() {
    var total = spreads.length, done = reviewed.filter(function (id) { return spreadById[id]; }).length;
    $('progressFill').style.width = (100 * done / total) + '%';
    $('progressText').textContent = done + ' / ' + total + ' reviewed';
  }
  $('reviewedChk').addEventListener('change', function () {
    var id = state.s.id, i = reviewed.indexOf(id);
    if (this.checked && i < 0) reviewed.push(id);
    if (!this.checked && i >= 0) reviewed.splice(i, 1);
    store.set('cn-reviewed', reviewed);
    buildTOC(); updateProgress();
  });

  /* ---------- Search (titles, text, diagram labels, answers) ---------- */
  var index = spreads.map(function (s) {
    var tmp = document.createElement('div');
    tmp.innerHTML = flowHTML(s, 'all');
    tmp.querySelectorAll('.mmd').forEach(function (m) { m.textContent = ' ' + decodeURIComponent(m.getAttribute('data-code')).replace(/[-=>|{}\[\]()%:;"]+/g, ' ').replace(/<br\/?>/g, ' ') + ' '; });
    return { s: s, title: s.title.toLowerCase(), text: tmp.textContent.replace(/\s+/g, ' ') };
  });
  var results = [], sel = -1;
  function search(q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    var out = [];
    index.forEach(function (e) {
      var low = e.text.toLowerCase(), score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i], c = low.split(t).length - 1;
        if (!c && e.title.indexOf(t) < 0) return;
        score += c + (e.title.indexOf(t) >= 0 ? 25 : 0);
      }
      var pos = Math.max(0, low.indexOf(terms[0])), a = Math.max(0, pos - 60);
      out.push({ e: e, score: score, snip: (a ? '…' : '') + e.text.slice(a, pos + 110) + '…', term: terms[0] });
    });
    return out.sort(function (x, y) { return y.score - x.score; }).slice(0, 25);
  }
  function renderResults(q) {
    var box = $('searchResults');
    results = search(q); sel = results.length ? 0 : -1;
    box.hidden = !q.trim();
    $('tocWrap').hidden = !box.hidden;
    if (box.hidden) return;
    if (!results.length) { box.innerHTML = '<div class="search-empty">No matches for “' + CN.esc(q) + '”.</div>'; return; }
    var re = new RegExp('(' + results[0].term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    box.innerHTML = results.map(function (r, i) {
      return '<button class="res" role="option" id="res-' + i + '" aria-selected="' + (i === sel) + '" data-i="' + i + '"><div class="res-title">' + r.e.s.title + '</div><div class="res-meta">' + UNIT_NAMES[r.e.s.unit] + '</div><div class="res-snip">' + CN.esc(r.snip).replace(re, '<mark>$1</mark>') + '</div></button>';
    }).join('');
  }
  function openResult(i) {
    var r = results[i]; if (!r) return;
    document.querySelectorAll('.res').forEach(function (b, j) { b.setAttribute('aria-selected', String(j === i)); });
    go(r.e.s.id, { findText: r.term });
  }
  $('searchInput').addEventListener('input', function () { renderResults(this.value); });
  $('searchInput').addEventListener('focus', function () { if (this.value.trim()) renderResults(this.value); });
  $('searchInput').addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault(); if (!results.length) return;
      sel = (sel + (ev.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
      document.querySelectorAll('.res').forEach(function (b, i) { b.setAttribute('aria-selected', String(i === sel)); });
      var b = $('res-' + sel); if (b) b.scrollIntoView({ block: 'nearest' });
    } else if (ev.key === 'Enter') { ev.preventDefault(); openResult(sel); }
    else if (ev.key === 'Escape') { this.value = ''; renderResults(''); this.blur(); }
  });
  $('searchResults').addEventListener('click', function (ev) { var b = ev.target.closest('.res'); if (b) openResult(+b.dataset.i); });
  document.addEventListener('click', function (ev) {
    if (!ev.target.closest('#printMenu, #printBtn')) closePrintMenu();
  });

  /* ---------- Theme ---------- */
  $('themeToggle').addEventListener('click', function () {
    var cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('cn-theme', next); } catch (e) {}
  });

  /* ---------- Print (continuous flow, answers expanded) ---------- */
  function closePrintMenu() { $('printMenu').hidden = true; $('printBtn').setAttribute('aria-expanded', 'false'); }
  $('printBtn').addEventListener('click', function () {
    var m = $('printMenu'); m.hidden = !m.hidden; this.setAttribute('aria-expanded', String(!m.hidden));
    if (!m.hidden) m.querySelector('button').focus();
  });
  $('printMenu').addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    closePrintMenu();
    var mode = b.dataset.print, cur = state.s;
    var list = mode === 'spread' ? [cur] : mode === 'unit' ? spreads.filter(function (s) { return s.unit === cur.unit; }) : spreads;
    var root = $('printRoot');
    root.innerHTML = list.map(function (s) {
      return '<section class="spread" data-id="' + s.id + '"><article class="page"><div class="page-head"><span>' + UNIT_NAMES[s.unit] + '</span><span class="pg">' + (s.group || '') + '</span></div><div class="page-body">' + flowHTML(s, 'all') + '</div></article></section>';
    }).join('');
    list.forEach(function (s) { var el = root.querySelector('[data-id="' + s.id + '"]'); if (el) numberFigures(el, s); });
    root.querySelectorAll('.ans-btn').forEach(function (bt) { bt.remove(); });
    document.body.style.cursor = 'progress';
    renderMermaid(root).then(function () {
      document.body.style.cursor = '';
      setTimeout(function () { window.print(); }, 60);
    });
  });
  window.addEventListener('afterprint', function () { $('printRoot').innerHTML = ''; });

  /* ---------- Sidebar, keys, resize ---------- */
  function relayout() { if (state.s && mode === 'notebook') show(state.s.id, { keepFraction: true }); }
  applyMode();
  $('modeToggle').addEventListener('click', function () {
    mode = mode === 'article' ? 'notebook' : 'article';
    store.set('cn-mode', mode);
    applyMode();
    state.pages = []; state.view = 0;
    if (state.s) show(state.s.id, {});
  });
  function tocVisible() { return window.innerWidth > 960 ? !document.documentElement.classList.contains('toc-collapsed') : document.body.classList.contains('nav-open'); }
  function syncToggle() {
    var v = tocVisible(), t = $('navToggle');
    t.setAttribute('aria-expanded', String(v));
    t.setAttribute('aria-label', v ? 'Hide table of contents' : 'Show table of contents');
  }
  $('navToggle').addEventListener('click', function () {
    if (window.innerWidth > 960) {
      var c = document.documentElement.classList.toggle('toc-collapsed');
      store.set('cn-toc-collapsed', c);
      relayout();
    } else if (document.body.classList.toggle('nav-open')) $('tocFilter').focus();
    syncToggle();
  });
  syncToggle();
  $('prevBtn').addEventListener('click', prevPage);
  $('nextBtn').addEventListener('click', nextPage);
  document.addEventListener('keydown', function (ev) {
    var tag = (ev.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || ev.target.isContentEditable;
    if (ev.key === 'Escape') { closePrintMenu(); document.body.classList.remove('nav-open'); syncToggle(); }
    if (typing || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ev.key === '/') { ev.preventDefault(); $('searchInput').focus(); }
    else if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); if (!$('nextBtn').disabled) nextPage(); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); if (!$('prevBtn').disabled) prevPage(); }
  });
  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(relayout, 180); });

  // Exposed for verification only.
  window.CNApp = { spreads: spreads, show: show, state: state, layoutCache: layoutCache };

  buildTOC();
  updateProgress();
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(function () {
    var start = decodeURIComponent(location.hash.slice(1));
    show(spreadById[start] ? start : spreads[0].id);
  });
})();
