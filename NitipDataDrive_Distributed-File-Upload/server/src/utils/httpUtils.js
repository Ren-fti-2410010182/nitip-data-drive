'use strict';

const fs = require('fs');
const path = require('path');

/**
 * sendJSON: Paketkan respons JSON standard.
 *
 * @param {http.ServerResponse} res
 * @param {number} statusCode
 * @param {object} data
 */
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(data));
}

/**
 * readBody: Membaca payload request menjadi Buffer.
 * Cocok untuk JSON atau multipart form-data.
 *
 * Contoh:
 *   const rawBody = await readBody(req);
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

/**
 * serveStaticFile: Membaca file dari disk dan mengirimkan ke client.
 * Jika file tidak ditemukan, mengembalikan 404.
 */
function serveStaticFile(res, filePath) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
  };

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

module.exports = { sendJSON, readBody, serveStaticFile };