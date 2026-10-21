/* Unit 2 — Transport layer (UDP, RDT, TCP, congestion control) and network layer (IP, routing). */
(function () {
  var b = CN.blk, t = CN.table, A = CN.arrows, S = CN.split, P = CN.pros, eg = CN.eg, F = CN.formula, calc = CN.calc, fig = CN.fig, mmd = CN.mmd;

  /* ---------- SVG figures ---------- */
  function lane(x, label) { return '<text class="t-b" text-anchor="middle" x="' + x + '" y="20">' + label + '</text><line class="ln" x1="' + x + '" y1="28" x2="' + x + '" y2="300"/>'; }
  var swVsPipeSVG = (function () {
    var s = '<svg class="d" viewBox="0 0 700 320" role="img" aria-label="Stop-and-wait versus pipelined transmission">' + CN.defs;
    s += '<text class="t-b t-red" x="20" y="316">Stop-and-wait: 1 packet per RTT</text><text class="t-b t-green" x="380" y="316">Pipelined: 3 packets per RTT</text>';
    s += lane(60, 'Sender') + lane(300, 'Receiver');
    s += '<polygon points="60,40 300,60 300,80 60,60" fill="#cfe0f6" stroke="#1f4e8c"/><text class="t-xs" x="120" y="44">pkt (L/R)</text>';
    s += '<line class="ln-green" x1="300" y1="80" x2="60" y2="230" marker-end="url(#ahg)"/><text class="t-xs t-green" x="190" y="170">ACK</text>';
    s += '<line class="ln-red" x1="30" y1="40" x2="30" y2="230"/><text class="t-xs t-red" x="4" y="140">RTT</text><text class="t-xs t-red" x="4" y="152">+L/R</text>';
    s += '<polygon points="60,230 300,250 300,270 60,250" fill="#cfe0f6" stroke="#1f4e8c"/><text class="t-xs t-mut" x="70" y="290">next packet only now</text>';
    s += lane(420, 'Sender') + lane(660, 'Receiver');
    [0, 20, 40].forEach(function (d, i) { s += '<polygon points="420,' + (40 + d) + ' 660,' + (60 + d) + ' 660,' + (80 + d) + ' 420,' + (60 + d) + '" fill="' + ['#cfe0f6', '#d9f0dc', '#fbe3c6'][i] + '" stroke="#1f4e8c"/>'; });
    [0, 20, 40].forEach(function (d) { s += '<line class="ln-green" x1="660" y1="' + (80 + d) + '" x2="420" y2="' + (230 + d) + '" marker-end="url(#ahg)"/>'; });
    s += '<text class="t-xs t-green" x="560" y="200">ACKs</text><text class="t-xs" x="470" y="44">pkt 0, 1, 2</text>';
    return s + '</svg>';
  })();

  var windowSVG = (function () {
    var s = '<svg class="d" viewBox="0 0 700 150" role="img" aria-label="Sender sliding window">' + CN.defs;
    var cls = function (i) { return i < 4 ? 'box-g' : i < 9 ? 'box-y' : i < 12 ? 'box-b' : 'box-grey'; };
    for (var i = 0; i < 16; i++) s += '<rect class="' + cls(i) + '" x="' + (20 + i * 41) + '" y="40" width="38" height="34" rx="2"/><text class="t-sm" text-anchor="middle" x="' + (39 + i * 41) + '" y="62">' + i + '</text>';
    s += '<rect x="182" y="34" width="327" height="46" fill="none" stroke="#b3361f" stroke-width="2" stroke-dasharray="6 4" rx="4"/>';
    s += '<text class="t-sm t-red t-b" x="250" y="26">window size N = 8</text>';
    s += '<rect class="box-g" x="10" y="91" width="8" height="10"/><text class="t-xs" x="22" y="100">ACKed</text><rect class="box-y" x="120" y="91" width="8" height="10"/><text class="t-xs" x="132" y="100">sent, not ACKed</text><rect class="box-b" x="290" y="91" width="8" height="10"/><text class="t-xs" x="302" y="100">usable, not sent</text><rect class="box-grey" x="450" y="91" width="8" height="10"/><text class="t-xs" x="462" y="100">not usable</text>';
    s += '<line class="ln" x1="185" y1="118" x2="185" y2="80" marker-end="url(#ah)"/><text class="t-xs" x="150" y="134">send_base</text><line class="ln" x1="389" y1="118" x2="389" y2="80" marker-end="url(#ah)"/><text class="t-xs" x="355" y="134">nextseqnum</text>';
    return s + '</svg>';
  })();

  var rcvBufSVG = '<svg class="d" viewBox="0 0 640 140" role="img" aria-label="Receive buffer and rwnd">' + CN.defs +
    '<text class="t-b" x="20" y="22">RcvBuffer (receiver side)</text>' +
    '<rect class="box-r" x="20" y="34" width="330" height="46"/><text class="t-sm" text-anchor="middle" x="185" y="62">buffered, unread TCP data</text>' +
    '<rect class="box-g" x="350" y="34" width="270" height="46"/><text class="t-sm t-b" text-anchor="middle" x="485" y="62">free space = rwnd</text>' +
    '<line class="ln" x1="80" y1="110" x2="80" y2="82" marker-end="url(#ah)"/><text class="t-xs" x="20" y="126">app reads slowly → red grows → rwnd shrinks</text>' +
    '<line class="ln-green" x1="620" y1="110" x2="440" y2="110" marker-end="url(#ahg)"/><text class="t-xs t-green" x="450" y="128">advertised to sender in every ACK</text></svg>';

  var cwndTrace = (function () {
    var reno = [[1, 1], [2, 2], [3, 4], [4, 8], [5, 16], [6, 17], [7, 18], [8, 19], [9, 9], [10, 10], [11, 11], [12, 12], [13, 13], [14, 14], [15, 15], [16, 16]];
    var tahoe = [[8, 19], [9, 1], [10, 2], [11, 4], [12, 8], [13, 9], [14, 10], [15, 11], [16, 12]];
    return CN.plot({ w: 660, h: 290, xMax: 17, yMax: 22, xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], yTicks: [0, 4, 8, 12, 16, 20], xLabel: 'transmission round (RTT)', yLabel: 'cwnd (MSS)', label: 'cwnd trace',
      series: [{ pts: tahoe, cls: 'ln-red', dots: true, dotCls: 'fill-red' }, { pts: reno, cls: 'ln-blue', dots: true, labels: true }],
      hlines: [{ y: 16, text: 'ssthresh = 16' }, { y: 9, text: 'new ssthresh = 9' }],
      vlines: [{ x: 8, cls: 'ln-red', text: '3 dup ACKs', tcls: 't-red' }],
      notes: [{ x: 1.2, y: 12, text: 'slow start ×2', cls: 't-blue' }, { x: 5.4, y: 21, text: 'CA +1/RTT', cls: 't-blue' }, { x: 11.5, y: 18, text: 'Reno: cwnd = ssthresh', cls: 't-blue' }, { x: 11.5, y: 3.5, text: 'Tahoe: cwnd = 1', cls: 't-red' }] });
  })();

  var aimdPlot = (function () {
    var pts = [], w = 12;
    for (var r = 0; r <= 40; r++) { pts.push([r, w]); if (r % 12 === 11) { w = w / 2; pts.push([r, w]); } else w = w + 1; }
    return CN.plot({ w: 640, h: 210, xMax: 41, yMax: 26, xTicks: [0, 10, 20, 30, 40], yTicks: [0, 12, 24], xLabel: 'time (RTTs)', yLabel: 'cwnd', label: 'AIMD sawtooth',
      series: [{ pts: pts, cls: 'ln-blue' }], notes: [{ x: 3, y: 23, text: 'additive increase: +1 MSS per RTT' }, { x: 13, y: 4, text: 'multiplicative decrease: halve on loss', cls: 't-red' }] });
  })();

  var ccPlot = (function () {
    var s1 = [], s3 = [];
    for (var x = 0; x <= 1.0001; x += 0.05) s1.push([x, Math.min(x, 0.5)]);
    for (var y = 0; y <= 1.0001; y += 0.05) s3.push([y, y < 0.35 ? y : Math.max(0, 0.35 - (y - 0.35) * 0.55)]);
    return CN.plot({ w: 620, h: 230, xMax: 1.05, yMax: 0.62, xTicks: [0, 0.5, 1], yTicks: [0, 0.25, 0.5], xLabel: 'offered load per sender (fraction of R)', yLabel: 'throughput', label: 'Costs of congestion',
      series: [{ pts: s1, cls: 'ln-blue' }, { pts: s3, cls: 'ln-red' }], hlines: [{ y: 0.5, text: 'R/2' }],
      notes: [{ x: 0.52, y: 0.55, text: 'scenario 1: saturates at R/2', cls: 't-blue' }, { x: 0.55, y: 0.12, text: 'scenario 3: collapse', cls: 't-red' }] });
  })();

  var holSVG = '<svg class="d" viewBox="0 0 640 190" role="img" aria-label="Head-of-line blocking">' + CN.defs +
    '<rect class="box-grey" x="250" y="20" width="140" height="150" rx="8"/><text class="t-sm t-b" text-anchor="middle" x="320" y="98">switch fabric</text>' +
    '<text class="t-sm" x="10" y="52">input 1</text><rect class="box" x="70" y="35" width="160" height="28"/><rect class="box-r" x="196" y="38" width="30" height="22"/><rect class="box-b" x="162" y="38" width="30" height="22"/>' +
    '<text class="t-sm" x="10" y="132">input 2</text><rect class="box" x="70" y="115" width="160" height="28"/><rect class="box-r" x="196" y="118" width="30" height="22"/>' +
    '<line class="ln-red" x1="228" y1="49" x2="410" y2="62" marker-end="url(#ahr)"/><line class="ln-dash" x1="228" y1="129" x2="410" y2="66"/>' +
    '<text class="t-sm" x="420" y="66">output A (both red want it)</text><text class="t-sm" x="420" y="146">output B (idle)</text>' +
    '<text class="t-xs t-blue" x="70" y="88">blue wants idle output B but waits behind red</text></svg>';

  var dijkstraSVG = (function () {
    var N = { u: [60, 130], v: [200, 45], x: [200, 215], w: [360, 45], y: [360, 215], z: [500, 130] };
    var E = [['u', 'v', 2, 1], ['u', 'x', 1, 1], ['u', 'w', 5, 0], ['v', 'x', 2, 0], ['v', 'w', 3, 0], ['x', 'w', 3, 0], ['x', 'y', 1, 1], ['w', 'y', 1, 1], ['w', 'z', 5, 0], ['y', 'z', 2, 1]];
    var D = { u: '0', v: '2', x: '1', y: '2', w: '3', z: '4' };
    var s = '<svg class="d" viewBox="0 0 560 260" role="img" aria-label="Dijkstra example graph">';
    E.forEach(function (e) {
      var a = N[e[0]], c = N[e[1]], mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2;
      s += '<line class="' + (e[3] ? 'ln-blue' : 'ln-thin') + '" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + c[0] + '" y2="' + c[1] + '"' + (e[3] ? ' stroke-width="3.5"' : '') + '/>';
      s += '<rect x="' + (mx - 9) + '" y="' + (my - 9) + '" width="18" height="18" rx="9" fill="#fff" stroke="#c9c2b4"/><text class="t-sm t-b" text-anchor="middle" x="' + mx + '" y="' + (my + 4) + '">' + e[2] + '</text>';
    });
    Object.keys(N).forEach(function (k) { var p = N[k]; s += '<circle class="router" cx="' + p[0] + '" cy="' + p[1] + '" r="17"/><text class="t-b" text-anchor="middle" x="' + p[0] + '" y="' + (p[1] + 5) + '">' + k + '</text><text class="t-xs t-blue t-b" text-anchor="middle" x="' + p[0] + '" y="' + (p[1] + (p[1] < 130 ? -24 : 34)) + '">D=' + D[k] + '</text>'; });
    return s + '</svg>';
  })();

  var bfSVG = '<svg class="d" viewBox="0 0 420 170" role="img" aria-label="Bellman-Ford example">' +
    '<line class="ln" x1="70" y1="120" x2="210" y2="35"/><line class="ln" x1="210" y1="35" x2="350" y2="120"/><line class="ln" x1="70" y1="120" x2="350" y2="120"/>' +
    '<text class="t-b" x="125" y="70">2</text><text class="t-b" x="285" y="70">1</text><text class="t-b" x="205" y="140">7</text>' +
    '<circle class="router" cx="70" cy="120" r="17"/><text class="t-b" text-anchor="middle" x="70" y="125">x</text>' +
    '<circle class="router" cx="210" cy="35" r="17"/><text class="t-b" text-anchor="middle" x="210" y="40">y</text>' +
    '<circle class="router" cx="350" cy="120" r="17"/><text class="t-b" text-anchor="middle" x="350" y="125">z</text>' +
    '<text class="t-sm t-blue" x="10" y="162">Dx(z) = min{2 + 1, 7 + 0} = 3 via y</text></svg>';

  var cidrHTML = '<div class="hdr"><div class="frame-strip">' +
    '<div class="f-key" style="flex:8">11001000<small>200</small></div><div class="f-key" style="flex:8">00010111<small>23</small></div><div class="f-key" style="flex:7">0001000<small>16 (7 bits)</small></div><div style="flex:1">0<small>·</small></div><div style="flex:8">00000000<small>0</small></div></div>' +
    '<div class="frame-strip" style="font-size:12px;color:#6b655b"><div style="flex:23;border:0;background:none">subnet part — 23 bits</div><div style="flex:9;border:0;background:none">host part — 9 bits</div></div></div>';

  /* ================= Topics (GfG-style) ================= */
  var h = function (s) { return '<h2>' + s + '</h2>'; }, p = function (s) { return '<p>' + s + '</p>'; };
  var ol = function (a) { return '<ol class="steps">' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>'; };
  var ul = function (a) { return '<ul>' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; };

  var muxSVG = '<svg class="d" viewBox="0 0 680 270" role="img" aria-label="Multiplexing at the sender and demultiplexing at the receiver">' + CN.defs +
    '<text class="t-b" text-anchor="middle" x="150" y="20">Sender host — multiplexing</text><text class="t-b" text-anchor="middle" x="530" y="20">Receiver host — demultiplexing</text>' +
    '<rect class="box-b" x="40" y="36" width="90" height="32" rx="4"/><text class="t-sm" text-anchor="middle" x="85" y="57">P1 (port 5001)</text>' +
    '<rect class="box-b" x="170" y="36" width="90" height="32" rx="4"/><text class="t-sm" text-anchor="middle" x="215" y="57">P2 (port 5002)</text>' +
    '<rect class="box-g" x="40" y="110" width="220" height="40" rx="4"/><text class="t-sm t-b" text-anchor="middle" x="150" y="135">Transport: add ports → segments</text>' +
    '<rect class="box-v" x="40" y="190" width="220" height="36" rx="4"/><text class="t-sm" text-anchor="middle" x="150" y="213">Network (IP)</text>' +
    '<line class="ln" x1="85" y1="68" x2="120" y2="108" marker-end="url(#ah)"/><line class="ln" x1="215" y1="68" x2="180" y2="108" marker-end="url(#ah)"/><line class="ln" x1="150" y1="150" x2="150" y2="188" marker-end="url(#ah)"/>' +
    '<line class="ln-blue" x1="260" y1="208" x2="420" y2="208" marker-end="url(#ahb)"/><text class="t-xs t-blue" text-anchor="middle" x="340" y="200">network</text>' +
    '<rect class="box-v" x="420" y="190" width="220" height="36" rx="4"/><text class="t-sm" text-anchor="middle" x="530" y="213">Network (IP)</text>' +
    '<rect class="box-g" x="420" y="110" width="220" height="40" rx="4"/><text class="t-sm t-b" text-anchor="middle" x="530" y="135">Transport: read dst port</text>' +
    '<rect class="box-b" x="420" y="36" width="90" height="32" rx="4"/><text class="t-sm" text-anchor="middle" x="465" y="57">P3 (port 80)</text>' +
    '<rect class="box-b" x="550" y="36" width="90" height="32" rx="4"/><text class="t-sm" text-anchor="middle" x="595" y="57">P4 (port 53)</text>' +
    '<line class="ln" x1="530" y1="188" x2="530" y2="152" marker-end="url(#ah)"/><line class="ln" x1="500" y1="110" x2="470" y2="70" marker-end="url(#ah)"/><line class="ln" x1="560" y1="110" x2="590" y2="70" marker-end="url(#ah)"/>' +
    '<text class="t-xs t-mut" x="40" y="252">Many sockets → one network connection</text><text class="t-xs t-mut" x="420" y="252">One network connection → correct socket</text></svg>';

  var demuxCmpSVG = '<svg class="d" viewBox="0 0 680 210" role="img" aria-label="UDP versus TCP demultiplexing">' + CN.defs +
    '<text class="t-b" x="20" y="20">UDP: one socket per (dst IP, dst port)</text>' +
    '<rect class="host" x="20" y="40" width="110" height="30" rx="4"/><text class="t-sm" text-anchor="middle" x="75" y="60">Client A</text>' +
    '<rect class="host" x="20" y="110" width="110" height="30" rx="4"/><text class="t-sm" text-anchor="middle" x="75" y="130">Client B</text>' +
    '<rect class="box-g" x="220" y="70" width="100" height="44" rx="6"/><text class="t-sm t-b" text-anchor="middle" x="270" y="92">1 socket</text><text class="t-xs" text-anchor="middle" x="270" y="106">port 6428</text>' +
    '<line class="ln" x1="130" y1="55" x2="218" y2="85" marker-end="url(#ah)"/><line class="ln" x1="130" y1="125" x2="218" y2="100" marker-end="url(#ah)"/>' +
    '<text class="t-b" x="370" y="20">TCP: one socket per 4-tuple</text>' +
    '<rect class="host" x="370" y="40" width="110" height="30" rx="4"/><text class="t-sm" text-anchor="middle" x="425" y="60">Client A</text>' +
    '<rect class="host" x="370" y="110" width="110" height="30" rx="4"/><text class="t-sm" text-anchor="middle" x="425" y="130">Client B</text>' +
    '<rect class="box-g" x="560" y="35" width="100" height="40" rx="6"/><text class="t-sm t-b" text-anchor="middle" x="610" y="60">socket A</text>' +
    '<rect class="box-g" x="560" y="105" width="100" height="40" rx="6"/><text class="t-sm t-b" text-anchor="middle" x="610" y="130">socket B</text>' +
    '<line class="ln" x1="480" y1="55" x2="558" y2="55" marker-end="url(#ah)"/><line class="ln" x1="480" y1="125" x2="558" y2="125" marker-end="url(#ah)"/>' +
    '<text class="t-xs t-mut" x="560" y="165">both to server port 80</text>' +
    '<text class="t-xs t-mut" x="20" y="195">Different senders share one UDP socket; each TCP connection gets its own socket.</text></svg>';

  CN.add({
    id: 'u2-overview', unit: '2', group: 'Overview', kicker: 'UNIT 2', title: 'Unit 2 overview — transport & network layers',
    src: ['Approved CDP_23CSE302 CN.pdf', 'CN_TransportLayer_Intro_UDP_RDT.pdf', 'Network_Layer_Lecture.pdf'],
    left: p('Unit 2 covers two layers. The <b>transport layer</b> delivers data between processes (UDP, reliable data transfer, TCP, congestion control). The <b>network layer</b> moves datagrams between hosts and decides their route (IP addressing, routers, routing algorithms).') +
      mmd('Unit 2 roadmap', `flowchart LR
  M["Mux/demux"] --> U["UDP"] --> R["Reliable transfer"] --> T["TCP"] --> C["Congestion control"]
  F["Forwarding"] --> RT["Router"] --> IP["IP addressing"] --> RA["Routing"] --> BM["Multicast"]`, 'Top: transport layer. Bottom: network layer.') +
      h('Key formulas') +
      t(['Quantity', 'Formula'], [
        ['Stop-and-wait utilisation', '<code>U = (L/R) / (RTT + L/R)</code>'],
        ['Window for full utilisation', '<code>N = (RTT + L/R) / (L/R)</code>'],
        ['Max window (k-bit seq #)', 'GBN <code>2ᵏ − 1</code>, SR <code>2ᵏ / 2</code>'],
        ['RTT estimate', '<code>EstRTT = 0.875·EstRTT + 0.125·SampleRTT</code>'],
        ['Deviation', '<code>DevRTT = 0.75·DevRTT + 0.25·|Sample − Est|</code>'],
        ['Timeout', '<code>EstRTT + 4·DevRTT</code>'],
        ['TCP send window', '<code>min(cwnd, rwnd)</code>'],
        ['Fragment offset', '<code>byte position / 8</code>']
      ], null, 'compact')
  });

  CN.add({
    id: 'u2-services', unit: '2', group: 'Transport layer', kicker: '3.1', title: 'Transport-layer services',
    src: ['CN_TransportLayer_Intro_UDP_RDT.pdf', 'Transport Layer Services- Multiplexing and demultiplexing.pptx'],
    left: h('What is the transport layer?') +
      p('The <b>transport layer</b> provides <b>logical communication between processes</b> running on different hosts. To the application, it looks as if the two processes are directly connected. Transport protocols run only in end systems, not in routers.') +
      mmd('Logical vs physical path', `flowchart LR
  PA["Process A"] -. "logical connection" .-> PB["Process B"]
  PA --> R1(("R")) --> R2(("R")) --> PB`, '') +
      h('How it works') +
      ol(['The sender’s transport layer breaks the application message into chunks and adds a header, forming <b>segments</b>.', 'Each segment is passed to the network layer and sent inside an IP datagram.', 'The receiver’s transport layer reassembles the segments and delivers the data to the correct process.']) +
      h('Transport vs network layer') +
      t(['Basis', 'Transport layer', 'Network layer'], [['Communication', 'Process to process', 'Host to host'], ['Runs on', 'End systems only', 'Hosts and routers'], ['Protocols', 'TCP, UDP', 'IP'], ['Service', 'Can add reliability', 'Best effort']], null, 'compact') +
      b('ex', '<p>Houses = hosts, children = processes, letters = messages. The postal service (network layer) delivers to the house; a family member (transport layer) hands each letter to the right child.</p>', 'Analogy'),
    right: h('Services of TCP and UDP') +
      t(['Service', 'UDP', 'TCP'], [
        ['Process-to-process delivery (ports)', 'Yes', 'Yes'],
        ['Error detection (checksum)', 'Yes', 'Yes'],
        ['Connection set-up', 'No', 'Yes (3-way handshake)'],
        ['Reliable, in-order delivery', 'No', 'Yes'],
        ['Flow control', 'No', 'Yes'],
        ['Congestion control', 'No', 'Yes']
      ], 'Every transport protocol provides multiplexing/demultiplexing; TCP adds reliability and control.', 'compact') +
      p('IP gives only <b>best-effort</b> delivery: no guarantee of delivery, order or integrity. TCP builds a <b>reliable</b> service on top of it using sequence numbers, acknowledgements and timers.') +
      h('Choosing TCP or UDP') +
      p('For a real-time video call, <b>UDP</b> is preferred: TCP’s retransmissions and in-order delivery add delay, and late audio/video is useless. The application adds sequence numbers, hides lost frames and adapts its bit rate instead.')
  });

  CN.add({
    id: 'u2-mux', unit: '2', group: 'Transport layer', kicker: '3.2', title: 'Multiplexing & demultiplexing',
    src: ['Transport Layer Services- Multiplexing and demultiplexing.pptx', 'CN_TransportLayer_Intro_UDP_RDT.pdf'],
    left: h('What is multiplexing and demultiplexing?') +
      p('A host runs many processes, but they share one network connection. <b>Multiplexing</b> (at the sender) gathers data from different sockets, adds a header with port numbers and passes the segments to the network layer. <b>Demultiplexing</b> (at the receiver) uses the port numbers in each segment to deliver it to the correct socket.') +
      fig('Multiplexing and demultiplexing', muxSVG, 'Ports identify the process; the IP address identifies the host.', { wide: true }) +
      h('Port numbers') +
      p('A port number is a 16-bit number (0–65535) carried in every segment as the <b>source port</b> and <b>destination port</b>.') +
      t(['Range', 'Type', 'Examples'], [['0–1023', 'Well-known ports', 'HTTP 80, FTP 21, SMTP 25, DNS 53'], ['1024–49151', 'Registered ports', 'MySQL 3306, PostgreSQL 5432'], ['49152–65535', 'Dynamic / private ports', 'Temporary client ports']], null, 'compact') +
      b('flag', '<p><b>D1:</b> The Transport Intro PDF describes 1024–65535 as dynamically assigned client ports; the Mux PPTX splits them into registered and dynamic ranges as above.</p>'),
    right: h('UDP (connectionless) demultiplexing') +
      p('A UDP socket is identified by a <b>2-tuple: (destination IP, destination port)</b>. Segments from different senders with the same destination IP and port go to the <b>same socket</b>. The source port serves as the return address. Eg: every datagram sent to port 6428 reaches <code>DatagramSocket(6428)</code>.') +
      h('TCP (connection-oriented) demultiplexing') +
      p('A TCP socket is identified by a <b>4-tuple: (source IP, source port, destination IP, destination port)</b>. A server’s welcoming socket creates a new connection socket for each client, so segments from different clients go to <b>different sockets</b>, even if they use the same destination port.') +
      fig('UDP vs TCP demultiplexing', demuxCmpSVG, '', { wide: true }) +
      b('ex', '<p>Two browser tabs connect to the same server port 80 from source ports 50432 and 50433. The 4-tuples differ, so the server keeps two separate TCP connections.</p>') +
      t(['Basis', 'UDP demux', 'TCP demux'], [['Socket identified by', '(dst IP, dst port)', '(src IP, src port, dst IP, dst port)'], ['Different senders', 'Same socket', 'Different sockets'], ['Server sockets', 'One', 'One per connection']], null, 'compact')
  });

  CN.add({
    id: 'u2-udp', unit: '2', group: 'Transport layer', kicker: '3.3', title: 'UDP — connectionless transport',
    src: ['CN_TransportLayer_Intro_UDP_RDT.pdf', 'Connectionless Transport - UDP, Principles of Reliable Data Transfer.pptx'],
    left: h('What is UDP?') +
      p('<b>UDP (User Datagram Protocol, RFC 768)</b> is a simple, connectionless transport protocol. It adds only multiplexing/demultiplexing and error checking to IP. There is no handshake, no acknowledgement and no retransmission, so segments may be lost or arrive out of order.') +
      h('UDP segment structure') +
      CN.hdr('UDP header (8 bytes)', [[['Source port', 16, 'f-key', '16 bits'], ['Destination port', 16, 'f-key', '16 bits']], [['Length', 16, '', '16 bits'], ['Checksum', 16, 'f-alt', '16 bits']], [['Application data', 32, 'f-var']]], '') +
      ul(['<b>Source / destination port</b> — used for demultiplexing.', '<b>Length</b> — size of the segment (header + data) in bytes.', '<b>Checksum</b> — used to detect bit errors.']) +
      h('Why use UDP?') +
      ul(['No connection set-up delay.', 'No connection state, so a server can handle more clients.', 'Small 8-byte header (TCP needs 20 bytes).', 'The application controls exactly when data is sent.']) +
      p('Eg: DNS, live streaming, online games and VoIP.'),
    right: h('How the UDP checksum is computed') +
      ol(['Divide the segment into 16-bit words.', 'Add the words using 1’s complement addition; any carry out of the leftmost bit is added back (wrap-around).', 'Take the 1’s complement (flip every bit) of the sum — this is the checksum.', 'The receiver adds all words including the checksum; if the result is all 1s, no error is detected.']) +
      calc({ title: 'Checksum example', src: 'Transport Intro PDF', given: ['Word 1 = 0110011001100000', 'Word 2 = 0101010101010101', 'Word 3 = 1000111100001100'],
        steps: ['Word 1 + Word 2 = 1011101110110101', '+ Word 3 = 1 0100101011000001 (carry out)', 'Wrap the carry: 0100101011000010', 'Flip all bits: 1011010100111101'], answer: 'Checksum = 1011010100111101' }) +
      P(['fast, low overhead', 'no connection state', 'good for real-time apps'], ['no reliability or ordering', 'no congestion control', 'only detects errors, cannot fix them']) +
      p('<b>QUIC</b> (used by HTTP/3) adds reliability on top of UDP at the application layer.')
  });

  CN.add({
    id: 'u2-rdt1', unit: '2', group: 'Transport layer', kicker: '3.4', title: 'Reliable data transfer — rdt1.0 and rdt2.0',
    src: ['CN_TransportLayer_Intro_UDP_RDT.pdf', 'Connectionless Transport - UDP, Principles of Reliable Data Transfer.pptx', 'Reliable_Data_Transfer_Flipped_Classroom.docx'],
    left: h('What is reliable data transfer?') +
      p('<b>Reliable data transfer (RDT)</b> means delivering data with no errors, no loss, no duplicates and in the correct order, even though the underlying channel is unreliable. It is achieved using <b>checksums, acknowledgements, sequence numbers, timers and retransmission</b>.') +
      p('The protocol is built step by step, each version handling one more problem of the channel:') +
      t(['Version', 'Channel problem', 'Solution added'], [
        ['rdt1.0', 'None (perfect channel)', 'Nothing needed'],
        ['rdt2.0', 'Bit errors', 'Checksum, ACK/NAK, retransmission'],
        ['rdt2.1', 'Corrupted ACK/NAK', 'Sequence numbers (0/1)'],
        ['rdt2.2', 'Same as 2.1', 'Duplicate ACK instead of NAK'],
        ['rdt3.0', 'Packet loss', 'Timer and retransmission']
      ], null, 'compact') +
      b('ex', '<p>Posting pages to a friend over unreliable mail: you number the pages (sequence numbers), ask for a reply (ACK), resend if no reply comes (timeout), and the friend checks that pages are not damaged (checksum).</p>', 'Analogy'),
    right: h('rdt1.0 — perfect channel') +
      p('The channel never corrupts or loses data. The sender simply sends each packet and the receiver delivers it. No ACKs or timers are needed.') +
      h('rdt2.0 — channel with bit errors') +
      p('Bits may be flipped. The receiver checks the <b>checksum</b> and replies with an <b>ACK</b> (packet correct) or a <b>NAK</b> (packet corrupted). On a NAK the sender retransmits. Because the sender waits for the reply before sending the next packet, rdt2.0 is a <b>stop-and-wait</b> protocol.') +
      mmd('rdt2.0 sender', `stateDiagram-v2
  direction LR
  state "Wait for data" as W1
  state "Wait for ACK/NAK" as W2
  W1 --> W2: send packet
  W2 --> W2: NAK / resend
  W2 --> W1: ACK`, '') +
      b('mistake', '<p><b>Flaw of rdt2.0:</b> the ACK or NAK itself may be corrupted. The sender cannot tell what the receiver got, and resending blindly may create duplicate packets. rdt2.1 fixes this with sequence numbers.</p>', 'Important')
  });

  CN.add({
    id: 'u2-rdt2', unit: '2', group: 'Transport layer', kicker: '3.4', title: 'rdt2.1, rdt2.2 and rdt3.0',
    src: ['CN_TransportLayer_Intro_UDP_RDT.pdf', 'Connectionless Transport - UDP, Principles of Reliable Data Transfer.pptx', 'Reliable_Data_Transfer_Flipped_Classroom.docx'],
    left: h('rdt2.1 — sequence numbers') +
      p('Each packet carries a 1-bit <b>sequence number</b> (0 or 1). If the ACK/NAK is garbled, the sender resends the packet with the same number. The receiver checks the number: a new number means new data (deliver and ACK); a repeated number means a duplicate (discard and re-ACK). One bit is enough because only one packet is in flight at a time.') +
      h('rdt2.2 — NAK-free') +
      p('Instead of a NAK, the receiver sends an ACK for the <b>last correctly received</b> packet, including its sequence number. When the sender receives a <b>duplicate ACK</b>, it knows the current packet was not received and resends it. TCP uses this idea.') +
      h('rdt3.0 — channel with errors and loss') +
      p('Packets or ACKs may now be lost completely, so the sender starts a <b>countdown timer</b> each time it sends a packet. If the ACK does not arrive before the timer expires, it retransmits. Since sequence numbers alternate between 0 and 1, rdt3.0 is called the <b>alternating-bit protocol</b>.'),
    right: mmd('rdt3.0: lost packet', `sequenceDiagram
  participant S as Sender
  participant R as Receiver
  S->>R: pkt0
  R-->>S: ACK0
  S-xR: pkt1 (lost)
  Note over S: timeout
  S->>R: resend pkt1
  R-->>S: ACK1`, '') +
      mmd('rdt3.0: lost ACK', `sequenceDiagram
  participant S as Sender
  participant R as Receiver
  S->>R: pkt1
  R--xS: ACK1 (lost)
  Note over S: timeout
  S->>R: resend pkt1
  Note over R: duplicate, discard
  R-->>S: ACK1`, 'The receiver uses the sequence number to detect the duplicate.') +
      t(['Protocol', 'Handles bit errors', 'Handles loss', 'Uses timer'], [['rdt1.0', 'No', 'No', 'No'], ['rdt2.0', 'Yes', 'No', 'No'], ['rdt2.1 / 2.2', 'Yes', 'No', 'No'], ['rdt3.0', 'Yes', 'Yes', 'Yes']], null, 'compact center') +
      b('take', '<p>Sequence numbers detect <b>duplicates</b>; timers recover from <b>loss</b>. A timeout does not always mean loss — the ACK may just be late.</p>')
  });

  CN.add({
    id: 'u2-pipeline', unit: '2', group: 'Transport layer', kicker: '3.4', title: 'Stop-and-wait performance & pipelining',
    src: ['CN_TransportLayer_Intro_UDP_RDT.pdf', 'Reliable_Data_Transfer_Flipped_Classroom.docx', 'CN Numerical questions.docx'],
    left: h('Why is stop-and-wait slow?') +
      p('In stop-and-wait, the sender sends one packet and then waits a full round-trip time for the ACK. On a fast link with a long RTT, the link is idle most of the time. <b>Sender utilisation</b> is the fraction of time the sender is actually sending:') +
      F('U = (L/R) / (RTT + L/R)') +
      fig('Stop-and-wait vs pipelining', swVsPipeSVG, '', { wide: true }) +
      h('What is pipelining?') +
      p('<b>Pipelining</b> lets the sender transmit several packets before waiting for ACKs. This keeps the link busy. It needs a larger range of sequence numbers and buffering at the sender and/or receiver. The two pipelined protocols are <b>Go-Back-N</b> and <b>Selective Repeat</b>.') +
      F('N = (RTT + L/R) / (L/R)', 'Window size needed for full utilisation'),
    right: h('Worked examples') +
      calc({ title: '1 Gbps link, RTT 30 ms', src: 'Transport Intro PDF', given: ['L = 8000 bits, R = 1 Gbps, RTT = 30 ms'], steps: ['L/R = 8000 / 10⁹ = 0.008 ms', 'U = 0.008 / 30.008 ≈ 0.00027'], answer: 'U ≈ 0.027% (about 267 kbps on a 1 Gbps link)' }) +
      calc({ title: 'Stop-and-wait utilisation', src: 'Numerical sheet Q4', given: ['L = 1000 bits, R = 1 Mbps, RTT = 30 ms'], steps: ['L/R = 1 ms', 'U = 1 / (1 + 30) = 1/31'], answer: 'U ≈ 3.2%' }) +
      calc({ title: 'Window for full utilisation', src: 'Numerical sheet Q5', given: ['Same link'], steps: ['N = (30 + 1) / 1'], answer: 'N = 31 packets' })
  });

  CN.add({
    id: 'u2-gbnsr', unit: '2', group: 'Transport layer', kicker: '3.4', title: 'Go-Back-N vs Selective Repeat',
    src: ['Connectionless Transport - UDP, Principles of Reliable Data Transfer.pptx', 'Reliable_Data_Transfer_Flipped_Classroom.docx'],
    left: h('Sliding window') +
      p('Both protocols let the sender have up to <b>N</b> unacknowledged packets in flight. This range is the <b>window</b>; it slides forward as ACKs arrive.') +
      fig('Sender window', windowSVG, '', { wide: true }) +
      h('What is Go-Back-N (GBN)?') +
      p('In <b>Go-Back-N</b>, the receiver accepts packets only in order and sends <b>cumulative ACKs</b> (ACK n means “all packets up to n received”). Out-of-order packets are discarded. The sender keeps one timer for the oldest unacknowledged packet; on timeout it resends <b>that packet and all later packets</b> in the window.') +
      h('What is Selective Repeat (SR)?') +
      p('In <b>Selective Repeat</b>, the receiver acknowledges each packet <b>individually</b> and buffers out-of-order packets. The sender keeps a timer for each packet and resends <b>only the packet that timed out</b>.'),
    right: mmd('GBN: packet 12 lost (window 6)', `sequenceDiagram
  participant S as Sender
  participant R as Receiver
  S->>R: pkt 10, 11
  S-xR: pkt 12 (lost)
  S->>R: pkt 13, 14, 15
  Note over R: 13-15 discarded
  Note over S: timeout for 12
  S->>R: resend 12, 13, 14, 15`, 'GBN resends 4 packets; SR would resend only packet 12.') +
      t(['Basis', 'Go-Back-N', 'Selective Repeat'], [
        ['ACK type', 'Cumulative', 'Individual'],
        ['Out-of-order packets', 'Discarded', 'Buffered'],
        ['On a loss', 'Resend whole window', 'Resend lost packet only'],
        ['Timers', 'One', 'One per packet'],
        ['Receiver', 'Simple', 'Complex'],
        ['Max window (k-bit seq #)', '2ᵏ − 1', '2ᵏ / 2']
      ], 'GBN is simpler; SR wastes less bandwidth on lossy links.', 'compact') +
      p('Eg: with 4-bit sequence numbers, GBN allows a window of 15 and SR a window of 8 (QB TN-3).')
  });

  CN.add({
    id: 'u2-tcp-seg', unit: '2', group: 'TCP', kicker: '3.5', title: 'TCP overview & segment structure',
    src: ['Connection-Oriented Transport, Congestion Control  -  Repaired.pptx'],
    left: h('What is TCP?') +
      p('<b>TCP (Transmission Control Protocol)</b> is a connection-oriented, reliable transport protocol. It delivers a <b>byte stream</b> in order, between exactly two endpoints, in both directions (full duplex), with flow control and congestion control.') +
      h('Features of TCP') +
      ul(['<b>Connection-oriented</b> — a handshake sets up the connection first.', '<b>Reliable, in-order byte stream</b> — every byte is numbered and acknowledged.', '<b>Pipelined</b> — many segments can be in flight.', '<b>Full duplex</b> — data flows both ways.', '<b>Flow and congestion control</b> — protects the receiver and the network.']) +
      h('Sequence and acknowledgement numbers') +
      p('The <b>sequence number</b> is the byte number of the first byte in the segment. The <b>acknowledgement number</b> is the number of the next byte the receiver expects; TCP ACKs are <b>cumulative</b>.'),
    right: CN.hdr('TCP segment structure', [
      [['Source port', 16, 'f-key', '16'], ['Destination port', 16, 'f-key', '16']],
      [['Sequence number', 32, 'f-alt', '32 bits']],
      [['Acknowledgement number', 32, 'f-alt', '32 bits']],
      [['Hdr len', 4, '', '4'], ['Unused', 6, '', ''], ['Flags', 6, 'f-key', 'UAPRSF'], ['Receive window', 16, 'f-alt', '16']],
      [['Checksum', 16, '', '16'], ['Urgent pointer', 16, '', '16']],
      [['Options', 32, 'f-var']],
      [['Data', 32, 'f-var']]], 'Header is 20 bytes without options. Flags: SYN, ACK, FIN, RST, PSH, URG.') +
      mmd('Seq/ACK example (Telnet)', `sequenceDiagram
  participant A as Host A
  participant B as Host B
  A->>B: Seq=42, ACK=79, data C
  B-->>A: Seq=79, ACK=43, data C
  A->>B: Seq=43, ACK=80`, 'Host B acknowledges byte 42 by asking for byte 43.')
  });

  CN.add({
    id: 'u2-tcp-rdt', unit: '2', group: 'TCP', kicker: '3.5', title: 'TCP reliability: RTT, timeout & fast retransmit',
    src: ['Connection-Oriented Transport, Congestion Control  -  Repaired.pptx', 'CN Numerical questions.docx'],
    left: h('How does TCP set its timeout?') +
      p('TCP retransmits a segment if its ACK does not arrive before a timeout. The timeout must be longer than the RTT, but not much longer. Since RTT varies, TCP keeps a smoothed estimate and a measure of its variation:') +
      F('EstimatedRTT = (1 − α)·EstimatedRTT + α·SampleRTT,  α = 0.125') +
      F('DevRTT = (1 − β)·DevRTT + β·|SampleRTT − EstimatedRTT|,  β = 0.25') +
      F('TimeoutInterval = EstimatedRTT + 4·DevRTT') +
      calc({ title: 'RTT estimation', src: 'Numerical sheet Q7', given: ['EstimatedRTT = 100 ms, DevRTT = 20 ms, SampleRTT = 140 ms'],
        steps: ['EstimatedRTT = 0.875 × 100 + 0.125 × 140 = 105 ms', 'DevRTT = 0.75 × 20 + 0.25 × |140 − 105| = 23.75 ms', 'Timeout = 105 + 4 × 23.75 = 200 ms'], answer: '105 ms, 23.75 ms, 200 ms' }) +
      b('supp', '<p><b>Karn’s algorithm</b> (asked in the question bank): RTT samples from retransmitted segments are ignored, and the timeout is doubled after each consecutive timeout.</p>'),
    right: h('How TCP sends reliably') +
      ol(['When data arrives from the application, TCP creates a segment with the next sequence number and starts the timer if it is not running.', 'On a timeout, TCP retransmits the oldest unacknowledged segment and restarts the timer.', 'When an ACK arrives that acknowledges new data, TCP moves its window forward.']) +
      mmd('Lost ACK', `sequenceDiagram
  participant A as Host A
  participant B as Host B
  A->>B: Seq=92, 8 bytes
  B--xA: ACK=100 (lost)
  Note over A: timeout
  A->>B: Seq=92 resent
  B-->>A: ACK=100`, '') +
      h('What is fast retransmit?') +
      p('If the sender receives <b>three duplicate ACKs</b> for the same data, it assumes the next segment was lost and resends it immediately, without waiting for the timeout.')
  });

  CN.add({
    id: 'u2-tcp-conn', unit: '2', group: 'TCP', kicker: '3.5', title: 'TCP connection management',
    src: ['Connection-Oriented Transport, Congestion Control  -  Repaired.pptx'],
    left: h('Three-way handshake') +
      p('Before sending data, TCP sets up a connection with a <b>three-way handshake</b>. Both sides agree to communicate and choose initial sequence numbers.') +
      mmd('Three-way handshake', `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: SYN, seq = x
  S-->>C: SYN + ACK, seq = y, ack = x + 1
  C->>S: ACK, ack = y + 1
  Note over C,S: connection established`, '') +
      ol(['The client sends a <b>SYN</b> segment with its initial sequence number x.', 'The server replies with <b>SYN-ACK</b>, giving its own sequence number y and acknowledging x + 1.', 'The client sends an <b>ACK</b> for y + 1; data may now flow.']),
    right: h('Closing a connection') +
      p('Either side can close. Each direction is closed separately with a <b>FIN</b> segment that the other side acknowledges.') +
      mmd('Connection termination', `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: FIN
  S-->>C: ACK
  S->>C: FIN
  C-->>S: ACK
  Note over C: wait 2 x MSL, then close`, '') +
      ol(['The client sends FIN and enters FIN_WAIT_1.', 'The server ACKs it; the client enters FIN_WAIT_2.', 'The server sends its own FIN.', 'The client ACKs it and waits in TIMED_WAIT (2 × maximum segment lifetime) before closing, in case its last ACK was lost.'])
  });

  CN.add({
    id: 'u2-flow', unit: '2', group: 'TCP', kicker: '3.5', title: 'Flow control vs congestion control',
    src: ['Flow_Control_vs_Congestion_Control (1).pptx', 'Connection-Oriented Transport, Congestion Control  -  Repaired.pptx'],
    left: h('What is flow control?') +
      p('<b>Flow control</b> prevents a fast sender from overflowing a slow receiver’s buffer. The receiver tells the sender how much free buffer space it has, called the <b>receive window (rwnd)</b>, in every segment. The sender keeps its unacknowledged data within rwnd.') +
      fig('Receive buffer and rwnd', rcvBufSVG, '', { wide: true }) +
      p('If rwnd becomes 0, the sender stops and periodically sends small <b>window probe</b> segments until space frees up.') +
      h('What is congestion control?') +
      p('<b>Congestion control</b> prevents many senders together from overloading routers and links. The sender limits itself using a <b>congestion window (cwnd)</b>, which it reduces when it detects loss.'),
    right: h('Flow control vs congestion control') +
      t(['Basis', 'Flow control', 'Congestion control'], [
        ['Protects', 'The receiver’s buffer', 'The network (routers, links)'],
        ['Scope', 'One connection', 'All connections on the path'],
        ['Controlled by', 'Receiver (advertises rwnd)', 'Sender (adjusts cwnd)'],
        ['Signal', 'rwnd value in segments', 'Packet loss or delay'],
        ['Cause', 'Slow receiving application', 'Too much traffic in the network']
      ], 'TCP always sends within min(rwnd, cwnd).', 'compact') +
      h('Example — Amazon Prime Day') +
      p('One customer’s old laptop reads data slowly, so its buffer fills and it advertises a small rwnd: this is <b>flow control</b>, and it affects only that customer. At the same time, millions of users overload backbone routers and packets are dropped: senders reduce cwnd, which is <b>congestion control</b> and affects everyone on that path.')
  });

  CN.add({
    id: 'u2-cc-principles', unit: '2', group: 'TCP', kicker: '3.6', title: 'Principles of congestion control',
    src: ['Connection-Oriented Transport, Congestion Control  -  Repaired.pptx'],
    left: h('What is congestion?') +
      p('<b>Congestion</b> occurs when too many sources send too much data too fast for the network to handle. Its symptoms are <b>long queueing delays</b> and <b>packet loss</b> at routers.') +
      h('Costs of congestion') +
      ul(['Queueing delay becomes very large as the link approaches full capacity.', 'Lost packets must be retransmitted, wasting capacity.', 'Unnecessary retransmissions (premature timeouts) send duplicate copies.', 'A packet dropped late in its path wastes all capacity used earlier; throughput can collapse.']) +
      fig('Costs of congestion', ccPlot, 'Illustrative shape (supplementary).', { wide: true }),
    right: h('Approaches to congestion control') +
      t(['Basis', 'End-to-end', 'Network-assisted'], [['Feedback', 'None from the network', 'Routers send explicit feedback'], ['How congestion is detected', 'Sender infers it from loss or delay', 'Congestion bit or explicit rate'], ['Example', 'TCP', 'ATM ABR']], null, 'compact') +
      p('TCP uses <b>end-to-end</b> congestion control: a timeout or three duplicate ACKs is taken as a sign of congestion.')
  });

  CN.add({
    id: 'u2-tcp-cc', unit: '2', group: 'TCP', kicker: '3.7', title: 'TCP congestion control',
    src: ['Connection-Oriented Transport, Congestion Control  -  Repaired.pptx', 'CN Numerical questions.docx'],
    left: h('How does TCP control congestion?') +
      p('The sender keeps a <b>congestion window (cwnd)</b> that limits how much unacknowledged data it can send; its rate is about cwnd / RTT. TCP increases cwnd while ACKs arrive and decreases it when a loss is detected.') +
      h('Phases of TCP congestion control') +
      ol(['<b>Slow start</b>: cwnd starts at 1 MSS and doubles every RTT (exponential growth) until it reaches the threshold <b>ssthresh</b>.', '<b>Congestion avoidance</b>: cwnd grows by 1 MSS per RTT (linear growth).', '<b>Fast retransmit</b>: on 3 duplicate ACKs, the missing segment is resent immediately.', '<b>Fast recovery</b> (TCP Reno): after 3 duplicate ACKs, ssthresh = cwnd/2 and cwnd is halved; TCP continues in congestion avoidance.', '<b>Timeout</b>: ssthresh = cwnd/2 and cwnd = 1 MSS; TCP restarts slow start.']) +
      t(['Loss signal', 'What it means', 'Action'], [['3 duplicate ACKs', 'Some segments still arrive (mild)', 'Halve cwnd'], ['Timeout', 'Possibly nothing arrives (severe)', 'cwnd = 1 MSS']], null, 'compact') +
      b('flag', '<p><b>D2:</b> The TCP slides say cwnd is halved “+3 MSS” on three duplicate ACKs; the numerical sheet uses cwnd = ssthresh. Both appear in your materials.</p>'),
    right: fig('cwnd over time', cwndTrace, 'Slow start to 16, linear growth to 19, then a loss: Reno halves cwnd, Tahoe drops to 1.', { wide: true }) +
      calc({ title: 'cwnd trace', src: 'Numerical sheet Q6', given: ['cwnd = 1 MSS, ssthresh = 16 MSS'], steps: ['RTT 1–5: 1, 2, 4, 8, 16 (slow start)', 'RTT 6–8: 17, 18, 19 (congestion avoidance)', '3 duplicate ACKs: ssthresh ≈ 9, cwnd = 9'], answer: 'cwnd follows a sawtooth' }) +
      h('AIMD') +
      p('Ignoring slow start, TCP uses <b>Additive Increase, Multiplicative Decrease (AIMD)</b>: +1 MSS per RTT, halve on loss. This produces the TCP <b>sawtooth</b>.') +
      fig('AIMD sawtooth', aimdPlot, '', { wide: true }) +
      p('<b>TCP Tahoe</b> sets cwnd to 1 on any loss; <b>TCP Reno</b> halves it on three duplicate ACKs. <b>TCP CUBIC</b> grows cwnd as a cubic function of time to return quickly to the previous maximum.')
  });

  CN.add({
    id: 'u2-net-intro', unit: '2', group: 'Network layer', kicker: '4.1', title: 'Network layer: forwarding, routing, VC & datagram',
    src: ['Network_Layer_Lecture.pdf', 'Internet Protocol - Routing Algorithms, Internet Routing, Broadcast & Multicast_.pdf'],
    left: h('What is the network layer?') +
      p('The <b>network layer</b> carries segments from the sending host to the receiving host inside <b>datagrams</b>. Unlike the transport layer, it runs on every host and every router.') +
      h('Forwarding vs routing') +
      p('<b>Forwarding</b> is the local action of moving a packet from a router’s input link to the correct output link using the forwarding table. <b>Routing</b> is the network-wide process of computing the paths that fill those tables.') +
      mmd('Routing fills the table; forwarding uses it', `flowchart LR
  RA["Routing algorithm"] --> FT["Forwarding table"]
  P["Packet (header 0111)"] --> FT --> O["Output link 2"]`, '') +
      t(['Basis', 'Forwarding', 'Routing'], [['Scope', 'One router', 'Whole network'], ['Time scale', 'Nanoseconds (hardware)', 'Seconds (software)'], ['Plane', 'Data plane', 'Control plane'], ['Analogy', 'Choosing a lane at one junction', 'Planning the whole trip']], null, 'compact'),
    right: h('Virtual circuit vs datagram networks') +
      p('A <b>virtual circuit (VC) network</b> sets up a path before data flows; packets carry a VC number and every router on the path keeps state for the connection (Eg: ATM, Frame Relay). A <b>datagram network</b> needs no set-up; each packet carries the full destination address and is routed independently (Eg: the Internet).') +
      t(['Basis', 'Virtual circuit', 'Datagram'], [['Set-up', 'Required', 'Not required'], ['Packet carries', 'VC number', 'Destination address'], ['Router state', 'Per connection', 'None'], ['Path', 'Fixed', 'May vary'], ['Router failure', 'Breaks the VC', 'Packets rerouted']], null, 'compact') +
      p('A VC number is local to each link and is changed at every router, using a table like: in-interface 1, VC 12 → out-interface 3, VC 22.')
  });

  CN.add({
    id: 'u2-router', unit: '2', group: 'Network layer', kicker: '4.2', title: 'Inside a router',
    src: ['Network_Layer_Lecture.pdf'],
    left: h('Router architecture') +
      p('A router has four main parts: <b>input ports</b>, a <b>switching fabric</b>, <b>output ports</b> (together the data plane, in hardware) and a <b>routing processor</b> (the control plane, in software).') +
      mmd('Router architecture', `flowchart LR
  I["Input ports"] --> SF["Switching fabric"] --> O["Output ports"]
  RP["Routing processor"] -. "forwarding table" .-> I`, '') +
      t(['Part', 'Function'], [['Input port', 'Receives bits, extracts the datagram, looks up the output port, checks the header and decrements TTL'], ['Switching fabric', 'Moves packets from input ports to output ports'], ['Output port', 'Queues packets and sends them on the outgoing link'], ['Routing processor', 'Runs routing protocols and builds the forwarding table']], null, 'compact'),
    right: h('Types of switching fabric') +
      t(['Fabric', 'How it works', 'Limitation'], [['Memory', 'CPU copies the packet through memory', 'Limited by memory speed'], ['Bus', 'Ports share one bus', 'One packet at a time'], ['Interconnection network (crossbar)', 'Many parallel paths', 'Fastest; used in high-end routers']], null, 'compact') +
      h('Queueing and HOL blocking') +
      p('If packets arrive faster than they can be sent, they queue at the output port, and a full buffer causes loss. <b>Head-of-line (HOL) blocking</b> occurs at an input queue when the packet at the front waits for a busy output and blocks packets behind it, even if their outputs are free.') +
      fig('Head-of-line blocking', holSVG, '', { wide: true })
  });

  CN.add({
    id: 'u2-ip', unit: '2', group: 'Network layer', kicker: '4.3', title: 'IPv4: datagram, addressing, LPM & fragmentation',
    src: ['Network_Layer_Lecture.pdf'],
    left: h('IPv4 datagram format') +
      CN.hdr('IPv4 header', [
        [['Ver', 4, '', '4'], ['Hdr len', 4, '', '4'], ['Type of service', 8, '', '8'], ['Total length', 16, '', '16']],
        [['Identifier', 16, 'f-alt', '16'], ['Flags', 3, 'f-alt', '3'], ['Fragment offset', 13, 'f-alt', '13']],
        [['TTL', 8, 'f-key', '8'], ['Protocol', 8, 'f-key', '8'], ['Header checksum', 16, '', '16']],
        [['Source IP address', 32, 'f-key']], [['Destination IP address', 32, 'f-key']], [['Options', 32, 'f-var']], [['Data', 32, 'f-var']]], '') +
      ul(['<b>TTL</b> — reduced by 1 at each router; stops packets from looping forever.', '<b>Protocol</b> — tells which transport protocol gets the data (TCP = 6, UDP = 17).', '<b>Identifier, flags, offset</b> — used for fragmentation.', 'The header is 20 bytes without options.']) +
      h('IPv4 addressing and CIDR') +
      p('An IPv4 address is 32 bits, written in dotted decimal (192.168.1.1). It has a <b>network part</b> and a <b>host part</b>. In <b>CIDR</b> notation, a.b.c.d/x, x is the number of network bits. Eg: 200.23.16.0/23 has a 23-bit network part.') +
      fig('CIDR example', cidrHTML, '') +
      p('<b>Route aggregation</b>: an ISP can advertise one prefix (200.23.16.0/20) for all its customers’ smaller blocks.'),
    right: h('Longest prefix matching') +
      p('A forwarding table stores address ranges (prefixes). When several entries match a destination, the router uses the <b>longest (most specific)</b> matching prefix.') +
      t(['Prefix', 'Interface'], [['11001000 00010111 00010***', '0'], ['11001000 00010111 00011000', '1'], ['11001000 00010111 00011***', '2'], ['Otherwise', '3']], null, 'compact') +
      calc({ title: 'LPM example', src: 'Network_Layer_Lecture.pdf', given: ['Destination: 11001000 00010111 00011000 10101010'], steps: ['Entry 0: does not match', 'Entry 1: matches 24 bits', 'Entry 2: matches 21 bits'], answer: 'Longest match is 24 bits → interface 1' }) +
      h('IP fragmentation') +
      p('Each link has a maximum frame size, the <b>MTU</b> (Eg: Ethernet 1500 bytes). A larger datagram is split into fragments; they are <b>reassembled only at the destination</b>. All fragments share the same identifier, MF = 1 on all but the last, and the offset is given in units of 8 bytes.') +
      calc({ title: 'Fragmenting a 4000-byte datagram (MTU 1500)', src: 'Network_Layer_Lecture.pdf', given: ['20-byte header + 3980 bytes of data', 'Each fragment carries up to 1480 data bytes'],
        steps: ['Fragment 1: 1480 data bytes, offset 0, MF = 1', 'Fragment 2: 1480 data bytes, offset 185, MF = 1', 'Fragment 3: 1020 data bytes, offset 370, MF = 0'], answer: '3 fragments' })
  });

  CN.add({
    id: 'u2-routing-algo', unit: '2', group: 'Network layer', kicker: '4.4', title: 'Routing algorithms — Dijkstra & Bellman-Ford',
    src: ['Internet Protocol - Routing Algorithms, Internet Routing, Broadcast & Multicast_.pdf'],
    left: h('What is a routing algorithm?') +
      p('A <b>routing algorithm</b> finds the <b>least-cost path</b> between routers. The network is modelled as a graph G = (N, E), where N is the set of routers, E is the set of links, and each link has a cost.') +
      t(['Basis', 'Link-state (LS)', 'Distance-vector (DV)'], [['Information', 'Every router knows the full topology', 'Each router knows only its neighbours'], ['Algorithm', 'Dijkstra', 'Bellman-Ford'], ['Messages', 'Broadcast to all routers', 'Exchanged with neighbours'], ['Problem', 'Oscillations possible', 'Count-to-infinity possible'], ['Used in', 'OSPF', 'RIP']], null, 'compact') +
      h('Dijkstra’s algorithm (link-state)') +
      p('Dijkstra’s algorithm finds the shortest path from one source to all other nodes. In each step it adds the nearest unvisited node to the finished set and updates the costs of its neighbours.') +
      fig('Example graph (source u)', dijkstraSVG, 'Blue edges form the shortest-path tree.', { wide: true }),
    right: t(['Step', 'Done set', 'v', 'w', 'x', 'y', 'z'], [
      ['0', 'u', '2', '5', '1', '∞', '∞'], ['1', 'ux', '2', '4', '—', '2', '∞'], ['2', 'uxy', '2', '3', '—', '—', '4'], ['3', 'uxyv', '—', '3', '—', '—', '4'], ['4', 'uxyvw', '—', '—', '—', '—', '4'], ['5', 'uxyvwz', '—', '—', '—', '—', '—']
    ], 'Final costs from u: v = 2, x = 1, y = 2, w = 3, z = 4.', 'compact center') +
      b('flag', '<p><b>D6:</b> the slide’s edge list says x–y = 2, but its own trace needs x–y = 1 (as in Kurose). The figure uses 1.</p>') +
      h('Bellman-Ford equation (distance-vector)') +
      p('Each router computes its distance to every destination from its neighbours’ distances:') +
      F('Dx(y) = min over neighbours v { c(x, v) + Dv(y) }') +
      fig('Bellman-Ford example', bfSVG, 'x reaches z more cheaply through y (cost 3) than directly (cost 7).')
  });

  CN.add({
    id: 'u2-internet-routing', unit: '2', group: 'Network layer', kicker: '4.5', title: 'Routing in the Internet — RIP, OSPF, BGP',
    src: ['Internet Protocol - Routing Algorithms, Internet Routing, Broadcast & Multicast_.pdf', 'Routing_Broadcast_Multicast.pdf'],
    left: h('Why autonomous systems?') +
      p('The Internet is too large for one routing algorithm, and each ISP wants to control its own network. So routers are grouped into <b>autonomous systems (AS)</b>: groups of routers under one administration. Routing <b>inside</b> an AS uses an intra-AS protocol (RIP or OSPF); routing <b>between</b> ASes uses <b>BGP</b>.') +
      mmd('Intra-AS vs inter-AS', `flowchart LR
  A1["AS 1 (OSPF inside)"] <-->|"BGP"| A2["AS 2 (RIP inside)"] <-->|"BGP"| A3["AS 3"]`, '') +
      h('RIP (Routing Information Protocol)') +
      p('RIP is a <b>distance-vector</b> protocol that uses <b>hop count</b> as its cost (maximum 15; 16 means unreachable). Routers exchange tables with neighbours every 30 seconds; a neighbour silent for 180 seconds is declared dead.') +
      h('OSPF (Open Shortest Path First)') +
      p('OSPF is a <b>link-state</b> protocol: every router floods its link costs to all routers in the AS and runs <b>Dijkstra</b>. It supports authentication, multiple equal-cost paths and a hierarchy of <b>areas</b> joined by a backbone area.'),
    right: h('BGP (Border Gateway Protocol)') +
      p('<b>BGP</b> is the inter-AS routing protocol that connects the Internet. It is a <b>path-vector</b> protocol: routers advertise the full list of ASes (AS-PATH) to a destination. <b>eBGP</b> runs between ASes and <b>iBGP</b> spreads the learned routes inside an AS.') +
      h('How BGP chooses a route') +
      ol(['Highest <b>local preference</b> (set by the AS’s policy).', 'Shortest <b>AS-PATH</b>.', 'Closest <b>NEXT-HOP</b> router (hot-potato routing).', 'Other tie-breakers.']) +
      t(['Basis', 'RIP', 'OSPF', 'BGP'], [['Scope', 'Inside AS', 'Inside AS', 'Between ASes'], ['Type', 'Distance-vector', 'Link-state', 'Path-vector'], ['Metric', 'Hop count', 'Link cost', 'Policy + AS-PATH'], ['Runs over', 'UDP', 'IP directly', 'TCP']], null, 'compact')
  });

  CN.add({
    id: 'u2-bcast', unit: '2', group: 'Network layer', kicker: '4.6', title: 'Broadcast & multicast routing',
    src: ['Internet Protocol - Routing Algorithms, Internet Routing, Broadcast & Multicast_.pdf', 'Routing_Broadcast_Multicast.pdf'],
    left: h('What is broadcast routing?') +
      p('<b>Broadcast routing</b> delivers a packet from one source to <b>all</b> nodes in the network. Instead of the source sending a separate copy to each node, routers copy the packet where paths split.') +
      t(['Method', 'How it works', 'Issue'], [['Flooding', 'Forward on every link except the one it arrived on', 'Loops cause broadcast storms'], ['Controlled flooding', 'Forward only packets not seen before', 'Must remember packet IDs'], ['Reverse path forwarding (RPF)', 'Forward only if the packet arrived on the shortest path back to the source', 'Uses the normal routing table'], ['Spanning tree', 'Send only along a tree that reaches all nodes', 'No duplicates at all']], null, 'compact') +
      mmd('Reverse path forwarding', `flowchart LR
  A["A (source)"] --> B
  A --> C
  B -->|"accepted"| D
  C -.->|"dropped"| D`, 'D accepts the copy from B because B is on its shortest path to A.'),
    right: h('What is multicast routing?') +
      p('<b>Multicast routing</b> delivers a packet only to the hosts that have joined a <b>group</b>. Hosts join using <b>IGMP</b>; group addresses are Class D (224.0.0.0 – 239.255.255.255). Eg: IPTV, live video.') +
      t(['Tree type', 'Idea', 'Example protocol'], [['Source-based tree', 'A separate shortest-path tree for each sender', 'DVMRP (flood and prune)'], ['Shared tree', 'One tree for all senders, built around a rendezvous point', 'PIM sparse mode']], null, 'compact') +
      t(['Basis', 'PIM dense mode', 'PIM sparse mode'], [['Members', 'Many, close together', 'Few, widely spread'], ['Method', 'Flood and prune', 'Join via rendezvous point']], null, 'compact') +
      t(['Basis', 'Unicast', 'Broadcast', 'Multicast'], [['Receivers', 'One host', 'All hosts', 'Group members'], ['Example', 'Web', 'ARP', 'IPTV']], null, 'compact center')
  });

  CN.add({
    id: 'u2-revision', unit: '2', group: 'Revision', kicker: 'UNIT 2 · REVISION', title: 'Unit 2 revision summary',
    src: ['All Unit-2 files'],
    left: t(['Topic', 'Key point'], [
      ['Transport layer', 'Process-to-process delivery; runs on hosts only'],
      ['Demultiplexing', 'UDP: (dst IP, dst port); TCP: 4-tuple'],
      ['UDP', '8-byte header; checksum; no reliability'],
      ['rdt', 'Checksum → seq numbers → timer'],
      ['Pipelining', 'GBN resends window; SR resends lost packet'],
      ['TCP', 'Reliable byte stream; 3-way handshake'],
      ['Timeout', 'EstimatedRTT + 4 × DevRTT'],
      ['Flow vs congestion', 'rwnd protects receiver; cwnd protects network'],
      ['TCP CC', 'Slow start, AIMD, fast recovery'],
      ['IP', 'CIDR, longest prefix match, fragmentation'],
      ['Routing', 'Dijkstra (OSPF), Bellman-Ford (RIP), BGP between ASes'],
      ['Multicast', 'IGMP; source-based or shared trees']
    ], null, 'compact'),
    right: h('Common mistakes') +
      ul(['Saying the receiver controls cwnd (the sender does).', 'Thinking a timeout always means the packet was lost.', 'Writing the fragment offset in bytes instead of 8-byte units.', 'Choosing the shortest prefix instead of the longest.', 'Saying BGP always picks the shortest path (policy comes first).']) +
      '<p class="small">Practice: <a href="#qb-u2-desc">Unit 2 questions</a> · <a href="#qb-u2-num">Unit 2 numericals</a></p>'
  });
})();
