// js/admin/manage-users.js - Logika Manajemen Pengguna

const createEmailInput     = document.getElementById('createEmail');
const createUsernameInput  = document.getElementById('createUsername');
const createPasswordInput  = document.getElementById('createPassword');
const createRoleSelect     = document.getElementById('createRole');
const btnCreateUser        = document.getElementById('btnCreateUser');

if (btnCreateUser) {
  btnCreateUser.addEventListener('click', createUser);
}

// Mengirim request untuk membuat akun baru.
async function createUser() {
  const email    = createEmailInput.value.trim();
  const username = createUsernameInput.value.trim();
  const password = createPasswordInput.value.trim();
  const role     = createRoleSelect.value;

  if (!email || !username || !password) {
    return showAlert('Semua field pembuatan akun wajib diisi.');
  }

  try {
    const resp = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify({ email, username, password, role }),
    });

    const data = await resp.json();
    if (data.success) {
      showAlert('Akun baru berhasil dibuat.', 'success');
      createEmailInput.value = '';
      createUsernameInput.value = '';
      createPasswordInput.value = '';
      loadUsers();
      return;
    }

    showAlert(data.message || 'Gagal membuat akun.');
  } catch (e) {
    showAlert('Tidak dapat terhubung ke server.');
  }
}

// Menyetujui Akun
async function approveUser(userId, username) {
  if (!confirm(`Setujui akun "${username}"?`)) return;
  try {
    const resp = await fetch(`/api/users/approve?id=${userId}`, { method: 'POST', headers: authHeader() });
    const data = await resp.json();
    if (data.success) { showAlert(`Akun "${username}" berhasil disetujui.`, 'success'); loadUsers(); }
    else showAlert(data.message || 'Gagal menyetujui akun.');
  } catch (e) { showAlert('Terjadi kesalahan jaringan.'); }
}

// Menolak Akun
async function rejectUser(userId, username) {
  if (!confirm(`Tolak akun "${username}"?`)) return;
  try {
    const resp = await fetch(`/api/users/reject?id=${userId}`, { method: 'POST', headers: authHeader() });
    const data = await resp.json();
    if (data.success) { showAlert(`Permintaan akun "${username}" ditolak.`, 'success'); loadUsers(); }
    else showAlert(data.message || 'Gagal menolak akun.');
  } catch (e) { showAlert('Terjadi kesalahan jaringan.'); }
}

// Muat Daftar Pengguna
async function loadUsers() {
  const tbody = document.getElementById('userTableBody');
  try {
    const resp = await fetch('/api/users', { headers: authHeader() });
    const data = await resp.json();

    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--danger); text-align:center">${data.message}</td></tr>`;
      return;
    }

    const myId = localStorage.getItem('userId');
    tbody.innerHTML = '';

    data.users.forEach((user) => {
      const date = new Date(user.created_at).toLocaleDateString('id-ID');
      
      let statusHTML = '';
      if (user.status === 'pending') {
        statusHTML = '<span class="badge badge-pending">Menunggu</span>';
      } else {
        const isSelf = user.id == myId;
        const rejectedOpt = user.status === 'rejected' ? '<option value="rejected" selected>Ditolak</option>' : '';
        statusHTML = `<select class="form-control" style="padding: 4px; font-size: 0.8rem; height: auto;" onchange="updateUserStatus(${user.id}, this.value)" ${isSelf ? 'disabled' : ''}>
          ${rejectedOpt}
          <option value="active" ${user.status === 'active' ? 'selected' : ''}>Aktif</option>
          <option value="disabled" ${user.status === 'disabled' ? 'selected' : ''}>Nonaktif</option>
        </select>`;
      }

      let roleBadge = user.role === 'admin' ? '<span class="badge badge-admin">Admin</span>' : '<span class="badge badge-user">User</span>';

      let actionsHTML = '';
      if (user.id != myId) {
        if (user.status === 'pending') {
          actionsHTML += `<button class="btn-icon" style="color: var(--success);" title="Setujui" onclick="approveUser(${user.id}, '${user.username}')">✓</button>`;
          actionsHTML += `<button class="btn-icon danger" title="Tolak" onclick="rejectUser(${user.id}, '${user.username}')">✕</button>`;
        }
        actionsHTML += `<button class="btn-icon" style="color: var(--primary);" title="Edit" onclick="openEditUserModal(${user.id}, '${user.username}', '${user.email}')">✏️</button>`;
        actionsHTML += `<button class="btn-icon danger" title="Hapus" onclick="deleteUser(${user.id}, '${user.username}')">🗑</button>`;
      } else {
        actionsHTML += `<button class="btn-icon" style="color: var(--primary);" title="Edit" onclick="openEditUserModal(${user.id}, '${user.username}', '${user.email}')">✏️</button>`;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 500; color: var(--primary);">${user.username}</td>
        <td>${user.email}</td>
        <td>${roleBadge}</td>
        <td>${statusHTML}</td>
        <td>${date}</td>
        <td style="display:flex; gap:4px;">${actionsHTML}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" style="color:var(--danger); text-align:center">Gagal memuat pengguna.</td></tr>';
  }
}

// Memperbarui status via combobox
async function updateUserStatus(userId, newStatus) {
  try {
    const resp = await fetch(`/api/users/update?id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await resp.json();
    if (data.success) showAlert('Status berhasil diperbarui.', 'success');
    else { showAlert(data.message); loadUsers(); }
  } catch(e) { showAlert('Gagal mengubah status.'); loadUsers(); }
}

// Modal Logika Edit User
function openEditUserModal(id, username, email) {
  document.getElementById('editUserId').value = id;
  document.getElementById('editUsername').value = username;
  document.getElementById('editEmail').value = email;
  document.getElementById('editUserModal').classList.add('show');
}

function closeEditUserModal() {
  document.getElementById('editUserModal').classList.remove('show');
}

async function saveUserEdit() {
  const id = document.getElementById('editUserId').value;
  const username = document.getElementById('editUsername').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  
  if (!username || !email) return showAlert('Username dan email wajib diisi.');
  
  try {
    const resp = await fetch(`/api/users/update?id=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ username, email })
    });
    const data = await resp.json();
    if (data.success) {
      showAlert('Data berhasil diperbarui.', 'success');
      closeEditUserModal();
      loadUsers();
      if (id == localStorage.getItem('userId')) {
        document.getElementById('welcomeMsg').textContent = `Admin: ${username}`;
        localStorage.setItem('username', username);
      }
    } else showAlert(data.message);
  } catch(e) { showAlert('Terjadi kesalahan jaringan.'); }
}

// Menghapus pengguna secara permanen.
async function deleteUser(userId, uname) {
  if (!confirm(`Hapus pengguna "${uname}"?\n\nSemua file milik pengguna ini juga akan terhapus.`)) return;
  try {
    const resp = await fetch(`/api/users?id=${userId}`, { method: 'DELETE', headers: authHeader() });
    const data = await resp.json();
    if (data.success) { 
      showAlert(`Pengguna "${uname}" berhasil dihapus.`, 'success'); 
      loadUsers(); 
      // loadFiles is loaded from manage-files.js
      if (typeof loadFiles === 'function') loadFiles(); 
    }
    else showAlert(data.message || 'Gagal menghapus pengguna.');
  } catch (e) { showAlert('Terjadi kesalahan jaringan.'); }
}

// Inisialisasi awal
document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
});
