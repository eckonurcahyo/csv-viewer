# CSV Viewer Pro (100% Offline)

Aplikasi web modern untuk melihat, mencari, memfilter, dan mengonversi file CSV menjadi file Microsoft Excel (`.xlsx`) secara **100% offline tanpa koneksi internet**.

Dibangun dengan **Tailwind CSS**, **PapaParse**, dan **SheetJS (XLSX)** dengan seluruh aset tersimpan secara lokal di dalam repositori.

---

## ✨ Fitur Utama

1. **100% Offline & Aman (Zero Internet Requests)**:
   - Tidak ada CDN eksternal (tidak ada cdnjs, unpkg, google fonts, dsb).
   - Seluruh pustaka JavaScript (`papaparse.min.js`, `xlsx.full.min.js`) dan CSS (`tailwind.css`) tersimpan lokal.
   - Font sistem bawaan OS yang cepat, tajam, dan responsif.
   - Data diproses sepenuhnya di browser pengguna (Client-side), tidak ada data yang dikirim ke server luar.

2. **Ekspor ke Excel (.xlsx) dengan Animasi Interaktif**:
   - Fitur download ke format standar Microsoft Excel (`.xlsx`), CSV, JSON, serta salin langsung ke Clipboard (TSV).
   - Pilihan: **Download Data yang Tampil** (sesuai filter & pencarian) atau **Download Seluruh Data**.
   - **Preservasi Angka Berawalan Nol & Barcode Kasir**: Kode internal (PLU), barcode kasir, dan kode artikel (seperti `00320832`, `8992832603929`, `0000000027280`) tidak akan hilang angka nol di depannya dan tidak diubah menjadi notasi ilmiah (`8.99283E+12`) di Excel.
   - Perhitungan lebar kolom Excel otomatis (*auto column-width*) agar data terlihat rapi.
   - Preservasi tipe data angka (*numeric*) untuk kemudahan rumus di Excel.
   - **Animasi Ikon & Progress Download**:
     - Ikon download panah memantul (*downward bounce*).
     - Cincin putar bergradien (*smooth spinning ring*).
     - Indikator progres multi-tahap (Mempersiapkan data ➔ Menyusun worksheet ➔ Format kolom ➔ Unduh file).
     - Animasi goresan centang SVG (*checkmark stroke draw*) saat selesai.

3. **Background Interaktif & Efek Partikel JS (60 FPS)**:
   - Partikel konstelasi responsif canvas HTML5 murni tanpa library eksternal.
   - Interaksi kursor mouse dinamis dengan garis penghubung partikel.
   - Efek ambient glowing orbs yang melayang lembut (*floating glowing orbs*).
   - Seluruh animasi berjalan lancar dan otomatis menyesuaikan tema (Light / Dark).

3. **Dual Tema: Light Mode & Dark Mode**:
   - Mode Terang (*Light Mode*) dengan nuansa bersih, putih & abu-abu terang.
   - Mode Gelap (*Dark Mode*) dengan nuansa slate/zinc kontras tinggi, nyaman di mata.
   - Tombol toggle tema dengan animasi rotasi ikon Matahari (*Sun*) dan Bulan (*Moon*).
   - Preferensi tema disimpan otomatis di `localStorage` dan mendeteksi preferensi sistem secara otomatis.

4. **Animasi Icon pada Proses Loading & Pemrosesan**:
   - Dual cincin pemutar berlawanan arah (*dual spinning rings*).
   - Efek shimmer/kerlip skeleton baris (*skeleton shimmer*).
   - Feedback visual saat proses analisis delimiter dan pemetaan baris CSV.

5. **Eksplorasi Data Tingkat Lanjut**:
   - **Pencarian Global Real-time**: Cari cepat di seluruh kolom sekaligus (`Ctrl + F`).
   - **Pengurutan Kolom (Sorting)**: Klik header kolom untuk urutan Ascending ➔ Descending ➔ Normal (otomatis mendeteksi tipe teks, angka, maupun tanggal).
   - **Visibilitas Kolom (Column Visibility)**: Sembunyikan atau tampilkan kolom tertentu secara dinamis.
   - **Paginasi Cerdas**: Pilihan 10, 15, 25, 50, 100, atau Semua Baris per halaman, navigasi halaman cepat, dan fitur lompat ke halaman (*Jump to Page*).
   - **Statistik KPI Header**: Nama file, ukuran file, total baris, total kolom, jumlah data tersaring, dan delimiter yang terdeteksi (koma `,`, titik koma `;`, tab `\t`, pipe `|`).
   - **Modal Inspeksi Sel (Cell Inspector)**: Klik sel dengan teks panjang untuk melihat detail lengkap dan tombol salin ke clipboard.
   - **Contoh Data Cepat (Sample Data)**: Dilengkapi 3 contoh dataset siap pakai (Data Penjualan, Karyawan, dan Inventaris Gudang).
   - **Fitur Tempel Teks CSV (Paste Text)**: Memungkinkan melihat data CSV tanpa perlu menyimpan ke file terlebih dahulu.

