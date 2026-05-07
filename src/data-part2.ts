export const PILLARS_PART2 = [
  {
    id: "mern-advanced",
    title: "Advanced React Architecture",
    topics: [
      {
        id: "react-reconciliation",
        title: "React Reconciliation & Virtual DOM",
        depth: "How React actually updates the screen",
        content: "React memisahkan deklarasi UI (JSX) dari aktualisasi DOM (Browser DOM). Ketika state berubah, React membuat pohon Virtual DOM baru. Proses membandingkan pohon lama dan pohon baru disebut 'Reconciliation' atau 'Diffing Algorithm' (O(n) karena asumsi heuristik: tipe elemen berbeda = subtree berbeda, dan 'key' prop). React 18+ memperkenalkan Concurrent Mode dengan Fiber Architecture: proses rendering bisa di-pause, di-prioritaskan, atau dibatalkan. Ini memungkinkan fitur seperti Suspense dan startTransition.",
        why: "Memahami ini penting untuk optimasi. Mengapa pakai \`useMemo\` atau \`useCallback\`? Karena re-render default akan men-destroy dan me-recreate semua object dan array lokal, memicu re-render pada child component yang bergantung pada referensi object tersebut.",
        mistake: "Menggunakan index array sebagai \`key\` prop. Jika array diurutkan ulang atau di-splice, index berubah, menyebabkan React meng-unmount dan remount komponen secara paksa, merusak local state dan animasi.",
        interview: "Bagaimana Fiber Architecture mengubah cara React melakukan rendering? Jelaskan peran 'key' prop dan dampaknya jika salah digunakan.",
        code: `// === REACT: Why key matters ===
// BAD: using index as key
{items.map((item, index) => (
  // If item deleted, index changes for ALL subsequent items!
  <TodoItem key={index} data={item} /> 
))}

// GOOD: stable unique ID
{items.map(item => (
  <TodoItem key={item.uuid} data={item} />
))}

// === REACT: useMemo vs useCallback ===
function Parent({ data }) {
  // useCallback caches the FUNCTION definition
  const handleClick = useCallback(() => console.log(data), [data])
  
  // useMemo caches the RESULT of calculation
  const stats = useMemo(() => computeHeavyStats(data), [data])
  
  return <Child onAction={handleClick} stats={stats} />
}`
      },
      {
        id: "browser-pipeline",
        title: "Browser Rendering Pipeline",
        depth: "Critical Rendering Path & 60 FPS",
        content: "Browser mengubah kode menjadi pixel melalui pipeline: DOM -> CSSOM -> Render Tree -> Layout (Reflow) -> Paint -> Composite. Untuk mencapai 60 FPS (animasi mulus), lo hanya punya 16.6ms per frame. Mengubah layout (misal: 'width' atau 'margin' via JS/CSS) memaksa browser menghitung ulang seluruh halaman (Layout thrashing). Mengubah 'color' memaksa Paint ulang. Mengubah 'transform' atau 'opacity' hanya memicu Composite (dikerjakan oleh GPU, sangat cepat).",
        why: "Mendebug 'jank' atau animasi patah-patah di UI butuh pemahaman pipeline ini. Senior engineer mendesain animasi yang GPU-accelerated.",
        mistake: "Menganimasikan properti \`left\`, \`top\`, atau \`width\`. Menggunakan \`useEffect\` untuk mengukur elemen (DOM read) lalu langsung men-set state baru (DOM write) dalam loop, menyebabkan forced synchronous layout.",
        interview: "Sebutkan urutan Critical Rendering Path di browser. Properti CSS apa saja yang aman untuk di-animasikan agar mencapai 60 FPS?",
        code: `/* === CSS: GPU Accelerated Animation === */
/* BAD: Forces Layout recalculation on every frame */
.box { transition: margin-left 0.3s; }
.box:hover { margin-left: 100px; }

/* GOOD: Uses GPU Compositing */
.box { transition: transform 0.3s; }
.box:hover { transform: translateX(100px); }`
      },
      {
        id: "state-management",
        title: "State Management Architecture",
        depth: "Context API vs Flux vs Atoms",
        content: "Tidak semua state butuh global store. Ada Local State (useState), Server State (React Query/SWR), dan Global Client State (Zustand/Redux). Context API BUKAN state manager; ia hanya alat dependency injection. Masalah Context API: jika \`value\` berubah, *semua* komponen yang \`useContext\` akan re-render, memicu render thrashing. Library Flux (Zustand/Redux) memisahkan state dari React tree, komponen men-subscribe spesifik *slice* data saja. Atomic approach (Jotai/Recoil) memperlakukan state sebagai potongan kecil independen.",
        why: "Arsitektur state yang salah di awal akan membuat aplikasi melambat seiring bertambahnya fitur, memaksa tim melakukan rewrite masif.",
        mistake: "Menggunakan Context API + \`useReducer\` untuk state yang sangat dinamis dan besar. Memasukkan response API ke Redux secara manual (harus pakai React Query/RTK Query untuk cache server state).",
        interview: "Apa masalah utama pada Context API untuk global state management? Bagaimana library seperti Zustand mengatasi masalah re-render tersebut?",
        code: `// === Zustand: Selective Rendering ===
// Hanya re-render jika 'bears' berubah. 'nuts' tidak ngaruh.
const bears = useStore(state => state.bears)

// === React Query: Server State ===
function Profile() {
  // Caching, deduping, background refetch otomatis dihandle
  const { data, isLoading } = useQuery(['user', id], fetchUser)
  if (isLoading) return <Spinner />
  return <div>{data.name}</div>
}`
      }
    ]
  },
  {
    id: "go-advanced",
    title: "Mastering Golang",
    topics: [
      {
        id: "go-interfaces",
        title: "Interfaces & Implicit Satisfaction",
        depth: "Clean Architecture in Go",
        content: "Go tidak punya 'implements' keyword. Sebuah struct secara implisit mengimplementasikan interface jika memiliki method yang sesuai (Duck Typing). Prinsip utama: 'Accept interfaces, return structs'. Fungsi harus mendefinisikan interface sekecil mungkin.",
        why: "Interface kecil memungkinkan abstraksi dan dependency injection yang mudah. Ini membuat unit testing sangat elegan via mocking.",
        mistake: "Mendefinisikan interface raksasa (seperti di Java), membuat mock menyusahkan. Menggunakan pointer ke interface (\`*MyInterface\`).",
        interview: "Mengapa idiom 'Accept interfaces, return structs' disarankan di Go?",
        code: `// GOOD: Small interface defined by CONSUMER
type UserReader interface {
    GetUsers() []User
}

func PrintActiveUsers(reader UserReader) {
    users := reader.GetUsers()
}`
      },
      {
        id: "go-channels",
        title: "Channels & Select Pattern",
        depth: "Goroutine Communication",
        content: "Mantra Go: 'Do not communicate by sharing memory; instead, share memory by communicating.' Daripada menggunakan lock (Mutex), goroutine mengirim data via Channel. Statement \`select\` menunggu multiple channels bersamaan.",
        why: "Channel mencegah race condition tanpa kompleksitas locking. Pattern seperti Worker Pools bergantung pada channel.",
        mistake: "Tidak menutup channel, menyebabkan deadlock. Menulis ke channel yang sudah ditutup (panic).",
        interview: "Bagaimana melakukan timeout pada eksekusi goroutine?",
        code: `select {
case res := <-ch:
    return res, nil
case <-time.After(2 * time.Second):
    return "", errors.New("timeout")
}`
      }
    ]
  },
  {
    id: "devops",
    title: "DevOps & Shipping",
    topics: [
      {
        id: "docker-compose",
        title: "Dockerizing & Orchestration",
        depth: "From laptop to production",
        content: "Docker membungkus aplikasi beserta runtime ke Container. Multi-stage build mengecilkan image production. Docker Compose merangkai multiple container agar jalan bareng.",
        why: "Pemahaman Docker adalah requirement mutlak backend modern untuk CD pipeline.",
        mistake: "Image besar karena base \`ubuntu\`. Hardcode password di Dockerfile.",
        interview: "Apa keuntungan Multi-stage build?",
        code: `FROM golang:1.21-alpine AS builder
# build binary...
FROM alpine:latest
COPY --from=builder /app/main .
CMD ["./main"]`
      }
    ]
  }
];
