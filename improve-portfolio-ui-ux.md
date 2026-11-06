# Improve Portfolio UI/UX: Audit & Rencana Implementasi

Tanggal audit: 2026-11-06. Target: `http://localhost:9999/` (build Docker). Metode: skill `ui-ux-pro-max` v2.6.2, Playwright di 1440px dan 375px, serta review kode `frontend/src`.

## 1. Ringkasan

Fondasinya sudah bagus: kontennya kuat (9+ project production, 3 aplikasi di Play Store, sertifikasi mobile pentest 94.2/100) dan isinya bisa dikelola lewat CMS. Tiga hal yang paling menahan:

1. **Bukti kerja tidak terlihat.** 8 dari 8 project tanpa gambar (hanya huruf inisial), dan section Projects baru mulai sekitar 3.400px dari atas di desktop.
2. **Mobile bermasalah.** Menu hamburger rusak, dan halaman sepanjang 11.443px (sekitar 14 layar).
3. **Aksesibilitas nyaris belum ditangani.** Di luar admin, kode situs publik tidak memakai `aria-*`, `focus-visible`, atau `prefers-reduced-motion` sama sekali, dan tidak ada `<main>` atau `<section>`.

Prioritas: perbaiki bug (Fase 0), aksesibilitas (Fase 1), lalu baru redesign (Fase 2 dan 3). Bug dan aksesibilitas murah dan langsung terasa. Redesign butuh materi konten dari kamu.

## 2. Temuan

Severity: **P0** rusak atau memblokir, **P1** berdampak besar, **P2** peningkatan kualitas.

### Navigasi & mobile

| # | Sev | Temuan | Bukti |
|---|-----|--------|-------|
| N1 | P0 | Item menu mobile terpotong: About dan Skills berada di luar layar (y = -82 dan -41) dan menu menimpa foto | Terukur di 375px; typo CSS `Navbar/index.jsx:132-140` (`position: absolute:`, `top: 80`, nilai tanpa unit, titik koma hilang) |
| N2 | P0 | Semua link menu mobile mengarah ke `/`, bukan ke section | `styled(LinkR)` diberi `href`, bukan `to` (`Navbar/index.jsx:146,196`); terukur `href="/"` |
| N3 | P0 | Menu mobile tidak punya Certifications dan Contact, padahal CTA utama adalah kontak | `Navbar/index.jsx:196-215` |
| N4 | P1 | Tombol GitHub mobile tidak berfungsi (`<button href>`) dan warnanya transparan, karena `useTheme` diambil dari `@emotion/react` sementara provider-nya styled-components | `Navbar/index.jsx:6,216-226` |
| N5 | P1 | Hamburger berupa `div` + svg 24×24px: tidak bisa difokus, tanpa label, di bawah target sentuh 44px | `Navbar/index.jsx:169-175` |
| N6 | P2 | Tidak ada penanda section aktif: class `.active` tidak pernah dipasang | `Navbar/index.jsx:82` |
| N7 | P2 | Halaman mobile 11.443px; 7 grup skill ditumpuk sebelum project | Terukur |

### Hero & positioning

