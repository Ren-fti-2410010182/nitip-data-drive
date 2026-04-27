# README - Folder Controllers

Folder `controllers/` berisi **logika utama** dari setiap fitur pada backend.

Artinya, file di dalam folder ini bertugas untuk **memproses request** dari user, menjalankan perintah yang diperlukan, berinteraksi dengan database, lalu mengirim response kembali.

Secara sederhana alurnya seperti ini:

```text
Request dari user
→ Route
→ Controller
→ Database
→ Response
```

Jadi:

* **Route** menerima request
* **Controller** menjalankan proses utama
* **Database** menyimpan / mengambil data

---

# Struktur Folder

```bash
controllers/
├── authController.js
├── userController.js
└── fileController.js
```

---

# 1. `authController.js`

File ini menangani semua proses yang berhubungan dengan **autentikasi user**.

### Fungsi utama:

* Login user/admin
* Logout user/admin
* Validasi username dan password
* Menentukan role user (`admin` atau `user`)

### Contoh alur:

1. User mengisi form login
2. Data dikirim ke backend
3. `authController.js` memeriksa username dan password ke database
4. Jika benar, user diarahkan sesuai role

### Tujuan:

Memastikan hanya pengguna yang memiliki akun yang dapat masuk ke sistem.

---

# 2. `userController.js`

File ini menangani semua proses yang berhubungan dengan **manajemen akun user**.

### Fungsi utama:

* Menambah akun user baru
* Menampilkan daftar user
* Mengedit data user
* Menghapus akun user

### Contoh alur:

1. Admin menambahkan akun baru
2. Data dikirim ke backend
3. `userController.js` menyimpan data user ke database

### Tujuan:

Memberikan akses kepada admin untuk mengelola akun user.

---

# 3. `fileController.js`

File ini menangani semua proses yang berhubungan dengan **manajemen file user**.

### Fungsi utama:

* Upload file
* Menampilkan daftar file user
* Download file
* Menghapus file (jika diperlukan)

### Contoh alur:

1. User memilih file untuk upload
2. File dikirim ke backend
3. `fileController.js` menyimpan informasi file ke database
4. File dapat ditampilkan dan diunduh kembali oleh user

### Tujuan:

Mengatur penyimpanan file yang dimiliki oleh setiap user.

---

# Kesimpulan Singkat

Setiap file controller memiliki tanggung jawab berbeda:

* `authController.js` → mengatur login/logout
* `userController.js` → mengatur akun user
* `fileController.js` → mengatur file upload/download

Dengan pembagian ini, kode menjadi:

* lebih rapi
* mudah dipahami
* mudah dikerjakan bersama tim
* mudah diperbaiki jika ada error

---

# Analogi Sederhana

Bayangkan backend seperti kantor:

* **Route** = penerima tamu
* **Controller** = staf yang mengerjakan tugas
* **Database** = lemari penyimpanan data

Jadi controller adalah bagian yang **mengerjakan inti pekerjaan sistem**.