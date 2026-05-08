# server/ — Backend Nitip Data Drive

Folder `server/` berisi seluruh kode backend aplikasi Nitip Data Drive yang berjalan di Node.js.

---

## Struktur Folder

```
server/
├── README.md           # Dokumentasi ini
├── backup/
│   └── nitip_data_drive.sql   # Schema database lengkap + data admin awal
└── src/
    └── ...             # Lihat server/src/README.md untuk detail lengkap
```

---

## Cara Menjalankan

Dari root project:

```bash
npm start
```

Server berjalan di `http://localhost:3000` (atau port dari env `PORT`).

Entry point: `server/src/app.js`

---

## Konfigurasi Database

Edit `server/src/config/database.js` untuk menyesuaikan koneksi MySQL:

```js
host     : 'localhost',
port     : 3306,
user     : 'root',
password : '',                  // ← sesuaikan jika ada password
database : 'nitip_data_drive',
```

---

## Setup Database (Pertama Kali)

```sql
-- Buat database
CREATE DATABASE nitip_data_drive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
-- Import schema + akun admin awal
mysql -u root nitip_data_drive < server/backup/nitip_data_drive.sql
```

**Akun admin default:** `admin` / `admin123`

---

## Catatan Penting

| Hal | Keterangan |
|---|---|
| **Penyimpanan berkas** | Berkas fisik disimpan di `server/src/uploads/` dengan nama unik `{timestamp}_{hash}_{nama}` |
| **Session** | Disimpan di memori (`sessions = {}`) — **hilang saat server restart**, semua pengguna perlu login ulang |
| **Static files** | `app.js` menyajikan folder `public/` yang berada dua level di atas (`../../public`) |
| **Uji koneksi DB** | Jalankan `node server/src/test_mysql_connect.js` untuk memverifikasi koneksi MySQL |
