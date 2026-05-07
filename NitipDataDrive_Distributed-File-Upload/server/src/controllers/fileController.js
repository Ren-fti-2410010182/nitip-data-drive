// server/src/controllers/fileController.js
// Menangani upload, download, dan manajemen metadata file.

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../config/database');
const { validateSession } = require('../middleware/auth');
const { parseMultipart } = require('../utils/multipartParser');

// Folder uploads disimpan di server/uploads
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Pastikan folder uploads ada
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Batas ukuran file 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

/**
 * @function uploadFile
 * @description Menyimpan file yang diunggah ke disk dan metadata-nya ke database.
 * Mendukung pembacaan form multipart/form-data.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Utilitas untuk mengirim respon JSON.
 * @param {Function} readBody - Utilitas pembaca body stream request.
 * @returns {Promise<void>}
 */
async function uploadFile(req, res, sendJSON, readBody) {
  const session = validateSession(req);
  if (!session) {
    return sendJSON(res, 401, { success: false, message: 'Sesi tidak valid. Silakan login kembali.' });
  }

  let bodyBuffer;
  try {
    bodyBuffer = await readBody(req);
  } catch (e) {
    return sendJSON(res, 400, { success: false, message: 'Gagal membaca data request.' });
  }

  if (bodyBuffer.length > MAX_FILE_SIZE) {
    return sendJSON(res, 413, { success: false, message: `Ukuran file melebihi batas maksimum ${MAX_FILE_SIZE / 1024 / 1024} MB.` });
  }

  let parsedFile;
  try {
    const contentType = req.headers['content-type'];
    parsedFile = parseMultipart(bodyBuffer, contentType);
  } catch (parseErr) {
    return sendJSON(res, 400, { success: false, message: 'Format upload tidak valid: ' + parseErr.message });
  }

  const { fileName, mimeType, fileData } = parsedFile;

  if (!fileName || !fileData || fileData.length === 0) {
    return sendJSON(res, 400, { success: false, message: 'Tidak ada file yang terdeteksi dalam request.' });
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return sendJSON(res, 415, { success: false, message: `Tipe file tidak diizinkan: ${mimeType}` });
  }

  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(4).toString('hex');
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storedName = `${timestamp}_${randomHash}_${safeFileName}`;
  const storagePath = path.join(UPLOADS_DIR, storedName);

  try {
    fs.writeFileSync(storagePath, fileData);
  } catch (fsErr) {
    console.error('[UPLOAD] Gagal menulis file:', fsErr.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal menyimpan file ke server.' });
  }

  try {
    await db.query(
      'INSERT INTO files (original_name, stored_name, file_size, mime_type, user_id) VALUES (?, ?, ?, ?, ?)',
      [fileName, storedName, fileData.length, mimeType, session.userId]
    );
  } catch (dbErr) {
    fs.unlinkSync(storagePath);
    console.error('[UPLOAD] Gagal simpan metadata:', dbErr.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal menyimpan metadata file.' });
  }

  return sendJSON(res, 201, {
    success: true,
    message: 'File berhasil diunggah.',
    fileName,
    fileSize: fileData.length,
    mimeType,
  });
}

/**
 * @function listFiles
 * @description Mengambil daftar file dari database. Admin melihat semua file, user biasa hanya melihat file miliknya.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Utilitas untuk mengirim respon JSON.
 * @returns {Promise<void>}
 */
async function listFiles(req, res, sendJSON) {
  const session = validateSession(req);
  if (!session) {
    return sendJSON(res, 401, { success: false, message: 'Autentikasi diperlukan.' });
  }

  try {
    let query = `SELECT f.id, f.original_name, f.file_size, f.mime_type, f.uploaded_at,
                        u.username AS uploader
                 FROM files f
                 INNER JOIN users u ON f.user_id = u.id`;
    let params = [];

    if (session.role !== 'admin') {
      query += ' WHERE f.user_id = ?';
      params.push(session.userId);
    }

    query += ' ORDER BY f.uploaded_at DESC';

    const files = await db.query(query, params);
    return sendJSON(res, 200, { success: true, files });
  } catch (dbErr) {
    console.error('[FILE] List files error:', dbErr.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal mengambil daftar file.' });
  }
}

/**
 * @function downloadFile
 * @description Mengunduh (streaming) file berdasarkan ID. Memeriksa izin akses (hanya uploader atau admin yang bisa unduh).
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Utilitas untuk mengirim respon JSON.
 * @param {URL} parsedUrl - Objek URL yang sudah diparse, berisi parameter `id`.
 * @returns {Promise<void>}
 */
async function downloadFile(req, res, sendJSON, parsedUrl) {
  const session = validateSession(req);
  if (!session) {
    return sendJSON(res, 401, { success: false, message: 'Autentikasi diperlukan.' });
  }

  const fileId = parsedUrl.searchParams.get('id');
  if (!fileId || isNaN(Number(fileId))) {
    return sendJSON(res, 400, { success: false, message: 'Parameter id tidak valid.' });
  }

  try {
    const results = await db.query('SELECT * FROM files WHERE id = ? LIMIT 1', [Number(fileId)]);
    if (results.length === 0) {
      return sendJSON(res, 404, { success: false, message: 'File tidak ditemukan.' });
    }

    const fileRecord = results[0];

    // Periksa akses: hanya uploader sendiri atau admin yang bisa mengunduh
    if (fileRecord.user_id !== session.userId && session.role !== 'admin') {
      return sendJSON(res, 403, { success: false, message: 'Akses ditolak. Anda tidak memiliki izin untuk mengunduh file ini.' });
    }

    const storagePath = path.join(UPLOADS_DIR, fileRecord.stored_name);

    if (!fs.existsSync(storagePath)) {
      return sendJSON(res, 404, { success: false, message: 'File fisik tidak ditemukan di server.' });
    }

    res.writeHead(200, {
      'Content-Type': fileRecord.mime_type,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileRecord.original_name)}"`,
      'Content-Length': fs.statSync(storagePath).size,
    });

    const readStream = fs.createReadStream(storagePath);
    readStream.pipe(res);
  } catch (err) {
    console.error('[DOWNLOAD] Error:', err.message);
    return sendJSON(res, 500, { success: false, message: 'Terjadi kesalahan saat mengunduh file.' });
  }
}

/**
 * @function deleteFile
 * @description Menghapus file secara fisik dari server dan metadatanya dari database. Hanya role admin yang diperbolehkan.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Utilitas untuk mengirim respon JSON.
 * @param {URL} parsedUrl - Objek URL yang sudah diparse, berisi parameter `id`.
 * @returns {Promise<void>}
 */
async function deleteFile(req, res, sendJSON, parsedUrl) {
  const session = validateSession(req);
  if (!session) {
    return sendJSON(res, 401, { success: false, message: 'Autentikasi diperlukan.' });
  }

  if (session.role !== 'admin') {
    return sendJSON(res, 403, { success: false, message: 'Akses ditolak. Hanya admin yang dapat menghapus file.' });
  }

  const fileId = parsedUrl.searchParams.get('id');
  if (!fileId || isNaN(Number(fileId))) {
    return sendJSON(res, 400, { success: false, message: 'Parameter id tidak valid.' });
  }

  try {
    const results = await db.query('SELECT stored_name FROM files WHERE id = ? LIMIT 1', [Number(fileId)]);
    if (results.length === 0) {
      return sendJSON(res, 404, { success: false, message: 'File tidak ditemukan.' });
    }

    const storagePath = path.join(UPLOADS_DIR, results[0].stored_name);
    await db.query('DELETE FROM files WHERE id = ?', [Number(fileId)]);

    if (fs.existsSync(storagePath)) {
      fs.unlinkSync(storagePath);
    }

    return sendJSON(res, 200, { success: true, message: 'File berhasil dihapus.' });
  } catch (err) {
    console.error('[DELETE FILE] Error:', err.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal menghapus file.' });
  }
}

module.exports = { uploadFile, listFiles, downloadFile, deleteFile };