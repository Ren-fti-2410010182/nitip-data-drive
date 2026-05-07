// server/src/controllers/userController.js
// Menangani manajemen pengguna untuk admin.

'use strict';

const db = require('../config/database');
const { validateSession, destroySessionsByUserId } = require('../middleware/auth');

/**
 * @function listUsers
 * @description Mengambil daftar semua pengguna dari database. Hanya admin yang boleh mengakses.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Fungsi utilitas untuk mengirim respon JSON.
 * @param {URL} parsedUrl - Objek URL yang sudah diparse dari request URL.
 * @returns {Promise<void>}
 */
async function listUsers(req, res, sendJSON, parsedUrl) {
  const session = validateSession(req);
  if (!session || session.role !== 'admin') {
    return sendJSON(res, 403, { success: false, message: 'Akses ditolak.' });
  }

  const statusFilter = parsedUrl ? parsedUrl.searchParams.get('status') : null;
  const validStatuses = ['active', 'pending', 'rejected'];
  const params = [];
  let query = 'SELECT id, username, email, role, status, created_at FROM users';

  if (validStatuses.includes(statusFilter)) {
    query += ' WHERE status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const users = await db.query(query, params);
    return sendJSON(res, 200, { success: true, users });
  } catch (err) {
    console.error('[USER] Get users error:', err.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal mengambil data pengguna.' });
  }
}

/**
 * @function approveUser
 * @description Menyetujui permintaan pendaftaran pengguna (mengubah status dari 'pending' menjadi 'active').
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Fungsi utilitas untuk mengirim respon JSON.
 * @param {URL} parsedUrl - Objek URL yang sudah diparse. Berisi parameter `id`.
 * @returns {Promise<void>}
 */
async function approveUser(req, res, sendJSON, parsedUrl) {
  const session = validateSession(req);
  if (!session || session.role !== 'admin') {
    return sendJSON(res, 403, { success: false, message: 'Akses ditolak.' });
  }

  const userId = parsedUrl.searchParams.get('id');
  if (!userId || isNaN(Number(userId))) {
    return sendJSON(res, 400, { success: false, message: 'Parameter id tidak valid.' });
  }

  try {
    const result = await db.query(
      'UPDATE users SET status = ?, approved_at = NOW() WHERE id = ? AND status = ?',
      ['active', Number(userId), 'pending']
    );

    if (result.affectedRows === 0) {
      return sendJSON(res, 404, { success: false, message: 'Permintaan pengguna tidak ditemukan atau sudah diproses.' });
    }

    return sendJSON(res, 200, { success: true, message: 'Akun berhasil disetujui.' });
  } catch (err) {
    console.error('[USER] Approve user error:', err.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal menyetujui pengguna.' });
  }
}

/**
 * @function rejectUser
 * @description Menolak permintaan pendaftaran pengguna (mengubah status dari 'pending' menjadi 'rejected').
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Fungsi utilitas untuk mengirim respon JSON.
 * @param {URL} parsedUrl - Objek URL yang sudah diparse. Berisi parameter `id`.
 * @returns {Promise<void>}
 */
async function rejectUser(req, res, sendJSON, parsedUrl) {
  const session = validateSession(req);
  if (!session || session.role !== 'admin') {
    return sendJSON(res, 403, { success: false, message: 'Akses ditolak.' });
  }

  const userId = parsedUrl.searchParams.get('id');
  if (!userId || isNaN(Number(userId))) {
    return sendJSON(res, 400, { success: false, message: 'Parameter id tidak valid.' });
  }

  try {
    const result = await db.query(
      'UPDATE users SET status = ? WHERE id = ? AND status = ?',
      ['rejected', Number(userId), 'pending']
    );

    if (result.affectedRows === 0) {
      return sendJSON(res, 404, { success: false, message: 'Permintaan pengguna tidak ditemukan atau sudah diproses.' });
    }

    destroySessionsByUserId(userId);
    return sendJSON(res, 200, { success: true, message: 'Permintaan pendaftaran ditolak.' });
  } catch (err) {
    console.error('[USER] Reject user error:', err.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal menolak pengguna.' });
  }
}

/**
 * @function deleteUser
 * @description Menghapus akun pengguna dari database. Admin tidak dapat menghapus dirinya sendiri.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Fungsi utilitas untuk mengirim respon JSON.
 * @param {URL} parsedUrl - Objek URL yang sudah diparse. Berisi parameter `id`.
 * @returns {Promise<void>}
 */
async function deleteUser(req, res, sendJSON, parsedUrl) {
  const session = validateSession(req);
  if (!session || session.role !== 'admin') {
    return sendJSON(res, 403, { success: false, message: 'Akses ditolak.' });
  }

  const userId = parsedUrl.searchParams.get('id');
  if (!userId || isNaN(Number(userId))) {
    return sendJSON(res, 400, { success: false, message: 'Parameter id tidak valid.' });
  }

  if (Number(userId) === session.userId) {
    return sendJSON(res, 400, { success: false, message: 'Tidak dapat menghapus akun sendiri.' });
  }

  try {
    const result = await db.query('DELETE FROM users WHERE id = ?', [Number(userId)]);
    if (result.affectedRows === 0) {
      return sendJSON(res, 404, { success: false, message: 'Pengguna tidak ditemukan.' });
    }
    
    destroySessionsByUserId(userId);
    return sendJSON(res, 200, { success: true, message: 'Pengguna berhasil dihapus.' });
  } catch (err) {
    console.error('[USER] Delete user error:', err.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal menghapus pengguna.' });
  }
}

/**
 * @function toggleStatus
 * @description Mengubah status pengguna antara 'active' dan 'disabled'. Digunakan oleh admin untuk memblokir sementara.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Fungsi utilitas untuk mengirim respon JSON.
 * @param {URL} parsedUrl - Objek URL yang sudah diparse. Berisi parameter `id`.
 * @returns {Promise<void>}
 */
async function toggleStatus(req, res, sendJSON, parsedUrl) {
  const session = validateSession(req);
  if (!session || session.role !== 'admin') {
    return sendJSON(res, 403, { success: false, message: 'Akses ditolak.' });
  }

  const userId = parsedUrl.searchParams.get('id');
  if (!userId || isNaN(Number(userId))) {
    return sendJSON(res, 400, { success: false, message: 'Parameter id tidak valid.' });
  }

  if (Number(userId) === session.userId) {
    return sendJSON(res, 400, { success: false, message: 'Tidak dapat menonaktifkan akun sendiri.' });
  }

  try {
    // Cari user saat ini
    const users = await db.query('SELECT status FROM users WHERE id = ?', [Number(userId)]);
    if (users.length === 0) {
      return sendJSON(res, 404, { success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const currentStatus = users[0].status;
    if (currentStatus === 'pending' || currentStatus === 'rejected') {
      return sendJSON(res, 400, { success: false, message: 'Hanya akun yang aktif atau dinonaktifkan yang bisa diubah statusnya.' });
    }

    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';

    await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, Number(userId)]);
    
    if (newStatus === 'disabled') {
      destroySessionsByUserId(userId);
    }
    
    return sendJSON(res, 200, { success: true, message: `Status berhasil diubah menjadi ${newStatus}.`, newStatus });
  } catch (err) {
    console.error('[USER] Toggle status error:', err.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal mengubah status pengguna.' });
  }
}

/**
 * @function updateUser
 * @description Memperbarui data pengguna (username, email, status).
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Fungsi utilitas untuk mengirim respon JSON.
 * @param {Function} readBody - Fungsi pembaca stream body.
 * @param {URL} parsedUrl - Objek URL yang sudah diparse.
 * @returns {Promise<void>}
 */
async function updateUser(req, res, sendJSON, readBody, parsedUrl) {
  const session = validateSession(req);
  if (!session || session.role !== 'admin') {
    return sendJSON(res, 403, { success: false, message: 'Akses ditolak.' });
  }

  const userId = parsedUrl.searchParams.get('id');
  if (!userId || isNaN(Number(userId))) {
    return sendJSON(res, 400, { success: false, message: 'Parameter id tidak valid.' });
  }

  let body;
  try {
    const rawBody = await readBody(req);
    body = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return sendJSON(res, 400, { success: false, message: 'Format request tidak valid.' });
  }

  const { username, email, status } = body;
  const updates = [];
  const params = [];

  if (username) {
    const cleanUsername = String(username).trim();
    if (cleanUsername.length < 3) return sendJSON(res, 400, { success: false, message: 'Username minimal 3 karakter.' });
    updates.push('username = ?');
    params.push(cleanUsername);
  }

  if (email) {
    const cleanEmail = String(email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return sendJSON(res, 400, { success: false, message: 'Format email tidak valid.' });
    updates.push('email = ?');
    params.push(cleanEmail);
  }

  if (status) {
    if (Number(userId) === session.userId && status !== 'active') {
      return sendJSON(res, 400, { success: false, message: 'Tidak dapat menonaktifkan akun sendiri.' });
    }
    updates.push('status = ?');
    params.push(status);
  }

  if (updates.length === 0) {
    return sendJSON(res, 400, { success: false, message: 'Tidak ada data yang diperbarui.' });
  }

  params.push(Number(userId));

  try {
    // Cek duplikasi
    if (username || email) {
      const existing = await db.query(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ? LIMIT 1',
        [username || null, email || null, Number(userId)]
      );
      if (existing.length > 0) {
        return sendJSON(res, 409, { success: false, message: 'Username atau email sudah digunakan oleh pengguna lain.' });
      }
    }

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(query, params);

    if (status === 'disabled') {
      destroySessionsByUserId(userId);
    }

    return sendJSON(res, 200, { success: true, message: 'Data pengguna berhasil diperbarui.' });
  } catch (err) {
    console.error('[USER] Update user error:', err.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal memperbarui pengguna.' });
  }
}

module.exports = { listUsers, deleteUser, approveUser, rejectUser, toggleStatus, updateUser };