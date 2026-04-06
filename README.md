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


## 📁 Struktur Folder
```
└── 📁NitipDataDrive_(Distributed-File-Upload)
    └── 📁client-side
        └── 📁Asset
            ├── logic.js
            ├── ui.css
        ├── index.html
    └── 📁server-side
        └── 📁Database
            ├── blank.sql
            ├── config.php
        └── 📁Storage
            └── 📁node1
            └── 📁node2
            └── 📁node3
        ├── download.php
        ├── Index.php
        ├── upload.php
    └── README.md
```
##  Penjelasan Struktur

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
