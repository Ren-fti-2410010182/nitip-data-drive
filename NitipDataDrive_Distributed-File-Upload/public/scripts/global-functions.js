// global-functions.js - Berisi fungsi umum yang dipakai di semua halaman

const token    = localStorage.getItem('token');
const role     = localStorage.getItem('role');
const username = localStorage.getItem('username');

// Menampilkan pesan pop-up (Alert) di layar
function showAlert(msg, type = 'error') {
  const alertBox = document.getElementById('alert');
  if (!alertBox) {
    alert(msg);
    return;
  }
  alertBox.textContent = msg;
  alertBox.className   = `alert alert-${type} show`;
  setTimeout(() => { alertBox.className = 'alert'; }, 4000);
}

// Menambahkan Token keamanan ke dalam Request
function authHeader() {
  return { 'Authorization': `Bearer ${token}` };
}

// Mengubah ukuran file dari bytes ke bentuk KB/MB
function formatSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// Menutup jendela pratinjau file
function closeViewModal() {
  const modal = document.getElementById('viewModal');
  if (modal) modal.classList.remove('show');
  const body = document.getElementById('viewModalBody');
  if (body) body.innerHTML = ''; 
}
