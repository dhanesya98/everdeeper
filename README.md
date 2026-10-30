# Ever Deeper II: Abyssal Tactics (Turun Terus RPG 2)
> **Third-Person Isometric Turn-Based Tactical RPG**  
> Melanjutkan lore dan misteri penyelamatan **Liora** serta pencarian **Matahari yang Hilang** di dasar Abyss.

---

## 🌟 Apa yang Baru di Versi 2?

Di Versi 1 (`turun-terus-roguelike.html`), alur permainan lebih menitikberatkan pada antarmuka teks, kartu statistik, dan klik menu tombol. 

**Di Versi 2 (`A2 - Game v2`)**, permainan telah dirombak total menjadi **Full Third-Person Isometric RPG** yang beneran bisa dimainkan dan dikendalikan:

1. **3D Isometric Dungeon Exploration**:
   - Karakter utama dapat dikendalikan secara langsung menjelajahi ruang bawah tanah menggunakan **WASD / Tombol Panah**.
   - Membawa **Lentera Surya (Sun Lantern)** di pinggang karakter yang memancarkan pencahayaan dinamis real-time (flickering point-light) yang menembus kabut kegelapan Abyss.
   - Kamera isometrik orang ketiga yang halus mengikuti gerak hero, dapat diputar sudut pandangnya (**Q / R** atau **Klik Kanan Tahan Geser Mouse**) dan di-zoom (**Scroll Roda Mouse**).
   - Interaksi langsung di dunia 3D: Peti Harta Karun (bisa dibuka dengan animasi tutup peti), Altar Surya (pemulih HP & Flask), dan Prasasti Kenangan Liora.

2. **Tactical Isometric Turn-Based Combat (Pertarungan Petak Taktis)**:
   - Saat mendekati musuh atau bos, kamera bertransisi mulus ke **Mode Pertempuran Taktis**.
   - **Petak Grid Isometrik**: Petak biru menunjukkan area jangkauan langkah, petak merah menunjukkan area serangan dan skill.
   - **Action Points (AP) System**: Setiap giliran hero memiliki 4 AP untuk mengatur strategi (bergerak, menyerang, menggunakan skill, memasang kuda-kuda bertahan, atau meminum flask).
   - **Flanking & Backstab Mechanics**: Menyerang musuh dari arah samping (Flank) memberikan bonus damage (+25%). Menyerang tepat dari belakang arah hadap musuh (Backstab) memberikan **100% Guaranteed Critical Hit (+50% bonus damage)**!
   - **Poise & Stance Break System**: Setiap musuh memiliki meter Poise kuning. Menguras Poise musuh hingga 0 akan memicu **STANCE BREAK** (efek suara kaca pecah, layar bergetar, musuh pingsan selama 1 giliran dan menerima bonus damage kritikal)!

3. **3 Pilihan Kelas Karakter**:
   - **Vanguard (Warrior)**: Bersenjatakan Claymore baja dan Perisai Benteng. Memiliki Crushing Blow, Shield Slam, Bastion Brace, dan Ultimate Avatar Surya.
   - **Arcanist (Mage)**: Membawa Tongkat Kristal Surya. Menguasai Arcane Bolt jarak jauh, Fireball ledakan area (AoE), Frost Nova pembeku, dan Supernova berkas suci.
   - **Skirmisher (Rogue)**: Menggunakan Belati Ganda Beracun. Memiliki kelincahan gerak tinggi (5 petak), Flash Strike (teleportasi langsung ke belakang musuh untuk backstab instan), dan Bom Asap Bayangan.

4. **Sistem Spesialisasi Skill Build & Bakat Pasif**:
   - Setiap kelas memiliki 2 cabang spesialisasi build unik dengan pasif berbeda:
     - **Vanguard**: *Bastion Defender* (Poise +25%, Retaliation Thorns 25% pantulan damage) vs *Blood Berserker* (Damage naik seiring menipisnya HP, Shatter Feast heal 20% saat Stance Break).
     - **Arcanist**: *Solar Pyromancer* (Combustion Wave ledakan bara, Solar Flare +25% burn damage) vs *Cryo-Arbiter* (Deep Freeze pembeku 1 giliran, Arcane Aegis +10 Barrier tiap cast sihir).
     - **Skirmisher**: *Abyssal Assassin* (Fleet Footed +1 petak gerak & +15% Crit, Anatomical Insight +40% Backstab damage) vs *Venom Trapper* (Venomous Strike racun tumpuk, Vanish on Kill +40% Dodge setelah membunuh).
   - Pemain dapat mengganti spesialisasi build kapan saja melalui jendela **Profil Karakter (C)**.

