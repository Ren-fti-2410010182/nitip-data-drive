<?php
// Mulai session untuk menyimpan data pengguna
session_start();

// Cek apakah pengguna sudah login dan memiliki role admin
// Jika tidak, redirect ke halaman login
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: ../login.php");
    exit();
}

// Membuat array untuk menyimpan informasi device/server
// Mengambil data dari $_SERVER superglobal dan function PHP bawaan
$device_info = array(
    'server_name' => $_SERVER['SERVER_NAME'],           // Nama server
    'server_addr' => $_SERVER['SERVER_ADDR'],           // Alamat IP server
    'server_port' => $_SERVER['SERVER_PORT'],           // Port server
    'os' => php_uname('s'),                             // Sistem operasi
    'php_version' => phpversion(),                      // Versi PHP
    'max_upload' => ini_get('upload_max_filesize'),     // Ukuran upload maksimal
    'server_time' => date('Y-m-d H:i:s')                // Waktu server saat ini
);
?>
<!DOCTYPE html>
<!-- Deklarasi tipe dokumen HTML5 -->
<html lang="id">
<!-- Bahasa dokumen set ke Bahasa Indonesia -->
<head>
    <!-- Meta tag charset untuk mendeklarasikan encoding UTF-8 -->
    <meta charset="UTF-8">
    <!-- Meta tag viewport untuk responsive design pada perangkat mobile -->
    <met/* Reset CSS - menghilangkan margin dan padding default dari semua elemen */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;    /* Memastikan padding dan border termasuk dalam lebar/tinggi */
        }

        /* Styling untuk body halaman */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;    /* Font utama */
            background-color: #f5f5f5;    /* Warna latar belakang halaman */
            color: #333;    /* Warna teks default */
        }

        /* ===== STYLING HEADER ===== */
        header {
            background-color: #2c3e50;    /* Warna latar belakang header (abu-abu gelap) */
            color: white;    /* Warna teks header */
            padding: 15px 30px;    /* Padding dalam header */
            display: flex;    /* Menggunakan flexbox untuk layout */
            justify-content: space-between;    /* Menempatkan item di kedua ujung */
            align-items: center;    /* Menyelaraskan item secara vertikal */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);    /* Bayangan di bawah header */
        }

        /* Bagian kiri header (logo dan judul) */
        .header-left {
            display: flex;    /* Menggunakan flexbox */
            align-items: center;    /* Align vertikal ke tengah */
            gap: 10px;    /* Jarak antar elemen */
            font-size: 20px;    /* Ukuran font */
            font-weight: bold;    /* Font tebal */
        }

        /* Icon menu di header kiri */
        .header-left span {
            padding: 5px 10px;    /* Padding dalam icon */
            background-color: rgba(255,255,255,0.2);    /* Warna latar belakang semi-transparan */
            border-radius: 4px;    /* Sudut melengkung */
            cursor: pointer;    /* Cursor berubah saat hover */
        }

        /* Styling untuk logo */
        .logo {
            display: flex;    /* Menggunakan flexbox */
            align-items: center;    /* Align ke tengah */
            gap: 8px;    /* Jarak antar elemen */
        }

        /* Icon Material di dalam logo */
        .logo .material-icons {
            font-size: 28px;    /* Ukuran icon */
        }

        /* Judul header */
        .header-title {
            font-size: 18px;    /* Ukuran font */
            font-weight: 500;    /* Ketebalan font */
        }

        /* Bagian kanan header (user icon) */
        .header-right {
            display: flex;    /* Menggunakan flexbox */
            align-items: center;    /* Align vertikal ke tengah */
            gap: 15px;    /* Jarak antar elemen */
        }

        /* Styling untuk user icon button */
        .user-icon {
            background: none;    /* Tidak ada latar belakang */
            border: none;    /* Tidak ada border */
            color: white;    /* Warna icon putih */
            font-size: 28px;    /* Ukuran icon */
            cursor: pointer;    /* Cursor berubah saat hover */
            display: flex;    /* Menggunakan flexbox */
            align-items: center;    /* Align ke tengah */
           ===== STYLING CONTAINER UTAMA ===== */
        /* Wrapper untuk menggabungkan sidebar dan main content */
        .wrapper {
            display: flex;    /* Menggunakan flexbox */
            min-height: calc(100vh - 140px);    /* Tinggi minimum = tinggi viewport - header dan footer */
        }

        /* ===== STYLING SIDEBAR ===== */
        .sidebar {
            width: 200px;    /* Lebar sidebar */
            background-color: #ecf0f1;    /* Warna latar belakang sidebar */
            padding: 20px 0;    /* Padding vertikal */
            border-right: 1px solid #bdc3c7;    /* Border di sisi kanan */
        }

        /* Menu list di sidebar */
        .sidebar nav ul {
            list-style: none;    /* Menghilangkan bullet points */
        }

        /* Item menu sidebar */
        .sidebar nav li {
            padding: 15px 20px;    /* Padding dalam item */
            cursor: pointer;    /* Cursor berubah saat hover */
            display: flex;    /* Menggunakan flexbox */
            align-items: center;    /* Align vertikal ke tengah */
            gap: 10px;    /* Jarak antar elemen */
            color: #2c3e50;    /* Warna teks */
            transition: background-color 0.3s;    /* Animasi perubahan warna background */
            border-left: 4px solid transparent;    /* Border kiri dengan warna transparent */
        }

        /* Styling saat item menu di-hover atau active */
        .sidebar nav li:hover,
        .sidebar nav li.active {
            background-color: #d5dbdb;    /* Warna latar belakang saat hover/active */
            border-left-color: #3498db;    /* Warna border kiri saat hover/active (biru) */
        }

        /* Icon Material di dalam item menu */
        .sidebar nav li .material-icons {
            font-size: 20px;    /* Ukuran icon */
        }

        /* ===== STYLING MAIN CONTENT ===== */
        main {
        /* Styling container umum untuk konten */
        .content {
            background-color: white;    /* Warna latar belakang */
            border-radius: 8px;    /* Sudut melengkung */
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);    /* Bayangan */
            overflow: hidden;    /* Menghilangkan overflow */
        }

        /* ===== LAYOUT GRID UNTUK BAGIAN ATAS ===== */
        /* Menggunakan grid 2 kolom untuk input user dan info device */
        .content-top {
            display: grid;    /* Menggunakan grid layout */
            grid-template-columns: 1fr 1fr;    /* 2 kolom dengan lebar sama */
            gap: 20px;    /* Jarak antara kolom */
            margin-bottom: 20px;    /* Margin di bawah */
        }

        /* ===== STYLING BOX INPUT DAN INFO DEVICE ===== */
        /* Styling untuk box input user dan info device */
        .input-user-box,
        .info-device-box {
            background-color: white;    /* Warna latar belakang putih */
            border-radius: 8px;    /* Sudut melengkung */
            padding: 20px;    /* Padding dalam box */
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);    /* Bayangan */
        }

        /* Styling untuk judul box */
        .box-title {
            font-size: 16px;    /* Ukuran font */
            font-weight: 600;    /* Font tebal */
            color: #2c3e50;    /* Warna teks */
        /* ===== STYLING FORM ===== */
        /* Grup form (label + input) */
        .form-group {
            margin-bottom: 15px;    /* Margin di bawah setiap group */
        }

        /* Label dalam form group */
        .form-group label {
            display: block;    /* Display sebagai block */
            margin-bottom: 5px;    /* Margin di bawah label */
            font-weight: 500;    /* Font tebal */
            color: #2c3e50;    /* Warna teks */
            font-size: 14px;    /* Ukuran font */
        }

        /* Input dan select field */
        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group select {
            width: 100%;    /* Lebar penuh */
            padding: 10px;    /* Padding dalam input */
            border: 1px solid #bdc3c7;    /* Border abu-abu */
            border-radius: 4px;    /* Sudut melengkung */
            font-size: 14px;    /* Ukuran font */
            font-family: inherit;    /* Warisan font dari parent */
        }

        /* Styling saat input di-focus */
        .form-group input:focus,
        .form-group select:focus {
            outline: none;    /* Menghilangkan outline default */
            border-color: #3498db;    /* Border berubah menjadi biru */
            box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);    /* Bayangan biru */
        }

        /* ===== STYLING TOMBOL ===== */
        /* Container untuk tombol */
        .button-group {
            display: flex;    /* Menggunakan flexbox */
            gap: 10px;    /* Jarak antar tombol */
            margin-top: 20px;    /* Margin di atas */
        }

        /* Styling umum untuk semua tombol dalam button-group */
        .button-group button {
            flex: 1;    /* Lebar sama untuk semua tombol */
            padding: 10px;    /* Padding dalam tombol */
            border: none;    /* Tidak ada border */
            border-radius: 4px;    /* Sudut melengkung */
            font-size: 14px;    /* Ukuran font */
            font-weight: 600;    /* Font tebal */
            cursor: pointer;    /* Cursor berubah */
            transition: background-color 0.3s;    /* Animasi perubahan warna */
            display: flex;    /* Menggunakan flexbox */
            align-items: center;    /* Align ke tengah */
            justify-content: center;    /* Center konten */
            gap: 8px;    /* Jarak antar icon dan teks */
        }

        /* Styling tombol Create (hijau) */
        .btn-create {
            background-color: #27ae60;    /* Warna hijau */
            color: white;    /* Warna teks putih */
        }

        /* Hover effect tombol Create */
        .btn-create:hover {
            background-color: #229954;    /* Hijau lebih gelap */
        }

        /* Styling tombol Edit (biru) */
        .btn-edit {
            background-color: #3498db;    /* Warna biru */
            color: white;    /* Warna teks putih */
        }

        /* Hover effect tombol Edit */
        .btn-edit:hover {
           ===== STYLING INFO DEVICE BOX ===== */
        /* Styling khusus untuk info device box dengan gradient */
        .info-device-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);    /* Gradient ungu */
            color: white;    /* Warna teks putih */
        }

        /* Styling judul di info device box */
        .info-device-box .box-title {
            border-bottom-color: rgba(255,255,255,0.3);    /* Border putih semi-transparan */
            color: white;    /* Warna teks putih */
        }

        /* Styling untuk setiap item info (label: value) */
        .info-item {
            display: flex;    /* Menggunakan flexbox */
            justify-content: space-between;    /* Item di kedua ujung */
            padding: 10px 0;    /* Padding vertikal */
            border-bottom: 1px solid rgba(255,255,255,0.2);    /* Border bawah putih semi-transparan */
            font-size: 14px;    /* Ukuran font */
        }

        /* Menghilangkan border bottom dari item terakhir */
        .info-item:last-child {
            border-bottom: none;    /* Tidak ada border */
        }

        /* Styling label dalam info item */
        .info-label {
            font-weight: 600;    /* Font tebal */
        }

        /* Styling value dalam info item */
        .info-value {
            text-align: right;    /* Teks rata kanan */
            word-break: break-all;    /* Potong kata jika terlalu panjang */
            max-width: 50%;    /* Lebar maksimal 50% */r: #c0392b;
        }

        /* Info Device Box */
        .info-device-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           ===== STYLING DATA USER TABLE ===== */
        /* Container untuk tabel user data */
        .data-user-box {
            background-color: white;    /* Warna latar belakang putih */
            border-radius: 8px;    /* Sudut melengkung */
            padding: 20px;    /* Padding dalam box */
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);    /* Bayangan */
            margin-bottom: 20px;    /* Margin di bawah */
        }

        /* Container yang bisa di-scroll horizontal */
        .table-responsive {
            overflow-x: auto;    /* Scroll horizontal jika diperlukan */
        }

        /* Styling umum untuk tabel */
        table {
            width: 100%;    /* Lebar penuh */
            border-collapse: collapse;    /* Menggabungkan border */
        }

        /* Styling header tabel */
        table thead {
            background-color: #34495e;    /* Warna abu-abu gelap */
            color: white;    /* Warna teks putih */
        }

        /* Styling cell header tabel */
        table th {
            padding: 12px;    /* Padding dalam cell */
            text-align: left;    /* Teks rata kiri */
            font-weight: 600;    /* Font tebal */
            font-size: 14px;    /* Ukuran font */
        }

        /* Styling cell data tabel */
        table td {
            padding: 12px;    /* Padding dalam cell */
            border-bottom: 1px solid #ecf0f1;    /* Border bawah */
            font-size: 14px;    /* Ukuran font */
        }

        /* Styling saat baris tabel di-hover */
        table tbody tr:hover {
            background-color: #f8f9fa;    /* Warna latar belakang abu-abu muda */
        }

        /* ===== STYLING STATUS BADGE ===== */
        /* Styling untuk badge status */
        .status-badge {
            display: inline-block;    /* Display inline-block */
            padding: 4px 12px;    /* Padding dalam badge */
            border-radius: 20px;    /* Sudut melengkung seperti pill */
            font-size: 12px;    /* Ukuran font kecil */
            font-weight: 600;    /* Font tebal */
        }

        /* Badge status active (hijau) */
        .status-active {
            background-color: #d4edda;    /* Warna latar hijau muda */
            color: #155724;    /* Warna teks hijau gelap */
        }

        /* Badge status inactive (merah) */
        .status-inactive {
            background-color: #f8d7da;    /* Warna latar merah muda */
            color: #721c24;    /* Warna teks merah gelap */
        }

        /* ===== STYLING ACTION BUTTONS ===== */
        /* Container untuk tombol action dalam tabel */
        .action-buttons {
            display: flex;    /* Menggunakan flexbox */
            gap: 5px;    /* Jarak antar tombol */
        }

        /* Styling tombol action dalam tabel */
        .action-buttons button {
            padding: 4px 8px;    /* Padding kecil */
            border: none;    /* Tidak ada border */
            border-radius: 3px;    /* Sudut sedikit melengkung */
            font-size: 12px;    /* Ukuran font kecil */
            cursor: pointer;    /* Cursor berubah */
            display: flex;    /* Menggunakan flexbox */
            align-items: center;    /* Align ke tengah */
            gap: 4px;    /* Jarak antar icon dan teks */
            transition: background-color 0.3s;    /* Animasi perubahan warna */
        }

        /* Tombol action edit (biru) */
        .btn-action-edit {
            background-color: #3498db;    /* Warna biru */
            color: white;    /* Warna teks putih */
        }===== STYLING FOOTER ===== */
        footer {
            background-color: #2c3e50;    /* Warna latar belakang abu-abu gelap */
            color: white;    /* Warna teks putih */
            padding: 20px;    /* Padding dalam footer */
            text-align: center;    /* Teks di tengah */
            border-top: 1px solid #1a252f;    /* Border atas */
        }

        /* Paragraph dalam footer */
        footer p {
            font-size: 14px;    /* Ukuran font */
        }

        /* ===== STYLING MATERIAL ICONS ===== */
        .material-icons {
            font-size: 20px;    /* Ukuran font icon */
            vertical-align: middle;    /* Align vertikal ke tengah */
        }

        /* ===== RESPONSIVE DESIGN UNTUK MOBILE ===== */
        @media (max-width: 768px) {    /* Screen size maksimal 768px (tablet/mobile) */
            /* Mengubah grid 2 kolom menjadi 1 kolom */
            .content-top {
                grid-template-columns: 1fr;    /* 1 kolom penuh */
            }

            /* Membuat sidebar lebih sempit di mobile */
            .sidebar {
                width: 150px;    /* Lebar lebih kecil */
            }

            /* Padding main content lebih kecil */
            main {
                padding: 20px;    /* Padding lebih kecil */
            }

            /* Font tabel lebih kecil */
            table {
                font-size: 12px;    /* Ukuran font lebih kecil */
            }

            /* Padding cell tabel lebih kecil */
            table th,
            table td {
                padding: 8px;    /* Padding lebih kecil */
            }

            /* Tombol stack vertikal di mobile */
            .button-group {
                flex-direction: column;    /* Stack vertikal */

        .btn-action-delete:hover {
            background-color: #c0392b;
        }

        /* Footer */
        footer {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #1a252f;
        }

        footer p {
            font-size: 14px;
        }

        .material-icons {
            font-size: 20px;
            vertical-align: middle;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .content-top {
                grid-template-columns: 1fr;
            }

            .sidebar {
                width: 150px;
            }

            main {
                padding: 20px;
            }

            table {
                font-size: 12px;
            }

            table th,
            table td {
                padding: 8px;
            }

            .button-group {
                flex-direction: column;
            }
        }
    </style>
    <!-- Akhir tag style -->
</head>
<!-- Akhir tag head -->
<body>
    <!-- ===== HEADER SECTION ===== -->
    <header>
        <!-- Bagian kiri header -->
        <div class="header-left">
            <!-- Icon menu untuk toggle sidebar (hanya mobile) -->
            <span class="material-icons" onclick="toggleSidebar()" style="cursor: pointer;">menu</span>
            <!-- Logo dengan icon -->
            <div class="logo">
                <span class="material-icons">cloud_upload</span>
            </div>
            <!-- Judul header -->
            <div class="header-title">LOGO Header</div>
        </div>
        <!-- Bagian kanan header -->
        <div class="header-right">
            <!-- Tombol user icon -->
            <button class="user-icon">
                <span class="material-icons">account_circle</span>
            </button>
        </div>
    </header>

    <!-- ===== MAIN WRAPPER ===== -->
    <div class="wrapper">
        <!-- ===== SIDEBAR ===== -->
        <aside class="sidebar" id="sidebar">
            <!-- Navigation menu sidebar -->
            <nav>
                <ul>
                    <!-- Menu Dashboard -->
                    <li class="active">
                        <span class="material-icons">dashboard</span>
                        <span>Dashboard</span>
                    </li>
                    <!-- Menu Users -->
                    <li>
                        <span class="material-icons">people</span>
                        <span>Users</span>
                    </li>
                    <!-- Menu Storage -->
                    <li>
                        <span class="material-icons">storage</span>
                        <span>Storage</span>
                    </li>
                    <!-- Menu Settings -->
                    <li>
                        <span class="material-icons">settings</span>
                        <span>Settings</span>
                    </li>
                    <!-- Menu Logout -->
                    <li>
                        <span class="material-icons">logout</span>
                        <span>Logout</span>
                    </li>
                </ul>
            </nav>
        </aside>

        <!-- ===== MAIN CONTENT AREA ===== -->
        <main>
            <!-- ===== TOP SECTION: INPUT USER & INFO DEVICE ===== -->
            <!-- Container grid untuk layout 2 kolom -->
            <div class="content-top">
                <!-- ===== LEFT COLUMN: INPUT USER FORM ===== -->
                <div class="input-user-box">
                    <!-- Judul Input User Box -->
                    <div class="box-title">INPUT USER</div>
                    <!-- Form untuk input user baru -->
                    <form id="userForm">
                        <!-- Form group: Username -->
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" placeholder="Enter username" required>
                        </div>
                        <!-- Form group: Email -->
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" placeholder="Enter email" required>
                        </div>
                        <!-- Form group: Role -->
                        <div class="form-group">
                            <label for="role">Role</label>
                            <select id="role" name="role" required>
                                <option value="">Select Role</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <!-- Container untuk tombol action -->
                        <div class="button-group">
                            <!-- Tombol Create untuk membuat user baru (submit form) -->
                            <button type="submit" class="btn-create">
                                <span class="material-icons">add</span>
                                Create
                            </button>
                            <!-- Tombol Edit untuk mengubah data user -->
                            <button type="button" class="btn-edit" onclick="editUser()">
                                <span class="material-icons">edit</span>
                                Edit
                            </button>
                            <!-- Tombol Delete untuk menghapus user -->
                            <button type="button" class="btn-delete" onclick="deleteUser()">
                                <span class="material-icons">delete</span>
                                Delete
                            </button>
                        </div>
                    </form>
                </div>

                <!-- ===== RIGHT COLUMN: INFO DEVICE/SERVER ===== -->
                <div class="info-device-box">
                    <!-- Judul Info Device Box -->
                    <div class="box-title">INFO DEVICE/SERVER</div>
                    <!-- Item info: Server Name -->
                    <div class="info-item">
                        <span class="info-label">Server Name:</span>
                        <span class="info-value"><?php echo $device_info['server_name']; ?></span>
                    </div>
                    <!-- Item info: Server Address -->
                    <div class="info-item">
                        <span class="info-label">Server Address:</span>
                        <span class="info-value"><?php echo $device_info['server_addr']; ?></span>
                    </div>
                    <!-- Item info: Port -->
                    <div class="info-item">
                        <span class="info-label">Port:</span>
                        <span class="info-value"><?php echo $device_info['server_port']; ?></span>
                    </div>
                    <!-- Item info: Operating System -->
                    <div class="info-item">
                        <span class="info-label">OS:</span>
                        <span class="info-value"><?php echo $device_info['os']; ?></span>
                    </div>
                    <!-- Item info: PHP Version -->
                    <div class="info-item">
                        <span class="info-label">PHP Version:</span>
                        <span class="info-value"><?php echo $device_info['php_version']; ?></span>
                    </div>
                    <!-- Item info: Max Upload Size -->
                    <div class="info-item">
                        <span class="info-label">Max Upload:</span>
                        <span class="info-value"><?php echo $device_info['max_upload']; ?></span>
                    </div>
                    <!-- Item info: Server Time -->
                    <div class="info-item">
                        <span class="info-label">Server Time:</span>
                        <span class="info-value"><?php echo $device_info['server_time']; ?></span>
                    </div>
                </div>
            </div>

            <!-- ===== DATA USER TABLE SECTION ===== -->
            <!-- Container untuk tabel data user -->
            <div class="data-user-box">
                <!-- Judul Data User Box -->
                <div class="box-title">DATA AKUN USER</div>
                <!-- Container responsive untuk tabel (bisa di-scroll horizontal) -->
                <div class="table-responsive">
                    <!-- Tabel data user -->
                    <table>
                        <!-- Header tabel -->
                        <thead>
                            <tr>
                                <!-- Kolom nomor urut -->
                                <th>No</th>
                                <!-- Kolom username -->
                                <th>Username</th>
                                <!-- Kolom email -->
                                <th>Email</th>
                                <!-- Kolom role user -->
                                <th>Role</th>
                                <!-- Kolom status (Active/Inactive) -->
                                <th>Status</th>
                                <!-- Kolom tanggal dibuat -->
                                <th>Created</th>
                                <!-- Kolom untuk action buttons -->
                                <th>Action</th>
                            </tr>
                        </thead>
                        <!-- Body tabel dengan data -->
                        <tbody id="userTableBody">
                            <!-- ===== SAMPLE DATA - ROW 1 ===== -->
                            <tr>
                                <td>1</td>
                                <td>john_doe</td>
                                <td>john@example.com</td>
                                <td>Admin</td>
                                <!-- Status badge active -->
                                <td><span class="status-badge status-active">Active</span></td>
                                <td>2025-01-15</td>
                                <!-- Action buttons (edit & delete) -->
                                <td>
                                    <div class="action-buttons">
                                        <!-- Tombol edit untuk row ini -->
                                        <button class="btn-action-edit" title="Edit">
                                            <span class="material-icons">edit</span>
                                        </button>
                                        <!-- Tombol delete untuk row ini -->
                                        <button class="btn-action-delete" title="Delete">
                                            <span class="material-icons">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <!-- ===== SAMPLE DATA - ROW 2 ===== -->
                            <tr>
                                <td>2</td>
                                <td>jane_smith</td>
                                <td>jane@example.com</td>
                                <td>User</td>
                                <!-- Status badge active -->
                                <td><span class="status-badge status-active">Active</span></td>
         ===== FOOTER SECTION ===== -->
    <footer>
        <!-- Copyright text -->
        <p>&copy; 2026 Nitip Data Drive. All rights reserved.</p>
    </footer>

    <!-- ===== JAVASCRIPT SECTION ===== -->
    <script>
        // ===== FUNCTION: TOGGLE SIDEBAR =====
        // Fungsi untuk menampilkan/menyembunyikan sidebar (untuk mobile)
        function toggleSidebar() {
            // Ambil elemen sidebar dari DOM menggunakan ID
            const sidebar = document.getElementById('sidebar');
            // Cek apakah sidebar sedang tersembunyi (display: none)
            // Jika tersembunyi, tampilkan / jika ditampilkan, sembunyikan
            sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
        }

        // ===== FUNCTION: CREATE USER =====
        // Fungsi untuk membuat user baru
        function createUser() {
            // Ambil form dari DOM menggunakan ID
            const form = document.getElementById('userForm');
            // Cek apakah form valid (semua field required terisi)
            if (form.checkValidity()) {
                // Tampilkan alert sukses
                alert('User created successfully!');
                // Reset form untuk membersihkan input fields
                form.reset();
            }
        }

        // ===== FUNCTION: EDIT USER =====
        // Fungsi untuk mengedit user yang sudah ada
        function editUser() {
            // Ambil nilai username dari input field
            const username = document.getElementById('username').value;
            // Cek apakah username sudah diisi
            if (username) {
                // Tampilkan alert dengan nama user yang akan diedit
                alert('Editing user: ' + username);
            } else {
                // Tampilkan peringatan jika belum memilih user
                alert('Please select a user to edit');
            }
        }

        // ===== FUNCTION: DELETE USER =====
        // Fungsi untuk menghapus user
        function deleteUser() {
            // Ambil nilai username dari input field
            const username = document.getElementById('username').value;
            // Cek apakah username sudah diisi
            if (username) {
                // Tampilkan dialog konfirmasi penghapusan
                if (confirm('Are you sure you want to delete ' + username + '?')) {
                    // Jika user klik OK, tampilkan alert sukses
                    alert('User deleted successfully!');
                    // Reset form setelah penghapusan
                    document.getElementById('userForm').reset();
                }
            } else {
                // Tampilkan peringatan jika belum memilih user
                alert('Please select a user to delete');
            }
        }

        // ===== EVENT LISTENER: FORM SUBMISSION =====
        // Ambil element form
        document.getElementById('userForm').addEventListener('submit', function(e) {
            // Prevent default form submission behavior
            e.preventDefault();
            // Panggil fungsi createUser
            createUser();
        });

        // ===== EVENT LISTENER: SIDEBAR MENU ITEMS =====
        // Ambil semua elemen menu di sidebar
        document.querySelectorAll('.sidebar nav li').forEach((item, index) => {
            // Skip logout menu (index 4) karena memiliki fungsi khusus
            if (index !== 4) {
                // Tambahkan event listener untuk setiap menu item
                item.addEventListener('click', function() {
                    // Hapus class active dari semua menu items
                    document.querySelectorAll('.sidebar nav li').forEach(li => li.classList.remove('active'));
                    // Tambahkan class active ke menu item yang diklik
                    this.classList.add('active');
                });
            }
        });

        // ===== EVENT LISTENER: LOGOUT BUTTON =====
        // Ambil menu logout (item ke-5, index 4)
        document.querySelectorAll('.sidebar nav li')[4].addEventListener('click', function() {
            // Tampilkan dialog konfirmasi logout
            if (confirm('Are you sure you want to logout?')) {
                // Jika user klik OK, redirect ke halaman login
                window.location.href = '../login.php';
            }
        });

        // ===== EVENT LISTENER: USER ICON CLICK =====
        // Ambil element user icon button
        document.querySelector('.user-icon').addEventListener('click', function() {
            // Tampilkan alert saat user icon diklik
            alert('User Profile');
        });
    </script>
</body>
<!-- Akhir tag body -->
</html>
<!-- Akhir tag html --  function deleteUser() {
            const username = document.getElementById('username').value;
            if (username) {
                if (confirm('Are you sure you want to delete ' + username + '?')) {
                    alert('User deleted successfully!');
                    document.getElementById('userForm').reset();
                }
            } else {
                alert('Please select a user to delete');
            }
        }

        // Form submission
        document.getElementById('userForm').addEventListener('submit', function(e) {
            e.preventDefault();
            createUser();
        });

        // Add click event to sidebar items
        document.querySelectorAll('.sidebar nav li').forEach((item, index) => {
            if (index !== 4) { // Skip logout
                item.addEventListener('click', function() {
                    document.querySelectorAll('.sidebar nav li').forEach(li => li.classList.remove('active'));
                    this.classList.add('active');
                });
            }
        });

        // Logout handler
        document.querySelectorAll('.sidebar nav li')[4].addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '../login.php';
            }
        });

        // User icon click
        document.querySelector('.user-icon').addEventListener('click', function() {
            alert('User Profile');
        });
    </script>
</body>
</html>
