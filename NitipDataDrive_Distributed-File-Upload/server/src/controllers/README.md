# Controllers Folder

Folder `server/src/controllers/` berisi logika utama aplikasi.

## File

- `authController.js` - menangani login, pendaftaran, dan logout.
- `fileController.js` - menangani upload, daftar file, download, dan hapus file.
- `userController.js` - menangani manajemen pengguna oleh admin (approve, reject, update, delete, toggle status).

## Fungsi Umum

- Controller menerima request dari `routes/`.
- Controller memproses validasi bisnis.
- Controller berinteraksi dengan database melalui `config/database.js`.
- Controller memanggil `middleware/auth.js` untuk memeriksa sesi dan hak akses.
