# Routes Folder

Folder `server/src/routes/` memetakan endpoint API ke controller yang tepat.

## File

- `authRoutes.js` - route untuk login, register, dan logout.
- `fileRoutes.js` - route untuk upload, daftar, unduh, dan hapus file.
- `userRoutes.js` - route untuk manajemen pengguna (list, approve, reject, update, delete, toggle status).

## Pola

- Setiap file router menerima request HTTP dan memanggil fungsi controller.
- Router tidak menyimpan logika bisnis, hanya meneruskan request.
