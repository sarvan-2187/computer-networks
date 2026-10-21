/* Unit 1 — The Internet, network edge & core, delay, layers, application layer. */
(function () {
  var b = CN.blk, t = CN.table, A = CN.arrows, S = CN.split, P = CN.pros, eg = CN.eg, F = CN.formula, calc = CN.calc, fig = CN.fig, mmd = CN.mmd;

  /* ---- small SVG builders used only in this unit ---- */
  function node(x, y, type, label) {
    var s = type === 's' ? '<circle class="switch" cx="' + x + '" cy="' + y + '" r="13"/>' :
      type === 'r' ? '<circle class="router" cx="' + x + '" cy="' + y + '" r="13"/>' :
        type === 'srv' ? '<rect class="box-v" x="' + (x - 14) + '" y="' + (y - 18) + '" width="28" height="36" rx="3"/>' :
          '<rect class="host" x="' + (x - 12) + '" y="' + (y - 9) + '" width="24" height="18" rx="3"/>';
    return s + (label ? '<text class="t-xs" text-anchor="middle" x="' + x + '" y="' + (y + (type === 'srv' ? 32 : 24)) + '">' + label + '</text>' : '');
  }
  function panel(x0, y0, title, nodes, links, extra) {
    var s = '<g transform="translate(' + x0 + ',' + y0 + ')"><rect x="0" y="0" width="200" height="158" rx="6" fill="none" stroke="#e3ded4"/>' +
      '<text class="t-b" x="10" y="20">' + title + '</text>' + (extra || '');
    links.forEach(function (l) { var a = nodes[l[0]], c = nodes[l[1]]; s += '<line class="ln" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + c[0] + '" y2="' + c[1] + '"/>'; });
    Object.keys(nodes).forEach(function (k) { var n = nodes[k]; s += node(n[0], n[1], n[2], n[3]); });
    return s + '</g>';
  }
  CN.u1panel = panel; // reused by other units

  var topoSVG = '<svg class="d" viewBox="0 0 640 340" role="img" aria-label="Six network topologies">' +
    panel(0, 0, 'Bus', { a: [40, 50, 'h'], b: [85, 115, 'h'], c: [130, 50, 'h'], d: [170, 115, 'h'] }, [], '<line class="ln" x1="15" y1="82" x2="190" y2="82" stroke-width="3"/><line class="ln" x1="40" y1="59" x2="40" y2="82"/><line class="ln" x1="85" y1="82" x2="85" y2="106"/><line class="ln" x1="130" y1="59" x2="130" y2="82"/><line class="ln" x1="170" y1="82" x2="170" y2="106"/><text class="t-xs t-mut" x="15" y="148">single backbone cable</text>') +
    panel(220, 0, 'Star', { c: [100, 85, 's', 'switch'], a: [100, 38, 'h'], b: [160, 62, 'h'], d: [160, 118, 'h'], e: [40, 118, 'h'], f: [40, 62, 'h'] }, [['c', 'a'], ['c', 'b'], ['c', 'd'], ['c', 'e'], ['c', 'f']]) +
    panel(440, 0, 'Ring', { a: [100, 38, 'h'], b: [148, 66, 'h'], c: [148, 116, 'h'], d: [100, 140, 'h'], e: [52, 116, 'h'], f: [52, 66, 'h'] }, [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f'], ['f', 'a']]) +
    panel(0, 175, 'Mesh (full)', { a: [100, 40, 'h'], b: [158, 82, 'h'], c: [136, 138, 'h'], d: [64, 138, 'h'], e: [42, 82, 'h'] }, [['a', 'b'], ['a', 'c'], ['a', 'd'], ['a', 'e'], ['b', 'c'], ['b', 'd'], ['b', 'e'], ['c', 'd'], ['c', 'e'], ['d', 'e']], '<text class="t-xs t-mut" x="120" y="20">n(n−1)/2 links</text>') +
    panel(220, 175, 'Tree', { r: [100, 40, 's', 'root'], a: [55, 88, 's'], c: [145, 88, 's'], a1: [30, 132, 'h'], a2: [78, 132, 'h'], c1: [122, 132, 'h'], c2: [170, 132, 'h'] }, [['r', 'a'], ['r', 'c'], ['a', 'a1'], ['a', 'a2'], ['c', 'c1'], ['c', 'c2']]) +
    panel(440, 175, 'Hybrid (star-bus)', { a: [55, 92, 's'], c: [145, 92, 's'], a1: [28, 136, 'h'], a2: [78, 136, 'h'], c1: [122, 136, 'h'], c2: [172, 136, 'h'] }, [['a', 'a1'], ['a', 'a2'], ['c', 'c1'], ['c', 'c2']], '<line class="ln" x1="15" y1="48" x2="190" y2="48" stroke-width="3"/><line class="ln" x1="55" y1="48" x2="55" y2="79"/><line class="ln" x1="145" y1="48" x2="145" y2="79"/><text class="t-xs t-mut" x="120" y="40">backbone</text>') +
    '</svg>';

  var storeFwdSVG = '<svg class="d" viewBox="0 0 640 300" role="img" aria-label="Store-and-forward timing diagram">' + CN.defs +
    '<text class="t-b" text-anchor="middle" x="110" y="24">Source</text><text class="t-b" text-anchor="middle" x="320" y="24">Router</text><text class="t-b" text-anchor="middle" x="530" y="24">Destination</text>' +
    '<line class="ln" x1="110" y1="34" x2="110" y2="285"/><line class="ln" x1="320" y1="34" x2="320" y2="285"/><line class="ln" x1="530" y1="34" x2="530" y2="285"/>' +
    '<polygon points="110,45 320,55 320,135 110,125" fill="#cfe0f6" stroke="#1f4e8c" stroke-width="1.2"/>' +
    '<polygon points="320,135 530,145 530,225 320,215" fill="#cfe0f6" stroke="#1f4e8c" stroke-width="1.2"/>' +
    '<text class="t-sm" x="18" y="90">L/R</text><line class="ln-thin" x1="50" y1="45" x2="50" y2="125"/>' +
    '<text class="t-sm" text-anchor="middle" x="215" y="96">packet (L bits)</text>' +
    '<text class="t-sm t-red" x="330" y="96">router must receive the</text><text class="t-sm t-red" x="330" y="111">whole packet before sending</text>' +
    '<line class="ln-red" x1="560" y1="45" x2="560" y2="225"/><text class="t-sm t-red t-b" x="568" y="140">2L/R</text>' +
    '<text class="t-xs t-mut" x="568" y="156">(zero prop.)</text>' +
    '<text class="t-sm t-mut" x="18" y="280">time ↓</text></svg>';

  var fdmTdmSVG = (function () {
    var s = '<svg class="d" viewBox="0 0 640 230" role="img" aria-label="FDM versus TDM">' + CN.defs;
    var cols = ['#cfe0f6', '#d9f0dc', '#fbe3c6', '#e6dcf6'];
    s += '<text class="t-b" x="40" y="20">FDM — frequency division</text>';
    for (var i = 0; i < 4; i++) s += '<rect x="40" y="' + (34 + i * 40) + '" width="250" height="36" fill="' + cols[i] + '" stroke="#8a8378"/><text class="t-sm" x="52" y="' + (57 + i * 40) + '">User ' + (i + 1) + ': own band, all the time</text>';
    s += '<line class="ln" x1="40" y1="198" x2="300" y2="198" marker-end="url(#ah)"/><text class="t-xs t-mut" x="270" y="214">time</text><line class="ln" x1="32" y1="198" x2="32" y2="30" marker-end="url(#ah)"/><text class="t-xs t-mut" transform="translate(24,130) rotate(-90)">frequency</text>';
    s += '<text class="t-b" x="360" y="20">TDM — time division</text>';
    for (var j = 0; j < 8; j++) s += '<rect x="' + (360 + j * 32) + '" y="34" width="30" height="156" fill="' + cols[j % 4] + '" stroke="#8a8378"/><text class="t-sm" text-anchor="middle" x="' + (375 + j * 32) + '" y="118">U' + (j % 4 + 1) + '</text>';
    s += '<text class="t-xs t-mut" x="362" y="182">frame 1</text><text class="t-xs t-mut" x="490" y="182">frame 2</text>';
    s += '<line class="ln" x1="360" y1="198" x2="620" y2="198" marker-end="url(#ah)"/><text class="t-xs t-mut" x="590" y="214">time</text><line class="ln" x1="352" y1="198" x2="352" y2="30" marker-end="url(#ah)"/>';
    return s + '</svg>';
  })();

  var netTypesSVG = '<svg class="d" viewBox="0 0 640 230" role="img" aria-label="PAN within LAN within MAN within WAN">' +
    '<rect class="box-grey" x="10" y="10" width="620" height="210" rx="10"/><text class="t-b" x="24" y="34">WAN — country / continent / globe</text><text class="t-sm t-mut" x="24" y="52">Eg: the Internet (largest WAN)</text>' +
    '<rect class="box-v" x="40" y="66" width="470" height="144" rx="10"/><text class="t-b" x="54" y="88">MAN — a city</text><text class="t-sm t-mut" x="54" y="105">Eg: city cable-TV / metro fibre</text>' +
    '<rect class="box-g" x="70" y="116" width="300" height="86" rx="10"/><text class="t-b" x="84" y="138">LAN — building / campus</text><text class="t-sm t-mut" x="84" y="155">Eg: college or office network</text>' +
    '<rect class="box-b" x="250" y="160" width="110" height="36" rx="8"/><text class="t-b t-sm" x="260" y="176">PAN — a few m</text><text class="t-xs t-mut" x="260" y="190">Eg: Bluetooth headset</text></svg>';

  var delaySVG = '<svg class="d" viewBox="0 0 640 210" role="img" aria-label="Four sources of nodal delay">' + CN.defs +
    '<line class="ln" x1="10" y1="100" x2="40" y2="100" marker-end="url(#ah)"/>' +
    '<rect class="router" x="40" y="55" width="140" height="90" rx="8"/><text class="t-b" x="50" y="74">Router A</text>' +
    '<rect class="box" x="96" y="92" width="72" height="22" rx="2"/>' +
    '<rect class="box-b" x="100" y="96" width="14" height="14"/><rect class="box-b" x="118" y="96" width="14" height="14"/><rect class="box-b" x="136" y="96" width="14" height="14"/><rect class="box-r" x="154" y="96" width="12" height="14"/>' +
    '<text class="t-xs t-mut" x="96" y="128">output buffer</text>' +
    '<line class="ln" x1="180" y1="103" x2="470" y2="103" stroke-width="3"/><rect class="box-r" x="196" y="94" width="28" height="18"/>' +
    '<rect class="router" x="470" y="55" width="140" height="90" rx="8"/><text class="t-b" x="480" y="74">Router B</text>' +
    '<text class="t-sm t-violet t-b" x="44" y="168">① d_proc</text><text class="t-xs" x="44" y="183">check errors, choose output link</text>' +
    '<text class="t-sm t-blue t-b" x="96" y="44">② d_queue — wait in buffer</text>' +
    '<text class="t-sm t-red t-b" x="186" y="138">③ d_trans = L/R</text><text class="t-xs" x="186" y="153">push all bits onto link</text>' +
    '<text class="t-sm t-green t-b" x="300" y="88">④ d_prop = d/s</text><text class="t-xs" x="300" y="125">bit travels the link length d</text>' +
    '<line class="ln-green" x1="236" y1="72" x2="464" y2="72" marker-end="url(#ahg)"/>' +
    '<text class="t-sm t-b" x="330" y="200">d_nodal = d_proc + d_queue + d_trans + d_prop</text></svg>';

  var queueCurve = (function () {
    var pts = []; for (var x = 0; x <= 0.955; x += 0.035) pts.push([x, Math.min(24, x / (1 - x))]);
    return CN.plot({ w: 620, h: 260, xMax: 1.1, yMax: 25, xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1], yTicks: [], xLabel: 'traffic intensity  La/R', yLabel: 'avg. queueing delay', label: 'Queueing delay versus traffic intensity',
      series: [{ pts: pts, cls: 'ln-blue' }], vlines: [{ x: 1, cls: 'ln-red', text: 'La/R = 1', tcls: 't-red' }, { x: 0.8, text: '0.8 (UN-3)' }],
      notes: [{ x: 0.05, y: 4, text: 'small delay' }, { x: 0.45, y: 12, text: 'grows rapidly →' }, { x: 1.01, y: 20, text: '> 1: unbounded', cls: 't-red' }] });
  })();

  var pipeSVG = (function () {
    var rates = [20, 4, 16, 10], s = '<svg class="d" viewBox="0 0 640 150" role="img" aria-label="Bottleneck link determines throughput">';
    s += '<rect class="box-v" x="6" y="45" width="56" height="50" rx="4"/><text class="t-sm t-b" text-anchor="middle" x="34" y="74">Server</text>';
    rates.forEach(function (r, i) {
      var x = 66 + i * 128, h = r * 2.1, bott = r === 4;
      s += '<rect x="' + x + '" y="' + (70 - h / 2) + '" width="124" height="' + h + '" fill="' + (bott ? '#f5c4b6' : '#cfe0f6') + '" stroke="' + (bott ? '#b3361f' : '#1f4e8c') + '"/>';
      s += '<text class="t-sm ' + (bott ? 't-red t-b' : '') + '" text-anchor="middle" x="' + (x + 62) + '" y="' + (bott ? 52 : 32) + '">' + r + ' Mbps' + (bott ? ' ← bottleneck' : '') + '</text>';
    });
    s += '<rect class="host" x="582" y="45" width="52" height="50" rx="4"/><text class="t-sm t-b" text-anchor="middle" x="608" y="74">Client</text>';
    return s + '<text class="t-b" text-anchor="middle" x="320" y="135">Throughput = min(20, 4, 16, 10) = 4 Mbps</text></svg>';
  })();

  var encapSVG = (function () {
    var rows = { a: 30, t: 72, n: 114, l: 156, p: 198 }, names = { a: 'Application', t: 'Transport', n: 'Network', l: 'Link', p: 'Physical' }, pdu = { a: 'M', t: 'Ht M', n: 'Hn Ht M', l: 'Hl Hn Ht M', p: 'bits' };
    function stack(x, w, keys, showPdu) {
      return keys.map(function (k) {
        return '<rect class="' + (k === 'a' ? 'box-b' : k === 't' ? 'box-g' : k === 'n' ? 'box-v' : k === 'l' ? 'box-y' : 'box-grey') + '" x="' + x + '" y="' + rows[k] + '" width="' + w + '" height="36" rx="3"/>' +
          '<text class="t-sm" x="' + (x + 8) + '" y="' + (rows[k] + 22) + '">' + names[k] + '</text>' +
          (showPdu ? '<text class="t-xs t-mono t-b" text-anchor="end" x="' + (x + w - 6) + '" y="' + (rows[k] + 22) + '">' + pdu[k] + '</text>' : '');
      }).join('');
    }
    var s = '<svg class="d" viewBox="0 0 790 300" role="img" aria-label="Encapsulation from source through switch and router to destination">' + CN.defs;
    s += '<polyline class="ln-blue" points="95,48 95,252 295,252 295,174 295,252 485,252 485,132 485,252 695,252 695,52" marker-end="url(#ahb)"/>';
    s += stack(20, 160, ['a', 't', 'n', 'l', 'p'], true) + stack(240, 110, ['l', 'p'], false) + stack(420, 130, ['n', 'l', 'p'], false) + stack(620, 160, ['a', 't', 'n', 'l', 'p'], true);
    s += '<text class="t-sm t-b" text-anchor="middle" x="100" y="282">Source host (encapsulate ↓)</text><text class="t-sm t-b" text-anchor="middle" x="295" y="282">Switch</text><text class="t-sm t-b" text-anchor="middle" x="485" y="282">Router</text><text class="t-sm t-b" text-anchor="middle" x="700" y="282">Destination (decapsulate ↑)</text>';
    s += '<text class="t-xs t-mut" text-anchor="middle" x="295" y="22">reads Hl only</text><text class="t-xs t-mut" text-anchor="middle" x="485" y="100">reads up to Hn</text>';
    return s + '</svg>';
  })();

  var archSVG = '<svg class="d" viewBox="0 0 640 210" role="img" aria-label="Client-server versus peer-to-peer">' +
    panel(10, 20, 'Client–server', { s: [100, 82, 'srv', 'server'], a: [35, 45, 'h'], b: [165, 45, 'h'], c: [35, 125, 'h'], d: [165, 125, 'h'] }, [['s', 'a'], ['s', 'b'], ['s', 'c'], ['s', 'd']]) +
    panel(220, 20, 'Peer-to-peer', { a: [100, 45, 'h', 'peer'], b: [165, 85, 'h'], c: [125, 135, 'h'], d: [50, 120, 'h'], e: [40, 62, 'h'] }, [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'a'], ['a', 'c'], ['b', 'd']]) +
    panel(430, 20, 'Hybrid', { t: [100, 45, 'srv', 'tracker'], a: [35, 120, 'h'], b: [100, 135, 'h'], c: [165, 120, 'h'] }, [['a', 'b'], ['b', 'c'], ['a', 'c']], '<line class="ln-dash" x1="100" y1="63" x2="35" y2="111"/><line class="ln-dash" x1="100" y1="63" x2="165" y2="111"/><line class="ln-dash" x1="100" y1="63" x2="100" y2="126"/>') +
    '<text class="t-xs t-mut" x="440" y="200">dashed = lookup only; solid = data</text></svg>';

  var dashSVG = (function () {
    var r = [['1080p · 5 Mbps', 30], ['720p · 2.5 Mbps', 72], ['480p · 1 Mbps', 114]], pick = [1, 0, 0, 1, 2, 2, 1, 0];
    var s = '<svg class="d" viewBox="0 0 640 175" role="img" aria-label="DASH segment selection">' + CN.defs;
    r.forEach(function (row, ri) {
      s += '<text class="t-sm" x="6" y="' + (row[1] + 21) + '">' + row[0] + '</text>';
      for (var i = 0; i < 8; i++) s += '<rect class="' + (pick[i] === ri ? 'box-b' : 'box') + '" x="' + (150 + i * 60) + '" y="' + row[1] + '" width="54" height="32" rx="3"/><text class="t-xs" text-anchor="middle" x="' + (177 + i * 60) + '" y="' + (row[1] + 20) + '">S' + (i + 1) + '</text>';
    });
    s += '<polyline class="ln-red" points="' + pick.map(function (p, i) { return (177 + i * 60) + ',' + (r[p][1] + 16); }).join(' ') + '"/>';
    return s + '<text class="t-xs t-mut" x="150" y="166">red path = quality the client requests per segment, based on measured bandwidth</text></svg>';
  })();

  var p2pPlot = (function () {
    var cs = [], pp = [];
    for (var n = 0; n <= 35; n++) { cs.push([n, n * 0.1]); pp.push([n, n === 0 ? 0 : Math.max(0.1, n / (10 + n))]); }
    return CN.plot({ w: 600, h: 250, xMax: 36, yMax: 3.6, xTicks: [0, 5, 10, 15, 20, 25, 30, 35], yTicks: [0, 1, 2, 3], xLabel: 'number of peers / clients N', yLabel: 'min. distribution time (h)', label: 'Client-server vs P2P distribution time',
      series: [{ pts: cs, cls: 'ln-red' }, { pts: pp, cls: 'ln-green' }], notes: [{ x: 24, y: 2.85, text: 'client–server (linear)', cls: 't-red' }, { x: 24, y: 0.95, text: 'P2P (levels off)', cls: 't-green' }] });
  })();

  /* ================= Topics (GfG-style: What → How → Types → Pros/Cons → Example → Compare) ================= */
  var h = function (s) { return '<h2>' + s + '</h2>'; }, p = function (s) { return '<p>' + s + '</p>'; };
  var ol = function (a) { return '<ol class="steps">' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>'; };
  var ul = function (a) { return '<ul>' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; };

  CN.add({
    id: 'u1-overview', unit: '1', group: 'Overview', kicker: 'UNIT 1', title: 'Unit 1 overview — the Internet & application layer',
    src: ['Approved CDP_23CSE302 CN.pdf', 'CN_Unit1_PartA.pdf', 'CN_Unit1_PartB.pdf'],
    left: p('Unit 1 explains how the Internet is built (edge and core), how fast data moves through it (delay and throughput), how its functions are organised (protocol layers), and how applications such as the Web, e-mail and DNS use it.') +
      mmd('Unit 1 roadmap', `flowchart LR
  E["Edge"] --> C["Core"] --> D["Delay & throughput"] --> L["Layers"]
  H["HTTP"] --> F["FTP"] --> M["E-mail"] --> DN["DNS"] --> P["P2P"] --> V["Video & CDN"]`, 'Top row: how the network works. Bottom row: applications that use it.') +
      h('Key formulas') +
      t(['Quantity', 'Formula'], [
        ['Transmission delay', '<code>d_trans = L / R</code>'],
        ['Propagation delay', '<code>d_prop = d / s</code>'],
        ['Nodal delay', '<code>d_proc + d_queue + d_trans + d_prop</code>'],
        ['End-to-end delay, N links (one packet)', '<code>N × (L/R) + N × d_prop</code>'],
        ['Traffic intensity', '<code>L·a / R</code>'],
        ['Throughput', '<code>min(R1, …, Rn)</code>; shared link: <code>min(Rs, Rc, R/N)</code>']
      ], null, 'compact')
  });

  CN.add({
    id: 'u1-internet', unit: '1', group: 'Foundations', kicker: '1.1', title: 'What is the Internet? Protocols & the network edge',
    src: ['Chapter_1 (The Internet-The Network Edge, the Network Core).pdf', 'CN_Unit1_PartA.pdf', 'ComputerNetworks_Unit1_Lecture1 (1).pdf'],
    left: h('What is the Internet?') +
      p('The <b>Internet</b> is a global network of networks that interconnects billions of devices using the TCP/IP protocol suite. It can be described by its components (nuts-and-bolts view) or by the services it provides (service view).') +
      h('Components of the Internet') +
      t(['Component', 'Description', 'Examples'], [
        ['Hosts / end systems', 'Devices at the edge that run applications', 'PCs, phones, servers'],
        ['Communication links', 'Carry bits; speed = transmission rate', 'Fibre, copper, radio'],
        ['Packet switches', 'Forward packets towards the destination', 'Routers, switches'],
        ['ISPs', 'Networks that interconnect to form the Internet', 'Jio, Airtel, Tata'],
        ['Standards', 'Agreed protocol documents', 'RFCs (IETF)']
      ], null, 'compact') +
      h('Service view') +
      p('The Internet is an infrastructure that provides services to applications such as the Web, e-mail and video calls. Applications use it through a <b>socket API</b>, like customers use a postal service without knowing how letters are routed.'),
    right: h('What is a protocol?') +
      b('def', '<p>A <b>protocol</b> defines the <b>format</b> and <b>order</b> of messages exchanged between entities, and the <b>actions</b> taken when a message is sent or received.</p>') +
      mmd('Protocol example', `sequenceDiagram
  participant A as Browser
  participant B as Web server
  A->>B: TCP connection request
  B-->>A: TCP connection response
  A->>B: GET page
  B-->>A: page file`, 'Like a human greeting, each message follows an agreed rule.') +
      h('What is the network edge?') +
      p('The <b>network edge</b> is where users connect: the end systems (clients and servers). Hosts reach the Internet through an <b>access network</b>, and the <b>network core</b> of routers carries data between them.') +
      mmd('Edge → access → core', `flowchart LR
  H["End systems"] --> A["Access network"] --> R["Edge router"] --> C["Network core"]`, '') +
      S('Client', ['requests services', 'may have a dynamic IP', 'connects intermittently'], 'Server', ['always on', 'fixed IP address', 'serves many clients'])
  });

  CN.add({
    id: 'u1-access', unit: '1', group: 'Foundations', kicker: '1.2', title: 'Access networks & physical media',
    src: ['Chapter_1 (The Internet-The Network Edge, the Network Core).pdf', 'CN_Unit1_PartA.pdf', 'ComputerNetworks_Unit1_Lecture1 (1).pdf'],
    left: h('What is an access network?') +
      p('An <b>access network</b> physically connects an end system to its first router (edge router). Two things matter: its <b>transmission rate</b> and whether the line is <b>dedicated or shared</b>.') +
      h('Types of access networks') +
      t(['Type', 'How it works', 'Rate (slides)', 'Line'], [
        ['DSL', 'Uses the telephone line to the central office (DSLAM); voice and data on different frequencies', '↓ 24 Mbps, ↑ 2.5 Mbps', 'Dedicated'],
        ['Cable (HFC)', 'Hybrid fibre-coax to the cable headend (CMTS)', '↓ 30 Mbps, ↑ 2 Mbps', 'Shared'],
        ['FTTH', 'Optical fibre to the home', '100s Mbps – Gbps', 'Dedicated'],
        ['Ethernet', 'Wired switches in offices and campuses', '10 Mbps – 10 Gbps', 'Switched'],
        ['Wi-Fi', 'Wireless LAN through an access point', '54 – 450 Mbps', 'Shared'],
        ['Cellular', '4G/5G base stations', '4G ≈ 10–50 Mbps', 'Shared']
      ], null, 'compact') +
      mmd('DSL vs cable', `flowchart LR
  D1["DSL modem"] -->|"own line"| D2["DSLAM"] --> D3["ISP"]
  C1["Cable modems"] -->|"shared coax"| C2["CMTS"] --> C3["ISP"]`, ''),
    right: h('What is a physical medium?') +
      p('A <b>physical medium</b> carries the signal between transmitter and receiver. In <b>guided media</b> the signal travels through a cable; in <b>unguided media</b> it travels through air or space.') +
      t(['Property', 'Twisted pair', 'Coaxial', 'Optical fibre', 'Radio'], [
        ['Signal', 'Electrical', 'Electrical', 'Light', 'EM waves'],
        ['Speed', '10 Mbps – 10 Gbps', 'Up to 10 Gbps', '10s–100s Gbps', 'Up to 1+ Gbps'],
        ['Distance', '~100 m', '~500 m', 'Several km', 'Varies'],
        ['Noise immunity', 'Moderate', 'Good', 'Immune to EMI', 'Low'],
        ['Use', 'LAN, telephone', 'Cable TV', 'Backbones', 'Wi-Fi, cellular']
      ], null, 'compact') +
      p('Radio links include terrestrial microwave (up to 45 Mbps), Wi-Fi, cellular, and satellite (up to 45 Mbps, about 270 ms delay).') +
      b('mistake', '<p>Here “bandwidth” means transmission rate (bps). In the physical layer (Unit 3) it means a frequency range (Hz).</p>')
  });

  CN.add({
    id: 'u1-core', unit: '1', group: 'Foundations', kicker: '1.3', title: 'Network core — packet switching vs circuit switching',
    src: ['Chapter_1 (The Internet-The Network Edge, the Network Core).pdf', 'CN_Unit1_PartA.pdf', 'CN Numerical questions.docx'],
    left: h('What is the network core?') +
      p('The <b>network core</b> is the mesh of routers that carries data between end systems. Data moves through it by <b>packet switching</b> or <b>circuit switching</b>.') +
      h('What is packet switching?') +
      p('In <b>packet switching</b>, a message is split into packets that travel independently and are sent on each link at full speed. Link capacity is shared on demand.') +
      h('How it works (store-and-forward)') +
      ol(['The source splits the message into packets of L bits.', 'Each packet takes L/R seconds to send on a link of rate R.', 'A router receives the <b>whole</b> packet before forwarding it.', 'If packets arrive faster than they can be sent, they wait in a buffer; if the buffer is full, they are dropped.']) +
      fig('Store-and-forward', storeFwdSVG, 'Over two links a packet takes 2L/R. Eg: L = 7.5 Mb, R = 1.5 Mbps → 5 s per hop.', { wide: true }) +
      p('<b>Routing</b> decides the path across the network; <b>forwarding</b> moves a packet from a router’s input to the right output using its forwarding table.'),
    right: h('What is circuit switching?') +
      p('In <b>circuit switching</b>, a dedicated end-to-end path is reserved before communication and held for the whole session, even when idle. Eg: traditional telephone network.') +
      fig('FDM vs TDM', fdmTdmSVG, '', { wide: true }) +
      ul(['<b>FDM</b>: each call gets its own frequency band all the time (Eg: FM radio).', '<b>TDM</b>: each call gets the full bandwidth in its own time slot (Eg: GSM).']) +
      h('Packet vs circuit switching') +
      t(['Basis', 'Packet switching', 'Circuit switching'], [
        ['Set-up', 'Not needed', 'Needed'],
        ['Resources', 'Shared on demand', 'Dedicated'],
        ['Delay', 'Variable', 'Constant'],
        ['Loss', 'Possible', 'No congestion loss'],
        ['Best for', 'Bursty data', 'Voice calls']
      ], null, 'compact') +
      h('Example') +
      p('On a 1 Mbps link where each user needs 100 kbps but is active only 10% of the time, circuit switching admits <b>10 users</b>, while packet switching supports <b>35 users</b> (the chance of more than 10 being active together is below 0.0004).')
  });

  CN.add({
    id: 'u1-structure', unit: '1', group: 'Foundations', kicker: '1.3', title: 'Internet structure — a network of networks',
    src: ['Chapter_1 (The Internet-The Network Edge, the Network Core).pdf', 'CN_Unit1_PartA.pdf'],
    left: h('How is the Internet structured?') +
      p('Users connect through <b>access ISPs</b>. Linking every ISP to every other would need too many links, so ISPs form a <b>hierarchy</b>: access ISPs connect to regional ISPs, which connect to global <b>tier-1 ISPs</b>. ISPs exchange traffic at <b>Internet Exchange Points (IXPs)</b>.') +
      mmd('ISP hierarchy', `flowchart LR
  U["Users"] --> AC["Access ISP"] --> RG["Regional ISP"] --> T1["Tier-1 ISP"]
  T1 <-->|"IXP"| T2["Tier-1 ISP"]`, '') +
      t(['Level', 'Role', 'Examples'], [
        ['Tier-1 ISP', 'Global backbone', 'AT&amp;T, NTT, Tata Communications'],
        ['IXP', 'Point where ISPs interconnect', 'NIXI (India)'],
        ['Regional ISP', 'Connects access ISPs to tier-1', 'Railtel, Powergrid'],
        ['Access ISP', 'Connects homes and offices', 'Jio, Airtel, BSNL'],
        ['Content provider network', 'Private network close to users', 'Google, Akamai']
      ], null, 'compact') +
      b('ex', '<p>Local roads = access ISPs, state highways = regional ISPs, national highways = tier-1 ISPs, toll plazas = IXPs.</p>', 'Analogy')
  });

  CN.add({
    id: 'u1-topology', unit: '1', group: 'Foundations', kicker: '1.4', title: 'Network topology',
    src: ['CN_Unit1_PartA.pdf'],
    left: h('What is network topology?') +
      p('<b>Network topology</b> is the physical or logical arrangement of devices and links in a network. It affects cost, reliability, performance and how easily the network can grow.') +
      fig('Types of topology', topoSVG, '', { wide: true }) +
      t(['Topology', 'How it works', 'Advantage', 'Disadvantage', 'Example'], [
        ['Bus', 'All devices share one backbone cable', 'Cheap, little cable', 'Backbone failure stops all', 'Early Ethernet'],
        ['Star', 'All devices connect to a central switch', 'Easy to manage and expand', 'Central device is a single point of failure', 'Home Wi-Fi'],
        ['Ring', 'Each device links to two neighbours in a loop', 'No collisions', 'One failure can break the ring', 'Metro fibre'],
        ['Mesh', 'Every device links to every other', 'Very fault tolerant', 'Expensive, many cables', 'Internet backbone'],
        ['Tree', 'Hierarchy of stars under a root', 'Easy to expand', 'Root failure affects many', 'Campus network'],
        ['Hybrid', 'Mix of two or more topologies', 'Flexible and scalable', 'Complex, costly', 'Data centres']
      ], null, 'compact'),
    right: h('Comparison') +
      t(['Topology', 'Cost', 'Reliability', 'Scalability', 'Fault tolerance'], [
        ['Bus', 'Low', 'Low', 'Low', 'Low'], ['Star', 'Medium', 'High', 'High', 'Medium'], ['Ring', 'Medium', 'Medium', 'Medium', 'Medium'],
        ['Mesh', 'Very high', 'Very high', 'Medium', 'Very high'], ['Tree', 'Medium', 'High', 'High', 'Medium'], ['Hybrid', 'High', 'High', 'Very high', 'High']
      ], null, 'compact center') +
      h('Example') +
      p('A bank with several branches and a data centre should use a <b>hybrid</b> design: each branch as a <b>star</b> (cheap, easy to expand), and a <b>redundant mesh backbone</b> to the data centre, because a data-centre failure would affect every branch.')
  });

  CN.add({
    id: 'u1-types', unit: '1', group: 'Foundations', kicker: '1.4', title: 'Types of networks — PAN, LAN, MAN, WAN',
    src: ['CN_Unit1_PartA.pdf'],
    left: h('How are networks classified?') +
      p('Networks are classified by the area they cover: <b>PAN &lt; LAN &lt; MAN &lt; WAN</b>. The Internet is the largest WAN.') +
      fig('Networks by scale', netTypesSVG, '', { wide: true }) +
      ul(['<b>PAN</b> (Personal Area Network) — a few metres. Eg: Bluetooth headset.', '<b>LAN</b> (Local Area Network) — a building or campus. Eg: college network.', '<b>MAN</b> (Metropolitan Area Network) — a city. Eg: city cable-TV network.', '<b>WAN</b> (Wide Area Network) — a country or the world. Eg: the Internet.']),
    right: t(['Basis', 'PAN', 'LAN', 'MAN', 'WAN'], [
      ['Coverage', 'Few metres', 'Building / campus', 'City', 'Country – globe'],
      ['Speed', 'Low', 'High', 'Moderate–high', 'Lower per user'],
      ['Ownership', 'Individual', 'One organisation', 'Provider', 'Many carriers'],
      ['Technology', 'Bluetooth', 'Ethernet, Wi-Fi', 'Metro fibre', 'Fibre backbones']
    ], null, 'compact') +
      b('supp', '<p>Speed, ownership and technology rows are added for QB Q4; the slides give coverage and examples.</p>') +
      h('Example') +
      p('A logistics company would use a <b>LAN</b> for the warehouse and head office, a <b>WAN</b> to link depots in different cities, and a <b>PAN</b> for wearable scanners.')
  });

  CN.add({
    id: 'u1-delay', unit: '1', group: 'Performance', kicker: '1.5', title: 'Delay & loss in packet-switched networks',
    src: ['Chapter_1 (The Internet-The Network Edge, the Network Core).pdf', 'CN_Unit1_PartA.pdf', 'ComputerNetworks_Unit1_Lecture1 (1).pdf'],
    left: h('What is nodal delay?') +
      p('At each router, a packet experiences four delays. Their sum is the <b>nodal delay</b>.') +
      F('d_nodal = d_proc + d_queue + d_trans + d_prop') +
      fig('Four sources of delay', delaySVG, '', { wide: true }) +
      t(['Delay', 'Meaning', 'Depends on'], [
        ['Processing', 'Checking the header and choosing the output link (&lt; 1 ms)', 'Router speed'],
        ['Queueing', 'Waiting in the output buffer', 'Congestion'],
        ['Transmission (L/R)', 'Pushing all bits of the packet onto the link', 'Packet size, link rate'],
        ['Propagation (d/s)', 'A bit travelling along the link', 'Distance, medium (s ≈ 2×10⁸ m/s)']
      ], null, 'compact') +
      h('Example — caravan analogy') +
      p('Ten cars pass a toll booth that serves one car every 12 s (transmission: 120 s), then drive 100 km at 100 km/h (propagation: 60 min). The caravan reaches the next booth after <b>62 minutes</b>.'),
    right: h('What is traffic intensity?') +
      p('<b>Traffic intensity</b> = L·a / R (packet length × arrival rate ÷ link rate). It shows how loaded a link is.') +
      fig('Queueing delay vs traffic intensity', queueCurve, 'Illustrative curve shape (supplementary).', { wide: true }) +
      ul(['La/R near 0 → small queueing delay.', 'La/R near 1 → large queueing delay.', 'La/R above 1 → delay grows without limit.']) +
      h('What is packet loss?') +
      p('Router buffers have limited space. A packet that arrives when the buffer is full is <b>dropped</b>. TCP retransmits lost packets; UDP does not.') +
      p('<b>traceroute</b> measures the round-trip delay to each router on a path by sending three probes per router.')
  });

  CN.add({
    id: 'u1-throughput', unit: '1', group: 'Performance', kicker: '1.5', title: 'Throughput & worked numericals',
    src: ['Chapter_1 (The Internet-The Network Edge, the Network Core).pdf', 'CN_Unit1_PartA.pdf', 'CN Numerical questions.docx'],
    left: h('What is throughput?') +
      p('<b>Throughput</b> is the rate (bits per second) at which data is actually delivered from sender to receiver. It can be <b>instantaneous</b> (at one moment) or <b>average</b> (over a period).') +
      h('Bottleneck link') +
      p('End-to-end throughput is limited by the slowest link on the path, the <b>bottleneck link</b>. If N flows share a link of rate R, each gets about R/N.') +
      F('Throughput = min(R1, R2, …, Rn)') +
      fig('Bottleneck rule', pipeSVG, '', { wide: true }),
    right: h('Worked examples') +
      calc({ title: 'Transmission and propagation delay', src: 'Chapter_1 slides', steps: ['d_trans = 1000 bits / 100 bps = 10 s', 'd_prop = 1000 km / 200,000 km/s = 5 ms'], answer: '10 s and 5 ms' }) +
      calc({ title: 'End-to-end delay over 3 links', src: 'Numerical sheet Q1', given: ['800,000 bits as one packet', '3 links of 2 Mbps, 4000 km each'],
        steps: ['d_trans = 800,000 / 2×10⁶ = 0.4 s', 'd_prop = 4×10⁶ / 2×10⁸ = 0.02 s', 'Total = 3 × 0.4 + 3 × 0.02 = 1.26 s'], answer: '1.26 s' }) +
      calc({ title: 'Bottleneck throughput', src: 'Numerical sheet Q2', given: ['20 MB file (1 MB = 8×10⁶ bits)', 'Links 10, 2, 8, 5 Mbps'],
        steps: ['Throughput = min(10, 2, 8, 5) = 2 Mbps', 'Time = 1.6×10⁸ / 2×10⁶ = 80 s'], answer: '2 Mbps; 80 s' })
  });

  CN.add({
    id: 'u1-layers', unit: '1', group: 'Architecture', kicker: '1.6', title: 'Protocol layers & encapsulation',
    src: ['Chapter_1 (The Internet-The Network Edge, the Network Core).pdf', 'CN_Unit1_PartA.pdf', 'ComputerNetworks_Unit1_Lecture1 (1).pdf'],
    left: h('What is layering?') +
      p('<b>Layering</b> divides network functions into layers. Each layer offers a service to the layer above and uses the service of the layer below. This makes a complex system easier to design and change, like the separate steps of air travel (ticket, baggage, gate, runway, flight).') +
      h('The 5-layer Internet stack') +
      t(['Layer', 'Function', 'Protocols', 'Data unit'], [
        ['Application', 'Supports network applications', 'HTTP, FTP, SMTP, DNS', 'Message'],
        ['Transport', 'Process-to-process delivery', 'TCP, UDP', 'Segment'],
        ['Network', 'Routes datagrams between hosts', 'IP', 'Datagram'],
        ['Link', 'Transfers data between neighbours', 'Ethernet, Wi-Fi', 'Frame'],
        ['Physical', 'Sends bits over the medium', 'Copper, fibre, radio', 'Bits']
      ], null, 'compact') +
      p('The <b>OSI model</b> has seven layers. Its <b>presentation</b> (encryption, compression) and <b>session</b> (synchronisation, recovery) layers are not separate in the Internet stack; applications handle them if needed.'),
    right: h('What is encapsulation?') +
      p('<b>Encapsulation</b> means each layer adds its own header to the data from the layer above. At the receiver, each layer removes its header (<b>decapsulation</b>).') +
      fig('Encapsulation', encapSVG, '', { wide: true }) +
      ol(['Application creates message M.', 'Transport adds H<sub>t</sub> → segment.', 'Network adds H<sub>n</sub> → datagram.', 'Link adds H<sub>l</sub> → frame; physical sends bits.', 'A router reads up to the network header; a switch reads only the link header.', 'The receiver removes the headers and delivers M.'])
  });

  CN.add({
    id: 'u1-security', unit: '1', group: 'Architecture', kicker: '1.7–1.8', title: 'Network security & Internet history',
    src: ['Chapter_1 (The Internet-The Network Edge, the Network Core).pdf', 'CN_Unit1_PartA.pdf'],
    left: h('Why is security needed?') +
      p('The Internet was designed for trusted users, so security was not built in. Today it must be added at every layer.') +
      t(['Threat', 'Description'], [
        ['Virus', 'Malware that spreads when a user runs an infected object'],
        ['Worm', 'Malware that spreads by itself'],
        ['Botnet', 'Infected hosts used for spam and DDoS'],
        ['DoS / DDoS', 'Flooding a server or link with bogus traffic'],
        ['Packet sniffing', 'Reading packets on a shared medium (Eg: Wireshark)'],
        ['IP spoofing', 'Sending packets with a fake source address']
      ], null, 'compact'),
    right: h('History of the Internet') +
      t(['Period', 'Milestone'], [
        ['1961–1972', 'Packet switching ideas; ARPAnet (1969); first e-mail'],
        ['1972–1980', 'Cerf and Kahn’s internetworking architecture; Ethernet'],
        ['1980–1990', 'TCP/IP deployed; SMTP, DNS, FTP defined'],
        ['1990s', 'World Wide Web (Tim Berners-Lee); commercial Internet'],
        ['2005–now', 'Smartphones, social networks, cloud computing']
      ], null, 'compact')
  });

  CN.add({
    id: 'u1-apps', unit: '1', group: 'Application layer', kicker: '2.1', title: 'Principles of network applications',
    src: ['CN_Unit1_PartB.pdf', 'CN_Unit1_PartB Extended.pdf'],
    left: h('What is a network application?') +
      p('A <b>network application</b> is a program on end systems that communicates over the network, such as a browser and a web server. Applications do not run on routers, so new ones can be deployed easily.') +
      fig('Application architectures', archSVG, '', { wide: true }) +
      h('Client–server architecture') +
      p('An always-on <b>server</b> with a fixed IP address serves requests from <b>clients</b>. Clients do not talk to each other directly. Eg: Web, e-mail.') +
      h('Peer-to-peer (P2P) architecture') +
      p('There is no always-on server; <b>peers</b> communicate directly and each acts as both client and server. Eg: BitTorrent.') +
      P(['scales well: each peer adds capacity', 'no single server to fail'], ['hard to manage and secure', 'depends on peers being online']),
    right: h('How do processes communicate?') +
      p('A process sends and receives messages through a <b>socket</b>. To reach a process, the sender needs the host’s <b>IP address</b> and the process’s <b>port number</b> (HTTP 80, HTTPS 443, FTP 21, SMTP 25, DNS 53).') +
      h('TCP vs UDP for applications') +
      t(['Basis', 'TCP', 'UDP'], [['Reliability', 'Guaranteed, in order', 'Not guaranteed'], ['Connection', 'Connection-oriented', 'Connectionless'], ['Overhead', 'Higher', 'Low'], ['Used by', 'Web, e-mail, FTP', 'Streaming, VoIP, DNS']], 'Use TCP when correctness matters; UDP when speed matters.', 'compact')
  });

  CN.add({
    id: 'u1-http', unit: '1', group: 'Application layer', kicker: '2.2', title: 'The Web and HTTP',
    src: ['CN_Unit1_PartB.pdf', 'CN_Unit1_PartB Extended.pdf'],
    left: h('What is HTTP?') +
      p('<b>HTTP (HyperText Transfer Protocol)</b> is the protocol of the Web. A browser requests objects and a web server returns them over TCP port 80. HTTP is <b>stateless</b>: the server does not remember past requests.') +
      h('Non-persistent vs persistent HTTP') +
      p('In <b>non-persistent HTTP</b>, each object needs its own TCP connection. In <b>persistent HTTP</b> (default in HTTP/1.1), one connection is reused for all objects, which saves time.') +
      mmd('Non-persistent HTTP', `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: open TCP connection
  S-->>C: accept
  C->>S: GET object
  S-->>C: object, then close
  Note over C,S: repeated for every object`, 'Each object costs about 2 RTT.') +
      t(['Basis', 'Non-persistent', 'Persistent'], [['Objects per connection', 'One', 'Many'], ['Connections for N objects', 'N', '1'], ['Speed', 'Slower', 'Faster']], null, 'compact'),
    right: h('HTTP messages') +
      p('A <b>request</b> has a request line (Eg: <code>GET /index.html HTTP/1.1</code>), headers and an optional body. A <b>response</b> has a status line (Eg: <code>HTTP/1.1 200 OK</code>), headers and the data.') +
      t(['Status code', 'Meaning'], [['200 OK', 'Success'], ['301 Moved Permanently', 'Object moved'], ['304 Not Modified', 'Cached copy is valid'], ['404 Not Found', 'Object not found']], null, 'compact') +
      h('Cookies') +
      p('<b>Cookies</b> let a website remember users. The server sends an ID in a <code>Set-Cookie</code> header, the browser stores it and sends it back with each request, and the server looks it up in its database. Eg: shopping carts.') +
      h('Web cache (proxy server)') +
      p('A <b>web cache</b> keeps copies of recently requested objects and answers requests locally, reducing response time and access-link traffic. A <b>conditional GET</b> asks the server to send the object only if it has changed; otherwise the server replies <b>304 Not Modified</b>.') +
      p('<b>HTTPS</b> is HTTP over TLS (port 443): it encrypts data and authenticates the server.')
  });

  CN.add({
    id: 'u1-ftp', unit: '1', group: 'Application layer', kicker: '2.3', title: 'File Transfer Protocol (FTP)',
    src: ['CN_Unit1_PartB.pdf', 'CN_Unit1_PartB Extended.pdf'],
    left: h('What is FTP?') +
      p('<b>FTP (File Transfer Protocol)</b> transfers files between a client and a remote server over TCP. It uses <b>two connections</b>: a <b>control connection</b> (port 21) for commands and a <b>data connection</b> (port 20) for file data.') +
      h('How it works') +
      ol(['The client opens the control connection on port 21.', 'The client logs in with USER and PASS.', 'For each file, a separate data connection is opened.', 'The file is sent over the data connection, which then closes.', 'The control connection stays open until QUIT.']) +
      t(['Command', 'Purpose'], [['USER / PASS', 'Log in'], ['LIST', 'List files'], ['RETR', 'Download'], ['STOR', 'Upload'], ['QUIT', 'End session']], null, 'compact'),
    right: h('Active vs passive FTP') +
      t(['Basis', 'Active FTP', 'Passive FTP'], [['Data connection opened by', 'Server', 'Client'], ['Firewall friendly', 'No', 'Yes']], null, 'compact') +
      h('FTP vs HTTP') +
      t(['Basis', 'FTP', 'HTTP'], [['Connections', 'Two (control + data)', 'One'], ['Control info', 'Out-of-band (separate connection)', 'In-band'], ['State', 'Stateful', 'Stateless'], ['Port', '21 / 20', '80']], null, 'compact') +
      p('FTP sends passwords as plain text; FTPS and SFTP are secure versions.')
  });

  CN.add({
    id: 'u1-email', unit: '1', group: 'Application layer', kicker: '2.4', title: 'Electronic mail — SMTP, POP3, IMAP',
    src: ['CN_Unit1_PartB.pdf', 'CN_Unit1_PartB Extended.pdf'],
    left: h('Components of e-mail') +
      ul(['<b>User agent</b> — app to read and write mail (Gmail, Outlook).', '<b>Mail server</b> — stores mailboxes and queues outgoing mail.', '<b>SMTP</b> — protocol that sends mail between servers.']) +
      mmd('How e-mail is delivered', `flowchart LR
  A["Alice"] -->|"SMTP"| AS["Alice's server"] -->|"SMTP"| BS["Bob's server"] -->|"POP3 / IMAP"| B["Bob"]`, '') +
      h('What is SMTP?') +
      p('<b>SMTP (Simple Mail Transfer Protocol)</b> is a <b>push</b> protocol that sends mail from the sender’s mail server to the receiver’s mail server over TCP port 25. It works in three phases: <b>handshaking</b> (HELO, MAIL FROM, RCPT TO), <b>message transfer</b> (DATA) and <b>closure</b> (QUIT).'),
    right: h('Why POP3 and IMAP?') +
      p('SMTP can only push mail. Since a user’s device is not always online, it uses a <b>mail access protocol</b> to pull mail from its mail server.') +
      t(['Basis', 'POP3', 'IMAP'], [['Mail storage', 'Downloads and deletes from server', 'Keeps mail on server'], ['Folders', 'No', 'Yes, on server'], ['Many devices', 'Poor', 'Synced'], ['Complexity', 'Simple', 'More features']], null, 'compact') +
      h('What is MIME?') +
      p('SMTP supports only 7-bit ASCII text. <b>MIME</b> adds headers such as <code>Content-Type</code> so e-mail can carry images, attachments and other languages.')
  });

  CN.add({
    id: 'u1-dns', unit: '1', group: 'Application layer', kicker: '2.5', title: 'DNS — the Domain Name System',
    src: ['CN_Unit1_PartB.pdf', 'CN_Unit1_PartB Extended.pdf'],
    left: h('What is DNS?') +
      p('<b>DNS (Domain Name System)</b> translates hostnames such as www.amrita.edu into IP addresses. It is a distributed, hierarchical database and runs over UDP port 53.') +
      mmd('DNS hierarchy', `flowchart TB
  ROOT["Root servers"] --> COM["com TLD"]
  ROOT --> EDU["edu TLD"]
  COM --> G["google.com server"]
  EDU --> AM["amrita.edu server"]`, '') +
      t(['Server', 'Role'], [['Root', 'Points to TLD servers'], ['TLD', 'Handles .com, .edu, .in, etc.'], ['Authoritative', 'Holds an organisation’s records'], ['Local', 'First contact for a host; caches answers']], null, 'compact') +
      t(['Record', 'Purpose'], [['A', 'Name → IPv4 address'], ['AAAA', 'Name → IPv6 address'], ['CNAME', 'Alias → real name'], ['NS', 'Domain → name server'], ['MX', 'Domain → mail server']], null, 'compact'),
    right: h('How resolution works') +
      p('In an <b>iterative query</b>, each server tells the local server whom to ask next:') +
      mmd('Iterative query', `sequenceDiagram
  participant H as Host
  participant L as Local DNS
  participant R as Root
  participant T as TLD
  participant A as Authoritative
  H->>L: www.amrita.edu?
  L->>R: query
  R-->>L: ask TLD
  L->>T: query
  T-->>L: ask authoritative
  L->>A: query
  A-->>L: IP
  L-->>H: IP`, '') +
      p('In a <b>recursive query</b>, each server asks the next one on behalf of the requester and returns the final answer. Usually the host’s query to the local server is recursive, and the local server’s queries are iterative.') +
      p('Answers are <b>cached</b> to speed up later lookups. Attacks include <b>DNS cache poisoning</b>; <b>DNSSEC</b> protects records with signatures.')
  });

  CN.add({
    id: 'u1-p2p', unit: '1', group: 'Application layer', kicker: '2.6', title: 'Peer-to-peer applications & BitTorrent',
    src: ['CN_Unit1_PartB.pdf', 'CN_Unit1_PartB Extended.pdf'],
    left: h('Why does P2P scale better?') +
      p('In <b>client–server</b> distribution, the server sends the file to every client, so time grows with the number of clients. In <b>P2P</b>, peers that already have parts of the file upload them to others, so capacity grows as more peers join.') +
      fig('Distribution time vs peers', p2pPlot, 'Supplementary illustration (Kurose model).', { wide: true }),
    right: h('What is BitTorrent?') +
      p('<b>BitTorrent</b> is a P2P file-sharing protocol. The file is split into <b>chunks</b>; the group of peers sharing it is a <b>torrent (swarm)</b>; a <b>tracker</b> keeps the list of peers.') +
      mmd('BitTorrent', `flowchart LR
  N["New peer"] -->|"peer list?"| T["Tracker"]
  N <-->|"chunks"| P1["Peer 1"]
  N <-->|"chunks"| P2["Peer 2"]`, '') +
      h('How it works') +
      ol(['A new peer gets a list of peers from the tracker.', 'It downloads missing chunks from several peers at once.', 'It uploads the chunks it already has to others.', '<b>Rarest first</b>: it requests the rarest chunks first so they spread quickly.', '<b>Tit-for-tat</b>: it uploads to peers that upload to it fastest, which discourages free-riding.'])
  });

  CN.add({
    id: 'u1-cdn', unit: '1', group: 'Application layer', kicker: '2.7', title: 'Video streaming & CDNs',
    src: ['CN_Unit1_PartB.pdf', 'CN_Unit1_PartB Extended.pdf'],
    left: h('What is video streaming?') +
      p('<b>Streaming</b> plays a video while it is downloading. A small client <b>buffer</b> stores upcoming video; if it empties, playback pauses (buffering).') +
      h('What is DASH?') +
      p('<b>DASH (Dynamic Adaptive Streaming over HTTP)</b> stores a video at several qualities, split into short segments. The player checks the current bandwidth and picks the best quality for each next segment.') +
      fig('DASH quality selection', dashSVG, '', { wide: true }),
    right: h('What is a CDN?') +
      p('A <b>Content Distribution Network (CDN)</b> keeps copies of content on many servers spread around the world and sends each user to a nearby server. This lowers delay, reduces backbone traffic and avoids a single point of failure.') +
      h('How a CDN serves a user') +
      ol(['The user clicks a video; the link points to the CDN.', 'The browser asks DNS for the CDN’s address.', 'The CDN’s DNS returns the address of the nearest good server.', 'The video is streamed from that server.']) +
      t(['Basis', 'Enter deep', 'Bring home'], [['Placement', 'Many small clusters inside access ISPs', 'Few large clusters at IXPs'], ['Example', 'Akamai', 'Limelight'], ['Delay', 'Lowest', 'Slightly higher'], ['Cost', 'High', 'Lower']], null, 'compact') +
      p('For rural areas with weak backbone links, <b>enter deep</b> is better because content is kept inside the local networks.')
  });

  CN.add({
    id: 'u1-revision', unit: '1', group: 'Revision', kicker: 'UNIT 1 · REVISION', title: 'Unit 1 revision summary',
    src: ['All Unit-1 files'],
    left: t(['Topic', 'Key point'], [
      ['Internet', 'Network of networks using TCP/IP'],
      ['Protocol', 'Format, order and actions of messages'],
      ['Packet switching', 'Store-and-forward; shared; variable delay'],
      ['Circuit switching', 'Reserved path using FDM/TDM'],
      ['Nodal delay', 'Processing + queueing + transmission + propagation'],
      ['Throughput', 'Rate of the slowest link'],
      ['Layers', 'Application, transport, network, link, physical'],
      ['HTTP', 'Stateless; persistent connections are faster'],
      ['FTP', 'Control port 21, data port 20'],
      ['E-mail', 'SMTP sends; POP3/IMAP receive'],
      ['DNS', 'Root → TLD → authoritative'],
      ['P2P / CDN', 'Peers share load; CDNs serve from nearby']
    ], null, 'compact'),
    right: h('Common mistakes') +
      ul(['Mixing up transmission delay (L/R) and propagation delay (d/s).', 'Forgetting to multiply L/R by the number of links.', 'Using bytes instead of bits.', 'Saying HTTP remembers users (cookies do that).', 'Mixing up iterative and recursive DNS.']) +
      '<p class="small">Practice: <a href="#qb-u1-desc">Unit 1 questions</a> · <a href="#qb-u1-num">Unit 1 numericals</a></p>'
  });
})();
