# Server Folder

Folder `server/` berisi backend aplikasi Nitip Data Drive. Struktur ini dipisahkan menjadi:

- `backup/` - file backup database dan schema SQL.
- `src/` - kode aplikasi utama yang berjalan pada Node.js.

## Cara Menjalankan

Dari root project:

```bash
npm start
```

Server akan menjalankan `server/src/app.js` dan melayani API serta file statis.

## Catatan

- `server/src/config/database.js` mengatur koneksi MySQL.
- `server/src/uploads/` menyimpan file yang diunggah.
- `server/src/test_mysql_connect.js` adalah skrip bantu untuk mengetes koneksi database.
- `public/` berada dua level di atas `server/src/`, jadi `app.js` mengarah ke `../../public`.
