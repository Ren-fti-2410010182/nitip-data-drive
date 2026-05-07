// js/admin/auth.js - Autentikasi Khusus Admin

// Proteksi Halaman: Jika bukan admin, tendang ke login.
if (!token || role !== 'admin') {
  alert('Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.');
  window.location.href = '/views/login.html';
}

// Menampilkan Nama Admin
document.getElementById('welcomeMsg').textContent = `Admin: ${username}`;

// Logika Tombol Keluar (Logout)
document.getElementById('btnLogout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', headers: authHeader() });
  localStorage.clear();
  window.location.href = '/views/login.html';
});