6. **Proteksi Kode Multi-Layer (PHP Obfuscator & Anti-View Source)**:
   - **Server-Side PHP Packer**: File `index.php` dienkripsi dengan teknik kompresi `gzdeflate`, `base64_decode`, dan pengacakan variabel (`$_0O0OO`, `$_l11l1`). Kode sumber mentah tidak terbaca jika dibuka di server atau text editor.
   - **Client-Side Memory Decryption**: Saat dibuka oleh pengguna, browser tidak menerima HTML mentah melainkan string biner terenkripsi XOR + Base64 yang didekripsi langsung di memori RAM browser saat runtime.
   - **Anti-Inspect & Anti-View Source Shield**: Menghalangi klik kanan (*context menu*), shortcut `F12`, `Ctrl + U` (*View Source*), `Ctrl + Shift + I` (*Inspect Element*), dan `Ctrl + S`.
   - **JavaScript Logic Obfuscation**: Skrip logika `app.js` di-obfuscate menjadi `app.min.js` menggunakan *control flow flattening* dan *string array encryption* sehingga struktur algoritma tidak bisa dipelajari atau disalin oleh pihak lain.

---

## 📁 Struktur Direktori

```text
csv-viewer/
├── assets/
│   ├── css/
│   │   └── tailwind.css         # CSS Tailwind v4 yang dikompilasi lokal + custom keyframes
│   ├── js/
│   │   ├── app.js               # Source asli logika aplikasi (untuk pengembangan)
│   │   ├── app.min.js           # Versi ter-obfuscate & enkripsi dari app.js
│   │   ├── papaparse.min.js     # Parser CSV offline (PapaParse v5.5)
│   │   └── xlsx.full.min.js     # Generator & exporter Excel offline (SheetJS)
│   └── samples/
│       ├── employees.csv        # Contoh data karyawan (15 baris)
│       ├── inventory.csv        # Contoh data inventaris gudang (12 baris)
│       └── sales_data.csv       # Contoh data transaksi penjualan (30 baris)
├── src/
│   └── input.css                # Source CSS Tailwind & definisi @keyframes animasi
├── tools/
│   ├── build-protected.js       # Script otomasi build JS Obfuscator + PHP Packer
│   └── obfuscator.php           # Script generator enkripsi PHP & runtime loader
├── index.html                   # Source HTML utama (untuk pengembangan)
├── index.php                    # Versi terenkripsi & ter-obfuscate penuh (untuk produksi)
├── package.json                 # Konfigurasi npm build scripts
└── README.md                    # Dokumentasi proyek
```

---

## 🚀 Cara Menjalankan

Aplikasi ini dapat dijalankan dengan beberapa cara mudah:

### Opsi 1: Lewat Web Server XAMPP (Versi Terenkripsi & Terlindungi)
Akses melalui Apache XAMPP:
```
http://localhost/csv-viewer/
```
*(Secara default Apache akan langsung memprioritaskan dan menjalankan `index.php` yang terenkripsi dan terlindungi).*

### Opsi 2: Buka Langsung File HTML (Versi Source Asli)
Anda juga dapat langsung membuka file `index.html` di File Explorer untuk keperluan pengembangan.

---

## 🛠️ Build & Proteksi Kode

Jika Anda melakukan perubahan pada `index.html` atau `assets/js/app.js`, Anda dapat mengompilasi ulang enkripsi proteksi dengan satu perintah:

```bash
# Mengompilasi Tailwind CSS (jika ada class baru)
npm run build:css

# Menjalankan Enkripsi & Obfuscation Lengkap (JS Obfuscator + PHP Packer)
npm run build:protect
```

---

## 🔒 Privasi & Keamanan
- Tidak ada analitik pihak ketiga.
- Tidak ada font Google Fonts atau skrip CDN yang dapat melacak pengguna.
- File CSV Anda tidak pernah meninggalkan komputer Anda.

