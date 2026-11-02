# 🚀 Template 4 - Modern Portfolio & Dynamic CMS Website

Sebuah website portofolio modern, interaktif, dan berkecepatan tinggi yang dilengkapi dengan **Halaman Admin (CMS)** mandiri, integrasi real-time database via **Google Cloud Firestore**, sistem autentikasi **Firebase Auth**, pemilihan tema (Dark/Light mode & custom accent colors), serta formulir kontak terintegrasi dengan **Formspree**.

---

## 📌 Informasi Modifikasi & Atribusi Lisensi Asli

> [!NOTE]
> **Pernyataan Proyek Modifikasi:**  
> Proyek ini merupakan **hasil modifikasi, kustomisasi, dan pengembangan lanjutan** (*modified & extended project*) dari template desain portofolio asli.
>
> Hak cipta serta atribusi desain asli tetap menjadi milik pembuat aslinya dan tercantum secara transparan pada bagian lisensi di footer web:
> - **Desainer / Pengembang Asli:** [Laurent Begey](https://lbegey78.gumroad.com/)
> - **Distributor Template Asli:** [ThemeWagon](https://themewagon.com/)
> - **Kredit Footer:** Dapat dilihat pada komponen footer website ([`components/Footer.tsx`](components/Footer.tsx)), sesuai lisensi atribusi awal.

---

## 🛠️ Detail Framework & Teknologi yang Digunakan

Website ini dibangun menggunakan stack teknologi modern untuk performa maksimal, skalabilitas kode, dan kemudahan pengelolaan konten:

| Kategori | Teknologi / Library | Versi | Kegunaan & Penjelasan |
| :--- | :--- | :--- | :--- |
| **Core Framework** | [Next.js](https://nextjs.org/) | `^15.3.3` | Framework React modern dengan **App Router** (`app/`), optimasi metadata otomatis, dan fitur **Static Site Generation** (`output: 'export'`) sehingga dapat di-host di CDN statis manapun secara gratis dan ultra-cepat. |
| **UI Library** | [React](https://react.dev/) & [React DOM](https://react.dev/) | `^19.0.0` | Library UI berbasis komponen, hooks, dan reactive client-side rendering. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^5.7.3` | Menyediakan static typing untuk menjaga keandalan kode, keamanan tipe data antarmuka (interfaces/types), dan mempermudah pemeliharaan jangka panjang. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & [PostCSS](https://postcss.org/) | `^4.0.0` / `^8.5.1` | Utility-first CSS framework versi terbaru dengan engine performa tinggi, mendukung kustomisasi tema dinamis (Dark/Light mode & accent color switcher). |
| **Icons** | [Lucide React](https://lucide.dev/) | `^0.475.0` | Koleksi ikon SVG modern, ringan, dan elegan untuk antarmuka navigasi dan dashboard admin. |
| **Database & Auth** | [Firebase Web SDK](https://firebase.google.com/) | `^12.17.1` | Mengelola autentikasi admin via **Firebase Auth** dan penyimpanan data dinamis secara real-time via **Cloud Firestore**. |
| **Web Hosting** | [Firebase Hosting](https://firebase.google.com/docs/hosting) | - | Penyedia hosting statis global dengan integrasi SSL gratis, CDN cepat, dan kemudahan deployment via Firebase CLI. |
| **Form Handling** | [Formspree](https://formspree.io/) | Serverless API | Meneruskan pesan dari formulir kontak web (*Get In Touch*) langsung ke email pribadi tanpa memerlukan server backend terpisah. |
| **Media Optimizer** | Google Drive CDN Helper | Custom Module | Modul kustom (`lib/drive-helper.ts`) untuk mengubah URL share Google Drive menjadi link gambar langsung yang teroptimasi. |

---

## ✨ Fitur-Fitur Utama

1. **🎨 100% No-Code Content Management (CMS)**:
   - Ubah seluruh teks Hero, Pengalaman/What I Do, Tentang Saya, Proyek, Studi Kasus, dan Blog langsung dari Halaman Admin (`/admin`).
   - Tidak perlu mengubah baris kode atau melakukan *rebuild* aplikasi setiap ada perubahan konten.
2. **🌗 Dark Mode, Light Mode & Custom Accent Color**:
   - Dukungan tema Gelap & Terang yang tersimpan secara lokal dan sinkron dengan pengaturan admin.
   - Pilihan warna aksen (oranye, biru, hijau, ungu, atau custom hex).
3. **⚡ Static Site Generation (SSG) + Real-time Hydration**:
   - Website di-export menjadi static HTML (`out/`) untuk loading super cepat dan keamanan tinggi.
   - Data dinamis diperbarui secara otomatis menggunakan Firestore `onSnapshot`.
4. **💬 Blog Interaktif & Komentar Real-time**:
   - Pengunjung dapat membaca artikel blog dan mengirimkan komentar secara langsung.
   - Admin dapat meninjau dan menghapus komentar yang tidak pantas melalui dashboard admin.
5. **📊 Pemantau Statistik Kunjungan Web**:
   - Dashboard admin dilengkapi ringkasan total kunjungan web (pageviews) dan informasi sisa kuota Firebase Spark Plan.
6. **📬 Formulir Kontak Formspree Terintegrasi**:
   - Pengunjung dapat mengirim pesan langsung ke inbox email pemilik website.

---

## 📁 Struktur Direktori Proyek

```text
├── app/                      # Direktori Next.js App Router
│   ├── admin/                # Halaman Dashboard CMS & Login Admin
│   ├── blog/                 # Halaman index blog dan detail artikel
│   ├── case-study/           # Halaman detail studi kasus proyek
│   ├── projects/             # Halaman showcase daftar proyek
│   ├── layout.tsx            # Root layout, metadata & providers
│   ├── page.tsx              # Halaman beranda (Home) utama
│   └── globals.css           # Styling global Tailwind CSS
├── components/               # Komponen UI modular
│   ├── Header.tsx            # Navigasi & logo
│   ├── Footer.tsx            # Footer dengan kredit lisensi asli
│   ├── ThemeProvider.tsx     # Pengatur tema Dark/Light
│   └── ...                   # Komponen pembantu lainnya
├── context/                  # React Context
│   ├── AuthContext.tsx       # State manajemen autentikasi Firebase
│   └── SiteContext.tsx       # State manajemen data website dari Firestore
├── lib/                      # Helper & konfigurasi
│   ├── firebase.ts           # Konfigurasi & inisialisasi Firebase SDK
│   ├── drive-helper.ts       # Parser URL gambar dari Google Drive
│   └── icons.tsx             # Mapping ikon dinamis
├── public/                   # Asset statis publik (gambar, favicon, icon)
├── .env.example              # Template variabel lingkungan Firebase
├── .firebaserc               # Konfigurasi target project Firebase
├── firebase.json             # Konfigurasi Firebase Hosting & Firestore
├── firestore.rules           # Aturan keamanan Cloud Firestore
├── next.config.ts            # Konfigurasi Next.js (output: 'export')
├── package.json              # Dependensi & script proyek
└── tsconfig.json             # Konfigurasi TypeScript
```

---

## 📋 Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `18.18.0` atau yang lebih baru (disarankan **Node.js 20+ LTS**).
- **Package Manager**: `npm` (bawaan Node.js), `yarn`, atau `pnpm`.
- **Git**: Terpasang di komputer Anda.
- **Akun Google**: Untuk membuat proyek di [Firebase Console](https://console.firebase.google.com/).

---

## 🔑 Langkah Konfigurasi Firebase SDK (`YOUR_FIREBASE_SDK`)

Website ini membutuhkan project Firebase untuk fitur autentikasi admin dan database konten Firestore.

### 1. Buat Proyek di Firebase Console
1. Buka [Firebase Console](https://console.firebase.google.com/) dan login dengan akun Google Anda.
2. Klik **Add project** (Tambah proyek) dan beri nama proyek Anda (misalnya: `my-portfolio-web`).
3. Anda dapat menonaktifkan Google Analytics (opsional), lalu klik **Create project**.

### 2. Aktifkan Firebase Authentication
1. Di menu sidebar kiri Firebase Console, klik **Build** ➔ **Authentication**.
2. Klik tombol **Get started**.
3. Pada tab **Sign-in method**, pilih **Email/Password**.
4. Aktifkan opsi pertama (**Email/Password**), lalu klik **Save**.
5. Buka tab **Users** dan klik **Add user**. Masukkan email admin dan password yang Anda inginkan (kredensial ini yang akan digunakan untuk login ke `/admin`).

### 3. Aktifkan Cloud Firestore Database
1. Di menu sidebar kiri, klik **Build** ➔ **Firestore Database**.
2. Klik tombol **Create database**.
3. Pilih lokasi server database terdekat (misal: `asia-southeast1` untuk Singapura / Indonesia).
4. Pilih mode **Start in production mode**, lalu klik **Create**.

### 4. Dapatkan Konfigurasi Firebase SDK
1. Di Firebase Console, klik ikon roda gigi ⚙️ di samping *Project Overview* ➔ pilih **Project settings**.
2. Gulir ke bawah ke bagian **Your apps**, lalu klik ikon Web (`</>`).
3. Masukkan nama aplikasi (misal: `Portfolio-Web`), jangan centang Firebase Hosting dulu, lalu klik **Register app**.
4. Anda akan melihat blok konfigurasi `firebaseConfig` seperti berikut:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "123456789...",
  appId: "1:123456789:web:abcdef...",
  measurementId: "G-XXXXXX"
};
```

### 5. Pasang Konfigurasi ke Proyek
Terdapat dua cara untuk memasukkan konfigurasi Firebase:

#### Cara A: Menggunakan File `.env.local` (Direkomendasikan)
Salin file template `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Lalu isi nilainya sesuai data dari Firebase Console:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXX
```

#### Cara B: Mengedit Langsung di File [`lib/firebase.ts`](lib/firebase.ts)
Buka file `lib/firebase.ts` dan ganti bagian placeholder `YOUR_FIREBASE_SDK` dengan objek konfigurasi Firebase Anda.

### 6. Terapkan Aturan Keamanan (Firestore Security Rules)
Pastikan aturan keamanan Firestore terpasang agar publik dapat membaca konten web dan hanya admin yang dapat mengubahnya:
1. Di Firebase Console, buka **Firestore Database** ➔ tab **Rules**.
2. Salin isi dari file [`firestore.rules`](firestore.rules) di repository ini, lalu tempelkan (*paste*) ke editor Rules di Firebase Console.
3. Klik tombol **Publish**.

---

## 💻 Cara Mengkloning dan Menjalankan Proyek Secara Lokal

Ikuti langkah-langkah berikut untuk menjalankan website di komputer lokal:

### 1. Kloning Repository
Buka terminal dan jalankan perintah:
```bash
git clone https://github.com/USERNAME_ANDA/NAMA_REPOSITORY.git
cd NAMA_REPOSITORY
```

### 2. Install Dependensi
Pasang seluruh paket dependensi yang dibutuhkan:
```bash
npm install
```

### 3. Setup Konfigurasi Firebase
Buat file `.env.local` dari `.env.example` dan masukkan kredensial Firebase SDK Anda (lihat panduan Firebase di atas).

### 4. Jalankan Server Development
Mulai server lokal Next.js:
```bash
npm run dev
```
Buka browser dan akses alamat:
```text
http://localhost:3000
```

### 5. Akses Halaman Admin Pertama Kali
1. Buka browser dan arahkan ke: `http://localhost:3000/admin/login`
2. Masukkan email dan password admin yang telah Anda buat di tab **Firebase Authentication > Users**.
3. Setelah login berhasil, Anda akan diarahkan ke Dashboard Admin `/admin` untuk mulai mengisi data portofolio Anda.

---

## 📬 Panduan Formulir Kontak Formspree

Formulir kontak pada bagian **Get in touch** menggunakan layanan gratis dari **Formspree** agar pesan langsung masuk ke email pribadi tanpa server tambahan.

1. Buka dan daftar akun di **[Formspree](https://formspree.io/)**.
2. Buat form baru (**+ New Form**).
3. Masukkan alamat email tujuan yang ingin menerima notifikasi pesan.
4. Salin **URL Endpoint** yang didapat (contoh: `https://formspree.io/f/xeqwyzlk`).
5. Buka Halaman Admin website Anda ➔ buka tab **Header, Nav & Kontak**.
6. Gulir ke bagian **Integrasi Formspree Contact Form** dan tempelkan link endpoint tersebut.
7. Klik tombol **Simpan Perubahan**.

---

## 📄 Lisensi & Kredit

- **Kredit Desain Asli:** Dikembangkan oleh [Laurent Begey](https://lbegey78.gumroad.com/) & didistribusikan oleh [ThemeWagon](https://themewagon.com/). Lisensi asli tetap melekat pada template dasar.
- **Modifikasi & Fitur CMS Dinamis:** Dikembangkan dan disesuaikan untuk integrasi Firebase CMS, Dark/Light Mode, dan Next.js App Router.
