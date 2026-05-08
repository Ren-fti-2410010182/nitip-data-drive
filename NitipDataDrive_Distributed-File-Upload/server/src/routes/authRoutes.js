// server/src/routes/authRoutes.js
// Router autentikasi yang memisahkan URL dan method dari logika bisnis.

'use strict';

const authController = require('../controllers/authController');

/**
 * authRoutes menghubungkan request auth ke controller yang tepat.
 *
 * Available routes:
 *   POST /api/auth/login    => authController.login
 *   POST /api/auth/register => authController.register
 *   POST /api/auth/logout   => authController.logout
 *
 * Contoh pemanggilan:
 *   fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
 */
async function authRoutes(req, res, pathname, method, sendJSON, readBody) {
  if (method === 'POST' && pathname === '/api/auth/login') {
    await authController.login(req, res, sendJSON, readBody);
    return;
  }

  if (method === 'GET' && pathname === '/api/auth/status') {
    await authController.checkStatus(req, res, sendJSON);
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/register') {
    await authController.register(req, res, sendJSON, readBody);
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/logout') {
    authController.logout(req, res, sendJSON);
    return;
  }

  sendJSON(res, 404, { error: 'Endpoint tidak ditemukan.' });
}

module.exports = authRoutes;