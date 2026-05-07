// server/src/app.js
// Entry point aplikasi Nitip Data Drive yang terpisah menjadi layer Router, Controller, dan Utility.
// File ini hanya berfungsi sebagai 'orchestrator' untuk menerima request,
// memilih route yang sesuai, dan menyajikan konten statis.

'use strict';

const http = require('http');
const path = require('path');

const { sendJSON, readBody, serveStaticFile } = require('./utils/httpUtils');

// Mengimpor router dari masing-masing modul untuk memisahkan logika setiap domain.
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const userRoutes = require('./routes/userRoutes');

// Konfigurasi port server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen di semua interface jaringan

// Folder public berada di root project, dua level di atas file ini.
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');

/**
 * @function requestHandler
 * @description requestHandler adalah titik masuk utama (router utama) untuk semua request HTTP.
 * Ia bertugas memeriksa HTTP method, pathname, menangani CORS, dan meneruskan request
 * ke router spesifik (Auth, File, User) atau menyajikan file statis.
 *
 * @param {http.IncomingMessage} req - Objek request Node.js native.
 * @param {http.ServerResponse} res - Objek response Node.js native.
 * @returns {Promise<void>}
 */
async function requestHandler(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

  // 1. Tangani preflight CORS untuk request OPTIONS
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // 2. Pemilihan router untuk API
  if (pathname.startsWith('/api/auth')) {
    await authRoutes(req, res, pathname, method, sendJSON, readBody);
    return;
  }

  if (pathname.startsWith('/api/files')) {
    await fileRoutes(req, res, pathname, method, sendJSON, readBody, parsedUrl);
    return;
  }

  if (pathname.startsWith('/api/users')) {
    await userRoutes(req, res, pathname, method, sendJSON, readBody, parsedUrl);
    return;
  }

  // 3. Redirect root ke halaman login jika path root diakses
  if (pathname === '/') {
    res.writeHead(302, { Location: '/views/login.html' });
    res.end();
    return;
  }

  // 4. Sajikan berkas statis dari folder public/
  const targetPath = path.join(PUBLIC_DIR, pathname);

  if (!targetPath.startsWith(PUBLIC_DIR)) {
    sendJSON(res, 403, { error: 'Akses ditolak.' });
    return;
  }

  serveStaticFile(res, targetPath);
}

// Buat dan jalankan HTTP server
const server = http.createServer(requestHandler);

server.listen(PORT, HOST, () => {
  console.log('Nitip Data Drive Server aktif: http://localhost:' + PORT);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[FATAL] Port ${PORT} sudah digunakan. Silakan pilih port lain.`);
  } else {
    console.error('[FATAL] Server error:', err.message);
  }
  process.exit(1);
});