| # | Sev | Temuan | Bukti |
|---|-----|--------|-------|
| H1 | P1 | Paragraf hero sekitar 10 baris memuat semua pencapaian, jadi angka terkuat tenggelam | Screenshot desktop |
| H2 | P1 | "Hi, I am" dan "I am a [typewriter]" tidak menjawab "apa nilai orang ini?"; peran sering terlihat setengah terketik ("Backen") | Screenshot; `HeroSection/index.jsx:230-242` |
| H3 | P1 | Hanya satu CTA ("Check Resume"), tidak ada jalur ke project atau kontak | `HeroSection/index.jsx:244` |
| H4 | P1 | Foto candid di lab komputer: orang lain masuk frame dan latar RGB ramai. Sumber 540×960 sehingga buram di layar retina, `alt="Hero"` | Terukur; `HeroSection/index.jsx:247` |
| H5 | P2 | `bio.avatar_url` sudah ada di CMS tetapi hero tetap memakai gambar statis | `HeroSection/index.jsx:5,247`; `BioPanel.jsx:64` |
| H6 | P2 | Gradient CTA magenta neon (hsl 271→294) tidak senada dengan primary `#854CE6`; ada box-shadow glow | `HeroSection/index.jsx:172-177` |
| H7 | P2 | Typo CSS: `height: 100%;\`, `space-between:`, `gap: 12px` tanpa titik koma, `font-weight: 600px` | `HeroSection/index.jsx:34,50,85,118` |

### Projects

| # | Sev | Temuan | Bukti |
|---|-----|--------|-------|
| PJ1 | P0 | 8/8 project tanpa gambar; kartu terlihat seragam dengan huruf inisial | API `image_url` kosong semua |
| PJ2 | P0 | Tombol modal "View Code" dan "View Live App" tetap tampil dengan `href=""`. Hanya 1/8 project punya GitHub dan 2/8 punya live URL | Terukur di modal MyIdeaNet; `ProjectDetails/index.jsx:229-230` |
| PJ3 | P1 | Aplikasi "live on Google Play" tidak punya link ke Play Store, padahal itu bukti terkuat | Data API; model tidak punya field store URL |
| PJ4 | P1 | Filter UI/UX dan Backend kosong tanpa pesan (grid 0 kartu, tinggi 0). Tidak ada satu pun project berkategori backend, padahal backend ditonjolkan di hero | Terukur: mobile 3, frontend 4, fullstack 1, UI/UX 0, backend 0 |
| PJ5 | P1 | Kartu dan filter berupa `div onClick`, jadi tidak bisa diakses dengan keyboard | `Cards/ProjectCard.jsx:140`; `Projects/index.jsx:72,142` |
| PJ6 | P1 | Deskripsi kartu hanya satu kalimat, dan modal tidak menambah informasi: tidak ada masalah, peran, atau hasil | Data API |
| PJ7 | P2 | Label "Members" tampil walau kosong, karena `[]` bernilai truthy | `ProjectDetails/index.jsx:209` |
| PJ8 | P2 | Tinggi kartu tetap 490px menyisakan ruang kosong; judul memakai warna sekunder; hover `all 0.5s` terlalu lambat | `Cards/ProjectCard.jsx:19-20,30,90` |
| PJ9 | P2 | Hover filter memakai warna tidak valid (`theme.primary + 8` menghasilkan hex 7 digit); hover `$dull` berisi fungsi di dalam template string; field `featured` dan `sort` belum dimanfaatkan untuk urutan tampilan | `Projects/index.jsx:82`; `ProjectDetails/index.jsx:170`; `model.go:81-82` |
| PJ10 | P2 | Modal tidak bisa di-deep-link, tanpa `aria-labelledby`, dan tombol tutup hanya svg (Esc berfungsi) | Terukur; `ProjectDetails/index.jsx:188-199` |

### Kontak & konversi

| # | Sev | Temuan | Bukti |
|---|-----|--------|-------|
| C1 | P0 | Gagal kirim hanya `console.log`, jadi pengunjung tidak tahu pesannya gagal | `Contact/index.jsx:149-151` |
| C2 | P1 | Tidak ada validasi: field email `type="text"`, tanpa `required`, form kosong bisa dikirim, tanpa state loading | `Contact/index.jsx:138-167` |
| C3 | P1 | Input hanya memakai placeholder tanpa label; fokus hanya perubahan warna border 1px dengan `outline: none` | Terukur `label=false`, `outline=none` |
| C4 | P1 | Tidak ada email langsung atau copy-email; semua kontak bergantung pada EmailJS | `Contact/index.jsx` |
| C5 | P1 | Footer memuat Facebook dan Instagram, tetapi GitHub tidak ada; ikon tanpa nama aksesibel | Snapshot a11y; `Footer/index.jsx:104-106` |
| C6 | P1 | Resume mengarah ke `localhost:9010`. Pastikan URL object storage publik saat production; `target="display"` sebaiknya `_blank` dengan `rel="noopener"` | Terukur |

### Aksesibilitas

| # | Sev | Temuan | Bukti |
|---|-----|--------|-------|
| A1 | P1 | Hierarki heading kacau: satu-satunya `h1` ada di footer, nama di hero berupa `div`, judul section `div`, sub-grup skill `h2` | Terukur |
| A2 | P1 | Kontras gagal AA (4.5:1): tanggal kartu 3.06:1, deskripsi kartu 3.82:1, teks primary `#854CE6` 3.35–3.53:1 | Dihitung dari warna tema; `theme.text_secondary + 80/99` |
| A3 | P1 | Tidak ada `prefers-reduced-motion`, padahal ada animasi SVG terus-menerus, typewriter, dan `scroll-behavior: smooth` | Grep kosong |
| A4 | P1 | Tidak ada `<main>`, `<section>`, atau skip link | Terukur: main 0, section 0 |
| A5 | P2 | Ikon skill `alt=""` aman karena nama ada di teks, tetapi gambar project dan avatar tanpa `alt` sama sekali | `ProjectCard.jsx:142,157` |
| A6 | P2 | Teks 10–12px di mobile (tanggal, filter); scrollbar 4px sulit diraih | `ProjectCard.jsx:106`; `Projects/index.jsx:68`; `App.css:23` |
| A7 | P2 | Perlu dicek ulang: pada uji Tab desktop, fokus lompat dari tombol GitHub ke link footer tanpa singgah di "Check Resume" | Sekali uji, penyebab belum dipastikan |

