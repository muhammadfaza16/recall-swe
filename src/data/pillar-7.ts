import type { Pillar } from './types'

export const pillar7: Pillar = {
  id: 'devops-system-design',
  title: 'Pillar 7 — DevOps & System Design',
  topics: [
    {
      id: 'linux-shell-101',
      title: 'Linux OS & Shell Fundamentals',
      depth: 'Permissions, Piping, and SSH',
      content: 'Cloud 99% berjalan di atas Linux. Berkomunikasi dengan Linux melalui terminal/Shell adalah nafas DevOps.\n\n**File Permissions (Chmod/Chown):** Setiap file di Linux memiliki pemilik (User), grup (Group), dan orang lain (Others). Masing-masing memiliki hak akses Read (4), Write (2), dan Execute (1). Perintah `chmod 755` artinya: User (4+2+1=7 = rwx), Group (4+1=5 = r-x), Others (5 = r-x).\n\n**Piping & Redirection (| & >):** Kekuatan sejati UNIX adalah program-program kecil yang bisa dirangkai. Pipe (`|`) mengambil output dari satu program dan menjadikannya input untuk program lain. Contoh: `cat server.log | grep "ERROR" | wc -l` (Baca log -> cari yang mengandung "ERROR" -> hitung jumlah barisnya).\n\n**SSH (Secure Shell):** Cara kita meremote server secara aman. SSH menggunakan kunci asimetris. Anda meletakkan *Public Key* di server (di file `~/.ssh/authorized_keys`), lalu menghubunginya menggunakan *Private Key* rahasia Anda. Tidak butuh password rentan!',
      why: 'GUI tidak tersedia di server produksi. Saat server down karena disk space penuh, Anda harus masuk via SSH, menjalankan `df -h`, `du -sh`, dan mematikan proses menggunakan `kill -9`. Kemampuan shell membedakan engineer ops dari awam.',
      mistake: 'Menjalankan semua operasi di server production sebagai `root`. Root memiliki akses tak terbatas; kesalahan ketik `rm -rf / ` akan menghapus seluruh sistem operasi. Selalu gunakan user biasa, dan tambahkan `sudo` di depan perintah hanya untuk perintah yang butuh elevasi hak.',
      interview: [
        {
          q: `Jelaskan apa yang terjadi ketika Anda mengetikkan "cat access.log | grep 404 | awk '{print $1}' | sort | uniq -c" ?`,
          a: 'Itu adalah pipeline log analysis klasik UNIX. (1) cat membaca seluruh file log. (2) grep menyaring baris yang hanya mengandung "404". (3) awk mengekstrak kolom ke-1 (biasanya IP Address). (4) sort mengurutkan IP address tersebut agar yang sama berdekatan. (5) uniq -c menghitung frekuensi duplikasi berurutan. Hasil akhirnya adalah laporan berupa daftar IP address mana saja yang paling banyak mendapatkan error 404.'
        }
      ],
      code: '# LINUX SURVIVAL GUIDE\n\n# 1. SSH into server\nssh -i ~/.ssh/my_key.pem ubuntu@192.168.1.1\n\n# 2. Check disk space\ndf -h\n\n# 3. Check what ports are listening\nnetstat -tulpn  # or ss -tulwn\n\n# 4. Check active processes sorting by CPU\ntop   # (or htop)\n\n# 5. Find a huge file killing your disk\nfind /var/log -type f -size +500M\n\n# 6. View streaming logs (tail)\ntail -f /var/log/syslog | grep "nginx"'
    },
    {
      id: 'cicd-101',
      title: 'CI/CD Fundamentals',
      depth: 'Continuous Integration vs Deployment',
      content: 'Mengunggah kode secara manual via FTP atau SCP ke server setiap rilis adalah resep untuk insiden. CI/CD adalah otomatisasi proses tersebut.\n\n**Continuous Integration (CI):** Setiap kali developer men-push kode (atau membuat Pull Request), sebuah server otomatis mengambil kode tersebut, mengkompilasinya (build), dan menjalankan SEMUA Unit Test/Linter. Tujuan CI: Memastikan kode yang di-merge tidak merusak aplikasi (broken build).\n\n**Continuous Deployment/Delivery (CD):** Setelah CI hijau (sukses), artefak yang sudah di-build (contoh: Docker Image) secara otomatis disalin dan di-restart di server production. CD menghilangkan unsur manusia (error-prone) dari proses rilis.\n\n**Infrastructure as Code (IaC):** Server dan pipeline bukan lagi "klik-klik manual di AWS Console". Konfigurasi CI/CD disimpan sebagai file YAML (misal `.github/workflows/main.yml`) dan di-commit ke repositori. Server Cloud di-deploy melalui Terraform. Semua terekam di Git.',
      why: 'Di perusahaan teknologi modern (termasuk FAANG), developer bisa merilis fitur ke jutaan user hanya dengan meng-klik tombol "Merge PR". Pipeline yang kuat memastikan kecepatan rilis tanpa kompromi pada kualitas.',
      mistake: 'Menyatukan environment *testing* dengan konfigurasi *production* di dalam CI. Anda mungkin tanpa sengaja men-test operasi `DELETE` yang mengenai database production saat pipeline berjalan di GitHub Actions.',
      interview: [
        {
          q: 'Apa perbedaan antara Continuous Delivery dan Continuous Deployment?',
          a: 'Keduanya berbagi bagian "Continuous Integration" (Build + Test otomatis). Bedanya ada di langkah rilis. Dalam Continuous Delivery, setelah kode siap rilis, proses deploy ke production masih membutuhkan satu klik manual dari manusia (Approval). Dalam Continuous Deployment, jika seluruh test otomatis lulus, kode tersebut LANGSUNG naik ke production secara otomatis tanpa intervensi manusia sama sekali.'
        }
      ],
      code: '# MENTAL MODEL: GITHUB ACTIONS PIPELINE (.github/workflows/deploy.yml)\nname: CI/CD Pipeline\n\non:\n  push:\n    branches: [ "main" ]\n\njobs:\n  build_and_test:    # THE CI PART\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Install dependencies\n        run: npm ci\n      - name: Run Unit Tests\n        run: npm test\n\n  deploy:            # THE CD PART\n    needs: build_and_test  # Only runs if tests pass!\n    runs-on: ubuntu-latest\n    steps:\n      - name: Deploy to Server\n        run: ./deploy.sh production'
    },
    {
      id: 'docker-containers',
      title: 'Containers & Docker Internals',
      depth: 'Namespaces, cgroups, image layers, multi-stage builds',
      image: '/illustrations/docker.png',
      content: `Container bukan "lightweight VM". Container adalah proses di host OS yang diisolasi menggunakan fitur kernel Linux: Namespaces dan cgroups.

**Namespaces:** PID namespace (tree process sendiri, PID 1 = process pertama container), Network namespace (interface, IP, routing table sendiri), Mount namespace (filesystem tree sendiri), UTS namespace (hostname sendiri), User namespace (UID/GID mapping). Setiap container mendapat kombinasi namespace yang menciptakan ilusi "isolated system".

**cgroups (Control Groups):** Membatasi resource: CPU quota, Memory limit (melebihi → OOM Killer), Block I/O, Network bandwidth. Tanpa cgroups, satu container "noisy neighbor" bisa habiskan semua resource host.

**Docker Image Layers:** Image terdiri dari layers immutable. Setiap instruksi Dockerfile (RUN, COPY) membuat layer baru. Layers di-share antar images (disimpan sekali). Container menambahkan writable layer di atas read-only layers. Instruksi yang install dependencies harus sebelum COPY source code — dependency layer di-cache, tidak perlu rebuild setiap code change.

**Multi-stage Build:** Build environment (dengan compiler tools) sangat berbeda dari runtime environment. Multi-stage: stage 1 build binary dengan image besar, stage 2 hanya copy binary ke image minimal (distroless, alpine). Hasil: ~10MB vs ~1GB.`,
      why: `Docker adalah cara standar mendistribusikan backend software. Tanpa pemahaman, tidak bisa debug mengapa container crash di production tapi jalan di dev (hint: resource limits, env vars), menulis Dockerfile efisien (layer caching), atau memahami bagaimana Kubernetes mengatur containers.`,
      mistake: `Run sebagai root dalam container — jika container escape, attacker punya root di host. Tidak set resource limits (--memory, --cpus) — container bisa habiskan seluruh host. Menyimpan secrets di Dockerfile atau docker inspect — gunakan secret management.`,
      interview: [
        {
          q: 'Apa perbedaan antara container dan VM pada level kernel? Mengapa container lebih ringan?',
          a: 'VM (Virtual Machine): menggunakan hypervisor (Type 1: VMware ESXi, KVM atau Type 2: VirtualBox) untuk mengemulasikan hardware secara penuh. Setiap VM punya: kernel OS sendiri, device drivers sendiri, init system sendiri, library sendiri. VM benar-benar isolated — kernel yang berbeda bisa berjalan (Windows VM di Linux host). Overhead: RAM untuk guest OS (minimal ~512MB per VM), waktu boot menit-menit, I/O melalui emulated hardware. Container: tidak mengemulasikan hardware apapun. Container adalah proses biasa di host kernel yang di-isolasi menggunakan: Namespaces (isolasi visibility — process tree, network, filesystem) dan cgroups (limitasi resource usage). Container berbagi kernel yang sama dengan host. Overhead: tidak ada guest OS (container hanya berisi app + minimal libs), startup milisecond-detik, I/O langsung ke kernel. Trade-off container: security isolation lebih lemah dari VM (shared kernel — kernel vulnerability bisa affect semua containers), semua containers harus compatible dengan host kernel. Container lebih ringan dan cepat, VM lebih isolated dan secure.'
        },
        {
          q: 'Jelaskan bagaimana Docker image layering bekerja dan mengapa urutan instruksi Dockerfile penting.',
          a: 'Docker image terdiri dari layers immutable yang di-stack. Setiap instruksi Dockerfile yang memodifikasi filesystem (RUN, COPY, ADD) membuat layer baru berisi HANYA delta perubahan dari layer sebelumnya. Layers di-identified dengan SHA256 hash dari isinya dan di-cache secara lokal dan di registry. Saat build, Docker membandingkan setiap instruksi dengan cache. Jika instruksi dan konteksnya tidak berubah → gunakan cached layer (sangat cepat). Jika ada yang berubah → rebuild layer tersebut DAN semua layer sesudahnya (cache invalidated). Kenapa urutan penting: tempatkan instruksi yang JARANG BERUBAH lebih atas, yang SERING BERUBAH lebih bawah. Pattern optimal: COPY go.mod go.sum ./ → RUN go mod download (dependency layer, hanya rebuild saat go.mod berubah) → COPY . . → RUN go build (source layer, rebuild setiap kode berubah). Jika urutan terbalik (COPY . . dulu), setiap perubahan kode membuat dependency download ulang — CI pipeline menjadi sangat lambat.'
        },
        {
          q: 'Apa keuntungan multi-stage build? Berikan contoh konkret dengan Go atau Node.js.',
          a: 'Multi-stage build memungkinkan satu Dockerfile mendefinisikan multiple FROM stages. Setiap stage bisa menggunakan base image berbeda. Hanya output dari stage tertentu yang masuk ke final image — tools build tidak masuk production. Keuntungan: (1) Image size jauh lebih kecil — binary Go yang di-build dari golang:1.21 (800MB+) bisa di-copy ke scratch atau distroless/static (5MB). (2) Security surface area lebih kecil — tidak ada compiler, package manager, atau build tools di production image yang bisa dieksploitasi. (3) Separation of concerns — test bisa dijalankan dalam build stage sebelum binary di-copy ke runtime stage. Contoh Go: Stage 1 (builder): FROM golang:1.21 AS builder → WORKDIR /app → COPY go.mod go.sum ./ → RUN go mod download → COPY . . → RUN go build -o server ./cmd/api. Stage 2 (runtime): FROM gcr.io/distroless/static:nonroot → COPY --from=builder /app/server /server → USER nonroot → ENTRYPOINT ["/server"]. Final image hanya berisi: binary server, minimal C library, TLS certificates. Tidak ada shell, tidak ada package manager, tidak ada Go toolchain.'
        }
      ],
      code: `# OPTIMIZED DOCKERFILE (Go multi-stage)
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Layer 1: Dependencies (rarely changes — cached unless go.mod changes)
COPY go.mod go.sum ./
RUN go mod download

# Layer 2: Source (changes often — only this layer rebuilds)
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o server ./cmd/api

# Runtime: ~5MB vs ~800MB
FROM gcr.io/distroless/static:nonroot
COPY --from=builder /app/server /server
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]

# RESOURCE LIMITS (production must-have)
docker run -d \
    --memory="512m" \
    --memory-swap="512m" \
    --cpus="1.5" \
    --restart=unless-stopped \
    myapp:latest

# DOCKER COMPOSE: Development stack
services:
  api:
    build: { context: ., target: builder }
    environment: [DB_HOST=postgres, REDIS_URL=redis://redis:6379]
    depends_on: { postgres: { condition: service_healthy } }

  postgres:
    image: postgres:15-alpine
    environment: { POSTGRES_PASSWORD: devpass, POSTGRES_DB: myapp }
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s`
    },
    {
      id: 'kubernetes-internals',
      title: 'Kubernetes (K8s) Architecture',
      depth: 'Control Plane, Kubelet, Pod lifecycle, Services, Ingress',
      image: '/illustrations/docker.png',
      content: `Docker menjalankan container di satu mesin. Bagaimana jika lo punya 100 mesin, ingin auto-scale, auto-restart jika mati, dan load balancing? Lo butuh Orchestrator. K8s adalah standar industri.

**Control Plane (Master Node):** Otak K8s. 
- **API Server:** Gerbang komunikasi, semua kubectl commands masuk ke sini.
- **etcd:** Key-Value store terdistribusi yang menyimpan SELURUH state cluster (Source of Truth).
- **Scheduler:** Memutuskan Node (mesin) mana yang cocok untuk menjalankan Pod baru (berdasarkan RAM/CPU request).
- **Controller Manager:** Loop terus-menerus yang memastikan current state = desired state (misal: "Gue mau 3 replica". Kalau mati 1, dia bikin 1 lagi).

**Data Plane (Worker Node):** Mesin yang menjalankan workload.
- **Kubelet:** Agent di setiap node yang bicara ke API server dan mengurus container runtime (minta Docker/containerd nyalain container).
- **Kube-Proxy:** Mengurus network routing rules (iptables/IPVS) di node agar traffic sampai ke Pod yang benar.

**Konsep Inti:**
- **Pod:** Unit terkecil K8s. Bisa berisi 1 atau lebih container yang share network (localhost) dan volume. Pod itu fana (ephemeral), bisa mati dan diganti IP-nya kapan saja.
- **Deployment:** Mengelola replica set dari Pods dan memungkinkan zero-downtime rolling updates.
- **Service:** Abstraksi network statis. Karena IP Pod selalu berubah, Service memberikan IP internal permanen (dan DNS name) yang me-loadbalance ke sekumpulan Pod.
- **Ingress:** Pintu masuk (gateway) HTTP/S dari luar cluster ke internal Services berdasar URL/Host.`,
      why: `Seni deployment modern nggak cuma "bisa jalan di lokal". Senior engineer harus mengerti siklus hidup aplikasinya di production. Jika aplikasi lo nyimpan state di memory lokal (bukan Redis), aplikasi itu bakal rusak parah saat di-scale di K8s karena K8s mengarahkan request ke Pod secara acak.`,
      mistake: `Mengabaikan Resource Requests & Limits di manifest K8s. Jika lo tidak set memory Limit, aplikasi Java/Node lo bisa bocor memori dan memakan seluruh RAM host Node, membuat K8s Node NotReady dan merusak Pod lain di mesin yang sama (Noisy Neighbor). Jika lo set memory Limit tapi aplikasinya nggak sadar (unaware), Linux OOM-Killer akan membunuh container lo tanpa belas kasihan.`,
      interview: [
        {
          q: 'Bagaimana cara Kubernetes mencapai Zero-Downtime Deployment?',
          a: 'K8s menggunakan konsep Rolling Updates pada objek Deployment. Ketika kita push image versi baru, K8s tidak mematikan semua Pod lama sekaligus. K8s membuat ReplicaSet baru, lalu menyalakan 1 Pod versi baru. Setelah Pod baru itu berstatus "Ready" (melewati Readiness Probe), K8s mengarahkan trafik ke sana dan mematikan 1 Pod lama. Proses ini diulang satu per satu (dikontrol parameter maxUnavailable dan maxSurge) sampai semua Pod lama tergantikan. Jika Pod baru gagal (misal crashloop), deployment tertahan dan trafik tetap dilayani oleh sisa Pod lama, mencegah outage.'
        },
        {
          q: 'Apa bedanya Liveness Probe dan Readiness Probe?',
          a: 'Keduanya digunakan Kubelet untuk mengecek health aplikasi, tapi aksinya berbeda. Readiness Probe: Mengecek apakah aplikasi SIAP menerima trafik (misal: koneksi DB sudah tersambung). Jika gagal, Pod DIKELUARKAN dari daftar endpoint Service (tidak dikasih trafik HTTP), tapi containernya TIDAK di-restart. Liveness Probe: Mengecek apakah aplikasi masih HIDUP (tidak deadlock/hang). Jika gagal berturut-turut, Kubelet akan MEMBUNUH (kill) dan me-restart container tersebut. Kesalahan umum: menggunakan liveness probe yang mengecek koneksi DB. Jika DB lambat sementara, liveness probe gagal, dan K8s akan me-restart SEMUA pod kita tanpa henti, memperburuk keadaan.'
        }
      ],
      code: `# KUBERNETES DEPLOYMENT MANIFEST
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
      - name: api
        image: myapp:v1.2.0
        ports:
        - containerPort: 8080
        resources:           # CRITICAL: Always define limits!
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        readinessProbe:      # Trafik masuk hanya jika ini OK
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        livenessProbe:       # Restart pod jika ini gagal
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10`
    },
    {
      id: 'system-design',
      title: 'System Design Fundamentals',
      depth: 'Scalability, CAP theorem, load balancing, consistent hashing',
      image: '/illustrations/system-design.png',
      content: `System design adalah tentang trade-off yang tepat untuk requirements yang diberikan. Tidak ada "jawaban benar" — ada jawaban yang tepat untuk scale dan context tertentu.

**Scalability:** Vertical: tambah CPU/RAM ke satu server. Batas fisik, SPOF. Horizontal: tambah server. Complex (load balancing, distributed state) tapi theoretically unlimited. Stateless services memudahkan horizontal scaling — state di database/cache, bukan di server.

**CAP Theorem:** Di distributed system, saat ada network partition (tidak bisa dihindari), pilih: CP (Consistency + Partition tolerance: reject request daripada return data stale — MongoDB, HBase) atau AP (Availability + Partition tolerance: return data yang mungkin stale — Cassandra, DynamoDB). RDBMS tradisional: CA (bukan untuk distributed).

**Load Balancing Algorithms:** Round Robin (merata berurutan), Least Connections (server dengan koneksi aktif paling sedikit), IP Hash (client selalu ke server yang sama — session affinity), Weighted (server lebih powerful dapat lebih banyak traffic).

**Consistent Hashing:** Simple modulo hashing: server = hash(key) % N. Saat N berubah, hampir semua key perlu dipindahkan. Consistent hashing: servers dan keys di-hash ke "ring" 0–2^32. Key di-route ke server pertama yang clockwise. Saat server ditambah/dihapus, hanya ~K/N keys yang perlu dipindahkan.`,
      why: `System design interview membedakan senior dari mid-level. Tapi lebih penting: kemampuan ini memungkinkan berpartisipasi dalam diskusi arsitektur, mempertanyakan keputusan yang akan bermasalah di scale, dan memimpin desain sistem baru.`,
      mistake: `Over-engineering sejak awal — desain untuk 1 juta users saat masih 100 users. Start simple (monolith, single DB) dan evolve sesuai kebutuhan nyata. Lupa memodelkan failure modes — circuit breaker, retry, fallback adalah bagian dari desain, bukan afterthought.`,
      interview: [
        {
          q: 'Jelaskan CAP theorem. Database mana yang pilih CP dan mana yang pilih AP?',
          a: 'CAP theorem (Brewer): Distributed system tidak bisa menjamin ketiga property secara bersamaan — Consistency, Availability, Partition Tolerance. Partition Tolerance (P) tidak bisa di-sacriifice dalam distributed system — network partitions akan terjadi. Jadi pilihan nyata adalah C vs A saat partition terjadi. CP (Consistency + Partition Tolerance): saat partition, sistem menolak request (atau timeout) daripada return data yang mungkin stale/inconsistent. Contoh: MongoDB dalam default config (primary election bisa memakan waktu), HBase, ZooKeeper, Etcd. Cocok untuk: financial data, inventory counts, koordinasi distributed. AP (Availability + Partition Tolerance): saat partition, sistem tetap menjawab request tapi data mungkin stale. Setelah partition sembuh, eventual consistency. Contoh: Cassandra (tunable consistency), DynamoDB (eventually consistent by default), CouchDB, DNS. Cocok untuk: social media feeds, shopping cart (optimistic), metrics, caching. RDBMS (PostgreSQL, MySQL): CA dalam arsitektur traditional — tidak designed untuk network partition. Dalam cluster mode (Patroni, Galera), mendekati CP.'
        },
        {
          q: 'Desain high-level architecture untuk URL shortener yang handle 10 miliar redirects/hari.',
          a: '10B redirects/day ≈ 115,000 req/sec (read-heavy, 1:100 write:read ratio). Key decisions: (1) Short URL generation: auto-increment ID di-encode ke Base62 (7 karakter = 62^7 ≈ 3.5 triliun URLs). Generate di DB (atomic) atau di dedicated ID service. (2) Storage: PostgreSQL untuk URL mapping (ACID, simple schema: short_code, long_url, created_at, user_id). Redis cache untuk hot URLs (95% traffic ke <5% URLs). (3) Read path (critical, 115k/sec): Client → CDN (cache popular URLs, miss rate < 5%) → Redis (cache hot URLs, TTL 24h) → PostgreSQL (index pada short_code, O(log n)). Target: 99th percentile < 10ms. (4) Write path (1,157/sec, manageable): Client → API → PostgreSQL → invalidate Redis. (5) Scaling: Stateless API servers (horizontal scale), PostgreSQL dengan read replicas, Redis cluster untuk cache, Global CDN untuk edge caching. (6) Redirect type: 301 (permanent, browser cache — lebih cepat, tapi tidak bisa track analytics) vs 302 (temporary, setiap request ke server — bisa track). Pilih 302 untuk analytics use case.'
        },
        {
          q: 'Apa itu consistent hashing dan mengapa ia lebih baik dari modulo hashing untuk distributed caching?',
          a: 'Modulo hashing: server = hash(key) % N. Masalah: saat N berubah (tambah atau hapus server), HAMPIR SEMUA key perlu di-remap. hash(key) % 3 vs hash(key) % 4 menghasilkan distribusi yang hampir sepenuhnya berbeda. Dalam distributed cache ini berarti cache miss massal — semua request langsung ke database (thundering herd). Consistent hashing: bayangkan hash space 0 sampai 2^32 sebagai lingkaran (ring). Setiap server di-hash ke posisi di ring (hash(server_id) → position). Setiap key di-hash ke posisi di ring (hash(key) → position). Key di-route ke server pertama yang clockwise dari posisi key. Saat server ditambah: hanya key antara server baru dan predecessor-nya yang perlu pindah ≈ K/N keys (K total keys, N jumlah server). Saat server dihapus: hanya key milik server tersebut yang perlu pindah ke successor. Virtual nodes: setiap physical server di-represent oleh multiple virtual nodes di ring untuk distribusi yang lebih merata. Digunakan di: Redis Cluster, Cassandra, Amazon DynamoDB, CDN edge server routing.'
        }
      ],
      code: `// CONSISTENT HASHING: Implementation sketch
class ConsistentHashRing {
    private ring = new Map<number, string>()  // position → server
    private sortedPositions: number[] = []
    private virtualNodes = 150  // Per physical server

    addServer(server: string) {
        for (let i = 0; i < this.virtualNodes; i++) {
            const pos = this.hash(server + ':vnode:' + i)
            this.ring.set(pos, server)
        }
        this.sortedPositions = [...this.ring.keys()].sort((a, b) => a - b)
    }

    getServer(key: string): string {
        const pos = this.hash(key)
        // Find first server clockwise
        const idx = this.sortedPositions.findIndex(p => p >= pos)
        const ringPos = idx === -1 ? this.sortedPositions[0] : this.sortedPositions[idx]
        return this.ring.get(ringPos)!
    }

    private hash(key: string): number {
        // In practice: use xxhash or murmur3 for good distribution
        let h = 5381
        for (const c of key) h = (h * 33) ^ c.charCodeAt(0)
        return Math.abs(h) % (2 ** 32)
    }
}

// LOAD BALANCER: Least connections
class LeastConnectionsLB {
    private connections = new Map<string, number>()

    getServer(): string {
        return [...this.connections.entries()]
            .sort(([,a], [,b]) => a - b)[0][0]
    }

    onRequest(server: string) { this.connections.set(server, (this.connections.get(server) ?? 0) + 1) }
    onRelease(server: string) { this.connections.set(server, (this.connections.get(server) ?? 1) - 1) }
}`
    },
    {
      id: 'observability',
      title: 'Observability: Logs, Metrics & Traces',
      depth: 'Structured logging, RED method, distributed tracing, SLO',
      content: `Observability adalah kemampuan memahami state internal sistem dari output eksternalnya. Tanpa observability, debugging production issue seperti mengemudi tanpa dashboard. Tiga pilar: Logs, Metrics, Traces.

**Structured Logging:** Log sebagai JSON dengan fields konsisten, bukan plain text. Fields wajib: timestamp, level, service, trace_id, message. trace_id mengkorelasi semua logs dari satu request melintasi banyak services. Gunakan pino (Node.js — zero overhead, fastest), zap atau zerolog (Go — zero allocation).

**Metrics — RED Method:** Rate (request/sec), Errors (error rate = errors/total requests), Duration (latency p50/p95/p99). Gunakan Prometheus (pull-based scraping + PromQL) + Grafana untuk visualization. Tambah USE method untuk resources: Utilization, Saturation, Errors.

**Distributed Tracing:** Satu request melalui banyak microservices. Trace menggunakan unique trace_id yang di-propagate via HTTP headers (X-Trace-Id atau W3C Traceparent). Setiap operasi adalah "span" yang membentuk tree. OpenTelemetry adalah standard instrumentasi vendor-agnostic.

**SLO/SLA/SLI:** SLI: metrik aktual (p99 latency = 150ms). SLO: target (p99 < 200ms). SLA: kontrak dengan customer (lebih longgar dari SLO). Error budget: 100% - SLO%. Jika error budget habis, stop fitur baru, fokus reliability.`,
      why: `"You can't improve what you can't measure." Structured logging + tracing memungkinkan root cause analysis dalam menit, bukan jam. SLO memberikan framework data-driven untuk prioritas: kapan harus fokus ke reliability vs fitur baru.`,
      mistake: `Log yang tidak actionable: "Error occurred", "Failed". Log yang baik harus cukup untuk mereproduksi issue tanpa akses ke server. Logging PII (password, full token, credit card). Tidak ada sampling di high-traffic service — logging 100k req/s tanpa sampling menghabiskan lebih banyak CPU dari handling request itu sendiri.`,
      interview: [
        {
          q: 'Jelaskan perbedaan antara Logging, Metrics, dan Distributed Tracing. Kapan menggunakan masing-masing?',
          a: 'Logging: rekaman event yang terjadi pada waktu tertentu. Unstructured (bad) atau structured JSON (good). Menjawab: "Apa yang terjadi?" Detail, verbose, bisa di-search. Berguna untuk debugging spesifik issue. Kelemahan: volume besar, query lambat jika tidak diindex (gunakan ELK stack atau Loki). Kapan: setiap significant event (request masuk, error, state change). Metrics: pengukuran numerik yang di-aggregate dari waktu ke waktu. Counter, gauge, histogram. Menjawab: "Seberapa sering/berapa?" Kompak, mudah di-query (PromQL), mudah di-alert. Berguna untuk: alerting (error rate > 1%), dashboards (p99 latency over time), capacity planning. Kapan: untuk semua hal yang ingin di-monitor secara berkelanjutan. Distributed Tracing: rekaman eksekusi end-to-end dari satu request across multiple services. Menjawab: "Di mana waktunya habis?" Setiap "span" menunjukkan satu operasi. Trace tree menunjukkan parent-child relationship. Berguna untuk: debug latency issue di microservices, menemukan bottleneck. Kapan: untuk understanding request flow dan latency distribution. Ketiganya complement: alert dari metrics → investigasi dengan logs → trace untuk root cause.'
        },
        {
          q: 'Apa itu error budget dalam konteks SLO dan bagaimana tim menggunakannya?',
          a: 'SLO (Service Level Objective) mendefinisikan target availability/reliability. Contoh: 99.9% uptime per bulan (43.8 menit allowed downtime). Error budget = 100% - SLO%. Untuk 99.9% SLO, error budget = 0.1% = 43.8 menit downtime per bulan. Error budget adalah allowance yang TERSEDIA untuk bisa digunakan untuk: deployments berisiko, experiments, planned maintenance. Framework penggunaan: jika error budget masih banyak → tim boleh deploy fitur baru, bereksperimen, accept beberapa risk. Jika error budget mendekati habis → freeze risky deployments, fokus ke reliability work, incident post-mortem. Jika error budget habis → otomatis freeze semua non-critical changes sampai bulan berikutnya (atau budget di-replenish). Manfaat: menghilangkan perdebatan subjektif "apakah kita reliable cukup?", memberikan data-driven conversation antara engineering dan product, menyelaraskan incentive — tim tidak bisa push fitur terus tanpa peduli reliability karena ada error budget yang habis.'
        },
        {
          q: 'Bagaimana cara mendesain structured logging system yang baik untuk microservices?',
          a: 'Prinsip: setiap log entry harus bisa berdiri sendiri tanpa konteks tambahan, dan semua logs dari satu request harus bisa dikorelasi. Fields wajib: timestamp (ISO 8601), level (debug/info/warn/error), service (nama service), version (app version untuk correlation dengan deployment), trace_id (propagated dari request, sama di semua services untuk satu request), request_id (unique per request dalam service ini), message (human-readable string). Fields situasional: user_id (saat relevan, bukan PII sensitif), order_id, error (serialized error object dengan stack trace). Log level strategy: DEBUG (development only, off in production), INFO (lifecycle events: request received, job completed), WARN (unexpected tapi handled: cache miss, retry berhasil, degraded mode), ERROR (unhandled error yang butuh perhatian: DB down, external API gagal), FATAL (sistem tidak stabil, biasanya diikuti process exit). Sampling: untuk request yang healthy dan high-frequency, log hanya 1% (atau 10%). Log semua errors dan warnings. Gunakan adaptive sampling — increase rate jika error rate naik. Centralized logging: Loki + Grafana (lightweight) atau Elasticsearch + Kibana (feature-rich). Structured logs memungkinkan query seperti: {service="payment-svc", trace_id="abc123"}.'
        }
      ],
      code: `// STRUCTURED LOGGING (Node.js + Pino)
import pino from 'pino'

const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service: 'order-service', version: process.env.APP_VERSION }
})

// Request middleware: attach trace_id
app.use((req, res, next) => {
    const traceId = req.headers['x-trace-id'] as string ?? crypto.randomUUID()
    req.log = logger.child({ traceId, method: req.method, path: req.path })
    res.setHeader('X-Trace-Id', traceId)

    const start = Date.now()
    res.on('finish', () => req.log.info({
        statusCode: res.statusCode,
        duration: Date.now() - start,
    }, 'Request completed'))
    next()
})

// PROMETHEUS METRICS
import { Counter, Histogram, Registry } from 'prom-client'
const register = new Registry()

const httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'path', 'status'] as const,
    registers: [register]
})

const httpDuration = new Histogram({
    name: 'http_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'path'] as const,
    buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],  // SLO-aligned buckets
    registers: [register]
})

// SLO ALERT: PromQL
// Alert when p99 latency > 200ms over last 5 minutes:
// histogram_quantile(0.99, rate(http_duration_seconds_bucket[5m])) > 0.2`
    }
  ]
}
