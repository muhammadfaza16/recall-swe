const fs = require('fs');

const p0 = fs.readFileSync('src/data/pillar-0.ts', 'utf8');
let newP0 = p0.replace(
  "content: 'Sebelum kita bicara optimasi kode, kita harus tahu di mana kode berjalan.\\n\\n**Bits & Bytes:** Komputer hanya mengerti 0 dan 1 (binary). 1 byte = 8 bits. Semua tipe data (integer, string, boolean) pada akhirnya dikodekan menjadi representasi binary ini.\\n\\n**CPU & Registers:** CPU mengeksekusi instruksi. Data yang sedang aktif dikerjakan disimpan di *Registers* (sangat cepat, tapi sangat kecil). Jika tidak cukup, data diambil dari cache atau RAM.\\n\\n**Memory Hierarchy:** Ini adalah rahasia performa tinggi. CPU memiliki L1, L2, dan L3 Cache. Akses L1 Cache butuh ~1 nanosecond. Akses RAM (Main Memory) butuh ~100 nanoseconds (100x lebih lambat!). Jika data tidak ada di RAM, sistem akan mengambil dari SSD/Hard Disk (bisa ribuan kali lebih lambat dari RAM).\\n\\n**Spatial Locality:** CPU tidak mengambil data per *byte* dari RAM, melainkan dalam bentuk *Cache Line* (biasanya 64 bytes). Jika Anda mengakses elemen array secara berurutan, elemen berikutnya kemungkinan besar sudah terbawa ke dalam *Cache Line* (sangat cepat). Inilah mengapa *Array* jauh lebih cepat di-iterasi daripada *Linked List* yang alamat memorinya melompat-lompat.'",
  "content: 'Lo mungkin bisa bikin fitur A-Z pakai framework favorit lo, tapi kalau lo nggak ngerti hardware yang nge-run kode lo, lo bakal buta pas nge-solve performance issue. Mari kita telanjangi mesinnya.\\n\\n**CPU & Registers:** CPU itu koki super ngebut. Pas dia masak (eksekusi kode), dia taruh bumbu di meja terdekat (*Registers*). Kalau mejanya penuh, dia nyari di rak (*Cache*), baru ke gudang (*RAM*). Terakhir, baru ke pasar (*SSD*).\\n\\n**Memory Hierarchy (Rahasia Kecepatan):** L1 Cache itu kilat (~1ns). RAM? ~100ns (100x lebih lambat bro!). Hardisk? Ribuan kali lipat. Kode lo lambat biasanya bukan karena algoritmanya jelek, tapi karena CPU lo kebanyakan nungguin data dari RAM (Cache Miss).\\n\\n**Spatial Locality:** CPU itu pinter, dia males ngambil barang satu-satu. Kalau lo minta data di index 0, dia sekalian ngambil index 1 sampai 15 ke dalem *Cache Line*. Ini kenapa nge-loop *Array* (yang datanya nempel) bakal membantai performa nge-loop *Linked List* (yang datanya mencar-mencar) meskipun sama-sama O(n)!'"
);

newP0 = newP0.replace(
  "why: 'Tanpa pemahaman dasar arsitektur, optimasi kode terasa seperti sihir. Software engineer level FAANG tahu bahwa struktur data yang ramah terhadap CPU Cache (seperti array/slice) seringkali mengalahkan struktur data algoritmik kompleks yang alamat memorinya berantakan (seperti tree atau linked list) pada jumlah data kecil-menengah.'",
  "why: 'Kalau lo mau tembus FAANG atau nanganin sistem high-load, lo nggak bisa cuma nebak. Optimasi tanpa paham *Cache Locality* itu kayak dukun. Engineer top tahu kapan harus pakai Array sederhana ketimbang Tree kompleks cuma demi bikin CPU seneng (cache-friendly).'"
);

newP0 = newP0.replace(
  "mistake: 'Berpikir bahwa O(1) selalu instan dan O(n) lambat di dunia nyata. Hash Map memiliki kompleksitas O(1), tapi operasi *hashing* dan memori yang tersebar membuat konstanta waktunya besar. Kadang iterasi O(n) pada Array kecil jauh lebih cepat karena L1 Cache.'",
  "mistake: 'Terlalu mendewa-dewakan Big O Notation. Lo pikir Hash Map O(1) selalu lebih ngebut dari Array O(n)? Di dunia nyata, overhead *hashing* dan loncat-loncat di RAM bikin Hash Map sering keok ngelawan *brute-force* iterasi Array pada jumlah data kecil (misal n < 100).'"
);

