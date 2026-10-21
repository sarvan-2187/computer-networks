/* Unit 3 — Link layer & LANs, physical layer, link virtualization, MPLS, SDN, data centres. */
(function () {
  var b = CN.blk, t = CN.table, A = CN.arrows, S = CN.split, P = CN.pros, eg = CN.eg, F = CN.formula, calc = CN.calc, fig = CN.fig, mmd = CN.mmd;

  /* Mod-2 long division laid out step by step (CRC). Returns {text, rem, q}. */
  CN.crcDivision = function (D, G) {
    var r = G.length - 1, bits = (D + Array(r + 1).join('0')).split('').map(Number), g = G.split('').map(Number);
    var sp = function (n) { return Array(n + 1).join(' '); }, pad = G.length + 3;
    var lines = [G + ' ) ' + bits.join(' ')], q = '', win = bits.slice(0, g.length), rem = '';
    for (var i = 0; i + g.length <= bits.length; i++) {
      var lead = win[0], sub = lead ? g : g.map(function () { return 0; });
      q += lead;
      lines.push(sp(pad + 2 * i) + sub.join(' ') + (lead ? '' : '   (leading 0 → XOR 0000)'));
      lines.push(sp(pad + 2 * i) + Array(2 * g.length).join('─'));
      var x = win.map(function (v, k) { return v ^ sub[k]; }), next = bits[i + g.length];
      if (next === undefined) { rem = x.slice(1).join(''); lines.push(sp(pad + 2 * i + 2) + x.slice(1).join(' ') + '   ← remainder R'); break; }
      win = x.slice(1).concat([next]);
      lines.push(sp(pad + 2 * i + 2) + win.join(' ') + '   (bring down ' + next + ')');
    }
    lines.push('', 'quotient = ' + q + ',  remainder R = ' + rem);
    return { text: lines.join('\n'), rem: rem, q: q };
  };
  var crc = CN.crcDivision('101110', '1001');

  var sineSVG = (function () {
    var p1 = [], p2 = [];
    for (var x = 40; x <= 600; x += 4) { p1.push(x + ',' + (110 - 70 * Math.sin(2 * Math.PI * (x - 40) / 200)).toFixed(1)); p2.push(x + ',' + (110 - 70 * Math.sin(2 * Math.PI * (x - 40) / 200 - Math.PI / 2)).toFixed(1)); }
    return '<svg class="d" viewBox="0 0 640 230" role="img" aria-label="Sine wave parameters">' + CN.defs +
      '<line class="ln-thin" x1="40" y1="110" x2="610" y2="110"/>' +
      '<polyline class="ln-dash" points="' + p2.join(' ') + '"/>' +
      '<polyline class="ln-blue" points="' + p1.join(' ') + '"/>' +
      '<line class="ln-red" x1="90" y1="108" x2="90" y2="44" marker-end="url(#ahr)"/><text class="t-sm t-red t-b" x="96" y="70">amplitude</text>' +
      '<line class="ln-green" x1="40" y1="200" x2="240" y2="200" marker-end="url(#ahg)"/><line class="ln-green" x1="240" y1="200" x2="40" y2="200" marker-end="url(#ahg)"/><text class="t-sm t-green t-b" x="100" y="218">period T (one cycle)</text>' +
      '<text class="t-sm t-mut" x="300" y="34">dashed: shifted ¼ cycle = 90° phase</text>' +
      '<text class="t-xs t-mut" x="580" y="128">time →</text></svg>';
  })();

  var digitalSVG = (function () {
    var bits = [1, 0, 1, 1, 0, 1, 0, 0], s = '<svg class="d" viewBox="0 0 640 130" role="img" aria-label="Digital signal">', pts = [];
    bits.forEach(function (v, i) { var y = v ? 30 : 90; pts.push((40 + i * 70) + ',' + y, (110 + i * 70) + ',' + y); s += '<text class="t-sm t-b" text-anchor="middle" x="' + (75 + i * 70) + '" y="' + (v ? 22 : 112) + '">' + v + '</text>'; });
    s += '<polyline class="ln-violet" points="' + pts.join(' ') + '"/>';
    return s + '<text class="t-xs t-mut" x="470" y="126">bit interval = 1 / bit rate</text></svg>';
  })();

  var tdmaSVG = (function () {
    var lab = ['A', 'B', 'C', 'D', 'A', 'B', 'idle', 'D'], s = '<svg class="d" viewBox="0 0 640 100" role="img" aria-label="TDMA slots">' + CN.defs;
    lab.forEach(function (l, i) { s += '<rect class="' + (l === 'idle' ? 'box-grey' : 'box-b') + '" x="' + (20 + i * 74) + '" y="20" width="70" height="40"/><text class="t-sm t-b" text-anchor="middle" x="' + (55 + i * 74) + '" y="45">' + (l === 'idle' ? 'C idle' : l) + '</text>'; });
    s += '<text class="t-xs t-mut" x="20" y="80">round 1</text><text class="t-xs t-mut" x="316" y="80">round 2 — C has nothing to send: slot wasted</text>';
    return s + '<line class="ln" x1="20" y1="90" x2="615" y2="90" marker-end="url(#ah)"/></svg>';
  })();

  var alohaSVG = (function () {
    var s = '<svg class="d" viewBox="0 0 640 230" role="img" aria-label="Pure versus slotted ALOHA">' + CN.defs;
    s += '<text class="t-b" x="10" y="18">Pure ALOHA — send any time</text>';
    [['A', 60, 30, 1], ['B', 120, 60, 1], ['C', 330, 90, 0]].forEach(function (f) { s += '<text class="t-sm" x="10" y="' + (f[2] + 14) + '">' + f[0] + '</text><rect class="' + (f[3] ? 'box-r' : 'box-g') + '" x="' + f[1] + '" y="' + f[2] + '" width="110" height="20"/>'; });
    s += '<text class="t-xs t-red" x="240" y="62">A and B overlap → both lost</text><text class="t-xs t-green" x="450" y="104">C succeeds</text>';
    s += '<text class="t-b" x="10" y="140">Slotted ALOHA — start only at slot boundaries</text>';
    for (var i = 0; i <= 5; i++) s += '<line class="ln-dash" x1="' + (40 + i * 110) + '" y1="148" x2="' + (40 + i * 110) + '" y2="225"/>';
    [['A', 40, 155, 1], ['B', 40, 180, 1], ['C', 260, 205, 0], ['A', 370, 155, 0]].forEach(function (f) { s += '<rect class="' + (f[3] ? 'box-r' : 'box-g') + '" x="' + f[1] + '" y="' + f[2] + '" width="110" height="18"/><text class="t-xs" x="' + (f[1] + 6) + '" y="' + (f[2] + 13) + '">' + f[0] + '</text>'; });
    s += '<text class="t-xs t-red" x="155" y="170">same slot → collide</text>';
    return s + '</svg>';
  })();

  var hiddenSVG = '<svg class="d" viewBox="0 0 640 170" role="img" aria-label="Hidden terminal problem">' +
    '<circle cx="190" cy="85" r="120" fill="#eaf1fb" fill-opacity=".5" stroke="#1f4e8c" stroke-dasharray="5 4"/>' +
    '<circle cx="450" cy="85" r="120" fill="#fbeee8" fill-opacity=".5" stroke="#a2401f" stroke-dasharray="5 4"/>' +
    '<circle class="host" cx="190" cy="85" r="18"/><text class="t-b" text-anchor="middle" x="190" y="90">A</text>' +
    '<circle class="router" cx="320" cy="85" r="18"/><text class="t-b" text-anchor="middle" x="320" y="90">B</text>' +
    '<circle class="host" cx="450" cy="85" r="18"/><text class="t-b" text-anchor="middle" x="450" y="90">C</text>' +
    '<text class="t-xs" text-anchor="middle" x="320" y="122">AP in range of both</text>' +
    '<text class="t-sm t-b" text-anchor="middle" x="320" y="30">A and C cannot hear each other → collide at B</text></svg>';

  var fibreSVG = '<svg class="d" viewBox="0 0 640 120" role="img" aria-label="Total internal reflection in optical fibre">' + CN.defs +
    '<rect x="20" y="20" width="600" height="80" rx="6" fill="#ecebe7" stroke="#8a8378"/><rect x="20" y="40" width="600" height="40" fill="#eaf1fb" stroke="#1f4e8c"/>' +
    '<polyline class="ln-red" points="20,62 80,42 160,78 240,42 320,78 400,42 480,78 560,42 615,62" marker-end="url(#ahr)"/>' +
    '<text class="t-xs" x="26" y="34">cladding</text><text class="t-xs t-blue" x="26" y="94">core</text><text class="t-xs t-red" x="380" y="114">light reflects at the core–cladding boundary</text></svg>';

  /* ================= Topics (GfG-style) ================= */
  var h = function (s) { return '<h2>' + s + '</h2>'; }, p = function (s) { return '<p>' + s + '</p>'; };
  var ol = function (a) { return '<ol class="steps">' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>'; };
  var ul = function (a) { return '<ul>' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; };
  var gfg = function (html) { return b('supp', html, 'Also on GFG (supplementary)'); };

  CN.add({
    id: 'u3-overview', unit: '3', group: 'Overview', kicker: 'UNIT 3', title: 'Unit 3 overview — link layer, physical layer, virtualization',
    src: ['Approved CDP_23CSE302 CN.pdf', 'Unit3_LinkLayer_.pdf', 'Unit3_LinkLayer__2.pdf'],
    left: p('Unit 3 explains how a datagram crosses a single link: how it is framed, how errors are detected, how many devices share one channel, and how MAC addresses, Ethernet and switches deliver frames in a LAN. It then covers the physical layer (signals, noise, media) and network virtualization (MPLS, SDN).') +
      mmd('Unit 3 roadmap', `flowchart LR
  L["Link layer"] --> E["Error detection"] --> M["Multiple access"] --> AD["MAC & ARP"] --> SW["Ethernet & switches"]
  P["Physical layer"] --> SG["Signals"] --> IM["Noise & capacity"] --> MD["Media"]
  V["Virtualization"] --> MP["MPLS"] --> SD["SDN"]`, '') +
      h('Key formulas') + t(['Quantity', 'Formula'], [
        ['ALOHA efficiency', 'Pure <code>18.4%</code>, slotted <code>36.8%</code>'],
        ['Frequency', '<code>f = 1 / T</code>'],
        ['Bandwidth', '<code>highest − lowest frequency</code>'],
        ['Decibel', '<code>10 log₁₀(P₂ / P₁)</code>'],
        ['SNR in dB', '<code>10 log₁₀(S / N)</code>'],
        ['Nyquist (noiseless)', '<code>2 × B × log₂ L</code>'],
        ['Shannon (noisy)', '<code>B × log₂(1 + SNR)</code>']
      ], null, 'compact') +
      b('flag', '<p>The question bank has no Unit 3 questions; practice comes from the slides plus additional questions. The CDP topic “Data center networking” has no lecture file (see its supplementary page).</p>')
  });

  CN.add({
    id: 'u3-intro', unit: '3', group: 'Link layer', kicker: '6.1', title: 'Link layer: introduction, services & framing',
    src: ['Unit3_LinkLayer_.pdf'],
    left: h('What is the link layer?') +
      p('The <b>link layer</b> moves a datagram from one node to the next node over a single link. Hosts and routers are called <b>nodes</b>; the channels between neighbouring nodes are <b>links</b>; and the link-layer packet is a <b>frame</b>. The network layer works end to end, but the link layer works one hop at a time.') +
      mmd('One datagram, a new frame on each link', `flowchart LR
  A["Host A"] -->|"Ethernet frame"| R["Router"] -->|"Wi-Fi frame"| B["Host B"]`, '') +
      h('What is framing?') +
      p('<b>Framing</b> puts the network-layer datagram inside a frame by adding a <b>header</b> (addresses, control information) and a <b>trailer</b> (error-detection bits).') +
      CN.strip('Frame format', [['Header', 'addresses', 2, 'f-key'], ['Datagram (payload)', '', 6], ['Trailer', 'error check', 2, 'f-alt']], ''),
    right: h('Services of the link layer') +
      t(['Service', 'Description'], [
        ['Framing and link access', 'Encapsulates the datagram; decides who may send on a shared link'],
        ['Addressing', 'Uses MAC addresses to identify sender and receiver'],
        ['Reliable delivery', 'Ensures the frame reaches the next node (used mainly on wireless links)'],
        ['Flow control', 'Stops a fast sender from overwhelming a slow receiver'],
        ['Error detection and correction', 'Detects, and sometimes corrects, bit errors caused by noise']
      ], null, 'compact') +
      h('Why reliability at the link layer too?') +
      p('On low-error links such as fibre, errors are rare, so link-layer acknowledgements are not worth the overhead; TCP handles them. On wireless links, errors are common, so it is cheaper to fix a frame on that one hop than to resend the whole segment end to end.') +
      p('The link layer is implemented mainly in the <b>network interface card (NIC)</b>.')
  });

  CN.add({
    id: 'u3-edc', unit: '3', group: 'Link layer', kicker: '6.2', title: 'Error detection & correction — parity, checksum, CRC',
    src: ['Unit3_LinkLayer_.pdf'],
    left: h('What is error detection?') +
      p('Noise can flip bits during transmission. In <b>error detection</b>, the sender adds extra bits (<b>EDC bits</b>) computed from the data; the receiver recomputes them and compares. A mismatch means an error. Detection is not 100% reliable — some error patterns can go unnoticed.') +
      gfg('<p><b>Single-bit error</b>: only one bit changes. <b>Burst error</b>: two or more consecutive bits change (common with impulse noise).</p>') +
      h('1. Single-bit parity') +
      p('One <b>parity bit</b> is added so that the total number of 1s is even (even parity) or odd (odd parity). It detects any <b>odd</b> number of bit errors but misses an even number, and it cannot correct errors.') +
      eg('Data 1011001 has four 1s, so the even-parity bit is 0 and 10110010 is sent.') +
      h('2. Two-dimensional parity') +
      p('The data is arranged in rows and columns, and a parity bit is computed for every row and every column. A single flipped bit makes one row and one column fail; their intersection shows the bad bit, so it can be <b>corrected</b>.') +
      '<div class="tbl-wrap" style="max-width:300px"><table class="cmp compact center"><tbody>' +
      '<tr><td>1</td><td>1</td><td>0</td><td>1</td><td class="key">1</td></tr><tr><td>0</td><td>1</td><td>1</td><td>0</td><td class="key">0</td></tr>' +
      '<tr><td>1</td><td style="background:#f5c4b6;font-weight:700">0</td><td>0</td><td>1</td><td class="key">1 ✗</td></tr><tr><td>1</td><td>1</td><td>1</td><td>0</td><td class="key">1</td></tr>' +
      '<tr><td class="key">1</td><td class="key">0 ✗</td><td class="key">0</td><td class="key">0</td><td class="key">1</td></tr></tbody></table></div>' +
      h('3. Internet checksum') +
      p('The data is treated as 16-bit numbers that are added using 1’s complement arithmetic; the checksum is the complement of the sum. The receiver adds everything including the checksum; all 1s means no error. It is used in UDP and TCP.') +
      calc({ title: 'Checksum (8-bit example)', src: 'Unit3_LinkLayer_.pdf', steps: ['11001100 + 10101010 = 1 01110110 (carry)', 'Wrap the carry: 01110111', 'Complement: 10001000'], answer: 'Checksum = 10001000' }),
    right: h('4. Cyclic Redundancy Check (CRC)') +
      p('<b>CRC</b> is the strongest and most widely used method (Ethernet, Wi-Fi). Sender and receiver agree on a <b>generator G</b> of r + 1 bits. The sender appends r zero bits to the data, divides by G using <b>modulo-2 (XOR) division</b>, and sends the r-bit remainder R with the data. The receiver divides the received bits by G; a remainder of 0 means no error.') +
      ol(['Append r zeros to the data D.', 'Divide by G using XOR (no carries or borrows).', 'The remainder is R; send D followed by R.', 'Receiver divides by G: remainder 0 → accept.']) +
      '<pre class="mono small" style="white-space:pre;overflow:hidden;background:var(--code-bg);padding:10px;border-radius:6px;line-height:1.35">' + CN.esc(crc.text) + '</pre>' +
      calc({ title: 'CRC example', src: 'Unit3_LinkLayer_.pdf', given: ['D = 101110, G = 1001 (r = 3)'], steps: ['Append 3 zeros: 101110000', 'Divide by 1001 (above)'], answer: 'R = ' + crc.rem + '; send 101110' + crc.rem }) +
      t(['Method', 'Detects', 'Corrects', 'Used in'], [['Single parity', 'Odd number of errors', 'No', 'Simple links'], ['2-D parity', 'Most 1–3 bit errors', 'Single-bit errors', 'Teaching / legacy'], ['Checksum', 'Most errors', 'No', 'UDP, TCP'], ['CRC', 'All burst errors up to r bits', 'No', 'Ethernet, Wi-Fi']], null, 'compact')
  });

  CN.add({
    id: 'u3-mac-proto', unit: '3', group: 'Multiple access', kicker: '6.3', title: 'Multiple access protocols & channel partitioning',
    src: ['Multiple Access Protocols.pdf', 'Unit3_LinkLayer__2.pdf'],
    left: h('What is a multiple access protocol?') +
      p('When many devices share one broadcast channel, two transmissions at the same time overlap and are destroyed — a <b>collision</b>. A <b>multiple access protocol</b> is a set of rules that decides which station may transmit, when, and what to do after a collision. Eg: shared Ethernet cable, Wi-Fi, satellite links.') +
      mmd('Types of multiple access protocols', `flowchart LR
  M["Multiple access"] --> CP["Channel partitioning<br/>TDMA, FDMA, CDMA"]
  M --> RA["Random access<br/>ALOHA, CSMA"]
  M --> TT["Taking turns<br/>polling, token passing"]`, '') +
      t(['Type', 'Idea', 'Collisions'], [['Channel partitioning', 'Divide the channel in advance', 'Never'], ['Random access', 'Send when ready; recover from collisions', 'Possible'], ['Taking turns (controlled access)', 'Stations take turns', 'Never']], null, 'compact'),
    right: h('Channel partitioning') +
      ul(['<b>TDMA (Time Division Multiple Access)</b>: time is divided into rounds of fixed slots; each station sends only in its own slot.', '<b>FDMA (Frequency Division Multiple Access)</b>: the frequency range is divided into bands; each station gets its own band.', '<b>CDMA (Code Division Multiple Access)</b>: all stations send at the same time on the same frequency, each using a unique code (used in cellular networks).']) +
      fig('TDMA slots', tdmaSVG, 'If station C has nothing to send, its slot is wasted.', { wide: true }) +
      P(['no collisions', 'fair, equal share', 'predictable'], ['wastes capacity when a station is idle', 'unsuitable for bursty traffic']) +
      gfg('<p>FDMA leaves small <b>guard bands</b> between frequency bands to avoid interference; TDMA needs <b>synchronisation</b> so stations know where their slots begin.</p>')
  });

  CN.add({
    id: 'u3-aloha', unit: '3', group: 'Multiple access', kicker: '6.3', title: 'Random access — Pure and Slotted ALOHA',
    src: ['Multiple Access Protocols.pdf', 'Unit3_LinkLayer__2.pdf'],
    left: h('What is random access?') +
      p('In <b>random access</b>, a station sends whenever it has data. If a collision occurs, each station waits a <b>random</b> time and retries, so they are unlikely to collide again.') +
      h('Pure ALOHA') +
      p('In <b>Pure ALOHA</b>, a station transmits as soon as it has a frame. If no acknowledgement comes, it waits a random time and retransmits. Any overlap with another frame causes a collision, so the vulnerable time is <b>two frame-times</b>. Maximum efficiency is <b>18.4%</b> (1/2e).') +
      h('Slotted ALOHA') +
      p('In <b>Slotted ALOHA</b>, time is divided into slots equal to one frame-time, and stations may start sending only at the start of a slot. Frames collide only if they start in the same slot, so the vulnerable time is <b>one frame-time</b> and maximum efficiency doubles to <b>36.8%</b> (1/e). Stations must be synchronised.') +
      fig('Pure vs slotted ALOHA', alohaSVG, '', { wide: true }),
    right: h('Comparison') +
      t(['Basis', 'Pure ALOHA', 'Slotted ALOHA'], [['When to send', 'Any time', 'Only at slot start'], ['Vulnerable time', '2 × frame time', '1 × frame time'], ['Synchronisation', 'Not needed', 'Needed'], ['Max efficiency', '18.4%', '36.8%']], null, 'compact') +
      b('mistake', '<p>Slotted ALOHA has the <b>higher</b> efficiency (36.8%).</p>')
  });

  CN.add({
    id: 'u3-csma', unit: '3', group: 'Multiple access', kicker: '6.3', title: 'CSMA, CSMA/CD, CSMA/CA & taking turns',
    src: ['Multiple Access Protocols.pdf', 'Unit3_LinkLayer__2.pdf'],
    left: h('What is CSMA?') +
      p('In <b>CSMA (Carrier Sense Multiple Access)</b>, a station first <b>listens</b> to the channel. If it is idle, the station transmits; if it is busy, the station waits. Collisions can still happen because of <b>propagation delay</b>: two distant stations may both sense the channel idle and send together.') +
      gfg('<p>CSMA variants: <b>1-persistent</b> — keep sensing and send as soon as the channel is idle; <b>non-persistent</b> — if busy, wait a random time before sensing again; <b>p-persistent</b> — when idle, send with probability p (used with slotted channels).</p>') +
      h('CSMA/CD (Collision Detection)') +
      p('Used in classic wired Ethernet. The station keeps listening <b>while</b> transmitting. If it detects a collision, it stops immediately, sends a short <b>jam signal</b>, waits a random time (<b>binary exponential backoff</b>, where the waiting range doubles after each collision) and tries again.') +
      mmd('CSMA/CD', `flowchart LR
  A["Channel idle?"] --> T["Transmit and listen"] --> C{"Collision?"}
  C -- no --> D["Done"]
  C -- yes --> J["Stop, send jam"] --> K["Random backoff"] --> A`, ''),
    right: h('CSMA/CA (Collision Avoidance)') +
      p('Used in Wi-Fi. A radio cannot listen while it is transmitting, so collisions cannot be detected and must be <b>avoided</b>. The station waits a random backoff time before sending, may reserve the channel with <b>RTS/CTS</b> (Request To Send / Clear To Send), and needs an <b>ACK</b> for every frame.') +
      fig('Hidden terminal problem', hiddenSVG, 'A and C cannot hear each other but both reach B; RTS/CTS solves this.', { wide: true }) +
      t(['Basis', 'CSMA/CD', 'CSMA/CA'], [['Used in', 'Wired Ethernet', 'Wi-Fi'], ['Approach', 'Detect collisions', 'Avoid collisions'], ['ACK needed', 'No', 'Yes'], ['Extra mechanism', 'Jam signal + backoff', 'Backoff + RTS/CTS']], null, 'compact') +
      h('Taking-turns (controlled access) protocols') +
      ul(['<b>Polling</b>: a master station invites each station in turn to send. No collisions, but the master is a single point of failure.', '<b>Token passing</b>: a special token frame circulates; only the station holding the token may send. No master is needed, but a lost token must be recovered.']) +
      gfg('<p><b>Reservation</b> is a third controlled-access method: stations first reserve a slot in a reservation interval, then send in their reserved slot.</p>')
  });

  CN.add({
    id: 'u3-addressing', unit: '3', group: 'Addressing & LANs', kicker: '6.4', title: 'MAC addresses & ARP',
    src: ['Unit3_MACAddressing_Ethernet.pdf', 'Unit3_LinkLayer__2.pdf'],
    left: h('What is a MAC address?') +
      p('A <b>MAC (Media Access Control) address</b> is a 48-bit (6-byte) hardware address that identifies a network adapter (NIC). It is written as 12 hexadecimal digits, such as A4:5E:60:D1:9B:2F. The first 3 bytes (OUI) identify the manufacturer, and the last 3 bytes identify the adapter. It is burned in and usually never changes.') +
      p('The <b>broadcast</b> MAC address <b>FF:FF:FF:FF:FF:FF</b> delivers a frame to every adapter on the LAN.') +
      h('MAC address vs IP address') +
      t(['Basis', 'MAC address', 'IP address'], [['Layer', 'Link layer', 'Network layer'], ['Size', '48 bits', '32 bits (IPv4)'], ['Structure', 'Flat', 'Hierarchical (network + host)'], ['Assigned by', 'Manufacturer', 'Administrator / DHCP'], ['Changes when moved?', 'No', 'Yes'], ['Used for', 'Delivery on one link', 'Delivery across networks']], 'A MAC address is like your name; an IP address is like your postal address.', 'compact'),
    right: h('What is ARP?') +
      p('<b>ARP (Address Resolution Protocol)</b> finds the MAC address that belongs to a known IP address on the <b>same LAN</b>. Each host keeps an <b>ARP table</b> of IP-to-MAC mappings, and each entry expires after a TTL (about 20 minutes).') +
      h('How ARP works') +
      ol(['Host A wants to send to IP address X but does not know its MAC address.', 'A broadcasts an <b>ARP request</b> (to FF:FF:FF:FF:FF:FF): “Who has IP X?”', 'Every host receives it, but only the host with IP X replies, using a unicast <b>ARP reply</b> containing its MAC address.', 'A stores the mapping in its ARP table and sends the frame.']) +
      mmd('ARP', `sequenceDiagram
  participant A as Host A
  participant C as Host C
  A->>C: broadcast: who has IP of C?
  C-->>A: unicast: my MAC is ...`, '') +
      p('If the destination is on another network, A uses ARP to find the MAC address of its <b>default gateway (router)</b>, and the router repeats the process on the next link.')
  });

  CN.add({
    id: 'u3-ethernet', unit: '3', group: 'Addressing & LANs', kicker: '6.4', title: 'Ethernet',
    src: ['Unit3_MACAddressing_Ethernet.pdf', 'Unit3_LinkLayer__2.pdf'],
    left: h('What is Ethernet?') +
      p('<b>Ethernet (IEEE 802.3)</b> is the most widely used wired LAN technology. It defines the frame format and how frames are sent, and it uses MAC addresses for delivery. Early Ethernet used a shared bus with CSMA/CD; modern Ethernet uses switches in a star topology.') +
      h('Ethernet frame structure') +
      CN.strip('Ethernet frame', [['Preamble', '8 B', 2], ['Dest. MAC', '6 B', 2, 'f-key'], ['Source MAC', '6 B', 2, 'f-key'], ['Type', '2 B', 1.4], ['Data', '46–1500 B', 5, 'f-alt'], ['CRC', '4 B', 1.4]], '') +
      t(['Field', 'Purpose'], [['Preamble', 'Synchronises the receiver’s clock'], ['Destination / source address', 'MAC addresses of receiver and sender'], ['Type', 'Upper-layer protocol, usually IP'], ['Data', 'The datagram (46–1500 bytes; padded if shorter)'], ['CRC', 'Error detection; bad frames are dropped']], null, 'compact'),
    right: h('Features of Ethernet') +
      ul(['<b>Connectionless</b> — no handshake before sending.', '<b>Unreliable</b> — no acknowledgements or retransmission; higher layers (TCP) recover lost data.']) +
      h('Why is there a minimum frame size?') +
      p('With CSMA/CD, a sender must still be transmitting when a collision signal comes back; otherwise the collision would go unnoticed. So a frame must last at least one round-trip time on the cable, which gives a minimum frame size of <b>64 bytes</b>.') +
      mmd('Evolution of Ethernet', `flowchart LR
  A["Shared bus"] --> B["Hubs"] --> C["Switches"] --> D["Full duplex"]`, '')
  });

  CN.add({
    id: 'u3-switches', unit: '3', group: 'Addressing & LANs', kicker: '6.4', title: 'Link-layer switches & network devices',
    src: ['Unit3_MACAddressing_Ethernet.pdf', 'Unit3_LinkLayer__2.pdf'],
    left: h('What is a switch?') +
      p('A <b>link-layer switch</b> forwards frames inside a LAN using MAC addresses. Unlike a hub, which repeats every bit to all ports, a switch sends a frame only to the port that leads to its destination. Each switch port is a separate collision domain, so collisions are avoided.') +
      h('How a switch learns (self-learning)') +
      ol(['A frame arrives on a port.', 'The switch records the frame’s <b>source</b> MAC address and that port in its table.', 'It looks up the <b>destination</b> MAC address.', 'If found, it forwards the frame only to that port; if not, it <b>floods</b> the frame to all other ports.']) +
      mmd('Self-learning', `flowchart LR
  A["Frame in"] --> L["Learn source MAC"] --> Q{"Destination known?"}
  Q -- yes --> F["Forward to one port"]
  Q -- no --> FL["Flood to other ports"]`, '') +
      t(['Frame (port)', 'Learns', 'Action'], [['A → C (1)', 'A on port 1', 'Flood (C unknown)'], ['C → A (3)', 'C on port 3', 'Send to port 1'], ['B → A (2)', 'B on port 2', 'Send to port 1']], null, 'compact'),
    right: h('Hub vs switch vs router') +
      t(['Basis', 'Hub', 'Switch', 'Router'], [['Layer', 'Physical', 'Link', 'Network'], ['Uses', 'Nothing (repeats bits)', 'MAC address', 'IP address'], ['Forwards to', 'All ports', 'Correct port', 'Next network'], ['Collision domain', 'One for all ports', 'One per port', 'One per port'], ['Broadcast domain', 'One', 'One', 'Splits it']], null, 'compact') +
      p('A <b>collision domain</b> is the set of devices whose frames can collide; a <b>broadcast domain</b> is the set of devices reached by a broadcast. Switches split collision domains; routers (or VLANs) split broadcast domains.') +
      gfg(t(['Device', 'Layer', 'Function'], [['Repeater', 'Physical', 'Regenerates a weak signal'], ['Hub', 'Physical', 'Multi-port repeater'], ['Bridge', 'Link', 'Joins two LAN segments; filters by MAC'], ['Switch', 'Link', 'Multi-port bridge'], ['Router', 'Network', 'Connects different networks using IP'], ['Gateway', 'All layers', 'Connects networks using different protocols']], null, 'compact'))
  });

  CN.add({
    id: 'u3-physical', unit: '3', group: 'Physical layer', kicker: 'PHY', title: 'Physical layer — signals',
    src: ['Unit3_PhysicalLayer_Virtualization_SDN.pdf', 'Unit3_LinkLayer__2.pdf'],
    left: h('What is the physical layer?') +
      p('The <b>physical layer</b> converts bits into signals (electrical, light or radio) that can travel over a medium, and converts them back at the receiver.') +
      mmd('Data communication', `flowchart LR
  S["Sender"] --> T["Transmitter"] --> C["Medium"] --> R["Receiver"] --> D["Destination"]`, '') +
      h('Analog and digital signals') +
      p('A <b>digital signal</b> has a limited number of levels (Eg: high = 1, low = 0) and is described by its <b>bit rate</b>. An <b>analog signal</b> varies continuously and is described by its <b>amplitude</b> (height), <b>frequency</b> (cycles per second, in Hz) and <b>phase</b> (position relative to time zero).') +
      fig('Sine wave', sineSVG, '', { wide: true }),
    right: fig('Digital signal', digitalSVG, 'With L levels, each level carries log₂L bits.', { wide: true }) +
      t(['Term', 'Meaning'], [['Period (T)', 'Time for one cycle; f = 1/T'], ['Bandwidth', 'Highest frequency − lowest frequency (Hz)'], ['Bit rate', 'Bits sent per second'], ['Baud rate', 'Signal symbols sent per second']], null, 'compact') +
      calc({ title: 'Examples', src: 'PhysicalLayer PDF', steps: ['T = 0.004 s → f = 1/0.004 = 250 Hz', 'Shift of ¼ cycle → phase = ¼ × 360° = 90°', 'Signal from 1000 Hz to 5000 Hz → bandwidth = 4000 Hz'], answer: '250 Hz; 90°; 4000 Hz' })
  });

  CN.add({
    id: 'u3-impair', unit: '3', group: 'Physical layer', kicker: 'PHY', title: 'Signal impairments, SNR & channel capacity',
    src: ['Unit3_PhysicalLayer_Virtualization_SDN.pdf', 'Unit3_LinkLayer__2.pdf'],
    left: h('Types of impairment') +
      t(['Impairment', 'Meaning'], [['Attenuation', 'Loss of signal strength over distance'], ['Distortion', 'Change in signal shape because components travel at different speeds'], ['Noise', 'Unwanted energy added to the signal (thermal, induced, crosstalk, impulse)']], null, 'compact') +
      h('Decibel (dB)') +
      p('Gain or loss is measured in decibels: <code>dB = 10 log₁₀(P₂/P₁)</code>. Halving the power is −3 dB; multiplying it by 10 is +10 dB. Decibels add up across a chain of links.') +
      h('Signal-to-noise ratio (SNR)') +
      p('<b>SNR</b> = signal power ÷ noise power; in decibels, SNR<sub>dB</sub> = 10 log₁₀(SNR). A higher SNR means a cleaner signal and fewer bit errors.') +
      calc({ title: 'SNR', src: 'PhysicalLayer PDF', given: ['Signal = 10 mW, noise = 1 µW'], steps: ['SNR = 10,000', 'SNR_dB = 10 × 4 = 40 dB'], answer: '40 dB' }) +
      b('flag', '<p>The slide states noise = 1 mW but calculates with 1 µW.</p>'),
    right: h('Nyquist bit rate (noiseless channel)') +
      F('BitRate = 2 × B × log₂ L') +
      calc({ title: 'Nyquist', src: 'PhysicalLayer PDF', given: ['B = 3000 Hz, L = 2 levels'], steps: ['2 × 3000 × 1'], answer: '6000 bps' }) +
      h('Shannon capacity (noisy channel)') +
      F('C = B × log₂(1 + SNR)') +
      calc({ title: 'Shannon', src: 'PhysicalLayer PDF', given: ['B = 2 MHz, SNR = 36 dB'], steps: ['SNR = 10^3.6 ≈ 3981', 'C = 2×10⁶ × log₂ 3982 ≈ 23.9 Mbps'], answer: '≈ 23.9 Mbps' }) +
      p('Shannon gives the maximum possible capacity; Nyquist tells how many signal levels are needed to reach a rate. Always convert SNR from dB to a ratio before using Shannon.')
  });

  CN.add({
    id: 'u3-media', unit: '3', group: 'Physical layer', kicker: 'PHY', title: 'Transmission media',
    src: ['Unit3_PhysicalLayer_Virtualization_SDN.pdf'],
    left: h('What are transmission media?') +
      p('<b>Transmission media</b> are the physical paths that carry signals. <b>Guided media</b> confine the signal to a cable; <b>unguided media</b> send it through air or space.') +
      h('Guided media') +
      ul(['<b>Twisted pair</b> — two insulated copper wires twisted together; twisting cancels interference. Cheap; used in Ethernet and telephone lines.', '<b>Coaxial cable</b> — a copper core surrounded by insulation, a metal shield and a jacket; better shielding; used for cable TV.', '<b>Optical fibre</b> — carries light through a glass core using total internal reflection; very high bandwidth, low loss, immune to electromagnetic interference.']) +
      fig('Total internal reflection in fibre', fibreSVG, '', { wide: true }),
    right: t(['Basis', 'Twisted pair', 'Coaxial', 'Fibre'], [['Signal', 'Electrical', 'Electrical', 'Light'], ['Bandwidth', 'Low', 'Medium', 'Very high'], ['Cost', 'Cheapest', 'Moderate', 'Highest'], ['Noise immunity', 'Poor', 'Good', 'Excellent'], ['Use', 'LAN, phone', 'Cable TV', 'Backbones']], null, 'compact') +
      h('Unguided media') +
      t(['Type', 'Property', 'Use'], [['Radio waves', 'Travel in all directions; pass through walls', 'Wi-Fi, FM, Bluetooth'], ['Microwaves', 'Need line of sight', 'Satellite, point-to-point links'], ['Infrared', 'Short range; blocked by walls', 'TV remote']], null, 'compact')
  });

  CN.add({
    id: 'u3-virt', unit: '3', group: 'Virtualization & SDN', kicker: '6.5', title: 'Link virtualization, MPLS & SDN',
    src: ['Unit3_PhysicalLayer_Virtualization_SDN.pdf'],
    left: h('What is link virtualization?') +
      p('In <b>link virtualization</b>, an entire network is made to look like a single simple link to the network above it. Eg: ATM and MPLS networks connecting two IP routers.') +
      h('What is MPLS?') +
      p('<b>MPLS (Multiprotocol Label Switching)</b> forwards packets using a short <b>label</b> instead of a full IP address lookup. A path called a <b>label-switched path (LSP)</b> is set up in advance; each router reads the incoming label, swaps it for a new one and forwards the packet.') +
      mmd('MPLS label swapping', `flowchart LR
  IN["Ingress: add label 17"] --> S1["17 → 42"] --> S2["42 → 9"] --> EG["Egress: remove label"]`, '') +
      p('MPLS is used for faster forwarding, <b>traffic engineering</b> (choosing exact paths) and <b>VPNs</b>.'),
    right: h('What is SDN?') +
      p('<b>Software-Defined Networking (SDN)</b> separates the <b>control plane</b> (deciding where traffic goes) from the <b>data plane</b> (forwarding packets). Control is moved to a central, programmable <b>SDN controller</b>, and switches only forward packets as instructed.') +
      mmd('SDN architecture', `flowchart TB
  APP["Applications"] -->|"northbound API"| C["SDN controller"] -->|"southbound API (OpenFlow)"| SW["Switches"]`, '') +
      t(['Basis', 'Traditional network', 'SDN'], [['Control', 'In every router', 'Central controller'], ['Configuration', 'Device by device', 'Programmable from one place'], ['View of network', 'Neighbours only', 'Whole network'], ['Device role', 'Decides and forwards', 'Only forwards']], null, 'compact')
  });

  CN.add({
    id: 'u3-dc', unit: '3', group: 'Virtualization & SDN', kicker: 'CASE STUDY', title: 'Data center networking (supplementary)',
    src: ['Approved CDP_23CSE302 CN.pdf (syllabus only)', 'Kurose & Ross 8e §6.6 — not in uploaded files'],
    left: b('flag', '<p>This topic is in the CDP but no uploaded lecture file covers it. The summary below is from the prescribed textbook; confirm the expected depth with your faculty.</p>', 'Gap in sources') +
      h('What is a data center network?') +
      p('A <b>data center network</b> connects thousands of servers inside a data centre to each other and to the Internet. Servers sit in racks, each connected to a <b>top-of-rack (ToR) switch</b>, which connects upward through higher-tier switches and routers.') +
      mmd('Data center hierarchy', `flowchart LR
  I["Internet"] --> BR["Border router"] --> LB["Load balancer"] --> T1["Tier-1 switch"] --> T2["Tier-2 switch"] --> TOR["ToR switch"] --> S["Servers"]`, ''),
    right: ul(['A <b>load balancer</b> spreads incoming requests across servers.', 'A simple hierarchy limits bandwidth between racks.', 'Modern designs use a fully connected (Clos / fat-tree) topology with many parallel paths for high bandwidth and redundancy.', 'Recent trends include SDN-based control and multipath routing.'])
  });

  CN.add({
    id: 'u3-revision', unit: '3', group: 'Revision', kicker: 'UNIT 3 · REVISION', title: 'Unit 3 revision summary',
    src: ['All Unit-3 files'],
    left: t(['Topic', 'Key point'], [
      ['Link layer', 'Moves frames over one link'],
      ['Error detection', 'Parity, checksum, CRC (strongest)'],
      ['Multiple access', 'Partitioning, random access, taking turns'],
      ['ALOHA', 'Pure 18.4%, slotted 36.8%'],
      ['CSMA/CD vs CA', 'Detect (Ethernet) vs avoid (Wi-Fi)'],
      ['MAC address', '48-bit hardware address'],
      ['ARP', 'Finds MAC from IP on the same LAN'],
      ['Ethernet', 'Frame 64–1518 bytes with CRC'],
      ['Switch', 'Learns source, forwards by destination'],
      ['Signals', 'Amplitude, frequency, phase'],
      ['Capacity', 'Nyquist and Shannon'],
      ['MPLS / SDN', 'Labels / central controller']
    ], null, 'compact'),
    right: h('Common mistakes') +
      ul(['Saying slotted ALOHA is 18.4% (it is 36.8%).', 'Saying a switch stops broadcasts (routers do).', 'Using ARP across a router.', 'Putting SNR in dB directly into Shannon’s formula.'])
  });
})();
