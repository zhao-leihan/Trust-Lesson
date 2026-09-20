# PROMPT: UI Design — SkillBridge (Global P2P Skill Exchange)

> Gunakan prompt ini untuk generate UI (Claude, v0, Lovable, Figma AI, dll).
> Referensi visual: gambar "Choose Your Course" (dashboard e-learning ungu dengan kartu berwarna, ilustrasi flat, sidebar putih, panel detail di kanan).
> **Ikuti arah visual referensi secara persis.** Yang berubah hanya konten: dari "course" menjadi "sesi mentor + escrow + reputasi".

---

## 1. Konteks Produk

**SkillBridge** adalah platform P2P global untuk booking sesi skill: career coach, guru privat (bahasa, coding, musik, seni), dan konsultan profesional.

Pembeda utama:
- **Session-based escrow**: pembayaran dikunci sebelum sesi, dilepas setelah sesi selesai.
- **Milestone-based payment**: untuk bimbingan panjang (misalnya 3 bulan).
- **Portable reputation**: review dan credential terverifikasi, bisa dibawa ke platform lain.
- **Dispute resolution**: juri dipilih acak dari pool yang punya stake dan reputasi.
- **Fee rendah**: 5–8% (bukan 15–25%).

**Pasar**: publik / global. Bahasa UI: **English**. Mata uang default: USD (bisa ganti).
**Pengguna**: (1) Learner (mahasiswa, profesional yang upskill), (2) Mentor (coach, guru, konsultan).
**Penting**: blockchain adalah infrastruktur tak terlihat. Pengguna bayar dengan kartu / Apple Pay / Google Pay / stablecoin. Wallet dibuat otomatis. Jangan tampilkan istilah "gas", "seed phrase", atau "connect wallet" di alur utama.

---

## 2. Arah Visual (dari gambar referensi)

Nuansa: **ramah, playful, cerah, modern**, seperti aplikasi belajar untuk anak muda. Bukan fintech yang dingin, bukan dashboard korporat.

Ciri khas yang harus ada:
- Latar utama **ungu periwinkle** yang solid dan penuh.
- Semua konten berada di **kartu putih besar dengan sudut sangat membulat** (radius 28–32px), mengambang di atas latar ungu, dengan jarak antar kartu yang lega.
- **Kartu konten berwarna solid** (ungu tua, kuning, koral) dengan ilustrasi flat besar di dalamnya dan badge kecil putih berbentuk pill di bagian bawah.
- **Ilustrasi flat bergaya vektor** dengan bentuk organik dan warna berani: orang, palet, laptop, cat, buku. Tidak ada foto stok.
- **Headline besar** berwarna navy gelap, tebal, dua baris, di kiri atas area utama.
- Tombol aksi utama berbentuk **lingkaran kuning** dengan teks tebal (seperti tombol "Go").
- Ikon **gembok** di pojok kartu konten untuk penanda terkunci / premium.

### Color tokens

| Nama | Hex | Pemakaian |
|---|---|---|
| Periwinkle (latar) | `#8B7CF6` | Latar halaman |
| Violet (kartu utama) | `#5B4BDB` | Kartu konten ungu, ikon aktif, logo |
| Sunshine | `#FFC83D` | Kartu kuning, tombol aksi utama |
| Coral | `#F26B6B` | Header panel detail, kartu koral, ikon play |
| Mint | `#37B679` | Status sukses, ikon play hijau, escrow released |
| Navy | `#2A2A5A` | Headline dan teks utama |
| Lavender mist | `#ECE9FF` | Chip, pill, item resource, background sekunder |
| White | `#FFFFFF` | Kartu, sidebar, panel |

Aturan warna:
- Teks di atas kartu berwarna: putih (ungu, koral) atau navy (kuning). Pastikan kontras minimal 4.5:1.
- Warna status: escrow locked = violet, released = mint, disputed = coral, pending = sunshine.
- Jangan tambah warna aksen baru di luar tabel.

### Typography

- Satu keluarga **rounded geometric sans** (rekomendasi: **Outfit** atau **Poppins**; fallback `system-ui, sans-serif`).
- Headline halaman: 44–56px, weight 600, line-height 1.05, warna Navy.
- Judul kartu: 22–28px, weight 500.
- Body: 14–16px, weight 400, warna Navy dengan opacity 70%.
- Badge/pill: 12px, weight 500.
- Harga: 28px, weight 700.
- Sentence case di seluruh UI. Jangan pakai ALL CAPS untuk label.