### Konsistensi visual & konten

| # | Sev | Temuan | Bukti |
|---|-----|--------|-------|
| V1 | P1 | Identitas visual generik (template portfolio umum): logo "Portfolio" dengan ikon stok, gradient ungu-magenta, clip-path miring | Screenshot; `App.jsx:25-31` |
| V2 | P2 | Tidak ada design token: 49 hex hardcoded di komponen; opacity dibuat dari string (`theme.x + 80`); token dipakai tapi tidak ada (`soft2`, `text_black`); `lightTheme` tak terpakai dan tidak lengkap | Grep; `utils/Themes.jsx` |
| V3 | P2 | Ikon skill campur aduk: logo berwarna, kotak huruf inisial, dan ikon Next.js gelap yang hampir tak terlihat; bergantung CDN pihak ketiga | Screenshot |
| V4 | P2 | Salah tulis: "I have been studies on"; judul "Experience and Certification" padahal Certifications punya section sendiri; "Grade:" kosong di Education; emoji 🚀 di judul form dan ⚠️ di halaman error; pesan error berbahasa Indonesia di situs berbahasa Inggris | `Skills/index.jsx:156`; `Experience/index.jsx:83`; `EducationCard.jsx:142`; `StatusGate.jsx:57-61` |

### Performa & SEO

| # | Sev | Temuan | Bukti |
|---|-----|--------|-------|
| S1 | P1 | Nginx belum mengaktifkan gzip: JS terkirim 500 KB, sama dengan ukuran file di `dist` | Terukur; `nginx.conf` tanpa `gzip` |
| S2 | P1 | Halaman admin ikut masuk bundle publik; tidak ada code splitting. Ada dua runtime CSS-in-JS (styled-components dan emotion via MUI) | `App.jsx:17`; `package.json` |
| S3 | P1 | Halaman kosong sebelum JS jalan, jadi crawler dan preview LinkedIn/WhatsApp tidak melihat isi. Tidak ada Open Graph, JSON-LD, atau sitemap; meta description generik | `index.html` |
| S4 | P2 | Poppins memuat 9 weight; `Montserrat` dideklarasikan tetapi tidak pernah dimuat dan tertimpa selector `*`; favicon memakai PNG 32 KB | `App.css:1-18` |
| S5 | P2 | Gambar tanpa `loading="lazy"` dan WebP/AVIF; skeleton loading tidak mirip layout asli | Grep; `StatusGate.jsx` |

**Yang sudah baik (pertahankan):** tidak ada horizontal scroll di 375px, ada skeleton dan error state dengan retry, modal bisa ditutup dengan Esc, grid project responsif, fallback gambar, dan CMS yang fleksibel.

## 3. Arah desain

Skill merekomendasikan pola **Portfolio Grid**, netral dengan satu aksen, Inter, dan gaya Motion-Driven. Tiga penyesuaian untuk konteks ini:

