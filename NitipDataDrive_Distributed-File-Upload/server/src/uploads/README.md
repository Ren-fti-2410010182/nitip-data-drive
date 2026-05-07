# Uploads Folder

Folder `server/src/uploads/` adalah tempat penyimpanan file yang diunggah oleh pengguna.

## Catatan

- Folder ini dibuat otomatis oleh `server/src/controllers/fileController.js` jika belum ada.
- Semua file di folder ini disimpan dengan nama `timestamp_random_originalname` untuk menghindari bentrok.
- Jangan simpan file kode atau file konfigurasi di sini.

## Keamanan

- Pastikan folder ini tidak diekspor sebagai public directory langsung.
- Hanya endpoint backend yang dapat membaca dan mengunduh file dengan izin yang tepat.
