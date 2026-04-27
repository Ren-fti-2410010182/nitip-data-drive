# README - Folder Routes

Folder `routes/` berfungsi untuk **mengatur jalur request** dari frontend ke proses backend yang sesuai.

Artinya, setiap kali user melakukan aksi seperti login, upload file, atau menambah akun, request tersebut akan masuk ke folder `routes/`, lalu diarahkan ke controller yang menangani proses tersebut.

Secara sederhana alurnya seperti ini:

```text
User Request
→ Routes
→ Controller
→ Database
→ Response
```

Jadi:

* **Routes** menerima request dari frontend
* **Controller** menjalankan proses utama
* **Database** menyimpan atau mengambil data

---

# Struktur Folder

```bash
routes/
├── authRoutes.js
├── userRoutes.js
└── fileRoutes.js
```

---

# 1. `authRoutes.js`

File ini berfungsi untuk mengatur semua jalur yang berhubungan dengan **login dan logout**.

### Contoh route:

* `/login`
* `/logout`

### Contoh alur:

1. User mengisi form login
2. Data dikirim ke `/login`
3. `authRoutes.js` menerima request
4. Request diarahkan ke `authController.js`

### Tujuan:

Menghubungkan proses login/logout ke controller yang sesuai.

---

# 2. `userRoutes.js`

File ini berfungsi untuk mengatur semua jalur yang berhubungan dengan **manajemen akun user**.

### Contoh route:

* `/users`
* `/users/add`
* `/users/edit`
* `/users/delete`

### Contoh alur:

1. Admin menambah akun user
2. Request dikirim ke `/users/add`
3. `userRoutes.js` menerima request
4. Request diarahkan ke `userController.js`

### Tujuan:

Menghubungkan fitur pengelolaan user ke controller.

---

# 3. `fileRoutes.js`

File ini berfungsi untuk mengatur semua jalur yang berhubungan dengan **upload dan download file**.

### Contoh route:

* `/upload`
* `/files`
* `/download/:id`

### Contoh alur:

1. User upload file
2. Request dikirim ke `/upload`
3. `fileRoutes.js` menerima request
4. Request diarahkan ke `fileController.js`

### Tujuan:

Menghubungkan fitur file ke controller.

---

# Kesimpulan Singkat

Setiap file route bertugas mengatur jalur request:

* `authRoutes.js` → jalur login/logout
* `userRoutes.js` → jalur manajemen user
* `fileRoutes.js` → jalur upload/download file

Dengan pembagian ini, kode menjadi:

* lebih terstruktur
* mudah dibaca
* mudah dikembangkan
* mudah dikerjakan bersama tim

---

# Analogi Sederhana

Bayangkan backend seperti kantor:

* **Routes** = resepsionis
* **Controller** = staf yang mengerjakan tugas
* **Database** = tempat penyimpanan data

Saat user mengirim request, `routes` bertugas seperti resepsionis yang mengarahkan permintaan ke bagian yang tepat.