- **Tetap dark:** palet skill berbasis terang, sedangkan dark sudah menjadi identitas situs dan cocok dengan profil security/engineering.
- **Motion dikurangi:** gaya Motion-Driven (parallax berlapis) bertabrakan dengan temuan aksesibilitas dan performa. Pakai gerak seperlunya saja.
- **Identitas pembeda:** "Full Stack Developer yang paham mobile security" jauh lebih berkesan daripada full stack biasa. Jadikan ini sudut pandang utama.

### Token yang diusulkan

| Token | Nilai | Catatan |
|-------|-------|---------|
| `bg` | `#0F0F14` | Latar halaman |
| `surface` | `#17171F` | Kartu |
| `surface-raised` | `#1F1F2A` | Hover, modal |
| `border` | `#2A2A36` | Garis tipis, menggantikan shadow berat |
| `text` | `#F2F3F4` | Teks utama |
| `text-muted` | `#A1A1AA` | Sekunder; solid, tidak lagi memakai alpha |
| `accent` | `#A78BFA` | Teks dan ikon aksen, sekitar 6.5:1 di `surface` |
| `accent-fill` | `#7C3AED` | Isi tombol dengan teks putih |

Verifikasi semua pasangan warna dengan alat kontras saat implementasi.

- **Tipografi:** Inter variable (400/500/600/700) self-hosted; JetBrains Mono opsional untuk tanggal dan tag. Skala 12 / 14 / 16 / 18 / 24 / 32 / 48–56 (hero, pakai `clamp`). Isi teks minimal 16px di mobile, metadata minimal 12px.
- **Spacing:** kelipatan 4/8px; jarak antar section 96px desktop dan 64px mobile; container 1120px.
- **Efek:** radius 8/12/16, border sebagai pemisah, hapus gradient magenta, glow, dan clip-path miring.
- **Motion:** 150–250ms, hanya `transform` dan `opacity`; reveal ringan satu kali; semua nonaktif saat `prefers-reduced-motion`.
- **Ikon:** satu keluarga (`react-icons`, misalnya Lucide), logo teknologi self-hosted atau cukup teks.

### Struktur halaman baru

`Hero → Selected Work → Experience → Skills (ringkas) → Certifications + Education → Contact`

Alasan: recruiter biasanya memeriksa bukti dulu, sehingga project harus muncul tepat setelah hero, bukan setelah skill.

### Draf hero (semua fakta dari bio yang ada)

```text
Full Stack Developer with a mobile security edge.

I build production backends, mobile apps, and web platforms
with Go, NestJS, Flutter, and React, and I test them like an attacker would.

[ View my work ]   [ Download resume ]   GitHub · LinkedIn

9+ production projects  ·  3 apps on Google Play  ·  94.2/100 pentest certification
```

Peran statis menggantikan typewriter. Sub-kalimat masih perlu kamu cek agar sesuai dengan gaya dan klaim yang kamu nyaman pakai. Paragraf lengkap pindah ke About singkat atau resume.

### Kartu dan detail project

- **Kartu:** gambar rasio tetap, judul, hasil satu baris, 3–4 tag, serta badge "Live on Google Play". 3 project `featured` tampil lebih besar. Filter disederhanakan menjadi kategori yang ada isinya (All, Mobile, Web, Full Stack) dengan jumlah project.
- **Detail:** format studi kasus singkat: masalah, peran, solusi dan stack, hasil, screenshot, link. Tombol hanya tampil jika URL-nya ada. Untuk project closed-source, tampilkan "Private client project". Gunakan URL sendiri (`/projects/:slug`) agar bisa dibagikan.

## 4. Rencana implementasi

Estimasi kasar untuk satu orang.

### Fase 0: Perbaikan bug (0,5–1 hari)
Menangani: N1–N5, PJ2, PJ4 (pesan kosong), PJ7, PJ9, C1, H7, V4.
- Tulis ulang menu mobile: `<button aria-label aria-expanded>` min 44×44px, link `<a href="#...">`, 7 item lengkap, tutup saat diklik atau Esc.
- `useTheme` dari styled-components, atau hapus jika tidak perlu.
- Render tombol modal secara kondisional; sembunyikan kategori kosong; sembunyikan "Members" dan "Grade" kosong.
- Tampilkan error pengiriman form kepada pengunjung.
- Perbaiki typo CSS dan salah tulis.

