/* Intro spreads: cover, how to use, source inventory, discrepancy & gap log. */
(function () {
  var b = CN.blk, t = CN.table, A = CN.arrows;

  CN.add({
    id: 'cover', unit: '0', group: 'Start here', kicker: '23CSE302 · B.TECH CSE · SEMESTER V',
    title: 'Computer Networks — Exam Study Notebook',
    src: ['Approved CDP_23CSE302 CN.pdf'],
    left:
      '<p class="lead">Source-grounded revision notebook built from every file in the <code>CN_FULL</code> workspace: the approved Course Delivery Plan, Unit 1–3 lecture materials and the mid-term practice question bank.</p>' +
      t(['Course detail', 'From the approved CDP'], [
        ['Course', '23CSE302: Computer Networks (CSE)'],
        ['L-T-P-C', '3-1-2-5 · Semester V / Year III · 2026–27'],
        ['Faculty', 'Dr. Prabu M (course mentor), Ms. Nivethitha V'],
        ['Textbook', 'Kurose &amp; Ross, <i>Computer Networking: A Top-Down Approach</i>, 8th ed., 2021'],
        ['References', 'Tanenbaum (6e) · Peterson &amp; Davie · Forouzan (4e)'],
        ['Evaluation', 'Internal 70 · External 30 (end-semester) · Total 100']
      ], null, 'compact') +
      '<h2>Course outcomes</h2>' +
      t(['CO', 'Outcome (CDP wording, abridged)', 'Notebook section'], [
        ['CO1', 'Architectural components of networks; mathematical foundations for computational problems.', 'Unit 1: edge, core, delay'],
        ['CO2', 'Network application services and protocols.', 'Unit 1: application layer'],
        ['CO3', 'Data transfer mechanisms, buffer management, flow handling.', 'Unit 2: transport layer'],
        ['CO4', 'Routing protocols under topology change.', 'Unit 2: network layer'],
        ['CO5', 'Error handling; network access protocols for LAN design.', 'Unit 3: link layer'],
        ['CO6', 'Virtualization and data-centric networking.', 'Unit 3: physical, MPLS, SDN'],
      ], null, 'compact'),
    right:
      '<h2 style="margin-top:0">Approved syllabus (CDP)</h2>' +
      '<div class="cols-2">' +
      '<div class="card"><h4>Unit 1</h4><p class="small">Network edge, network core, topology, types of networks, delay/loss/throughput, protocol layers and service models. Application layer: Web &amp; HTTP, FTP, e-mail, DNS, P2P, video streaming &amp; CDNs.</p></div>' +
      '<div class="card"><h4>Unit 2</h4><p class="small">Transport: mux/demux, UDP, reliable data transfer, TCP, congestion control. Network: VC &amp; datagram networks, inside a router, IP forwarding &amp; addressing, routing algorithms, Internet routing, broadcast &amp; multicast.</p></div>' +
      '<div class="card"><h4>Unit 3</h4><p class="small">Link layer services, error detection &amp; correction, multiple access, link-layer addressing, Ethernet, switches. Physical layer: signals, media, noise, attenuation, SNR. Link virtualization, MPLS, SDN. Case study: data center networking.</p></div>' +
      '</div>' +
      '<h2>How to use</h2>' +
      A([
        ['Topic page', 'each topic reads like a short article: What is it → How it works → types → pros/cons → example → comparison, then practice questions.'],
        ['Views', 'Article view (scrolling, default) or Notebook view (fixed pages) — toggle with the two-page icon in the sidebar.'],
        ['Navigate', '← / → keys, the buttons at the bottom, or the contents panel.'],
        ['Search', 'press <b>/</b>; searches text, diagram labels and answers.'],
        ['Practice', 'attempt first, then open the answer. Tick “Mark spread as reviewed” to track progress (saved in this browser only).'],
        ['Print / PDF', 'printer icon → this spread, this unit, or everything. Answers print expanded.']
      ]) +
      '<h3>Block legend</h3>' +
      '<div class="legend-grid">' +
      b('def', '<p>Answer-ready wording.</p>') +
      b('work', '<p>Step-by-step mechanism.</p>') +
      b('ex', '<p>Scenario or application.</p>') +
      b('take', '<p>The point to remember.</p>') +
      b('mistake', '<p>A mark-losing trap.</p>') +
      b('flag', '<p>Discrepancy or gap in sources.</p>') +
      b('supp', '<p>Added for clarity; not in slides.</p>') +
      b('examiner', '<p>How a scenario hides the concept.</p>') +
      '</div>' +
      '<h3>Question labels</h3>' +
      A([
        ['<span class="badge qb">Question bank</span>', 'exact wording from <i>CN_Practice_QuestionBank.pdf</i>.'],
        ['<span class="badge lec">Lecture slides</span>', 'question printed on a lecture slide.'],
        ['<span class="badge extra">Additional practice</span>', 'newly written for this notebook; not an official question.']
      ])
  });

  CN.add({
    id: 'sources', unit: '0', group: 'Start here', kicker: 'PROVENANCE',
    title: 'Source inventory & discrepancy log',
    src: ['All 21 files in CN_FULL'],
    left:
      '<p>All 21 files were opened and their text extracted (PDF via <code>pdftotext</code>; PPTX/DOCX via <code>python-pptx</code>/<code>python-docx</code>, including tables and notes). <b>Every file was readable.</b> Image-only slides yield no text; their content is covered by slide titles and the parallel decks.</p>' +
      t(['File', 'Used for'], [
        ['<b>Approved CDP_23CSE302 CN.pdf</b>', 'Syllabus scope, COs, unit boundaries'],
        ['<b>CN_Practice_QuestionBank.pdf</b>', '27 descriptive + 18 numerical questions (Units 1–2)'],
        ['Unit-1/ComputerNetworks_Unit1_Lecture1 (1).pdf', 'Internet, edge, core, delay, layers'],
        ['Unit-1/CN_Unit1_PartA.pdf', 'Edge, core, topology, network types, delay, layers, security, history'],
        ['Unit-1/Chapter_1 (The Internet-…Core).pdf', 'Kurose ch. 1: access, media, switching, delay, layering, security'],
        ['Unit-1/CN_Unit1_PartB.pdf', 'HTTP, FTP, e-mail, DNS, P2P, video/CDN'],
        ['Unit-1/CN_Unit1_PartB Extended.pdf', 'Sockets, status codes, HTTPS, MIME, DNS records &amp; security, DASH'],
        ['Unit-2/Transport Layer Services- Multiplexing….pptx', 'Transport role, ports, UDP/TCP demux'],
        ['Unit-2/CN_TransportLayer_Intro_UDP_RDT.pdf', 'Services, mux/demux, UDP, checksum, rdt1.0–3.0, pipelining'],
        ['Unit-2/Connectionless Transport - UDP, …RDT.pptx', 'UDP header, rdt FSMs, rdt3.0 scenarios, GBN/SR'],
        ['Unit-2/Reliable_Data_Transfer_Flipped_Classroom.docx', 'Utilization, window size, GBN vs SR'],
        ['Unit-2/CN Numerical questions.docx', '7 worked numericals + formula sheet'],
        ['Unit-2/Connection-Oriented Transport, Congestion Control.pptx', 'TCP segment, RTT, flow control, handshake, congestion control'],
        ['Unit-2/Flow_Control_vs_Congestion_Control (1).pptx', 'Prime Day case study, rwnd vs cwnd'],
        ['Unit-2/Network_Layer_Lecture.pdf', 'VC vs datagram, router, IPv4, CIDR, LPM, fragmentation'],
        ['Unit-2/Internet Protocol - Routing Algorithms….pdf', 'Dijkstra, Bellman-Ford, RIP, OSPF, BGP, multicast, PIM'],
        ['Unit-2/Routing_Broadcast_Multicast.pdf', 'AS, OSPF areas, BGP selection, RPF, IGMP'],
        ['Unit-3/Unit3_LinkLayer_.pdf', 'Link services, framing, parity, checksum, CRC'],
        ['Unit-3/Unit3_LinkLayer__2.pdf', 'MAC protocols, MAC/ARP, Ethernet, switches, physical basics'],
        ['Unit-3/Multiple Access Protocols.pdf', 'TDMA/FDMA, ALOHA, CSMA/CD/CA, polling, token'],
        ['Unit-3/Unit3_MACAddressing_Ethernet.pdf', 'MAC address, ARP, Ethernet frame, self-learning'],
        ['Unit-3/Unit3_PhysicalLayer_Virtualization_SDN.pdf', 'Signals, dB, SNR, Nyquist, Shannon, media, MPLS, SDN'],
        ['<i>GeeksforGeeks — Computer Networks articles (web)</i>', 'Secondary reference for coverage gaps only; additions are paraphrased and labelled “Also on GFG (supplementary)”'],
      ], null, 'compact') +
      b('flag', '<p>Lab experiments and Cisco NetAcad modules listed in the CDP (network commands, sockets, DHCP/DNS/HTTP servers, switch/router/VLAN/NAT configuration) are practical work; no lab handouts were in the workspace, so they are not covered.</p>', 'Scope note'),
    right:
      '<h2 style="margin-top:0">Gaps & discrepancies</h2>' +
      '<p class="small">Each item is repeated as a <b>Source note</b> on the relevant spread. Where sources differ, both versions are shown.</p>' +
      t(['#', 'Where', 'Finding'], [
        ['G1', 'Question bank', { k: 'Covers <b>Unit 1 and the transport half of Unit 2 only</b> (mid-term bank).' }],
        ['G2', 'CDP Unit 3', { k: '“Data Center Networking” case study has <b>no lecture file</b>; a brief supplementary page is provided.' }],
        ['G3', 'QB Q12, TN-8', '<b>Karn’s algorithm</b> appears only in the question bank, not in any lecture deck.'],
        ['D1', 'Port ranges', 'Transport PDF: 1024–65535 dynamic client ports. Mux PPTX: 1024–49151 registered; 49152–65535 dynamic.'],
        ['D2', 'Fast recovery', 'TCP deck: halve cwnd (+3 MSS). Numerical sheet &amp; QB: cwnd = ssthresh.'],
        ['D3', 'HTTP numerical', 'Part B Ext: persistent without pipelining (1 RTT per object). QB UN-6: persistent with pipelining (1 RTT for all images).'],
        ['D4', 'GBN window', 'QB TN-3: N ≤ 2<sup>k</sup> − 1. RDT docx table: “seq space ≥ window” (looser). Use the QB bound.'],
        ['D5', 'LPM example', 'PDF says bits “differ at bit 22”; correct is bit 21 (first 20 match). Answer unchanged.'],
        ['D6', 'Dijkstra', 'PDF edge list says x–y = 2; its own trace needs x–y = 1 (as in Kurose). Trace followed.'],
        ['D7', 'LS complexity', 'PDF: “O(n)”. Kurose textbook: O(n²).'],
        ['D8', 'SNR example', 'PDF states noise = 1 mW but computes with 1 µW (SNR 10,000 = 40 dB).'],
        ['D9', 'Edition', 'Network_Layer_Lecture cites Kurose 6e; CDP prescribes 8e.'],
        ['D10', 'DevRTT', 'QB and numerical sheet use the <i>updated</i> EstimatedRTT in DevRTT; follow this course convention.'],
        ['D11', 'Numerical Q6', 'ssthresh = 19/2 given as “9 or 10”; rounding convention left open.'],
      ], null, 'compact')
  });
})();