### Bentuk dan elevasi

- Kartu besar: radius 32px. Kartu konten: radius 24px. Pill/chip: radius penuh.
- Bayangan sangat lembut dan difus (blur besar, opacity rendah). Tidak ada border tebal.
- Kartu di kanan boleh sedikit terpotong di tepi layar untuk memberi kesan kedalaman.

---

## 3. Layout Desktop (3 kolom, mengikuti referensi)

```
┌──────────┬──────────────────────────────────┬──────────────┐
│ Sidebar  │  Choose your mentor              │ Session      │
│ (putih)  │  [chips kategori]                │ detail panel │
│ logo     │  ┌────────┐ ┌────────┐           │ (header      │
│ nav      │  │ kartu  │ │ kartu  │  ...      │  koral +     │
│          │  │ violet │ │ kuning │           │  ilustrasi)  │
├──────────┤  └────────┘ └────────┘           │ harga + CTA  │
│ Promo    │  Resources                       ├──────────────┤
│ card     │  [pill] [pill] [pill]            │ Milestones   │
│ ungu     │                                  │ list         │
└──────────┴──────────────────────────────────┴──────────────┘
```

### 3.1 Sidebar kiri (kartu putih)
- Logo di lingkaran violet (ikon bookmark/jembatan) di bagian atas.
- Menu: **Dashboard, My sessions, Explore mentors, Schedule, Escrow & payments, Reputation, Resources**.
- Item aktif: teks tebal + ikon violet. Item lain: abu-navy.
- Di bawahnya, **kartu promo ungu** dengan ilustrasi (orang duduk dengan laptop) dan teks besar: "Learn from people who show up." Tombol lingkaran kuning **"Go"** (arahkan ke Explore mentors).

### 3.2 Area utama (kartu putih besar)
- Headline: **"Choose your mentor"** (dua baris, gaya referensi).
- Baris chip kategori (scroll horizontal): **All, Career, Coding, Languages, Music, Art, Business, Design**. Chip aktif berwarna Navy dengan teks putih; chip lain Lavender mist.
- Grid kartu mentor (2 kolom, 3 pada layar lebar). Setiap kartu:
  - Latar solid (violet / sunshine / coral bergantian) + ilustrasi flat besar sesuai skill.
  - Judul skill (misalnya "Frontend coding"), di bawahnya "By Maya Chen".
  - Ikon gembok/perisai di kanan atas: **perisai = verified mentor** (sudah stake), **gembok = premium mentor**.
  - Badge pill putih di bawah: durasi sesi ("1 hour"), level ("All level"), dan harga ("$24").
  - Badge kecil **"Escrow protected"** dengan ikon perisai.
- Bagian **Resources** di bawah: baris pill berwarna pastel dengan ikon bulat, judul, dan nama pembuat (mis. "How to prepare for a mentor session", "Interview prep checklist", "Set goals for a 3-month plan").

### 3.3 Panel kanan atas: Session detail
- Header **koral** dengan ilustrasi besar, tombol kembali (kiri) dan bookmark (kanan) dalam lingkaran putih.
- Judul: "Frontend coding" dan harga besar di kanan: **$24 / session**.
- "By Maya Chen" + badge **Verified mentor**.
- Baris pill: rating (⭐ 4.9), jumlah sesi selesai ("1.2k sessions"), on-chain reputation score.
- **Description**: 2–3 kalimat singkat tentang apa yang akan dipelajari.
- Blok **"How your payment is protected"** (3 langkah ringkas): Pay now → Held in escrow → Released after the session.
- CTA utama: tombol lebar **"Book session"** (violet) dan tombol sekunder **"Message mentor"**.

### 3.4 Panel kanan bawah: Milestones (pengganti "List of topics")
- Daftar item dengan ikon play bulat (koral, hijau, kuning) seperti referensi:
  - Nama milestone (mis. "Portfolio review"), deskripsi singkat, dan status.
  - Ikon kanan: gembok (belum dibuka), centang mint (released), tanda seru koral (disputed).
- Header: "Milestones" dengan total dana terkunci dan progress bar tipis.

---

## 4. Layar yang Perlu Dibuat

Bangun sebagai satu aplikasi dengan navigasi yang berfungsi. Prioritas:

1. **Explore mentors** (layar utama di atas).
2. **Session detail + Book session**: pilih slot waktu, pilih single session atau paket (5 sesi hemat 10%), ringkasan harga (fee platform tampil transparan 5–8%), pilih metode bayar (card, Apple/Google Pay, USDC).
3. **Escrow tracker** (di My sessions): kartu per sesi dengan status **Locked → In session → Released** dan tombol **"Confirm session done"** atau **"Report a problem"**.
4. **Milestone project view**: timeline bimbingan panjang, tiap milestone punya checklist, dana terkunci, dan tombol release.
5. **Dispute flow**: form singkat (alasan + bukti), status "Under review", tiga tahap: auto-resolve → mediation → jury. Tampilkan bukti otomatis (attendance log, chat).
6. **Reputation profile**: skor, review terverifikasi (hanya dari sesi yang dibayar lewat escrow), credential yang diterbitkan, tombol **"Share / export reputation"** (link publik + verifiable credential).
7. **Mentor dashboard**: pendapatan, sesi mendatang, dana di escrow, status verifikasi dan stake, tombol **"Become verified"**.

---

## 5. Komponen dan Interaksi

- **Status badge escrow** konsisten di semua layar: Locked (violet), Released (mint), Disputed (coral), Pending (sunshine).
- **Toast konfirmasi** memakai kata kerja yang sama dengan tombolnya: tombol "Book session" menghasilkan toast "Session booked".
- **Empty state** berupa ilustrasi kecil + satu tombol aksi (mis. "No sessions yet" + "Find a mentor").
- **Error** menjelaskan apa yang salah dan cara memperbaikinya, tanpa permintaan maaf berlebihan.
- Hover kartu: naik 2–4px dengan bayangan sedikit lebih dalam. Tidak ada animasi masuk berlebihan.
- Satu momen animasi utama: **efek "kunci menutup"** pada ikon gembok saat pembayaran masuk escrow, lalu berubah menjadi centang saat dana dilepas.
- Fokus keyboard terlihat jelas (ring violet 2px). Hormati `prefers-reduced-motion`.

---

## 6. Responsif

- **Desktop (≥1200px)**: 3 kolom seperti di atas.
- **Tablet (768–1199px)**: sidebar menjadi ikon saja, panel detail pindah ke bawah atau drawer.
- **Mobile (<768px)**: bottom navigation (Home, Explore, Sessions, Reputation, Profile). Kartu mentor 1 kolom. Session detail menjadi halaman penuh dengan tombol **Book session** menempel di bawah.
- Tidak boleh ada scroll horizontal pada body halaman. Hanya baris chip dan resources yang boleh scroll horizontal.

---

## 7. Konten Contoh (gunakan data ini, bukan lorem ipsum)

| Mentor | Skill | Harga | Rating | Warna kartu |
|---|---|---|---|---|
| Maya Chen | Frontend coding | $24 | 4.9 | Violet |
| Daniel Okafor | Career coaching | $35 | 4.8 | Sunshine |
| Sofia Reyes | Spanish conversation | $18 | 4.9 | Coral |
| Kenji Watanabe | Piano for beginners | $22 | 4.7 | Violet |
| Amara Singh | Product strategy | $60 | 5.0 | Sunshine (premium) |
| Lucas Meyer | UI illustration | $28 | 4.8 | Coral |

Milestones contoh (bimbingan karir 3 bulan): Career goals, CV and portfolio review, Mock interviews, Offer negotiation.

---

## 8. Tech dan Output

- **Stack**: React + Tailwind CSS (utility class inti saja), ikon dari `lucide-react`.
- Ilustrasi: SVG flat buatan sendiri, sederhana dan konsisten (bentuk organik, tanpa gradien rumit).
- Data dummy di dalam state; tidak perlu backend atau koneksi wallet sungguhan.
- Struktur komponen: `Sidebar`, `PromoCard`, `CategoryChips`, `MentorCard`, `ResourcePill`, `SessionDetail`, `MilestoneList`, `EscrowBadge`, `BookingFlow`, `DisputeFlow`, `ReputationProfile`.
- Tulis kode yang bersih, aksesibel (label ARIA pada tombol ikon), dan mudah dipindah ke proyek nyata.

---

## 9. Yang Jangan Dilakukan

- Jangan ubah palet menjadi gelap, krem, atau monokrom.
- Jangan pakai foto stok atau avatar realistis.
- Jangan tampilkan istilah crypto teknis di alur utama.
- Jangan pakai satu radius yang sama untuk semua elemen; ikuti hierarki (32 / 24 / pill).
- Jangan menambahkan fitur atau layar di luar daftar di atas sebelum yang utama selesai.
