// server/routes/fileRoutes.js

'use strict';

const fileController = require('../controllers/fileController');

/**
 * fileRoutes memetakan endpoint file ke handler masing-masing.
 *
 * Supported endpoints:
 *   POST   /api/files/upload   => uploadFile
 *   GET    /api/files          => listFiles
 *   GET    /api/files/download => downloadFile
 *   DELETE /api/files          => deleteFile
 *
 * Contoh pemanggilan upload:
 *   curl -X POST -H "Content-Type: multipart/form-data; boundary=..." --data-binary @file ...
 */
async function fileRoutes(req, res, pathname, method, sendJSON, readBody, parsedUrl) {
  if (method === 'POST' && pathname === '/api/files/upload') {
    await fileController.uploadFile(req, res, sendJSON, readBody);
    return;
  }

  if (method === 'GET' && pathname === '/api/files') {
    await fileController.listFiles(req, res, sendJSON);
    return;
  }

  if (method === 'GET' && pathname === '/api/files/download') {
    await fileController.downloadFile(req, res, sendJSON, parsedUrl);
    return;
  }

  if (method === 'DELETE' && pathname === '/api/files') {
    await fileController.deleteFile(req, res, sendJSON, parsedUrl);
    return;
  }

  sendJSON(res, 404, { error: 'Endpoint file tidak ditemukan.' });
}

module.exports = fileRoutes;