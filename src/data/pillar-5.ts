import type { Pillar } from './types'

export const pillar5: Pillar = {
  id: 'backend-node',
  title: 'Pillar 5 — Backend (Node.js)',
  topics: [
    {
      id: 'backend-architecture-101',
      title: 'Backend Architecture 101',
      depth: 'MVC and Layered Architecture',
      content: 'Membuat endpoint di `app.get()` itu mudah. Menjaga ratusan endpoint agar tidak menjadi "Spaghetti Code" adalah pekerjaan arsitektural.\n\n**Layered Architecture (N-Tier):** Memisahkan *concern* aplikasi ke dalam lapisan horizontal. Minimal 3 layer:\n1. **Router / Controller Layer:** Pintu gerbang. Tugasnya HANYA menerima request HTTP (req, res), memvalidasi input (JSON body/query), dan memanggil Service Layer. Controller **DILARANG** mengandung logika bisnis (perhitungan, aturan).\n2. **Service Layer (Business Logic):** Otak aplikasi. Di sinilah aturan bisnis berada (contoh: "User tidak boleh ditarik saldonya jika < 0"). Service tidak tahu menahu soal HTTP (req, res). Ia murni logika kode.\n3. **Data Access / Repository Layer:** Lapisan terbawah yang berbicara dengan Database (SQL/NoSQL) atau external API. Service tidak menulis query SQL; Service memanggil `UserRepository.find()`.\n\nMengapa repot-repot? Karena jika Anda ingin mengganti HTTP Express dengan gRPC besok, atau mengganti MySQL dengan MongoDB, Anda cukup mengganti Controller atau Repository-nya. **Service Layer (Business Logic) tetap utuh!**',
      why: 'Tanpa arsitektur layered, developer baru cenderung menulis query database directly di dalam file Controller. Akibatnya kode tidak bisa di-unit test (karena controller terikat dengan objek HTTP Request/Response) dan sangat rentan terhadap duplikasi jika endpoint lain butuh query yang sama.',
      mistake: 'Fat Controller: Menulis ratusan baris kode logika bisnis, query DB, dan kalkulasi di dalam blok `app.post()`. Jika Anda menulis query SQL atau `axios.post` langsung di controller HTTP, arsitektur Anda gagal.',
      interview: [
        {
          q: 'Mengapa Business Logic (Service Layer) tidak boleh menerima parameter req dan res dari HTTP?',
          a: 'Prinsip Separation of Concerns (SoC) dan Testability. Jika fungsi Service menerima req dan res, fungsi tersebut selamanya terikat pada konteks web server (Express/Fastify). Jika esok hari kita ingin mengeksekusi logika yang sama melalui sebuah CRON Job (di background, tanpa HTTP request) atau via CLI, kita tidak bisa. Selain itu, untuk melakukan unit test pada Service yang terikat req/res, kita harus repot mem-mock objek HTTP yang kompleks.'
        }
      ],
      code: '// FAT CONTROLLER (BAD)\napp.post("/withdraw", async (req, res) => {\n  const user = await db.query("SELECT * FROM users WHERE id = ?", [req.body.id]);\n  if (user.balance < req.body.amount) return res.status(400).send("No funds");\n  await db.query("UPDATE users SET balance = balance - ?", [req.body.amount]);\n  return res.send("OK");\n});\n\n// LAYERED ARCHITECTURE (GOOD)\n// Controller (Only handles HTTP)\nclass WalletController {\n  async withdraw(req, res) {\n    const result = await WalletService.processWithdrawal(req.body.id, req.body.amount);\n    return res.json(result);\n  }\n}\n// Service (Only handles Business Logic)\nclass WalletService {\n  async processWithdrawal(userId, amount) {\n    const balance = await UserRepository.getBalance(userId);\n    if (balance < amount) throw new Error("No funds");\n    return await UserRepository.deductBalance(userId, amount);\n  }\n}'
    },
    {
      id: 'middleware-pattern',
      title: 'The Middleware Pattern',
      depth: 'Request Interceptors and Chain of Responsibility',
      content: 'Di backend modern, sangat sedikit logika yang ditaruh langsung di controller. Sebagian besar hal-hal umum (Cross-Cutting Concerns) di-handle oleh **Middleware**.\n\nMiddleware adalah fungsi yang memiliki akses ke object `request`, `response`, dan fungsi `next()`. Mereka berbaris layaknya pipa (pipeline). Saat request masuk, ia melewati pipa ini secara berurutan. Di setiap titik, middleware bisa:\n1. Memodifikasi `req` (misal: menambahkan `req.user` hasil validasi JWT).\n2. Menghentikan request dan mengirim response langsung (misal: membalas 401 Unauthorized jika token tidak ada).\n3. Meneruskan request ke middleware berikutnya dengan memanggil `next()`.\n\n**Contoh Penggunaan:** Autentikasi (JWT check), Logging (mencatat IP dan waktu), Body Parsing (mengurai JSON string jadi Object), CORS header attachment, dan Error Handling (menangkap *throw error* di ujung pipa).',
      why: 'Memahami Middleware Pattern adalah kunci untuk bekerja dengan Node.js (Express, NestJS) atau Go (Gin, Echo). Tanpa middleware, Anda akan meng-copy-paste logika "cek token" di setiap 100 endpoint API Anda.',
      mistake: 'Lupa memanggil `next()` di dalam blok middleware. Request akan menggantung (hang) karena pipa berhenti. Dan memanggil `res.send()` tapi kemudian tetap memanggil `next()`, yang memicu error fatal "Cannot set headers after they are sent to the client".',
      interview: [
        {
          q: 'Bagaimana cara Anda men-setup Error Handler Global (Catch-all) di framework seperti Express, dan mengapa itu penting?',
          a: 'Di Express, Global Error Handler adalah middleware khusus dengan 4 parameter: (err, req, res, next), yang ditaruh di URUTAN PALING AKHIR setelah semua rute. Ini penting karena jika terjadi error di dalam endpoint mana pun, kita cukup memanggil next(err) atau men-throw error (di framework modern), dan error tersebut akan ditangkap di satu tempat sentral. Di tempat sentral inilah kita menyembunyikan stack trace dari user (hanya di env dev), me-log error ke sistem (Sentry), dan mengirim response JSON baku berformat 500 Internal Server Error secara konsisten.'
        }
      ],
      code: '// THE PIPELINE MENTAL MODEL\n// Request -> Middleware 1 -> Middleware 2 -> Controller -> Response\n\n// Auth Middleware Example\nconst requireAuth = (req, res, next) => {\n  const token = req.headers.authorization;\n  if (!token) {\n    return res.status(401).json({ error: "Missing token" }); // Stops pipeline!\n  }\n  \n  const user = verifyJWT(token);\n  req.user = user; // Attach user to request for the controller to use\n  next(); // Pass to the next function\n}\n\n// Applying middleware\napp.get("/api/dashboard", requireAuth, (req, res) => {\n  // This code only runs if requireAuth calls next()\n  res.send("Welcome " + req.user.name);\n});'
    },
    {
      id: 'node-architecture',
      title: 'Node.js Architecture & libuv',
      depth: 'V8 + libuv + thread pool + event loop phases',
      content: `Node.js menggabungkan V8 (JavaScript engine), libuv (async I/O library), dan built-in modules. Memahami arsitektur ini menjelaskan kenapa Node.js sangat baik untuk I/O-bound work dan sangat buruk untuk CPU-bound work.

**libuv Event Loop Phases:** Event loop bukan satu queue — ada beberapa phases berurutan: Timers (setTimeout/setInterval), Pending Callbacks (I/O callbacks dari sebelumnya), Poll (fetch I/O events baru, eksekusi callbacks), Check (setImmediate), Close Callbacks. Antara setiap phase, Node.js menguras seluruh Microtask Queue (Promise.then) dan nextTick Queue (process.nextTick — berjalan sebelum microtasks lain!).

**libuv Thread Pool:** Untuk operasi yang tidak bisa di-async oleh OS (file I/O, DNS, beberapa crypto), libuv menggunakan thread pool. Default: 4 threads. Artinya 5 concurrent fs.readFile() = 4 berjalan, 1 mengantri. Tingkatkan dengan UV_THREADPOOL_SIZE.

**Cluster vs Worker Threads:** Cluster: multiple Node.js processes (shared port via IPC, memory terpisah, crash satu tidak pengaruhi lain). Worker Threads: multiple threads dalam satu process (shared memory via SharedArrayBuffer, V8 isolate sendiri). Cluster untuk scaling I/O-bound server, Worker Threads untuk CPU-bound tasks.`,
      why: `Memahami event loop phases menjelaskan urutan eksekusi yang tidak intuitif. Thread pool yang tersumbat adalah silent bottleneck — file I/O tiba-tiba 10x lebih lambat tanpa pesan error apapun. Diagnosis: monitor lag event loop dengan perf_hooks atau clinic.js.`,
      mistake: `process.nextTick() rekursif bisa mem-starve seluruh event loop karena nextTick dieksekusi sebelum pindah ke phase apapun — tidak pernah memberi I/O callbacks kesempatan jalan. fs.readFileSync() di production handler: ini blocking syscall LANGSUNG di main thread, bukan melalui thread pool.`,
      interview: [
        {
          q: 'Apa urutan output dari: setTimeout(fn,0), setImmediate(fn), Promise.resolve().then(fn), process.nextTick(fn)?',
          a: 'Urutan: nextTick → Promise.then → setTimeout atau setImmediate (tergantung konteks). process.nextTick: masuk nextTick queue yang di-drain SEBELUM microtasks dan SEBELUM pindah ke phase event loop apapun. Promise.then: masuk Microtask queue, di-drain setelah nextTick queue, sebelum event loop lanjut ke phase berikutnya. setTimeout(fn, 0) vs setImmediate: jika di-call dari top-level (luar I/O callback), urutan antara keduanya TIDAK DETERMINISTIK karena bergantung pada timing system timer. Jika di-call dari dalam I/O callback (misalnya di dalam fs.readFile callback), setImmediate SELALU jalan sebelum setTimeout — karena setImmediate berada di Check phase yang langsung setelah Poll phase (di mana I/O callback berjalan). Ini salah satu gotcha terbesar Node.js.'
        },
        {
          q: 'Apa perbedaan Cluster module dan Worker Threads? Kapan menggunakan masing-masing?',
          a: 'Cluster module: menggunakan fork() untuk membuat multiple PROCESSES (bukan threads). Setiap process adalah instance Node.js terpisah dengan heap sendiri. Komunikasi via IPC (inter-process communication). Jika satu worker crash, tidak mempengaruhi master atau workers lain. Otomatis share port TCP — load balancing antar workers. PM2 mengabstraksikan ini. Gunakan Cluster untuk: scaling HTTP server di multi-core CPU, toleransi crash. Worker Threads: threads dalam SATU process yang sama. Bisa share memory via SharedArrayBuffer dan Atomics. V8 isolate terpisah (tidak ada GIL-like issue). Lebih ringan dari process. Komunikasi via postMessage (serialization cost) atau SharedArrayBuffer. Gunakan Worker Threads untuk: CPU-intensive tasks yang perlu komunikasi cepat, image processing, data parsing, encryption untuk menghindari blocking event loop.'
        },
        {
          q: 'Bagaimana cara mendeteksi dan mengatasi thread pool saturation di aplikasi Node.js?',
          a: 'Deteksi: ukur lag event loop dengan perf_hooks atau library clinic.js. Indikator: file I/O tiba-tiba lambat meskipun CPU dan network normal. Monitor: const start = Date.now(); setImmediate(() => console.log("Loop lag:", Date.now() - start)). Jika lag tinggi bersamaan dengan banyak file I/O = thread pool tersumbat. Verifikasi: tambahkan timestamp sebelum dan setelah fs.readFile(). Jika gap besar di tempat yang tidak terduga, thread pool saturated. Solusi: (1) UV_THREADPOOL_SIZE=16 (sebelum require apapun). Nilai optimal biasanya sama dengan jumlah core atau sedikit lebih. Max 1024. (2) Gunakan streaming (fs.createReadStream) alih-alih readFile untuk file besar — streaming tidak sepenuhnya mem-block thread pool. (3) Worker Threads untuk compute-heavy operations yang seharusnya tidak di thread pool. (4) Review penggunaan crypto — crypto.pbkdf2, crypto.randomBytes besar juga menggunakan thread pool.'
        }
      ],
      code: `// EVENT LOOP ORDER QUIZ
process.nextTick(() => console.log('1: nextTick'))
Promise.resolve().then(() => console.log('2: promise'))
setImmediate(() => console.log('3: setImmediate'))
setTimeout(() => console.log('4: setTimeout'), 0)
console.log('0: sync')
// Output: 0, 1, 2, (3 or 4 - non-deterministic at top level)

// WORKER THREADS: CPU task without blocking event loop
// main.ts
import { Worker } from 'worker_threads'

app.post('/encode', async (req, res) => {
    const result = await new Promise((resolve, reject) => {
        const worker = new Worker('./workers/encoder.js', {
            workerData: { input: req.body.data }
        })
        worker.on('message', resolve)
        worker.on('error', reject)
    })
    res.json({ result })
})

// workers/encoder.js
import { workerData, parentPort } from 'worker_threads'
const result = heavyEncoding(workerData.input) // OK to block here
parentPort?.postMessage(result)

// THREAD POOL: Monitor saturation
process.env.UV_THREADPOOL_SIZE = '16' // Set BEFORE any require

const { performance } = require('perf_hooks')
const before = performance.now()
fs.readFile('data.csv', () => {
    const wait = performance.now() - before
    if (wait > 100) console.warn(\`Thread pool lag: \${wait}ms — increase UV_THREADPOOL_SIZE?\`)
})`
    },
    {
      id: 'api-architecture',
      title: 'Production API Architecture',
      depth: 'REST vs GraphQL vs tRPC, Zod validation, rate limiting',
      content: `Arsitektur API adalah keputusan fundamental. REST untuk public/multi-client, GraphQL untuk BFF (Backend for Frontend) dengan banyak clients, tRPC untuk full-stack TypeScript monorepo.

**REST:** Universal, semua HTTP tooling support. Over-fetching dan under-fetching adalah trade-off yang bisa dimitigasi dengan sparse fieldsets dan resource embedding.

**GraphQL:** Client menentukan persis data yang dibutuhkan. Eliminasi over/under-fetching. Masalah: N+1 query (gunakan DataLoader untuk batching), query complexity attacks, caching lebih kompleks (semua POST ke satu endpoint).

**tRPC:** End-to-end type safety antara TypeScript backend dan frontend tanpa code generation. Prosedur server = fungsi yang bisa dipanggil dari client seperti local function call. Hanya untuk TypeScript. Ideal untuk Next.js monorepo.

**Validation (Zod):** Selalu validasi input di server. Zod: TypeScript-first schema yang bisa di-reuse antara frontend dan backend. type inference otomatis dari schema. safeParse() untuk explicit error handling.

**Rate Limiting:** Sliding Window dengan Redis lebih presisi dari Fixed Window. Implementasi: Redis sorted set atau lua script atomic. Ekspos headers X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After.`,
      why: `API yang tidak divalidasi menyebabkan kerentanan security. Tidak ada rate limiting = rentan DoS. Pilihan arsitektur yang salah di awal mahal untuk di-refactor ketika tim dan clients sudah banyak.`,
      mistake: `Return 200 OK untuk semua response termasuk error dengan { status: "error" } di body — mematikan semua monitoring berbasis HTTP status. Tidak memvalidasi tipe dan range data (angka negatif sebagai quantity, string panjang sebagai nama). Tidak membatasi ukuran request body — attacker bisa kirim payload 10GB.`,
      interview: [
        {
          q: 'Apa trade-off antara REST dan GraphQL? Kapan GraphQL menjadi pilihan yang tepat?',
          a: 'REST: Universal compatibility (semua HTTP client), simple caching (per URL), mudah di-secure dan di-monitor, familiar bagi semua developer. Kelemahan: over-fetching (response lebih banyak dari yang dibutuhkan), under-fetching (butuh multiple requests), setiap endpoint baru butuh backend change. GraphQL: client request persis data yang dibutuhkan, satu endpoint untuk semua queries, schema-first development (kontrak jelas), introspection built-in. Kelemahan: tidak bisa pakai standard HTTP caching (semua POST ke /graphql), N+1 problem butuh DataLoader, query complexity bisa mahal, learning curve lebih tinggi, security lebih kompleks (depth limiting, complexity limits). GraphQL tepat ketika: mobile app dengan bandwidth terbatas (minimasi data transfer), banyak client type berbeda dengan kebutuhan data berbeda (web, iOS, Android, partner), atau tim frontend butuh otonomi menentukan data yang dibutuhkan tanpa selalu minta backend.'
        },
        {
          q: 'Jelaskan perbedaan antara Token Bucket dan Sliding Window algorithm untuk rate limiting.',
          a: 'Token Bucket: sebuah "bucket" dengan kapasitas N token. Token ditambahkan dengan rate tertentu (misalnya 10/detik). Setiap request mengkonsumsi 1 token. Jika bucket kosong, request ditolak. Keunggulan: membolehkan burst hingga kapasitas bucket (user bisa kirim 100 request sekaligus jika bucket penuh). Implementasi sederhana dengan atomic counter. Fixed Window: hitung request dalam window tetap (e.g., per menit). Window berganti setiap menit. Masalah: user bisa abuse di boundary window — 100 request di detik ke-59, 100 lagi di detik ke-61 = 200 request dalam 2 detik meskipun limit 100/menit. Sliding Window: track timestamp setiap request. Saat request baru, hitung berapa request dalam window terakhir. Lebih presisi, tidak ada boundary problem. Implementasi: Redis Sorted Set — score = timestamp, member = unique request ID. ZREMRANGEBYSCORE untuk hapus yang expired, ZCARD untuk count. Lebih mahal dari Fixed Window tapi lebih fair.'
        },
        {
          q: 'Bagaimana Zod berbeda dari plain TypeScript types dan mengapa lebih baik untuk runtime validation?',
          a: 'TypeScript types hanya exist pada compile-time. Setelah compilation, semua type information hilang — tidak ada runtime type checking. JSON.parse("{}") return type any, dan TypeScript tidak bisa memproteksi data dari API eksternal, user input, atau environment variables. Zod adalah runtime validation library yang juga menghasilkan TypeScript types. Schema yang sama: (1) Melakukan validasi di runtime (reject data yang tidak sesuai dengan error yang detail), (2) Generate TypeScript type dari schema dengan type z.infer<typeof schema>. Keunggulan: satu source of truth — schema mendefinisikan shape DAN type sekaligus. Tidak perlu duplicate definition (interface User + validation code terpisah). safeParse() mengembalikan { success: true, data: T } | { success: false, error: ZodError } tanpa throw — lebih explicit dalam error handling. Error messages descriptif per field. Bisa dicompose: z.object({ users: z.array(UserSchema) }) di mana UserSchema digunakan di tempat lain juga.'
        }
      ],
      code: `// ZOD: Schema-first validation
import { z } from 'zod'

const CreateOrderSchema = z.object({
    userId: z.string().uuid(),
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(100),
    })).min(1).max(50),
    couponCode: z.string().optional(),
})

type CreateOrderInput = z.infer<typeof CreateOrderSchema>  // Auto-generated!

app.post('/orders', async (req, res) => {
    const result = CreateOrderSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({
            error: { code: 'VALIDATION_ERROR', details: result.error.flatten().fieldErrors }
        })
    }
    const order = await createOrder(result.data)  // Type-safe!
    res.status(201).json({ data: order })
})

// SLIDING WINDOW RATE LIMIT (Redis)
async function slideLimit(id: string, max: number, windowMs: number) {
    const now = Date.now()
    const key = \`rl:\${id}\`
    const pipe = redis.pipeline()
    pipe.zremrangebyscore(key, '-inf', now - windowMs)
    pipe.zadd(key, now, \`\${now}-\${crypto.randomUUID()}\`)
    pipe.zcard(key)
    pipe.pexpire(key, windowMs)
    const [,,count] = await pipe.exec() as any[]
    return { allowed: count <= max, count }
}`
    },
    {
      id: 'testing-strategy',
      title: 'Testing Strategy & Architecture',
      depth: 'Testing pyramid, DI for testability, integration testing',
      content: `Testing adalah tentang membangun confidence bahwa perubahan tidak merusak hal yang tidak terduga, bukan tentang mencapai 100% coverage.

**Testing Pyramid:** Unit Tests (banyak, cepat, murah): test fungsi/method di isolation dengan dependensi di-mock. Cocok untuk business logic kompleks. Integration Tests (sedang): test interaksi beberapa komponen — route handler + middleware + database (test DB). E2E Tests (sedikit, paling lambat): test critical user flows menggunakan Playwright atau Cypress.

**Dependency Injection untuk Testability:** Kode yang hardcode dependensi (import db langsung di service) sulit di-test. Inject dependensi via constructor parameter — service menerima repository interface, test inject mock. Ini juga prinsip SOLID: Dependency Inversion.

**Integration Testing dengan Supertest:** Test route handler dengan actual middleware stack tapi test database. Setiap test dalam transaction yang di-rollback setelah selesai — isolasi dan clean state.

**Test Doubles:** Stub (return nilai tetap), Mock (verify pemanggilan dengan argumen tertentu), Spy (wrap fungsi asli dan catat info call), Fake (implementasi sederhana — in-memory DB). Jangan over-mock: jika mock segalanya, test hanya memverifikasi mock dipanggil, bukan bahwa sistem benar.`,
      why: `Test suite yang solid adalah safety net untuk refactoring. Tanpa test, developer takut mengubah kode lama. Dengan test, CI/CD memberitahu jika ada regresi. Test adalah dokumentasi executable yang tidak pernah outdated.`,
      mistake: `Testing implementation detail (bahwa fungsi internal X dipanggil) alih-alih behavior (output yang benar). Test seperti ini brittle — rusak setiap kali refactor internals meskipun behavior tidak berubah. Test harus sebagai black-box dari perspektif user.`,
      interview: [
        {
          q: 'Jelaskan Testing Pyramid. Mengapa banyak unit tests tapi sedikit E2E?',
          a: 'Testing Pyramid (Kent Beck) menggambarkan proporsi ideal tests. Di bawah (base): banyak Unit Tests — cepat (milidetik), murah (tidak butuh infrastructure), isolated, mudah di-debug. Di tengah: lebih sedikit Integration Tests — lebih lambat (detik), butuh test database/cache, tapi memverifikasi bahwa komponen bekerja bersama. Di atas (tip): sedikit E2E Tests — paling lambat (menit per test), paling mahal (butuh full environment), paling fragile (UI berubah, test rusak), tapi memverifikasi user journey yang sesungguhnya. Kenapa banyak unit, sedikit E2E: Unit test memberikan feedback paling cepat ke developer. E2E yang banyak membuat CI pipeline lambat (30 menit per run = frustrasi tim, developer bypass CI). E2E lebih fragile — perubahan UI kecil rusak puluhan test. Fokus E2E hanya pada critical paths (login, checkout, core feature) dan biarkan unit/integration cover edge cases.'
        },
        {
          q: 'Apa perbedaan antara Mock, Stub, dan Spy dalam testing?',
          a: 'Stub: pengganti sederhana yang MENGEMBALIKAN NILAI yang sudah ditentukan. Tidak peduli dengan cara ia dipanggil. Contoh: getUser.stub.returns({ id: 1, name: "Alice" }). Digunakan untuk: membuat dependency return value tertentu agar kode yang ditest bisa berjalan. Mock: seperti stub TAPI juga MEMVERIFIKASI PEMANGGILAN — berapa kali dipanggil, dengan argumen apa, dalam urutan apa. Test akan fail jika ekspektasi pemanggilan tidak terpenuhi. Contoh: emailService.mock.verify().wasCalledOnceWith("welcome@email.com"). Digunakan untuk: memverifikasi bahwa kode kita memanggil dependency dengan benar (side effects). Spy: MEMBUNGKUS implementasi ASLI dan MEREKAM info pemanggilan. Berbeda dari mock — kode aslinya masih berjalan. Contoh: jest.spyOn(console, "log") masih menjalankan console.log tapi juga merekam kapan ia dipanggil. Digunakan untuk: verifikasi bahwa sesuatu dipanggil tanpa mengganti implementasinya. Fake: implementasi SEDERHANA tapi BERFUNGSI. Contoh: in-memory database yang implement interface yang sama dengan database nyata. Lebih realistic dari stub tapi lebih cepat dari database nyata.'
        },
        {
          q: 'Bagaimana cara men-test Express route yang bergantung pada database tanpa menyentuh database production?',
          a: 'Ada beberapa pendekatan: (1) Test Database: buat database PostgreSQL terpisah untuk testing. Jalankan migration yang sama. Setiap test suite menggunakan beforeAll untuk seed data dan afterAll untuk cleanup. Lebih realistic, tapi lebih lambat setup. Gunakan test containers (testcontainers library) untuk spin up PostgreSQL di Docker secara otomatis di CI. (2) Transaction Rollback: jalankan setiap test dalam database transaction yang di-rollback setelah selesai. Data tidak persist antar tests. Lebih cepat dari full recreate. (3) Repository Pattern + Mocking: inject mock repository ke service. Test hanya verifikasi bahwa service memanggil repository dengan parameter yang benar. Cepat tapi kurang realistic — tidak memverifikasi query SQL. (4) SQLite In-Memory: jika ORM support multiple databases, gunakan SQLite in-memory untuk testing. Jauh lebih cepat, tidak butuh Docker. Trade-off: SQLite punya beberapa perbedaan behavior dari PostgreSQL. Rekomendasi: kombinasi — unit test dengan mocking untuk business logic, integration test dengan test containers untuk database layer.'
        }
      ],
      code: `// DEPENDENCY INJECTION for Testability
interface UserRepo {
    findById(id: string): Promise<User | null>
    save(user: User): Promise<User>
}

class UserService {
    constructor(private repo: UserRepo) {}  // Injected!

    async promoteToAdmin(id: string): Promise<User> {
        const user = await this.repo.findById(id)
        if (!user) throw new Error('User not found')
        if (user.role === 'admin') throw new Error('Already admin')
        return this.repo.save({ ...user, role: 'admin' })
    }
}

// Unit test — zero infrastructure needed
describe('UserService.promoteToAdmin', () => {
    it('throws when user not found', async () => {
        const mockRepo: UserRepo = {
            findById: jest.fn().mockResolvedValue(null),
            save: jest.fn(),
        }
        const service = new UserService(mockRepo)
        await expect(service.promoteToAdmin('999')).rejects.toThrow('User not found')
        expect(mockRepo.save).not.toHaveBeenCalled()
    })
})

// Integration test — real DB in transaction
describe('POST /users', () => {
    beforeEach(() => db.raw('BEGIN'))
    afterEach(() => db.raw('ROLLBACK'))  // Clean state

    it('returns 201 with valid payload', async () => {
        const res = await request(app)
            .post('/users')
            .send({ name: 'Bob', email: 'bob@test.com' })
        expect(res.status).toBe(201)
        expect(res.body.data.id).toBeDefined()
    })
})`
    }
  ]
}
