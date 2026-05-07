# Config Folder

Folder `server/src/config/` menyimpan konfigurasi backend.

## File

- `database.js` - mengatur pool koneksi MySQL dan fungsi query.

## Fungsi

- Menyediakan satu titik konfigurasi database.
- Menggunakan pool sehingga koneksi dapat dipakai ulang antar request.
- Mengekspos fungsi `query(sql, params)` untuk dipakai oleh controller.
