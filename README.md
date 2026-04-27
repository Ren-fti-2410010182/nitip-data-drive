# README.md

# **Nitip Data Drive (Distributed File Upload)**

---

# **1. Deskripsi Proyek**

**Nitip Data Drive** adalah aplikasi penyimpanan file berbasis web sederhana yang dirancang untuk membantu pengguna menyimpan, mengelola, dan mengunduh file secara online.

Sistem ini memiliki dua jenis pengguna:

* **Admin**, yang bertugas mengelola akun pengguna.
* **User**, yang dapat mengunggah dan mengunduh file miliknya sendiri.

Aplikasi ini menggunakan arsitektur **client-server**, di mana antarmuka pengguna berjalan pada sisi client, sedangkan proses login, manajemen akun, dan pengelolaan file diproses oleh backend server yang terhubung ke database.

---

# **2. Latar Belakang**

Di era digitalisasi pendidikan saat ini, kebutuhan mahasiswa akan ruang penyimpanan data yang fleksibel dan dapat diakses kapan saja menjadi sangat penting. Ketergantungan pada perangkat fisik seperti flashdisk atau hard disk eksternal mulai berkurang karena risiko kerusakan fisik, kehilangan data, dan biaya perangkat yang relatif mahal.

Layanan cloud storage seperti Google Drive memang menjadi solusi umum, namun pengguna tetap bergantung pada layanan pihak ketiga.

Berdasarkan permasalahan tersebut, proyek **Nitip Data Drive** dikembangkan sebagai aplikasi cloud storage berbasis web sederhana dengan konsep **distributed file upload**, sehingga pengguna dapat mengelola penyimpanan file secara mandiri dalam lingkungan sistem yang dibuat sendiri.

Sistem ini diharapkan dapat menjadi alternatif media penyimpanan digital yang:

* mudah digunakan,
* aman,
* efisien,
* mendukung kebutuhan penyimpanan data perkuliahan.

---

# **3. Komponen Sistem**

Sistem **Nitip Data Drive** terdiri dari tiga komponen utama:

---

## **3.1 Client**

Client adalah bagian antarmuka yang digunakan oleh pengguna untuk berinteraksi dengan sistem.

Dibangun menggunakan:

* **HTML**
* **CSS**
* **JavaScript**

Terdapat tiga tampilan utama:

1. **Login**
   Digunakan untuk autentikasi pengguna.

2. **Dashboard Admin**
   Digunakan admin untuk mengelola akun user.

3. **Dashboard User**
   Digunakan user untuk upload dan download file.

---

## **3.2 Server**

Server adalah backend yang dibangun menggunakan:

* Node.js

Server bertugas untuk:

* menerima request dari client,
* memproses login,
* mengatur upload file,
* menghubungkan sistem dengan database,
* menjalankan fungsi CRUD data user dan file.

---

## **3.3 Database**

Database digunakan untuk menyimpan data:

* akun user,
* data file,
* informasi file upload.

Database yang digunakan adalah:

* MySQL

---

# **4. Teknologi yang Digunakan**

| Komponen     |             Teknologi |
| ------------ | --------------------: |
| Client       | HTML, CSS, JavaScript |
| Server       |               Node.js |
| Database     |                 MySQL |
| Network Demo |                 Ngrok |

Tools pendukung:

* Ngrok untuk akses demo online
* XAMPP untuk menjalankan MySQL lokal

---

# **5. Arsitektur Sistem**

Arsitektur sistem menggunakan model **client-server-database**.

Alur kerja sistem:

```text id="y6m2x1"
Client (Browser)
      ↓
Node.js Server
      ↓
MySQL Database
```

### Penjelasan:

1. User mengakses halaman web melalui browser.
2. Client mengirim request ke server.
3. Server memproses request.
4. Server mengambil atau menyimpan data ke database.
5. Server mengirim response kembali ke client.

---

# **6. Struktur Folder Proyek**

```bash id="k8q3v7"
└── 📁NitipDataDrive_(Distributed-File-Upload)
    └── 📁Client
        └── 📁Asset
            └── 📁css
                ├── DashboardAdmin.css
                ├── index.css
                ├── Login.css
            └── 📁JavaScript
                ├── DashboardAdmin.js
                ├── index.js
                ├── Login.js
        ├── DasboardAdmin.html
        ├── Index.html
        ├── Login.html
    └── 📁server
        └── 📁config
            ├── configAbout.md
            ├── db.js
        └── 📁Controller
            ├── authController.js
            ├── fileController.js
            ├── KontrolAbout.md
            ├── userController.js
        └── 📁Routes
            ├── authRoutes.js
            ├── fileRoutes.js
            ├── RoutesAbout.md
            ├── userRoutes.js
        └── 📁uploads
            ├── data.sql
        ├── app.js
    └── README.md
```

---

# **7. Penjelasan Struktur Folder**

---

## **7.1 Folder Client**

Folder `Client/` berisi semua tampilan antarmuka sistem.

### Isi utama:

* `Login.html` → halaman login
* `DashboardAdmin.html` → halaman admin
* `Index.html` → halaman user

Folder `Asset/` menyimpan file pendukung:

* `css/` → file desain tampilan
* `JavaScript/` → logika interaksi frontend

---

## **7.2 Folder server**

Folder `server/` berisi seluruh backend aplikasi.

---

### `config/`

Berisi konfigurasi sistem, terutama koneksi database.

Contoh:

* `db.js` → koneksi ke database MySQL

Fungsi:

> Menghubungkan backend dengan database.

---

### `controller/`

Berisi logika utama aplikasi.

Contoh:

* `authController.js` → proses login
* `userController.js` → CRUD akun user
* `fileController.js` → upload dan download file

Fungsi:

> Menjalankan proses utama berdasarkan request dari client.

---

### `routes/`

Berisi jalur request dari frontend ke controller.

Contoh:

* `authRoutes.js`
* `userRoutes.js`
* `fileRoutes.js`

Fungsi:

> Mengarahkan request ke proses yang sesuai.

---

### `uploads/`

Folder untuk menyimpan file yang di-upload user.

Fungsi:

> Menyimpan file hasil upload sebelum diunduh kembali.

---

### `app.js`

File utama backend.

Fungsi:

* menjalankan server,
* menghubungkan routes,
* mengatur jalannya backend.

---

# **8. Alur Kerja Sistem**

Berikut alur kerja sederhana sistem:

```text id="f4n8m2"
1. User login
2. Server memverifikasi akun
3. Jika admin → masuk dashboard admin
4. Jika user → masuk dashboard user
5. User upload file
6. File disimpan di folder uploads
7. Data file disimpan di database
8. User dapat download file miliknya
```

---

# **9. Fitur Sistem**

### **Admin**

* Login admin
* Menambah akun user
* Mengedit akun user
* Menghapus akun user

### **User**

* Login user
* Upload file
* Melihat file
* Download file

---

# **10. Tujuan Proyek**

Tujuan dibuatnya sistem ini adalah:

1. menyediakan media penyimpanan file berbasis web,
2. mempermudah pengelolaan file pengguna,
3. menerapkan konsep client-server dalam sistem penyimpanan data,
4. menjadi alternatif sederhana cloud storage untuk kebutuhan akademik.

---

# **11. Diagram Arsitektur**
<p align="center">
    <img align="center" width="717" height="612" alt="image" src="https://github.com/user-attachments/assets/7d4838ad-dc00-4087-842c-7f3bdb60bea5" />
</p>

---