newP0 = newP0.replace(
  "content: 'Paradigma pemrograman adalah cara kita menstrukturkan pikiran untuk memecahkan masalah. Dua pilar utama di industri adalah OOP dan FP.\\n\\n**Object-Oriented Programming (OOP):** Menggabungkan *State* (data) dan *Behavior* (fungsi) ke dalam satu entitas yang disebut Object. 4 Prinsip utamanya:\\n1. **Encapsulation:** Menyembunyikan *state* internal dan hanya mengekspos *method* publik.\\n2. **Abstraction:** Menyembunyikan kerumitan implementasi dari pengguna class.\\n3. **Inheritance:** Mewariskan properti dan method dari parent ke child.\\n4. **Polymorphism:** Method yang sama bisa memiliki implementasi berbeda tergantung object-nya.\\n\\n**Functional Programming (FP):** Memisahkan data dan fungsi. Ciri utamanya:\\n1. **Pure Functions:** Output hanya bergantung pada input. Tidak ada *side-effects* (tidak mengubah variabel global atau menulis ke DB).\\n2. **Immutability:** Data tidak pernah diubah setelah dibuat. Jika ingin mengubah array, buat array baru hasil *copy* (contoh: `map`, `filter`).\\n3. **First-class Functions:** Fungsi diperlakukan sebagai variabel, bisa di-*pass* sebagai argumen.'",
  "content: 'Ngoding itu nggak cuma asal muter otak sampai fitur jalan. Kalau codebase lo udah segede raksasa, lo butuh \"Aliran Bela Diri\" yang jelas biar nggak bunuh diri pas *maintenance*. Ada dua aliran raksasa:\\n\\n**Object-Oriented Programming (OOP):** Pendekatan \"Real World\". Lo gabungin Data (State) sama Action (Behavior) di dalem satu objek. Tujuannya? Biar orang luar nggak seenaknya ngacak-ngacak data lo (Encapsulation). Cocok banget buat modelin sistem enterprise yang kompleks kayak e-commerce atau game.\\n\\n**Functional Programming (FP):** Aliran anti-ribet. Prinsipnya simpel: Data dan Fungsi itu musuhan, jangan digabung. Lo panggil fungsi A, hasilnya B. Nggak bakal ada \"variabel global\" yang mendadak berubah di belakang layar (*Pure Functions & Immutability*). Bikin UI (kayak React) atau stream data jadi gampang banget di-test dan anti bug aneh-aneh.'"
);

newP0 = newP0.replace(
  "why: 'Semua arsitektur modern adalah kombinasi paradigma ini. React menggunakan prinsip FP (Immutability, Pure Components) agar UI *predictable*. Sementara backend Java/C# sangat kental dengan OOP untuk mengelola dependensi kompleks. Paham keduanya berarti Anda punya dua alat untuk masalah yang berbeda.'",
  "why: 'Engineer yang cuma mentok di satu paradigma itu ibarat tukang kayu yang cuma punya palu; semua masalah dianggap paku. Paham OOP bikin lo jago nulis arsitektur Backend yang modular. Paham FP bikin lo dewa nulis React/UI yang state-nya predictable dan nggak gampang bocor.'"
);

newP0 = newP0.replace(
  "mistake: 'Mengubah *state* secara langsung (mutating state) di aplikasi yang dibangun dengan prinsip FP (seperti Redux/React), yang menyebabkan UI tidak re-render. Di sisi OOP: Terlalu banyak membuat hierarki *Inheritance* yang dalam (God Object), padahal *Composition* seringkali lebih baik.'",
  "mistake: 'Di FP: Nge-push data langsung ke array yang lagi dipakai React (`arr.push(x)`), terus bingung kenapa UI-nya nggak re-render. Di OOP: Bikin *Inheritance* (pewarisan class) sampai 7 turunan ke bawah (God Object), pas ada bug di parent, semua class anaknya ikut hancur. Selalu pilih *Composition over Inheritance*!'"
);

fs.writeFileSync('src/data/pillar-0.ts', newP0);