5. **Eksplorasi Gelap & Mencekam ala Diablo / Torchlight (Unknown Darkness & Fog of War)**:
   - Labirin terbungkus dalam kegelapan pekat (pitch black void). Hanya lingkaran 5 petak di sekeliling **Lentera Surya** yang tersingkap terang.
   - Petak yang pernah dikunjungi tetap tersimpan dalam ingatan hero sebagai siluet redup, sementara monster dan bahaya di luar jangkauan lentera tersembunyi sepenuhnya dalam bayang-bayang.
   - Dilengkapi vignette gelap sinematik di tepi layar untuk atmosfer dark fantasy yang claustrophobic dan misterius.

6. **Landing Page Sinematik & Pilihan Karakter Awal**:
   - Menu utama atmosferik sebelum terjun ke dalam permainan, lengkap dengan opsi *Mulai Ekspedisi Baru*, *Lanjutkan Ekspedisi (Save Game)*, dan *Panduan Cerita Liora*.

7. **Popup Dialog Cerita Setiap Menuruni Tangga**:
   - Setiap kali mengalahkan bos lantai dan menuruni tangga, muncul dialog narasi sinematik yang melanjutkan lore game v1:
     - Lantai 1 ➔ 2: *Pita Rambut yang Membeku (Menuju Reruntuhan Beku Sang Dark King)*
     - Lantai 2 ➔ 3: *Menara Segel Surya (Menuju Labirin Mantra Gelap Sang Evil Sorcerer)*
     - Lantai 3 ➔ 4: *Lembah Peti Tulang (Menuju Pekuburan Purba Sang Ancient Lich)*
     - Lantai 4 ➔ 5: *Di Depan Singgasana Hampa (Kedalaman Terakhir Sang Shadow Emperor)*

8. **Fitur Candu (Addictive Game Hooks)**:
   - **Hades-Style Level-Up Boon Selection**: Setiap naik level, pemain memilih 1 dari 3 kartu Berkat Surya ilahi (total 12 Berkat unik: Bilah Percikan Surya, Gema Kritis Fajar, Lifesteal Vampiric, Sedotan Esensi Jiwa AP, dll).
   - **Guci Keramik Pecah & Loot Beam**: Guci kuno di lorong labirin dapat dihancurkan dengan tombol **E** untuk memperoleh koin emas dan memancarkan pilar cahaya vertikal berkilau ala Diablo.
   - **Musuh Elite & Glowing Auras**: Monster memiliki peluang 28% muncul sebagai varian Elite (*Bersisik Bara*, *Bayangan Cepat*, *Batu Karang*) dengan aura visual bercahaya dan hadiah EXP/Gold lebih tinggi.

9. **Sistem Perlengkapan & Efek Set Relik**:
   - Slot perlengkapan: Senjata Utama, Senjata Kiri/Perisai, Zirah Pelindung, dan Relik/Cincin.
   - **Set Darah Abadi (Blood Set)**: Lifesteal & memicu Stance Break memulihkan HP seketika.
   - **Set Bayangan Jurang (Shadow Set)**: Peningkatan Dodge & Critical Hit.
   - **Set Benteng Abadi (Bastion Set)**: Peningkatan pertahanan tebal & kebal stagger.

10. **Audio Sintesis Prosedural (Web Audio API)**:
    - Tidak memerlukan koneksi internet atau download file MP3/WAV besar yang rentan gagal dimuat.
    - Suara langkah kaki, tebasan bilah pedang, tangkisan perisai, sihir api & petir, pecahan guci keramik, lonceng berkat naik level, dan dengungan atmosferik ruang bawah tanah disintesis secara real-time.

