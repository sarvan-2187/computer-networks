/* Content-building helpers shared by all content files.
   Every helper returns an HTML string; app.js turns spreads into DOM. */
var CN = { spreads: [], questions: [] };

/* Register a spread. Fields:
   id, unit ('0'|'1'|'2'|'3'|'qb'), group (TOC section label), title, kicker,
   src (array of source filenames), layout ('two' default | 'one'), left, right */
CN.add = function (s) { CN.spreads.push(s); };

CN.esc = function (s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

/* Source reference note */
CN.src = function () {
  return '<p class="src-ref">' + Array.prototype.map.call(arguments, function (f) { return '<span>' + CN.esc(f) + '</span>'; }).join(' · ') + '</p>';
};

/* Callout block. type: def | work | ex | take | mistake | flag | supp | examiner */
CN.blk = function (type, html, tag) {
  var tags = { def: 'Definition', work: 'Working', ex: 'Example', take: 'Exam takeaway', mistake: 'Common mistake',
    flag: 'Source note', supp: 'Supplementary (not in uploaded slides)', examiner: 'Think like the examiner' };
  return '<div class="blk ' + type + '"><span class="tag">' + (tag || tags[type]) + '</span>' + html + '</div>';
};

/* Figure wrapper; body is raw SVG/HTML. opts.wide keeps a min-width so labels never shrink. */
CN.fig = function (title, body, caption, opts) {
  opts = opts || {};
  return '<figure class="fig' + (opts.wide ? ' wide' : '') + '">' +
    '<div class="fig-title"><span class="fig-no"></span><span>' + title + '</span></div>' +
    '<div class="fig-body">' + body + '</div>' +
    (caption ? '<figcaption>' + caption + '</figcaption>' : '') + '</figure>';
};

/* Mermaid diagram — source is URI-encoded so HTML parsing never touches it. */
CN.mmd = function (title, code, caption, big) {
  var div = '<div class="mmd loading' + (big ? ' big' : '') + '" role="img" aria-label="' + CN.esc(title) + '" data-code="' + encodeURIComponent(code.trim()) + '"></div>';
  return CN.fig(title, div, caption);
};

/* Comparison table. head: header cells; rows: arrays (first cell = row label).
   Use {k:'text'} to highlight a cell as the decisive distinction. */
CN.table = function (head, rows, take, cls) {
  function cell(c, first) {
    var tag = first ? 'th' : 'td', attr = first ? ' scope="row"' : '';
    if (c && typeof c === 'object') return '<' + tag + attr + ' class="key">' + c.k + '</' + tag + '>';
    return '<' + tag + attr + '>' + c + '</' + tag + '>';
  }
  var h = '<div class="tbl-wrap"><table class="cmp ' + (cls || '') + '"><thead><tr>' +
    head.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
    rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return cell(c, i === 0); }).join('') + '</tr>'; }).join('') +
    '</tbody></table></div>';
  if (take) h += '<p class="tbl-take"><b>Takeaway:</b> ' + take + '</p>';
  return h;
};

/* Worked numerical. o = {title, src, q, given:[..], find, formula, why, steps:[..], answer, interp} */
CN.calc = function (o) {
  var h = '<div class="calc"><div class="calc-head"><b>' + o.title + '</b>' + (o.src ? '<span class="src-badge">' + o.src + '</span>' : '') + '</div><div class="calc-body">';
  if (o.q) h += '<p>' + o.q + '</p>';
  if (o.given) h += '<div class="lbl">Given</div><ul class="small">' + o.given.map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ul>';
  if (o.find) h += '<div class="lbl">Find</div><p class="small">' + o.find + '</p>';
  if (o.formula) h += '<div class="lbl">Formula' + (o.why ? ' — why it applies' : '') + '</div><div class="eq">' + o.formula + '</div>' + (o.why ? '<p class="small">' + o.why + '</p>' : '');
  if (o.steps) h += '<div class="lbl">Substitution &amp; working</div>' + o.steps.map(function (s) { return '<div class="eq">' + s + '</div>'; }).join('');
  if (o.answer) h += '<div class="ans">' + o.answer + '</div>';
  if (o.interp) h += '<p class="interp">' + o.interp + '</p>';
  return h + '</div></div>';
};

/* Arrow list in the user's note style: items are strings or [term, meaning]. */
CN.arrows = function (items) {
  return '<ul class="arrow">' + items.map(function (i) {
    return '<li>' + (Array.isArray(i) ? '<b>' + i[0] + '</b> → ' + i[1] : i) + '</li>';
  }).join('') + '</ul>';
};
/* Two-column contrast: CN.split('Client', [...], 'Server', [...], 'pro-con'?) */
CN.split = function (h1, a, h2, b2, cls) {
  return '<div class="split ' + (cls || '') + '"><div><h4>' + h1 + '</h4>' + CN.arrows(a) + '</div><div><h4>' + h2 + '</h4>' + CN.arrows(b2) + '</div></div>';
};
CN.pros = function (merits, demerits) { return CN.split('Merits', merits, 'Demerits', demerits, 'pro-con'); };
CN.eg = function (s) { return '<p class="eg">' + s + '</p>'; };

CN.formula = function (f, label) {
  return '<div class="formula">' + (label ? '<span class="lbl">' + label + '</span>' : '') + f + '</div>';
};

