/* All practice questions, defined once. app.js shows them under their topic and in the Question Bank section.
   kind: qb (bank, descriptive, verbatim) · qbnum (bank numerical, bank's own solution) · lec (printed on lecture slides) · extra (generated). */
(function () {
  var A = CN.arrows, S = CN.split, t = CN.table;
  function Q(o) { CN.questions.push(o); }
  function steps(list) { return '<div class="calc"><div class="calc-body">' + list.map(function (s) { return '<div class="eq">' + s + '</div>'; }).join('') + '</div></div>'; }
  function pts(list) { return '<ol class="steps">' + list.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>'; }

  /* ===================== UNIT 1 — question bank, Section A ===================== */
  Q({ id: 'U1-Q1', unit: '1', kind: 'qb', topic: 'u1-access', marks: '10 Marks · BTL2',
    q: 'Explain the structure of the Internet: describe the network edge, access networks, and physical transmission media, with examples of each.',
    cover: ['End systems (hosts) at the edge, running applications', 'Access network types: residential (DSL/cable), institutional (Ethernet/WiFi), mobile (cellular)', 'Guided media (twisted pair, coax, fiber) vs unguided media (radio)'],
    a: pts(['The Internet is a network of networks with three parts: network edge, access networks and network core.',
      '<b>Network edge</b>: end systems (hosts) that run applications — clients (PCs, phones) and servers (often in data centres).',
      '<b>Access network</b>: the physical link connecting a host to its first (edge) router.',
      '<b>Residential access</b>: DSL — dedicated telephone line to the DSLAM (↓ 24 / ↑ 2.5 Mbps); cable HFC — shared coax to the CMTS (↓ 30 / ↑ 2 Mbps); FTTH.',
      '<b>Institutional access</b>: switched Ethernet (10 Mbps – 10 Gbps) and Wi-Fi access points.',
      '<b>Mobile access</b>: 4G/5G base stations covering tens of km.',
      '<b>Guided media</b>: twisted pair (LAN, telephone), coaxial (cable TV), optical fibre (backbones; immune to EMI).',
      '<b>Unguided media</b>: radio — Wi-Fi, cellular, terrestrial microwave, satellite (≈ 270 ms delay).',
      'Diagram: hosts → access network → edge router → core.']) });

  Q({ id: 'U1-Q2', unit: '1', kind: 'qb', topic: 'u1-core', marks: '10 Marks · BTL2',
    q: 'Explain packet switching and circuit switching with neat diagrams; compare the two using a shared-link example with multiple users.',
    cover: ['Store-and-forward transmission in packet switching', 'Dedicated resource reservation (FDM/TDM) in circuit switching', 'Statistical multiplexing gain of packet switching vs guaranteed performance of circuit switching'],
    a: pts(['<b>Packet switching</b>: the message is split into packets that are forwarded independently using the full link rate.',
      '<b>Store-and-forward</b>: a router receives the entire packet before forwarding it; one hop takes L/R, N hops take N·L/R.',
      'Resources are shared on demand, so queueing delay and packet loss are possible.',
      '<b>Circuit switching</b>: an end-to-end path is reserved before transfer and held for the whole call.',
      'The link is divided by <b>FDM</b> (frequency band per call) or <b>TDM</b> (time slot per call); performance is guaranteed but idle capacity is wasted.',
      '<b>Shared-link example</b>: 1 Mbps link, each user 100 kbps when active and active 10% of the time.',
      'Circuit switching supports 1 Mbps / 100 kbps = <b>10 users</b>.',
      'Packet switching supports <b>35 users</b>; P(more than 10 active) < 0.0004 — the <b>statistical multiplexing gain</b>.',
      'Conclusion: packet switching suits bursty data; circuit switching suits continuous, delay-sensitive voice.']) });

  Q({ id: 'U1-Q3', unit: '1', kind: 'qb', topic: 'u1-topology', marks: '10 Marks · BTL4',
    q: 'A bank is designing its network across 4 branches, a central data centre, and 2000 employee devices. The design team is evaluating Star, Bus, Ring, Mesh, and Hybrid topologies. Compare these topologies on cost, fault tolerance, scalability, and maintenance, and recommend the most suitable design with justification and a diagram.',
    cover: ['A comparison table across the four criteria for all five topologies', 'Why fault tolerance matters more for a data centre link than a branch link', 'A hybrid design sketch: star-wired branches connected via a backbone', 'A one-line justification tied to the scenario'],
    a: t(['Topology', 'Cost', 'Fault tolerance', 'Scalability', 'Maintenance'], [['Bus', 'Low', 'Low', 'Low', 'Hard fault finding'], ['Star', 'Medium', 'Medium (hub = SPOF)', 'High', 'Easy'], ['Ring', 'Medium', 'Medium', 'Medium', 'Hard troubleshooting'], ['Mesh', 'Very high', 'Very high', 'Medium', 'Complex'], ['Hybrid', 'High', 'High', 'Very high', 'Moderate']], null, 'compact') +
      pts(['The data-centre link carries every branch’s transactions; its failure stops the whole bank, so it needs <b>redundant (mesh) paths</b>.',
        'A branch link failure affects only that branch, so a cheaper design is acceptable there.',
        'Design: each branch is a <b>star</b> of switches; branches and the data centre are joined by a <b>redundant backbone</b> (partial mesh).',
        'Justification: hybrid combines star’s low cost and easy expansion for 2000 devices with mesh fault tolerance at the critical core.']) });

  Q({ id: 'U1-Q4', unit: '1', kind: 'qb', topic: 'u1-types', marks: '8 Marks · BTL4',
    q: 'Compare LAN, MAN, WAN, and PAN on coverage area, typical speed, ownership, and typical technologies. A logistics company needs networks for a warehouse floor, inter-city depots, a head-office building, and wearable scanners on staff -- recommend a suitable network type for each with justification.',
    cover: ['A comparison table across the four criteria', 'Mapping each logistics component to the most suitable network type', 'Brief justification tied to distance/speed/ownership requirements'],
    a: t(['Criterion', 'PAN', 'LAN', 'MAN', 'WAN'], [['Coverage', 'Few metres', 'Building / campus', 'City', 'Country – globe'], ['Speed', 'Low', 'High', 'Moderate–high', 'Lower per user'], ['Ownership', 'Individual', 'One organisation', 'Provider / city', 'Carriers / ISPs'], ['Technologies', 'Bluetooth', 'Ethernet, Wi-Fi', 'Metro fibre', 'Leased lines, Internet']], null, 'compact') +
      pts(['Warehouse floor → <b>LAN</b>: single site, high speed, company-owned.', 'Inter-city depots → <b>WAN</b>: spans cities; links leased from carriers.', 'Head-office building → <b>LAN</b>: one building, private, fast.', 'Wearable scanners → <b>PAN</b>: a few metres around each worker.']) });

  Q({ id: 'U1-Q5', unit: '1', kind: 'qb', topic: 'u1-delay', marks: '10 Marks · BTL2',
    q: 'During a company’s all-hands video call, participants report audio cutting out and video freezing intermittently, even though the video server is confirmed healthy and routers show growing queue lengths at peak time. Explain the four types of delay a packet experiences at a router, identify which delay type is most likely responsible, and describe its effect on packet loss and throughput.',
    cover: ['Processing, queueing, transmission, propagation delay -- what determines each', 'Behaviour of average queueing delay as traffic intensity approaches 1', 'Why a full queue leads to tail-drop packet loss and reduced effective throughput'],
    a: pts(['<b>Processing delay</b>: checking bit errors and choosing the output link; depends on router speed; usually &lt; 1 ms.',
      '<b>Queueing delay</b>: waiting in the output buffer; depends on the congestion level.',
      '<b>Transmission delay</b> = L/R: pushing all bits onto the link; depends on packet size and link rate.',
      '<b>Propagation delay</b> = d/s: a bit travelling the link; depends on distance and medium.',
      'Most likely cause: <b>queueing delay</b> — queues grow at peak while the server is healthy and distances are unchanged.',
      'As traffic intensity La/R → 1, average queueing delay rises steeply; above 1 it becomes unbounded.',
      'A full buffer drops arriving packets (<b>tail drop</b>) → lost audio/video frames and lower effective throughput.']) });

  Q({ id: 'U1-Q6', unit: '1', kind: 'qb', topic: 'u1-throughput', marks: '7 Marks · BTL3',
    q: 'Explain the relationship between end-to-end throughput and per-link transmission rates on a multi-hop path. Using a numerical example of your own (at least 4 links with different rates), show how the bottleneck link determines throughput, and explain how this changes if two flows share the bottleneck link simultaneously.',
    cover: ['Throughput = min over all links (bottleneck)', 'A worked numeric example with at least 4 differing link rates', 'Effect of a second competing flow sharing the bottleneck -- fair-share reasoning'],
    a: pts(['End-to-end throughput equals the rate of the slowest (<b>bottleneck</b>) link: min(R1, …, Rn).']) +
      steps(['Links 20, 4, 16, 10 Mbps → throughput = 4 Mbps', 'File 25 MB = 2×10⁸ bits → time = 2×10⁸ / 4×10⁶ = 50 s', 'Second flow on the 4 Mbps link → fair share 2 Mbps each', 'Per flow = min(20, 4/2, 16, 10) = 2 Mbps → time doubles to 100 s']) });

  Q({ id: 'U1-Q7', unit: '1', kind: 'qb', topic: 'u1-layers', marks: '10 Marks · BTL2',
    q: 'Describe the 5-layer Internet protocol stack and the encapsulation process, explaining the role of each layer with one example protocol, and illustrate with a diagram showing a message travelling from a sending host through an intermediate router to a receiving host.',
    cover: ['Application, Transport, Network, Link, Physical layers and their roles', 'PDU names at each layer: message, segment, datagram, frame', 'Encapsulation at sender, partial processing at the router (up to network layer), decapsulation at receiver'],
    a: t(['Layer', 'Role', 'Example', 'PDU'], [['Application', 'Supports network applications', 'HTTP', 'Message'], ['Transport', 'Process-to-process delivery', 'TCP', 'Segment'], ['Network', 'Host-to-host routing', 'IP', 'Datagram'], ['Link', 'Transfer between neighbours', 'Ethernet', 'Frame'], ['Physical', 'Bits on the medium', 'Fibre', 'Bits']], null, 'compact') +
      pts(['<b>Encapsulation</b>: each layer adds its header going down — H<sub>t</sub>, then H<sub>n</sub>, then H<sub>l</sub>.', 'The <b>router</b> decapsulates up to the network layer, reads H<sub>n</sub>, and re-encapsulates for the next link.', '<b>Decapsulation</b>: the receiver strips the headers going up and delivers M.', 'Diagram: source stack → router (3 layers) → destination stack.']) });

  Q({ id: 'U1-Q8', unit: '1', kind: 'qb', topic: 'u1-apps', marks: '8 Marks · BTL2',
    q: 'Explain the client-server and peer-to-peer (P2P) network application architectures. Discuss how each handles scalability as the number of users grows, using file distribution as an example.',
    cover: ['Definition and examples of client-server vs P2P', 'Server-side bandwidth bottleneck in client-server file distribution as users grow', 'Self-scaling property of P2P: each peer contributes upload capacity'],
    a: pts(['<b>Client–server</b>: an always-on server with a fixed IP serves clients that initiate contact; clients do not talk directly. Eg: Web, e-mail.',
      '<b>P2P</b>: no always-on server; peers communicate directly, each acting as client and server. Eg: BitTorrent.',
      'Client–server file distribution: the server uploads the file to each of N clients, so time grows <b>linearly with N</b> (server upload is the bottleneck).',
      'P2P distribution: every peer re-uploads chunks it has, so total upload capacity grows with N — <b>self-scaling</b>.',
      'Conclusion: for large N, P2P distribution time levels off while client–server keeps rising.']) });

  Q({ id: 'U1-Q9', unit: '1', kind: 'qb', topic: 'u1-http', marks: '10 Marks · BTL3',
    q: 'Explain the operation of HTTP, covering non-persistent vs persistent connections, and describe cookies and web caching (with a proxy server) using an example.',
    cover: ['Round-trip cost difference between non-persistent and persistent HTTP', 'How cookies maintain state over stateless HTTP', 'How a caching proxy reduces response time and access-link traffic, including conditional GET'],
    a: pts(['HTTP is a <b>stateless</b> client–server protocol over TCP port 80.',
      '<b>Non-persistent</b>: one object per TCP connection → about 2 RTT per object (handshake + request).',
      '<b>Persistent</b> (HTTP/1.1 default): one connection reused → saves a handshake per object; with pipelining all objects take ≈ 1 RTT.',
      '<b>Cookies</b>: server sends Set-Cookie: id → browser stores it → returns Cookie: id on each request → server database recalls the user (cart, login).',
      '<b>Proxy cache</b>: satisfies requests locally → lower response time, less access-link traffic and origin load.',
      '<b>Conditional GET</b>: If-Modified-Since → server replies 304 Not Modified (no body) if the cached copy is fresh.']) });

  Q({ id: 'U1-Q10', unit: '1', kind: 'qb', topic: 'u1-ftp', marks: '7 Marks · BTL2',
    q: 'Explain how FTP transfers files between a client and server, describing the roles of the control connection and the data connection, and contrast this with how HTTP transfers a file as part of a single connection.',
    cover: ['FTP’s separate control (port 21) and data connections', 'Out-of-band control signalling in FTP vs HTTP’s in-band request/response', 'Active vs passive FTP data connection modes'],
    a: pts(['<b>Control connection (port 21)</b>: carries commands (USER, PASS, RETR, STOR); stays open for the session.',
      '<b>Data connection (port 20)</b>: opened for each file or listing, then closed.',
      'FTP sends control <b>out-of-band</b> and keeps state; HTTP sends request and data <b>in-band</b> on one connection and is stateless.',
      '<b>Active FTP</b>: server opens the data connection to the client (PORT) — often blocked by firewalls.',
      '<b>Passive FTP</b>: client opens it to the server (PASV) — firewall/NAT-friendly.']) });

  Q({ id: 'U1-Q11', unit: '1', kind: 'qb', topic: 'u1-email', marks: '10 Marks · BTL2',
    q: 'Explain the SMTP-based email architecture, describing the roles of the user agent, mail server, and SMTP, and explain why POP3/IMAP are additionally needed for a complete email system.',
    cover: ['SMTP’s push-based store-and-forward delivery between mail servers', 'Why a receiving user’s device can’t just run SMTP to fetch mail', 'Key differences between POP3 (simple, download-and-delete) and IMAP (folder management on server)'],
    a: pts(['<b>User agent</b>: composes and reads mail (Gmail, Outlook).',
      '<b>Mail server</b>: holds mailboxes and an outgoing queue; retries if the receiver is down (store-and-forward).',
      '<b>SMTP</b>: push protocol over TCP port 25 that transfers mail between servers.',
      'A user’s device is often offline and cannot run an always-on SMTP server, so mail must be <b>pulled</b> with an access protocol.',
      '<b>POP3</b>: downloads and typically deletes mail; no server folders; single device.',
      '<b>IMAP</b>: keeps mail and folders on the server; synced across devices.']) });

  Q({ id: 'U1-Q12', unit: '1', kind: 'qb', topic: 'u1-dns', marks: '10 Marks · BTL2',
    q: 'Explain the working of DNS: describe the server hierarchy (root, TLD, authoritative, local) and trace both an iterative and a recursive query for resolving a hostname, with a diagram for each.',
    cover: ['Roles of root, TLD, and authoritative servers', 'Step-by-step iterative query diagram', 'Step-by-step recursive query diagram, contrasted with the iterative case'],
    a: pts(['DNS is a distributed, hierarchical database mapping hostnames to IP addresses (UDP 53).',
      '<b>Root</b> servers know the TLD servers; <b>TLD</b> servers handle .com, .edu …; <b>authoritative</b> servers hold an organisation’s records; the <b>local</b> server is the host’s first contact and caches answers.',
      '<b>Iterative</b>: host → local; local asks root (referral) → TLD (referral) → authoritative (IP) → returns IP to host.',
      '<b>Recursive</b>: each server queries the next on behalf of the requester; the answer returns back along the chain.',
      'Contrast: iterative — requester does the chasing; recursive — servers do it, adding load on upper levels.',
      'Draw both sequence diagrams.']) });

  Q({ id: 'U1-Q13', unit: '1', kind: 'qb', topic: 'u1-p2p', marks: '8 Marks · BTL3',
    q: 'Explain the operation of a BitTorrent-style P2P file-sharing system, including chunk exchange, the ‘rarest first’ policy, and the tit-for-tat incentive strategy.',
    cover: ['Torrent/swarm/tracker terminology', 'How rarest-first improves chunk availability across the swarm', 'How tit-for-tat discourages free-riding'],
    a: pts(['<b>Torrent</b>: all peers distributing one file, split into fixed-size chunks (Eg: 256 KB).',
      '<b>Tracker</b>: server listing the peers in a torrent; <b>swarm</b>: the peers exchanging chunks.',
      'A new peer gets a peer list from the tracker, connects to a subset, downloads missing chunks and uploads chunks it holds.',
      '<b>Rarest first</b>: request chunks held by the fewest neighbours first, so rare chunks replicate quickly and are not lost.',
      '<b>Tit-for-tat</b>: upload to the peers sending to you at the highest rate (plus one random peer), so free-riders receive little.']) });

  Q({ id: 'U1-Q14', unit: '1', kind: 'qb', topic: 'u1-cdn', marks: '10 Marks · BTL4',
    q: 'A video streaming platform sees rising buffering complaints as its global user base grows. Explain how a CDN improves streaming performance, and compare the ‘enter deep’ and ‘bring home’ CDN placement strategies. Recommend one for a platform expanding rapidly into rural regions with weak backbone connectivity.',
    cover: ['How proximity to users reduces delay/loss and offloads the backbone', 'Enter-deep: many small clusters close to access networks -- pros/cons', 'Bring-home: fewer, larger clusters at IXPs -- pros/cons', 'A recommendation tied to the rural-connectivity scenario'],
    a: pts(['A <b>CDN</b> stores replicas on distributed servers; the CDN’s DNS directs each user to a nearby server.',
      'Proximity lowers delay and loss and offloads long-haul backbone links; DASH adapts the bit rate.',
      '<b>Enter deep</b>: many small clusters inside access ISPs — lowest delay and highest throughput, but costly to deploy and manage.',
      '<b>Bring home</b>: few large clusters at IXPs — cheaper and easier to maintain, but slightly higher delay.',
      'Recommendation: <b>enter deep</b> — with a weak backbone, content must sit inside the rural access networks.']) });

  /* ===================== UNIT 1 — question bank, Section B ===================== */
  Q({ id: 'UN-1', unit: '1', kind: 'qbnum', topic: 'u1-throughput', marks: 'End-to-end delay',
    q: 'A file of 900,000 bits is sent from a source to a destination through 2 routers (3 links). Each link has a transmission rate of 3 Mbps, length 5000 km, and propagation speed 2.5×10⁸ m/s. Assume negligible queueing and processing delay, and the file is sent as a single packet. Find the total end-to-end delay.',
    a: steps(['d_trans per link = 900,000 / 3×10⁶ = 0.3 s', 'd_prop per link = 5×10⁶ / 2.5×10⁸ = 0.02 s', 'Store-and-forward over 3 links:', 'Total = 3×0.3 + 3×0.02 = 0.9 + 0.06']) + '<p><b>Answer: 0.96 s</b></p>' });
  Q({ id: 'UN-2', unit: '1', kind: 'qbnum', topic: 'u1-throughput', marks: 'Bottleneck throughput',
    q: 'A file of 25 MB (1 MB = 8×10⁶ bits) is sent over a path of 4 links with rates 20 Mbps, 4 Mbps, 16 Mbps, and 10 Mbps. Ignoring propagation/queueing delay, find the throughput and transfer time.',
    a: steps(['Throughput = min(20, 4, 16, 10) = 4 Mbps', 'File = 25 × 8×10⁶ = 2×10⁸ bits', 'Time = 2×10⁸ / 4×10⁶']) + '<p><b>Answer: 4 Mbps; 50 s</b></p>' });
  Q({ id: 'UN-3', unit: '1', kind: 'qbnum', topic: 'u1-delay', marks: 'Traffic intensity',
    q: 'Packets arrive at a router at an average rate of 1200 packets/sec, each 1000 bits long. The outgoing link rate is 1.5 Mbps. Compute the traffic intensity and comment on the queueing delay.',
    a: steps(['La = 1000 × 1200 = 1.2×10⁶ bps', 'La/R = 1.2×10⁶ / 1.5×10⁶ = 0.8']) + '<p><b>Answer: 0.8.</b> Close to 1 → heavily loaded queue; average queueing delay is large and very sensitive to small increases in arrivals. Below 1 → stable (not unbounded).</p>' });
  Q({ id: 'UN-4', unit: '1', kind: 'qbnum', topic: 'u1-delay', marks: 'Trans = prop crossover',
    q: 'A link has rate R = 10 Mbps and length 2000 km, with propagation speed 2×10⁸ m/s. Find the packet size (in bits) at which transmission delay equals propagation delay.',
    a: steps(['d_prop = 2×10⁶ / 2×10⁸ = 0.01 s', 'Set L/R = 0.01 → L = 0.01 × 10×10⁶']) + '<p><b>Answer: L = 100,000 bits (100 kb)</b></p>' });
  Q({ id: 'UN-5', unit: '1', kind: 'qbnum', topic: 'u1-delay', marks: 'Total nodal delay',
    q: 'A router has processing delay 1.5 ms and current queueing delay 4 ms. The outgoing packet is 6000 bits on a 4 Mbps link, and the link length is 1500 km at propagation speed 2×10⁸ m/s. Find the total nodal delay.',
    a: steps(['d_trans = 6000 / 4×10⁶ = 1.5 ms', 'd_prop = 1.5×10⁶ / 2×10⁸ = 7.5 ms', 'd_nodal = 1.5 + 4 + 1.5 + 7.5']) + '<p><b>Answer: 14.5 ms</b></p>' });
  Q({ id: 'UN-6', unit: '1', kind: 'qbnum', topic: 'u1-http', marks: 'HTTP RTT count',
    q: 'A webpage has a base HTML file plus 8 embedded images, all on the same server. Assume RTT = 40 ms between client and server for every request/response pair (transmission time is negligible), and DNS lookup + TCP handshake together take 2 RTTs before the first request. Compare total time to fully load the page using (a) non-persistent HTTP without parallel connections, and (b) persistent HTTP with pipelining.',
    a: steps(['(a) 2 RTT (DNS + handshake) + 1 RTT (base) + 8 × (1 handshake + 1 fetch)', '    = 2 + 1 + 16 = 19 RTT = 19 × 40 = 760 ms', '(b) 2 RTT + 1 RTT (base) + 1 RTT (8 images pipelined) = 4 RTT = 160 ms']) + '<p><b>Answer: 760 ms vs 160 ms</b> — persistent HTTP reuses one TCP connection and avoids repeated handshakes.</p>' });
  Q({ id: 'UN-7', unit: '1', kind: 'qbnum', topic: 'u1-delay', marks: 'Buffer overflow loss',
    q: 'A router’s output buffer can hold 50 packets. It currently has 30 packets queued. Packets arrive at 200 packets/sec and are serviced (transmitted) at 150 packets/sec during a 0.5 second burst. How many packets are dropped during this burst, if any?',
    a: steps(['Net accumulation = 200 − 150 = 50 packets/s', 'Added in 0.5 s = 50 × 0.5 = 25', 'Queue would reach 30 + 25 = 55 > capacity 50', 'Dropped = 55 − 50']) + '<p><b>Answer: 5 packets</b></p>' });
  Q({ id: 'UN-8', unit: '1', kind: 'qbnum', topic: 'u1-throughput', marks: 'Goodput with loss',
    q: 'A server sends 10,000 packets to a client over a lossy link with a 2% packet loss rate. If the link’s raw transmission rate is 5 Mbps and each packet is 1250 bits, estimate the goodput (rate of successfully delivered data), ignoring retransmissions.',
    a: steps(['Delivered = 10,000 × 0.98 = 9800 packets', 'Bits delivered = 9800 × 1250 = 12,250,000', 'Time = (10,000 × 1250) / 5×10⁶ = 2.5 s', 'Goodput = 12,250,000 / 2.5']) + '<p><b>Answer: 4.9 Mbps</b> (2% below the raw rate, matching the loss rate).</p>' });
  Q({ id: 'UN-9', unit: '1', kind: 'qbnum', topic: 'u1-core', marks: 'Circuit vs packet',
    q: 'A file of 5 million bits is sent from host A to host B through 3 links, each of rate 2.5 Mbps. In a circuit-switched network, 5 ms is needed to set up the end-to-end circuit before sending starts. (a) How long does it take using circuit switching? (b) If instead the network is packet-switched and the file is split into 1000 packets of 5000 bits each, sent back-to-back with negligible propagation/queueing delay, how long does it take?',
    a: steps(['(a) 5×10⁶ / 2.5×10⁶ = 2 s; total = 5 ms + 2 s ≈ 2.005 s', '(b) per packet per link = 5000 / 2.5×10⁶ = 2 ms', '    first packet after 3 links = 6 ms', '    remaining 999 × 2 ms = 1.998 s → total ≈ 2.0 s (2.004 s)']) + '<p><b>Answer: both ≈ 2 s.</b> Circuit switching adds 5 ms set-up before any bit is sent; packet switching starts at once and pipelines across links.</p>' });

  /* ===================== UNIT 2 — question bank, Section A ===================== */
  Q({ id: 'U2-Q1', unit: '2', kind: 'qb', topic: 'u2-services', marks: '8 Marks · BTL2',
    q: 'Describe the services provided by the transport layer in general (independent of TCP or UDP specifically), and explain why the transport layer is needed at all given that the network layer already delivers packets host-to-host.',
    cover: ['Process-to-process delivery vs IP’s host-to-host delivery', 'Multiplexing/demultiplexing as a baseline service every transport protocol provides', 'Optional added services: reliability, ordering, flow control, congestion control, and which protocol provides which'],
    a: pts(['The network layer (IP) delivers datagrams <b>host-to-host</b>, on a best-effort basis.',
      'A host runs many processes, so the transport layer extends delivery to <b>process-to-process</b> using port numbers.',
      '<b>Baseline services</b> (UDP and TCP): multiplexing/demultiplexing and error detection (checksum).',
      '<b>Optional services</b> (TCP only): reliable delivery, in-order delivery, flow control, congestion control.',
      'Thus transport can provide guarantees that the unreliable network layer does not.']) });
  Q({ id: 'U2-Q2', unit: '2', kind: 'qb', topic: 'u2-mux', marks: '10 Marks · BTL2',
    q: 'Explain multiplexing and demultiplexing at the transport layer, distinguishing connectionless (UDP) demultiplexing from connection-oriented (TCP) demultiplexing, with examples.',
    cover: ['Role of source/destination port numbers', 'UDP socket identified by (dest IP, dest port) only', 'TCP socket identified by the 4-tuple (src IP, src port, dst IP, dst port)'],
    a: pts(['<b>Multiplexing</b> (sender): gather data from many sockets, add a header with source and destination ports, pass segments to IP.',
      '<b>Demultiplexing</b> (receiver): use header fields to deliver each segment to the correct socket.',
      '<b>UDP demux</b>: socket identified by the 2-tuple (destination IP, destination port); segments from different senders to port 6428 reach the same socket; the source port is the return address.',
      '<b>TCP demux</b>: socket identified by the 4-tuple (source IP, source port, destination IP, destination port); Host A:26145 and Host C:26145 to server port 80 reach different sockets.',
      'Draw: processes → sockets → transport → network, mirrored at the receiver.']) });
  Q({ id: 'U2-Q3', unit: '2', kind: 'qb', topic: 'u2-udp', marks: '8 Marks · BTL2',
    q: 'Describe the UDP segment structure and explain how the UDP checksum is computed, with a worked example. Discuss why an application might deliberately choose UDP despite its lack of reliability.',
    cover: ['Source port, destination port, length, checksum fields', 'One’s complement sum computation over the segment', 'Applications (DNS, streaming, VoIP) that prefer low overhead and low latency over guaranteed delivery'],
    a: pts(['Header = 8 bytes: source port, destination port, length, checksum (16 bits each), followed by data.',
      'Checksum: add all 16-bit words using 1’s-complement addition (wrap carries), then complement the sum.']) +
      steps(['0110011001100000 + 0101010101010101 = 1011101110110101', '+ 1000111100001100 → carry out → wrap → 0100101011000010', 'complement → checksum = 1011010100111101']) +
      pts(['Why UDP: no connection set-up delay, no connection state, small header, application controls timing.', 'Eg: DNS, live streaming, VoIP prefer low latency over guaranteed delivery.']) });
  Q({ id: 'U2-Q4', unit: '2', kind: 'qb', topic: 'u2-rdt1', marks: '10 Marks · BTL3',
    q: 'Starting from an unreliable channel, build up the reliable data transfer protocol family from rdt1.0 to rdt3.0, explaining what specific problem each version solves, with the sender/receiver FSM for each.',
    cover: ['rdt1.0: reliable channel, no work needed', 'rdt2.0: bit errors → ACK/NAK', 'rdt2.1/2.2: handling corrupted ACK/NAK → sequence numbers', 'rdt3.0: lossy channel → timer-based retransmission'],
    a: pts(['<b>rdt1.0</b>: perfect channel; sender sends, receiver delivers; one state each.',
      '<b>rdt2.0</b>: channel may flip bits → checksum + ACK/NAK + retransmission (stop-and-wait, ARQ).',
      '<b>Flaw</b>: a corrupted ACK/NAK leaves the sender unsure; blind resending creates duplicates.',
      '<b>rdt2.1</b>: 1-bit sequence number (0/1) lets the receiver discard duplicates; sender has four states.',
      '<b>rdt2.2</b>: NAK-free — a duplicate ACK for the previous packet acts as a NAK.',
      '<b>rdt3.0</b>: channel may also lose packets → countdown timer; retransmit on timeout (alternating-bit protocol).',
      'Draw the sender/receiver FSMs for each version.']) });
  Q({ id: 'U2-Q5', unit: '2', kind: 'qb', topic: 'u2-gbnsr', marks: '10 Marks · BTL4',
    q: 'A sender-receiver pair communicates over a link with a high bandwidth-delay product. Explain why stop-and-wait performs poorly here, and describe how Go-Back-N and Selective Repeat improve performance. Compare how each protocol handles a single lost packet and out-of-order arrivals.',
    cover: ['Stop-and-wait utilization formula and why it’s low when RTT >> transmission time', 'GBN: sliding window, cumulative ACK, discards out-of-order packets at receiver', 'SR: individual ACKs, receiver buffers out-of-order packets', 'Retransmission cost comparison for a single lost packet in each scheme'],
    a: pts(['Stop-and-wait utilisation U = (L/R) / (RTT + L/R); when RTT ≫ L/R, U is tiny (1 Gbps, 30 ms → 0.027%).',
      '<b>Pipelining</b>: keep up to N unacknowledged packets in flight to fill the RTT.',
      '<b>Go-Back-N</b>: sliding window, cumulative ACKs, one timer; receiver discards out-of-order packets; on a loss, resends the whole window.',
      '<b>Selective Repeat</b>: individual ACKs, timer per packet; receiver buffers out-of-order packets; on a loss, resends only that packet.',
      'Example: packets 10–15, 12 lost → GBN resends 4 (12–15); SR resends 1 (12).']) });
  Q({ id: 'U2-Q6', unit: '2', kind: 'qb', topic: 'u2-rdt2', marks: '7 Marks · BTL2',
    q: 'Explain why sequence numbers alone are not sufficient for reliable delivery over a channel that can both corrupt and lose packets, and describe the specific role that timers play once loss (not just corruption) becomes possible.',
    cover: ['Sequence numbers resolve duplicate/corrupted-ACK ambiguity but not loss', 'Why a receiver can’t distinguish ‘nothing arrived’ from ‘slow arrival’ without a timer at the sender', 'Premature timeout handling and duplicate detection via sequence numbers working together with timers'],
    a: pts(['Sequence numbers let the receiver recognise duplicates caused by corrupted ACK/NAKs.',
      'If a packet or ACK is <b>lost</b>, nothing arrives and the sender waits forever — sequence numbers cannot detect absence.',
      'A sender <b>timer</b> resolves this: on timeout, retransmit.',
      'Without a timer, “nothing arrived” and “slow arrival” are indistinguishable.',
      'A premature timeout creates a duplicate; the receiver discards it by sequence number and re-ACKs — timers and sequence numbers work together.']) });
  Q({ id: 'U2-Q7', unit: '2', kind: 'qb', topic: 'u2-tcp-conn', marks: '10 Marks · BTL2',
    q: 'Explain the TCP segment structure, and describe the three-way handshake and four-way connection termination process with a labelled diagram.',
    cover: ['Key TCP header fields: seq no, ack no, flags, window size', 'SYN, SYN-ACK, ACK sequence with initial sequence numbers', 'FIN/ACK exchange for graceful close (both directions)'],
    a: pts(['Header fields: source/destination ports, <b>sequence number</b> (first byte), <b>ACK number</b> (next byte expected), header length, flags (SYN, ACK, FIN, RST, PSH, URG), <b>receive window</b>, checksum, urgent pointer.',
      '<b>Handshake</b>: client SYN (seq = x) → server SYN-ACK (seq = y, ack = x + 1) → client ACK (ack = y + 1).',
      '<b>Termination</b>: FIN → ACK, then FIN → ACK (one pair per direction).',
      'The side closing last waits in TIMED_WAIT (2 × MSL) in case its final ACK is lost.',
      'Draw the handshake and close as sequence diagrams with states.']) });
  Q({ id: 'U2-Q8', unit: '2', kind: 'qb', topic: 'u2-flow', marks: '10 Marks · BTL4',
    q: 'During the launch of admission-portal registrations, millions of users submit forms at the same time. The servers are healthy, but core routers become congested. One user is on an old laptop with very little free memory, and its TCP receive buffer fills up quickly. Differentiate flow control and congestion control using this scenario -- explain where each problem occurs, who controls it, and which TCP mechanism resolves each.',
    cover: ['Flow control: receiver-side problem (slow laptop, small buffer) controlled by the receiver via advertised rwnd', 'Congestion control: network-side problem (overloaded routers) controlled by the sender via cwnd', 'Effective send rate = min(cwnd, rwnd) -- tie the two together', 'Name the relevant TCP mechanisms for each'],
    a: pts(['<b>Old laptop</b> → <b>flow control</b>: problem at the receiver’s buffer; only this connection is affected.',
      'The receiver advertises a shrinking <b>rwnd</b>; the sender keeps in-flight data ≤ rwnd; rwnd = 0 → sender stops and sends window probes.',
      '<b>Congested core routers</b> → <b>congestion control</b>: problem in the shared network; all flows on the path are affected.',
      'The sender infers congestion from loss (3 duplicate ACKs or timeout) and adjusts <b>cwnd</b> via slow start, AIMD, fast retransmit and fast recovery.',
      'Both apply together: effective send window = <b>min(cwnd, rwnd)</b>.']) });
  Q({ id: 'U2-Q9', unit: '2', kind: 'qb', topic: 'u2-cc-principles', marks: '8 Marks · BTL2',
    q: 'Explain the general principles of congestion control: describe what network congestion is, list its symptoms/costs, and contrast end-to-end congestion control (as used by TCP) with network-assisted congestion control.',
    cover: ['Symptoms: increasing delay, retransmissions, wasted bandwidth on discarded/duplicated packets', 'End-to-end: sender infers congestion from loss/delay signals with no explicit network feedback', 'Network-assisted: routers provide explicit feedback (e.g. congestion notification bits) to end systems'],
    a: pts(['<b>Congestion</b>: too many sources sending too much data too fast for the network.',
      '<b>Costs</b>: large queueing delays; retransmissions; duplicate packets from premature timeouts; upstream capacity wasted on packets later dropped; throughput collapse.',
      '<b>End-to-end</b> (TCP): no feedback from the network; senders infer congestion from loss or rising delay.',
      '<b>Network-assisted</b>: routers give explicit feedback — a congestion bit (SNA, ATM) or an explicit rate (ATM ABR), sent directly or via the receiver.']) });
  Q({ id: 'U2-Q10', unit: '2', kind: 'qb', topic: 'u2-tcp-cc', marks: '10 Marks · BTL2',
    q: 'Explain the phases of TCP congestion control -- slow start, congestion avoidance, fast retransmit, and fast recovery -- with a cwnd-vs-time sawtooth diagram.',
    cover: ['Exponential growth in slow start until ssthresh', 'Linear (additive) growth in congestion avoidance', 'Triple-dup-ACK → fast retransmit + fast recovery (Reno)', 'Resulting sawtooth shape of cwnd over time'],
    a: pts(['<b>Slow start</b>: cwnd starts at 1 MSS and doubles every RTT until it reaches ssthresh.',
      '<b>Congestion avoidance</b>: cwnd grows by 1 MSS per RTT (additive increase).',
      '<b>Fast retransmit</b>: on 3 duplicate ACKs, resend the missing segment without waiting for timeout.',
      '<b>Fast recovery</b> (Reno): ssthresh = cwnd/2, cwnd halved, continue in congestion avoidance.',
      'Timeout: ssthresh = cwnd/2, cwnd = 1 MSS, restart slow start.',
      'Result: AIMD <b>sawtooth</b> — linear rise, halving on each loss. Draw cwnd vs RTT.']) });
  Q({ id: 'U2-Q11', unit: '2', kind: 'qb', topic: 'u2-tcp-cc', marks: '10 Marks · BTL4',
    q: 'Compare TCP’s response to packet loss detected via triple duplicate ACK versus via timeout. Explain why this difference in severity makes sense in terms of what each signal implies about network conditions.',
    cover: ['Triple-dup-ACK implies some packets are still getting through → moderate congestion → halve and continue (fast recovery)', 'Timeout implies a more severe problem (possibly nothing getting through) → conservative response → full reset to slow start with cwnd = 1 MSS', 'ssthresh update rule is the same in both cases (cwnd/2)'],
    a: pts(['<b>3 duplicate ACKs</b>: later segments are still arriving → only moderate congestion → halve cwnd and continue (fast recovery).',
      '<b>Timeout</b>: possibly nothing is getting through → severe congestion → cwnd = 1 MSS, restart slow start.',
      'In both cases ssthresh = cwnd/2.',
      'The response is proportional to the strength of the evidence of congestion.']) });
  Q({ id: 'U2-Q12', unit: '2', kind: 'qb', topic: 'u2-tcp-rdt', marks: '8 Marks · BTL3',
    q: 'Explain how TCP estimates RTT and computes the retransmission timeout interval. Explain why a simple average of SampleRTT values would be insufficient, and describe the role of Karn’s algorithm when a segment is retransmitted.',
    cover: ['EWMA formula for EstimatedRTT with α = 0.125', 'DevRTT capturing variability, with β = 0.25', 'TimeoutInterval = EstimatedRTT + 4×DevRTT', 'Karn’s algorithm: don’t use retransmitted-segment samples for RTT estimation; back off the timer exponentially instead'],
    a: pts(['EstimatedRTT = (1 − α)·EstimatedRTT + α·SampleRTT, α = 0.125 (exponentially weighted moving average).',
      'DevRTT = (1 − β)·DevRTT + β·|SampleRTT − EstimatedRTT|, β = 0.25.',
      'TimeoutInterval = EstimatedRTT + 4·DevRTT.',
      'A simple average reacts slowly to RTT changes and ignores variability; EWMA weights recent samples more.',
      '<b>Karn’s algorithm</b>: ignore RTT samples from retransmitted segments (the ACK is ambiguous) and double the RTO on each consecutive timeout (exponential back-off).']) });
  Q({ id: 'U2-Q13', unit: '2', kind: 'qb', topic: 'u2-services', marks: '10 Marks · BTL4',
    q: 'A video-conferencing company is deciding between TCP and UDP for its real-time call traffic. Analyze the tradeoffs (reliability, ordering, latency, congestion control) and recommend a transport protocol with justification, describing what application-layer mechanisms should compensate for anything given up.',
    cover: ['TCP’s reliability/ordering come at the cost of head-of-line blocking and retransmission delay -- bad for real-time audio/video', 'UDP avoids this but offers no reliability, ordering, or congestion control', 'Recommendation: UDP + application-layer sequencing, and dropping/concealing stale frames rather than retransmitting', 'Need for the application to implement its own light congestion-aware sending rate to remain network-friendly'],
    a: pts(['<b>TCP</b>: reliable and ordered, but retransmissions and head-of-line blocking add delay; late audio/video is useless.',
      '<b>UDP</b>: low latency and no connection state, but no reliability, ordering or congestion control.',
      'Recommendation: <b>UDP</b>.',
      'Application compensates with sequence numbers and timestamps, dropping or concealing late frames instead of retransmitting.',
      'It also adapts its sending rate (bit rate) to stay congestion-friendly.']) });

  /* ===================== UNIT 2 — question bank, Section B ===================== */
  Q({ id: 'TN-1', unit: '2', kind: 'qbnum', topic: 'u2-pipeline', marks: 'Stop-and-wait utilisation',
    q: 'A sender transmits 1500-bit packets over a 1.5 Mbps link with RTT = 45 ms, using stop-and-wait ARQ (ACK transmission time negligible). Find the utilization of the link.',
    a: steps(['d_trans = 1500 / 1.5×10⁶ = 1 ms', 'Time per packet = 1 + 45 = 46 ms', 'U = 1 / 46']) + '<p><b>Answer: ≈ 2.17%</b> — the link is idle over 97.8% of the time.</p>' });
  Q({ id: 'TN-2', unit: '2', kind: 'qbnum', topic: 'u2-pipeline', marks: 'Window size',
    q: 'Using the same link as TN-1 (1.5 Mbps, RTT = 45 ms, packet size 1500 bits), what window size is needed for 100% utilization?',
    a: steps(['N = (RTT + d_trans) / d_trans = (45 + 1) / 1']) + '<p><b>Answer: 46 packets</b></p>' });
  Q({ id: 'TN-3', unit: '2', kind: 'qbnum', topic: 'u2-gbnsr', marks: 'Max window',
    q: 'If sequence numbers are represented using k = 4 bits, find the maximum window size allowed for (a) Go-Back-N and (b) Selective Repeat.',
    a: steps(['GBN: N ≤ 2ᵏ − 1 = 16 − 1 = 15', 'SR: N ≤ 2ᵏ / 2 = 16 / 2 = 8 (avoids old/new packet ambiguity)']) + '<p><b>Answer: GBN 15; SR 8</b></p>' });
  Q({ id: 'TN-4', unit: '2', kind: 'qbnum', topic: 'u2-tcp-cc', marks: 'cwnd growth',
    q: 'A TCP sender starts with cwnd = 1 MSS and ssthresh = 32 MSS. Assuming no loss, trace cwnd for the first 6 RTTs and note when it switches to congestion avoidance.',
    a: steps(['RTT 1–6: 1, 2, 4, 8, 16, 32 (slow start, doubling)', 'cwnd reaches ssthresh = 32 at RTT 6', 'From RTT 7: +1 MSS per RTT (congestion avoidance)']) + '<p><b>Answer: 1 → 2 → 4 → 8 → 16 → 32; additive growth from RTT 7</b></p>' });
  Q({ id: 'TN-5', unit: '2', kind: 'qbnum', topic: 'u2-tcp-rdt', marks: 'RTT estimation',
    q: 'With α = 0.125, β = 0.25, initial EstimatedRTT = 100 ms, DevRTT = 25 ms, and a new SampleRTT of 60 ms, compute the updated EstimatedRTT, DevRTT, and TimeoutInterval.',
    a: steps(['EstimatedRTT = 0.875×100 + 0.125×60 = 87.5 + 7.5 = 95 ms', 'DevRTT = 0.75×25 + 0.25×|60 − 95| = 18.75 + 8.75 = 27.5 ms', 'TimeoutInterval = 95 + 4×27.5 = 95 + 110 = 205 ms']) + '<p><b>Answer: 95 ms · 27.5 ms · 205 ms</b></p>' });
  Q({ id: 'TN-6', unit: '2', kind: 'qbnum', topic: 'u2-udp', marks: 'UDP checksum',
    q: 'Compute the UDP checksum for three 16-bit words: 0001000100010001, 0010001000100010, and 0011001100110011 (using one’s complement addition).',
    a: steps(['0x1111 + 0x2222 + 0x3333 = 0x6666 (no carry-out, no wrap-around)', 'Checksum = complement of 0x6666 = 0x9999']) + '<p><b>Answer: 1001100110011001 (0x9999)</b>; receiver’s sum + checksum = all 1s → no error.</p>' });
  Q({ id: 'TN-7', unit: '2', kind: 'qbnum', topic: 'u2-tcp-cc', marks: 'Average throughput',
    q: 'Using the simplified model where cwnd varies linearly between W_max/2 and W_max, average throughput ≈ 0.75 × W_max / RTT. If W_max = 48,000 bits and RTT = 150 ms, find the average throughput.',
    a: steps(['0.75 × 48,000 = 36,000 bits', '36,000 / 0.15 s = 240,000 bps']) + '<p><b>Answer: ≈ 240 kbps (0.24 Mbps)</b></p>' });
  Q({ id: 'TN-8', unit: '2', kind: 'qbnum', topic: 'u2-tcp-rdt', marks: 'Karn back-off',
    q: 'A TCP sender’s initial retransmission timeout (RTO) is 800 ms. A segment is retransmitted and the retransmission itself also times out twice more in a row before an ACK is received. What is the RTO in effect just before the ACK finally arrives?',
    a: steps(['Karn’s algorithm doubles the RTO on each consecutive timeout (no RTT recomputation)', '1st timeout: 800 → 1600 ms', '2nd consecutive timeout: 1600 → 3200 ms']) + '<p><b>Answer: 3200 ms</b></p>' });
  Q({ id: 'TN-9', unit: '2', kind: 'qbnum', topic: 'u2-gbnsr', marks: 'GBN retransmission',
    q: 'In a Go-Back-N system with window size 6, the sender has sent packets numbered 10–15. Packet 12 is lost, but packets 13, 14, and 15 arrive safely at the receiver (and are discarded, since GBN receivers only accept in-order packets). How many packets must be retransmitted once the sender’s timer for packet 12 expires, and what does this reveal about GBN’s efficiency compared to Selective Repeat on lossy links?',
    a: steps(['GBN receiver discarded 13, 14, 15 (out of order)', 'Timeout for 12 → resend 12, 13, 14, 15', 'Selective Repeat would resend only 12 (13–15 buffered)']) + '<p><b>Answer: 4 packets</b> — GBN wastes bandwidth on lossy links; SR avoids it.</p>' });

  /* ===================== Lecture-slide questions ===================== */
  var L = function (id, unit, topic, q, a) { Q({ id: id, unit: unit, kind: 'lec', topic: topic, q: q, a: a }); };
  L('L1-1', '1', 'u1-http', 'Why does persistent HTTP reduce latency compared to non-persistent HTTP?', pts(['One TCP connection serves all objects, so no extra handshake (1 RTT) per object.', 'With pipelining, requests overlap, saving further RTTs.']));
  L('L1-2', '1', 'u1-apps', 'Which transport protocol would you pick for a live cricket-score push notification service, and why?', pts(['<b>UDP</b> if each update is quickly replaced by the next (timeliness matters most).', '<b>TCP</b> if every update must be delivered. Typical answer: UDP for low latency.']));
  L('L1-3', '1', 'u1-p2p', 'A university wants to distribute a 4 GB OS image to 2,000 labs — suggest P2P or client-server, and why.', pts(['<b>P2P</b>: every lab re-uploads chunks, so capacity grows with the number of labs.', 'A single server would be the upload bottleneck.']));
  L('L1-4', '1', 'u1-dns', 'A student’s browser suddenly redirects to a fake bank site — which DNS attack might this be?', pts(['<b>DNS cache poisoning / spoofing</b>: a false IP mapping in the resolver cache.', 'Defence: DNSSEC-signed records.']));
  L('L1-5', '1', 'u1-email', 'Why would a user checking mail on phone, laptop and tablet prefer IMAP over POP3?', pts(['IMAP keeps mail and folders on the server, synchronised across devices.', 'POP3 downloads and deletes, so other devices miss the mail.']));
  L('L1-6', '1', 'u1-ftp', 'A client is behind a strict firewall — should it use active or passive FTP?', pts(['<b>Passive FTP</b>: the client opens the data connection outward, which the firewall/NAT allows.']));
  L('L2-1', '2', 'u2-mux', 'Why do we need port numbers in addition to IP addresses?', pts(['The IP address identifies the host.', 'The port number identifies the process (socket) on that host.']));
  L('L2-2', '2', 'u2-mux', 'Can a single application use both TCP and UDP?', pts(['Yes, using separate sockets. Eg: DNS uses UDP for queries and TCP for zone transfers.']));
  L('L2-3', '2', 'u2-net-intro', 'Forwarding or routing? (1) A GPS app recalculates the route after a road closure. (2) A core router looks up a destination to pick an output port in under a microsecond. (3) OSPF exchanges link costs every 30 minutes to rebuild paths.', pts(['(1) Routing', '(2) Forwarding', '(3) Routing']));
  L('L2-4', '2', 'u2-net-intro', 'For a live voice call requiring guaranteed low delay, would you choose a VC or datagram network? Justify.', pts(['<b>Virtual circuit</b>: resources reserved along a fixed path give predictable, low delay.']));
  L('L2-5', '2', 'u2-ip', 'Given prefixes /20 and /24 that both match a destination, which one does the router choose, and why?', pts(['The <b>/24</b>: longest prefix matching selects the most specific route.']));
  L('L2-6', '2', 'u2-ip', 'A 3000-byte datagram must cross a link with MTU 1000 bytes. How many fragments result (ignore header overhead)?', pts(['3000 / 1000 = <b>3 fragments</b>.']));
  L('L2-7', '2', 'u2-ip', 'IPv6 removed in-network fragmentation entirely (routers no longer fragment). What design trade-off does this reflect, and what must a sending host do instead?', pts(['Trade-off: simpler, faster routers at line rate.', 'The <b>source host</b> must discover the path MTU and size its packets; oversized packets are dropped with an error message.']));
  L('L2-8', '2', 'u2-internet-routing', 'Why can’t OSPF alone run across the entire Internet?', pts(['<b>Scale</b>: flooding link state to millions of routers never converges.', '<b>Autonomy</b>: each ISP wants its own policy and to hide internal details.']));
  L('L2-9', '2', 'u2-internet-routing', 'In hot-potato routing, which route does a BGP router prefer?', pts(['The route whose NEXT-HOP gateway is <b>cheapest to reach inside its own AS</b>.']));
  L('L2-10', '2', 'u2-bcast', 'What problem does Reverse Path Forwarding solve, and how?', pts(['Problem: duplicate packets and broadcast storms from flooding.', 'Rule: forward only packets that arrive on the shortest path back to the source.']));
  L('L2-11', '2', 'u2-bcast', 'A multicast group has members scattered across a huge WAN. Dense mode or sparse mode — and why?', pts(['<b>Sparse mode</b>: no flooding; routers join explicitly via the rendezvous point.']));
  L('L2-12', '2', 'u2-bcast', 'Why is the Steiner tree rarely used in real multicast protocols, despite being provably optimal?', pts(['Computing it is NP-complete.', 'It needs full network knowledge and recomputation on every join or leave.']));
  L('L3-1', '3', 'u3-addressing', 'Why does the link layer need its own addressing scheme separate from IP addresses?', pts(['IP addresses are configurable and belong to the network layer.', 'The link layer must address a specific adapter for one hop, even for non-IP traffic.']));
  L('L3-2', '3', 'u3-addressing', 'What is the ARP broadcast address? Why must the ARP query be broadcast rather than unicast?', pts(['FF:FF:FF:FF:FF:FF.', 'The sender does not yet know the target’s MAC address, so it must ask every host.']));
  L('L3-3', '3', 'u3-addressing', 'Explain why ARP resolves the default gateway’s MAC address, not the final destination’s, when sending to a host on a different network.', pts(['ARP works only within one LAN.', 'The frame goes first to the router, which repeats ARP on the next link; the destination IP stays the same.']));
  L('L3-4', '3', 'u3-ethernet', 'Explain why Ethernet enforces a minimum frame size, connecting your answer to CSMA/CD.', pts(['Under CSMA/CD the sender must still be transmitting when a collision signal returns.', 'A too-short frame would finish first and the collision would go undetected → minimum 64 bytes.']));
  L('L3-5', '3', 'u3-switches', 'Can a switch ever forward a frame back out the same port it arrived on?', pts(['No — the destination is already on that segment; the switch filters (discards) the frame.']));
  L('L3-6', '3', 'u3-edc', 'Why does CRC use XOR (mod-2) instead of normal binary subtraction?', pts(['XOR has no borrows or carries.', 'This allows simple, fast shift-register hardware.']));
  L('L3-7', '3', 'u3-impair', 'A signal’s power drops from 100 mW to 25 mW. Find the attenuation in dB.', steps(['dB = 10 log₁₀(25/100) = 10 log₁₀ 0.25 = −6.02 dB']) + '<p><b>Answer: −6.02 dB</b> (≈ 6 dB loss)</p>');
  L('L3-8', '3', 'u3-impair', 'The SNR of a channel is 63. Find SNR(dB).', steps(['SNR_dB = 10 log₁₀ 63 = 17.99 dB']) + '<p><b>Answer: ≈ 18 dB</b></p>');
  L('L3-9', '3', 'u3-impair', 'A noiseless channel has a 4000 Hz bandwidth and uses 4 signal levels. Find the maximum bit rate using Nyquist’s formula.', steps(['BitRate = 2 × 4000 × log₂ 4 = 2 × 4000 × 2']) + '<p><b>Answer: 16,000 bps</b></p>');
  L('L3-10', '3', 'u3-impair', 'A channel has a 1 MHz bandwidth and SNR = 63. Find its capacity using Shannon’s formula.', steps(['C = 10⁶ × log₂(1 + 63) = 10⁶ × 6']) + '<p><b>Answer: 6 Mbps</b></p>');
  L('L3-11', '3', 'u3-virt', 'Explain how MPLS forwards packets using labels. How is this different from IP routing?', pts(['MPLS: look up the incoming label and swap it along a pre-set label-switched path (LSP).', 'IP: longest-prefix match on the destination address at every router.']));

  /* ===================== Additional practice (generated) ===================== */
  var X = function (id, unit, topic, q, a) { Q({ id: id, unit: unit, kind: 'extra', topic: topic, q: q, a: a }); };
  X('X2-1', '2', 'u2-ip', 'A router has entries 10.0.0.0/8 → interface A, 10.1.0.0/16 → interface B, 10.1.2.0/24 → interface C. Where do 10.1.2.7, 10.1.9.9 and 10.5.0.1 go?', pts(['10.1.2.7 → <b>C</b> (/24 is the longest match)', '10.1.9.9 → <b>B</b> (/16)', '10.5.0.1 → <b>A</b> (/8)']));
  X('X2-2', '2', 'u2-ip', 'A 2400-byte datagram (20-byte header) crosses a link with MTU 1000 bytes. Give each fragment’s total length, MF flag and offset.',
    steps(['Data = 2400 − 20 = 2380 bytes', 'Max data per fragment = 1000 − 20 = 980 → round down to a multiple of 8 = 976 bytes', 'F1: 976 data → length 996, MF 1, offset 0', 'F2: 976 data → length 996, MF 1, offset 976/8 = 122', 'F3: 2380 − 1952 = 428 data → length 448, MF 0, offset 1952/8 = 244']) + '<p><b>Answer: 3 fragments — 996/996/448 bytes, offsets 0/122/244, MF 1/1/0.</b> Fragment data (except the last) must be a multiple of 8 bytes.</p>');
  X('X2-3', '2', 'u2-routing-algo', 'In a triangle with link costs a–b = 1, b–c = 2, a–c = 5, use the Bellman-Ford equation at a to find Da(c) and the next hop.', steps(['Da(c) = min{ c(a,b) + Db(c), c(a,c) + Dc(c) } = min{ 1 + 2, 5 + 0 }']) + '<p><b>Answer: 3, next hop b</b></p>');
  X('X2-4', '2', 'u2-internet-routing', 'A BGP router learns two routes to a prefix: AS-PATH “AS7 AS3” with local-pref 200, and AS-PATH “AS3” with local-pref 100. Which is chosen?', pts(['Highest local preference is checked first.', 'The <b>local-pref 200</b> route wins, even though its AS-PATH is longer.']));
  X('X3-1', '3', 'u3-edc', 'Compute the CRC bits for D = 110101 with generator G = 101.', steps(['r = 2 → append 2 zeros: 11010100', 'Mod-2 divide by 101 → remainder 11']) + '<p><b>Answer: R = 11; transmit 11010111</b></p>');
  X('X3-2', '3', 'u3-aloha', 'Ten stations share a channel. Which gives higher maximum throughput, pure or slotted ALOHA, and by how much?', pts(['Slotted ALOHA: 36.8% vs pure ALOHA: 18.4%.', 'Slotted is <b>twice</b> as efficient because its vulnerable period is halved.']));
  X('X3-3', '3', 'u3-csma', 'Why can’t Wi-Fi use CSMA/CD?', pts(['A radio cannot listen while transmitting — its own signal swamps reception.', 'Hidden terminals cannot hear each other at all.', 'Hence Wi-Fi avoids collisions (CSMA/CA) instead of detecting them.']));
  X('X3-4', '3', 'u3-switches', 'An empty switch sees, in order: D→A on port 4, A→D on port 1, B→D on port 2. Give the action for each frame and the final table.', pts(['D→A: learn D = 4; A unknown → flood ports 1, 2, 3.', 'A→D: learn A = 1; D known → port 4 only.', 'B→D: learn B = 2; D known → port 4 only.', 'Final table: A → 1, B → 2, D → 4.']));
  X('X3-5', '3', 'u3-impair', 'A channel has B = 1 MHz and SNR = 63. What capacity does Shannon allow, and how many signal levels does Nyquist need to reach it?', steps(['C = 10⁶ × log₂ 64 = 6 Mbps', '6×10⁶ = 2 × 10⁶ × log₂ L → log₂ L = 3 → L = 8']) + '<p><b>Answer: 6 Mbps using 8 levels</b></p>');
})();
