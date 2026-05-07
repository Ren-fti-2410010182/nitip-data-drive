// server/src/config/database.js
// Modul konfigurasi koneksi database MySQL dengan pool connection.

'use strict';

const mysql = require('mysql');

/**
 * Pool koneksi MySQL untuk menghindari overhead membuat koneksi baru setiap request.
 *
 * Konfigurasi di bawah ini cocok untuk lingkungan XAMPP lokal.
 * Pastikan nilai host/user/password/database disesuaikan di produksi.
 */
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'nitip_data_drive',
  connectionLimit: 10,
  charset: 'UTF8MB4',
  timezone: '+07:00',
  connectTimeout: 30000,  // Waktu maksimum menunggu handshake koneksi
  acquireTimeout: 30000,  // Waktu maksimum menunggu koneksi dari pool
  waitForConnections: true,
  queueLimit: 0,
});

/**
 * query: Fungsi helper untuk menjalankan query SQL menggunakan Promise.
 *
 * Contoh penggunaan:
 *   const users = await db.query('SELECT * FROM users WHERE role = ?', ['admin']);
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        console.error('[DB ERROR]', error.message);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = { query };