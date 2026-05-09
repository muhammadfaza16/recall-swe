import type { Pillar } from './types'

export const pillar0: Pillar = {
  id: 'prerequisites',
  title: 'Pillar 0 — Prerequisites',
  topics: [
    {
      id: 'computer-architecture-101',
      title: 'Computer Architecture 101',
      depth: 'Bits, Bytes, CPU Cache, and Memory Hierarchy',
      content: 'Sebelum kita bicara optimasi kode, kita harus tahu di mana kode berjalan.\n\n**Bits & Bytes:** Komputer hanya mengerti 0 dan 1 (binary). 1 byte = 8 bits. Semua tipe data (integer, string, boolean) pada akhirnya dikodekan menjadi representasi binary ini.\n\n**CPU & Registers:** CPU mengeksekusi instruksi. Data yang sedang aktif dikerjakan disimpan di *Registers* (sangat cepat, tapi sangat kecil). Jika tidak cukup, data diambil dari cache atau RAM.\n\n**Memory Hierarchy:** Ini adalah rahasia performa tinggi. CPU memiliki L1, L2, dan L3 Cache. Akses L1 Cache butuh ~1 nanosecond. Akses RAM (Main Memory) butuh ~100 nanoseconds (100x lebih lambat!). Jika data tidak ada di RAM, sistem akan mengambil dari SSD/Hard Disk (bisa ribuan kali lebih lambat dari RAM).\n\n**Spatial Locality:** CPU tidak mengambil data per *byte* dari RAM, melainkan dalam bentuk *Cache Line* (biasanya 64 bytes). Jika Anda mengakses elemen array secara berurutan, elemen berikutnya kemungkinan besar sudah terbawa ke dalam *Cache Line* (sangat cepat). Inilah mengapa *Array* jauh lebih cepat di-iterasi daripada *Linked List* yang alamat memorinya melompat-lompat.',
      why: 'Tanpa pemahaman dasar arsitektur, optimasi kode terasa seperti sihir. Software engineer level FAANG tahu bahwa struktur data yang ramah terhadap CPU Cache (seperti array/slice) seringkali mengalahkan struktur data algoritmik kompleks yang alamat memorinya berantakan (seperti tree atau linked list) pada jumlah data kecil-menengah.',
      mistake: 'Berpikir bahwa O(1) selalu instan dan O(n) lambat di dunia nyata. Hash Map memiliki kompleksitas O(1), tapi operasi *hashing* dan memori yang tersebar membuat konstanta waktunya besar. Kadang iterasi O(n) pada Array kecil jauh lebih cepat karena L1 Cache.',
      interview: [
        {
          q: 'Jelaskan mengapa iterasi pada Array lebih cepat daripada iterasi pada Linked List meskipun keduanya memiliki kompleksitas waktu O(n)?',
          a: 'Kuncinya ada pada CPU Cache dan Spatial Locality. Array menyimpan datanya secara contiguous (berdampingan) di memori. Ketika CPU meminta elemen pertama, ia memuat seluruh "Cache Line" (misal 64 bytes) dari RAM ke L1 Cache. Elemen kedua, ketiga, dan seterusnya sudah berada di cache (akses ~1ns). Sebaliknya, node pada Linked List tersebar di berbagai lokasi memori. CPU harus terus-menerus mengambil dari RAM (akses ~100ns) yang mengakibatkan fenomena "Cache Miss".'
        }
      ],
      code: '// Simulasi Locality (Mental Model)\n// Array: Alamat memori berurutan (0x00, 0x04, 0x08)\nconst arr = [1, 2, 3, 4]\n\n// Linked List: Alamat memori melompat (0x1A, 0x9F, 0x2C)\nconst node1 = { val: 1, next: node2 }\nconst node2 = { val: 2, next: null }'
    },
    {
      id: 'programming-paradigms',
      title: 'OOP & Functional Programming 101',
      depth: 'State, Behavior, Immutability, and Pure Functions',
      content: 'Paradigma pemrograman adalah cara kita menstrukturkan pikiran untuk memecahkan masalah. Dua pilar utama di industri adalah OOP dan FP.\n\n**Object-Oriented Programming (OOP):** Menggabungkan *State* (data) dan *Behavior* (fungsi) ke dalam satu entitas yang disebut Object. 4 Prinsip utamanya:\n1. **Encapsulation:** Menyembunyikan *state* internal dan hanya mengekspos *method* publik.\n2. **Abstraction:** Menyembunyikan kerumitan implementasi dari pengguna class.\n3. **Inheritance:** Mewariskan properti dan method dari parent ke child.\n4. **Polymorphism:** Method yang sama bisa memiliki implementasi berbeda tergantung object-nya.\n\n**Functional Programming (FP):** Memisahkan data dan fungsi. Ciri utamanya:\n1. **Pure Functions:** Output hanya bergantung pada input. Tidak ada *side-effects* (tidak mengubah variabel global atau menulis ke DB).\n2. **Immutability:** Data tidak pernah diubah setelah dibuat. Jika ingin mengubah array, buat array baru hasil *copy* (contoh: `map`, `filter`).\n3. **First-class Functions:** Fungsi diperlakukan sebagai variabel, bisa di-*pass* sebagai argumen.',
      why: 'Semua arsitektur modern adalah kombinasi paradigma ini. React menggunakan prinsip FP (Immutability, Pure Components) agar UI *predictable*. Sementara backend Java/C# sangat kental dengan OOP untuk mengelola dependensi kompleks. Paham keduanya berarti Anda punya dua alat untuk masalah yang berbeda.',
      mistake: 'Mengubah *state* secara langsung (mutating state) di aplikasi yang dibangun dengan prinsip FP (seperti Redux/React), yang menyebabkan UI tidak re-render. Di sisi OOP: Terlalu banyak membuat hierarki *Inheritance* yang dalam (God Object), padahal *Composition* seringkali lebih baik.',
      interview: [
        {
          q: 'Apa bedanya Pure Function dan Impure Function?',
          a: 'Pure function selalu mengembalikan output yang sama untuk input yang sama, dan TIDAK memiliki side effects (tidak memodifikasi variabel luar, tidak menulis ke disk, tidak menembak API). Impure function hasilnya bisa berubah walau inputnya sama (misal memanggil Math.random() atau Date.now()) atau melakukan side-effect (seperti console.log atau UPDATE ke database). Pure function sangat mudah di-test karena tidak butuh mocking.'
        }
      ],
      code: '// OOP Example (Encapsulation & State)\nclass BankAccount {\n  private balance = 0; // Encapsulated\n  deposit(amount: number) { this.balance += amount; } // Mutates state\n  getBalance() { return this.balance; }\n}\n\n// FP Example (Immutability & Pure Function)\ntype Account = { balance: number };\nfunction deposit(acc: Account, amount: number): Account {\n  return { ...acc, balance: acc.balance + amount }; // Returns NEW object\n}'
    },
    {
      id: 'big-o',
      title: 'Big O & Data Structures',
      depth: 'The language of algorithmic performance',
      content: `Big O Notation adalah cara kita berbicara tentang performa sebuah algoritma dalam skala besar. Ini bukan tentang berapa detik kode lo berjalan di laptop lo — ini tentang bagaimana runtime dan penggunaan memori bertumbuh seiring bertambahnya jumlah input (n).

**O(1) — Constant Time:** Tidak peduli seberapa besar input, operasinya selalu butuh waktu yang sama. Contoh klasik: mengambil value dari HashMap menggunakan key. Ini bisa konstan karena HashMap menggunakan fungsi hash untuk langsung menghitung lokasi memori dari key tersebut — tidak perlu mencari satu per satu.

**O(log n) — Logarithmic:** Setiap langkah memotong ukuran masalah menjadi setengahnya. Binary search pada sorted array bekerja persis seperti ini — cari di tengah, buang setengah yang tidak relevan, ulangi. Array 1 juta elemen hanya butuh ~20 langkah. Inilah yang membuat B-Tree index di database begitu powerful.

**O(n) — Linear:** Lo harus mengunjungi setiap elemen setidaknya sekali. Tidak ada jalan pintas — worst case lo harus cek semua.

**O(n²) — Quadratic:** Nested loop. Terlihat tidak masalah saat data kecil, tapi menjadi malapetaka di production. 1000 item = 1,000,000 operasi. 10,000 item = 100,000,000 operasi. Server freeze.

**Struktur Data Krusial:** Array adalah blok memori berurutan — akses by index O(1), insert di tengah O(n). HashMap menggunakan fungsi hash untuk memetakan key ke "bucket" memori. Saat HashMap perlu resize (biasanya saat 75% penuh), ia mengalokasikan memori baru dan re-hash semua entry — O(n) sesekali, tapi amortized O(1). Stack (LIFO) dan Queue (FIFO) adalah abstraksi penting — Stack digunakan call stack itu sendiri, Queue digunakan Event Loop.`,
      why: `Di interview, soal algoritma hampir selalu tentang mengoptimalkan dari O(n²) ke O(n) menggunakan HashMap. Di production, O(n²) yang terselip dalam kode yang dieksekusi setiap HTTP request adalah resep server yang lambat dan tagihan cloud mahal. Senior engineer membaca kode dan secara insting mengenali bottleneck kompleksitas sebelum menyentuh production.`,
      mistake: `Menggunakan Array.includes() atau Array.find() di dalam sebuah loop — menghasilkan O(n²) tanpa sadar. Solusinya: masukkan data ke Set atau Map lebih dulu, lalu lakukan lookup. Juga: tidak mempertimbangkan Space Complexity. Kode O(n) time bisa tetap berbahaya kalau ia membuat O(n) copies data di memori.`,
      interview: [
        {
          q: 'Mengapa lookup di HashMap bisa O(1)? Apa yang terjadi saat ada hash collision?',
          a: 'HashMap menggunakan fungsi hash untuk mengkonversi key menjadi integer index (hash(key) → index → arr[index]). Ini direct memory access — tidak ada loop. Collision terjadi ketika dua key berbeda menghasilkan index yang sama. Penanganannya: Chaining (setiap bucket adalah linked list, hash collision ditambah ke list itu) atau Open Addressing (cari bucket kosong berikutnya). Dalam kasus collision yang ekstrem (semua key di bucket yang sama), lookup bisa degradasi ke O(n). Inilah mengapa hash function yang baik dan load factor yang terkontrol (biasanya 0.75) penting.'
        },
        {
          q: 'Apa bedanya Array dan Linked List secara alokasi memori? Kapan lo memilih masing-masing?',
          a: 'Array: blok memori kontiguous, elemen berdampingan di RAM. Akses by index O(1) karena address = base + (index × size). Insert/delete di tengah O(n) karena harus geser semua elemen. Linked List: elemen (nodes) tersebar di memori, tiap node punya pointer ke next. Akses by index O(n) karena harus traverse dari head. Insert/delete di posisi yang sudah diketahui O(1). Pilih Array ketika lo sering random access by index (misalnya sorted data yang di-binary search). Pilih Linked List ketika sering insert/delete di tengah dan tidak butuh random access (misalnya LRU cache implementation).'
        },
        {
          q: 'Jelaskan kenapa Binary Search itu O(log n). Berapa langkah untuk cari 1 elemen di array 1 juta elemen?',
          a: 'Binary search membagi masalah menjadi setengahnya di setiap langkah: cek elemen tengah, kalau terlalu besar cari di bagian kiri, kalau terlalu kecil cari di bagian kanan. Setelah k langkah, ukuran masalah menjadi n/2^k. Selesai saat 1 elemen tersisa: n/2^k = 1, sehingga k = log₂(n). Untuk 1 juta elemen: log₂(1,000,000) ≈ 20 langkah. Itulah kenapa B-Tree index di database dengan miliaran row masih bisa find dalam ~30 disk I/O.'
        }
      ],
      code: `// BAD: O(n²) — Nested loops
function findCommon_SLOW(arr1: number[], arr2: number[]): number[] {
  const result: number[] = [];
  for (const a of arr1) {           // O(n)
    if (arr2.includes(a)) {         // O(n) per iteration!
      result.push(a);               // Total: O(n²)
    }
  }
  return result;
}
// 1000 × 1000 = 1,000,000 ops | 100k × 100k = 10B ops — crash

// GOOD: O(n) — HashMap/Set
function findCommon_FAST(arr1: number[], arr2: number[]): number[] {
  const lookup = new Set(arr1);     // O(n) — build hash table once
  const result: number[] = [];
  for (const a of arr2) {           // O(n) — single pass
    if (lookup.has(a)) {            // O(1) — hash lookup
      result.push(a);
    }
  }
  return result;                    // Total: O(n)
}

// Growth comparison (n = 10,000):
// O(1)     →              1 ops
// O(log n) →             13 ops
// O(n)     →         10,000 ops
// O(n²)    →    100,000,000 ops  ← 10,000× slower!`
    },
    {
      id: 'js-engine',
      title: 'JS Engine & Core Mechanics',
      depth: 'V8, Execution Context, Closures, Event Loop',
      content: `JavaScript tidak hanya dieksekusi langsung — ia diproses oleh engine (V8 di Node.js dan Chrome). V8 melakukan Just-In-Time (JIT) compilation: fungsi yang sering dipanggil (hot functions) dioptimasi oleh compiler Turbofan menjadi machine code yang sangat cepat. Tapi jika lo tiba-tiba mengubah tipe data sebuah parameter (fungsi yang biasanya menerima Number, tiba-tiba menerima String), V8 harus "deoptimize" — membuang machine code yang sudah dikompilasi dan kembali ke interpretasi.

**Execution Context & Scope Chain:** Setiap kali fungsi dipanggil, V8 membuat Execution Context baru berisi: variabel lokal, referensi ke outer environment (scope chain), dan nilai 'this'. Scope chain inilah yang memungkinkan fungsi mengakses variabel dari fungsi induknya — inilah dasar Closures.

**Closures:** Closure adalah fungsi yang "mengingat" variabel dari lexical scope di mana ia didefinisikan, bahkan setelah parent fungsinya selesai. Ini bukan fitur khusus — ini konsekuensi alami dari Scope Chain. Setiap fungsi di JavaScript adalah closure.

**Event Loop — Mekanisme Sebenarnya:** Runtime memiliki: Call Stack (eksekusi kode synchronous), Web APIs / libuv (timer, fetch, file I/O — dijalankan di luar stack), Task Queue / Macrotask (callback dari setTimeout, setInterval, I/O), dan Microtask Queue (callback dari Promise.then, queueMicrotask). Urutan: (1) Jalankan semua di Call Stack sampai kosong. (2) Drain seluruh Microtask Queue. (3) Ambil SATU task dari Macrotask Queue. (4) Ulangi dari langkah 2.`,
      why: `Pemahaman Closure adalah fondasi React Hooks. Setiap custom hook menggunakan closure untuk "mengingat" state. Stale closure adalah sumber bug paling membingungkan di React. Pemahaman Event Loop adalah kunci kenapa operasi tertentu "tidak menunggu" dan kenapa race condition bisa terjadi di async code.`,
      mistake: `Menggunakan var di dalam loop (function-scoped, bukan block-scoped): semua callback dalam loop mereferensikan variabel yang sama (nilai akhirnya, bukan nilai saat loop berjalan). Gunakan let atau const. Juga: melakukan loop dengan forEach() + async/await — forEach tidak menunggu Promise, sehingga semua iterasi berjalan paralel tanpa kendali.`,
      interview: [
        {
          q: 'Apa output dari kode ini dan jelaskan alasannya: console.log(1); setTimeout(()=>console.log(2),0); Promise.resolve().then(()=>console.log(3)); console.log(4);',
          a: 'Output: 1, 4, 3, 2. Alasannya: (1) console.log(1) — synchronous, langsung di Call Stack. (2) setTimeout dengan 0ms — dijadwalkan ke Macrotask Queue, belum dieksekusi. (3) Promise.then — dijadwalkan ke Microtask Queue. (4) console.log(4) — synchronous. Setelah Call Stack kosong: Microtask Queue di-drain dulu (Promise.then → prints 3). Baru kemudian satu Macrotask diambil (setTimeout callback → prints 2). Kunci: Microtask SELALU berjalan sebelum Macrotask berikutnya, bahkan jika Macrotask di-queue lebih dulu.'
        },
        {
          q: 'Jelaskan apa itu Closure dengan contoh konkret. Mengapa ia bisa menyebabkan memory leak?',
          a: 'Closure adalah fungsi yang "membawa serta" referensi ke outer scope-nya. Contoh: function makeCounter() { let count = 0; return () => ++count; } — returned function adalah closure yang "ingat" count meskipun makeCounter sudah selesai. Memory leak terjadi karena closure menjaga referensi ke outer scope hidup. Contoh leak: sebuah event listener (closure) di-attach ke DOM element, tapi DOM element di-remove tanpa remove listener-nya. Listener masih hidup, masih pegang referensi ke outer scope (yang mungkin besar). Garbage collector tidak bisa collect karena ada referensi aktif.'
        },
        {
          q: 'Apa perbedaan antara var, let, dan const dalam konteks loop dan closure?',
          a: 'var: function-scoped, di-hoist ke atas fungsi. Di dalam loop, semua iterasi berbagi SATU variabel yang sama. for(var i=0; i<3; i++) { setTimeout(()=>console.log(i)) } → prints 3,3,3 karena saat callback berjalan, i sudah jadi 3. let: block-scoped. Setiap iterasi loop membuat binding baru — setiap closure menutup ke variabel yang berbeda. Sama contoh dengan let → prints 0,1,2. const: seperti let tapi tidak bisa di-reassign (tapi object/array yang di-assign masih bisa dimutasi). Best practice: gunakan const secara default, let jika perlu reassignment, dan hindari var sama sekali di kode modern.'
        }
      ],
      code: `// EVENT LOOP — Output Order Quiz
console.log('1');                           // Sync — runs immediately
setTimeout(() => console.log('2'), 0);     // Macrotask — runs last
Promise.resolve().then(() => console.log('3')).then(() => console.log('4')); // Microtasks
console.log('5');                           // Sync — runs second
// Output: 1, 5, 3, 4, 2

// CLOSURE — Foundation of React Hooks
function createMultiplier(factor: number) {
  // 'factor' lives in the closure
  return (number: number) => number * factor  // Remembers 'factor'
}
const double = createMultiplier(2);
double(5); // 10 — closure remembers factor=2

// STALE CLOSURE BUG (Classic React Bug)
function Counter() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      console.log(count) // Always 0! Closure captures initial value
      setCount(count + 1) // Bug: always sets to 0+1=1
    }, 1000)
    return () => clearInterval(id)
  }, []) // Missing dependency

  // FIX: Use functional update form
  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => prev + 1) // No closure dependency!
    }, 1000)
    return () => clearInterval(id)
  }, [])
}

// VAR vs LET — The loop trap
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)) // 3,3,3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)) // 0,1,2`
    },
    {
      id: 'typescript-essentials',
      title: 'TypeScript for Production',
      depth: 'Generics, Utility Types, Discriminated Unions',
      content: `TypeScript bukan sekedar "JavaScript dengan type annotation". Pada level production, TypeScript adalah alat desain arsitektur — cara mendefinisikan kontrak antar bagian sistem sehingga compiler menjadi garda terdepan yang mencegah bug sebelum kode dijalankan.

**Generics:** Memungkinkan menulis kode yang bekerja untuk berbagai tipe tanpa kehilangan type safety. Seperti "parameter untuk tipe". Tanpa generics, terpaksa menggunakan 'any' yang menghilangkan seluruh manfaat TypeScript, atau menulis fungsi yang sama berulang untuk setiap tipe.

**Utility Types:** Partial<T> — semua properti opsional (berguna untuk PATCH endpoint). Required<T> — semua wajib. Pick<T, K> — ambil subset properti. Omit<T, K> — kebalikan Pick. Record<K, V> — dictionary dengan key dan value type spesifik. ReturnType<T> — extract tipe kembalian fungsi. Readonly<T> — prevent mutation.

**Discriminated Unions:** Pattern paling powerful di TypeScript untuk memodelkan state yang memiliki beberapa kemungkinan bentuk (API response success/error, state machine). Setiap anggota memiliki "discriminant" — sebuah literal property unik yang TypeScript gunakan untuk mempersempit tipe secara otomatis dalam switch/if.

**Type Narrowing:** Setelah melewati conditional (if, instanceof, typeof, discriminant check), TypeScript mempersempit tipe secara otomatis di dalam scope tersebut. Ini membuat kode lebih safe sekaligus lebih ekspresif — tidak perlu type assertion.`,
      why: `TypeScript yang digunakan dengan benar membuat refactoring besar aman (compiler berteriak di mana pun kontrak dilanggar), membuat onboarding developer baru lebih cepat (tipe adalah dokumentasi yang tidak pernah outdated), dan mengeliminasi seluruh kategori bug runtime (null/undefined access, salah tipe parameter).`,
      mistake: `Menggunakan 'as' (type assertion) atau 'any' sebagai jalan pintas. 'as' mengatakan ke compiler "percayai aku" — ini mematikan type checking dan sama saja seperti tidak menggunakan TypeScript. Bug dari type assertion tidak tertangkap sampai runtime. Gunakan type guard (is operator) atau discriminated union sebagai gantinya.`,
      interview: [
        {
          q: 'Apa perbedaan antara interface dan type di TypeScript? Kapan menggunakan yang mana?',
          a: 'Interface: bisa di-extend (interface B extends A), bisa di-merge (declaration merging — dua interface dengan nama sama otomatis digabung), dan lebih cocok untuk mendefinisikan "shape" object yang akan di-implement. Type alias: lebih fleksibel — bisa mendefinisikan union (type X = A | B), intersection, primitive alias, tuple, dan template literal types. Tidak bisa di-merge. Panduan umum: gunakan interface untuk API publik (class contracts, library APIs) karena bisa di-extend oleh user. Gunakan type alias untuk internal types, union/intersection, dan ketika perlu flexibility yang interface tidak punya. Di praktik sehari-hari, perbedaannya kecil — konsistensi dalam satu codebase lebih penting.'
        },
        {
          q: 'Jelaskan bagaimana Discriminated Union bekerja dan berikan contoh use case nyata.',
          a: 'Discriminated Union adalah union type di mana setiap anggota memiliki property literal unik (discriminant). TypeScript menggunakan discriminant untuk mempersempit tipe di dalam conditional. Contoh: type Result<T> = { status: "success"; data: T } | { status: "error"; error: string }. Di dalam switch(result.status) { case "success": ... } TypeScript TAHU bahwa result.data ada dan result.error tidak ada. Tanpa discriminated union, harus pakai optional fields (?), dan TypeScript tidak bisa memastikan konsistensi — bisa ada { status: "success" } tanpa data, atau { status: "error" } tanpa error. Use case nyata: Redux action types, API response models, state machine states.'
        },
        {
          q: 'Kapan menggunakan unknown vs any? Bagaimana cara kerja type narrowing dengan unknown?',
          a: 'any: mematikan semua type checking, TIDAK safe. any bisa di-assign ke apa saja dan dari apa saja tanpa error. Ini escape hatch yang harus dihindari. unknown: type-safe counterpart dari any. Nilai dengan type unknown TIDAK bisa digunakan tanpa narrowing terlebih dahulu — compiler memaksa lo melakukan type check dulu. Contoh narrowing dengan unknown: function process(val: unknown) { if (typeof val === "string") { val.toUpperCase() } else if (val instanceof Error) { val.message } }. Gunakan unknown untuk external data (response API, input user, JSON.parse) karena memaksa explicit handling dari semua kemungkinan tipe.'
        }
      ],
      code: `// GENERICS — Type-safe reusable functions
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0]
}
const name = getFirst(['Alice', 'Bob'])  // TypeScript knows: string | undefined
const num  = getFirst([1, 2, 3])         // TypeScript knows: number | undefined

// UTILITY TYPES — Real-world usage
interface User { id: string; name: string; email: string; role: 'admin' | 'user'; createdAt: Date }

type UpdateUserDTO = Partial<Pick<User, 'name' | 'email'>>   // PATCH endpoint
type PublicUser   = Omit<User, 'createdAt'>                  // API response
type UserMap      = Record<string, User>                     // Dictionary

// DISCRIMINATED UNION — State machine
type ApiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

function renderUser(state: ApiState<User>) {
  switch (state.status) {
    case 'loading': return 'Loading...'
    case 'error':   return state.error    // TS knows: .error exists
    case 'success': return state.data.name // TS knows: .data exists
    default:        return null
  }
}

// TYPE GUARD — Safe narrowing
function isApiError(err: unknown): err is { code: string; message: string } {
  return typeof err === 'object' && err !== null && 'code' in err
}
try { /* ... */ } catch (err) {
  if (isApiError(err)) console.error(err.code) // Safe!
}`
    },
    {
      id: 'git-internals',
      title: 'Git Internals & Pro Workflow',
      depth: 'Objects, Refs, Rebase vs Merge, Bisect',
      content: `Git bukan sekedar "backup kode". Git adalah content-addressable filesystem. Memahami cara Git menyimpan data secara internal menghilangkan rasa takut saat menghadapi conflict atau mencari bug.

**Git Object Model:** Git menyimpan empat jenis objek di .git/objects: Blob (isi file), Tree (isi direktori — list blob dan subtree), Commit (pointer ke satu tree + parent commits + metadata + pesan), Tag (pointer ke objek tertentu). Setiap objek diidentifikasi oleh SHA-1 hash dari isinya — konten yang sama selalu punya hash yang sama, integritas terjamin.

**Refs:** Branch hanyalah file teks yang berisi SHA-1 dari commit yang ia tunjuk. Ketika commit, Git membuat objek commit baru dan memperbarui file branch tersebut. HEAD adalah ref yang menunjuk ke branch aktif (atau langsung ke commit dalam "detached HEAD" state).

**Merge vs Rebase:** Merge: menggabungkan dua branch dengan membuat "merge commit" — satu commit dengan dua parent. History non-linear (jujur, mencerminkan kapan branch bergabung). Rebase: mengambil commit dari satu branch dan "memutar ulangnya" di atas branch lain. History linear dan bersih — seolah-olah selalu bekerja di atas kode terbaru. ATURAN EMAS: JANGAN rebase branch yang sudah di-push ke shared remote, karena rebase menulis ulang SHA-1.

**Git Bisect:** Binary search di history commit. Tandai commit good dan bad, git otomatis checkout commit tengah untuk di-test. Menemukan commit penyebab bug dalam O(log n) langkah.`,
      why: `Kemampuan Git yang solid langsung terlihat di tim profesional. Engineer yang paham rebase bisa menjaga history bersih dan PR mudah di-review. Engineer yang bisa git bisect menemukan penyebab bug regression dalam menit, bukan jam. Dan engineer yang tidak sengaja force-push ke main bisa menghancurkan kerja tim seharian.`,
      mistake: `Force pushing (git push -f) ke branch shared. Commit pesan yang tidak informatif ('fix', 'update', 'wip'). Mengerjakan banyak perubahan tidak berhubungan dalam satu commit — membuat git revert atau debug mustahil. Tidak menggunakan 'git stash' saat perlu switch context, sehingga commit "work in progress" mengotori history.`,
      interview: [
        {
          q: 'Apa perbedaan antara git merge dan git rebase? Kapan menggunakan yang mana?',
          a: 'git merge: membuat merge commit (commit dengan dua parent), mempertahankan history percabangan yang jujur. History berbentuk diamond — terlihat kapan persis branch dibuat dan digabungkan. git rebase: mengambil commit dari branch kita dan "memutar ulang" di atas target branch. SHA-1 dari commit BERUBAH (commit baru). History menjadi linear seolah-olah tidak ada branching. Kapan merge: untuk menggabungkan feature branch ke main (biarkan history jujur), saat branch sudah di-push ke remote. Kapan rebase: untuk mengupdate feature branch kita dengan perubahan terbaru dari main (sebelum PR), saat ingin history yang lebih bersih untuk code review. Golden rule: rebase branch lokal, merge branch publik.'
        },
        {
          q: 'Bagaimana cara menggunakan git bisect untuk menemukan commit yang memperkenalkan bug?',
          a: 'git bisect melakukan binary search di commit history: (1) git bisect start, (2) git bisect bad (commit sekarang adalah bug), (3) git bisect good v1.0.0 (versi yang masih bagus). Git akan checkout commit di tengah antara good dan bad. Lo test apakah bug ada: (4a) git bisect good (tidak ada bug di commit ini) → git checkout yang lebih baru. (4b) git bisect bad (bug ada di commit ini) → git checkout yang lebih lama. Ulangi sampai git print "X is the first bad commit". Terakhir: (5) git bisect reset untuk kembali ke HEAD. Untuk 1000 commit: hanya butuh ~10 test (log₂(1000) ≈ 10). Bisa juga diotomasi: git bisect run ./test.sh — git akan run script dan otomatis tandai good/bad.'
        },
        {
          q: 'Apa yang sebenarnya tersimpan dalam sebuah Git commit?',
          a: 'Git commit menyimpan: (1) Pointer ke SATU tree object (snapshot lengkap dari seluruh direktori proyek saat itu — bukan diff!). (2) Pointer ke parent commit(s) (satu untuk commit biasa, dua untuk merge commit, nol untuk initial commit). (3) Metadata: author name+email+timestamp, committer name+email+timestamp (beda jika rebase atau amend). (4) Commit message. SHA-1 commit dihitung dari SEMUA konten ini — jika parent berubah (rebase), SHA-1 berubah juga. Git menyimpan snapshot, bukan delta/patch. Ini kenapa git checkout cepat — tidak perlu apply patch, langsung baca snapshot dari object store.'
        }
      ],
      code: `# PROFESSIONAL DAILY WORKFLOW
git checkout main && git pull --rebase origin main
git checkout -b feat/user-auth-jwt

# Semantic commits
git commit -m "feat(auth): implement JWT token generation"
git commit -m "test(auth): add integration tests for login flow"

# Before PR: rebase on top of latest main
git fetch origin
git rebase origin/main
# If conflict: resolve → git add . → git rebase --continue

git push -u origin feat/user-auth-jwt

# GIT BISECT: Find bug in O(log n)
git bisect start
git bisect bad                  # Current HEAD is broken
git bisect good v2.0.0          # This version was fine
# Git checks out midpoint commit — test it...
git bisect good                 # No bug here? Go newer
# or: git bisect bad            # Bug here? Go older
# Repeat until: "abc1234 is the first bad commit"
git bisect reset

# INTERACTIVE REBASE: Clean up commits before PR
git rebase -i origin/main
# pick  abc123 feat: add auth
# squash def456 fix typo  ← merge into above
# reword ghi789 fix tests ← change message`
    }
  ]
}
