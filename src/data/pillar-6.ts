import type { Pillar } from './types'

export const pillar6: Pillar = {
  id: 'golang',
  title: 'Pillar 6 — Backend (Golang)',
  topics: [
    {
      id: 'di-ioc-101',
      title: 'Dependency Injection (DI) & IoC',
      depth: 'Interfaces and Testability Basics',
      content: 'Meskipun Go tidak memiliki *Class*, ia menggunakan *Struct* dan *Interface* secara intensif untuk *Dependency Injection* (DI). DI adalah implementasi dari *Inversion of Control* (IoC).\n\n**Masalah Tanpa DI (Hardcoded Dependencies):** Jika Service A membutuhan koneksi Database B, dan Anda membuat objek koneksi B langsung *di dalam* constructor A, maka A berpasangan ketat (*tight coupling*) dengan B. Anda tidak bisa men-test A tanpa ikut menyalakan database B.\n\n**Solusi dengan DI:** Service A tidak membuat koneksi B. Ia HANYA meminta B disuntikkan (*injected*) lewat parameter constructor-nya. \n\n**Peran Interface:** Daripada Service A meminta *object konkrit* B (misal struct `PostgresDB`), A harus meminta *Interface* (misal `DataStore` yang punya fungsi `Save()`). Dengan begitu, saat *production*, kita suntikkan struct `PostgresDB`. Saat *Unit Testing*, kita suntikkan struct `MockDB` (yang ada di RAM). Kode Service A tidak peduli (dan tidak perlu diubah)!',
      why: 'Dependency Injection adalah satu-satunya cara arsitektur modern (Clean Architecture/Hexagonal) untuk mencapai unit test 100% tanpa menyentuh network atau real database. Go secara bawaan sangat mendukung pola ini melalui implicit interfaces.',
      mistake: 'Menggunakan *Global Variables* atau *Singletons* di backend untuk menyimpan instance Database atau konfigurasi. Hal ini merusak *Testability* dan seringkali memicu *Race Conditions* pada proses *concurrent* di server skala besar.',
      interview: [
        {
          q: 'Jelaskan konsep Dependency Injection secara sederhana. Mengapa ini krusial untuk Unit Testing?',
          a: 'Dependency Injection artinya: "Jangan buat apa yang Anda butuhkan, mintalah agar diberikan". Alih-alih fungsi Service meng-instantiate DB Client di dalamnya, ia meminta DB Client melalui parameternya. Ini krusial di Unit Testing karena kita tidak mau tes kita mengenai production DB. Dengan DI, pada saat di test file, kita bisa dengan mudah me-lempar Fake/Mock DB Client (yang menyimpan data di array memory) ke dalam Service. Jika dependency di-hardcode di dalam Service, kita tidak bisa menggantinya dengan mock.'
        }
      ],
      code: '// BAD: Hardcoded dependency (Cannot mock DB for testing)\nfunc NewUserService() *UserService {\n    return &UserService{\n        db: sql.Open("postgres", "url..."), // Tied to actual DB!\n    }\n}\n\n// GOOD: Dependency Injection with Interfaces\n// 1. Define what you need (Interface)\ntype UserRepository interface {\n    FindUser(id string) (*User, error)\n}\n\n// 2. Struct only knows about the interface\ntype UserService struct {\n    repo UserRepository \n}\n\n// 3. Inject the dependency\nfunc NewUserService(r UserRepository) *UserService {\n    return &UserService{ repo: r }\n}\n\n// In main.go (Production):\n// svc := NewUserService(&PostgresRepo{})\n\n// In user_test.go (Testing):\n// svc := NewUserService(&MockMemoryRepo{})'
    },
    {
      id: 'go-scheduler',
      title: 'Go Runtime & Goroutine Scheduler',
      depth: 'G/M/P model, work stealing, goroutine lifecycle',
      content: `Go runtime mengimplementasikan scheduler sendiri di user-space yang memungkinkan ratusan ribu goroutine berjalan efisien di atas sejumlah kecil OS thread.

**G/M/P Model:** G (Goroutine) — unit concurrent execution, stack dinamis dimulai 2-8KB. M (Machine) — OS Thread. P (Processor) — logical CPU, jumlah = GOMAXPROCS (default = core count). Setiap P punya Local Run Queue (LRQ). Hanya G yang punya P yang bisa dieksekusi.

**Work Stealing:** P yang kehabisan G di LRQ mencuri setengah dari LRQ P lain. Ini memastikan semua P selalu sibuk — distribusi kerja otomatis tanpa koordinasi terpusat.

**Goroutine Lifecycle:** States: Runnable (antri di LRQ), Running (sedang dieksekusi), Waiting (blocked di I/O/channel/mutex), Dead (selesai). Goroutine di-preempt di "safe points" (function call, channel op, syscall, atau asynchronous preemption di Go 1.14+).

**Syscall Handling:** Saat goroutine melakukan blocking syscall, M tersebut terblokir. Go runtime melepas P dari M tersebut dan memberikannya ke M lain — goroutine lain tetap bisa jalan.

**Stack Growth:** Goroutine stack dimulai kecil (2KB). Saat hampir penuh, Go alokasikan stack baru 2x, copy stack lama. Tidak ada stack overflow seperti OS threads.`,
      why: `Memahami scheduler memungkinkan lo menulis kode yang scheduler-friendly. Tight CPU loop tanpa safe points menyebabkan goroutine starvation di Go < 1.14. Goroutine leak — goroutine yang tidak pernah selesai — perlahan menghabiskan memori hingga server OOM.`,
      mistake: `Goroutine leak: goroutine yang diblokir selamanya di channel yang tidak pernah menerima atau context yang tidak pernah di-cancel. Selalu beri goroutine exit mechanism. Spawn goroutine tanpa batas di dalam HTTP handler saat traffic spike — ribuan goroutine menyebabkan memory exhaustion.`,
      interview: [
        {
          q: 'Jelaskan G/M/P model di Go scheduler. Apa yang terjadi saat goroutine melakukan blocking syscall?',
          a: 'G (Goroutine): unit eksekusi ringan dengan stack dinamis (2KB awal). Berisi stack, instruction pointer, status, dan channel yang ditunggu. M (Machine): OS thread aktual yang mengeksekusi kode Go dan memanggil syscall. P (Processor): resource logis yang menjadi "penghubung" G dengan M. Jumlah P = GOMAXPROCS. P menyimpan Local Run Queue (LRQ) berisi goroutines yang siap dieksekusi. Hanya goroutine yang memiliki P yang bisa dieksekusi. Saat blocking syscall: G memanggil syscall → M terpaksa menunggu di kernel → Runtime mendeteksi M terblokir → P dilepas dari M tersebut → P dicari M idle atau M baru dibuat → P melanjutkan mengeksekusi G lain. Saat syscall selesai: M lama mencoba mendapatkan P idle. Jika tidak ada, G dimasukkan ke Global Run Queue dan M masuk idle pool. Ini kenapa blocking syscall tidak memblokir program — P selalu bisa melanjutkan eksekusi goroutine lain.'
        },
        {
          q: 'Apa itu goroutine leak dan bagaimana cara mendeteksinya?',
          a: 'Goroutine leak: goroutine yang di-spawn tapi tidak pernah selesai (berjalan selamanya atau blocked selamanya). Setiap goroutine mengkonsumsi setidaknya 2KB stack (bisa tumbuh jauh lebih besar). 100,000 goroutines yang leak = ratusan MB, hingga GB memori terbuang. Server akhirnya OOM. Penyebab umum: (1) Channel yang tidak pernah menerima: go func() { result := <-ch }() tapi ch tidak pernah di-send atau di-close. (2) Goroutine menunggu mutex yang tidak pernah dilepas. (3) Goroutine melakukan HTTP request tanpa timeout dan target tidak respond. Deteksi: runtime.NumGoroutine() meningkat terus menerus di monitor. pprof endpoint /debug/pprof/goroutine?debug=2 menampilkan stack trace semua goroutines aktif — identifikasi goroutines yang stuck di lokasi yang sama. Goleak library di test untuk detect leak. Pencegahan: selalu beri goroutine cara untuk exit — context.Context untuk cancellation, done channel, atau timeout.'
        },
        {
          q: 'Mengapa goroutine jauh lebih efisien dari OS thread? Apa trade-off yang ada?',
          a: 'Keunggulan goroutine: (1) Stack kecil dan dinamis — goroutine mulai dengan 2KB vs OS thread yang butuh 1-8MB (fixed di banyak OS). Server bisa punya 100,000 goroutines (~800MB total) vs 100,000 OS threads (~100GB — tidak mungkin). (2) Context switch lebih murah — goroutine switch dilakukan di user-space oleh Go runtime, tidak perlu system call. OS thread switch butuh kernel involvement (save/restore ratusan register CPU, TLB flush). (3) Work stealing — scheduler otomatis mendistribusikan goroutine ke idle P/M. (4) Cooperative + asynchronous preemption — goroutine yield secara natural di I/O dan channel operations. Trade-off: (1) Goroutine adalah user-space abstraction — tidak mendapat "real" CPU time scheduling priority dari OS. (2) Go GC perlu menghentikan semua goroutines (brief STW) untuk scan stacks — semakin banyak goroutines, semakin lama STW. (3) Goroutine debugging lebih complex dari thread — tooling masih berkembang. (4) CPU affinity tidak bisa dikontrol secara fine-grained.'
        }
      ],
      code: `// GOROUTINE LIFECYCLE: Proper management
func startWorker(ctx context.Context, jobs <-chan Job) <-chan Result {
    results := make(chan Result, 10)
    go func() {
        defer close(results)
        for {
            select {
            case job, ok := <-jobs:
                if !ok { return }  // Channel closed, exit cleanly
                results <- process(job)
            case <-ctx.Done():
                return  // Context cancelled, exit cleanly
            }
        }
    }()
    return results
}

// GOROUTINE LEAK DETECTION
func startLeakDetector() {
    go func() {
        var prev int
        for range time.Tick(30 * time.Second) {
            curr := runtime.NumGoroutine()
            if curr > prev + 1000 {
                log.Printf("WARN: goroutines grew from %d to %d", prev, curr)
                // Dump stacks to find leak source
                buf := make([]byte, 1<<20)
                n := runtime.Stack(buf, true)
                log.Printf("%s", buf[:n])
            }
            prev = curr
        }
    }()
}

// BOUNDED GOROUTINE POOL (prevent memory exhaustion)
func processAll(ctx context.Context, items []Item) []Result {
    sem := make(chan struct{}, 50) // Max 50 concurrent goroutines
    results := make([]Result, len(items))
    var wg sync.WaitGroup
    for i, item := range items {
        wg.Add(1)
        go func(i int, item Item) {
            defer wg.Done()
            sem <- struct{}{}        // Acquire slot
            defer func() { <-sem }() // Release slot
            results[i] = process(item)
        }(i, item)
    }
    wg.Wait()
    return results
}`
    },
    {
      id: 'go-interfaces',
      title: 'Interfaces, Composition & Clean Architecture',
      depth: 'Duck typing, io.Reader/Writer, repository pattern',
      content: `Go menggunakan structural typing — sebuah type mengimplementasikan interface secara implisit jika memiliki semua method yang dibutuhkan. Tidak ada implements keyword.

**Interface Design Philosophy:** "Accept interfaces, return concrete types." Fungsi yang menerima interface bisa menerima type apapun yang memenuhi kontrak — termasuk mock untuk testing. Fungsi yang return concrete type memberi informasi selengkap mungkin ke caller.

**io.Reader dan io.Writer:** io.Reader: Read(p []byte) (n int, err error). io.Writer: Write(p []byte) (n int, err error). Seluruh ecosystem Go menggunakan dua interface kecil ini: file, HTTP body, network connection, buffer, gzip — semuanya implement interface ini. Komposisi powerful: HTTP response body → gzip reader → CSV reader, tanpa satu pun tahu tentang yang lain.

**Embedding — Composition over Inheritance:** Struct bisa embed struct lain — method dipromosikan ke embedding struct. Interface bisa embed interface lain (io.ReadWriter = io.Reader + io.Writer).

**Repository Pattern:** Interface mendefinisikan operasi data. Business logic hanya berinteraksi dengan interface. Implementasi konkret (Postgres, Mock) diinjeksikan. Memungkinkan: test tanpa database, swap database tanpa ubah business logic.`,
      why: `Interface kecil adalah keunggulan terbesar Go. Dengan interface yang tepat: test business logic tanpa database, swap implementasi tanpa mengubah caller, dan compose behavior secara fleksibel. Interface yang didefinisikan di package consumer (bukan producer) adalah idiom yang paling powerful.`,
      mistake: `Interface dengan terlalu banyak method — sulit di-mock, melanggar Interface Segregation Principle. Mendefinisikan interface di package yang sama dengan implementasinya — sebaiknya di package consumer, agar interface hanya berisi method yang benar-benar dibutuhkan consumer tersebut.`,
      interview: [
        {
          q: 'Mengapa Go menggunakan implicit interface implementation (structural typing)? Apa keuntungannya?',
          a: 'Di Java/C#, untuk implement interface harus dideklarasikan secara eksplisit: class Foo implements IBar. Di Go, tipe otomatis implement interface jika memiliki semua method yang diperlukan — tidak perlu deklarasi. Keuntungan: (1) Retroactive interface satisfaction — tipe dari library external (yang tidak bisa dimodifikasi) bisa "memenuhi" interface yang kita definisikan sendiri, selama ia punya method yang kita butuhkan. (2) Interface didefinisikan di consumer — package yang MENGGUNAKAN tipe mendefinisikan interface berdasarkan apa yang ia butuhkan. Ini menghasilkan interface yang sangat kecil dan focused. (3) Decoupling sempurna — tidak ada import dari producer ke interface package. (4) Testing: buat struct kecil dengan method yang sama untuk mock. Tidak perlu library mocking. Kelemahan: kadang sulit tahu interface mana yang di-implement oleh sebuah tipe — tooling (gopls) membantu. Dan typo di method name bisa menyebabkan implementasi yang diam-diam tidak memenuhi interface.'
        },
        {
          q: 'Bagaimana io.Reader memungkinkan composition yang powerful? Berikan contoh konkret.',
          a: 'io.Reader hanya satu method: Read(p []byte) (n int, err error). Kontrak yang minimal ini berarti APAPUN yang bisa membaca bytes bisa digunakan sebagai io.Reader: os.File, http.Response.Body, net.Conn, bytes.Buffer, strings.Reader, gzip.Reader, crypto/cipher.StreamReader. Komposisi: func processUpload(r io.Reader) — fungsi ini tidak tahu dan tidak peduli APAKAH r adalah file, HTTP body, atau string. Semua fungsi yang menerima io.Reader bisa dicompose: gzip.NewReader(r) menghasilkan io.Reader baru (yang transparan decompress saat dibaca). csv.NewReader(gzip.NewReader(r)) baca CSV dari compressed stream. Ini chain tanpa intermediate buffering. Manfaat nyata: satu fungsi processCSV(r io.Reader) bisa menerima upload HTTP, file lokal, test string, dan compressed file tanpa perubahan. Test: cukup gunakan strings.NewReader("...") alih-alih file nyata.'
        },
        {
          q: 'Jelaskan Repository Pattern di Go dan bagaimana ia memfasilitasi testing.',
          a: 'Repository Pattern memisahkan business logic dari data access logic melalui interface. Struktur: (1) Interface didefinisikan di domain/service package: type UserRepository interface { GetByID(ctx, id) (*User, error); Save(ctx, user) error }. (2) Implementasi konkret (PostgresUserRepository) dibuat di infrastructure package, meng-implement interface tersebut. (3) Service menerima UserRepository interface sebagai dependency (injected via constructor). Manfaat testing: unit test service cukup buat struct yang implement interface dengan in-memory map — tidak perlu DB running. Test: type mockRepo struct { users map[string]*User }; func (m *mockRepo) GetByID(_ context.Context, id string) (*User, error) { return m.users[id], nil }. Service tidak tahu bedanya dengan real Postgres implementation. Integration test bisa pakai implementasi real dengan test database. Manfaat lain: mudah swap dari Postgres ke MongoDB di masa depan — hanya ganti implementasi, interface dan service tidak berubah.'
        }
      ],
      code: `// SMALL INTERFACES: Consumer-defined
// Consumer decides what it needs
type UserFetcher interface {
    GetUser(ctx context.Context, id string) (*User, error)
}

// This function needs only GetUser
func GetDashboard(ctx context.Context, uf UserFetcher, id string) (*Dashboard, error) {
    user, err := uf.GetUser(ctx, id)
    if err != nil { return nil, fmt.Errorf("fetching user: %w", err) }
    return buildDashboard(user), nil
}

// REPOSITORY PATTERN
type UserRepository interface {
    GetByID(ctx context.Context, id string) (*User, error)
    Save(ctx context.Context, user *User) error
}

// Production implementation
type PostgresUserRepo struct { db *sql.DB }
func (r *PostgresUserRepo) GetByID(ctx context.Context, id string) (*User, error) {
    var u User
    err := r.db.QueryRowContext(ctx, "SELECT id,name,email FROM users WHERE id=$1", id).
        Scan(&u.ID, &u.Name, &u.Email)
    if errors.Is(err, sql.ErrNoRows) { return nil, ErrNotFound }
    return &u, err
}

// io.Reader COMPOSITION
func processUpload(r io.Reader) error {
    gzr, err := gzip.NewReader(r)    // Decompress on the fly
    if err != nil { return err }
    defer gzr.Close()

    csvr := csv.NewReader(gzr)        // Parse CSV from decompressed stream
    for {
        record, err := csvr.Read()
        if errors.Is(err, io.EOF) { break }
        if err != nil { return err }
        processRecord(record)
    }
    return nil
}

// HTTP handler: pass body directly
http.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
    if err := processUpload(r.Body); err != nil {
        http.Error(w, err.Error(), 500)
    }
})`
    },
    {
      id: 'go-errors',
      title: 'Error Handling Philosophy in Go',
      depth: 'Error wrapping, sentinel errors, custom types, errors.Is/As',
      content: `Di Go, errors adalah values yang di-return dan di-check secara eksplisit. Ini memaksa programmer berpikir serius tentang error paths.

**Error sebagai Interface:** error adalah interface dengan satu method: Error() string. Type apapun yang implement ini bisa digunakan sebagai error.

**Error Wrapping dengan %w:** fmt.Errorf("context: %w", err) menyimpan error asli dalam chain. errors.Is() traverse seluruh chain untuk cek error tertentu. errors.As() extract error type spesifik dari chain.

**Sentinel Errors:** Package-level error values yang bisa dibandingkan. Selalu gunakan errors.Is(), bukan ==, karena errors.Is() traverse chain.

**Custom Error Types:** Struct yang implement error interface untuk membawa informasi tambahan (HTTP status, field yang invalid). Implement Unwrap() untuk memungkinkan errors.Is/As traverse.

**Error Handling Strategy:** Wrap saat melintasi boundary (DB layer → repository, repository → service, service → handler). Jangan wrap jika tidak menambah context. Di handler, konversi domain errors ke HTTP responses.`,
      why: `Error yang informatif ("failed to charge payment: stripe: card declined (code: insufficient_funds)") vs tidak berguna ("error"). Log yang baik menghemat jam debugging production incident. errors.Is/As mencegah bug subtle di mana check gagal karena error sudah di-wrap.`,
      mistake: `Membandingkan err.Error() == "some string" — fragile dan tidak bekerja dengan wrapped errors. Meng-wrap error terlalu banyak kali dengan info yang sama (redundant context). Mengabaikan error dengan _ — seringkali error yang "pasti tidak terjadi" adalah yang pertama terjadi di production.`,
      interview: [
        {
          q: 'Apa perbedaan antara errors.Is() dan errors.As()? Kapan menggunakan masing-masing?',
          a: 'errors.Is(err, target): memeriksa apakah err SAMA DENGAN target (menggunakan Is() method jika ada, atau == jika tidak). Traverse seluruh error chain via Unwrap(). Digunakan untuk: mengecek apakah error adalah sentinel error tertentu. Contoh: errors.Is(err, sql.ErrNoRows) — true bahkan jika err sudah di-wrap berkali-kali dengan fmt.Errorf("...: %w", sql.ErrNoRows). errors.As(err, &target): memeriksa apakah ada error dalam chain yang bisa di-assign ke target (type assertion). Traverse chain via Unwrap(). Digunakan untuk: extract custom error type dari chain untuk mengambil data tambahan. Contoh: var notFound *NotFoundError; if errors.As(err, &notFound) { log(notFound.ResourceID) }. Perlu pointer ke pointer (atau pointer ke interface). Singkatnya: Is() untuk "apakah error ini?", As() untuk "ambil error sebagai tipe ini". Keduanya traverse entire error chain — tidak perlu manual unwrap.'
        },
        {
          q: 'Desain sebuah custom error type untuk REST API yang membawa HTTP status code dan request ID.',
          a: 'type APIError struct { StatusCode int; Code string; Message string; RequestID string; Err error }. Implement Error() string method: func (e *APIError) Error() string { if e.Err != nil { return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Err) }; return fmt.Sprintf("[%s] %s", e.Code, e.Message) }. Implement Unwrap() untuk chain traversal: func (e *APIError) Unwrap() error { return e.Err }. Constructor helpers: func NotFound(msg, requestID string) *APIError { return &APIError{StatusCode: 404, Code: "NOT_FOUND", Message: msg, RequestID: requestID} }. Di handler: var apiErr *APIError; if errors.As(err, &apiErr) { w.Header().Set("X-Request-ID", apiErr.RequestID); http.Error(w, apiErr.Message, apiErr.StatusCode) } else { http.Error(w, "internal error", 500); log.Printf("unexpected: %v", err) }. Pola ini memungkinkan business logic melempar domain errors, dan HTTP layer mengkonversinya ke response yang tepat tanpa business logic tahu tentang HTTP.'
        },
        {
          q: 'Kapan sebaiknya error di-wrap dan kapan tidak?',
          a: 'Wrap error ketika: (1) Error melintasi layer boundary dan context tambahan berguna untuk debugging. Contoh: GetUser (repository layer) menerima sql.ErrNoRows → wrap menjadi "getting user 123: not found". Handler layer melihat full chain. (2) Caller perlu membedakan errors berdasarkan context — misalnya retry hanya untuk network errors, bukan validation errors. Jangan wrap ketika: (1) Error sudah memiliki context yang cukup. Meng-wrap berulang: "getting user: getting user: database: no rows" tidak berguna. (2) Returning error yang sama tanpa penambahan context: return err bukan return fmt.Errorf("...: %w", err) jika tidak ada info baru. (3) Di test — wrap membuat assertion lebih verbose. Pattern yang baik: gunakan %w dengan message yang menambah context tentang OPERASI yang gagal, bukan tentang error itu sendiri. "querying database" sudah implied dari context. "getting user with id=123" menambah info yang berguna.'
        }
      ],
      code: `// CUSTOM ERROR TYPE
type AppError struct {
    StatusCode int
    Code       string
    Message    string
    Err        error
}

func (e *AppError) Error() string {
    if e.Err != nil { return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Err) }
    return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}
func (e *AppError) Unwrap() error { return e.Err }

// Sentinel errors
var ErrNotFound = errors.New("not found")

// Repository layer: wrap with context
func (r *Repo) GetUser(ctx context.Context, id string) (*User, error) {
    var u User
    err := r.db.QueryRowContext(ctx, "SELECT...", id).Scan(&u)
    if errors.Is(err, sql.ErrNoRows) {
        return nil, fmt.Errorf("user %s: %w", id, ErrNotFound)
    }
    return &u, fmt.Errorf("querying user %s: %w", id, err)
}

// HTTP handler: extract and respond
func (h *Handler) getUser(w http.ResponseWriter, r *http.Request) {
    user, err := h.svc.GetUser(r.Context(), chi.URLParam(r, "id"))
    if err != nil {
        var appErr *AppError
        switch {
        case errors.As(err, &appErr):
            http.Error(w, appErr.Message, appErr.StatusCode)
        case errors.Is(err, ErrNotFound):
            http.Error(w, "user not found", 404)
        default:
            log.Printf("unexpected error: %+v", err)
            http.Error(w, "internal error", 500)
        }
        return
    }
    json.NewEncoder(w).Encode(user)
}`
    }
  ]
}
