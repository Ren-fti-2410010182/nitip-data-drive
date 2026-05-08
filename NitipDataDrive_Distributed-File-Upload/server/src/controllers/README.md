# Controllers Folder

Folder `server/src/controllers/` berisi **logika bisnis utama** aplikasi. Setiap controller menangani satu domain dan dipanggil oleh router masing-masing.

---

## File & Fungsi

### `authController.js` — Autentikasi

| Fungsi | Method & Endpoint | Deskripsi |
|---|---|---|
| `login` | `POST /api/auth/login` | Verifikasi username + password (SHA-256), buat token sesi baru |
| `register` | `POST /api/auth/register` | Daftarkan user baru; status `pending` (public) atau `active` (jika admin) |
| `logout` | `POST /api/auth/logout` | Hapus token sesi dari memori server |
| `checkStatus` | `GET /api/auth/status` | Polling realtime — validasi sesi & status akun di DB; jika dinonaktifkan, hancurkan sesi |

---

### `fileController.js` — Manajemen Berkas & Folder

| Fungsi | Method & Endpoint | Deskripsi |
|---|---|---|
| `uploadFile` | `POST /api/files/upload` | Terima multipart/form-data, simpan ke `uploads/`, catat metadata ke DB |
| `listFiles` | `GET /api/files` | Ambil daftar berkas/folder berdasarkan `parent_folder_id` dan `user_id` |
| `downloadFile` | `GET /api/files/download` | Stream berkas fisik dari disk ke browser |
| `createFolder` | `POST /api/files/folder` | Buat entri folder baru di DB (tanpa berkas fisik) |
| `renameItem` | `PUT /api/files/rename` | Ganti nama berkas atau folder (hanya pemilik atau admin) |
| `deleteFile` | `DELETE /api/files` | Hapus berkas dari disk + DB; untuk folder: hapus rekursif semua isi |

---

### `userController.js` — Manajemen Pengguna (Admin Only)

| Fungsi | Method & Endpoint | Deskripsi |
|---|---|---|
| `listUsers` | `GET /api/users` | Ambil semua pengguna; opsional filter by `?status=` |
| `approveUser` | `POST /api/users/approve` | Ubah status `pending` → `active` |
| `rejectUser` | `POST /api/users/reject` | Ubah status `pending` → `rejected` |
| `toggleStatus` | `POST /api/users/toggle-status` | Toggle status `active` ↔ `disabled`; jika disabled, hancurkan sesi |
| `updateUser` | `POST /api/users/update` | Perbarui username, email, atau status pengguna |
| `deleteUser` | `DELETE /api/users` | Hapus akun permanen; admin tidak dapat menghapus dirinya sendiri |

---

## Pola Umum

1. Controller selalu memanggil `validateSession(req)` dari `middleware/auth.js` sebagai langkah **pertama**.
2. Jika sesi tidak valid atau role tidak sesuai → kirim `401`/`403` dan hentikan eksekusi.
3. Validasi input dilakukan sebelum query database.
4. Semua respon menggunakan fungsi `sendJSON(res, statusCode, data)` dari `utils/httpUtils.js`.
5. Error database ditangani dengan `try/catch` dan dicatat via `console.error`.