/* Packet header grid. rows: [[label, bits, cls?, sub?], ...]; bits sum to 32 per row. */
CN.hdr = function (title, rows, caption) {
  var ruler = '<div class="hdr-ruler" aria-hidden="true">';
  for (var i = 0; i < 32; i++) ruler += '<span>' + (i % 8 === 0 || i === 31 ? i : '') + '</span>';
  ruler += '</div>';
  var body = rows.map(function (r) {
    return '<div class="hdr-row">' + r.map(function (f) {
      return '<div class="' + (f[2] || '') + '" style="grid-column: span ' + f[1] + '">' + f[0] + (f[3] ? '<small>' + f[3] + '</small>' : '') + '</div>';
    }).join('') + '</div>';
  }).join('');
  return CN.fig(title, '<div class="hdr"><div class="hdr-inner">' + ruler + body + '</div></div>', caption);
};

/* Horizontal frame strip (e.g. Ethernet). fields: [[label, sizeText, flexWeight, cls?], ...] */
CN.strip = function (title, fields, caption) {
  var body = '<div class="frame-strip">' + fields.map(function (f) {
    return '<div class="' + (f[3] || '') + '" style="flex:' + f[2] + '">' + f[0] + '<small>' + f[1] + '</small></div>';
  }).join('') + '</div>';
  return CN.fig(title, body, caption);
};

/* Arrowhead markers reused by inline SVG diagrams */
CN.defs = '<defs>' +
  '<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#3a362f"/></marker>' +
  '<marker id="ahr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#b3361f"/></marker>' +
  '<marker id="ahb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#1f4e8c"/></marker>' +
  '<marker id="ahg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2c6a3a"/></marker>' +
  '</defs>';

/* Simple line plot for numeric illustrations (cwnd traces, queueing curves).
   o = {w,h,xMax,yMax,xTicks,yTicks,xLabel,yLabel,label,series:[{pts,cls,dots,labels}],notes,vlines,hlines} */
CN.plot = function (o) {
  var w = o.w || 640, h = o.h || 300, L = 56, R = 18, T = 16, B = 46;
  var pw = w - L - R, ph = h - T - B;
  function X(x) { return L + (x / o.xMax) * pw; }
  function Y(y) { return T + ph - (y / o.yMax) * ph; }
  var s = '<svg class="d" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + CN.esc(o.label || 'plot') + '">' + CN.defs;
  (o.yTicks || []).forEach(function (t) { s += '<line class="grid" x1="' + L + '" x2="' + (L + pw) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/><text class="t-xs t-mut" text-anchor="end" x="' + (L - 6) + '" y="' + (Y(t) + 4) + '">' + t + '</text>'; });
  (o.xTicks || []).forEach(function (t) { s += '<text class="t-xs t-mut" text-anchor="middle" x="' + X(t) + '" y="' + (T + ph + 16) + '">' + t + '</text>'; });
  s += '<line class="ln" x1="' + L + '" y1="' + (T + ph) + '" x2="' + (L + pw + 6) + '" y2="' + (T + ph) + '" marker-end="url(#ah)"/>';
  s += '<line class="ln" x1="' + L + '" y1="' + (T + ph) + '" x2="' + L + '" y2="' + (T - 6) + '" marker-end="url(#ah)"/>';
  s += '<text class="t-sm" text-anchor="middle" x="' + (L + pw / 2) + '" y="' + (h - 8) + '">' + (o.xLabel || '') + '</text>';
  s += '<text class="t-sm" text-anchor="middle" transform="translate(14,' + (T + ph / 2) + ') rotate(-90)">' + (o.yLabel || '') + '</text>';
  (o.hlines || []).forEach(function (l) { s += '<line class="' + (l.cls || 'ln-dash') + '" x1="' + L + '" x2="' + (L + pw) + '" y1="' + Y(l.y) + '" y2="' + Y(l.y) + '"/>' + (l.text ? '<text class="t-xs t-mut" x="' + (L + pw - 4) + '" text-anchor="end" y="' + (Y(l.y) - 5) + '">' + l.text + '</text>' : ''); });
  (o.vlines || []).forEach(function (l) { s += '<line class="' + (l.cls || 'ln-dash') + '" y1="' + T + '" y2="' + (T + ph) + '" x1="' + X(l.x) + '" x2="' + X(l.x) + '"/>' + (l.text ? '<text class="t-xs ' + (l.tcls || 't-mut') + '" x="' + (X(l.x) + 4) + '" y="' + (T + 12) + '">' + l.text + '</text>' : ''); });
  (o.series || []).forEach(function (se) {
    s += '<polyline class="' + (se.cls || 'ln-blue') + '" points="' + se.pts.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ') + '"/>';
    if (se.dots) se.pts.forEach(function (p) { s += '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="3.2" class="' + (se.dotCls || 'fill-blue') + '"/>'; });
    if (se.labels) se.pts.forEach(function (p) { s += '<text class="t-xs t-b" text-anchor="middle" x="' + X(p[0]).toFixed(1) + '" y="' + (Y(p[1]) - 8).toFixed(1) + '">' + p[1] + '</text>'; });
  });
  (o.notes || []).forEach(function (n) { s += '<text class="t-sm ' + (n.cls || '') + '" x="' + X(n.x) + '" y="' + Y(n.y) + '" text-anchor="' + (n.anchor || 'start') + '">' + n.text + '</text>'; });
  return s + '</svg>';
};
