import type { Pillar } from './types'

export const pillar2: Pillar = {
  id: 'networking',
  title: 'Pillar 2 — Networking & Web',
  topics: [
    {
      id: 'osi-model-101',
      title: 'The OSI Model 101',
      depth: 'Layers 1 to 7 and how data actually travels',
      content: 'OSI (Open Systems Interconnection) Model adalah kerangka konseptual 7 lapis tentang bagaimana sistem jaringan berkomunikasi. Ini mental model wajib untuk networking.\n\n**Layer 1 (Physical):** Kabel fisik, fiber optik, sinyal WiFi (Bit: 1 dan 0).\n**Layer 2 (Data Link):** Komunikasi antar *node* yang berdekatan di jaringan yang sama menggunakan MAC Address (Switch). Unit: Frame.\n**Layer 3 (Network):** Routing data melintasi berbagai jaringan di seluruh dunia menggunakan IP Address (Router). Unit: Packet.\n**Layer 4 (Transport):** Memastikan data sampai ke port aplikasi yang benar. Di sinilah **TCP** (andal, berurutan) dan **UDP** (cepat, fire-and-forget) beroperasi. Unit: Segment.\n**Layer 5 (Session) & 6 (Presentation):** Menjaga sesi komunikasi dan format data (enkripsi SSL/TLS sering dianggap di sini atau antara L4/L7).\n**Layer 7 (Application):** Aplikasi itu sendiri. Di sinilah **HTTP, gRPC, WebSocket, SMTP** beroperasi.\n\n**L4 vs L7 Load Balancer:** L4 LB (seperti AWS NLB) hanya melihat IP dan Port (sangat cepat, buta terhadap isi data). L7 LB (seperti AWS ALB atau Nginx) bisa melihat isi HTTP Header (bisa merouting ke server berbeda berdasarkan URL `/api` atau `/images`).',
      why: 'Saat API Anda lambat, masalahnya bisa di L7 (query lambat), di L4 (TCP handshake lambat), atau L3 (routing internet/DNS bermasalah). Memahami OSI Model memandu proses *troubleshooting* dari atas ke bawah.',
      mistake: 'Mencoba melakukan load balancing pada trafik gRPC menggunakan L4 Load Balancer klasik. gRPC menahan koneksi TCP tetap hidup (multiplexing). L4 LB hanya melakukan balance pada awal TCP connection, sehingga semua traffic gRPC akan menumpuk di satu server backend. Harus menggunakan L7 LB.',
      content_casual: 'Kalau API lo lemot, nyalahin kodenya itu gampang. Tapi engineer kelas kakap bakal ngecek pipanya dulu. OSI Model itu mental model wajib buat ngebayangin gimana data lo jalan dari kabel ke layar.\n\n**Layer 1-3 (Infrastruktur Fisik & Routing):** Di bawah itu ada kabel optik (L1), Switch buat lokal (L2), dan Router pencari jalan antar negara pakai IP Address (L3).\n**Layer 4 (Transport):** Pintu masuk. Di sini ada TCP yang cerewet nanyain "paketnya utuh nggak?" (handshake lambat, tapi garansi) dan UDP yang main lempar aja (super cepat buat game/video).\n**Layer 7 (Application):** HTTP, WebSocket, gRPC ada di sini. Di sini data udah punya bentuk dan makna.\n\n**Load Balancer L4 vs L7:** L4 LB (kayak AWS NLB) cuma lihat IP/Port terus langsung oper. Super enteng, buta isi data. L7 LB (Nginx/ALB) ngebongkar amplop HTTP lo, ngecek URL path `/api` ke backend A, `/images` ke S3. Pinter, tapi makan CPU.',
      why_casual: 'Waktu server production lo down, lo bakal bingung: "Ini karena koneksi putus (L4) atau query DB gue yang nyangkut (L7)?". Paham OSI Model itu kunci utama buat ngerti log infrastructure dan nentuin bottleneck ada di mana.',
      mistake_casual: 'Nge-load balance traffic gRPC pakai L4 Load Balancer klasik. Karena gRPC cuma bikin satu koneksi TCP panjang (multiplexing), L4 cuma jalan di awal doang! Akibatnya semua *traffic* lo numpuk muntah di satu server backend yang sama. Wajib pake L7 LB!',
      interview: [
        {
          q: 'Jelaskan perbedaan mendasar antara Layer 4 Load Balancer dan Layer 7 Load Balancer.',
          a: 'L4 beroperasi di level Transport (TCP/UDP). Ia tidak tahu apa isi pesan (tidak bisa baca HTTP header, path, cookies). Ia hanya merouting trafik berdasarkan IP dan Port. Keunggulannya: sangat cepat dan memakan resource sangat kecil. L7 beroperasi di level Application (HTTP). Ia menghentikan trafik, membaca isi pesan (headers, URL path), baru memutuskan merouting ke mana. Ia bisa melakukan SSL Termination, caching, dan routing spesifik. Kelemahannya: memakan CPU lebih besar.'
        }
      ],
      code: '// L4 Load Balancer Logic (Pseudo)\nif (request.port === 80) routeTo(ServerA_IP)\n\n// L7 Load Balancer Logic (Pseudo)\nif (request.path === "/api/users") routeTo(UserService_IP)\nif (request.cookie.includes("admin=true")) routeTo(AdminPool_IP)'
    },
    {
      id: 'cors-and-auth-101',
      title: 'CORS & Auth Fundamentals 101',
      depth: 'Same-Origin Policy, Preflight, and Stateful Sessions',
      content: 'Sebelum pusing dengan JWT dan OAuth, pahami batasan paling dasar di browser.\n\n**SOP & CORS:** Browser memiliki mekanisme keamanan *Same-Origin Policy (SOP)*. Script di `domain-a.com` dilarang membaca data dari `domain-b.com`. Tapi seringkali kita butuh akses tersebut (misal frontend dan backend pisah domain). Solusinya: **CORS (Cross-Origin Resource Sharing)**. Server `domain-b.com` harus mengirimkan header `Access-Control-Allow-Origin: https://domain-a.com`.\n**Preflight Request:** Jika request Anda kompleks (misal menggunakan metode PUT/DELETE atau header kustom seperti `Authorization`), browser akan mengirimkan request `OPTIONS` (Preflight) terlebih dahulu untuk bertanya ke server "Bolehkah saya mengirim request ini?". Jika server menjawab "Boleh", baru request aslinya dikirim.\n\n**Stateful Sessions vs Stateless:**\n- **Session (Stateful):** User login -> Server menyimpan data user di memory/DB dan memberikan `Session ID` ke browser -> Browser menyimpan di *Cookie* dan otomatis mengirimkannya di request berikutnya. Kelemahan: Jika server di-restart atau user masuk ke server lain (load balancing), session hilang (kecuali pakai Redis).\n- **Token (Stateless):** Server tidak menyimpan apa-apa. Semua data user dienkripsi/di-sign ke dalam Token (JWT) dan diberikan ke klien. Klien mengirimkannya lewat header. Skalabilitas tinggi, tapi token sulit di-revoke/dibatalkan sebelum expired.',
      why: 'CORS error adalah mimpi buruk paling umum bagi web developer baru. Paham bahwa CORS adalah mekanisme browser (bukan server) akan mengubah cara Anda men-debug. Memahami Session vs Token adalah akar dari semua perdebatan arsitektur autentikasi.',
      mistake: 'Mengira bahwa men-disable CORS di server berarti membuat server aman. Salah! CORS adalah proteksi untuk *client/browser*. Script bot (curl, postman) mengabaikan aturan CORS dan bisa menembak server Anda kapan saja jika tidak dilindungi autentikasi.',
      content_casual: 'Sebelum ngehalu ngebangun arsitektur Microservices + OAuth, lo wajib paham hukum rimba di dalam browser (CORS) dan cara ngenalin user lo.\n\n**SOP & CORS:** Browser itu paranoid. Dia punya *Same-Origin Policy (SOP)* yang ngelarang script di `domain-A` maling data dari `domain-B`. Kalau lo beneran mau nyambungin Frontend Beda Domain ke Backend lo, lo butuh **CORS**. Intinya backend lo harus ngasih stempel *"Gue izinin domain-A akses"*. Kalau requestnya aneh-aneh (bukan GET biasa), browser bakal nembak request `OPTIONS` (Preflight) dulu nanya izin.\n\n**Stateful (Session) vs Stateless (Token):**\n- **Session:** Lo masuk, server nyatet di buku (Redis/Memory), terus ngasih lo KTP (Session ID) di Cookie. Tiap request, lo bawa KTP itu. Kalau server restart, catetan ilang = lo ke-logout.\n- **Token (JWT):** Server males nyatet. Dia ngasih lo KTP digital yang udah di-stempel rahasia (JWT). Lo kirim Token itu terus. Skalabel banget buat microservice, tapi PR gedenya: Token ini nggak bisa ditarik balik sebelum *expired*!',
      why_casual: 'CORS error di console merah-merah itu musuh abadi junior dev. Kalau lo sadar CORS itu cuma proteksi browser (bukan server lo yang error), lo bakal ketawa ngedebugnya. Debat Session vs Token juga akar perkelahian engineer tiap milih arsitektur autentikasi.',
      mistake_casual: 'Menghindari CORS error di *production* dengan pasang `Access-Control-Allow-Origin: *`. Ini sama aja buka gembok pintu rumah lebar-lebar. Web apapun di dunia bisa bikin API request atas nama user lo yang lagi login di browser!',
      interview: [
        {
          q: 'Kenapa tiba-tiba browser mengirimkan method OPTIONS sebelum request POST saya?',
          a: 'Itu adalah Preflight Request dari mekanisme CORS. Browser melakukannya untuk request yang "tidak sederhana" (non-simple request), seperti mengandung header "Authorization" atau "Content-Type: application/json". Tujuannya untuk memverifikasi apakah server mengizinkan request tersebut dari origin domain saat ini. Server harus merespon OPTIONS dengan status 200/204 dan header CORS yang sesuai.'
        }
      ],
      code: '// Typical Express CORS Middleware\napp.use((req, res, next) => {\n  // Who is allowed to access\n  res.header("Access-Control-Allow-Origin", "https://myfrontend.com");\n  // What methods are allowed\n  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");\n  // What headers the frontend can send\n  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");\n\n  // Handle preflight immediately\n  if (req.method === "OPTIONS") return res.sendStatus(200);\n  next();\n});'
    },
    {
      id: 'tcp-udp-dns',
      title: 'TCP vs UDP & DNS Resolution',
      depth: 'TCP 3-way handshake, congestion control, UDP trade-offs, DNS lifecycle',
      content: `Setiap request HTTP berjalan di atas protokol transport (TCP/UDP) dan diawali dengan DNS resolution. Memahami layer ini membedakan engineer biasa dari engineer yang bisa mendebug high-latency issues.

**DNS Resolution:** Sebelum TCP connect, browser harus tahu IP. Alurnya: Browser Cache → OS Cache → Router Cache → ISP Resolver → Root Server → TLD Server → Authoritative Name Server. Di production, DNS resolution time bisa jadi bottleneck. Solusinya: DNS caching, menggunakan GeoDNS/Anycast untuk mengarahkan user ke IP terdekat.

**TCP (Transmission Control Protocol):** Connection-oriented dan reliable. Memiliki jaminan urutan data dan retransmission jika paket hilang. 
1. **3-Way Handshake:** (SYN, SYN-ACK, ACK). Memakan waktu 1.5 RTT (Round Trip Time) HANYA untuk establish koneksi sebelum data dikirim.
2. **Congestion Control & Slow Start:** TCP tidak langsung mengirim data pada bandwidth penuh. Ia memulai pelan-pelan (Slow Start) dan perlahan menaikkan window size sampai packet loss terjadi.
3. **Head-of-Line (HoL) Blocking:** Jika satu paket hilang, TCP akan menghentikan seluruh stream data sampai paket itu dikirim ulang dan diterima.

**UDP (User Datagram Protocol):** Connectionless, tidak ada jaminan sampai (fire and forget), tidak berurutan, tidak ada handshake. Sangat cepat. Digunakan untuk video streaming, gaming, atau statsd/metrics logging.

**HTTP/3 & QUIC:** Berjalan di atas UDP, bukan TCP! QUIC mengimplementasikan reliability di user-space, menghilangkan TCP HoL blocking, dan memungkinkan 0-RTT handshake untuk TLS resumption.`,
      why: `Saat API lo lambat tapi log server menunjukkan execution time cepat, masalahnya ada di network. Apakah itu TCP handshake overhead karena connection pooling tidak jalan? Apakah packet loss menyebabkan TCP backoff? Lo nggak bisa nge-debug ini kalau nggak paham layer 4 (Transport).`,
      mistake: `Mengirim metrics/telemetry data dari app server ke monitoring system (seperti StatsD/Datadog) menggunakan TCP. Jika monitoring server down atau network lambat, TCP akan memblokir app server atau menghabiskan resources untuk retries. Gunakan UDP untuk telemetry — kehilangan beberapa data point lebih baik daripada aplikasi mati.`,
      content_casual: `Setiap request HTTP berjalan di atas protokol transport (TCP/UDP) dan diawali dengan DNS resolution. Memahami layer ini membedakan engineer biasa dari engineer yang bisa mendebug high-latency issues.

**DNS Resolution:** Sebelum TCP connect, browser harus tahu IP. Alurnya: Browser Cache → OS Cache → Router Cache → ISP Resolver → Root Server → TLD Server → Authoritative Name Server. Di production, DNS resolution time bisa jadi bottleneck. Solusinya: DNS caching, menggunakan GeoDNS/Anycast untuk mengarahkan user ke IP terdekat.

**TCP (Transmission Control Protocol):** Connection-oriented dan reliable. Memiliki jaminan urutan data dan retransmission jika paket hilang. 
1. **3-Way Handshake:** (SYN, SYN-ACK, ACK). Memakan waktu 1.5 RTT (Round Trip Time) HANYA untuk establish koneksi sebelum data dikirim.
2. **Congestion Control & Slow Start:** TCP tidak langsung mengirim data pada bandwidth penuh. Ia memulai pelan-pelan (Slow Start) dan perlahan menaikkan window size sampai packet loss terjadi.
3. **Head-of-Line (HoL) Blocking:** Jika satu paket hilang, TCP akan menghentikan seluruh stream data sampai paket itu dikirim ulang dan diterima.

**UDP (User Datagram Protocol):** Connectionless, tidak ada jaminan sampai (fire and forget), tidak berurutan, tidak ada handshake. Sangat cepat. Digunakan untuk video streaming, gaming, atau statsd/metrics logging.

**HTTP/3 & QUIC:** Berjalan di atas UDP, bukan TCP! QUIC mengimplementasikan reliability di user-space, menghilangkan TCP HoL blocking, dan memungkinkan 0-RTT handshake untuk TLS resumption.`,
      why_casual: `Saat API lo lambat tapi log server menunjukkan execution time cepat, masalahnya ada di network. Apakah itu TCP handshake overhead karena connection pooling tidak jalan? Apakah packet loss menyebabkan TCP backoff? Lo nggak bisa nge-debug ini kalau nggak paham layer 4 (Transport).`,
      mistake_casual: `Mengirim metrics/telemetry data dari app server ke monitoring system (seperti StatsD/Datadog) menggunakan TCP. Jika monitoring server down atau network lambat, TCP akan memblokir app server atau menghabiskan resources untuk retries. Gunakan UDP untuk telemetry — kehilangan beberapa data point lebih baik daripada aplikasi mati.`,
      interview: [
        {
          q: 'Apa itu TCP Slow Start dan bagaimana pengaruhnya terhadap performa API?',
          a: 'TCP Slow Start adalah mekanisme di mana TCP memulai koneksi baru dengan mengirim data dalam jumlah kecil (biasanya 10 segment), lalu melipatgandakan jumlahnya (exponential growth) setelah menerima ACK, sampai mencapai network capacity. Pengaruhnya: untuk request API yang datanya kecil dan short-lived (seperti REST calls biasa), performanya selalu dibatasi oleh Slow Start, bukan bandwidth maksimal network. Inilah mengapa HTTP Keep-Alive (me-reuse koneksi TCP yang sudah "hangat" / window size besar) sangat krusial untuk performa API.'
        },
        {
          q: 'Mengapa HTTP/3 berpindah dari TCP ke UDP?',
          a: 'HTTP/2 menggunakan TCP. Masalah utamanya adalah TCP Head-of-Line (HoL) Blocking. HTTP/2 me-multiplex banyak HTTP request ke dalam SATU koneksi TCP. Jika satu paket TCP hilang di tengah jalan, OS akan menahan seluruh byte stream setelahnya sampai paket itu di-retransmit, sehingga SEMUA HTTP request di koneksi itu ikut macet, meskipun paket mereka sendiri sudah sampai. HTTP/3 menggunakan QUIC di atas UDP. QUIC mengelola stream independen: jika paket untuk Stream A hilang, hanya Stream A yang menunggu, Stream B dan C tetap diproses. Selain itu, QUIC menggabungkan TCP handshake dan TLS handshake menjadi lebih efisien (bisa 0-RTT).'
        }
      ],
      code: `// DIAGNOSING NETWORK WITH CURL
// curl -w "@curl-format.txt" -o /dev/null -s "https://api.github.com"
//
// curl-format.txt:
// time_namelookup:  %{time_namelookup}s
// time_connect:  %{time_connect}s        (TCP Handshake)
// time_appconnect:  %{time_appconnect}s  (TLS Handshake)
// time_pretransfer:  %{time_pretransfer}s
// time_starttransfer:  %{time_starttransfer}s (TTFB)
// time_total:  %{time_total}s
//
// Output example:
// time_namelookup:  0.035s (DNS took 35ms)
// time_connect:  0.075s    (TCP took 40ms)
// time_appconnect:  0.155s (TLS took 80ms)
// time_starttransfer:  0.250s (Server processing took 95ms)`
    },
    {
      id: 'http-internals',
      title: 'HTTP/S, TLS & the Full Request Lifecycle',
      depth: 'DNS, TCP, TLS 1.3, HTTP/2, HTTP/3',
      image: '/illustrations/http.png',
      content: `Ketika user mengetik "https://app.com", serangkaian operasi jaringan terjadi sebelum satu byte HTML terkirim.

**Fase 1 — DNS Resolution:** Browser cek cache lokal. Jika miss, query ke Recursive Resolver (biasanya dari ISP atau 8.8.8.8). Resolver melakukan iterative query: Root Nameserver → TLD Nameserver → Authoritative Nameserver (menyimpan record A: IP address). Result di-cache sesuai TTL. Total: 20-120ms jika uncached.

**Fase 2 — TCP Three-Way Handshake:** Client SYN → Server SYN-ACK → Client ACK. Satu RTT terbuang sebelum satu byte data bisa dikirim. Ini kenapa HTTP persistent connections (Keep-Alive) sangat penting.

**Fase 3 — TLS 1.3 Handshake:** TLS 1.2 membutuhkan 2 RTT. TLS 1.3 dioptimasi menjadi 1 RTT. Bahkan mendukung "0-RTT resumption" — jika client pernah connect sebelumnya, bisa mengirim data langsung di SYN pertama. Proses: client kirim client_hello + key_share. Server pilih cipher, kirim sertifikat + Finished. Client verify sertifikat, kirim Finished. Sesi terenkripsi dimulai.

**HTTP Versions:** HTTP/1.1: satu request per koneksi (kecuali pipelining yang jarang digunakan). Browser membuka 6 koneksi TCP paralel per domain. HTTP/2: multiplexing — banyak request/response dalam satu TCP connection, header compression (HPACK). HTTP/3: mengganti TCP dengan QUIC (berbasis UDP). Mengeliminasi head-of-line blocking di transport layer. Lebih bagus untuk jaringan mobile dengan packet loss karena QUIC bisa recovery lebih cepat per-stream.`,
      why: `Pemahaman network stack ini berguna untuk debugging mengapa halaman lambat (bottleneck di DNS? TCP handshake? TTFB?), mengoptimasi response time (preconnect, HTTP/2, CDN), dan merancang API yang resilient (timeout strategy, retry dengan exponential backoff, circuit breaker).`,
      mistake: `Tidak memahami bahwa setiap koneksi TCP baru itu mahal. Membuat koneksi HTTP baru untuk setiap request ke microservice lain (tanpa connection pooling) adalah bottleneck paling umum di backend Node.js. Gunakan http.Agent dengan keepAlive: true, atau undici Pool.`,
      content_casual: `Ketika user mengetik "https://app.com", serangkaian operasi jaringan terjadi sebelum satu byte HTML terkirim.

**Fase 1 — DNS Resolution:** Browser cek cache lokal. Jika miss, query ke Recursive Resolver (biasanya dari ISP atau 8.8.8.8). Resolver melakukan iterative query: Root Nameserver → TLD Nameserver → Authoritative Nameserver (menyimpan record A: IP address). Result di-cache sesuai TTL. Total: 20-120ms jika uncached.

**Fase 2 — TCP Three-Way Handshake:** Client SYN → Server SYN-ACK → Client ACK. Satu RTT terbuang sebelum satu byte data bisa dikirim. Ini kenapa HTTP persistent connections (Keep-Alive) sangat penting.

**Fase 3 — TLS 1.3 Handshake:** TLS 1.2 membutuhkan 2 RTT. TLS 1.3 dioptimasi menjadi 1 RTT. Bahkan mendukung "0-RTT resumption" — jika client pernah connect sebelumnya, bisa mengirim data langsung di SYN pertama. Proses: client kirim client_hello + key_share. Server pilih cipher, kirim sertifikat + Finished. Client verify sertifikat, kirim Finished. Sesi terenkripsi dimulai.

**HTTP Versions:** HTTP/1.1: satu request per koneksi (kecuali pipelining yang jarang digunakan). Browser membuka 6 koneksi TCP paralel per domain. HTTP/2: multiplexing — banyak request/response dalam satu TCP connection, header compression (HPACK). HTTP/3: mengganti TCP dengan QUIC (berbasis UDP). Mengeliminasi head-of-line blocking di transport layer. Lebih bagus untuk jaringan mobile dengan packet loss karena QUIC bisa recovery lebih cepat per-stream.`,
      why_casual: `Pemahaman network stack ini berguna untuk debugging mengapa halaman lambat (bottleneck di DNS? TCP handshake? TTFB?), mengoptimasi response time (preconnect, HTTP/2, CDN), dan merancang API yang resilient (timeout strategy, retry dengan exponential backoff, circuit breaker).`,
      mistake_casual: `Tidak memahami bahwa setiap koneksi TCP baru itu mahal. Membuat koneksi HTTP baru untuk setiap request ke microservice lain (tanpa connection pooling) adalah bottleneck paling umum di backend Node.js. Gunakan http.Agent dengan keepAlive: true, atau undici Pool.`,
      interview: [
        {
          q: 'Jelaskan secara lengkap apa yang terjadi dari user mengetik URL sampai halaman muncul.',
          a: '1. URL Parsing: browser parse protocol, hostname, path, query string. 2. DNS Resolution: cek browser cache → OS cache → Recursive Resolver → iterative query (Root NS → TLD NS → Authoritative NS) → dapat IP address. Cache sesuai TTL. 3. TCP Handshake: SYN → SYN-ACK → ACK. ~1 RTT. 4. TLS Handshake (HTTPS): TLS 1.3 = 1 RTT. Client hello + key share, server certificate + finished, client finished. 5. HTTP Request: browser kirim HTTP GET dengan headers (Host, Accept, Cookie, dll). 6. Server Processing: routing, middleware, business logic, DB query. 7. HTTP Response: server kirim status code, response headers (Content-Type, Cache-Control, Set-Cookie), dan body. 8. Browser Rendering: parse HTML → DOM. Parse CSS → CSSOM. JavaScript execution. Layout → Paint → Composite. Bottleneck bisa terjadi di setiap tahap — tools: Chrome Network tab (lihat DNS, TCP, TLS, TTFB, Download time per request).'
        },
        {
          q: 'Apa perbedaan fundamental antara HTTP/2 dan HTTP/3? Apa itu head-of-line blocking?',
          a: 'HTTP/1.1: satu request per koneksi. Browser buka 6 koneksi TCP paralel per domain untuk workaround ini. HTTP/2: multiplexing — multiple streams dalam satu TCP connection. Lebih efisien. Tapi masih ada masalah: head-of-line blocking di level TCP. Jika satu TCP packet hilang, semua stream dalam koneksi itu harus menunggu retransmission — meskipun sebagian besar stream tidak terpengaruh. HTTP/3: dibangun di atas QUIC (UDP-based). QUIC mengimplementasikan reliable delivery PER STREAM — satu packet loss hanya memblokir stream yang terpengaruh, stream lain bisa terus. Lebih resilient untuk mobile (sering packet loss, sering ganti network/IP). Connection migration: QUIC connection bisa pindah IP tanpa reconnect (berguna untuk mobile yang pindah antara WiFi dan 4G). Trade-off: UDP tidak di-support oleh semua middleware, dan QUIC lebih berat di CPU (karena enkripsi wajib).'
        },
        {
          q: 'Apa itu TTFB (Time to First Byte) dan faktor apa yang mempengaruhinya?',
          a: 'TTFB adalah waktu dari browser mengirim HTTP request sampai menerima byte pertama dari response body. Ini adalah gabungan dari: network latency (RTT ke server), server processing time (routing, DB query, business logic), dan ukuran response headers. TTFB yang ideal: < 200ms. TTFB yang buruk (> 600ms) biasanya disebabkan oleh: (1) Server jauh dari user — solusi: CDN, edge computing, server di region yang lebih dekat. (2) DB query lambat — solusi: indexing, caching (Redis), query optimization. (3) Tidak ada caching di server — solusi: HTTP cache headers, server-side caching. (4) Server kelebihan beban — solusi: horizontal scaling, load balancer. Cara ukur: Chrome DevTools Network tab → hover di request bar → lihat "Waiting for server response" = TTFB.'
        }
      ],
      code: `// NODE.JS: Connection Pooling (CRITICAL for microservices)
// BAD: New TCP connection per request
async function callService(id: string) {
    const res = await fetch('http://user-service/users/' + id)
    return res.json()
}

// GOOD: Reuse connections with undici Pool
import { Pool } from 'undici'
const pool = new Pool('http://user-service', {
    connections: 20,      // Max concurrent connections
    pipelining: 1,
    keepAliveTimeout: 10_000,
})

async function callService(id: string) {
    const { body } = await pool.request({ path: '/users/' + id, method: 'GET' })
    return body.json()
}

// IMPORTANT HEADERS for performance
const res = await fetch(url, {
    headers: {
        'Accept-Encoding': 'gzip, br',    // Request compressed response
        'Connection': 'keep-alive',
    },
    signal: AbortSignal.timeout(5000),    // Built-in timeout (Node.js 18+)
})

// RESPONSE HEADERS that matter:
// Cache-Control: max-age=3600             (browser cache 1 hour)
// ETag: "abc123"                          (conditional request support)
// Strict-Transport-Security: max-age=... (HSTS — always HTTPS)
// Content-Encoding: gzip                 (compressed body)`
    },
    {
      id: 'rest-api-design',
      title: 'REST API Design & Contracts',
      depth: 'Resource modeling, idempotency, pagination, versioning',
      content: `REST bukan protokol atau standar — ia adalah arsitektur style. Di dunia nyata, "RESTful API" sering berarti "HTTP API dengan JSON" yang mengabaikan constraint REST sebenarnya. Memahami prinsip di baliknya membantu mendesain API yang konsisten dan predictable.

**Resource-Oriented Design:** URL harus mewakili resource (benda), bukan action (kata kerja). Salah: /getUserOrders. Benar: /users/{id}/orders. HTTP method menunjukkan action: GET (ambil), POST (buat baru), PUT (replace seluruh resource), PATCH (update sebagian), DELETE (hapus).

**Idempotency:** Sebuah operasi disebut idempotent jika melakukannya berkali-kali menghasilkan hasil yang sama. GET, PUT, DELETE: idempotent. POST: tidak (setiap call bisa membuat resource baru). Untuk POST yang harus idempotent (payment, order): gunakan "Idempotency-Key" header — client mengirim unique key, server menyimpannya dan mengembalikan response yang sama jika key sudah diproses.

**Status Codes yang Tepat:** 200 OK, 201 Created (sertakan Location header), 204 No Content (delete), 400 Bad Request (validasi gagal + detail), 401 Unauthorized (token missing/invalid), 403 Forbidden (ada token tapi tidak ada izin), 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 429 Too Many Requests, 500 Internal Server Error.

**Pagination Strategies:** Offset-based: ?page=3&limit=20. Simple tapi bermasalah untuk dataset besar (OFFSET 1000000 masih scan 1 juta baris di DB). Cursor-based: ?cursor=<opaque_token>&limit=20. Cursor mewakili posisi di dataset. Jauh lebih efisien dan konsisten saat data berubah di tengah pagination.`,
      why: `API adalah kontrak publik antar tim. API yang konsisten mengurangi waktu diskusi dan bug integrasi. API yang tidak konsisten (terkadang return array, terkadang object; status code random; error format berbeda tiap endpoint) membuat tim frontend frustasi dan memperlambat development.`,
      mistake: `Mengembalikan 200 OK untuk error (misalnya { status: "error", message: "..." } dengan HTTP 200) — ini mematikan semua monitoring, alerting, dan circuit breaker yang mengandalkan HTTP status codes. Tidak pernah memikirkan versioning di awal — ketika butuh breaking change, tidak ada jalan mundur jika API digunakan clients eksternal.`,
      content_casual: `REST bukan protokol atau standar — ia adalah arsitektur style. Di dunia nyata, "RESTful API" sering berarti "HTTP API dengan JSON" yang mengabaikan constraint REST sebenarnya. Memahami prinsip di baliknya membantu mendesain API yang konsisten dan predictable.

**Resource-Oriented Design:** URL harus mewakili resource (benda), bukan action (kata kerja). Salah: /getUserOrders. Benar: /users/{id}/orders. HTTP method menunjukkan action: GET (ambil), POST (buat baru), PUT (replace seluruh resource), PATCH (update sebagian), DELETE (hapus).

**Idempotency:** Sebuah operasi disebut idempotent jika melakukannya berkali-kali menghasilkan hasil yang sama. GET, PUT, DELETE: idempotent. POST: tidak (setiap call bisa membuat resource baru). Untuk POST yang harus idempotent (payment, order): gunakan "Idempotency-Key" header — client mengirim unique key, server menyimpannya dan mengembalikan response yang sama jika key sudah diproses.

**Status Codes yang Tepat:** 200 OK, 201 Created (sertakan Location header), 204 No Content (delete), 400 Bad Request (validasi gagal + detail), 401 Unauthorized (token missing/invalid), 403 Forbidden (ada token tapi tidak ada izin), 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 429 Too Many Requests, 500 Internal Server Error.

**Pagination Strategies:** Offset-based: ?page=3&limit=20. Simple tapi bermasalah untuk dataset besar (OFFSET 1000000 masih scan 1 juta baris di DB). Cursor-based: ?cursor=<opaque_token>&limit=20. Cursor mewakili posisi di dataset. Jauh lebih efisien dan konsisten saat data berubah di tengah pagination.`,
      why_casual: `API adalah kontrak publik antar tim. API yang konsisten mengurangi waktu diskusi dan bug integrasi. API yang tidak konsisten (terkadang return array, terkadang object; status code random; error format berbeda tiap endpoint) membuat tim frontend frustasi dan memperlambat development.`,
      mistake_casual: `Mengembalikan 200 OK untuk error (misalnya { status: "error", message: "..." } dengan HTTP 200) — ini mematikan semua monitoring, alerting, dan circuit breaker yang mengandalkan HTTP status codes. Tidak pernah memikirkan versioning di awal — ketika butuh breaking change, tidak ada jalan mundur jika API digunakan clients eksternal.`,
      interview: [
        {
          q: 'Apa itu idempotency dan mengapa ia penting untuk sistem pembayaran?',
          a: 'Idempotency berarti melakukan operasi yang sama berkali-kali menghasilkan hasil yang sama seperti sekali. Ini krusial untuk pembayaran karena: network failure. User klik "Pay" → request dikirim → network timeout → user tidak tahu apakah payment berhasil. Jika retry, apakah akan double-charge? Dengan Idempotency-Key: client generate UUID unik per payment attempt. Server simpan key + result di DB. Jika server receive request dengan key yang sama (retry), ia return hasil yang di-cache tanpa memproses ulang. Jika key baru, proses payment. Stripe mengimplementasikan ini: setiap create charge request harus disertai Idempotency-Key header. Sisi server: key biasanya di-expire setelah 24 jam. Implementasi: atomic check-and-set menggunakan Redis SET NX (Set if Not eXists) atau DB unique constraint pada idempotency_key column.'
        },
        {
          q: 'Jelaskan perbedaan antara 401 Unauthorized dan 403 Forbidden. Kapan menggunakan masing-masing?',
          a: '401 Unauthorized (misleading name — seharusnya "Unauthenticated"): server tidak bisa mengidentifikasi siapa yang membuat request. Either tidak ada credential (no Bearer token), atau credential tidak valid (expired token, invalid signature). Response harus include WWW-Authenticate header. Artinya: "Saya tidak tahu kamu siapa. Silakan login/sertakan credential yang valid." 403 Forbidden: server TAHU siapa yang membuat request (credential valid), tapi user tersebut tidak memiliki izin untuk resource/action yang diminta. Contoh: user biasa coba akses /admin/users. Server tahu user ini (JWT valid, user_id = 123), tapi role user = "user" bukan "admin". Artinya: "Saya tahu kamu siapa, tapi kamu tidak boleh mengakses ini." Praktik: jangan return 403 jika endpoint bahkan tidak boleh diketahui keberadaannya oleh user tersebut — return 404 untuk security through obscurity.'
        },
        {
          q: 'Kapan cursor-based pagination lebih baik dari offset-based? Apa kelemahan cursor-based?',
          a: 'Cursor-based lebih baik ketika: (1) Data sering berubah (insert/delete) — dengan offset, jika ada insert di halaman 1 saat user di halaman 2, semua item geser dan user melihat duplikat atau melewati item. Cursor selalu "lanjut dari sini" tanpa terpengaruh perubahan sebelum cursor. (2) Dataset sangat besar — OFFSET 1000000 di SQL masih harus scan dan buang 1 juta baris sebelum ambil 20. Cursor menggunakan WHERE created_at < :cursor yang bisa memanfaatkan index (O(log n)). Use case: Twitter/Instagram feed, notification list, activity log. Kelemahan cursor-based: (1) Tidak bisa jump ke halaman arbitrary ("saya mau lihat halaman 50") — harus traverse satu per satu. (2) Cursor bisa expired/invalid setelah data di-clean atau di-archive. (3) Lebih kompleks untuk diimplementasikan dan di-test. (4) Tidak familiar untuk beberapa client developers yang terbiasa offset.'
        }
      ],
      code: `// CONSISTENT API RESPONSE FORMAT
type ApiSuccess<T> = { data: T; meta?: { hasNext: boolean; cursor: string | null } }
type ApiError = { error: { code: string; message: string; details?: Record<string, string[]> } }

// IDEMPOTENCY KEY (for payment APIs)
app.post('/payments', async (req, res) => {
    const idempotencyKey = req.headers['idempotency-key'] as string
    if (!idempotencyKey) return res.status(400).json({ error: { code: 'MISSING_IDEMPOTENCY_KEY' } })

    // Atomic: only first caller processes, rest get cached result
    const cached = await redis.get('idem:' + idempotencyKey)
    if (cached) return res.status(200).json(JSON.parse(cached))

    const result = await processPayment(req.body)
    await redis.setex('idem:' + idempotencyKey, 86400, JSON.stringify(result))
    return res.status(201).json(result)
})

// CURSOR-BASED PAGINATION
app.get('/posts', async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const cursor = req.query.cursor as string | undefined

    let query = db.posts.orderBy('createdAt', 'desc').limit(limit + 1)
    if (cursor) {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString())
        query = query.where('createdAt', '<', new Date(decoded.ts))
    }

    const posts = await query
    const hasNext = posts.length > limit
    const items = hasNext ? posts.slice(0, -1) : posts
    const nextCursor = hasNext
        ? Buffer.from(JSON.stringify({ ts: items.at(-1)!.createdAt.getTime() })).toString('base64url')
        : null

    res.json({ data: items, meta: { hasNext, cursor: nextCursor } })
})`
    },
    {
      id: 'grpc-websockets',
      title: 'gRPC, Protobufs & WebSockets',
      depth: 'Binary serialization, multiplexing, bidirectional streaming',
      content: `REST + JSON sangat bagus untuk public API, tapi untuk internal microservices atau real-time apps, REST memiliki overhead besar.

**Protocol Buffers (Protobufs):** Format serialisasi biner dari Google. Di REST, kita kirim string JSON (raw text, butuh parsing mahal, ukuran besar). Di Protobuf, kita mendefinisikan skema (.proto) dan meng-compile menjadi struct/class di berbagai bahasa. Data dikirim dalam format biner yang sangat padat dan cepat di-parse. 

**gRPC:** Remote Procedure Call framework yang menggunakan HTTP/2 dan Protobuf. Keunggulan:
1. **Performa:** Payload biner (Protobuf) + HTTP/2 multiplexing (banyak request dalam 1 TCP connection).
2. **Streaming:** Mendukung Unary (request/response biasa), Client streaming, Server streaming, dan Bidirectional streaming.
3. **Strongly Typed Contracts:** File .proto menjadi sumber kebenaran (Source of Truth) antar tim. Tidak perlu lagi bingung tipe data apa yang dikirim.

**WebSockets:** Protokol di atas TCP untuk full-duplex, bidirectional communication antara browser dan server. Diawali dengan HTTP Upgrade request, lalu koneksi TCP tetap terbuka.
Kapan pakai WebSockets? Chat apps, live sports updates, collaborative editing (Google Docs).
Kapan TIDAK pakai WebSockets? Jika lo cuma butuh server → client updates sesekali, gunakan Server-Sent Events (SSE) via HTTP biasa. WebSockets stateful dan jauh lebih susah di-scale (membutuhkan sticky sessions atau Redis Pub/Sub untuk sinkronisasi antar server instances).`,
      why: `Microservices yang saling memanggil via REST/JSON pada high scale akan membuang 30-40% CPU hanya untuk JSON parsing dan string allocation. Pindah ke gRPC sering kali memotong latency internal hingga 5x.`,
      mistake: `Menggunakan WebSockets untuk segala jenis komunikasi "real-time", padahal cuma butuh one-way server push. WebSockets butuh ping/pong keep-alive, susah di-load balance, dan memakan resource file descriptor terus-menerus. Jika data cuma mengalir dari server ke client, Server-Sent Events (SSE) jauh lebih ringan, bisa berjalan di atas HTTP/2, dan gampang di-cache/load-balance.`,
      content_casual: `REST + JSON sangat bagus untuk public API, tapi untuk internal microservices atau real-time apps, REST memiliki overhead besar.

**Protocol Buffers (Protobufs):** Format serialisasi biner dari Google. Di REST, kita kirim string JSON (raw text, butuh parsing mahal, ukuran besar). Di Protobuf, kita mendefinisikan skema (.proto) dan meng-compile menjadi struct/class di berbagai bahasa. Data dikirim dalam format biner yang sangat padat dan cepat di-parse. 

**gRPC:** Remote Procedure Call framework yang menggunakan HTTP/2 dan Protobuf. Keunggulan:
1. **Performa:** Payload biner (Protobuf) + HTTP/2 multiplexing (banyak request dalam 1 TCP connection).
2. **Streaming:** Mendukung Unary (request/response biasa), Client streaming, Server streaming, dan Bidirectional streaming.
3. **Strongly Typed Contracts:** File .proto menjadi sumber kebenaran (Source of Truth) antar tim. Tidak perlu lagi bingung tipe data apa yang dikirim.

**WebSockets:** Protokol di atas TCP untuk full-duplex, bidirectional communication antara browser dan server. Diawali dengan HTTP Upgrade request, lalu koneksi TCP tetap terbuka.
Kapan pakai WebSockets? Chat apps, live sports updates, collaborative editing (Google Docs).
Kapan TIDAK pakai WebSockets? Jika lo cuma butuh server → client updates sesekali, gunakan Server-Sent Events (SSE) via HTTP biasa. WebSockets stateful dan jauh lebih susah di-scale (membutuhkan sticky sessions atau Redis Pub/Sub untuk sinkronisasi antar server instances).`,
      why_casual: `Microservices yang saling memanggil via REST/JSON pada high scale akan membuang 30-40% CPU hanya untuk JSON parsing dan string allocation. Pindah ke gRPC sering kali memotong latency internal hingga 5x.`,
      mistake_casual: `Menggunakan WebSockets untuk segala jenis komunikasi "real-time", padahal cuma butuh one-way server push. WebSockets butuh ping/pong keep-alive, susah di-load balance, dan memakan resource file descriptor terus-menerus. Jika data cuma mengalir dari server ke client, Server-Sent Events (SSE) jauh lebih ringan, bisa berjalan di atas HTTP/2, dan gampang di-cache/load-balance.`,
      interview: [
        {
          q: 'Bagaimana cara load balancing koneksi gRPC? Mengapa layer 4 (TCP) load balancer tidak cukup?',
          a: 'gRPC menggunakan HTTP/2 yang menahan HANYA SATU koneksi TCP persisten dan me-multiplex semua request di atasnya. Jika kita menggunakan L4 Load Balancer (seperti AWS NLB atau HAProxy TCP mode), balancer hanya melihat koneksi TCP awal dan akan mengirimkan SELURUH trafik gRPC dari client tersebut ke SATU server backend saja (uneven load). Untuk me-load balance gRPC, kita HARUS menggunakan L7 Load Balancer (seperti Envoy, Nginx gRPC module, AWS ALB) yang bisa memahami frame HTTP/2 dan mendistribusikan individual gRPC calls ke backend yang berbeda, ATAU menggunakan client-side load balancing (client punya list IP backend dan round-robin secara lokal).'
        },
        {
          q: 'Jelaskan trade-off antara REST/JSON vs gRPC/Protobuf untuk internal microservices.',
          a: 'REST/JSON human-readable, mudah di-debug (bisa pakai curl/Postman langsung), dan universal didukung web client. Tapi payloadnya membengkak (keys diulang setiap objek) dan JSON parsing sangat CPU-intensive. gRPC/Protobuf sangat efisien (biner, ukuran kecil), type-safe dengan skema ketat, backwards compatible (asal tidak menghapus/mengubah field number lama), dan mendukung streaming. Trade-off utamanya: gRPC tidak human-readable (susah debug network sniffing), butuh tooling khusus (grpcurl), dan sulit dikonsumsi langsung oleh web browser tanpa gRPC-Web proxy (karena browser tidak mengekspos HTTP/2 frames).'
        }
      ],
      code: `// gRPC: Protobuf Definition (user.proto)
// syntax = "proto3";
// package users;
// 
// service UserService {
//   rpc GetUser (UserRequest) returns (UserResponse) {}
//   rpc StreamUsers (UserRequest) returns (stream UserResponse) {}
// }
// 
// message UserRequest { string id = 1; }
// message UserResponse {
//   string id = 1;
//   string name = 2;
//   string email = 3;
// }

// SSE (Server-Sent Events) - Simple 1-way Realtime
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    
    // Send initial connection message
    res.write('data: {"status": "connected"}\n\n')
    
    // Send event every 2 seconds
    const timer = setInterval(() => {
        res.write('data: {"time": "' + new Date().toISOString() + '"}\n\n')
    }, 2000)
    
    req.on('close', () => clearInterval(timer))
})`
    },
    {
      id: 'auth-deep',
      title: 'Authentication & Authorization Systems',
      depth: 'JWT internals, OAuth2 flows, RBAC, security pitfalls',
      content: `Authentication (AuthN) menjawab "siapa kamu?" Authorization (AuthZ) menjawab "kamu boleh ngapain?". Keduanya adalah domain terpisah dengan mekanisme berbeda.

**JWT (JSON Web Token):** Terdiri dari tiga bagian Base64URL-encoded dipisahkan titik: Header (algorithm: "HS256" atau "RS256"), Payload (claims: sub, iat, exp, role, custom data), Signature. Signature dibuat dengan men-sign Header.Payload menggunakan secret key. Siapapun yang punya public key bisa verify token tanpa menghubungi authorization server — ini yang membuat JWT "stateless". Trade-off besar: JWT tidak bisa di-revoke sebelum expired. Solusi: access token berumur pendek (5-15 menit) + refresh token berumur panjang yang disimpan di database.

**OAuth2:** Protokol untuk memberikan akses terbatas ke resource user di service lain tanpa berbagi password. Authorization Code Flow (web apps — paling aman). PKCE (untuk SPA dan mobile tanpa client secret). Client Credentials (machine-to-machine). OIDC (OpenID Connect) adalah lapisan identity di atas OAuth2 — "Login with Google".

**RBAC (Role-Based Access Control):** Assign permissions ke roles, lalu assign roles ke users. User bisa punya multiple roles. Lebih scalable dari per-user permissions. Untuk sistem kompleks, gunakan policy engine seperti OPA (Open Policy Agent).

**Token Storage:** Jangan simpan token di localStorage (rentan XSS — script manapun bisa mengaksesnya). Simpan access token di memory (JavaScript variable) dan refresh token di httpOnly + Secure + SameSite=Strict cookie. httpOnly mencegah JavaScript mengakses cookie, melindungi dari XSS. SameSite=Strict mencegah CSRF.`,
      why: `Auth yang salah implementasi adalah penyebab paling umum data breach. OWASP Top 10 selalu memasukkan "Broken Authentication" dan "Broken Access Control". Memahami mekanisme di balik JWT dan OAuth memungkinkan mendesain sistem yang aman by default.`,
      mistake: `Menyimpan JWT di localStorage. Membuat access token dengan expiry 30 hari. Tidak memvalidasi 'aud' (audience) claim di JWT — token untuk service A bisa digunakan di service B. Tidak melakukan rate limiting pada endpoint login. Menyimpan password sebagai plain text atau MD5/SHA1 — gunakan bcrypt, argon2, atau scrypt.`,
      content_casual: `Authentication (AuthN) menjawab "siapa kamu?" Authorization (AuthZ) menjawab "kamu boleh ngapain?". Keduanya adalah domain terpisah dengan mekanisme berbeda.

**JWT (JSON Web Token):** Terdiri dari tiga bagian Base64URL-encoded dipisahkan titik: Header (algorithm: "HS256" atau "RS256"), Payload (claims: sub, iat, exp, role, custom data), Signature. Signature dibuat dengan men-sign Header.Payload menggunakan secret key. Siapapun yang punya public key bisa verify token tanpa menghubungi authorization server — ini yang membuat JWT "stateless". Trade-off besar: JWT tidak bisa di-revoke sebelum expired. Solusi: access token berumur pendek (5-15 menit) + refresh token berumur panjang yang disimpan di database.

**OAuth2:** Protokol untuk memberikan akses terbatas ke resource user di service lain tanpa berbagi password. Authorization Code Flow (web apps — paling aman). PKCE (untuk SPA dan mobile tanpa client secret). Client Credentials (machine-to-machine). OIDC (OpenID Connect) adalah lapisan identity di atas OAuth2 — "Login with Google".

**RBAC (Role-Based Access Control):** Assign permissions ke roles, lalu assign roles ke users. User bisa punya multiple roles. Lebih scalable dari per-user permissions. Untuk sistem kompleks, gunakan policy engine seperti OPA (Open Policy Agent).

**Token Storage:** Jangan simpan token di localStorage (rentan XSS — script manapun bisa mengaksesnya). Simpan access token di memory (JavaScript variable) dan refresh token di httpOnly + Secure + SameSite=Strict cookie. httpOnly mencegah JavaScript mengakses cookie, melindungi dari XSS. SameSite=Strict mencegah CSRF.`,
      why_casual: `Auth yang salah implementasi adalah penyebab paling umum data breach. OWASP Top 10 selalu memasukkan "Broken Authentication" dan "Broken Access Control". Memahami mekanisme di balik JWT dan OAuth memungkinkan mendesain sistem yang aman by default.`,
      mistake_casual: `Menyimpan JWT di localStorage. Membuat access token dengan expiry 30 hari. Tidak memvalidasi 'aud' (audience) claim di JWT — token untuk service A bisa digunakan di service B. Tidak melakukan rate limiting pada endpoint login. Menyimpan password sebagai plain text atau MD5/SHA1 — gunakan bcrypt, argon2, atau scrypt.`,
      interview: [
        {
          q: 'Mengapa refresh token pattern digunakan daripada satu long-lived access token?',
          a: 'Satu long-lived token (e.g., expiry 30 hari) adalah masalah keamanan besar: jika token dicuri (XSS, network sniff, compromised device), attacker punya akses 30 hari. Tidak ada cara untuk membatalkannya karena JWT adalah stateless. Solusi — dua token: Access Token: short-lived (5-15 menit), stateless JWT, tidak disimpan di DB. Jika dicuri, hanya berlaku sebentar. Refresh Token: long-lived (7-30 hari), opaque string (bukan JWT), DISIMPAN di database (bisa di-revoke). Disimpan di httpOnly cookie. Flow: client gunakan access token untuk API calls. Saat expired (401 response), client diam-diam kirim refresh token ke /auth/refresh. Server verify refresh token di DB (masih valid? belum di-revoke? belum expired?). Jika OK, issue access token baru. Jika refresh token juga expired atau di-revoke, user harus login ulang. Tambahan security: Refresh Token Rotation — setiap kali refresh token digunakan, issue refresh token baru dan invalidate yang lama.'
        },
        {
          q: 'Jelaskan perbedaan antara HS256 dan RS256 sebagai algoritma JWT signing. Kapan menggunakan masing-masing?',
          a: 'HS256 (HMAC-SHA256): symmetric key. Satu secret key digunakan untuk SIGN DAN VERIFY token. Artinya: siapapun yang bisa verify token juga bisa membuat token palsu. Cocok ketika satu service yang sign dan verify (monolith, atau satu auth service + satu resource server). Lebih sederhana, lebih cepat. RS256 (RSA-SHA256): asymmetric key pair. Private key untuk SIGN (hanya auth service yang punya). Public key untuk VERIFY (bisa didistribusikan ke semua resource servers). Resource server bisa verify token tanpa bisa membuat token palsu. Cocok untuk microservices (banyak services yang perlu verify), atau ketika auth service terpisah dari resource services. Public key bisa di-publish di JWKS endpoint (/.well-known/jwks.json). EC256 (ECDSA) adalah alternatif RS256 yang lebih modern dan lebih kecil key size-nya.'
        },
        {
          q: 'Jelaskan mengapa localStorage tidak aman untuk menyimpan JWT dan apa alternativasinya.',
          a: 'localStorage dapat diakses oleh SEMUA JavaScript yang berjalan di domain tersebut. Jika ada XSS (Cross-Site Scripting) vulnerability — bahkan dari third-party script (analytics, chat widget, ads) — attacker dapat: document.cookie untuk cookie tanpa httpOnly, atau localStorage.getItem("token") untuk mencuri token. Dengan token di localStorage, attacker punya akses penuh ke akun user. Alternatif yang benar: Access Token: simpan di JavaScript variable (in-memory). Token hilang saat page refresh, tapi itu OK karena ada refresh token. Untuk persist: gunakan refresh token. Refresh Token: simpan di httpOnly Secure SameSite=Strict cookie. httpOnly: JavaScript tidak bisa baca cookie ini sama sekali (document.cookie tidak tampilkan). Secure: hanya dikirim via HTTPS. SameSite=Strict: tidak dikirim untuk cross-site requests (mencegah CSRF). Flow di page refresh: browser kirim refresh token cookie ke /auth/refresh → server return access token baru → simpan di memory.'
        }
      ],
      code: `// JWT FULL IMPLEMENTATION (Node.js)
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

async function generateTokens(user: User) {
    const accessToken = jwt.sign(
        { sub: user.id, role: user.role, aud: 'api.myapp.com' },
        process.env.JWT_SECRET!,
        { expiresIn: '15m', issuer: 'auth.myapp.com' }
    )
    const refreshToken = randomBytes(64).toString('hex')
    // Store HASHED refresh token
    await db.refreshTokens.create({
        tokenHash: createHash('sha256').update(refreshToken).digest('hex'),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    return { accessToken, refreshToken }
}

// Set as secure httpOnly cookie
app.post('/auth/login', async (req, res) => {
    const user = await validateCredentials(req.body)
    const { accessToken, refreshToken } = await generateTokens(user)

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, secure: true, sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.json({ accessToken }) // Goes to memory, NOT localStorage!
})

// Auth middleware with proper validation
const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: { code: 'NO_TOKEN' } })
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!, {
            audience: 'api.myapp.com', issuer: 'auth.myapp.com'
        })
        req.user = payload
        next()
    } catch (e) {
        const code = e instanceof jwt.TokenExpiredError ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
        res.status(401).json({ error: { code } })
    }
}

// RBAC middleware
const authorize = (...roles: string[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: { code: 'FORBIDDEN' } })
        }
        next()
    }

router.delete('/users/:id', authenticate, authorize('admin'), deleteUser)`
    },
    {
      id: 'web-security',
      title: 'Web Security & Attack Vectors',
      depth: 'XSS, CSRF, JWT signing vulns, Rate Limiting, SQLi mitigation',
      content: `Sistem yang scalable tidak berguna kalau bisa dibobol dalam 5 menit. Senior engineer wajib memahami top attack vectors (OWASP) dan cara memitigasinya di level arsitektur.

**XSS (Cross-Site Scripting):** Attacker menyuntikkan script JS berbahaya ke halaman web user lain. Mitigasi: Jangan pernah percaya user input. Gunakan framework modern (React/Vue otomatis escape HTML variables), sanitasi HTML menggunakan library seperti DOMPurify jika menerima input rich-text, dan terapkan Content Security Policy (CSP) header untuk membatasi domain eksekusi script.

**CSRF (Cross-Site Request Forgery):** Attacker menipu browser user untuk mengirim request ke situs lo saat user masih login (misal via hidden form auto-submit di web attacker). Mitigasi: 
1. Gunakan SameSite=Lax atau Strict pada cookie session.
2. Gunakan CSRF Token (Anti-Forgery Token) yang digenerate server dan harus dikirim bersama form POST.

**JWT Vulnerabilities:** JWT bukan sihir. Isinya cuma Base64, BISA dibaca siapa saja, JANGAN simpan data sensitif di payload. Masalah umum: algoritma 'none' diterima server, membocorkan secret key, atau JWT tidak bisa di-revoke (karena stateless). Mitigasi revocation: simpan JWT JTI (ID) di Redis blocklist, atau gunakan token umur sangat pendek (15 menit) + Refresh Token.

**Rate Limiting & Throttling:** Mencegah brute-force dan DDoS ringan. Algoritma populer:
- **Token Bucket:** Setiap user punya 'ember' token yang terisi seiring waktu. Request pakai token. (Cocok untuk burst traffic).
- **Fixed Window:** Max 100 req per menit per IP, reset di menit baru. (Masalah: burst 200 req di detik perpindahan menit).
- **Sliding Window:** Kombinasi yang lebih smooth, melihat rata-rata req di jendela waktu bergerak.`,
      why: `Satu celah keamanan bisa menghancurkan reputasi perusahaan yang dibangun bertahun-tahun. Security bukan sekadar "tugas tim InfoSec", melainkan tanggung jawab arsitektural engineer dari awal mendesain API.`,
      mistake: `Menyimpan JWT Token di localStorage. Local storage BISA diakses oleh script apapun di domain lo (rentan XSS). Jika ada XSS, token lo langsung dicuri. Best practice: simpan JWT di httpOnly cookie. Cookie httpOnly TIDAK BISA dibaca oleh JavaScript (kebal pencurian via XSS), dan gunakan attribut Secure + SameSite untuk melindunginya dari CSRF.`,
      content_casual: `Sistem yang scalable tidak berguna kalau bisa dibobol dalam 5 menit. Senior engineer wajib memahami top attack vectors (OWASP) dan cara memitigasinya di level arsitektur.

**XSS (Cross-Site Scripting):** Attacker menyuntikkan script JS berbahaya ke halaman web user lain. Mitigasi: Jangan pernah percaya user input. Gunakan framework modern (React/Vue otomatis escape HTML variables), sanitasi HTML menggunakan library seperti DOMPurify jika menerima input rich-text, dan terapkan Content Security Policy (CSP) header untuk membatasi domain eksekusi script.

**CSRF (Cross-Site Request Forgery):** Attacker menipu browser user untuk mengirim request ke situs lo saat user masih login (misal via hidden form auto-submit di web attacker). Mitigasi: 
1. Gunakan SameSite=Lax atau Strict pada cookie session.
2. Gunakan CSRF Token (Anti-Forgery Token) yang digenerate server dan harus dikirim bersama form POST.

**JWT Vulnerabilities:** JWT bukan sihir. Isinya cuma Base64, BISA dibaca siapa saja, JANGAN simpan data sensitif di payload. Masalah umum: algoritma 'none' diterima server, membocorkan secret key, atau JWT tidak bisa di-revoke (karena stateless). Mitigasi revocation: simpan JWT JTI (ID) di Redis blocklist, atau gunakan token umur sangat pendek (15 menit) + Refresh Token.

**Rate Limiting & Throttling:** Mencegah brute-force dan DDoS ringan. Algoritma populer:
- **Token Bucket:** Setiap user punya 'ember' token yang terisi seiring waktu. Request pakai token. (Cocok untuk burst traffic).
- **Fixed Window:** Max 100 req per menit per IP, reset di menit baru. (Masalah: burst 200 req di detik perpindahan menit).
- **Sliding Window:** Kombinasi yang lebih smooth, melihat rata-rata req di jendela waktu bergerak.`,
      why_casual: `Satu celah keamanan bisa menghancurkan reputasi perusahaan yang dibangun bertahun-tahun. Security bukan sekadar "tugas tim InfoSec", melainkan tanggung jawab arsitektural engineer dari awal mendesain API.`,
      mistake_casual: `Menyimpan JWT Token di localStorage. Local storage BISA diakses oleh script apapun di domain lo (rentan XSS). Jika ada XSS, token lo langsung dicuri. Best practice: simpan JWT di httpOnly cookie. Cookie httpOnly TIDAK BISA dibaca oleh JavaScript (kebal pencurian via XSS), dan gunakan attribut Secure + SameSite untuk melindunginya dari CSRF.`,
      interview: [
        {
          q: 'Bagaimana cara kerjanya cookie httpOnly dan apa kaitannya dengan XSS vs CSRF?',
          a: 'Cookie httpOnly memberi tahu browser bahwa cookie tersebut DILARANG keras diakses melalui JavaScript (document.cookie). Ini memitigasi serangan XSS, karena attacker yang berhasil menyuntikkan JS ke web kita tidak akan bisa mencuri session token tersebut. TAPI, cookie (termasuk httpOnly) secara otomatis disertakan oleh browser ke setiap request ke domain asalnya. Ini membuat aplikasi rentan terhadap CSRF (attacker membuat form di webnya, submit ke web kita, browser tetap mengirim cookie itu). Jadi, httpOnly mencegah pencurian token via XSS, tapi membutuhkan perlindungan tambahan (seperti atribut SameSite atau Anti-CSRF tokens) untuk melawan CSRF.'
        },
        {
          q: 'Jelaskan bagaimana Token Bucket algorithm bekerja untuk Rate Limiting.',
          a: 'Bayangkan sebuah ember yang bisa menampung maksimal N token (kapasitas). Token ditambahkan ke ember dengan laju konstan R token per detik. Saat sebuah request masuk, ia membutuhkan 1 token. Jika ember punya token, ambil 1 token dan proses request. Jika ember kosong, reject request (HTTP 429 Too Many Requests). Keuntungan Token Bucket: memungkinkan "bursts" (ledakan request sesaat) selama tidak melebihi kapasitas N, namun membatasi laju rata-rata jangka panjang sesuai R. Implementasi umum di Redis menggunakan Lua script agar atomic (membaca jumlah token, mengecek waktu terakhir, menambah token sesuai waktu berlalu, mengurangi 1, dan menyimpan kembali dalam satu transaksi).'
        }
      ],
      code: `// BASIC RATE LIMITER (Redis Token Bucket using Lua Script)
const TOKEN_BUCKET_SCRIPT = 
    'local key = KEYS[1] ' +
    'local capacity = tonumber(ARGV[1]) ' +
    'local refill_rate = tonumber(ARGV[2]) ' +
    'local now = tonumber(ARGV[3]) ' +
    'local requested = tonumber(ARGV[4]) ' +
    'local bucket = redis.call("HMGET", key, "tokens", "last_refill") ' +
    'local tokens = tonumber(bucket[1]) or capacity ' +
    'local last_refill = tonumber(bucket[2]) or now ' +
    'local time_passed = math.max(0, now - last_refill) ' +
    'local refill_amount = math.floor(time_passed * refill_rate) ' +
    'tokens = math.min(capacity, tokens + refill_amount) ' +
    'if tokens >= requested then ' +
    '  tokens = tokens - requested ' +
    '  redis.call("HMSET", key, "tokens", tokens, "last_refill", now) ' +
    '  redis.call("EXPIRE", key, math.ceil(capacity / refill_rate)) ' +
    '  return 1 ' +
    'else return 0 end'

async function checkRateLimit(userId: string) {
    const now = Math.floor(Date.now() / 1000)
    // Capacity 10, refill 1 per sec
    const result = await redis.eval(
        TOKEN_BUCKET_SCRIPT, 1, 'rate:' + userId, 10, 1, now, 1
    )
    return result === 1
}`
    }
  ]
}
