# Server src Folder

Folder `server/src/` adalah kode sumber backend aplikasi.

## Struktur Utama

- `app.js` - entry point aplikasi, router utama, dan penyajian file statis.
- `config/` - konfigurasi koneksi database.
- `controllers/` - logika bisnis untuk autentikasi, upload/unduh file, dan manajemen pengguna.
- `middleware/` - fungsi autentikasi dan manajemen sesi.
- `routes/` - pemetaan endpoint API ke controller.
- `utils/` - helper untuk membaca body request, mengirim JSON, dan parsing multipart.
- `uploads/` - folder penyimpanan file yang diunggah.
- `test_mysql_connect.js` - skrip uji koneksi MySQL.

## Alur Request

1. `app.js` menerima request HTTP.
2. `routes/` memilih handler berdasarkan path dan method.
3. `controllers/` melakukan operasi database atau file.
4. `utils/` membantu parsing request dan respon.
