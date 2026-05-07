# Utils Folder

Folder `server/src/utils/` berisi helper yang dipakai oleh server untuk request dan parsing data.

## File

- `httpUtils.js` - utilitas untuk mengirim respons JSON, membaca payload request, dan menyajikan file statis.
- `multipartParser.js` - parser sederhana untuk body `multipart/form-data` yang digunakan pada upload file.

## Fungsi

- `httpUtils.js` memisahkan detail HTTP response agar controller lebih fokus pada logika bisnis.
- `multipartParser.js` memecah body multipart menjadi nama file, tipe MIME, dan data binary.
