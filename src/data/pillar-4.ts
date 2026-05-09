import type { Pillar } from './types'

export const pillar4: Pillar = {
  id: 'frontend',
  title: 'Pillar 4 — Frontend Architecture',
  topics: [
    {
      id: 'dom-bom-101',
      title: 'DOM & Event Mechanics 101',
      depth: 'The Document Object Model and Event Bubbling',
      content: 'Framework JavaScript seperti React menyembunyikan kompleksitas dari kita. Tapi engineer hebat tahu apa yang terjadi di balik layar.\n\n**DOM & BOM:** Saat HTML diterima browser, ia di-parsing menjadi struktur pohon: DOM (Document Object Model). Setiap elemen HTML menjadi Node. BOM (Browser Object Model) adalah objek global `window` yang memberi akses ke API browser (Local Storage, Geolocation, History).\n\n**Event Bubbling vs Capturing:** Jika Anda meng-klik sebuah tombol di dalam <div>, siapa yang tahu duluan? Browser menggunakan dua fase: *Capturing* (dari parent paling atas turun ke tombol) dan *Bubbling* (dari tombol naik kembali ke parent teratas). Secara default, event listener aktif di fase Bubbling. Ini yang memungkinkan **Event Delegation**.\n\n**Event Delegation:** Alih-alih memasang 100 event listener pada 100 baris tabel, pasang SATU event listener di <ul> atau <table> parent-nya. Saat baris diklik, event akan *bubble up* ke parent, dan parent mengecek `event.target` untuk melihat baris mana yang diklik. Menghemat memori drastis!',
      why: 'React menggunakan Synthetic Events dan Event Delegation secara internal (React 17+ memasangnya di Root Node). Memahami ini akan menjelaskan mengapa `e.stopPropagation()` kadang berperilaku aneh jika digabung dengan Vanilla JS event listeners di project React yang sama.',
      mistake: 'Selalu menggunakan `document.getElementById` atau DOM mutator secara manual bersamaan dengan framework deklaratif seperti React. Framework menggunakan Virtual DOM; jika Anda memodifikasi Real DOM langsung (tanpa `ref`), state framework dan DOM akan tidak sinkron dan menyebabkan UI crash.',
      content_casual: 'Framework JavaScript kayak React itu emang manjain banget. Tapi kalau lo nggak tau sihir apa yang terjadi di Vanilla JS, lo bakal gampang nyasar pas nge-debug DOM.\n\n**DOM & BOM:** Begitu browser nerima HTML, dia langsung bikin pohon hierarki (DOM). Tiap tag HTML jadi *Node*. Terus ada BOM (*Browser Object Model*) alias si bos `window`. Dia yang megang kunci ke Local Storage, GPS, sama *History* browser lo.\n\n**Event Bubbling:** Lo ngeklik tombol di dalem `div`. Siapa yang nyadar duluan? Browser ngejalanin 2 fase: *Capturing* (dari nenek moyang turun ke tombol) terus *Bubbling* (dari tombol naik lagi laporan ke nenek moyang). Nah, *Bubbling* ini rahasia di balik **Event Delegation**.\n\n**Event Delegation:** Daripada lo capek-capek masang 1.000 event listener ke 1.000 baris tabel (bikin RAM bocor), mending lo pasang 1 listener aja di `table` parent-nya. Pas baris diklik, event-nya bakal "naik" (bubble up) ke parent, terus parent tinggal ngecek `event.target`. Jenius kan?',
      why_casual: 'React itu nge-handle *Event Delegation* di level *Root* secara otomatis pakai Synthetic Events. Kalau lo nggak paham konsep *Bubbling*, lo bakal bingung setengah mati kenapa `e.stopPropagation()` di kode Vanilla JS lo ngerusak fitur React.',
      mistake_casual: 'Nyampur kode `document.getElementById()` barengan sama React. React itu kerjanya pakai *Virtual DOM*. Kalau lo ngubah *Real DOM* seenak jidat (tanpa *refs*), state React bakal *out-of-sync* dan UI lo berantakan. Jangan sentuh DOM langsung kalau pakai Framework!',
      interview: [
        {
          q: 'Apa itu Event Delegation dan mengapa ia sangat berguna?',
          a: 'Event delegation adalah teknik mendelegasikan penanganan event ke elemen induk, alih-alih memasang listener pada masing-masing anak. Karena mekanisme Event Bubbling, klik pada elemen anak akan merambat naik ke induk. Ini berguna karena: (1) Jauh lebih hemat memori (1 listener vs 1000 listener). (2) Elemen anak yang ditambahkan secara dinamis (via AJAX/DOM manipulation) otomatis bisa langsung merespon event tanpa perlu di-bind listener baru.'
        }
      ],
      code: '// EVENT DELEGATION IN VANILLA JS\nconst ul = document.getElementById("my-list");\n\n// Only 1 listener instead of 100!\nul.addEventListener("click", (e) => {\n  // Check if the clicked target is an LI element\n  if (e.target && e.target.nodeName === "LI") {\n    console.log("List item clicked:", e.target.innerText);\n  }\n});'
    },
    {
      id: 'state-management-101',
      title: 'State Management Concepts',
      depth: 'MVC vs Flux and Unidirectional Data Flow',
      content: 'Kompleksitas utama di Frontend bukanlah tampilan UI, melainkan mengelola State (Data) agar selalu sinkron dengan UI.\n\n**MVC (Model-View-Controller) Klasik di Frontend:** State dikelola di Model, UI di View. Saat Model berubah, View di-update. Dulu (seperti di AngularJS/Backbone), ini bisa menghasilkan *Two-Way Data Binding* (View mengubah Model, Model mengubah View lain). Di aplikasi besar, ini menciptakan efek domino (*cascading updates*) yang sangat sulit di-debug.\n\n**Unidirectional Data Flow (Flux/Redux):** Konsep ini dipopulerkan oleh React. Data hanya mengalir SATU ARAH. View memicu *Action*, Action dikirim ke *Dispatcher/Reducer*, Reducer memperbarui *Store* (State sentral), dan Store merender ulang View. View tidak pernah mengubah State secara langsung.\n\n**Modern Evolution (Signals):** Pendekatan Redux mengharuskan re-render komponen secara Top-Down. Tren terbaru (SolidJS, Preact Signals, Vue 3) menggunakan *Fine-Grained Reactivity*. State dibungkus sebagai "Signal". Saat Signal berubah, ia tahu persis elemen DOM mana yang bergantung padanya dan hanya meng-update elemen DOM kecil tersebut, tanpa VDOM diffing.',
      why: 'Anda tidak akan paham mengapa Redux sangat *boilerplate-heavy* jika tidak pernah merasakan kacaunya debugging Two-Way Data Binding di jQuery/AngularJS. Memahami alur data ini membedakan Coder dengan Architect.',
      mistake: 'Menyimpan state yang diturunkan (derived state) di dalam variabel state utama. Jika *fullName* bisa didapatkan dari *firstName* + *lastName*, JANGAN simpan *fullName* di State. Hitung saja secara on-the-fly saat render. Menyimpan derived state akan memicu bug inkonsistensi saat salah satu nama berubah.',
      content_casual: 'Bikin UI itu gampang. Yang bikin Frontend developer gila itu ngatur *State* (Data) biar sinkron sama UI-nya.\n\n**MVC Klasik:** Dulu kita pakai *Two-Way Data Binding* (View ngubah Model, Model ngubah View lain). Kesannya canggih, tapi pas aplikasinya gede, satu klik tombol bisa memicu reaksi berantai mutasi data yang bikin otak meledak pas *debugging*.\n\n**Unidirectional Data Flow (Redux/Flux):** React datang bawa solusi: Data cuma boleh ngalir SATU ARAH. UI nge-klik tombol -> *Action* dikirim -> *Reducer* ngubah *Store* -> UI dapet data baru dan *re-render*. UI nggak pernah diizinkan ngubah state langsung. Gila, tapi bener-bener *predictable*.\n\n**Tren Baru (Signals):** Redux emang *predictable*, tapi dia nuntut *re-render* secara top-down. Sekarang lagi tren *Fine-Grained Reactivity* kayak SolidJS atau Vue 3. State dibungkus jadi "Signal". Pas Signal berubah, dia ngasih tau DOM *node* kecil spesifik yang pake dia buat *update* sendiri. Nggak butuh *Virtual DOM* diffing yang berat!',
      why_casual: 'Lo nggak bakal pernah bersyukur sama Redux/Zustand kalau lo belum ngerasain ngebenerin *spaghetti state* di jQuery. Paham alur satu arah (Unidirectional) itu bedain mana programmer junior dan mana *Frontend Architect*.',
      mistake_casual: 'Nyimpen *Derived State* di dalem state utama. Kalau lo punya `firstName` dan `lastName`, JANGAN pernah bikin `const [fullName, setFullName]`! Hitung aja langsung pas ngerender (`const fullName = firstName + " " + lastName`). Nyimpen *derived state* itu nyari mati karena gampang banget *out-of-sync*.',
      interview: [
        {
          q: 'Apa masalah utama dari Two-Way Data Binding di aplikasi skala besar dan bagaimana Unidirectional Data Flow menyelesaikannya?',
          a: 'Two-way binding membuat pelacakan mutasi state sangat sulit. Jika View A mengubah Model 1, Model 1 mengubah View B, View B mengubah Model 2, satu aksi user memicu reaksi berantai yang tidak bisa diprediksi. Unidirectional Data Flow (seperti Flux) menyelesaikannya dengan membuat state mutation menjadi proses tersentralisasi dan satu arah. View hanya mendispatch Action (maksud). Reducer/Store yang memproses state. Ini membuat mutation menjadi transparan, predictable, dan mudah di-time-travel debugging.'
        }
      ],
      code: '// UNIDIRECTIONAL MENTAL MODEL (Redux-style)\n// 1. STATE (Single Source of Truth)\nlet state = { count: 0 }\n\n// 2. VIEW (Driven completely by state)\nconst render = () => console.log("UI updated:", state.count)\n\n// 3. ACTION (The intent to change)\nconst action = { type: "INCREMENT" }\n\n// 4. REDUCER (Pure function handling state change)\nfunction reducer(prevState, action) {\n  if (action.type === "INCREMENT") return { count: prevState.count + 1 }\n  return prevState\n}\n\n// 5. DISPATCH (View cannot mutate state directly!)\nstate = reducer(state, action)\nrender()'
    },
    {
      id: 'browser-rendering',
      title: 'Browser Rendering Pipeline',
      depth: 'CRP, Reflow, Repaint, GPU Compositing',
      image: '/illustrations/browser-pipeline.png',
      content: `Browser mengubah HTML/CSS/JS menjadi pixel melalui serangkaian tahap yang disebut Critical Rendering Path (CRP). Setiap tahap memiliki biaya berbeda.

**DOM & CSSOM Construction:** Browser mem-parse HTML secara incremental menjadi DOM tree. CSS di-download dan di-parse secara paralel menjadi CSSOM. CSS adalah "render-blocking" — browser tidak merender apapun sampai seluruh CSS di-parse. JavaScript adalah "parser-blocking" — script tag tanpa async/defer menghentikan HTML parsing. Gunakan async (download paralel, eksekusi saat selesai) atau defer (download paralel, eksekusi setelah DOM parsed, ordered).

**Layout (Reflow):** DOM + CSSOM digabung menjadi Render Tree. Browser menghitung ukuran dan posisi setiap elemen. Sangat mahal — perubahan satu elemen bisa re-layout seluruh halaman. Dipicu: mengubah width, height, padding, margin, font-size, menambah/hapus DOM nodes.

**Paint & Composite:** Paint: browser menggambar elemen ke "layer" bitmap di CPU. Mengubah warna, background, shadow memicu Repaint (lebih murah dari Reflow). Composite: GPU menyatukan semua layer. Operasi yang hanya memicu Composite (GPU — sangat murah): transform, opacity. Inilah kenapa animasi CSS transform jauh lebih smooth dari animasi margin.

**Forced Synchronous Layout (Layout Thrashing):** Membaca property layout (offsetWidth, getBoundingClientRect) lalu menulis ke DOM dalam satu frame memaksa browser Layout di tengah JavaScript. Batch semua reads, lalu batch semua writes.`,
      why: `Setiap frame animasi hanya punya budget 16.6ms (60fps). Reflow yang tidak perlu membuang budget ini. Memahami pipeline memungkinkan debug jank menggunakan Chrome Performance tab dan mendesain animasi GPU-accelerated dari awal.`,
      mistake: `Animasi menggunakan left/top (triggers Layout setiap frame). Loop yang melakukan read lalu write: for(el of els) { el.style.height = el.offsetWidth + "px" } — forced sync layout setiap iterasi. Gunakan: baca semua dulu, tulis semua kemudian.`,
      content_casual: `Browser mengubah HTML/CSS/JS menjadi pixel melalui serangkaian tahap yang disebut Critical Rendering Path (CRP). Setiap tahap memiliki biaya berbeda.

**DOM & CSSOM Construction:** Browser mem-parse HTML secara incremental menjadi DOM tree. CSS di-download dan di-parse secara paralel menjadi CSSOM. CSS adalah "render-blocking" — browser tidak merender apapun sampai seluruh CSS di-parse. JavaScript adalah "parser-blocking" — script tag tanpa async/defer menghentikan HTML parsing. Gunakan async (download paralel, eksekusi saat selesai) atau defer (download paralel, eksekusi setelah DOM parsed, ordered).

**Layout (Reflow):** DOM + CSSOM digabung menjadi Render Tree. Browser menghitung ukuran dan posisi setiap elemen. Sangat mahal — perubahan satu elemen bisa re-layout seluruh halaman. Dipicu: mengubah width, height, padding, margin, font-size, menambah/hapus DOM nodes.

**Paint & Composite:** Paint: browser menggambar elemen ke "layer" bitmap di CPU. Mengubah warna, background, shadow memicu Repaint (lebih murah dari Reflow). Composite: GPU menyatukan semua layer. Operasi yang hanya memicu Composite (GPU — sangat murah): transform, opacity. Inilah kenapa animasi CSS transform jauh lebih smooth dari animasi margin.

**Forced Synchronous Layout (Layout Thrashing):** Membaca property layout (offsetWidth, getBoundingClientRect) lalu menulis ke DOM dalam satu frame memaksa browser Layout di tengah JavaScript. Batch semua reads, lalu batch semua writes.`,
      why_casual: `Setiap frame animasi hanya punya budget 16.6ms (60fps). Reflow yang tidak perlu membuang budget ini. Memahami pipeline memungkinkan debug jank menggunakan Chrome Performance tab dan mendesain animasi GPU-accelerated dari awal.`,
      mistake_casual: `Animasi menggunakan left/top (triggers Layout setiap frame). Loop yang melakukan read lalu write: for(el of els) { el.style.height = el.offsetWidth + "px" } — forced sync layout setiap iterasi. Gunakan: baca semua dulu, tulis semua kemudian.`,
      interview: [
        {
          q: 'Mengapa animasi menggunakan transform jauh lebih baik dari animasi menggunakan margin atau top/left?',
          a: 'Perubahan margin/top/left mempengaruhi geometry elemen dalam document flow. Ini memaksa browser melewati SELURUH pipeline: Layout (hitung ulang posisi semua elemen yang terpengaruh) → Paint (gambar ulang layer) → Composite. Untuk animasi 60fps, ini harus selesai dalam 16.6ms. Pada device lambat, ini menyebabkan dropped frames (jank). Sebaliknya, transform (translateX, translateY, scale, rotate) tidak mempengaruhi document flow. Browser modern mengeksekusi transform di Composite stage — langsung di GPU thread, tanpa menyentuh Layout atau Paint sama sekali. GPU dapat memindahkan/menskala layer dengan sangat cepat. Hasilnya: animasi 60fps bahkan di JavaScript yang sibuk. Cara memaksakan GPU layer: will-change: transform atau transform: translateZ(0) (hack lama). Gunakan dengan bijak — terlalu banyak GPU layer menghabiskan VRAM.'
        },
        {
          q: 'Apa itu Layout Thrashing dan bagaimana cara menghindarinya?',
          a: 'Layout Thrashing terjadi ketika JavaScript secara bergantian membaca dan menulis layout properties dalam satu frame, memaksa browser melakukan "forced synchronous layout" berkali-kali. Contoh buruk: elements.forEach(el => { const width = el.offsetWidth; el.style.width = (width * 2) + "px"; }). Setiap iterasi: READ (browser terpaksa selesaikan pending layout untuk kasih nilai yang akurat) → WRITE (invalidate layout). Iterasi berikutnya: READ lagi (paksa layout ulang). Pola ini membuat layout berjalan n kali per frame alih-alih satu kali. Solusinya: batch semua reads dulu, lalu batch semua writes. Pakai FastDOM library atau requestAnimationFrame. React menghindari ini secara otomatis karena reconciler memisahkan read phase (render) dari write phase (commit/DOM mutation).'
        },
        {
          q: 'Jelaskan perbedaan antara async dan defer pada script tag. Kapan menggunakan masing-masing?',
          a: 'Tanpa attribute: script tag menghentikan HTML parsing, download script, eksekusi, baru lanjut parsing. Blocking sepenuhnya. async: download script PARALEL dengan HTML parsing (tidak blocking download). Tapi saat script selesai download, HTML parsing DIHENTIKAN untuk eksekusi. Urutan eksekusi tidak deterministik (siapa yang selesai duluan). Cocok untuk script yang independent dan tidak bergantung pada DOM atau script lain (analytics, ads). defer: download script PARALEL dengan HTML parsing. Eksekusi SETELAH HTML selesai di-parse tapi SEBELUM DOMContentLoaded event. Urutan eksekusi sesuai urutan di HTML. Cocok untuk script yang bergantung pada DOM atau pada script lain (hampir semua script aplikasi). Best practice modern: gunakan defer untuk semua script aplikasi di head (atau letakkan di end of body). Module scripts (<script type="module">) otomatis defer.'
        }
      ],
      code: `/* GPU-ACCELERATED ANIMATION */
.box-bad {
    transition: margin-left 300ms;   /* Layout → Paint → Composite */
}
.box-good {
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;           /* GPU layer promotion */
}
.box-good:hover { transform: translateX(100px); } /* Composite only */

/* AVOID LAYOUT THRASHING */
// BAD: Read → Write → Read → Write (forces layout each iteration)
elements.forEach(el => {
    const width = el.offsetWidth           // READ (triggers layout)
    el.style.height = width + 'px'        // WRITE (invalidates layout)
})

// GOOD: All reads, then all writes
const widths = elements.map(el => el.offsetWidth) // Batch READs
elements.forEach((el, i) => {
    el.style.height = widths[i] + 'px'           // Batch WRITEs
})

// BEST: requestAnimationFrame for visual updates
requestAnimationFrame(() => {
    const widths = elements.map(el => el.offsetWidth)
    elements.forEach((el, i) => { el.style.height = widths[i] + 'px' })
})`
    },
    {
      id: 'react-internals',
      title: 'React Fiber, Reconciliation & Hooks',
      depth: 'Fiber architecture, work loop, hooks linked list',
      content: `React adalah state machine sophisticated. Memahami cara kerjanya memungkinkan debug render issues dan menggunakan API baru dengan benar.

**React Fiber Architecture:** Sebelum React 16, rendering rekursif dan tidak bisa di-interrupt. Fiber memperkenalkan unit kerja yang bisa di-pause dan di-prioritas. Setiap React element memiliki fiber node dengan: type, props, state, dan referensi parent/child/sibling. Dua fase: Render phase (bangun work-in-progress fiber tree, bisa di-interrupt, async) dan Commit phase (apply ke DOM, selalu synchronous, tidak bisa di-interrupt).

**Priority Lanes (React 18):** startTransition() menandai update sebagai low-priority — bisa di-interrupt oleh user interaction. useDeferredValue() untuk derived values yang boleh stale sementara.

**Hooks — Internal Implementation:** Hooks disimpan sebagai linked list di fiber node. Urutan pemanggilan HARUS konsisten — inilah kenapa hooks tidak boleh di dalam conditional atau loop. React menggunakan "current dispatcher" yang berbeda antara mount dan update.

**Reconciliation & Keys:** Saat state berubah, React diff dua fiber trees. Elemen dengan tipe berbeda → unmount seluruh subtree lama. Key prop mengidentifikasi elemen dalam list — key stable memungkinkan React memindahkan DOM node daripada destroy+recreate.`,
      why: `Pemahaman Fiber menjelaskan kenapa useEffect berjalan setelah paint, kenapa state updates di-batch di React 18, dan kenapa Strict Mode double-invokes effects. Tanpa ini, lo hanya bisa copy-paste patterns tanpa tahu kapan dan mengapa.`,
      mistake: `Stale closure di useEffect: dependency array tidak lengkap menyebabkan closure menangkap nilai lama. ESLint react-hooks/exhaustive-deps adalah mandatory. Calling hooks dalam conditional. Menggunakan useEffect untuk derived state (seharusnya hitung saat render, bukan side effect).`,
      content_casual: `React adalah state machine sophisticated. Memahami cara kerjanya memungkinkan debug render issues dan menggunakan API baru dengan benar.

**React Fiber Architecture:** Sebelum React 16, rendering rekursif dan tidak bisa di-interrupt. Fiber memperkenalkan unit kerja yang bisa di-pause dan di-prioritas. Setiap React element memiliki fiber node dengan: type, props, state, dan referensi parent/child/sibling. Dua fase: Render phase (bangun work-in-progress fiber tree, bisa di-interrupt, async) dan Commit phase (apply ke DOM, selalu synchronous, tidak bisa di-interrupt).

**Priority Lanes (React 18):** startTransition() menandai update sebagai low-priority — bisa di-interrupt oleh user interaction. useDeferredValue() untuk derived values yang boleh stale sementara.

**Hooks — Internal Implementation:** Hooks disimpan sebagai linked list di fiber node. Urutan pemanggilan HARUS konsisten — inilah kenapa hooks tidak boleh di dalam conditional atau loop. React menggunakan "current dispatcher" yang berbeda antara mount dan update.

**Reconciliation & Keys:** Saat state berubah, React diff dua fiber trees. Elemen dengan tipe berbeda → unmount seluruh subtree lama. Key prop mengidentifikasi elemen dalam list — key stable memungkinkan React memindahkan DOM node daripada destroy+recreate.`,
      why_casual: `Pemahaman Fiber menjelaskan kenapa useEffect berjalan setelah paint, kenapa state updates di-batch di React 18, dan kenapa Strict Mode double-invokes effects. Tanpa ini, lo hanya bisa copy-paste patterns tanpa tahu kapan dan mengapa.`,
      mistake_casual: `Stale closure di useEffect: dependency array tidak lengkap menyebabkan closure menangkap nilai lama. ESLint react-hooks/exhaustive-deps adalah mandatory. Calling hooks dalam conditional. Menggunakan useEffect untuk derived state (seharusnya hitung saat render, bukan side effect).`,
      interview: [
        {
          q: 'Mengapa hooks tidak boleh dipanggil dalam conditional atau loop?',
          a: 'React menyimpan hooks sebagai linked list di fiber node. Setiap hook call dalam sebuah component memiliki "slot" yang tetap dalam linked list tersebut. React mengidentifikasi hook berdasarkan URUTAN pemanggilan, bukan nama. Pada setiap render, React mengeksekusi component function dan menelusuri linked list slot per slot. Jika hook berada dalam conditional, ada render di mana hook tersebut tidak dipanggil — linked list "melompat" satu slot. Hook berikutnya membaca slot yang salah. State dari useState("hello") bisa terbaca sebagai state dari useReducer lain. Ini menyebabkan bug yang sangat sulit di-debug. React akan throw error "Rendered more/fewer hooks than previous render" jika jumlah hooks berubah. Solusi: taruh conditional DI DALAM hook, bukan hook di dalam conditional.'
        },
        {
          q: 'Apa perbedaan antara Render Phase dan Commit Phase di React?',
          a: 'Render Phase (juga disebut Reconciliation): React memanggil component functions (atau render methods) untuk membangun "work-in-progress" fiber tree baru. Membandingkan dengan fiber tree yang ada (diffing). Menentukan perubahan apa yang perlu dilakukan ke DOM. Phase ini BISA DI-INTERRUPT — React bisa berhenti di tengah jalan dan restart (misalnya ada update dengan priority lebih tinggi). Side effects TIDAK boleh terjadi di sini (seharusnya — ini kenapa Strict Mode double-invokes render untuk menangkap side effects yang tidak sengaja). Commit Phase: React menerapkan semua perubahan DOM yang sudah ditentukan. Phase ini TIDAK BISA DI-INTERRUPT — harus selesai sampai tuntas agar tidak ada partial UI. Setelah DOM mutations selesai, React menjalankan useLayoutEffect (synchronous, blocking), kemudian browser paint, kemudian useEffect (asynchronous, tidak blocking).'
        },
        {
          q: 'Jelaskan mengapa ini bugs dan bagaimana memperbaikinya: useEffect(() => { const id = setInterval(() => setCount(count + 1), 1000); return () => clearInterval(id); }, []);',
          a: 'Bug: count di dalam callback selalu mengambil nilai dari saat closure dibuat (saat mount pertama kali) — bukan nilai terbaru. Ini stale closure. Karena dependency array kosong [], effect hanya dibuat sekali (mount). Saat itu, closure "menangkap" count = 0. Setiap tick interval memanggil setCount(0 + 1) = 1. Count tidak pernah bertambah melebihi 1. Perbaikan 1 — Functional update form: setCount(prev => prev + 1). Menggunakan previous state yang selalu fresh, tidak bergantung pada closure. Dependency array tetap kosong. Perbaikan 2 — Tambahkan count ke dependency array: [], [count]. Tapi ini akan destroy dan recreate interval setiap kali count berubah — berfungsi tapi kurang efisien. Perbaikan 1 adalah yang benar untuk kasus ini. Prinsip: gunakan functional update (setState(prev => ...)) setiap kali new state bergantung pada old state.'
        }
      ],
      code: `// HOOKS ORDER — Why it matters
// BAD: Hook inside conditional (React WILL error)
function Profile({ userId }) {
    if (!userId) return null  // Early return BEFORE hooks = bug
    const [user, setUser] = useState(null)  // Different slot each render!
}

// GOOD: Condition INSIDE hook
function Profile({ userId }) {
    const [user, setUser] = useState(null)
    useEffect(() => {
        if (!userId) return  // Guard inside effect
        fetchUser(userId).then(setUser)
    }, [userId])
    if (!userId) return null  // Return AFTER hooks
}

// STALE CLOSURE — The most common React bug
// BAD: count is always 0 inside closure
useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000)
    return () => clearInterval(id)
}, [])  // [] means closure captures initial count=0

// GOOD: Functional update — no stale closure
useEffect(() => {
    const id = setInterval(() => setCount(prev => prev + 1), 1000)
    return () => clearInterval(id)
}, [])  // Safe: doesn't need count in closure

// startTransition: Mark as non-urgent
function SearchPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])

    function handleSearch(e) {
        setQuery(e.target.value)        // Urgent: update input immediately
        startTransition(() => {
            setResults(heavySearch(e.target.value)) // Can be interrupted
        })
    }
}`
    },
    {
      id: 'react-performance',
      title: 'React Performance Patterns',
      depth: 'Profiler, memoization, virtualization, code splitting',
      content: `React performance adalah tentang mengurangi unnecessary work di React layer (re-renders) dan browser layer (DOM updates). Kunci: profile dulu, optimize setelahnya. Jangan optimize spekulatif.

**React DevTools Profiler:** Rekam render cycles dan tunjukkan: komponen mana yang re-render, berapa lama, dan apa penyebabnya (state, prop, context, atau parent re-render). Flamegraph untuk waktu, Ranked chart untuk komponen terlama.

**Memoization:** React.memo: skip re-render child jika props tidak berubah (shallow comparison). useMemo: memoize hasil kalkulasi mahal. useCallback: memoize definisi fungsi — berguna saat di-pass sebagai prop ke React.memo child. Memoization punya cost sendiri (memory + comparison). Gunakan hanya setelah profiler membuktikan ada masalah.

**Virtualization (Windowing):** Untuk list ribuan item, hanya render item yang visible di viewport. react-window atau @tanstack/react-virtual hanya me-mount ~50 DOM nodes terlepas dari ukuran data. Item yang di-scroll keluar di-unmount, item baru di-mount.

**Code Splitting:** React.lazy() + Suspense untuk load komponen on-demand. Route-based splitting adalah minimum: setiap page adalah chunk terpisah. Reduce initial bundle size, mempercepat First Contentful Paint.`,
      why: `50% traffic global dari device dan network yang jauh lebih lambat dari developer laptop. Performance adalah feature — Core Web Vitals mempengaruhi SEO. React app yang tidak dioptimasi bisa punya JS bundle 2MB+ dan rendering 500ms+ di mid-range Android.`,
      mistake: `Memoize semuanya "proaktif" tanpa profiling. useMemo dengan dependency complex bisa lebih lambat dari recalculate sederhana. Setiap React.memo masih re-render jika context yang ia consume berubah. Dan tidak implement route-based code splitting dari awal.`,
      content_casual: `React performance adalah tentang mengurangi unnecessary work di React layer (re-renders) dan browser layer (DOM updates). Kunci: profile dulu, optimize setelahnya. Jangan optimize spekulatif.

**React DevTools Profiler:** Rekam render cycles dan tunjukkan: komponen mana yang re-render, berapa lama, dan apa penyebabnya (state, prop, context, atau parent re-render). Flamegraph untuk waktu, Ranked chart untuk komponen terlama.

**Memoization:** React.memo: skip re-render child jika props tidak berubah (shallow comparison). useMemo: memoize hasil kalkulasi mahal. useCallback: memoize definisi fungsi — berguna saat di-pass sebagai prop ke React.memo child. Memoization punya cost sendiri (memory + comparison). Gunakan hanya setelah profiler membuktikan ada masalah.

**Virtualization (Windowing):** Untuk list ribuan item, hanya render item yang visible di viewport. react-window atau @tanstack/react-virtual hanya me-mount ~50 DOM nodes terlepas dari ukuran data. Item yang di-scroll keluar di-unmount, item baru di-mount.

**Code Splitting:** React.lazy() + Suspense untuk load komponen on-demand. Route-based splitting adalah minimum: setiap page adalah chunk terpisah. Reduce initial bundle size, mempercepat First Contentful Paint.`,
      why_casual: `50% traffic global dari device dan network yang jauh lebih lambat dari developer laptop. Performance adalah feature — Core Web Vitals mempengaruhi SEO. React app yang tidak dioptimasi bisa punya JS bundle 2MB+ dan rendering 500ms+ di mid-range Android.`,
      mistake_casual: `Memoize semuanya "proaktif" tanpa profiling. useMemo dengan dependency complex bisa lebih lambat dari recalculate sederhana. Setiap React.memo masih re-render jika context yang ia consume berubah. Dan tidak implement route-based code splitting dari awal.`,
      interview: [
        {
          q: 'Kapan menggunakan useMemo vs useCallback vs React.memo? Jelaskan perbedaannya.',
          a: 'React.memo: Higher-order component yang membungkus KOMPONEN. Skip re-render jika semua props tidak berubah (shallow equal). Berguna untuk komponen yang render mahal dan menerima props yang jarang berubah. useMemo: Memoize NILAI hasil komputasi. Hanya recompute ketika dependencies berubah. Berguna untuk kalkulasi mahal yang hasilnya digunakan dalam render: const sorted = useMemo(() => items.sort(...), [items]). useCallback: Memoize FUNGSI (function reference). Hanya buat ulang fungsi jika dependencies berubah. Paling berguna saat: (1) fungsi di-pass sebagai prop ke React.memo child (tanpa useCallback, setiap render membuat fungsi baru = React.memo tidak berfungsi), atau (2) fungsi digunakan sebagai dependency di useEffect. Aturan praktis: jangan gunakan satupun jika tidak ada performance problem terukur. Overhead memoization (comparison) seringkali lebih besar dari benefit untuk komponen sederhana.'
        },
        {
          q: 'Apa itu list virtualization dan kapan lo wajib menggunakannya?',
          a: 'List virtualization (windowing) adalah teknik hanya me-render DOM elements yang saat ini visible di viewport, plus sedikit buffer. Meskipun data list berisi 10,000 items, hanya ~30-50 DOM nodes yang ada di DOM. Saat user scroll, item yang keluar viewport di-unmount dan item baru di-mount. Kapan wajib: (1) List dengan > 500 items yang bisa di-scroll. (2) Setiap item merupakan komponen yang agak berat (image, complex layout). (3) Performa scroll terasa lambat atau ada frame drops. Implementasi: @tanstack/react-virtual (headless, lebih fleksibel) atau react-window (simpler API). Alternatif untuk kasus sederhana: pagination atau infinite scroll dengan intersection observer (load lebih banyak saat mendekati bottom). Virtualization lebih complex tapi memberikan pengalaman scroll yang jauh lebih smooth.'
        },
        {
          q: 'Bagaimana code splitting bekerja di React dan apa hubungannya dengan webpack chunk?',
          a: 'Code splitting memecah JavaScript bundle menjadi multiple chunks yang di-load on-demand. React.lazy(() => import("./HeavyComponent")) membuat webpack (atau Vite/Rollup) secara otomatis memecah HeavyComponent ke chunk terpisah. import() adalah dynamic import — mengembalikan Promise yang resolve ke module. Webpack melihat pola ini dan membuat file bundle terpisah (chunk). Saat komponen pertama kali di-render, React download chunk tersebut. Selama download, Suspense menampilkan fallback. Strategi: Route-based splitting (setiap page adalah chunk terpisah — paling impactful) dengan React.lazy + Suspense. Component-based splitting untuk komponen berat yang tidak selalu dibutuhkan: editor teks rich, modal kompleks, chart library. Preloading: React.lazy(() => import("./Page")) bisa dipanggil sebelum user navigate untuk pre-download chunk.'
        }
      ],
      code: `// MEMOIZATION — Targeted, not blanket
const ExpensiveList = React.memo(function ExpensiveList({ items, onSelect }) {
    return items.map(item => <Item key={item.id} data={item} onSelect={onSelect} />)
})

function Parent() {
    const [count, setCount] = useState(0)
    const [items, setItems] = useState([...])

    const handleSelect = useCallback((id: string) => {
        console.log('selected', id)
    }, [])  // Stable reference → ExpensiveList won't re-render

    const sortedItems = useMemo(
        () => [...items].sort((a, b) => b.score - a.score),
        [items]
    )

    return (
        <>
            <button onClick={() => setCount(c => c + 1)}>{count}</button>
            <ExpensiveList items={sortedItems} onSelect={handleSelect} />
        </>
    )
}

// CODE SPLITTING — Route-based
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings  = lazy(() => import('./pages/Settings'))

function App() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Suspense>
    )
}

// VIRTUALIZATION — @tanstack/react-virtual
function VirtualList({ items }) {
    const parentRef = useRef(null)
    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50,
    })
    return (
        <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
            <div style={{ height: virtualizer.getTotalSize() }}>
                {virtualizer.getVirtualItems().map(vItem => (
                    <div key={vItem.key} style={{ position:'absolute', top:vItem.start, height:vItem.size }}>
                        {items[vItem.index].name}
                    </div>
                ))}
            </div>
        </div>
    )
}`
    }
  ]
}
