// server/src/controllers/authController.js
// Menangani logika autentikasi pengguna: login, register, logout.

'use strict';

const crypto = require('crypto');
const db = require('../config/database');
const { createSession, destroySession, validateSession, destroySessionsByUserId } = require('../middleware/auth');
const fs = require('fs');

/**
 * hashSHA256: Hash password menggunakan SHA-256.
 * Digunakan hanya untuk proses verifikasi karena database saat ini
 * tidak menggunakan algoritma salt yang lebih kuat.
 *
 * @param {string} plaintext
 * @returns {string}
 */
function hashSHA256(plaintext) {
  return crypto.createHash('sha256').update(plaintext, 'utf8').digest('hex');
}

/**
 * @function login
 * @description Menangani proses autentikasi pengguna. Memeriksa kredensial, memvalidasi status akun, dan membuat token sesi.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Utilitas pengirim respon JSON.
 * @param {Function} readBody - Utilitas pembaca body stream request.
 * @returns {Promise<void>}
 */
async function login(req, res, sendJSON, readBody) {
  let body;

  try {
    const rawBody = await readBody(req);
    body = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return sendJSON(res, 400, { success: false, message: 'Format request tidak valid.' });
  }

  const { username, password } = body;

  if (!username || !password) {
    return sendJSON(res, 400, { success: false, message: 'Username dan password wajib diisi.' });
  }

  const cleanUsername = String(username).trim();
  const cleanPassword = String(password).trim();
  const hashedPassword = hashSHA256(cleanPassword);

  try {
    const results = await db.query(
      'SELECT id, username, role, status FROM users WHERE username = ? AND password = ? LIMIT 1',
      [cleanUsername, hashedPassword]
    );

    if (results.length === 0) {
      return sendJSON(res, 401, { success: false, message: 'Username atau password salah.' });
    }

    const user = results[0];
    if (user.status !== 'active') {
      const statusMessage = user.status === 'pending'
        ? 'Akun Anda sedang menunggu persetujuan admin.'
        : user.status === 'rejected'
          ? 'Akun Anda ditolak. Silakan hubungi admin.'
          : 'Akun belum aktif.';
      return sendJSON(res, 403, { success: false, message: statusMessage });
    }

    const token = createSession(user);

    return sendJSON(res, 200, {
      success: true,
      message: 'Login berhasil.',
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (dbError) {
    console.error('[AUTH] Login DB error:', dbError.message);
    return sendJSON(res, 500, { success: false, message: 'Terjadi kesalahan server.' });
  }
}

/**
 * @function register
 * @description Menangani proses pendaftaran pengguna baru. Jika dilakukan oleh admin, akun otomatis aktif. Jika tidak, statusnya 'pending'.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Utilitas pengirim respon JSON.
 * @param {Function} readBody - Utilitas pembaca body stream request.
 * @returns {Promise<void>}
 */
async function register(req, res, sendJSON, readBody) {
  let body;

  try {
    const rawBody = await readBody(req);
    body = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return sendJSON(res, 400, { success: false, message: 'Format request tidak valid.' });
  }

  const { username, password, email, role } = body;

  if (!username || !password || !email) {
    return sendJSON(res, 400, { success: false, message: 'Semua field wajib diisi.' });
  }

  const cleanUsername = String(username).trim();
  const cleanEmail = String(email).trim();
  const cleanPassword = String(password);

  if (cleanUsername.length < 3 || cleanUsername.length > 50) {
    return sendJSON(res, 400, { success: false, message: 'Username harus 3–50 karakter.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return sendJSON(res, 400, { success: false, message: 'Format email tidak valid.' });
  }

  if (cleanPassword.length < 6) {
    return sendJSON(res, 400, { success: false, message: 'Password minimal 6 karakter.' });
  }

  const session = validateSession(req);
  const isAdmin = session && session.role === 'admin';
  const requestedRole = isAdmin && role === 'admin' ? 'admin' : 'user';
  const accountStatus = isAdmin ? 'active' : 'pending';

  try {
    const existingUser = await db.query(
      'SELECT id, status FROM users WHERE username = ? OR email = ? LIMIT 1',
      [cleanUsername, cleanEmail]
    );

    if (existingUser.length > 0) {
      const existingStatus = existingUser[0].status || 'active';
      if (!isAdmin && existingStatus === 'pending') {
        return sendJSON(res, 409, { success: false, message: 'Permintaan pendaftaran sudah diajukan.' });
      }
      return sendJSON(res, 409, { success: false, message: 'Username atau email sudah terdaftar.' });
    }

    const hashedPassword = hashSHA256(cleanPassword);

    await db.query(
      'INSERT INTO users (username, password, email, role, status) VALUES (?, ?, ?, ?, ?)',
      [cleanUsername, hashedPassword, cleanEmail, requestedRole, accountStatus]
    );

    return sendJSON(res, 201, {
      success: true,
      message: isAdmin
        ? 'Akun berhasil dibuat.'
        : 'Permintaan pendaftaran berhasil dikirim. Tunggu persetujuan admin.',
    });
  } catch (dbError) {
    console.error('[AUTH] Register DB error:', dbError.message);
    return sendJSON(res, 500, { success: false, message: 'Terjadi kesalahan server.' });
  }
}

/**
 * @function logout
 * @description Menghapus sesi pengguna dari memori server.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Utilitas pengirim respon JSON.
 * @returns {void}
 */
function logout(req, res, sendJSON) {
  destroySession(req);
  return sendJSON(res, 200, { success: true, message: 'Logout berhasil.' });
}

/**
 * @function checkStatus
 * @description Memeriksa apakah sesi pengguna masih aktif dan status akun di database tidak dinonaktifkan.
 */
async function checkStatus(req, res, sendJSON) {
  const session = validateSession(req);
  if (!session) {
    return sendJSON(res, 401, { success: false, message: 'Sesi tidak valid.' });
  }

  try {
    const results = await db.query('SELECT status FROM users WHERE id = ? LIMIT 1', [session.userId]);
    if (results.length === 0) {
      return sendJSON(res, 404, { success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const userStatus = results[0].status;
    if (userStatus !== 'active') {
      destroySessionsByUserId(session.userId);
      return sendJSON(res, 403, { success: false, status: userStatus, message: 'Akun Anda telah dinonaktifkan oleh admin.' });
    }

    return sendJSON(res, 200, { success: true, status: 'active' });
  } catch (err) {
    console.error('[AUTH] Check status error:', err.message);
    return sendJSON(res, 500, { success: false, message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { login, register, logout, checkStatus };