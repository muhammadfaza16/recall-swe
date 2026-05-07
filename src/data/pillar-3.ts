import type { Pillar } from './types'

export const pillar3: Pillar = {
  id: 'databases',
  title: 'Pillar 3 — Data & Databases',
  topics: [
    {
      id: 'sql-mastery',
      title: 'SQL Mastery & Query Optimization',
      depth: 'JOINs, Window Functions, EXPLAIN ANALYZE',
      content: `SQL adalah bahasa yang paling underestimated. Banyak yang tahu SELECT dasar, tapi SQL yang benar-benar powerful ada di Window Functions, CTEs, dan kemampuan membaca query execution plan.

**JOINs — Strategi Engine:** Database engine menggunakan tiga strategi JOIN: Nested Loop Join (efisien jika ada index di join column, satu tabel kecil), Hash Join (build hash table dari tabel kecil, probe dengan tabel besar — efisien untuk tabel besar tanpa sorted index), Merge Join (keduanya harus sorted — efisien dengan sorted index).

**CTEs (Common Table Expressions):** WITH clause mendefinisikan "temporary result set" yang bisa dirujuk dalam query. Membuat query kompleks lebih readable. Recursive CTEs membangun hierarchical data (organizational tree, graph traversal) tanpa application-level recursion.

**Window Functions:** Melakukan kalkulasi "across related rows" tanpa menghilangkan baris detail (tidak seperti GROUP BY yang collapse). Fungsi kunci: ROW_NUMBER(), RANK(), DENSE_RANK() (ranking dengan/tanpa gap), LAG()/LEAD() (akses baris sebelum/sesudah), SUM() OVER / AVG() OVER (running totals). PARTITION BY mendefinisikan "window group", ORDER BY mendefinisikan urutan dalam window.

**EXPLAIN ANALYZE:** Jalankan sebelum query slow di production. Tunjukkan: tipe operasi (Seq Scan vs Index Scan), estimated vs actual rows (jauh berbeda = stale statistics, perlu ANALYZE), dan cost. "Seq Scan" pada tabel besar hampir selalu berarti missing index.`,
      why: `Query yang tidak dioptimasi adalah penyebab paling umum API lambat di production. Menambah satu composite index yang tepat bisa mengubah query dari 30 detik menjadi 30 milidetik — tanpa mengubah satu baris kode aplikasi.`,
      mistake: `SELECT * di production code. Selain mengambil data tidak dibutuhkan, ia mencegah Index Only Scan — database terpaksa fetch heap untuk kolom yang tidak di-index. N+1 query: fetch list of users, lalu untuk setiap user fetch profile-nya secara terpisah. Gunakan JOIN atau eager loading.`,
      interview: [
        {
          q: 'Jelaskan perbedaan antara ROW_NUMBER(), RANK(), dan DENSE_RANK().',
          a: 'Ketiga fungsi memberi nomor urut kepada baris dalam sebuah window partition, tapi berbeda dalam cara menangani nilai yang sama (ties). ROW_NUMBER(): selalu memberikan nomor unik berurutan (1,2,3,4) bahkan jika nilainya sama — urutan tie-breaking tidak deterministik kecuali ada ORDER BY tambahan. RANK(): memberikan ranking yang sama untuk nilai yang sama, tapi ada "gap" setelahnya. Contoh: jika dua baris ranking 2, ranking berikutnya adalah 4 (bukan 3). Pola: 1,2,2,4,5. DENSE_RANK(): seperti RANK() tapi tanpa gap. Pola: 1,2,2,3,4. Use case: ROW_NUMBER untuk deduplikasi (ambil satu baris per group), RANK untuk top-N per group (ambil semua yang rank <= 3), DENSE_RANK untuk leaderboard yang tidak boleh ada gap ranking.'
        },
        {
          q: 'Bagaimana cara membaca output EXPLAIN ANALYZE untuk mengidentifikasi query yang lambat?',
          a: 'Perhatikan tiga hal utama: (1) Scan type: "Seq Scan" pada tabel besar = seluruh tabel di-scan = missing index. "Index Scan" = menggunakan index tapi masih fetch heap. "Index Only Scan" = ideal, semua data dari index tanpa fetch heap. (2) Rows estimate vs actual: jika EXPLAIN bilang "rows=100" tapi actual adalah "rows=50000", query planner punya informasi yang salah — jalankan ANALYZE tabel untuk refresh statistics. (3) Nested Loop dengan hash join: jika melihat "Hash Join" di query sederhana, bisa jadi join column tidak punya index. "Nested Loop" dengan baris outer yang banyak = masalah. Juga perhatikan total "cost" dan "Buffers: read=X" yang tinggi menunjukkan banyak disk I/O.'
        },
        {
          q: 'Tulis query untuk mendapatkan top 3 produk terlaris per kategori bulan ini.',
          a: 'SELECT product_name, category, total_sold FROM (SELECT p.name AS product_name, c.name AS category, SUM(oi.quantity) AS total_sold, RANK() OVER (PARTITION BY c.id ORDER BY SUM(oi.quantity) DESC) AS rnk FROM products p JOIN categories c ON p.category_id = c.id JOIN order_items oi ON oi.product_id = p.id WHERE oi.created_at >= date_trunc("month", NOW()) GROUP BY p.id, p.name, c.id, c.name) ranked WHERE rnk <= 3 ORDER BY category, rnk. Penjelasan: PARTITION BY c.id membuat window terpisah per kategori. RANK() memberikan ranking dalam tiap kategori berdasarkan total_sold. Filter WHERE rnk <= 3 di outer query mengambil top 3. Gunakan RANK() bukan ROW_NUMBER() agar jika ada tie di posisi 3, keduanya masuk.'
        }
      ],
      code: `-- WINDOW FUNCTIONS: Top N per group
SELECT product_name, category, total_sold FROM (
    SELECT
        p.name AS product_name,
        c.name AS category,
        SUM(oi.quantity) AS total_sold,
        RANK() OVER (
            PARTITION BY c.id
            ORDER BY SUM(oi.quantity) DESC
        ) AS rnk
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN order_items oi ON oi.product_id = p.id
    WHERE oi.created_at >= date_trunc('month', NOW())
    GROUP BY p.id, c.id
) ranked
WHERE rnk <= 3;

-- CTE: Running total (readable version)
WITH daily_revenue AS (
    SELECT date_trunc('day', created_at) AS day, SUM(amount) AS revenue
    FROM orders WHERE status = 'paid' GROUP BY 1
),
running AS (
    SELECT day, revenue, SUM(revenue) OVER (ORDER BY day) AS cumulative
    FROM daily_revenue
)
SELECT * FROM running ORDER BY day;

-- EXPLAIN ANALYZE: Read the plan
EXPLAIN (ANALYZE, BUFFERS)
SELECT u.name, COUNT(o.id)
FROM users u LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id;
-- Look for: "Seq Scan" on large tables = add index
-- "rows=100 actual rows=50000" = run ANALYZE users`
    },
    {
      id: 'indexing-strategy',
      title: 'Indexing Strategy & B-Tree Internals',
      depth: 'B-Tree, Composite, Partial, Covering Indexes',
      image: '/illustrations/btree.png',
      content: `Index adalah struktur data terpisah yang database maintain untuk mempercepat query. Default index type di PostgreSQL dan MySQL adalah B-Tree (Balanced Tree).

**B-Tree Internals:** B-Tree selalu balanced — jarak dari root ke setiap leaf selalu sama. Node internal berisi key dan pointer ke child nodes. Leaf nodes berisi key dan pointer (ctid/rowid) ke baris di heap. Search dimulai dari root, membandingkan nilai, turun ke child yang tepat sampai leaf. Untuk tabel dengan 1 juta baris, B-Tree hanya butuh ~4-5 level — O(log n). Setiap INSERT atau UPDATE yang mempengaruhi indexed column memperbarui B-Tree — ini overhead dari index.

**Composite Index & Leftmost Prefix Rule:** Index pada (tenant_id, status, created_at) berguna untuk query yang filter dengan: tenant_id saja, tenant_id + status, atau semua tiga. Tapi TIDAK berguna untuk query yang hanya filter status tanpa tenant_id. Urutan kolom harus mengikuti kolom yang paling sering di-filter pertama.

**Partial Index:** Index yang hanya mencakup subset baris (WHERE condition). Lebih kecil, lebih cepat di-scan. Contoh: index hanya pada active users (WHERE deleted_at IS NULL).

**Covering Index (Index Only Scan):** Jika query hanya butuh kolom yang semua ada di index, database tidak perlu mengakses heap — "Index Only Scan". Di PostgreSQL, gunakan INCLUDE clause untuk menambahkan kolom non-key ke leaf nodes.`,
      why: `Indexing adalah lever performa dengan ROI tertinggi di backend engineering. Tapi over-indexing memperlambat write operations. Senior engineer melakukan indexing berdasarkan actual query patterns dari APM/slow query log, bukan spekulasi.`,
      mistake: `Membuat index untuk setiap kolom secara terpisah. Tidak menghapus index yang tidak digunakan (cek pg_stat_user_indexes). Index bloat setelah banyak UPDATE/DELETE — REINDEX CONCURRENTLY diperlukan. Menggunakan LIKE '%keyword%' yang tidak bisa menggunakan B-Tree index — gunakan Full-Text Search atau pg_trgm.`,
      interview: [
        {
          q: 'Mengapa database optimizer kadang memilih Seq Scan meskipun ada index?',
          a: 'Query planner PostgreSQL mengestimasi biaya setiap plan berdasarkan statistics (jumlah row, distribusi nilai, correlation). Seq Scan lebih dipilih ketika: (1) Selectivity rendah — jika query akan mengambil > ~5-15% dari total rows, full scan lebih efisien karena index lookup + heap fetch per-row (random I/O) lebih lambat dari sequential scan (sequential I/O yang cache-friendly). (2) Statistics yang salah — run ANALYZE untuk refresh. (3) Small table — untuk tabel kecil (<beberapa ratus rows), Seq Scan hampir selalu lebih cepat karena seluruh tabel fit dalam 1-2 pages. (4) random_page_cost terlalu tinggi di config — untuk SSD, turunkan random_page_cost = 1.1 (default 4.0 diasumsikan HDD) agar planner lebih sering pilih Index Scan.'
        },
        {
          q: 'Jelaskan Composite Index dan apa yang dimaksud dengan Leftmost Prefix Rule.',
          a: 'Composite Index menyimpan kombinasi beberapa kolom dalam satu B-Tree, di-sort berdasarkan kolom pertama, lalu kedua, dst. Leftmost Prefix Rule: query HANYA bisa menggunakan index jika ia men-filter kolom dari kiri. Contoh index (a, b, c): WHERE a = 1 ✓ | WHERE a = 1 AND b = 2 ✓ | WHERE a = 1 AND b = 2 AND c = 3 ✓ | WHERE b = 2 ✗ (tidak dimulai dari a) | WHERE a = 1 AND c = 3 ✓ tapi hanya a yang digunakan. Strategy: kolom dengan equality filter (=) taruh di kiri, kolom dengan range filter (>, <, BETWEEN) taruh di kanan karena range filter "menghentikan" penggunaan kolom selanjutnya. Kolom dengan cardinality tinggi (banyak nilai berbeda) di kiri memberikan selectivity yang lebih baik.'
        },
        {
          q: 'Apa itu Covering Index dan bagaimana ia memungkinkan Index Only Scan?',
          a: 'Covering Index adalah index yang "mencakup" semua kolom yang dibutuhkan oleh sebuah query — termasuk kolom SELECT, WHERE, ORDER BY, dan GROUP BY. Ketika semua data yang dibutuhkan ada di index, database tidak perlu "fetch" ke heap table untuk setiap row — ini disebut Index Only Scan. Jauh lebih cepat karena: (1) Menghindari random I/O ke heap (setiap heap fetch bisa miss cache). (2) Index data lebih compact dan lebih mudah di-cache. Di PostgreSQL: CREATE INDEX idx_covering ON orders (status) INCLUDE (user_id, amount). Kolom di INCLUDE disimpan di leaf nodes tapi tidak mempengaruhi B-Tree ordering. Penting: visibility map harus up-to-date (autovacuum) agar Index Only Scan bisa digunakan.'
        }
      ],
      code: `-- COMPOSITE INDEX: Column order matters
-- Query pattern: always filter by tenant, often by status
CREATE INDEX idx_orders_tenant_status
ON orders (tenant_id, status, created_at DESC);

-- Uses index ✓
SELECT * FROM orders WHERE tenant_id = 1 AND status = 'paid';
SELECT * FROM orders WHERE tenant_id = 1;

-- Does NOT use index ✗ (violates leftmost prefix)
SELECT * FROM orders WHERE status = 'paid';

-- PARTIAL INDEX: Only index what matters
CREATE INDEX idx_users_active_email
ON users (email)
WHERE deleted_at IS NULL;  -- Only ~5% are NOT deleted anyway

-- COVERING INDEX: Avoid heap access
-- Query: SELECT user_id, amount FROM orders WHERE status = 'paid'
CREATE INDEX idx_orders_covering
ON orders (status)
INCLUDE (user_id, amount);  -- Stored in leaf nodes → Index Only Scan

-- FIND MISSING INDEXES (PostgreSQL)
SELECT schemaname, tablename, attname, n_distinct
FROM pg_stats
WHERE tablename = 'orders' AND n_distinct > 100;

-- CHECK UNUSED INDEXES (remove to speed up writes!)
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE relname = 'orders' AND idx_scan = 0;`
    },
    {
      id: 'caching-redis',
      title: 'Caching Architecture & Redis Deep Dive',
      depth: 'Cache patterns, data structures, invalidation, stampede',
      image: '/illustrations/caching.png',
      content: `Caching adalah seni menyimpan hasil komputasi mahal di tempat yang lebih cepat diakses, dengan trade-off bahwa data mungkin stale.

**Redis Data Structures:** String (SET/GET): basic key-value. Hash (HSET/HGET): seperti object, cocok untuk partial user data. List (LPUSH/RPOP): queue FIFO atau stack LIFO, cocok untuk job queue. Set (SADD/SMEMBERS): unique collection, tracking unique visitors. Sorted Set (ZADD/ZRANGE): set dengan score, ideal untuk leaderboard dan rate limiting. Bitmaps: representasi kompak boolean data dalam skala besar.

**Cache Patterns:** Cache-Aside (Lazy Loading): aplikasi cek cache dulu, miss → query DB → store. Paling umum. Write-Through: setiap write ke DB juga write ke cache. Konsisten tapi menambah write latency. Write-Behind: write ke cache dulu, asynchronously flush ke DB. Cepat tapi risiko data loss.

**Cache Invalidation:** TTL-based (simplest): setiap key punya expiry. Event-based: saat data berubah, invalidate cache. Cache versioning: sertakan version di key (user:v3:123), update version saat data berubah.

**Cache Stampede (Thundering Herd):** Saat cache key expired dan ribuan request datang bersamaan, semua menghantam database. Solusi: Probabilistic Early Expiration (refresh sebelum expired), Redis SETNX lock (hanya satu worker yang refresh), atau singleflight pattern.`,
      why: `Tanpa caching, database menjadi bottleneck saat traffic spike. Dengan caching tepat, bisa serve 100x lebih banyak request dengan hardware yang sama. Tapi caching menambah kompleksitas — stale data, invalidation bugs, stampede adalah masalah nyata yang harus diantisipasi sejak desain.`,
      mistake: `Caching tanpa TTL — data stale selamanya. Meng-cache granularity yang salah (seluruh dashboard page padahal hanya sebagian data yang sering berubah). Menggunakan Redis sebagai primary database untuk data yang harus persistent tanpa mengkonfigurasi RDB/AOF persistence.`,
      interview: [
        {
          q: 'Jelaskan Cache-Aside pattern. Kapan Write-Through lebih baik?',
          a: 'Cache-Aside (Lazy Loading): (1) Read: cek cache. Hit → return. Miss → query DB → simpan ke cache → return. (2) Write: update DB, DELETE cache key (invalidate, bukan update). Keunggulan: hanya data yang benar-benar dibutuhkan yang masuk cache. Kelemahan: cache miss pertama selalu ada latency DB. Write-Through: setiap write ke DB juga langsung write ke cache (sama-sama updated). Keunggulan: tidak ada stale read setelah write, cache selalu fresh. Kelemahan: setiap write butuh dua operasi (DB + cache), latency write meningkat. Cache mungkin berisi data yang tidak pernah dibaca (wasted memory). Write-Through lebih baik ketika: read sangat sering setelah write (e.g., user profile langsung di-load setelah update), atau konsistensi sangat penting dan stale read tidak bisa ditoleransi.'
        },
        {
          q: 'Apa itu cache stampede dan sebutkan dua cara mengatasinya?',
          a: 'Cache stampede (thundering herd): saat cache key expired, banyak concurrent requests langsung bypass cache dan semua menghantam database secara bersamaan. Untuk popular key dengan traffic tinggi, ini bisa membunuh database. Cara 1 — Mutex/Lock (SETNX): saat cache miss, satu request mencoba SET NX (Set if Not Exists) sebuah lock key di Redis. Jika berhasil (mendapat lock), request tersebut fetch DB dan update cache, lalu hapus lock. Request lain yang gagal dapat lock → sleep sebentar → cek cache lagi (sudah terisi). Cara 2 — Probabilistic Early Expiration: alih-alih menunggu TTL habis, refresh cache SEBELUM expired dengan probabilitas yang meningkat semakin mendekati expiry. Jika TTL tersisa < 20%, ada 50% chance refresh. Jika < 10%, ada 90% chance. Satu request akan refresh terlebih dahulu, sehingga stampede tidak pernah terjadi. Cara 3 (bonus) — Singleflight: di application level, jika ada request yang sedang fetch DB untuk key yang sama, semua request lain yang datang akan mendapat "share" hasilnya, bukan masing-masing fetch sendiri.'
        },
        {
          q: 'Bagaimana menggunakan Redis Sorted Set untuk membuat leaderboard real-time?',
          a: 'Redis Sorted Set (ZSET) menyimpan members dengan float score, otomatis di-sort berdasarkan score. Operasi kunci: ZADD leaderboard:game1 <score> <userId> — tambah/update score, O(log N). Jika userId sudah ada, score otomatis di-update. ZINCRBY leaderboard:game1 <increment> <userId> — tambah score secara atomic, O(log N). ZREVRANGE leaderboard:game1 0 9 WITHSCORES — ambil top 10 (highest score dulu), O(log N + k). ZREVRANK leaderboard:game1 <userId> — dapatkan ranking user (0-indexed), O(log N). ZSCORE leaderboard:game1 <userId> — dapatkan score user, O(1). Untuk leaderboard per-periode (weekly, monthly), gunakan key yang berbeda dengan expiry: leaderboard:game1:2024-W45. Ketika periode selesai, key expired otomatis. Keunggulan vs DB: semua operasi O(log N), atomic, dan tidak butuh locking. Bisa handle jutaan players dengan sub-millisecond response.'
        }
      ],
      code: `// CACHE-ASIDE PATTERN (Node.js + Redis)
async function getUserById(id: string): Promise<User | null> {
    const cacheKey = \`user:v1:\${id}\`

    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const user = await db.users.findById(id)
    if (!user) return null

    await redis.setex(cacheKey, 3600, JSON.stringify(user))
    return user
}

// Invalidate on update — delete, don't update
async function updateUser(id: string, data: Partial<User>) {
    await db.users.update({ where: { id }, data })
    await redis.del(\`user:v1:\${id}\`)
}

// SINGLEFLIGHT: Prevent stampede at app level
const inFlight = new Map<string, Promise<any>>()
async function getWithSingleFlight<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (inFlight.has(key)) return inFlight.get(key)!
    const promise = fetcher().finally(() => inFlight.delete(key))
    inFlight.set(key, promise)
    return promise
}

// REDIS SORTED SET: Real-time leaderboard
await redis.zadd('leaderboard:game1', score, userId)          // O(log n)
await redis.zincrby('leaderboard:game1', delta, userId)       // Atomic increment

const top10 = await redis.zrevrange('leaderboard:game1', 0, 9, 'WITHSCORES')
const rank  = await redis.zrevrank('leaderboard:game1', userId) // 0-indexed`
    },
    {
      id: 'db-transactions',
      title: 'ACID, Transactions & Distributed Data',
      depth: 'Isolation levels, locking, Saga pattern, Outbox pattern',
      content: `ACID menjamin keandalan transaksi: Atomicity (semua atau tidak sama sekali), Consistency (valid state ke valid state), Isolation (concurrent transactions tidak saling mempengaruhi), Durability (setelah commit, data persist meskipun crash).

**Isolation Levels:** Read Committed (default PostgreSQL): hanya baca data yang sudah di-commit. Masalah: Non-repeatable read. Repeatable Read: snapshot di awal transaksi, pembacaan konsisten. Masalah: Phantom read. Serializable: transaksi dieksekusi seolah-olah serial. Paling aman, paling lambat.

**Locking:** Pessimistic (SELECT FOR UPDATE): kunci baris saat read, tidak ada yang bisa update sampai transaksi selesai. Aman tapi bisa deadlock. Optimistic: tidak kunci apapun, tapi saat update cek apakah version/timestamp berubah sejak dibaca. Jika berubah, reject dan retry. Cocok untuk read-heavy workloads.

**Distributed Transactions — The Hard Problem:** Di microservices, satu business operation melibatkan multiple services. Two-Phase Commit (2PC): sangat lambat dan blocking. Solusi modern: Saga Pattern. Setiap service menyelesaikan transaksi lokal dan mempublikasikan event. Jika ada yang gagal, jalankan "compensating transactions". Choreography (event-driven) vs Orchestration (saga orchestrator). Outbox Pattern: pastikan event dan DB write terjadi atomically (tulis event ke outbox table dalam transaksi yang sama, baru publish ke message broker via CDC atau polling).`,
      why: `Pemahaman isolation levels mencegah subtle data integrity bugs: race conditions, lost updates, phantom reads. Di sistem dengan concurrent users tinggi (e-commerce, booking), pilihan isolation level yang tepat adalah perbedaan antara data konsisten dan data corrupt.`,
      mistake: `Menggunakan Serializable untuk semua transaksi tanpa alasan — throughput database turun drastis. Tidak menangani deadlock — PostgreSQL otomatis abort satu transaksi, tapi aplikasi harus retry. Menggunakan 2PC di microservices modern — gunakan Saga + Outbox Pattern.`,
      interview: [
        {
          q: 'Apa bedanya Optimistic dan Pessimistic locking? Kapan menggunakan masing-masing?',
          a: 'Pessimistic Locking: lock resource sebelum membaca, tidak ada yang bisa modifikasi sampai kita selesai. Di SQL: SELECT * FROM orders WHERE id = 1 FOR UPDATE. Cocok ketika: conflict rate tinggi (banyak concurrent writes ke data yang sama), operasi harus selalu berhasil tanpa retry (payment processing), atau cost retry tinggi. Masalah: throughput rendah, bisa deadlock. Optimistic Locking: tidak lock apapun. Baca data + catat version. Update hanya jika version masih sama: UPDATE orders SET status="paid", version=version+1 WHERE id=1 AND version=3. Jika 0 rows affected = conflict, application retry. Cocok ketika: conflict rate rendah (read-heavy, occasional writes), throughput tinggi diutamakan (banyak concurrent reads), atau operasi bisa di-retry dengan aman (idempotent). Kebanyakan web apps cocok optimistic locking.'
        },
        {
          q: 'Jelaskan Saga Pattern dan bedanya Choreography vs Orchestration.',
          a: 'Saga adalah sekuens transaksi lokal di multiple services. Jika satu gagal, saga menjalankan "compensating transactions" untuk rollback langkah sebelumnya. Contoh order: CreateOrder → ReserveInventory → ChargePayment. Jika ChargePayment gagal: ReleaseInventory → CancelOrder. Choreography (event-driven): setiap service publish event setelah selesai, service lain bereaksi. Order Service publish "order.created" → Inventory Service subscribe dan proses → publish "inventory.reserved" → Payment Service subscribe. Keunggulan: decoupled, mudah ditambah service baru. Kelemahan: flow sulit di-trace, sulit debug, tidak ada satu tempat yang tahu state keseluruhan. Orchestration: satu Saga Orchestrator yang tahu seluruh flow dan mengirim commands ke setiap service. Orchestrator tahu step mana yang sedang berjalan dan melakukan compensations jika perlu. Keunggulan: alur jelas, mudah debug. Kelemahan: coupling ke orchestrator, single point of failure.'
        },
        {
          q: 'Apa itu Outbox Pattern dan mengapa ia mengatasi masalah dual-write?',
          a: 'Dual-write problem: dalam microservices, kita sering perlu melakukan dua hal secara bersamaan: update database DAN publish event ke message broker (Kafka, RabbitMQ). Jika keduanya dilakukan secara terpisah, ada race condition: DB update berhasil tapi publish event gagal → event tidak terkirim, downstream services tidak tahu ada perubahan. Atau sebaliknya. Outbox Pattern menyelesaikan ini: dalam SATU database transaction yang sama, tulis data utama DAN tulis event ke tabel "outbox" (tabel khusus di DB yang sama). Transaksi atomic: keduanya berhasil atau keduanya gagal. Kemudian, proses terpisah (CDC = Change Data Capture menggunakan Debezium, atau polling job) membaca dari outbox table dan publish ke message broker. Proses ini bisa retry dengan aman. Keunggulan: event dan data selalu konsisten. Kelemahan: perlu infrastructure tambahan (CDC tool atau polling), message bisa di-deliver lebih dari sekali (at-least-once delivery) → consumer harus idempotent.'
        }
      ],
      code: `-- OPTIMISTIC LOCKING
ALTER TABLE products ADD COLUMN version INTEGER DEFAULT 1;

-- Read
SELECT id, stock, version FROM products WHERE id = 42;

-- Update only if version matches
UPDATE products
SET stock = stock - 1, version = version + 1
WHERE id = 42 AND version = 3;
-- 0 rows affected = conflict! Application must retry.

-- PESSIMISTIC LOCKING
BEGIN;
SELECT * FROM inventory WHERE product_id = 42 FOR UPDATE; -- Locked!
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 42;
COMMIT;

// SAGA: Choreography (Node.js)
// Order Service
async function createOrder(data) {
    const order = await db.orders.create({ ...data, status: 'PENDING' })
    await events.publish('order.created', { orderId: order.id, items: data.items })
    return order
}

// Inventory Service (reacts to 'order.created')
events.subscribe('order.created', async ({ orderId, items }) => {
    try {
        await reserveInventory(items)
        await events.publish('inventory.reserved', { orderId })
    } catch {
        await events.publish('inventory.failed', { orderId })
    }
})

// OUTBOX PATTERN (atomic write + event)
await db.transaction(async (tx) => {
    const order = await tx.orders.create(data)
    await tx.outbox.create({          // Same transaction!
        eventType: 'order.created',
        payload: JSON.stringify({ orderId: order.id }),
        status: 'pending'
    })
})
// Separate CDC/polling process reads outbox and publishes to Kafka`
    }
  ]
}
