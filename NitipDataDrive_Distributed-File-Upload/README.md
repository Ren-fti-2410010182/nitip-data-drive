# 📦 Nitip Data Drive

> Sistem manajemen & berbagi berkas terdistribusi berbasis web dengan autentikasi pengguna bertingkat (Admin/User), sistem persetujuan akun, pengelolaan folder hierarkis, dan antarmuka modern premium.

---

## 🗂️ Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Diagram Arsitektur](#diagram-arsitektur)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Folder & File](#struktur-folder--file)
- [Modul & Komponen](#modul--komponen)
- [Struktur Database](#struktur-database)
- [API Endpoint](#api-endpoint)
- [Alur Pembuatan Proyek](#alur-pembuatan-proyek)
- [Alur Pemakaian Aplikasi](#alur-pemakaian-aplikasi)
- [Cara Menjalankan](#cara-menjalankan)
- [Troubleshooting](#troubleshooting)

---

## Gambaran Umum

**Nitip Data Drive** adalah aplikasi web file-sharing yang memungkinkan pengguna mengunggah, mengunduh, menyusun (dalam folder), serta mengelola berkas mereka. Sistem ini dilengkapi dengan:

- 🔐 Autentikasi berbasis **Bearer Token** (in-memory session)
- 👥 Dua peran: **Admin** dan **User**
- ✅ Sistem **approval akun** — user baru perlu disetujui admin
- 📁 **Folder hierarkis** — buat, rename, hapus folder & subfolder
- 🗑️ **Rename & Delete** berkas oleh pemilik maupun admin
- 🔒 **Pemblokiran realtime** — akun dinonaktifkan admin → user langsung terblokir
- 🎨 Antarmuka **glassmorphic premium** dengan animasi halus

---

## Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  login.html  │  │  user.html   │  │   admin.html     │  │
│  │  login.css   │  │  user.css    │  │   admin.css      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                   │             │
│         └─────────────────┴───────────────────┘             │
│                           │  Fetch API / XHR                │
│                    global.css  +  global-functions.js       │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP (port 3000)
┌───────────────────────────▼─────────────────────────────────┐
│                    NODE.JS HTTP SERVER                       │
│                       server/src/app.js                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   REQUEST HANDLER                    │   │
│  │  OPTIONS → CORS  |  /api/* → Router  |  /* → Static │   │
│  └────────────────────────┬─────────────────────────────┘   │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐               │
│         ▼                 ▼                 ▼               │
│   authRoutes.js     fileRoutes.js     userRoutes.js         │
│         │                 │                 │               │
│         ▼                 ▼                 ▼               │
│  authController   fileController     userController         │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           │                                 │
│              ┌────────────┼───────────────┐                 │
│              ▼            ▼               ▼                 │
│         middleware/    config/          utils/              │
│          auth.js      database.js    httpUtils.js           │
│        (sessions{})   (MySQL Pool)   multipartParser.js     │
└───────────────────────────┼─────────────────────────────────┘
                            │ mysql npm package
┌───────────────────────────▼─────────────────────────────────┐
│                     MySQL DATABASE                           │
│                   nitip_data_drive                           │
│                                                             │
│    ┌─────────────┐            ┌──────────────────┐          │
│    │    users    │────────────│      files       │          │
│    │  id,username│  user_id   │ id,original_name │          │
│    │  role,status│  (FK)      │ stored_name      │          │
│    └─────────────┘            │ mime_type, size  │          │
│                               │ parent_folder_id │          │
│                               └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              server/src/uploads/  (File Storage)             │
│         {timestamp}_{randomhash}_{safeFilename}              │
└─────────────────────────────────────────────────────────────┘
```

---

## Teknologi yang Digunakan

| Lapisan | Teknologi | Keterangan |
|---|---|---|
| **Runtime** | Node.js (LTS) | Engine server JavaScript |
| **HTTP Server** | `http` (built-in) | Tanpa Express, routing manual |
| **Database** | MySQL 5.7+ / MariaDB 10.3+ | Penyimpanan data pengguna & metadata berkas |
| **DB Driver** | `mysql` npm v2.18.1 | Pool koneksi ke MySQL |
| **Kriptografi** | `crypto` (built-in) | SHA-256 hash password, token sesi acak |
| **File System** | `fs`, `path` (built-in) | Simpan/hapus berkas fisik |
| **Frontend** | HTML5 + Vanilla CSS + Vanilla JS | Tanpa framework |
| **Font** | Google Fonts — Outfit & Inter | Tipografi premium |
| **Desain** | Glassmorphism + CSS Variables | Sistem token warna global |
| **Upload** | `XMLHttpRequest` + multipart | Progress bar realtime |

---

## Struktur Folder & File

```
NitipDataDrive_Distributed-File-Upload/
│
├── package.json                     # Konfigurasi NPM & dependensi
├── README.md                        # Dokumentasi proyek (file ini)
├── FEATURE_SUMMARY.md               # Ringkasan fitur yang ditambahkan
│
├── public/                          # ── FRONTEND (file statis) ──
│   ├── views/
│   │   ├── login.html               # Halaman login & registrasi
│   │   ├── user.html                # Dashboard pengguna (drive pribadi)
│   │   └── admin.html               # Panel admin (manajemen user & file)
│   │
│   ├── styles/
│   │   ├── global.css               # CSS variables, reset, komponen global
│   │   ├── login.css                # Tema glassmorphic halaman login
│   │   ├── user.css                 # Layout sidebar + grid kartu berkas
│   │   └── admin.css                # Layout SaaS dashboard admin
│   │
│   └── scripts/
│       ├── global-functions.js      # Helper: authHeader, formatSize, showAlert
│       ├── main.js                  # Entry script (reserved)
│       └── admin/                   # Script admin (legacy, sudah inline)
│
└── server/                          # ── BACKEND (Node.js) ──
    ├── README.md
    ├── backup/
    │   └── nitip_data_drive.sql     # Schema database + data admin awal
    │
    └── src/
        ├── app.js                   # Entry point: HTTP server + routing utama
        │
        ├── config/
        │   └── database.js          # Pool koneksi MySQL (promise wrapper)
        │
        ├── middleware/
        │   └── auth.js              # Manajemen sesi in-memory (Bearer token)
        │
        ├── controllers/
        │   ├── authController.js    # login, register, logout, checkStatus
        │   ├── fileController.js    # upload, list, download, delete, rename, folder
        │   └── userController.js    # listUsers, approve, reject, delete, update, toggle
        │
        ├── routes/
        │   ├── authRoutes.js        # /api/auth/*
        │   ├── fileRoutes.js        # /api/files/*
        │   └── userRoutes.js        # /api/users/*
        │
        ├── utils/
        │   ├── httpUtils.js         # sendJSON, readBody, serveStaticFile
        │   └── multipartParser.js   # Custom parser multipart/form-data
        │
        ├── uploads/                 # Penyimpanan berkas fisik (auto-created)
        └── test_mysql_connect.js    # Script uji koneksi DB
```

---

## Modul & Komponen

### Backend

#### `app.js` — Orchestrator Utama
Entry point HTTP server. Menerima semua request, menangani CORS preflight, meneruskan ke router yang sesuai, dan menyajikan berkas statis dari `public/`.

#### `middleware/auth.js` — Manajemen Sesi
```
sessions = {}  →  { [token]: { userId, username, role, createdAt } }
```
- `createSession(user)` — buat token 64-char hex acak
- `validateSession(req)` — validasi Bearer token dari header
- `destroySession(req)` — hapus satu sesi (logout)
- `destroySessionsByUserId(id)` — hapus semua sesi user (pemblokiran paksa)

#### `config/database.js` — Koneksi MySQL
Pool koneksi 10 koneksi maksimum dengan helper `db.query(sql, params)` berbasis Promise.

#### `controllers/authController.js`
| Fungsi | Keterangan |
|---|---|
| `login` | Verifikasi username+password (SHA-256), buat sesi |
| `register` | Daftarkan user baru (status `pending`) atau langsung aktif jika admin |
| `logout` | Hapus sesi dari memori |
| `checkStatus` | Polling 10 detik dari frontend — validasi sesi & status DB |

#### `controllers/fileController.js`
| Fungsi | Keterangan |
|---|---|
| `uploadFile` | Terima multipart, simpan ke `uploads/`, catat metadata ke DB |
| `listFiles` | List file/folder berdasarkan `parent_folder_id` & `user_id` |
| `downloadFile` | Stream berkas fisik ke browser |
| `deleteFile` | Hapus berkas/folder (rekursif untuk folder) dari disk & DB |
| `createFolder` | Buat entri folder di DB (tanpa berkas fisik) |
| `renameItem` | Update `original_name` di DB (hanya pemilik/admin) |

#### `controllers/userController.js`
| Fungsi | Keterangan |
|---|---|
| `listUsers` | Ambil semua user (admin only), support filter status |
| `approveUser` | Ubah status `pending` → `active` |
| `rejectUser` | Ubah status `pending` → `rejected` |
| `deleteUser` | Hapus akun + invalidasi sesi |
| `toggleStatus` | Toggle `active` ↔ `disabled` |
| `updateUser` | Update username, email, atau status |

#### `utils/httpUtils.js`
- `sendJSON(res, status, data)` — kirim JSON dengan header anti-cache
- `readBody(req)` — baca body request sebagai Buffer
- `serveStaticFile(res, path)` — sajikan berkas statis dengan MIME type otomatis

#### `utils/multipartParser.js`
Custom parser `multipart/form-data` tanpa library eksternal. Mengekstrak `fileName`, `mimeType`, dan `fileData` dari boundary buffer.

---

### Frontend

#### `public/styles/global.css`
Sistem desain terpusat:
- CSS Variables (warna, radius, shadow, font)
- Google Fonts: Outfit + Inter
- Scrollbar tipis kustom
- Komponen: `.btn`, `.form-control`, `.badge`, `.alert`
- Modal overlay: `.view-modal-overlay` + `.show` transition
- Toast notification: `.toast-container`, `.toast`, `.toast-success`, `.toast-error`

#### `public/views/login.html`
- Latar radial-gradient nebula gelap (glassmorphism)
- Panel login + panel registrasi (toggle)
- Validasi form: username, password, email, konfirmasi password

#### `public/views/user.html`
- Sidebar: brand, tombol upload & buat folder, navigasi, logout
- Breadcrumb navigasi folder hierarkis
- Grid kartu berkas: ikon/thumbnail, nama, ukuran, tanggal, tombol aksi
- Modal: Pratinjau file, Buat Folder, Ubah Nama, Konfirmasi Hapus
- Toast notification + polling status akun (10 detik)
- Drag & drop upload + progress bar XHR

#### `public/views/admin.html`
- SaaS Dashboard sidebar + header
- Tab: Manajemen Pengguna | Manajemen Berkas
- Tabel pengguna: status badge, dropdown status, tombol aksi
- Tabel berkas: pratinjau, unduh, hapus
- Modal: Edit Pengguna, Konfirmasi Aksi, Pratinjau Berkas
- Toast notification sistem

---

## Struktur Database

### Tabel `users`
```sql
CREATE TABLE `users` (
  `id`          int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`    varchar(50)  NOT NULL,
  `password`    varchar(64)  NOT NULL COMMENT 'SHA-256 hex hash',
  `email`       varchar(100) NOT NULL,
  `role`        enum('admin','user') NOT NULL DEFAULT 'user',
  `status`      enum('active','pending','rejected','disabled') NOT NULL DEFAULT 'pending',
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at`  timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_username` (`username`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Tabel `files`
```sql
CREATE TABLE `files` (
  `id`               int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `original_name`    varchar(255) NOT NULL,
  `stored_name`      varchar(100) NOT NULL COMMENT '{timestamp}_{hash}_{name}',
  `file_size`        bigint(20) UNSIGNED NOT NULL,
  `mime_type`        varchar(100) NOT NULL,
  `user_id`          int(10) UNSIGNED NOT NULL,
  `uploaded_at`      timestamp NOT NULL DEFAULT current_timestamp(),
  `is_folder`        tinyint(1) NOT NULL DEFAULT 0,
  `parent_folder_id` int(10) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stored_name` (`stored_name`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Relasi Antar Tabel
```
users (1) ──────────── (N) files
              user_id

files (1) ──────────── (N) files
         parent_folder_id   [folder hierarki rekursif]
```

### Akun Admin Default
```
username : admin
password : admin123
hash     : 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
```

---

## API Endpoint

### Autentikasi (`/api/auth`)
| Method | Endpoint | Auth? | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/login` | ✗ | Login, dapat token Bearer |
| POST | `/api/auth/register` | ✗ | Registrasi (status pending) |
| POST | `/api/auth/logout` | ✓ | Hapus sesi |
| GET | `/api/auth/status` | ✓ | Cek status akun realtime |

### Manajemen Berkas (`/api/files`)
| Method | Endpoint | Auth? | Deskripsi |
|---|---|---|---|
| POST | `/api/files/upload?parent_id=` | ✓ | Upload berkas (multipart) |
| GET | `/api/files?parent_id=` | ✓ | List berkas/folder |
| GET | `/api/files/download?id=` | ✓ | Download berkas |
| POST | `/api/files/folder` | ✓ | Buat folder baru |
| PUT | `/api/files/rename` | ✓ | Ubah nama berkas/folder |
| DELETE | `/api/files?id=` | ✓ | Hapus berkas/folder (rekursif) |

### Manajemen Pengguna (`/api/users`) — Admin Only
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/users` | Daftar semua pengguna |
| POST | `/api/users/approve?id=` | Setujui akun pending |
| POST | `/api/users/reject?id=` | Tolak akun pending |
| POST | `/api/users/toggle-status?id=` | Toggle active/disabled |
| POST | `/api/users/update?id=` | Update data pengguna |
| DELETE | `/api/users?id=` | Hapus akun permanen |

---

## Alur Pembuatan Proyek

```
Tahap 1: Perencanaan
  └── Analisis kebutuhan: upload/download + auth bertingkat
  └── Pilih teknologi: Node.js native + MySQL + Vanilla JS
  └── Desain struktur folder modular (MVC-like)

Tahap 2: Database
  └── Desain tabel users (role, status workflow)
  └── Desain tabel files (metadata + stored_name unik)
  └── Tambah kolom is_folder & parent_folder_id (folder hierarkis)
  └── Export SQL ke server/backup/

Tahap 3: Backend Core
  └── app.js: HTTP server + manual routing
  └── database.js: pool koneksi + promise wrapper
  └── auth.js: in-memory session management
  └── httpUtils.js: sendJSON, readBody, serveStaticFile
  └── multipartParser.js: custom boundary parser

Tahap 4: API Controllers & Routes
  └── authController: login/register/logout/checkStatus
  └── fileController: upload/list/download/delete/rename/folder
  └── userController: list/approve/reject/delete/toggle/update
  └── authRoutes / fileRoutes / userRoutes: pemetaan endpoint

Tahap 5: Frontend
  └── global.css: design system, CSS variables, komponen dasar
  └── login.html + login.css: glassmorphic auth page
  └── user.html + user.css: drive dashboard + breadcrumb + grid
  └── admin.html + admin.css: SaaS admin panel

Tahap 6: Fitur Lanjutan
  └── Folder hierarkis: navigasi breadcrumb rekursif
  └── Rename & delete berkas (user + admin)
  └── Polling realtime status akun (10 detik)
  └── Custom modal & toast (ganti confirm() bawaan browser)
  └── Drag & drop upload + progress bar XHR

Tahap 7: Polish UI Premium
  └── Glassmorphism login card + nebula background
  └── Font Outfit + Inter via Google Fonts
  └── Kustom scrollbar tipis & focus ring
  └── Animasi CSS: fade, slide, bounce, scale transitions
  └── Anti-cache header pada sendJSON
```

---

## Alur Pemakaian Aplikasi

### Alur Pengguna Baru (User)

```
1. Buka http://localhost:3000
        ↓
2. Klik "Daftar di sini" di halaman Login
        ↓
3. Isi username, email, password → Submit
        ↓
4. Status akun: PENDING (menunggu approval admin)
        ↓
5. Admin login → Panel Admin → Tab Pengguna
        ↓
6. Klik ✓ (Setujui) pada baris user yang menunggu
        ↓
7. Status akun berubah: ACTIVE
        ↓
8. User dapat login dan mengakses drive
```

### Alur Upload & Kelola Berkas

```
User login → Dashboard Drive
        ↓
[Upload File]
  Klik "Unggah File" atau drag & drop berkas ke jendela
        ↓
  Progress bar muncul → berkas tersimpan di server/uploads/
        ↓
  Kartu berkas muncul di grid dengan thumbnail (untuk gambar)

[Buat Folder]
  Klik "Buat Folder" → isi nama → Buat
        ↓
  Folder muncul di grid → klik "Buka" untuk masuk
        ↓
  Breadcrumb diperbarui otomatis: Drive Saya > Folder A > ...

[Rename Berkas/Folder]
  Klik tombol ✏️ pada kartu → Modal Ubah Nama muncul
        ↓
  Ketik nama baru → Ubah → Toast "Nama berhasil diubah"

[Hapus Berkas/Folder]
  Klik tombol 🗑️ → Dialog konfirmasi muncul
        ↓
  Konfirmasi → Berkas/folder dihapus dari disk & database
  (folder: semua isi dihapus rekursif)

[Pratinjau & Unduh]
  Klik "👁 Lihat" → Modal pratinjau terbuka (gambar/PDF/teks)
  Klik "⬇ Unduh" → Browser mengunduh berkas
```

### Alur Admin — Kelola Pengguna

```
Admin login → Panel Admin → Tab Pengguna
        ↓
Tabel menampilkan semua pengguna dengan status badge

[Setujui/Tolak Pendaftar]
  Pengguna berstatus "Menunggu" → Klik ✓ (Setujui) atau ✕ (Tolak)
        ↓
  Dialog konfirmasi kustom → Ya, Lanjutkan → Toast konfirmasi

[Nonaktifkan/Aktifkan Akun]
  Dropdown status pada baris pengguna → Pilih "Nonaktif"
        ↓
  Backend: sesi pengguna dihancurkan di memori server
        ↓
  Pengguna yang sedang login → dalam 10 detik → layar blokir penuh
        ↓ 
  Redirect otomatis ke login setelah 5 detik

[Edit Data Pengguna]
  Klik ✏️ → Modal Edit → ubah username/email → Simpan

[Hapus Pengguna]
  Klik 🗑️ → Dialog konfirmasi (peringatan data permanen) → Hapus
        ↓
  Semua file milik pengguna juga dihapus (CASCADE DB)
```

### Alur Admin — Kelola Berkas

```
Admin login → Panel Admin → Tab Berkas
        ↓
Tabel menampilkan semua berkas dan folder tingkat utama dari semua pengguna

[Pratinjau] → Klik 👁  → Modal pratinjau (khusus berkas)
[Unduh]     → Klik ⬇  → Download berkas (khusus berkas)
[Hapus]     → Klik 🗑️ → Dialog konfirmasi → Hapus dari disk & DB (berkas & folder rekursif)
```

---

## Cara Menjalankan

### Prasyarat
- Node.js v16+ (LTS)
- MySQL 5.7+ atau MariaDB 10.3+
- XAMPP / Laragon / MySQL standalone

### Langkah Instalasi

**1. Siapkan Database**
```sql
-- Di MySQL client atau phpMyAdmin:
CREATE DATABASE nitip_data_drive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
```bash
# Import schema + data admin:
mysql -u root nitip_data_drive < server/backup/nitip_data_drive.sql
```

**2. Konfigurasi Koneksi (opsional)**

Edit `server/src/config/database.js` jika konfigurasi berbeda dari default:
```js
host: 'localhost',
port: 3306,
user: 'root',
password: '',          // ← sesuaikan
database: 'nitip_data_drive'
```

**3. Install Dependensi**
```bash
npm install
```

**4. Jalankan Server**
```bash
npm start
```
Output: `Nitip Data Drive Server aktif: http://localhost:3000`

**5. Akses Aplikasi**

| URL | Keterangan |
|---|---|
| `http://localhost:3000` | Redirect otomatis ke login |
| `http://localhost:3000/views/login.html` | Halaman login & registrasi |
| `http://localhost:3000/views/user.html` | Dashboard user (butuh login) |
| `http://localhost:3000/views/admin.html` | Panel admin (butuh login admin) |

**Akun admin default:**
```
Username : admin
Password : admin123
```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Port 3000 sudah terpakai | Jalankan `set PORT=3001 && npm start` atau ubah `.env` |
| Gagal koneksi MySQL | Cek `database.js` — host, user, password, nama database |
| Upload gagal | Pastikan `server/src/uploads/` ada dan writable |
| Berkas > 50MB ditolak | Batas maksimal 50MB per berkas (konfigurasi di `fileController.js`) |
| Tipe file ditolak | Hanya: image/\*, PDF, text, CSV, ZIP, DOCX, XLSX |
| Login gagal setelah restart server | Session in-memory hilang saat restart — login ulang |
| Berkas tidak terhapus dari disk | Cek apakah `stored_name` di DB cocok dengan file di `uploads/` |
| Admin tidak bisa hapus diri sendiri | Proteksi by design — admin tidak dapat hapus akun aktifnya sendiri |

---

## Catatan Teknis

- **Session Storage**: In-memory (`sessions = {}`) — tidak persisten. Seluruh sesi hilang saat server restart.
- **Password Hashing**: SHA-256 (tanpa salt). Untuk produksi, disarankan upgrade ke bcrypt.
- **File Naming**: `{timestamp}_{4-byte-hex}_{sanitized-name}` — mencegah konflik nama.
- **CORS**: Aktif untuk semua origin (`*`) — cocok untuk development, batasi di produksi.
- **Anti-Cache**: Semua respon JSON memiliki header `Cache-Control: no-store` agar data selalu segar.
- **Folder Rekursif**: Hapus folder akan menghapus seluruh isi termasuk subfolder berlapis tanpa batas kedalaman.