File: `components/Navbar`, `components/HeroSection`, `components/ProjectDetails`, `components/Projects`, `components/Contact`, `components/Skills`, `components/Experience`, `components/Cards/EducationCard.jsx`.

### Fase 1: Aksesibilitas & struktur (1–2 hari)
Menangani: A1–A6, PJ5, PJ10, C2, C3, C5, N6.
- `<header>/<nav>/<main>/<section>`, skip link, satu `h1` di hero, `h2` tiap section, footer memakai teks biasa.
- Filter berupa `<button aria-pressed>`; kartu berisi tombol atau link asli.
- `:focus-visible` global; aturan `prefers-reduced-motion` global.
- Form: label terlihat, `type="email"`, `required`, `autocomplete`, error di bawah field, status loading, `aria-live`.
- Footer: tambah GitHub, beri `aria-label`, `rel="noopener"`. Facebook dan Instagram sebaiknya dievaluasi.
- Section aktif di navbar via `IntersectionObserver`; `scroll-margin-top` untuk navbar sticky.

### Fase 2: Design system & hero (2–3 hari)
Menangani: V1–V3, H1–H6, S4, A2 (tuntas), C4, N7.
- Ganti `utils/Themes.jsx` dengan token semantik; ganti hex hardcoded dan alpha string secara bertahap; hapus `lightTheme` dan `themes/default` yang tak terpakai.
- Buat komponen dasar kecil: `Section`, `SectionHeader`, `Button`, `Tag`, `Card`, untuk menggantikan `Title`/`Desc`/`Container` yang berulang di setiap komponen.
- Bangun hero baru, pakai `bio.avatar_url`; ganti font; hapus clip-path dan gradient.
- Susun ulang section di `App.jsx`; ringkas Skills (kelompok lebih sedikit, security ditonjolkan); gabungkan Certifications dan Education; tambah email langsung.

### Fase 3: Showcase project (2–4 hari, tergantung materi)
Menangani: PJ1, PJ3, PJ6, PJ8, PJ10.
- Backend: tambah `Problem`, `Role`, `Outcome`, `StoreURL`, `Slug` di `backend/internal/model/model.go`, lalu sesuaikan handler dan seed. Cek dulu apakah migrasi berjalan otomatis.
- Admin: tambah field di `pages/admin/panels/ProjectsPanel.jsx`.
- Frontend: kartu baru, tampilan `featured` dan urutan `sort`, route `/projects/:slug`.
- Isi konten lewat CMS (lihat bagian 5).

### Fase 4: Performa & SEO (1–2 hari)
Menangani: S1–S5, C6.
- Aktifkan `gzip` (atau brotli) di `frontend/nginx.conf`.
- `React.lazy` untuk `AdminApp` dan `ProjectDetails`; ukur bundle, lalu pertimbangkan mengganti MUI (Timeline, Modal, Snackbar) dengan komponen ringan agar emotion bisa dilepas.
- Meta Open Graph, JSON-LD `Person`, `sitemap.xml`, favicon SVG; title seperti "Rizqika Ibnu Khattab | Full Stack Developer".
- Karena isi bergantung API, pertimbangkan prerender halaman utama saat build.
- Gambar WebP dengan `srcset`, `loading="lazy"`, `width`/`height`; skeleton mengikuti layout asli.

### Fase 5: Polish (opsional, 0,5–1 hari)
Reveal ringan saat scroll, transisi hover konsisten, lalu analytics ringan untuk klik CTA dan resume agar perubahan bisa diukur.

## 5. Yang dibutuhkan dari kamu

Bagian ini tidak bisa dikerjakan dari kode:

- [ ] Screenshot project (minimal 3 unggulan: BC Care, MyIdeaNet, A&A Property Agent). Pastikan boleh ditampilkan dan data sensitif klien sudah disamarkan.
- [ ] Foto profil yang lebih bersih: hanya kamu, latar sederhana, sisi terpendek minimal 800px.
- [ ] Link Google Play ketiga aplikasi.
- [ ] Untuk tiap project unggulan: masalah, peranmu, dan hasil yang bisa dibuktikan. Jangan pakai angka yang tidak bisa dipertanggungjawabkan.
- [ ] Minimal 1 project backend, atau ubah kategorinya, karena backend ditonjolkan tetapi kategorinya kosong.
- [ ] Email publik untuk kontak langsung, dan keputusan soal menampilkan Facebook/Instagram.
- [ ] Pastikan EmailJS aktif dan URL resume production bisa diakses publik.

