# Utils Folder

Folder `server/src/utils/` berisi **fungsi pembantu (helper)** yang digunakan oleh server untuk menangani request dan response HTTP, serta parsing data unggahan.

---

## File & Fungsi

### `httpUtils.js`

Tiga fungsi utama yang diekspor:

| Fungsi | Deskripsi |
|---|---|
| `sendJSON(res, statusCode, data)` | Mengirim respons JSON dengan header `Content-Type: application/json` dan header **anti-cache** (`Cache-Control: no-store`) agar data API tidak disimpan peramban |
| `readBody(req)` | Membaca body stream request secara async dan mengembalikan `Buffer` penuh — digunakan untuk JSON body maupun multipart |
| `serveStaticFile(res, filePath)` | Membaca berkas dari disk dan mengirimkannya ke client dengan MIME type yang tepat; mengembalikan `404` jika berkas tidak ditemukan |

**MIME type yang didukung `serveStaticFile`:** `.html`, `.css`, `.js`, `.png`, `.jpg`, `.jpeg`, `.ico`, `.svg`, `.json`

---

### `multipartParser.js`

Parser kustom untuk body `multipart/form-data` tanpa library eksternal.

| Fungsi | Deskripsi |
|---|---|
| `parseMultipart(bodyBuffer, contentType)` | Mengekstrak `fieldName`, `fileName`, `mimeType`, dan `fileData` (Buffer) dari boundary multipart |

**Cara kerja:**
1. Baca nilai `boundary` dari header `Content-Type`.
2. Cari posisi awal dan akhir part pertama menggunakan delimiter boundary.
3. Pisahkan header part dari data binary (`\r\n\r\n` sebagai pemisah).
4. Ekstrak `Content-Disposition` untuk nama field & nama file, dan `Content-Type` untuk tipe MIME.

> **Catatan:** Parser ini hanya memproses **satu file per request**. Upload batch tidak didukung.

---

## Mengapa Tidak Pakai Library?

Proyek ini sengaja menggunakan modul built-in Node.js (`http`, `fs`, `path`, `crypto`) dan hanya satu dependensi eksternal (`mysql`). `multipartParser.js` ditulis sendiri untuk menghindari dependensi tambahan seperti `multer` atau `busboy`.
