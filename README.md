# Nitip Data Drive

Sistem upload/download berkas terdistribusi sederhana dengan autentikasi pengguna.

## Analisis Struktur Proyek

### Arsitektur Aplikasi
Aplikasi ini menggunakan arsitektur **client-server** dengan pemisahan yang jelas antara frontend dan backend:

- **Frontend**: HTML/CSS/JavaScript vanilla (tanpa framework) yang disajikan sebagai file statis.
- **Backend**: Node.js dengan HTTP server built-in, tanpa Express.js untuk kesederhanaan.
- **Database**: MySQL dengan pool koneksi untuk performa.
- **Autentikasi**: Token Bearer dengan session in-memory (hilang saat server restart).

### Struktur Folder dan File

```
NitipDataDrive_Distributed-File-Upload/
├── package.json                 # Konfigurasi NPM dan dependensi
├── README.md                    # Dokumentasi proyek ini
├── public/                      # Frontend - file statis untuk browser
│   ├── views/                   # Halaman HTML utama
│   │   ├── login.html           # Halaman login dan registrasi
│   │   ├── user.html            # Dashboard pengguna biasa
│   │   └── admin.html           # Dashboard admin
│   ├── styles/                  # CSS untuk styling
│   │   ├── global.css           # Style global dan komponen dasar
│   │   ├── login.css            # Style khusus halaman login
│   │   ├── user.css             # Style khusus dashboard user
│   │   └── admin.css            # Style khusus dashboard admin
│   ├── scripts/                 # JavaScript frontend
│   │   ├── main.js              # Script umum (belum digunakan)
│   │   ├── global-functions.js  # Fungsi helper global
│   │   └── admin/               # Script khusus admin
│   │       ├── auth.js          # Autentikasi admin
│   │       └── manage-users.js  # Manajemen pengguna
│   └── assets/                  # (Kosong - untuk gambar/icon di masa depan)
├── server/                      # Backend - kode server Node.js
│   ├── README.md                # Dokumentasi folder server
│   ├── backup/                  # Backup database dan schema
│   │   ├── README.md            # Dokumentasi backup
│   │   └── nitip_data_drive.sql # Schema lengkap dengan data awal
│   └── src/                     # Kode sumber backend
│       ├── README.md            # Dokumentasi src
│       ├── app.js               # Entry point server HTTP
│       ├── config/              # Konfigurasi aplikasi
│       │   ├── README.md        # Dokumentasi config
│       │   └── database.js      # Pool koneksi MySQL
│       ├── controllers/         # Logika bisnis per domain
│       │   ├── README.md        # Dokumentasi controllers
│       │   ├── authController.js    # Login, register, logout
│       │   ├── fileController.js    # Upload, download, hapus file
│       │   └── userController.js    # Manajemen pengguna (admin)
│       ├── middleware/          # Middleware autentikasi
│       │   ├── README.md        # Dokumentasi middleware
│       │   └── auth.js          # Validasi token dan sesi
│       ├── routes/              # Router API per domain
│       │   ├── README.md        # Dokumentasi routes
│       │   ├── authRoutes.js    # Route autentikasi
│       │   ├── fileRoutes.js    # Route file management
│       │   └── userRoutes.js    # Route user management
│       ├── utils/               # Helper utilities
│       │   ├── README.md        # Dokumentasi utils
│       │   ├── httpUtils.js     # Helper HTTP response/JSON
│       │   └── multipartParser.js # Parser multipart/form-data
│       ├── uploads/             # Penyimpanan file upload
│       │   └── README.md        # Dokumentasi uploads
│       └── test_mysql_connect.js # Script test koneksi DB
└── node_modules/                # Dependensi NPM (tergenerate)
```

### Komponen Utama yang Digunakan

#### Backend (Node.js)
- **Runtime**: Node.js (versi LTS, tanpa framework seperti Express)
- **HTTP Server**: Built-in `http` module untuk kesederhanaan
- **Database**: MySQL dengan `mysql` package (pool koneksi)
- **File System**: Built-in `fs` dan `path` untuk upload/download
- **Security**: SHA-256 untuk hash password, Bearer token untuk autentikasi
- **Parsing**: Custom multipart parser untuk upload file