## 6. Verifikasi tiap fase

- **Otomatis:** Lighthouse dan `axe` dengan target Accessibility ≥ 95, Performance ≥ 90 di mobile, CLS < 0.1. Ukur di build production, bukan localhost.
- **Viewport:** 375, 768, 1024, 1440px dan landscape; tanpa horizontal scroll.
- **Keyboard saja:** bisa mencapai semua link, filter, kartu, modal, dan form dengan fokus terlihat.
- **Skenario utama:** menu mobile membuka semua section; filter tidak pernah kosong; modal tanpa link mati; form sukses, gagal, dan kosong memberi feedback; resume terbuka; link detail project bisa dibagikan.
- **Reduced motion:** tidak ada animasi berjalan. **Screen reader:** cek urutan heading dan nama link dengan VoiceOver.
- **CMS:** ubah data dari `/admin` lalu pastikan tampil benar, termasuk project tanpa gambar atau link.

## 7. Batasan audit

- **Belum diuji:** pengiriman form (agar tidak mengirim email sungguhan), perangkat fisik, screen reader sungguhan, tampilan `/admin`, dan lingkungan production.
- Skor Lighthouse belum diambil. Waktu muat di localhost (FCP sekitar 1 detik) tidak mewakili kondisi production, jadi jadikan Lighthouse pada Fase 4 sebagai baseline resmi.
- Warna token, estimasi waktu, dan draf hero adalah usulan yang perlu divalidasi saat implementasi.

## 8. Status implementasi

- **Fase 0 dan 1:** selesai.
- **Fase 2:** selesai, dengan perubahan dari usulan di bagian 3:
  - **Warna:** latar biru tinta `#101826` dengan primary ungu `#854CE6` sesuai permintaan, dan `#A78BFA` untuk teks serta garis aksen di atas latar gelap.
  - **Load:** intro "scan": lapisan logo menyatu, garis scan menyapu layar dari atas ke bawah, lalu konten hero tersingkap bergantian.
  - **Font:** Bricolage Grotesque dan Hanken Grotesk, self-hosted, bukan Inter.
  - **Hero:** objek 3D empat cincin yang mewakili lapisan stack (Three.js, chunk terpisah), dengan fallback SVG untuk reduced motion, data saver, dan browser tanpa WebGL.
  - **Scroll:** tiap bagian section sembunyi saat keluar layar dan muncul lagi saat kembali, di kedua arah.
  - **Struktur:** Hero, Work, Experience, Skills, Credentials, Contact. Certifications dan Education digabung jadi Credentials.
  - **Footer:** hanya GitHub dan LinkedIn.
- **Temuan Fase 3 dan 4 yang ikut selesai:** kartu tanpa tinggi tetap (PJ8), cover diagram sebagai pengganti sementara screenshot asli (PJ1 sebagian), `@mui/lab` dan `@mui/icons-material` dilepas, font self-hosted (S4), favicon SVG, `loading="lazy"` pada gambar (S5 sebagian).
- **Konten Work, Experience, dan Skills:** disusun dari analisa repo, disinkronkan lewat `scripts/sync-work-data.py`. Nama klien sengaja disamarkan.
- **C4 (email langsung):** tampil jika `VITE_CONTACT_EMAIL` diisi.
- **Fase 4 yang sudah selesai:** gzip nginx (S1). Key EmailJS kini ikut ter-build di Docker lewat BuildKit secret dari `frontend/.env`.
- **Belum:** Fase 3 (studi kasus, field backend, deep link) dan sisa Fase 4 (lazy admin, meta SEO, URL resume publik).
- **Hosting:** rencana deploy memakai Docker Compose di VPS, bukan Vercel.
- **Ketahanan:** deep link dan posisi scroll saat reload dipulihkan setelah intro; latar gelap sejak HTML; hero 3D menurunkan resolusi saat frame lambat dan beralih ke gambar statis bila tetap lambat. Belum diuji di HP fisik.
