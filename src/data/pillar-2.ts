import type { Pillar } from './types'

export const pillar2: Pillar = {
  id: 'networking',
  title: 'Pillar 2 — Networking & Web',
  topics: [
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
    const res = await fetch(\`http://user-service/users/\${id}\`)
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
    const { body } = await pool.request({ path: \`/users/\${id}\`, method: 'GET' })
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
    const cached = await redis.get(\`idem:\${idempotencyKey}\`)
    if (cached) return res.status(200).json(JSON.parse(cached))

    const result = await processPayment(req.body)
    await redis.setex(\`idem:\${idempotencyKey}\`, 86400, JSON.stringify(result))
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
    }
  ]
}