#### Frontend (Vanilla JavaScript)
- **HTML**: Struktur halaman dengan semantic elements
- **CSS**: Custom styling dengan CSS variables untuk konsistensi
- **JavaScript**: Vanilla JS dengan Fetch API untuk AJAX
- **UI/UX**: Responsive design dengan flexbox/grid

#### Database (MySQL)
- **Engine**: InnoDB untuk ACID compliance
- **Charset**: UTF8MB4 untuk dukungan Unicode penuh
- **Indexing**: Primary keys, unique constraints, foreign keys

### Alur Kerja Tahapan Pembuatan

#### Tahap 1: Perencanaan dan Setup
1. **Analisis Kebutuhan**: Sistem upload/download dengan autentikasi user/admin
2. **Pemilihan Teknologi**: Node.js + MySQL untuk backend, Vanilla JS untuk frontend
3. **Setup Proyek**: Inisialisasi NPM, struktur folder modular

#### Tahap 2: Database Design
1. **Tabel Users**: id, username, password (hash), email, role, status, timestamps
2. **Tabel Files**: id, original_name, stored_name, file_size, mime_type, user_id, uploaded_at
3. **Relasi**: Files.user_id → Users.id (foreign key dengan CASCADE)
4. **Indexing**: Primary keys, unique constraints untuk username/email

#### Tahap 3: Backend Development
1. **Entry Point (app.js)**: HTTP server dengan routing manual
2. **Database Connection**: Pool koneksi MySQL dengan error handling
3. **Authentication**: Middleware untuk validasi token Bearer
4. **Controllers**: Logika bisnis terpisah per domain (auth, file, user)
5. **Routes**: Pemetaan endpoint API ke controllers
6. **Utils**: Helper untuk HTTP response dan multipart parsing

#### Tahap 4: Frontend Development
1. **HTML Structure**: Halaman login, user dashboard, admin panel
2. **CSS Styling**: Global styles dengan CSS variables, responsive design
3. **JavaScript Logic**: AJAX dengan Fetch API, form handling, file upload
4. **UI Components**: Modal untuk preview file, progress bar upload

#### Tahap 5: Integrasi dan Testing
1. **API Integration**: Frontend memanggil backend API
2. **File Upload**: Multipart form-data dengan progress tracking
3. **Security**: Validasi akses file (hanya uploader/admin)
4. **Error Handling**: Client dan server-side validation

#### Tahap 6: Deployment dan Dokumentasi
1. **Setup Instructions**: README dengan langkah instalasi
2. **Database Migration**: SQL scripts untuk setup awal
3. **Folder Documentation**: README di setiap folder penting

## Struktur Database

Database `nitip_data_drive` menggunakan MySQL dengan dua tabel utama:

