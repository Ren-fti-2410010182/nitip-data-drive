<?php
// Mulai session untuk memeriksa status login
session_start();

// Cek apakah pengguna sudah login dengan role user; jika tidak, redirect ke login
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'user') {
    header("Location: ../login.php");
    exit();
}

// Ambil informasi server/device untuk ditampilkan di dashboard
$device_info = array(
    'server_name' => $_SERVER['SERVER_NAME'],           // Nama server
    'server_addr' => $_SERVER['SERVER_ADDR'],           // Alamat IP server
    'server_port' => $_SERVER['SERVER_PORT'],           // Port server
    'os' => php_uname('s'),                             // Sistem operasi server
    'php_version' => phpversion(),                      // Versi PHP yang digunakan
    'max_upload' => ini_get('upload_max_filesize'),     // Batas maksimal upload file
    'server_time' => date('Y-m-d H:i:s')                // Waktu server sekarang
);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <!-- Deklarasi charset UTF-8 -->
    <meta charset="UTF-8">
    <!-- Viewport responsive untuk perangkat mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Judul halaman dashboard user -->
    <title>User Dashboard - Nitip Data Drive</title>
    <!-- Link ke Google Material Icons -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <style>
        /* Reset dasar untuk semua elemen */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;    /* Termasuk padding dan border ke dalam ukuran elemen */
        }

        /* Styling body utama */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;    /* Font default */
            background-color: #eef2f6;    /* Warna latar belakang halaman */
            color: #2c3e50;    /* Warna teks utama */
            min-height: 100vh;    /* Pastikan body setidaknya sebesar viewport */
        }

        /* Styling header atas */
        header {
            background-color: #34495e;    /* Warna biru gelap */
            color: #ffffff;    /* Teks putih */
            padding: 16px 28px;    /* Spasi di dalam header */
            display: flex;    /* Layout fleksibel */
            justify-content: space-between;    /* Jarak antara sisi kiri dan kanan */
            align-items: center;    /* Posisikan elemen secara vertikal di tengah */
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);    /* Bayangan lembut */
        }

        /* Bagian kiri header berisi logo dan teks */
        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        /* Kotak logo */
        .logo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            font-size: 18px;
        }

        /* Icon pada logo */
        .logo .material-icons {
            font-size: 28px;
            color: #f1c40f;
        }

        /* Judul header tengah */
        .header-title {
            font-size: 20px;
            letter-spacing: 0.5px;
        }

        /* Bagian kanan header berisi icon profil */
        .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        /* Tombol icon user */
        .user-icon {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 30px;
        }

        /* Layout utama wrapper */
        .wrapper {
            display: flex;
            gap: 20px;
            padding: 24px 28px 16px;    /* Padding atas, samping, bawah */
            max-width: 1400px;
            margin: 0 auto;
        }

        /* Styling sidebar kiri */
        .sidebar {
            width: 210px;    /* Lebar tetap sidebar */
            background-color: #ffffff;    /* Latar putih */
            border-radius: 14px;    /* Sudut melengkung */
            padding: 20px 16px;    /* Padding dalam sidebar */
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);    /* Bayangan */
            flex-shrink: 0;    /* Jangan mengecil */
        }

        /* Judul menu sidebar */
        .sidebar h2 {
            font-size: 16px;
            margin-bottom: 18px;
            letter-spacing: 0.3px;
        }

        /* Daftar menu sidebar */
        .sidebar nav ul {
            list-style: none;    /* Hilangkan bullet */
        }

        /* Item menu sidebar */
        .sidebar nav li {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 12px;
            border-radius: 10px;
            margin-bottom: 8px;
            cursor: pointer;
            color: #34495e;
            transition: background-color 0.25s ease, color 0.25s ease;
        }

        /* Item menu aktif atau hover */
        .sidebar nav li.active,
        .sidebar nav li:hover {
            background-color: #f1f5f9;
        }

        /* Ikon menu */
        .sidebar nav li .material-icons {
            font-size: 20px;
            color: #2980b9;
        }

        /* Konten utama halaman */
        main {
            flex: 1;    /* Mengisi sisa ruang */
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* Konten atas dengan dua kolom */
        .top-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;    /* Kolom kiri lebih lebar */
            gap: 20px;
        }

        /* Box komponen umum */
        .card {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
        }

        /* Judul box */
        .card h3 {
            font-size: 18px;
            margin-bottom: 18px;
            color: #2c3e50;
        }

        /* Box Info Device besar */
        .device-box {
            min-height: 260px;    /* Tinggi minimum kartu */
        }

        /* Styling item informasi dalam info device */
        .device-info {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
        }

        .device-item {
            background-color: #f7fbff;
            border-radius: 12px;
            padding: 16px;
        }

        .device-item span {
            display: block;
        }

        .device-label {
            font-weight: 700;
            margin-bottom: 8px;
            color: #34495e;
        }

        .device-value {
            font-size: 14px;
            color: #566477;
            word-break: break-word;
        }

        /* Box kecil Info/About */
        .about-box {
            min-height: 260px;    /* Tinggi minimum agar sejajar */
        }

        .about-text {
            line-height: 1.8;
            color: #4c5c74;
        }

        .about-text strong {
            color: #2c3e50;
        }

        /* Box riwayat bawah */
        .history-box {
            min-height: 260px;
        }

        /* List riwayat */
        .history-list {
            list-style: none;
            margin-top: 16px;
            display: grid;
            gap: 12px;
        }

        .history-item {
            background-color: #f7fbff;
            border-radius: 12px;
            padding: 16px;
            border-left: 4px solid #2980b9;
        }

        .history-item h4 {
            font-size: 15px;
            margin-bottom: 6px;
            color: #2c3e50;
        }

        .history-item p {
            color: #5b6775;
            font-size: 14px;
            line-height: 1.6;
        }

        /* Footer bawah halaman */
        footer {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 18px 24px;
            text-align: center;
            color: #5b6775;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            margin: 0 28px 28px;
        }

        /* Styling icon material di banyak elemen */
        .material-icons {
            font-size: 20px;
            vertical-align: middle;
        }

        /* Responsif untuk layar kecil */
        @media (max-width: 992px) {
            .wrapper {
                flex-direction: column;    /* Sidebar di atas konten */
                padding: 16px;
            }

            .top-grid {
                grid-template-columns: 1fr;    /* Semua konten menjadi satu kolom */
            }

            .sidebar {
                width: 100%;
            }
        }

        @media (max-width: 640px) {
            header {
                flex-direction: column;    /* Header menjadi vertikal */
                align-items: flex-start;
                gap: 12px;
            }

            .wrapper {
                padding: 12px;
            }

            .sidebar {
                padding: 16px 12px;
            }

            .card {
                padding: 18px;
            }
        }
    </style>
