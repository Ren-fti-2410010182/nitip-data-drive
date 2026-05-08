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
async function uploadFile(req, res, sendJSON, readBody, parsedUrl) {
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

  const parentId = parsedUrl ? parsedUrl.searchParams.get('parent_id') : null;
  const parentFolderId = parentId && !isNaN(Number(parentId)) ? Number(parentId) : null;

  try {
    await db.query(
      'INSERT INTO files (original_name, stored_name, file_size, mime_type, user_id, parent_folder_id) VALUES (?, ?, ?, ?, ?, ?)',
      [fileName, storedName, fileData.length, mimeType, session.userId, parentFolderId]
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
 * @description Mengambil daftar file dan folder dari database. Admin melihat semua file, user biasa hanya melihat file miliknya.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Utilitas untuk mengirim respon JSON.
 * @param {URL} parsedUrl - Objek URL yang sudah diparse.
 * @returns {Promise<void>}
 */
async function listFiles(req, res, sendJSON, parsedUrl) {
  const session = validateSession(req);
  if (!session) {
    return sendJSON(res, 401, { success: false, message: 'Autentikasi diperlukan.' });
  }

  try {
    const parentId = parsedUrl.searchParams.get('parent_id') || null;
    
    let query = `SELECT f.id, f.original_name, f.file_size, f.mime_type, f.uploaded_at,
                        f.is_folder, f.parent_folder_id, u.username AS uploader
                 FROM files f
                 INNER JOIN users u ON f.user_id = u.id`;
    let params = [];

    if (session.role !== 'admin') {
      query += ' WHERE f.user_id = ?';
      params.push(session.userId);
    } else {
      query += ' WHERE 1=1';
    }

    if (parentId !== null) {
      query += ' AND f.parent_folder_id = ?';
      params.push(Number(parentId));
    } else {
      query += ' AND f.parent_folder_id IS NULL';
    }

    query += ' ORDER BY f.is_folder DESC, f.uploaded_at DESC';

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
 * @description Menghapus file atau folder. User bisa menghapus file/folder mereka sendiri, admin bisa menghapus siapa saja.
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

  const fileId = parsedUrl.searchParams.get('id');
  if (!fileId || isNaN(Number(fileId))) {
    return sendJSON(res, 400, { success: false, message: 'Parameter id tidak valid.' });
  }

  try {
    const results = await db.query('SELECT * FROM files WHERE id = ? LIMIT 1', [Number(fileId)]);
    if (results.length === 0) {
      return sendJSON(res, 404, { success: false, message: 'File tidak ditemukan.' });
    }

    const item = results[0];

    // Periksa akses: hanya pemilik atau admin yang bisa menghapus
    if (item.user_id !== session.userId && session.role !== 'admin') {
      return sendJSON(res, 403, { success: false, message: 'Akses ditolak. Anda tidak memiliki izin untuk menghapus item ini.' });
    }

    // Jika adalah folder, hapus semua file/folder di dalamnya secara rekursif
    if (item.is_folder) {
      await deleteFolderRecursive(Number(fileId));
    } else {
      // Hapus file fisik dari disk
      if (item.stored_name && fs.existsSync(path.join(UPLOADS_DIR, item.stored_name))) {
        fs.unlinkSync(path.join(UPLOADS_DIR, item.stored_name));
      }
    }

    // Hapus dari database
    await db.query('DELETE FROM files WHERE id = ?', [Number(fileId)]);

    return sendJSON(res, 200, { success: true, message: 'Item berhasil dihapus.' });
  } catch (err) {
    console.error('[DELETE FILE] Error:', err.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal menghapus item.' });
  }
}

/**
 * @function deleteFolderRecursive
 * @description Helper function untuk menghapus folder dan semua isi di dalamnya secara rekursif.
 * @param {number} folderId - ID folder yang akan dihapus.
 * @returns {Promise<void>}
 */
async function deleteFolderRecursive(folderId) {
  const children = await db.query('SELECT * FROM files WHERE parent_folder_id = ?', [folderId]);
  
  for (const child of children) {
    if (child.is_folder) {
      // Rekursi untuk subfolder
      await deleteFolderRecursive(child.id);
    } else {
      // Hapus file fisik
      if (child.stored_name && fs.existsSync(path.join(UPLOADS_DIR, child.stored_name))) {
        fs.unlinkSync(path.join(UPLOADS_DIR, child.stored_name));
      }
    }
  }

  // Hapus semua children dari database
  await db.query('DELETE FROM files WHERE parent_folder_id = ?', [folderId]);
}

/**
 * @function createFolder
 * @description Membuat folder baru di database.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Utilitas untuk mengirim respon JSON.
 * @param {Function} readBody - Utilitas pembaca body stream request.
 * @returns {Promise<void>}
 */
async function createFolder(req, res, sendJSON, readBody) {
  const session = validateSession(req);
  if (!session) {
    return sendJSON(res, 401, { success: false, message: 'Autentikasi diperlukan.' });
  }

  let bodyBuffer;
  try {
    bodyBuffer = await readBody(req);
  } catch (e) {
    return sendJSON(res, 400, { success: false, message: 'Gagal membaca data request.' });
  }

  let data;
  try {
    data = JSON.parse(bodyBuffer.toString());
  } catch (e) {
    return sendJSON(res, 400, { success: false, message: 'Format JSON tidak valid.' });
  }

  const { folderName, parentFolderId } = data;

  if (!folderName || folderName.trim().length === 0) {
    return sendJSON(res, 400, { success: false, message: 'Nama folder tidak boleh kosong.' });
  }

  // Validasi nama folder
  if (!/^[a-zA-Z0-9._\-\s()]+$/.test(folderName)) {
    return sendJSON(res, 400, { success: false, message: 'Nama folder hanya boleh mengandung huruf, angka, titik, dash, underscore, spasi, dan kurung.' });
  }

  try {
    // Periksa apakah folder sudah ada di lokasi yang sama
    let checkQuery = 'SELECT id FROM files WHERE user_id = ? AND original_name = ? AND is_folder = 1';
    let checkParams = [session.userId, folderName.trim()];

    if (parentFolderId) {
      checkQuery += ' AND parent_folder_id = ?';
      checkParams.push(Number(parentFolderId));
    } else {
      checkQuery += ' AND parent_folder_id IS NULL';
    }

    const existing = await db.query(checkQuery, checkParams);
    if (existing.length > 0) {
      return sendJSON(res, 409, { success: false, message: 'Folder dengan nama ini sudah ada di lokasi ini.' });
    }

    // Buat folder baru
    await db.query(
      'INSERT INTO files (original_name, is_folder, parent_folder_id, user_id) VALUES (?, 1, ?, ?)',
      [folderName.trim(), parentFolderId ? Number(parentFolderId) : null, session.userId]
    );

    return sendJSON(res, 201, {
      success: true,
      message: 'Folder berhasil dibuat.',
      folderName,
    });
  } catch (dbErr) {
    console.error('[CREATE FOLDER] Error:', dbErr.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal membuat folder.' });
  }
}

/**
 * @function renameItem
 * @description Mengganti nama file atau folder.
 * @param {Object} req - Objek request Node.js native.
 * @param {Object} res - Objek response Node.js native.
 * @param {Function} sendJSON - Utilitas untuk mengirim respon JSON.
 * @param {Function} readBody - Utilitas pembaca body stream request.
 * @returns {Promise<void>}
 */
async function renameItem(req, res, sendJSON, readBody) {
  const session = validateSession(req);
  if (!session) {
    return sendJSON(res, 401, { success: false, message: 'Autentikasi diperlukan.' });
  }

  let bodyBuffer;
  try {
    bodyBuffer = await readBody(req);
  } catch (e) {
    return sendJSON(res, 400, { success: false, message: 'Gagal membaca data request.' });
  }

  let data;
  try {
    data = JSON.parse(bodyBuffer.toString());
  } catch (e) {
    return sendJSON(res, 400, { success: false, message: 'Format JSON tidak valid.' });
  }

  const { id, newName } = data;

  if (!id || isNaN(Number(id))) {
    return sendJSON(res, 400, { success: false, message: 'ID tidak valid.' });
  }

  if (!newName || newName.trim().length === 0) {
    return sendJSON(res, 400, { success: false, message: 'Nama baru tidak boleh kosong.' });
  }

  try {
    // Ambil item yang akan direname
    const results = await db.query('SELECT * FROM files WHERE id = ? LIMIT 1', [Number(id)]);
    if (results.length === 0) {
      return sendJSON(res, 404, { success: false, message: 'Item tidak ditemukan.' });
    }

    const item = results[0];

    // Periksa akses: hanya pemilik atau admin yang bisa rename
    if (item.user_id !== session.userId && session.role !== 'admin') {
      return sendJSON(res, 403, { success: false, message: 'Akses ditolak. Anda tidak memiliki izin untuk mengganti nama item ini.' });
    }

    // Validasi nama
    if (!/^[a-zA-Z0-9._\-\s()]+$/.test(newName)) {
      return sendJSON(res, 400, { success: false, message: 'Nama hanya boleh mengandung huruf, angka, titik, dash, underscore, spasi, dan kurung.' });
    }

    // Periksa apakah nama sudah digunakan di lokasi yang sama
    let checkQuery = 'SELECT id FROM files WHERE user_id = ? AND original_name = ? AND id != ?';
    let checkParams = [item.user_id, newName.trim(), Number(id)];

    if (item.parent_folder_id) {
      checkQuery += ' AND parent_folder_id = ?';
      checkParams.push(item.parent_folder_id);
    } else {
      checkQuery += ' AND parent_folder_id IS NULL';
    }

    const existing = await db.query(checkQuery, checkParams);
    if (existing.length > 0) {
      return sendJSON(res, 409, { success: false, message: 'Nama sudah digunakan di lokasi ini.' });
    }

    // Update nama
    await db.query('UPDATE files SET original_name = ? WHERE id = ?', [newName.trim(), Number(id)]);

    return sendJSON(res, 200, {
      success: true,
      message: 'Item berhasil direname.',
      newName: newName.trim(),
    });
  } catch (dbErr) {
    console.error('[RENAME ITEM] Error:', dbErr.message);
    return sendJSON(res, 500, { success: false, message: 'Gagal mengganti nama item.' });
  }
}

module.exports = { uploadFile, listFiles, downloadFile, deleteFile, createFolder, renameItem };