'use strict';

const userController = require('../controllers/userController');

/**
 * Router pengguna untuk endpoint user management.
 *
 * Endpoints:
 *   GET    /api/users                 => listUsers
 *   DELETE /api/users?id=             => deleteUser
 *   POST   /api/users/approve?id=     => approveUser
 *   POST   /api/users/reject?id=      => rejectUser
 *   POST   /api/users/toggle-status?id= => toggleStatus
 *   POST   /api/users/update?id=      => updateUser
 */
module.exports = async function (req, res, pathname, method, sendJSON, readBody, parsedUrl) {
  if (pathname === '/api/users' && method === 'GET') {
    return userController.listUsers(req, res, sendJSON, parsedUrl);
  }

  if (pathname === '/api/users' && method === 'DELETE') {
    return userController.deleteUser(req, res, sendJSON, parsedUrl);
  }

  if (pathname === '/api/users/approve' && method === 'POST') {
    return userController.approveUser(req, res, sendJSON, parsedUrl);
  }

  if (pathname === '/api/users/reject' && method === 'POST') {
    return userController.rejectUser(req, res, sendJSON, parsedUrl);
  }

  if (pathname === '/api/users/toggle-status' && method === 'POST') {
    return userController.toggleStatus(req, res, sendJSON, parsedUrl);
  }

  if (pathname === '/api/users/update' && method === 'POST') {
    return userController.updateUser(req, res, sendJSON, readBody, parsedUrl);
  }

  sendJSON(res, 404, { error: 'Endpoint tidak ditemukan.' });
};