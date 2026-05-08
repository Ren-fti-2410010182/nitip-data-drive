# Config Folder

Folder `server/src/config/` menyimpan konfigurasi koneksi database aplikasi.

---

## File

### `database.js` — Pool Koneksi MySQL

Mengatur koneksi ke database MySQL menggunakan **connection pool** untuk efisiensi. Pool memungkinkan beberapa request berbagi koneksi yang sudah ada alih-alih membuat koneksi baru setiap saat.

**Konfigurasi default:**

| Parameter | Nilai |
|---|---|
| `host` | `localhost` |
| `port` | `3306` |
| `user` | `root` |
| `password` | *(kosong)* |
| `database` | `nitip_data_drive` |
| `connectionLimit` | `10` |
| `charset` | `UTF8MB4` |
| `timezone` | `+07:00` (WIB) |

**Fungsi yang diekspor:**

```js
db.query(sql, params)  →  Promise<results>
```

Contoh penggunaan di controller:
```js
const rows = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

---

## Cara Mengubah Konfigurasi

Edit nilai di `database.js` langsung. Untuk produksi, disarankan membaca nilai dari environment variable:

```js
host: process.env.DB_HOST || 'localhost',
user: process.env.DB_USER || 'root',
password: process.env.DB_PASS || '',
```
