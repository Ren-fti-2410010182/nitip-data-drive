# server/src — Kode Sumber Backend

Folder `server/src/` adalah **kode sumber backend** aplikasi Nitip Data Drive yang berjalan di Node.js.

---

## Struktur Folder

```
server/src/
├── app.js                  # Entry point: HTTP server + router utama + static file serving
├── test_mysql_connect.js   # Skrip bantu untuk menguji koneksi MySQL secara manual
│
├── config/
│   └── database.js         # Pool koneksi MySQL (promise-based query wrapper)
│
├── middleware/
│   └── auth.js             # Manajemen sesi in-memory: create, validate, destroy session
│
├── controllers/
│   ├── authController.js   # Login, register, logout, checkStatus
│   ├── fileController.js   # Upload, list, download, folder, rename, delete (rekursif)
│   └── userController.js   # Manajemen pengguna: approve, reject, toggle, update, delete
│
├── routes/
│   ├── authRoutes.js       # Pemetaan /api/auth/* ke authController
│   ├── fileRoutes.js       # Pemetaan /api/files/* ke fileController
│   └── userRoutes.js       # Pemetaan /api/users/* ke userController
│
├── utils/
│   ├── httpUtils.js        # sendJSON, readBody, serveStaticFile
│   └── multipartParser.js  # Custom parser multipart/form-data
│
└── uploads/                # Berkas fisik yang diunggah pengguna (auto-created)
```

---

## Alur Request HTTP

```
Browser
  │
  ▼
app.js  (requestHandler)
  │
  ├── OPTIONS  → Balas CORS preflight
  ├── /api/auth/*  → authRoutes.js  → authController.js
  ├── /api/files/* → fileRoutes.js  → fileController.js
  ├── /api/users/* → userRoutes.js  → userController.js
  ├── /           → Redirect 302 ke /views/login.html
  └── /* (statis) → serveStaticFile() dari folder public/
```

**Detail setiap lapisan:**

1. **`app.js`** — menerima semua request HTTP, parsing URL, menambahkan log, dan mendelegasikan ke router yang tepat berdasarkan prefix path.
2. **`routes/`** — mencocokkan `pathname` + `method` secara eksplisit dan memanggil fungsi controller yang sesuai.
3. **`controllers/`** — memanggil `validateSession()` dari `middleware/auth.js` untuk autentikasi, melakukan validasi bisnis, lalu berinteraksi dengan database.
4. **`config/database.js`** — menyediakan `db.query(sql, params)` berbasis Promise untuk semua operasi MySQL.
5. **`utils/`** — menyediakan `sendJSON`, `readBody`, dan `serveStaticFile` agar controller tidak perlu mengurus detail HTTP secara langsung.

---

## Keamanan

| Mekanisme | Implementasi |
|---|---|
| Autentikasi | Bearer Token (64-char hex acak) disimpan di `sessions{}` in-memory |
| Hash password | SHA-256 via `crypto` built-in |
| Path traversal | `targetPath.startsWith(PUBLIC_DIR)` di `app.js` |
| Akses berkas | Hanya pemilik atau admin yang boleh download/delete/rename |
| Pemblokiran realtime | `destroySessionsByUserId()` dipanggil saat akun dinonaktifkan |
| Anti-cache | Header `Cache-Control: no-store` pada semua respons JSON |