</head>
<body>
    <!-- Bagian header utama -->
    <header>
        <!-- Logo dan judul halaman -->
        <div class="header-left">
            <div class="logo">
                <span class="material-icons">cloud</span>
                <span>Nitip Data Drive</span>
            </div>
            <div class="header-title">Dashboard User</div>
        </div>

        <!-- Icon profil dan aksi kanan -->
        <div class="header-right">
            <button class="user-icon" onclick="showProfile()">
                <span class="material-icons">account_circle</span>
            </button>
        </div>
    </header>

    <!-- Konten wrapper utama -->
    <div class="wrapper">
        <!-- Sidebar navigasi di sebelah kiri -->
        <aside class="sidebar">
            <h2>Menu Navigasi</h2>
            <nav>
                <ul>
                    <li class="active">
                        <span class="material-icons">home</span>
                        <span>Dashboard</span>
                    </li>
                    <li>
                        <span class="material-icons">folder</span>
                        <span>File Saya</span>
                    </li>
                    <li>
                        <span class="material-icons">history</span>
                        <span>Riwayat</span>
                    </li>
                    <li>
                        <span class="material-icons">info</span>
                        <span>Tentang</span>
                    </li>
                    <li onclick="logout()">
                        <span class="material-icons">logout</span>
                        <span>Logout</span>
                    </li>
                </ul>
            </nav>
        </aside>

        <!-- Konten utama dashboard -->
        <main>
            <!-- Baris atas dengan dua kolom: Device info dan About -->
            <div class="top-grid">
                <!-- Kotak besar untuk informasi device/server -->
                <section class="card device-box">
                    <h3>INFO DEVICE/SERVER</h3>
                    <div class="device-info">
                        <div class="device-item">
                            <span class="device-label">Server Name</span>
                            <span class="device-value"><?php echo $device_info['server_name']; ?></span>
                        </div>
                        <div class="device-item">
                            <span class="device-label">Server Address</span>
                            <span class="device-value"><?php echo $device_info['server_addr']; ?></span>
                        </div>
                        <div class="device-item">
                            <span class="device-label">Port</span>
                            <span class="device-value"><?php echo $device_info['server_port']; ?></span>
                        </div>
                        <div class="device-item">
                            <span class="device-label">Operating System</span>
                            <span class="device-value"><?php echo $device_info['os']; ?></span>
                        </div>
                        <div class="device-item">
                            <span class="device-label">PHP Version</span>
                            <span class="device-value"><?php echo $device_info['php_version']; ?></span>
                        </div>
                        <div class="device-item">
                            <span class="device-label">Max Upload</span>
                            <span class="device-value"><?php echo $device_info['max_upload']; ?></span>
                        </div>
                        <div class="device-item">
                            <span class="device-label">Server Time</span>
                            <span class="device-value"><?php echo $device_info['server_time']; ?></span>
                        </div>
                    </div>
                </section>

                <!-- Kotak kecil untuk info/about -->
                <section class="card about-box">
                    <h3>Info / About</h3>
                    <p class="about-text">
                        Selamat datang di dashboard user Nitip Data Drive. Di halaman ini, Anda dapat melihat informasi server, riwayat aktivitas, dan akses cepat ke file Anda.
                        <strong>Platform ini</strong> dirancang untuk membantu Anda menyimpan dan mengelola file secara mudah dan aman.
                    </p>
                    <p class="about-text" style="margin-top: 14px;">
                        Jika Anda memerlukan bantuan, silakan gunakan fitur dukungan atau hubungi administrator sistem untuk mendapatkan informasi lebih lanjut.
                    </p>
                </section>
            </div>

            <!-- Kotak riwayat di bawah -->
            <section class="card history-box">
                <h3>Riwayat</h3>
                <ul class="history-list">
                    <li class="history-item">
                        <h4>Upload file dokumen</h4>
                        <p>Anda berhasil mengunggah dokumen laporan ke folder pribadi pada tanggal 2026-04-09.</p>
                    </li>
                    <li class="history-item">
                        <h4>Download backup</h4>
                        <p>Anda mengunduh file backup data pada tanggal 2026-04-08.</p>
                    </li>
                    <li class="history-item">
                        <h4>Login terakhir</h4>
                        <p>Terakhir kali Anda masuk ke dashboard pada tanggal 2026-04-10 pukul 09:34.</p>
                    </li>
                    <li class="history-item">
                        <h4>Perubahan profil</h4>
                        <p>Anda memperbarui informasi profil pada tanggal 2026-04-05.</p>
                    </li>
                </ul>
            </section>
        </main>
    </div>

    <!-- Footer dengan copyright -->
    <footer>
        &copy; 2026 Nitip Data Drive. Semua hak dilindungi.
    </footer>

    <script>
        // Fungsi menampilkan alert profil
        function showProfile() {
            alert('Akses profil pengguna');
        }

        // Fungsi logout dengan konfirmasi sebelum pindah halaman
        function logout() {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                window.location.href = '../login.php';
            }
        }

        // Tambahkan event listener untuk menu sidebar agar active item berubah ketika diklik
        document.querySelectorAll('.sidebar nav li').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.sidebar nav li').forEach(li => li.classList.remove('active'));
                this.classList.add('active');
            });
        });
    </script>
</body>
</html>
