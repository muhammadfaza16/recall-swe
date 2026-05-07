import type { Pillar } from './types'

export const pillar1: Pillar = {
  id: 'system-foundations',
  title: 'Pillar 1 — System Foundations',
  topics: [
    {
      id: 'memory-management',
      title: 'Memory: Stack, Heap & Garbage Collection',
      depth: 'How programs manage memory — V8, Go GC, escape analysis',
      image: '/illustrations/memory.png',
      content: `Setiap program mendapat dua wilayah memori utama dari OS: Stack dan Heap. Memahami perbedaannya secara mendalam adalah dasar dari debugging memory leak dan performance tuning di production.

**Stack Memory:** Region memori yang terstruktur dan dikelola otomatis dengan pola LIFO. Setiap fungsi dipanggil → stack frame dibuat (berisi parameter, variabel lokal, return address). Fungsi return → frame langsung dibuang. Tidak ada overhead apapun. Inilah kenapa operasi di Stack sangat cepat. Masalah: Stack memiliki ukuran terbatas (biasanya 1-8MB per thread). Rekursi terlalu dalam → Stack Overflow.

**Heap Memory:** Pool memori besar yang dikelola secara dinamis. Data yang lifetime-nya tidak dapat diprediksi saat compile-time harus masuk Heap — objek yang di-return dari fungsi, array yang ukurannya ditentukan runtime. Akses Heap lebih lambat dari Stack (pointer dereference + potential cache miss) dan pengelolaan memerlukan bookkeeping.

**Go: Escape Analysis:** Go compiler menentukan Stack vs Heap melalui Escape Analysis. Jika variabel "escapes" dari scope fungsi (pointer di-return atau disimpan di struct yang hidup lebih lama), variabel masuk Heap dan menjadi tanggung jawab GC. Jalankan 'go build -gcflags="-m"' untuk melihat keputusan escape analysis.

**V8 GC (Node.js):** Generational GC. Young Generation (Scavenger/Minor GC — berjalan sangat sering, sangat cepat, mengelola objek baru) dan Old Generation (Mark-Sweep-Compact/Major GC — berjalan jarang, lebih lambat). Major GC bisa menyebabkan "stop-the-world" pause — seluruh eksekusi JS berhenti sampai GC selesai.

**Go GC: Tri-Color Mark-Sweep:** Semua objek dimulai sebagai "white". GC dimulai dari roots (stack, globals) dan menandai objek yang bisa dijangkau sebagai "grey" lalu "black". Objek yang tetap "white" adalah garbage. Go GC berjalan concurrent (tidak fully stop-the-world) dengan target latency 1-2ms pause time.`,
      why: `Di production: memory leak menyebabkan server crash setelah berjam-jam running. Di Go, struct kecil yang di-pass by value (bukan pointer) menghindari Heap allocation dan mengurangi GC pressure — langsung berdampak pada latency. Di Node.js, menyimpan data besar di closure atau module-level variable mengisi Old Generation dan menyebabkan Major GC yang membuat server lag.`,
      mistake: `Di Go: reflex me-return pointer dari setiap fungsi dengan asumsi "menghindari copy lebih efisien". Untuk struct kecil (< ~128 bytes), copy by value di Stack jauh lebih cepat dari Heap allocation + GC overhead. Di Node.js: tidak pernah menghapus event listener. Setiap emitter.on(event, handler) yang tidak di-off() menyimpan referensi ke handler (closure), yang bisa menyimpan referensi ke objek besar — classic Node.js memory leak.`,
      interview: [
        {
          q: 'Apa perbedaan antara Stack dan Heap? Mengapa Stack lebih cepat?',
          a: 'Stack: blok memori yang dikelola dengan pointer tunggal (stack pointer). Allocate = geser pointer ke bawah (satu instruksi CPU). Deallocate = geser pointer ke atas (satu instruksi). Sangat cepat dan predictable. Kelemahannya: ukuran terbatas dan data tidak bisa hidup melebihi scope fungsinya. Heap: pool memori besar yang dikelola oleh allocator (jemalloc, tcmalloc, GC). Allocate = cari blok kosong yang cukup besar (bisa perlu scan atau metadata lookup). Deallocate = kembalikan ke pool + update bookkeeping. Lebih lambat, tapi data bisa hidup selama diperlukan (sampai GC collect atau explicit free). Cache locality juga berbeda: Stack data biasanya berdekatan di memori (cache-friendly), Heap data bisa tersebar (cache miss lebih sering).'
        },
        {
          q: 'Apa itu "stop-the-world" GC pause dan bagaimana Go mengatasinya?',
          a: '"Stop-the-world" (STW) berarti GC menghentikan SEMUA thread aplikasi sementara ia bekerja. Tidak ada kode aplikasi yang berjalan selama STW. Di aplikasi yang latency-sensitive (server API, game), STW pause ratusan milidetik adalah bencana. Go mengatasinya dengan concurrent, tricolor mark-sweep GC. Sebagian besar pekerjaan GC (marking) terjadi concurrent dengan aplikasi yang terus berjalan. STW hanya terjadi di dua titik kecil: scan roots (goroutine stacks) dan finalize sweep. Go menarget < 1ms STW pause. Go juga mendorong programmer untuk menulis "GC-friendly" code: lebih sedikit pointer, lebih sedikit allocations, gunakan sync.Pool untuk reuse objek mahal.'
        },
        {
          q: 'Bagaimana cara mendeteksi memory leak di aplikasi Node.js production?',
          a: 'Langkah 1: Monitor heapUsed melalui process.memoryUsage() secara periodik. Jika heapUsed terus naik tanpa pernah turun meskipun setelah GC, ada leak. Langkah 2: Ambil heap snapshot menggunakan Chrome DevTools (connect ke Node.js dengan --inspect) atau modul v8.writeHeapSnapshot(). Ambil dua snapshot: satu di awal, satu setelah beberapa waktu. Langkah 3: Bandingkan dua snapshot di Chrome Memory panel → klik "Comparison". Lihat objek yang bertambah terus (positif delta, banyak count). Penyebab umum: global variable yang terus tumbuh, event listener yang tidak diremove, timer (setInterval) yang tidak di-clearInterval, Promise yang tidak pernah resolve/reject (goroutine leak equivalent).'
        }
      ],
      code: `// GO: Escape Analysis
// go build -gcflags="-m" main.go

func sum(a, b int) int {
    result := a + b   // On STACK — no GC overhead
    return result     // Return by value (copy)
}

func newConfig(port int) *Config {
    cfg := Config{Port: port} // Compiler: "moved to heap: cfg"
    return &cfg               // Pointer escapes → Heap allocation
}

// Better for small structs: let caller own memory
func fillConfig(cfg *Config, port int) {
    cfg.Port = port   // No allocation — caller's stack/heap
}

// NODE.JS: Memory leak patterns
// LEAK 1: Unbounded cache (grows forever)
const cache = new Map()
app.get('/user/:id', async (req, res) => {
    if (!cache.has(req.params.id)) {
        cache.set(req.params.id, await db.find(req.params.id))
    }
    res.json(cache.get(req.params.id))
})
// FIX: LRU cache with size limit
import { LRUCache } from 'lru-cache'
const lru = new LRUCache<string, User>({ max: 500 })

// LEAK 2: Forgotten event listener
process.on('SIGTERM', handleShutdown) // Never removed!
// FIX: Remove when no longer needed
process.once('SIGTERM', handleShutdown) // 'once' auto-removes

// MONITOR: Track heap usage
setInterval(() => {
    const { heapUsed, heapTotal } = process.memoryUsage()
    console.log(\`Heap: \${(heapUsed/1024/1024).toFixed(1)}MB / \${(heapTotal/1024/1024).toFixed(1)}MB\`)
}, 30_000)`
    },
    {
      id: 'concurrency-models',
      title: 'Concurrency Models Deep Dive',
      depth: 'Event Loop, M:N Goroutines, OS Threads, Python GIL',
      image: '/illustrations/concurrency.png',
      content: `Concurrency adalah tentang menangani banyak hal sekaligus (struktur). Parallelism adalah tentang mengerjakan banyak hal secara harfiah bersamaan (eksekusi). Lo bisa punya concurrent program yang berjalan di single-core (tidak parallel), dan parallel program yang tidak concurrent.

**Thread-Based (Java, C++ tradisional):** Setiap request mendapat OS Thread sendiri. OS Thread: stack 1-2MB default, context switch mahal (save/restore ratusan register CPU, TLB flush). Skalabilitas terbatas: server 32GB RAM hanya bisa handle ~16,000 thread sebelum kehabisan memori untuk stack.

**Event Loop (Node.js):** Single-threaded. Semua kode JS berjalan di satu thread. Operasi I/O di-delegate ke kernel (via libuv yang menggunakan epoll di Linux). Saat kernel selesai, callback masuk ke queue dan dieksekusi saat call stack kosong. Keunggulan: efisien untuk I/O-bound work, tidak ada race condition di shared state. Kelemahan fatal: satu CPU-bound task memblokir SELURUH server.

**M:N Goroutines (Go):** Go runtime mengimplementasikan scheduler sendiri di user-space. M OS Threads mengeksekusi N Goroutines. Goroutine ringan (~2-8KB stack awal vs 1-2MB OS Thread). Context switch di user-space, jauh lebih murah dari kernel context switch. Work Stealing: jika satu P kehabisan goroutine, ia mencuri dari P lain, memastikan semua core CPU terisi.

**Python GIL (Global Interpreter Lock):** CPython hanya bisa mengeksekusi satu thread Python pada satu waktu, bahkan di multi-core. Threading Python hanya berguna untuk I/O-bound (GIL dilepas saat menunggu I/O). Untuk CPU-bound: gunakan multiprocessing (separate processes) atau library yang melepaskan GIL (numpy, pandas menggunakan C extensions).`,
      why: `Ini adalah fondasi dari setiap keputusan arsitektur backend. Apakah butuh message queue? Worker pool? Kenapa Next.js lebih cepat dari Node.js murni untuk rendering? Semua bergantung pada pemahaman concurrency model. Senior engineer tahu kapan Node.js cukup, kapan harus pakai Go, dan kapan harus pindah ke message queue untuk async processing.`,
      mistake: `Menjalankan bcrypt.hash() (CPU-intensive, ~100-300ms) di dalam Express request handler tanpa async version. Ini memblokir seluruh event loop. Di Go: spawn goroutine tanpa batas di dalam HTTP handler — saat traffic spike, ribuan goroutine menyebabkan memory exhaustion.`,
      interview: [
        {
          q: 'Apa yang terjadi jika kita menjalankan sorting 10 juta elemen di dalam handler Express.js? Bagaimana solusinya?',
          a: 'Event loop Node.js akan terblokir sepenuhnya selama operasi sorting berjalan (bisa ratusan milidetik sampai beberapa detik). Selama itu, tidak ada request lain yang bisa diproses — semua request masuk akan timeout atau menunggu di queue. Server yang seharusnya bisa handle 10,000 req/s secara efektif menjadi tidak responsif. Solusi: (1) Worker Threads — pindahkan heavy computation ke worker_threads yang punya V8 isolate terpisah dan tidak memblokir event loop utama. (2) Child Process — spawn proses terpisah untuk komputasi. (3) Restructuring — lakukan sorting saat data masuk (indexing) bukan saat query, sehingga query hanya perlu membaca data yang sudah sorted. (4) Jika memungkinkan, delegate ke database (ORDER BY jauh lebih efisien karena database punya index).'
        },
        {
          q: 'Jelaskan perbedaan fundamental antara Node.js Event Loop dan Go M:N Scheduler dalam menangani 10,000 concurrent connections.',
          a: 'Node.js: Satu OS thread menangani semua 10,000 connections. epoll (Linux) memberi tahu Node.js mana saja connections yang punya data tersedia. Node.js memproses callbacks satu per satu dari event queue. Jika satu callback lambat (CPU-bound), semua 9,999 connections lain menunggu. Sangat efisien untuk I/O-bound (mayoritas connections hanya menunggu), tapi rentan terhadap CPU-bound work. Go: Membuat 10,000 goroutines (total ~80MB RAM untuk stack, vs ~20GB untuk 10,000 OS threads). GOMAXPROCS OS threads (misal 8 thread untuk 8-core CPU) mengeksekusi goroutines. Saat goroutine blocked I/O, Go runtime parkir goroutine tersebut dan jalankan goroutine lain pada OS thread yang sama. CPU-bound juga OK karena ada work stealing antar OS threads.'
        },
        {
          q: 'Mengapa Python sulit untuk CPU-bound parallel computing meskipun punya library threading?',
          a: 'Python CPython interpreter memiliki GIL (Global Interpreter Lock) — sebuah mutex yang harus dipegang sebelum mengeksekusi Python bytecode. Ini berarti meskipun ada 8 OS threads, hanya 1 yang bisa mengeksekusi Python bytecode pada satu waktu. Threads di Python sangat berguna untuk I/O-bound karena GIL dilepas saat menunggu I/O syscall (disk, network) — thread lain bisa masuk. Untuk CPU-bound: (1) multiprocessing module — spawn proses terpisah (bukan thread), masing-masing punya GIL sendiri, bisa benar-benar parallel. Overhead: lebih berat (fork process, IPC untuk communicate). (2) Ekstensi C/Cython yang melepaskan GIL saat komputasi (numpy, scipy melakukan ini). (3) Alternatif: gunakan bahasa lain (Go, Rust) untuk CPU-bound work, atau gunakan process pool dengan celery.'
        }
      ],
      code: `// NODE.JS: DON'T block the Event Loop
// BAD: bcrypt.hashSync blocks all other requests for ~200ms
app.post('/register', (req, res) => {
    const hash = bcrypt.hashSync(req.body.password, 12) // CPU block!
    db.save({ hash })
})

// GOOD: async version uses libuv thread pool
app.post('/register', async (req, res) => {
    const hash = await bcrypt.hash(req.body.password, 12) // Non-blocking
    await db.save({ hash })
})

// EVEN BETTER for CPU tasks: Worker Thread
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'

app.post('/analyze', (req, res) => {
    const worker = new Worker('./heavy-compute.js', {
        workerData: req.body
    })
    worker.on('message', result => res.json(result))
    worker.on('error', err => res.status(500).json({ error: err.message }))
})

// GO: Bounded worker pool
func processJobs(jobs <-chan Job) <-chan Result {
    results := make(chan Result, 100)
    const numWorkers = 10

    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                results <- process(job)
            }
        }()
    }
    go func() { wg.Wait(); close(results) }()
    return results
}`
    },
    {
      id: 'io-deep-dive',
      title: 'I/O Models & epoll Internals',
      depth: 'Blocking, Non-blocking, Multiplexing, io_uring',
      content: `I/O adalah operasi yang paling sering dilakukan server backend: baca dari database, tulis ke disk, kirim HTTP ke service lain. Ada empat model I/O yang berbeda secara fundamental.

**Blocking I/O:** Thread memanggil syscall read(), kernel menghentikan thread sampai data siap. Thread tidak bisa melakukan hal lain. Model paling sederhana — satu thread per connection. Masalah: ribuan connections = ribuan thread yang kebanyakan hanya tidur menunggu.

**Non-blocking I/O:** Syscall return segera dengan EAGAIN jika data belum siap. Thread bisa melanjutkan. Tapi thread harus polling (memanggil syscall berulang untuk cek) — CPU wasted doing nothing useful.

**I/O Multiplexing (epoll):** Solusi sebenarnya. Satu thread mendaftar banyak file descriptors ke kernel via epoll_ctl(). Thread memanggil epoll_wait() dan kernel membangunkan thread HANYA ketika ada event. Satu thread efisien menunggu ribuan connections. epoll (Linux) lebih efisien dari select/poll karena tidak perlu memindahkan seluruh daftar FD ke kernel setiap panggilan — menggunakan callback-based notification dengan internal red-black tree.

**Async I/O (io_uring):** Linux 5.1+. Dua ring buffers di shared memory antara user-space dan kernel: submission queue (app mendaftarkan operasi) dan completion queue (kernel menaruh hasil). Zero syscall overhead untuk batch operations. Tokio (Rust async runtime) memanfaatkan ini untuk performa luar biasa.

**libuv Thread Pool:** Node.js menggunakan epoll/kqueue untuk network I/O (sangat cepat). Untuk file system I/O, Node.js menggunakan thread pool (default 4 threads) karena kebanyakan OS tidak mendukung async file I/O dengan baik.`,
      why: `Saat debugging mengapa server lambat di traffic tinggi, lo perlu tahu model I/O mana yang digunakan. Apakah bottleneck di epoll (network) atau thread pool (file I/O)? Ini menentukan apakah solusinya horizontal scaling, menambah thread pool size (UV_THREADPOOL_SIZE), atau menggunakan streaming.`,
      mistake: `Menggunakan fs.readFileSync() atau fs.writeFileSync() di production Node.js handler. Ini menggunakan blocking syscall LANGSUNG di main thread — bukan melalui thread pool — memblokir seluruh event loop. Ini bug serius. Selalu gunakan fs.promises.readFile() atau fs.createReadStream().`,
      interview: [
        {
          q: 'Bagaimana epoll berbeda dari select/poll? Mengapa epoll lebih scalable?',
          a: 'select/poll: setiap kali ingin mengetahui FD mana yang siap, aplikasi harus mengirimkan SELURUH daftar FD ke kernel (O(n) copy per call). Kernel scan semua FD (O(n)). Untuk 10,000 FDs, setiap epoll_wait() call = 10,000 item di-copy ke kernel + kernel scan 10,000 item. epoll: bekerja secara berbeda. epoll_ctl() mendaftarkan/memodifikasi FD ke kernel SATU PER SATU (O(1) per registration). Kernel menyimpan daftar FD dalam red-black tree internal. epoll_wait() hanya me-return FDs yang benar-benar aktif (event-driven, bukan polling). Untuk 10,000 FDs dengan 100 aktif: epoll_wait() hanya return 100 items, O(1) per FD ready. Inilah kenapa epoll bisa mengelola C10K (10,000 connections) dengan satu thread.'
        },
        {
          q: 'Mengapa Node.js bisa handle 10,000 concurrent network connections tapi hanya 4 concurrent file reads?',
          a: 'Network I/O di Node.js menggunakan epoll/kqueue melalui libuv. Ini adalah kernel-level I/O multiplexing — satu thread OS bisa menunggu event dari ribuan sockets sekaligus. Saat socket ada datanya, callback dijadwalkan di event loop. File system I/O adalah cerita yang berbeda. Sebagian besar OS tidak mendukung truly async file I/O dengan interface yang clean (io_uring baru ada di Linux 5.1, dan belum fully adopted). libuv mengatasinya dengan thread pool: setiap fs.readFile() dijalankan oleh satu dari 4 thread (default). 5 concurrent readFile() → 4 berjalan, 1 mengantri. Solusi: UV_THREADPOOL_SIZE=16 node server.js, atau gunakan streaming (fs.createReadStream()) yang lebih memory-efficient dan tidak fully blocking thread pool.'
        },
        {
          q: 'Apa itu io_uring dan mengapa ia lebih efisien dari epoll untuk high-throughput I/O?',
          a: 'io_uring (Linux 5.1+) adalah interface I/O asynchronous yang menggunakan dua circular ring buffers di shared memory antara user-space dan kernel: Submission Queue (SQ) di mana aplikasi menulis operasi yang ingin dikerjakan, dan Completion Queue (CQ) di mana kernel menulis hasilnya. Keunggulan: (1) Zero-copy: tidak ada data yang di-copy antara user dan kernel space. (2) Batching: bisa submit ratusan operasi dalam satu syscall io_uring_submit(). (3) True async: file I/O, network, dan bahkan process operations bisa di-queue dan dikerjakan benar-benar async. (4) Reduced syscall overhead: dengan SQPOLL mode, kernel thread terus polling SQ tanpa perlu syscall dari user space sama sekali. Rust Tokio runtime dan beberapa Node.js addon sudah menggunakan io_uring untuk performa yang jauh lebih tinggi.'
        }
      ],
      code: `// NODE.JS: File I/O — Thread Pool Awareness
// BAD: Synchronous — blocks main thread!
app.get('/config', (req, res) => {
    const data = fs.readFileSync('/config.json') // Hard block!
    res.json(JSON.parse(data))
})

// BAD: Many concurrent readFile() saturate thread pool
// If UV_THREADPOOL_SIZE=4 (default), 5th call WAITS
await Promise.all([
    fs.promises.readFile('a.txt'), // Thread 1
    fs.promises.readFile('b.txt'), // Thread 2
    fs.promises.readFile('c.txt'), // Thread 3
    fs.promises.readFile('d.txt'), // Thread 4
    fs.promises.readFile('e.txt'), // QUEUED — waiting for a thread!
])

// GOOD: Streaming (uses OS page cache, no full thread block)
app.get('/download', (req, res) => {
    const stream = fs.createReadStream('/large-file.csv')
    stream.pipe(res) // Chunk by chunk, no blocking
})

// INCREASE thread pool for I/O-heavy apps:
// UV_THREADPOOL_SIZE=16 node server.js

// GO: Network I/O (efficient via netpoller)
// Go's net package uses epoll/kqueue automatically
// Each goroutine PARKS (not OS-blocks) when waiting for I/O
func fetchAll(urls []string) []string {
    results := make([]string, len(urls))
    var wg sync.WaitGroup
    for i, url := range urls {
        wg.Add(1)
        go func(i int, url string) {
            defer wg.Done()
            resp, _ := http.Get(url) // Goroutine parks, OS thread free
            body, _ := io.ReadAll(resp.Body)
            results[i] = string(body)
        }(i, url)
    }
    wg.Wait()
    return results
}`
    }
  ]
}
