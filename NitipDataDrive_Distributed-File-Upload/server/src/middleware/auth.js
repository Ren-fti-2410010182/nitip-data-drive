'use strict';

const crypto = require('crypto');
const sessions = {};

/**
 * Ambil token bearer dari header Authorization.
 * Format yang diharapkan: Authorization: Bearer <token>
 */
function getAuthorizedToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Validasi session berdasarkan token yang dikirim.
 * Jika token valid, kembalikan objek session.
 * Jika tidak, kembalikan null.
 */
function validateSession(req) {
  const token = getAuthorizedToken(req);
  if (!token) return null;
  return sessions[token] || null;
}

/**
 * Buat session baru untuk user yang berhasil login.
 * Token acak disimpan di memori server.
 */
function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions[token] = {
    userId: user.id,
    username: user.username,
    role: user.role,
    createdAt: Date.now(),
  };
  return token;
}

/**
 * Hapus session pengguna berdasarkan token di header Authorization.
 * Digunakan saat logout.
 */
function destroySession(req) {
  const token = getAuthorizedToken(req);
  if (token) {
    delete sessions[token];
  }
}

/**
 * Hapus semua session yang berasosiasi dengan userId tertentu.
 * Digunakan saat admin menonaktifkan atau menghapus akun secara paksa.
 */
function destroySessionsByUserId(userId) {
  for (const token in sessions) {
    if (sessions[token].userId === Number(userId)) {
      delete sessions[token];
    }
  }
}

module.exports = { validateSession, createSession, destroySession, destroySessionsByUserId };