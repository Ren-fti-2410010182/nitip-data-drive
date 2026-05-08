# Middleware Folder

Folder `server/src/middleware/` menyimpan sistem **manajemen sesi** dan **autentikasi token** aplikasi.

---

## File

### `auth.js` — Session Manager

Menyimpan semua sesi aktif dalam objek in-memory:

```js
const sessions = {};
// { [token]: { userId, username, role, createdAt } }
```

**Fungsi yang diekspor:**

| Fungsi | Deskripsi |
|---|---|
| `createSession(user)` | Membuat token acak 64-char hex, menyimpannya ke `sessions{}`, mengembalikan token |
| `validateSession(req)` | Membaca header `Authorization: Bearer <token>`, mengembalikan objek sesi atau `null` |
| `destroySession(req)` | Menghapus sesi berdasarkan token di header — dipakai saat logout |
| `destroySessionsByUserId(userId)` | Menghapus **semua** sesi milik `userId` — dipakai saat akun dinonaktifkan/dihapus admin |

---

## Cara Kerja Autentikasi

```
Login berhasil
  → createSession(user) → token disimpan di sessions{}
  → token dikirim ke client via JSON response
  → client simpan di localStorage

Request berikutnya
  → client kirim header: Authorization: Bearer <token>
  → validateSession(req) → cek sessions[token]
  → jika valid: kembalikan { userId, username, role }
  → jika tidak valid: kembalikan null → controller kirim 401
```

---

## Catatan Penting

> **Session bersifat in-memory.** Seluruh sesi akan hilang ketika server di-restart. Semua pengguna yang sedang login perlu melakukan login ulang setelah server restart.

> **Pemblokiran realtime:** `destroySessionsByUserId()` digunakan oleh `userController` (saat admin toggle-status/delete) dan `authController.checkStatus` (saat polling 10 detik mendeteksi status `disabled` di database) untuk memastikan pengguna yang dinonaktifkan langsung kehilangan akses tanpa menunggu token kadaluarsa.
