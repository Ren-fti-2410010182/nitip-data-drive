# Nitip Data Drive (NDD)

Nitip Data Drive
Project cloud storage sederhana

## Fitur
- Upload file
- Download file
- Distributed storage (node)

## Cara Menjalankan
1. Copy ke htdocs
2. Jalankan XAMPP
3. Akses localhost

```
## 📁 Struktur Folder
nitip-data-drive/
│
├── client-side/
│ ├── index.html
│ └── Asset/
│ ├── ui.css
│ └── logic.js
│
├── server-side/
│ ├── config.php
│ ├── upload.php
│ └── download.php
│
├── Storage/
│ ├── node1/
│ ├── node2/
│ └── node3/
│
├── Database/
│ └── blank.sql
│
├── Index.php
└── README.md
NOTE: struktur bisa berubah menyesuaikan kondisi lapangan
```
## 🧠 Penjelasan Struktur

- **client-side/** → tampilan (HTML, CSS, JS)  
- **server-side/** → backend PHP  
- **Storage/** → penyimpanan file (node)  
- **Database/** → file SQL  
- **Index.php** → entry point  
- **README.md** → dokumentasi
  
## Penjelasan Singkat
- User mengakses aplikasi melalui browser
- Client-side mengirim request ke server
- Server-side (PHP) memproses upload/download
- File disimpan ke salah satu node (node1, node2, node3)
- Metadata file disimpan di database MySQL
## Flow sederhana
<img width="1285" height="957" alt="flow" src="https://github.com/user-attachments/assets/5436ad28-e1b1-463a-98f0-4efcc84c42e5" />