11. **100% Offline Compatible**:
    - Seluruh pustaka 3D Three.js (`three.min.js`) telah disimpan secara lokal di dalam folder. Game dapat dijalankan langsung tanpa koneksi internet sama sekali.

---

## 🎮 Kontrol Permainan

### Mode Eksplorasi (Jalan Bebas):
| Tombol | Fungsi |
|---|---|
| **W, A, S, D** / **Panah** | Berjalan ke segala arah |
| **Q / R** | Memutar kamera isometrik 45° ke kiri / kanan |
| **Klik Kanan + Geser Mouse** | Memutar kamera secara bebas |
| **Scroll Roda Mouse** | Zoom in / Zoom out kamera |
| **E** | Berinteraksi (Buka Peti, Berdoa di Altar, Baca Prasasti, Masuk Tangga) |
| **I** | Membuka Tas & Manajemen Perlengkapan (Inventory) |
| **C** | Membuka Status & Profil Karakter |

### Mode Pertarungan Taktis:
| Tombol / Aksi | Fungsi |
|---|---|
| **Klik Petak Biru** | Melangkah ke petak target (Konsumsi 1 AP tiap 2 petak) |
| **Angka 1** | Serangan Dasar (1 AP) |
| **Angka 2** | Skill Kelas 1 (2 AP, misal: Crushing Blow / Fireball / Flash Strike) |
| **Angka 3** | Skill Kelas 2 (2 AP, misal: Shield Slam / Frost Nova / Smoke Screen) |
| **Angka 4** | Kuda-Kuda Pertahanan (1 AP, misal: Bastion Brace / Mana Shield) |
| **Angka 5** | Ultimate Finisher (3 AP, butuh 100 Adrenaline) |
| **G / Tombol Kuda-Kuda** | Kuda-Kuda Kokoh / Tactical Guard (1 AP • +10 DEF, +20 Poise) |
| **Angka 6 / Tombol Flask** | Minum Lentera Flask (Pulihkan HP & Poise) |
| **Spasi / Tombol Selesai** | Akhiri Giliran Anda (Sisa AP otomatis dialihkan ke Guard DEF!) |
| **C / K** | Buka Menu Profil & Rangkaian Skill Tree Interaktif |
| **I** | Buka Tas & Perlengkapan Inventory |

---

## 🚀 Cara Menjalankan Game

Tersedia beberapa cara mudah untuk langsung memainkan game ini:

### Cara 1: Langsung Klik Dua Kali (Rekomendasi)
- Cukup klik dua kali file **`play.bat`** di dalam folder `G:\My Drive\A2 - Game v2\`.
- Game akan langsung terbuka di browser bawaan Windows Anda.

### Cara 2: Buka File HTML Langsung
- Klik kanan file **`index.html`** -> **Open with** -> Pilih browser Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, dll).

### Cara 3: Menggunakan Server Lokal (Opsional)
- Klik dua kali file **`play_server.bat`** (akan menyalakan server lokal di `http://localhost:3000`).

---

## 📁 Struktur Berkas

```
G:\My Drive\A2 - Game v2\
├── index.html          # Halaman utama game & antarmuka HUD 3D
├── play.bat            # Launcher sekali klik
├── play_server.bat     # Launcher lokal server (opsional)
├── server.js           # Server Node.js ringan (tanpa dependensi luar)
├── three.min.js        # Engine grafis 3D Three.js lokal (Offline-ready)
├── README.md           # Panduan lengkap ini
├── css/
│   └── game.css        # Tata letak antarmuka Dark Fantasy HUD & Modals
└── js/
    ├── audio.js        # Mesin suara prosedural Web Audio API
    ├── rpg-data.js     # Data Kelas, Monster, Bos, Set, Lore Liora & Item
    ├── models.js       # Pembuat model 3D prosedural karakter, musuh & prop
    ├── dungeon.js      # Generator labirin ruang 3D & algoritma pathfinding A*
    ├── inventory.js    # Sistem tas perlengkapan, hitung stat & penyimpanan simpanan
    ├── combat.js       # Mesin giliran taktis isometrik, AP, Poise & AI musuh
    └── main.js         # Loop utama game, penanganan input & kamera isometrik
```

*Selamat bertualang di kedalaman Abyss dan temukan adikmu, Liora!*