### Tabel `users`
```sql
CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(64) NOT NULL COMMENT 'SHA-256 hash dari password',
  `email` varchar(100) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `status` enum('active','pending','rejected','disabled') NOT NULL DEFAULT 'pending',
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_username` (`username`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Penjelasan Kolom:**
- `id`: Primary key auto-increment
- `username`: Nama pengguna unik (3-50 karakter)
- `password`: Hash SHA-256 dari password (64 karakter hex)
- `email`: Email unik untuk notifikasi/verifikasi
- `role`: 'admin' atau 'user' (default 'user')
- `status`: Status akun ('active', 'pending', 'rejected', 'disabled')
- `approved_at`: Timestamp approval admin (NULL jika belum approved)
- `created_at`: Timestamp pembuatan akun

**Data Awal:**
```sql
INSERT INTO `users` VALUES 
(1, 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin@nitipdata.local', 'admin', 'active', NULL, '2026-05-03 06:35:05');
```
Password admin default: `admin123` (hashed).

### Tabel `files`
```sql
CREATE TABLE `files` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `original_name` varchar(255) NOT NULL COMMENT 'Nama file asli dari pengguna',
  `stored_name` varchar(100) NOT NULL COMMENT 'Nama file di disk (unik, hasil hash)',
  `file_size` bigint(20) UNSIGNED NOT NULL COMMENT 'Ukuran file dalam byte',
  `mime_type` varchar(100) NOT NULL COMMENT 'Tipe MIME file',
  `user_id` int(10) UNSIGNED NOT NULL COMMENT 'FK ke tabel users',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stored_name` (`stored_name`),
  KEY `fk_files_user` (`user_id`),
  CONSTRAINT `fk_files_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Penjelasan Kolom:**
- `id`: Primary key auto-increment
- `original_name`: Nama file asli dari user (maks 255 karakter)
- `stored_name`: Nama file di disk (unik, format: timestamp_randomhash_originalname)
- `file_size`: Ukuran file dalam byte (bigint untuk file besar)
- `mime_type`: Tipe MIME (contoh: 'image/jpeg', 'application/pdf')
- `user_id`: Foreign key ke users.id (CASCADE delete/update)
- `uploaded_at`: Timestamp upload otomatis

**Relasi:**
- `files.user_id` → `users.id` (one-to-many: satu user banyak file)
- Foreign key constraint memastikan integritas data

## Cara Menjalankan

1. **Setup Database**:
   ```bash
   # Buat database MySQL
   CREATE DATABASE nitip_data_drive;
   
   # Import schema dan data awal
   mysql -u root nitip_data_drive < server/backup/nitip_data_drive.sql
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Server**:
   ```bash
   npm start
   ```

4. **Akses Aplikasi**:
   - Buka browser ke `http://localhost:3000`
   - Login dengan admin: `admin` / `admin123`
   - Atau daftar akun baru (perlu approval admin)

## API Endpoint Utama

### Autentikasi
- `POST /api/auth/login` - Login pengguna
- `POST /api/auth/register` - Registrasi pengguna baru
- `POST /api/auth/logout` - Logout pengguna

### File Management
- `POST /api/files/upload` - Upload file (multipart/form-data)
- `GET /api/files` - Daftar file (filtered by user/admin)
- `GET /api/files/download?id=<id>` - Download file
- `DELETE /api/files?id=<id>` - Hapus file (admin only)

### User Management (Admin Only)
- `GET /api/users` - Daftar semua pengguna
- `POST /api/users/approve?id=<id>` - Approve pending user
- `POST /api/users/reject?id=<id>` - Reject pending user
- `POST /api/users/toggle-status?id=<id>` - Toggle active/disabled
- `POST /api/users/update?id=<id>` - Update user data
- `DELETE /api/users?id=<id>` - Hapus pengguna

## Fitur Utama

- ✅ Autentikasi user/admin dengan token Bearer
- ✅ Upload file multipart/form-data (max 50MB)
- ✅ Validasi tipe file (image, PDF, text, ZIP, Office docs)
- ✅ Daftar dan unduh file dengan preview
- ✅ Kontrol akses: hanya uploader/admin bisa akses file
- ✅ Admin approval untuk registrasi user baru
- ✅ Manajemen pengguna (approve/reject/toggle/delete)
- ✅ Responsive UI dengan tema biru/hijau
- ✅ Progress bar upload dengan drag & drop
- ✅ Modal preview file dengan thumbnail

## Catatan Penting

- **Session Management**: Session disimpan di memori server (hilang saat restart)
- **File Storage**: File fisik di `server/uploads/`, metadata di database
- **Security**: SHA-256 password hash, token-based auth, file access control
- **Database**: Gunakan MySQL 5.7+ atau MariaDB 10.3+ untuk dukungan penuh
- **Port**: Default port 3000, dapat diubah dengan env PORT
- **CORS**: Enabled untuk development (origin: *)
- **File Limits**: Max 50MB per file, tipe MIME terbatas untuk keamanan

## Troubleshooting

### Server Tidak Start
- Pastikan port 3000 tidak digunakan process lain
- Cek koneksi MySQL di `server/src/config/database.js`
- Verifikasi database `nitip_data_drive` sudah dibuat

### Upload Gagal
- Cek folder `server/uploads/` ada dan writable
- Pastikan file size < 50MB
- Cek tipe MIME diizinkan

### Login Gagal
- Pastikan user status = 'active'
- Cek password hash di database
- Verifikasi token format di request header

### Database Error
- Jalankan ulang SQL import
- Cek privileges user MySQL
- Pastikan charset UTF8MB4

