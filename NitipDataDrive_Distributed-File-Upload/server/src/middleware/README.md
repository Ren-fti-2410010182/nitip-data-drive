# Middleware Folder

Folder `server/src/middleware/` menyimpan fungsi autentikasi dan sesi.

## File

- `auth.js` - memeriksa token Bearer, membuat session, menghapus session, dan membersihkan session berdasarkan user.

## Fungsi Utama

- `validateSession(req)` - memvalidasi token pada header Authorization.
- `createSession(user)` - membuat token session baru setelah login.
- `destroySession(req)` - menghapus sesi ketika logout.
- `destroySessionsByUserId(userId)` - menghapus semua sesi pengguna tertentu saat akun dinonaktifkan atau dihapus.