const p1 = fs.readFileSync('src/data/pillar-1.ts', 'utf8');
let newP1 = p1.replace(
  "content: 'Sebelum membahas konkurensi (Concurrency), kita harus tahu apa yang diatur oleh Operating System (OS).\\n\\n**Process vs Thread:**\\n- **Process:** Program yang sedang berjalan. Process bersifat *terisolasi*; memiliki ruang memorinya (heap) sendiri. Jika Process A crash, Process B tetap hidup.\\n- **Thread:** Unit eksekusi di dalam sebuah Process. Semua Thread di dalam satu Process **berbagi ruang memori yang sama**. Ini membuat komunikasi antar Thread sangat cepat, tapi sangat berbahaya (rawan Race Condition).\\n\\n**Context Switching:** CPU core hanya bisa mengerjakan satu tugas di satu waktu (kecuali multi-core). Agar terasa *multitasking*, OS melakukan *Context Switch*: menyimpan *state* Thread lama, meload *state* Thread baru, lalu menjalankannya. Proses ini **mahal** (memakan siklus CPU). Terlalu banyak Thread = CPU sibuk berganti konteks, bukan mengerjakan tugas.\\n\\n**Virtual Memory & Paging:** OS menipu program. Program merasa ia memiliki RAM tanpa batas yang utuh (Virtual Memory). Di belakang layar, OS memetakan blok memori virtual ini (Pages) ke RAM fisik sebenarnya. Jika RAM penuh, OS memindahkan sebagian memori ke Hard Disk (*Swap*). Ini sebabnya aplikasi tiba-tiba melambat drastis saat RAM penuh (*thrashing*).'",
  "content: 'Lo nggak bakal pernah bisa bikin sistem yang bisa nahan jutaan *traffic* kalau lo nganggep OS itu *black box*. Di dunia nyata, OS itu dewa yang ngatur nafas aplikasi lo.\\n\\n**Process vs Thread:**\\nBayangin **Process** itu rumah, dan **Thread** itu penghuninya. Tiap rumah (Process) punya brankas memori sendiri. Kalau rumah tetangga meledak, rumah lo aman. Tapi **Thread**? Mereka numpang di satu rumah. Cepet banget buat tukeran data, tapi rawan banget rebutan barang (Race Condition) kalau lo nggak jago ngatur gembok (Mutex).\\n\\n**Context Switching:**\\nCPU itu cuma bisa ngerjain satu hal di satu waktu. Biar kelihatan multitasking, dia loncat-loncat ngerjain Thread A ke B super cepet. Mindahin fokus ini namanya *Context Switch* dan ini **mahal banget**. Kebanyakan Thread bikin CPU lo habis tenaga cuma buat gonta-ganti kerjaan, bukan ngejalanin *logic* lo.\\n\\n**Virtual Memory:**\\nOS itu penipu handal. Dia ngasih ilusi ke aplikasi lo seolah-olah RAM itu tak terbatas. Pas RAM asli abis, OS bakal nendang memori ke Hardisk (*Swap/Paging*). Ini alasan mematikan kenapa server lo mendadak nge-hang (*thrashing*) waktu *memory leak*!'"
);

newP1 = newP1.replace(
  "why: 'Backend developer yang tidak paham beda Process dan Thread tidak akan mengerti mengapa Node.js (Single Threaded Process) arsitekturnya berbeda dengan Java/Tomcat (Multi-Threaded). Paham OS berarti paham limitasi hardware.'",
  "why: 'Kalau lo nulis Backend tapi nggak ngerti bedanya Process dan Thread, lo cuma script-kiddie. Lo nggak bakal ngerti kenapa Node.js (Single-Threaded Event Loop) punya arsitektur yang bertolak belakang sama Java Tomcat (Multi-Threaded). Paham OS = Paham cara maksimalkan server!'"
);

newP1 = newP1.replace(
  "mistake: 'Membuka 10.000 thread untuk menangani 10.000 koneksi bersamaan (Thread-per-request model). Ini akan menghancurkan server karena RAM habis (setiap thread butuh ~1MB stack) dan CPU habis hanya untuk Context Switching. Ini alasan Nginx dan Node.js menggunakan Event Loop.'",
  "mistake: 'Bikin 10.000 thread buat ngelayanin 10.000 koneksi barengan (*Thread-per-request*). Satu thread makan ~1MB RAM. 10.000 thread? BOOM! Server keabisan RAM dan CPU lo mati kutu gara-gara *Context Switch*. Mending serahin ke Event Loop (kayak Nginx/Node.js) atau Goroutine (Go).'"
);

fs.writeFileSync('src/data/pillar-1.ts', newP1);

console.log('Done rewrites for P0 and P1');
