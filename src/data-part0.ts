export const PILLARS_PART0 = [
  {
    id: "prerequisites",
    title: "Pillar 0: The Bridge (Prerequisites)",
    topics: [
      {
        id: "big-o-dsa",
        title: "Big O & Essential DSA",
        depth: "Bridging the gap to system performance",
        content: "Sebelum bahas arsitektur, lo wajib paham efisiensi kode. Big O Notation mengukur bagaimana runtime/memori kodelo bertambah saat jumlah data bertambah. O(1) konstan (HashMap lookup). O(n) linear (Looping Array). O(log n) sangat efisien (Binary Search di sorted data). O(n^2) bahaya (Nested loop). Struktur data fundamental yang HARUS lancar: Arrays (bagus untuk iterasi berurutan, buruk untuk insert di tengah), HashMaps/Dictionaries (senjata utama interview, lookup O(1)), dan Linked Lists (konsep dasar untuk Tree dan Graph).",
        why: "Di production, array.find() pada 1 juta data akan membekukan CPU. Mengubah array menjadi Set atau HashMap (O(1) lookup) adalah optimasi paling dasar yang harus insting.",
        mistake: "Menggunakan dua nested loop (O(n^2)) untuk mencari irisan dari dua array. Seharusnya masukkan array pertama ke HashMap, lalu loop array kedua (O(n)).",
        interview: "Apa bedanya Array dan Linked List secara alokasi memori? Mengapa lookup di HashMap bisa O(1)?",
        code: `// === BAD: O(n^2) - Nested Loops ===
function findDuplicates(arr1, arr2) {
    let result = [];
    for (let i of arr1) {          // O(n)
        if (arr2.includes(i)) {    // O(n) -> total O(n^2)
            result.push(i);
        }
    }
    return result;
}

// === GOOD: O(n) - Using HashMap/Set ===
function findDuplicatesOptimized(arr1, arr2) {
    const set1 = new Set(arr1);    // O(n) space
    let result = [];
    for (let i of arr2) {          // O(n) time
        if (set1.has(i)) {         // O(1) lookup
            result.push(i);
        }
    }
    return result;
}`
      },
      {
        id: "js-ts-core",
        title: "JavaScript & TS Core Mechanics",
        depth: "Closures, Promises, and Event Loop Basics",
        content: "Sebelum masuk ke React tingkat lanjut, mekanik JS harus solid. (1) Closures: Fungsi yang mengingat variabel di sekitarnya bahkan setelah parent fungsinya selesai. Ini dasar dari React Hooks. (2) Event Loop: JS itu single-threaded. Operasi I/O (seperti fetch API) dilempar ke Web APIs/libuv. Begitu selesai, callback-nya masuk ke Task Queue, menunggu Event Loop mengambilnya saat Call Stack kosong. (3) Promises & Async/Await: Abstraksi modern untuk callback hell. Pahami bahwa 'await' tidak memblokir seluruh program, melainkan men-suspend fungsi tersebut dan membiarkan fungsi lain berjalan.",
        why: "Bug paling aneh di Frontend (seperti data telat update, atau memory leak) berakar dari ketidakpahaman tentang Closure dan sinkronisasi Event Loop.",
        mistake: "Melakukan loop besar dengan operasi asinkronus menggunakan 'forEach' (yang tidak menunggu Promise). Gunakan 'for...of' atau 'Promise.all'.",
        interview: "Jelaskan apa itu Closure dengan contoh. Apa bedanya Task Queue dan Microtask Queue dalam Event Loop?",
        code: `// === CLOSURE IN ACTION ===
function createCounter() {
    let count = 0; // Private variable
    return function() {
        count += 1;
        return count;
    }
}
const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2

// === ASYNC/AWAIT PITFALL ===
// BAD: forEach doesn't wait for promises
async function processBad(items) {
    items.forEach(async (item) => {
        await saveToDB(item); 
    });
    console.log("Done"); // Prints immediately!
}

// GOOD: Promise.all for parallel execution
async function processGood(items) {
    const promises = items.map(item => saveToDB(item));
    await Promise.all(promises);
    console.log("Done"); // Prints after all finished
}`
      },
      {
        id: "git-workflow",
        title: "Pro Git Workflow",
        depth: "Branching, Rebasing, & PRs",
        content: "Di level pro, Git bukan cuma 'add, commit, push'. Workflow tim modern (seperti GitFlow atau Trunk-Based Development) mensyaratkan: (1) Branching yang rapi (feature/login, fix/header). (2) Commit message yang semantik ('feat: add user login', 'fix: resolve race condition'). (3) Memahami 'git rebase' untuk meratakan history commit agar mudah dibaca, vs 'git merge' yang mempertahankan context cabang. (4) Resolving conflicts tanpa panik menggunakan git mergetool atau IDE.",
        why: "Kode yang brilian tidak berguna jika lo menghancurkan branch 'main' milik tim saat melakukan merge. Kemampuan Git yang bersih adalah tanda kedewasaan seorang engineer.",
        mistake: "Mengerjakan banyak fitur berbeda dalam satu branch dan satu commit 'update stuff'. Memaksa push (git push -f) ke branch utama tim.",
        interview: "Apa perbedaan antara 'git merge' dan 'git rebase'? Kapan lo HARUS menggunakan merge dan DILARANG menggunakan rebase?",
        code: `# === CLEAN GIT WORKFLOW ===

# 1. Update lokal branch utama
git checkout main
git pull origin main

# 2. Buat branch fitur baru
git checkout -b feat/user-auth

# 3. Kerja, lalu commit dengan pesan semantik
git commit -m "feat: add JWT token generation"

# 4. Kalau branch main di-update orang lain, rebase fitur lo
# Biar history-nya jadi satu garis lurus (linear)
git fetch origin
git rebase origin/main

# 5. Push ke repo dan bikin Pull Request (PR)
git push -u origin feat/user-auth`
      }
    ]
  }
];
