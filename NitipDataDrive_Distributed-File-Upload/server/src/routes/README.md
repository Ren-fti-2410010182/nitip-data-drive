# Routes Folder

Folder `server/src/routes/` memetakan setiap **path URL + HTTP method** ke fungsi controller yang tepat. Router tidak mengandung logika bisnis — hanya meneruskan request.

---

## File & Endpoint

### `authRoutes.js` — Rute Autentikasi (`/api/auth/*`)

| Method | Path | Controller | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/login` | `authController.login` | Login pengguna |
| `POST` | `/api/auth/register` | `authController.register` | Registrasi akun baru |
| `POST` | `/api/auth/logout` | `authController.logout` | Logout & hapus sesi |
| `GET` | `/api/auth/status` | `authController.checkStatus` | Cek status akun realtime |

---

### `fileRoutes.js` — Rute Berkas (`/api/files/*`)

| Method | Path | Controller | Deskripsi |
|---|---|---|---|
| `POST` | `/api/files/upload` | `fileController.uploadFile` | Upload berkas (multipart) |
| `GET` | `/api/files` | `fileController.listFiles` | List berkas/folder |
| `GET` | `/api/files/download` | `fileController.downloadFile` | Download berkas |
| `POST` | `/api/files/folder` | `fileController.createFolder` | Buat folder baru |
| `PUT` | `/api/files/rename` | `fileController.renameItem` | Ubah nama berkas/folder |
| `DELETE` | `/api/files` | `fileController.deleteFile` | Hapus berkas/folder |

---

### `userRoutes.js` — Rute Pengguna (`/api/users/*`)

| Method | Path | Controller | Deskripsi |
|---|---|---|---|
| `GET` | `/api/users` | `userController.listUsers` | Daftar semua pengguna |
| `POST` | `/api/users/approve` | `userController.approveUser` | Setujui akun pending |
| `POST` | `/api/users/reject` | `userController.rejectUser` | Tolak akun pending |
| `POST` | `/api/users/toggle-status` | `userController.toggleStatus` | Toggle active/disabled |
| `POST` | `/api/users/update` | `userController.updateUser` | Update data pengguna |
| `DELETE` | `/api/users` | `userController.deleteUser` | Hapus akun permanen |

---

## Pola Routing

- `app.js` meneruskan request ke router yang sesuai berdasarkan prefix path (`/api/auth`, `/api/files`, `/api/users`).
- Setiap router memeriksa `pathname` dan `method` secara eksplisit — tidak ada wildcard atau regex.
- Jika tidak ada endpoint yang cocok, router mengirim `404` via `sendJSON`.
- Semua parameter query (misal `?id=`, `?parent_id=`) dibaca dari objek `parsedUrl` yang sudah diproses di `app.js`.
