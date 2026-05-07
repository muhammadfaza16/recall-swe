export const PILLARS_PART1 = [
  {
    id: "foundations",
    title: "System Foundations",
    topics: [
      {
        id: "memory",
        title: "Memory: Stack vs Heap",
        depth: "Crucial for Go & Node.js performance tuning",
        content: "Stack adalah area memori yang dikelola secara otomatis dengan pola LIFO. Setiap kali fungsi dipanggil, sebuah 'stack frame' dibuat untuk menyimpan local variables dan parameter. Begitu fungsi selesai, frame dihapus — sangat cepat karena tidak ada proses pencarian. Heap adalah pool memori besar untuk data yang lifetime-nya tidak bisa diprediksi saat compile-time. Di Go, compiler melakukan 'Escape Analysis': jika sebuah variabel bisa dibuktikan hanya hidup di dalam fungsi, ia masuk Stack. Jika di-return sebagai pointer atau disimpan di struct yang hidup lebih lama, variabel itu 'escapes' ke Heap dan dikelola oleh Garbage Collector. Di Node.js (V8), semua object masuk Heap. V8 menggunakan Generational GC: object baru masuk 'Young Generation' (sering di-scan), yang bertahan lama dipindah ke 'Old Generation' (jarang di-scan). Memory leak terjadi saat reference ke object tetap ada padahal sudah tidak dibutuhkan — misalnya closure yang meng-capture variabel besar, atau event listener yang tidak di-remove.",
        why: "Pemahaman ini memungkinkan lo menulis kode yang GC-friendly. Di Go, mengurangi escape ke heap berarti latency lebih rendah. Di Node.js, menghindari memory leak berarti server tidak crash setelah berjam-jam running. Saat debugging production issue seperti 'memory terus naik', lo harus bisa baca heap dump dan identifikasi retained objects.",
        mistake: "Di Go: Selalu me-return pointer dengan asumsi 'lebih efisien karena tidak ada copy'. Padahal untuk struct kecil (< 64 bytes), copy by value lebih cepat karena tidak membebani GC. Di Node.js: Menyimpan data besar di module-level variable (global scope) yang tidak pernah di-release, menyebabkan memory leak yang baru terasa setelah berjam-jam di production.",
        interview: "Jelaskan apa itu Escape Analysis di Go dan bagaimana itu mempengaruhi performa aplikasi. Bagaimana cara mendeteksi memory leak di Node.js production server?",
        code: `// === GO: Escape Analysis ===
// Run: go build -gcflags="-m" main.go

// STACK — value tidak escape
func multiply(a, b int) int {
    result := a * b  // stays on stack
    return result
}

// HEAP — pointer escapes fungsi
func newUser(name string) *User {
    u := User{Name: name}  // escapes to heap
    return &u
}

// === NODE.JS: Memory Leak Pattern ===
// BAD: theSink grows forever
const theSink = [];
app.get('/leak', (req, res) => {
    theSink.push(req.body); // never cleared!
    res.send('ok');
});

// GOOD: Use WeakRef or clear periodically
const cache = new Map();
setInterval(() => cache.clear(), 60000);`
      },
      {
        id: "concurrency",
        title: "Concurrency Models",
        depth: "Event Loop vs Goroutines vs Threads",
        content: "Ada tiga model utama yang harus lo pahami. Pertama, Thread-based (Java/C++): setiap request mendapat OS thread sendiri. Berat (~2MB per thread), tapi simpel. Kedua, Event Loop (Node.js): single-threaded, semua I/O di-delegate ke kernel via libuv, callback dijalankan saat I/O selesai. Sangat efisien untuk I/O-bound work, tapi CPU-bound task memblokir seluruh server. Ketiga, M:N Scheduling (Go): ribuan goroutine (ringan, ~2-8KB) di-multiplex ke sejumlah kecil OS threads oleh Go runtime scheduler. Ini kombinasi terbaik: ringan seperti Event Loop, tapi bisa melakukan CPU-bound work tanpa blocking. Memahami perbedaan ini krusial karena menentukan arsitektur aplikasi lo. Di Node.js, CPU-heavy task harus di-offload ke Worker Threads atau external service. Di Go, lo bisa spawn goroutine untuk CPU task tanpa masalah, tapi harus hati-hati dengan shared state (gunakan channels atau sync.Mutex).",
        why: "Ini fondasi dari semua keputusan arsitektur backend. Apakah lo butuh message queue? Worker pool? Background job? Semua bergantung pada pemahaman model concurrency yang lo gunakan. Senior engineer tahu kapan Node.js cukup dan kapan harus pindah ke Go.",
        mistake: "Di Node.js: Menjalankan operasi CPU-intensive (image processing, heavy computation) langsung di event loop, memblokir semua request lain. Di Go: Membuat goroutine tanpa batas tanpa semaphore atau worker pool, berujung pada resource exhaustion. Selalu batasi jumlah concurrent goroutines.",
        interview: "Apa yang terjadi ketika kita menjalankan operasi sorting array 10 juta elemen di dalam handler Express? Bagaimana solusinya? Jelaskan perbedaan concurrency dan parallelism dengan contoh nyata.",
        code: `// === NODE.JS: Don't block the Event Loop ===
// BAD — blocks entire server
app.get('/report', (req, res) => {
    const result = heavyComputation(); // blocks!
    res.json(result);
});

// GOOD — offload to Worker Thread
const { Worker } = require('worker_threads');
app.get('/report', (req, res) => {
    const worker = new Worker('./heavy-worker.js');
    worker.on('message', (result) => res.json(result));
});

// === GO: Worker Pool Pattern ===
func workerPool(jobs <-chan Job, results chan<- Result) {
    // Spawn fixed number of workers
    for i := 0; i < 10; i++ {
        go func() {
            for job := range jobs {
                results <- process(job)
            }
        }()
    }
}`
      },
      {
        id: "io-models",
        title: "I/O Models Deep Dive",
        depth: "Blocking, Non-blocking, Multiplexing",
        content: "Setiap kali aplikasi lo membaca file, query database, atau call API eksternal, itu adalah operasi I/O. Ada empat model I/O: (1) Blocking I/O — thread menunggu sampai operasi selesai. Simple tapi wasteful. (2) Non-blocking I/O — syscall return langsung, tapi lo harus polling berulang-ulang untuk cek apakah data sudah siap. (3) I/O Multiplexing (epoll/kqueue) — satu thread bisa menunggu banyak I/O sekaligus. Ini yang digunakan Node.js (libuv) dan Go (netpoller). (4) Async I/O (io_uring) — kernel yang melakukan semuanya, app tinggal terima notifikasi. Node.js menggunakan epoll di Linux untuk network I/O dan thread pool (libuv) untuk file system I/O. Go menggunakan netpoller untuk network dan goroutine scheduling untuk file I/O. Memahami ini penting karena menentukan bagaimana aplikasi lo berperilaku di bawah load tinggi.",
        why: "Debugging performance issue di production sering berujung ke I/O. Kenapa response lambat? Apakah database query blocking? Apakah file read menghabiskan thread pool? Pemahaman I/O model membantu lo mendiagnosis dan memprediksi bottleneck sebelum terjadi.",
        mistake: "Menggunakan synchronous file I/O (fs.readFileSync) di Node.js production server. Ini memblokir event loop karena file I/O di libuv menggunakan thread pool yang terbatas (default 4 threads). Selalu gunakan fs.promises atau fs.createReadStream.",
        interview: "Jelaskan bagaimana Node.js menangani 10,000 concurrent connections dengan single thread. Apa peran epoll/kqueue di dalamnya?",
        code: `// === NODE.JS: Async I/O ===
// BAD — blocks the thread pool
const data = fs.readFileSync('/big-file.csv');

// GOOD — non-blocking stream
const stream = fs.createReadStream('/big-file.csv');
stream.on('data', (chunk) => process(chunk));

// === GO: Concurrent I/O ===
func fetchAll(urls []string) []Response {
    ch := make(chan Response, len(urls))
    for _, url := range urls {
        go func(u string) {
            resp, _ := http.Get(u)
            ch <- Response{URL: u, Status: resp.StatusCode}
        }(url)
    }
    results := make([]Response, len(urls))
    for i := range results { results[i] = <-ch }
    return results
}`
      }
    ]
  },
  {
    id: "networking",
    title: "Networking & Web",
    topics: [
      {
        id: "how-web-works",
        title: "How the Web Works",
        depth: "DNS → TCP → TLS → HTTP",
        content: "Ketika user mengetik URL di browser, urutan kejadiannya: (1) Browser cek cache DNS lokal, lalu query DNS resolver untuk mendapatkan IP address. (2) TCP three-way handshake (SYN → SYN-ACK → ACK) membuat koneksi reliable. (3) Jika HTTPS, TLS handshake terjadi: client dan server bernegosiasi cipher suite, bertukar sertifikat, dan membuat session key untuk enkripsi. (4) HTTP request dikirim melalui koneksi yang sudah terenkripsi. (5) Server memproses request dan mengirim response dengan status code, headers, dan body. HTTP/2 menambahkan multiplexing (banyak request dalam satu koneksi TCP) dan header compression. HTTP/3 mengganti TCP dengan QUIC (berbasis UDP) untuk menghilangkan head-of-line blocking.",
        why: "Ini adalah pertanyaan interview paling klasik: 'What happens when you type google.com?' Jawabannya menunjukkan kedalaman pemahaman lo tentang web stack. Di production, lo harus bisa debugging apakah masalah ada di DNS resolution, TCP timeout, TLS certificate, atau application layer.",
        mistake: "Tidak memahami bahwa setiap koneksi TCP baru itu mahal (3-way handshake + TLS). Connection pooling dan HTTP keep-alive sangat penting di backend. Jangan membuat koneksi HTTP baru untuk setiap request ke service lain — gunakan agent dengan connection pool.",
        interview: "Jelaskan secara detail apa yang terjadi dari saat user mengetik google.com sampai halaman muncul. Apa perbedaan HTTP/2 dan HTTP/3?",
        code: `// === NODE.JS: Connection Pooling ===
// BAD — new connection per request
const res = await fetch('http://api.internal/data');

// GOOD — reuse connections with agent
const http = require('http');
const agent = new http.Agent({ 
    keepAlive: true, 
    maxSockets: 50 
});
const res = await fetch('http://api.internal/data', { agent });

// === GO: Default connection pooling ===
// http.Client reuses connections by default
var client = &http.Client{
    Transport: &http.Transport{
        MaxIdleConns:    100,
        IdleConnTimeout: 90 * time.Second,
    },
}`
      },
      {
        id: "rest-api",
        title: "REST API Design",
        depth: "Beyond CRUD endpoints",
        content: "REST bukan sekadar GET/POST/PUT/DELETE. REST yang baik mengikuti prinsip: (1) Resource-oriented URLs — /users/123/orders bukan /getUserOrders. (2) Proper HTTP methods — GET idempotent dan safe, PUT idempotent tapi tidak safe, POST tidak keduanya. (3) Status codes yang tepat — 201 Created (bukan 200) setelah POST, 204 No Content setelah DELETE, 409 Conflict untuk duplicate resource. (4) Pagination — gunakan cursor-based (lebih reliable) atau offset-based (lebih simple). (5) Versioning — /api/v1/ atau header-based. (6) Filtering dan Sorting — /users?status=active&sort=-created_at. Konsistensi adalah kunci. Pilih satu konvensi dan stick with it di seluruh API.",
        why: "API adalah kontrak antara frontend dan backend. API yang inkonsisten memperlambat development seluruh tim. Senior engineer mendesain API yang intuitif sehingga frontend dev bisa paham tanpa banyak bertanya.",
        mistake: "Menggunakan POST untuk semua operasi. Tidak memberikan status code yang tepat (selalu return 200). Tidak menangani error secara konsisten — kadang return { error: 'msg' }, kadang { message: 'msg' }, kadang plain string.",
        interview: "Desainkan REST API untuk sistem e-commerce yang mendukung cart, checkout, dan order history. Bagaimana menangani race condition saat dua user membeli item terakhir yang sama?",
        code: `// === Consistent API Response ===
// Success
{ "data": { "id": 1, "name": "Andi" }, "meta": { "page": 1 } }

// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "Email required", "details": [...] } }

// === Express: Clean Route Structure ===
router.get('/users',         listUsers);
router.get('/users/:id',     getUser);
router.post('/users',        createUser);
router.patch('/users/:id',   updateUser);
router.delete('/users/:id',  deleteUser);

// Nested resources
router.get('/users/:id/orders', getUserOrders);`
      },
      {
        id: "auth",
        title: "Authentication & Authorization",
        depth: "JWT, Session, OAuth — when to use what",
        content: "Authentication = siapa lo. Authorization = boleh ngapain. Ada tiga strategi utama: (1) Session-based: server menyimpan session di memory/Redis, client menyimpan session ID di cookie. Pros: bisa di-revoke instant. Cons: butuh shared storage di multi-server. (2) JWT (JSON Web Token): self-contained token berisi claims. Server tidak perlu menyimpan state. Pros: stateless, bagus untuk microservices. Cons: tidak bisa di-revoke sebelum expired (kecuali pakai blacklist). (3) OAuth2: delegation protocol — 'Login with Google'. User memberi izin ke aplikasi lo untuk mengakses data mereka tanpa memberikan password. Untuk kebanyakan aplikasi: gunakan JWT untuk API authentication, simpan di httpOnly cookie (bukan localStorage — rentan XSS), dan implementasikan refresh token rotation untuk security.",
        why: "Auth adalah gerbang utama keamanan aplikasi. Implementasi yang salah = data breach. Ini juga komponen yang paling sering ditanyakan di interview karena menyentuh banyak konsep: hashing, encryption, cookies, CORS, CSRF, XSS.",
        mistake: "Menyimpan JWT di localStorage (rentan XSS). Tidak menggunakan refresh token (user harus login ulang setiap access token expired). Menyimpan password tanpa hashing (gunakan bcrypt dengan salt round minimal 10). Tidak memvalidasi JWT signature di setiap request.",
        interview: "Jelaskan flow lengkap JWT authentication dari login sampai request ke protected endpoint. Bagaimana menangani token yang dicuri? Apa bedanya authentication dan authorization?",
        code: `// === JWT Auth Flow (Node.js) ===
// 1. Login — issue tokens
app.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const accessToken = jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
    
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.json({ accessToken });
});

// 2. Middleware — verify on every request  
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch { return res.status(401).json({ error: 'Token expired' }); }
};

// 3. Authorization — role check
const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
};`
      }
    ]
  },
  {
    id: "data-layer",
    title: "Data & Databases",
    topics: [
      {
        id: "sql-deep",
        title: "SQL Mastery & Query Optimization",
        depth: "JOINs, Subqueries, EXPLAIN ANALYZE",
        content: "SQL adalah bahasa yang harus dikuasai setiap backend engineer. Fundamental yang harus solid: (1) JOINs — INNER JOIN hanya mengembalikan baris yang cocok di kedua tabel. LEFT JOIN mengembalikan semua baris dari tabel kiri meskipun tidak ada pasangan. (2) Aggregation — GROUP BY dengan HAVING untuk filter setelah aggregasi. (3) Window Functions — ROW_NUMBER(), RANK(), LAG(), LEAD() untuk analisis data tanpa menghilangkan baris detail. (4) EXPLAIN ANALYZE — tool paling penting untuk debugging query lambat. Ia menunjukkan query plan: apakah database melakukan Sequential Scan (lambat) atau Index Scan (cepat), berapa baris yang di-scan vs yang di-return, dan di mana bottleneck-nya. Belajar membaca output EXPLAIN adalah skill yang membedakan junior dari senior.",
        why: "Database adalah bottleneck nomor satu di kebanyakan aplikasi. Query yang tidak optimal bisa membuat response time dari 50ms menjadi 5 detik. Kemampuan menulis query efisien dan membaca EXPLAIN plan adalah skill yang langsung terasa dampaknya di production.",
        mistake: "Menggunakan SELECT * padahal hanya butuh 2 kolom. Tidak menambahkan LIMIT pada query yang bisa return jutaan baris. Melakukan JOIN pada kolom yang tidak di-index. Menggunakan OFFSET untuk pagination pada dataset besar (gunakan cursor-based pagination).",
        interview: "Tulis query untuk mendapatkan top 3 product terlaris per kategori bulan ini. Jelaskan output EXPLAIN ANALYZE dari query yang lambat.",
        code: `-- Window Function: Top 3 per category
SELECT * FROM (
    SELECT 
        p.name, c.name AS category, 
        SUM(oi.quantity) AS total_sold,
        ROW_NUMBER() OVER (
            PARTITION BY c.id ORDER BY SUM(oi.quantity) DESC
        ) AS rank
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN order_items oi ON oi.product_id = p.id
    WHERE oi.created_at >= DATE_TRUNC('month', NOW())
    GROUP BY p.id, c.id
) ranked WHERE rank <= 3;

-- Cursor-based Pagination (Better than OFFSET)
SELECT * FROM orders 
WHERE created_at < '2024-01-15T10:00:00Z' 
ORDER BY created_at DESC LIMIT 20;`
      },
      {
        id: "indexing",
        title: "Indexing Strategy",
        depth: "B-Tree, Composite, Partial Indexes",
        content: "Index adalah struktur data (biasanya B-Tree) yang memungkinkan database menemukan baris tanpa scanning seluruh tabel. Tanpa index: O(n) sequential scan. Dengan index: O(log n) tree traversal. Jenis index yang penting: (1) Single Column Index — untuk query WHERE pada satu kolom. (2) Composite Index — untuk query dengan multiple WHERE conditions. Urutan kolom SANGAT penting: index (tenant_id, status) berguna untuk WHERE tenant_id = 1 AND status = 'active', tapi TIDAK berguna untuk WHERE status = 'active' saja (leftmost prefix rule). (3) Partial Index — index dengan kondisi, misalnya hanya index baris yang active. Menghemat storage dan lebih cepat. (4) Covering Index — index yang mencakup semua kolom yang dibutuhkan query, sehingga database tidak perlu mengakses tabel sama sekali (Index Only Scan).",
        why: "Setiap query lambat di production, langkah pertama adalah cek apakah ada index yang sesuai. Ini adalah optimasi dengan effort paling rendah tapi impact paling tinggi. Tapi ingat: setiap index memperlambat INSERT/UPDATE karena index harus di-update juga.",
        mistake: "Membuat index untuk setiap kolom secara individual (over-indexing). Tidak memahami leftmost prefix rule pada composite index. Tidak menggunakan EXPLAIN untuk memverifikasi apakah index benar-benar digunakan oleh query planner.",
        interview: "Jelaskan kapan database memilih untuk TIDAK menggunakan index meskipun index ada. Apa itu covering index?",
        code: `-- Composite Index (order matters!)
CREATE INDEX idx_orders_tenant_status 
ON orders (tenant_id, status);

-- This query USES the index:
SELECT * FROM orders WHERE tenant_id = 1 AND status = 'paid';

-- This query DOES NOT use the index:
SELECT * FROM orders WHERE status = 'paid';
-- (because status is not the leftmost column)

-- Partial Index (only index what you need)
CREATE INDEX idx_active_users 
ON users (email) WHERE deleted_at IS NULL;

-- Covering Index (Index-Only Scan)
CREATE INDEX idx_orders_cover 
ON orders (user_id, created_at) INCLUDE (total_amount);`
      },
      {
        id: "mongo-schema",
        title: "MongoDB Schema Design",
        depth: "Embed vs Reference, Denormalization",
        content: "MongoDB bukan 'schema-less', tapi 'schema-flexible'. Dua pola utama: (1) Embedding — menyimpan data related di dalam satu document. Bagus untuk data yang selalu diakses bersama dan yang relasi-nya 1:few. Contoh: User dengan alamat-alamatnya. (2) Referencing — menyimpan ObjectId sebagai foreign key. Bagus untuk relasi many:many atau data yang sangat besar. Membutuhkan populate/lookup. Prinsip utama: model data berdasarkan access pattern, bukan berdasarkan entitas. Jika frontend lo selalu menampilkan post beserta 5 komentar terakhir, embed 5 komentar di document post — jangan buat collection terpisah yang memerlukan JOIN (lookup). Denormalisasi adalah trade-off: data lebih cepat dibaca tapi lebih kompleks di-update.",
        why: "Schema design yang salah di MongoDB tidak bisa diperbaiki dengan 'tambah index'. Jika access pattern berubah, lo mungkin harus re-structure seluruh collection. Memahami embed vs reference sejak awal menghemat waktu refactoring berminggu-minggu.",
        mistake: "Memperlakukan MongoDB seperti SQL: membuat banyak collection kecil dan melakukan $lookup (JOIN) di mana-mana. Ini melawan kekuatan utama MongoDB. Sebaliknya, jangan meng-embed array yang bisa grow tanpa batas (document size limit 16MB).",
        interview: "Desain schema MongoDB untuk platform blog dengan users, posts, comments, dan likes. Jelaskan trade-off dari pilihan embed vs reference lo.",
        code: `// === EMBEDDING (1:Few, selalu diakses bersama) ===
const UserSchema = new Schema({
    name: String,
    addresses: [{       // Embedded — max 3-5 addresses
        street: String,
        city: String,
        isPrimary: Boolean
    }]
});

// === REFERENCING (1:Many, data besar) ===
const PostSchema = new Schema({
    title: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    commentCount: Number,  // Denormalized counter
});

// === HYBRID: Subset Pattern ===
const ProductSchema = new Schema({
    name: String,
    // Embed top 10 reviews (for display)
    topReviews: [{ body: String, rating: Number }],
    // Reference full reviews collection
    reviewCount: Number,
});`
      },
      {
        id: "caching",
        title: "Caching Strategy (Redis)",
        depth: "Cache patterns, invalidation, pitfalls",
        content: "Caching mengurangi load ke database dan mempercepat response time. Pola utama: (1) Cache-Aside (Lazy Loading) — app cek cache dulu, kalau miss baru query DB, lalu simpan ke cache. Paling umum digunakan. (2) Write-Through — setiap write ke DB juga menulis ke cache. Konsisten tapi menambah latency write. (3) Write-Behind — write ke cache dulu, asynchronously sync ke DB. Cepat tapi risiko data loss. Redis adalah pilihan paling populer: in-memory, support TTL, dan data structures (sorted sets, hashes). Cache invalidation adalah masalah tersulit: 'There are only two hard things in CS: cache invalidation and naming things.' Strategi: TTL-based (simpel, eventual consistency), event-based (publish invalidation event saat data berubah), atau versioned keys.",
        why: "Tanpa caching, database lo akan menjadi bottleneck di traffic tinggi. Caching yang tepat bisa mengurangi database load 80-90%. Tapi caching yang salah menyebabkan stale data — user melihat data lama.",
        mistake: "Caching tanpa TTL — data stale selamanya. Caching terlalu agresif pada data yang sering berubah. Tidak menangani cache stampede: saat cache expired, ratusan request serentak menghantam database (gunakan locking/single-flight pattern).",
        interview: "Jelaskan Cache-Aside pattern dan bagaimana menangani cache invalidation di sistem dengan multiple service. Apa itu cache stampede dan bagaimana mencegahnya?",
        code: `// === Cache-Aside Pattern (Node.js + Redis) ===
async function getUserById(id) {
    // 1. Check cache
    const cached = await redis.get(\`user:\${id}\`);
    if (cached) return JSON.parse(cached);
    
    // 2. Cache miss — query DB
    const user = await db.users.findById(id);
    if (!user) return null;
    
    // 3. Store in cache with TTL
    await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user));
    return user;
}

// === Cache Invalidation on Update ===
async function updateUser(id, data) {
    await db.users.updateOne({ _id: id }, data);
    await redis.del(\`user:\${id}\`);  // Invalidate
}

// === Go: singleflight to prevent stampede ===
var group singleflight.Group
func GetUser(id string) (*User, error) {
    val, err, _ := group.Do(id, func() (interface{}, error) {
        return db.GetUser(id)
    })
    return val.(*User), err
}`
      }
    ]
  }
];
