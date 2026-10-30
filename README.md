# Ever Deeper II: Abyssal Tactics

RPG dark fantasy bergaya pixel dengan eksplorasi **orang pertama (FPS)** dan pertarungan taktis berbasis giliran. Kamera tetap orang pertama saat combat, dengan tangan dan senjata terlihat.

Ikuti jejak Liora menuju dasar Abyss, temukan rahasia sumpah ayah, dan bantu para tawanan pulang. Versi ini memiliki **empat kelas, delapan bab, build campuran, serta kontrak tantangan opsional**.

## Menjalankan game

Gunakan laptop/PC dengan keyboard, mouse, dan browser yang mendukung WebGL.

1. Ekstrak seluruh paket ke satu folder, misalnya `G:\My Drive\A2 - Game v2\`.
2. Jalankan `play.bat`, atau buka `index.html` di browser.
3. Pilih **Mulai Ekspedisi Baru** atau **Lanjutkan Ekspedisi**.

Jangan menjalankan game dari pratinjau ZIP/WinRAR: folder sementara dapat berubah dan membuat lokasi penyimpanan browser berbeda.

Jika browser membatasi aset melalui file lokal, gunakan `play_server.bat`. Launcher ini memerlukan **Node.js** dan membuka `http://localhost:3000`. Biarkan server berjalan selama bermain. Tidak perlu `npm install` atau build.

Three.js, gambar, font, dan aset disertakan lokal. Audio memakai Web Audio API; klik menu game untuk mengaktifkan suara sesuai aturan browser.

## Pembaruan dan save

1. Tutup tab game. Buat salinan folder lama bila ingin menyimpan versi sebelumnya.
2. Ekstrak **isi ZIP lengkap terbaru** ke folder yang sama dan pilih **Replace**.
3. Buka dari alamat dan browser yang biasa digunakan, lalu tekan **Ctrl+F5**.

Paket lengkap sudah mencakup pembaruan sebelumnya. Mengunduh ZIP saja tidak mengubah folder game.

Save berada di **localStorage browser**, bukan di ZIP. Gunakan browser/profil dan alamat yang sama. Berpindah dari `file://` ke `http://localhost:3000`, mengganti port, memakai mode privat, atau menghapus data situs dapat membuat save lama tidak tersedia di alamat tersebut.

- Save lama mempertahankan equipment, pembelian skill, dan SP.
- Stat dihitung ulang memakai balancing terbaru. Eliksir lama di atas lima kali dihitung sebagai lima kali.
- Migrasi skill mempertahankan hotbar menurut aturan lama; skill yang dahulu tertimpa tetap dimiliki dan bisa dipasang kembali.
- Continue mengingat lantai terakhir. Tata ruang dan encounter dibuat ulang; posisi serta giliran combat tidak disimpan secara persis.

## Kontrol

| Tombol / aksi | Fungsi |
| --- | --- |
| WASD / tombol panah | Bergerak; saat combat, langkah per petak memakai AP |
| Q / R | Memutar arah pandang 90 derajat |
| Tahan klik kanan + geser | Melihat sekeliling |
| E | Interaksi saat eksplorasi: guci, peti, NPC, prasasti, altar, tangga |
| C / K | Menu karakter dan skill tree saat eksplorasi |
| I | Perlengkapan dan tas saat eksplorasi |
| 1–5 | Memilih skill hotbar saat giliran pemain |
| Klik musuh / penanda target, F, Enter | Menyerang target aktif; dapat mendekat bila diperlukan |
| Tab | Mengganti target dan menghadapnya saat giliran pemain |
| G | Kuda-kuda bertahan, 1 AP |
| 6 | Flask saat eksplorasi atau giliran pemain |
| Spasi | Mengakhiri giliran; sisa AP memberi Guard |

Menekan **1–5** dapat langsung menyerang jika hanya satu musuh berada dalam jangkauan. Skill untuk diri sendiri langsung digunakan. Biaya AP, cooldown, dan syarat adrenaline mengikuti skill terpasang, bukan nomor slot semata.

Gerakan eksplorasi bebas. Dalam combat, satu langkah keyboard ke petak tetangga memakai **1 AP**; aksi mendekat otomatis dihitung oleh sistem pergerakan combat. Kamera tidak berpindah ke isometrik. Roda mouse bukan kontrol zoom gameplay.

Gunakan tombol **Peta**, **Bestiari**, **Tampilan**, dan suara pada HUD untuk fungsi terkait.

## Empat kelas dan skill tree

| Kelas | Tiga jalur |
| --- | --- |
| Vanguard / Warrior | Bastion, Berserker, Commander |
| Arcanist / Mage | Elementalist, Spellblade, Hexbound |
| Skirmisher / Rogue | Shadow Stalker, Duelist, Bladedancer |
| Ranger / Archer | Deadeye, Trapmaster, Windrunner |

Setiap kelas mempunyai **12 node**: tiga jalur, masing-masing empat tingkatan. Total **48 node** pada empat kelas.

### Membuka dan memasang

1. Buka **Karakter**, periksa SP dan prasyarat node.
2. Pilih **Buka** untuk menambah skill ke koleksi. Pembelian tidak mengganti hotbar otomatis.
3. Untuk skill aktif, pilih **Pasang di Slot X**.
4. Periksa skill lama dan baru, lalu pilih **Ganti skill** atau **Batal**.

Skill hanya dapat dipasang pada slot yang sesuai. Ada lima slot hotbar. **Pakai skill dasar** mengembalikan isi slot tanpa menghapus pembelian.

Semua pasif yang dibuka berlaku otomatis. Investasi lintas jalur disebut **Build Campuran**; jumlah node per jalur serta daftar **Pasif Aktif** terlihat di menu.

Status dibedakan menjadi **Dimiliki**, **Terpasang**, **Pasif Aktif**, dan persyaratan membuka. Detail bisa dibuka dengan klik/keyboard. Header SP tetap terlihat saat menggulir.

Pembelian, pemasangan, dan reset dilakukan di luar combat. **Reset Tree** mengembalikan biaya SP node dan memulihkan hotbar dasar.

### Mekanik penting

- **Vanish:** dodge maksimal 60% hingga awal giliran berikutnya, bukan kebal atau tidak bisa ditargetkan.
- **Chain:** skill serangan berbeda menambah satu stack; mengulang skill memutus rantai. Empat stack memicu pengurangan cooldown sekali, lalu stack habis. Tidak memberi movement tambahan.
- **Riposte:** kuda-kuda memberi dua token, dodge berhasil memberi satu; maksimal tiga. Satu token membalas serangan setelah pemain terkena hit dan masih hidup.
- **Gale Agility:** dodge berhasil memberi AP dan pengurangan cooldown sesuai pasif.
- **Melt:** Es lalu Api; pengurangan DEF memakai elemen sebelumnya.
- **Eksekusi:** boss menerima damage, bukan langsung mati akibat eksekusi.

Detail tiap build tersedia pada mekanik jalur dan kartu skill.

## Combat dan balancing

Combat memakai AP, jangkauan, arah hadap, Flank/Backstab, Poise, dan Stance Break. Perhatikan giliran, penanda target, serta biaya skill. Petak abu menunjukkan gerak; merah menunjukkan area serangan.

- DEF mengurangi damage secara bertahap; mitigasi dari rumus armor maksimal 75%.
- Guard berakhir di awal giliran berikutnya. Barrier efektif maksimal 30% max HP.
- Lifesteal serangan memakai HP yang benar-benar hilang: maksimal 30% damage aktual dan 8% max HP per serangan. Pemulihan lain punya aturan tersendiri.
- Flask normal: 30% max HP, maksimal 110. Biaya combat 2 AP.
- Boon Eliksir Surya Murni: flask combat menjadi 40%, maksimal 140, dengan refund 1 AP. Flask eksplorasi tetap memakai aturan normal.
- Eliksir permanen: +25 max HP per pembelian, maksimal lima; harga mulai 90 gold dan naik 70 setiap pembelian. Tidak menambah ATK atau DEF.
- Musuh meningkat menurut kedalaman dan kontrak, bukan otomatis mengikuti equipment pemain.

Lantai lanjutan berisi kelompok kecil dengan peran pemanah, penyembuh, dan pemecah pertahanan. Boss serta pemecah segel dapat membidik petak sebelum hantaman besar. Saat muncul **BAHAYA: PINDAH PETAK**, bergerak sebelum giliran musuh berikutnya.

Equipment memiliki slot senjata utama, tangan kiri, armor, dan relik. Tempa item dan bonus set tetap tersedia.

## Rarity item

| Rarity | Warna border | Cahaya |
| --- | --- | --- |
| Common | Abu-abu | Sangat redup |
| Uncommon | Abu kebiruan | Redup |
| Rare | Biru | Sedang |
| Epic | Ungu | Terang |
| Legendary | Emas | Lebih terang |
| Mythic | Merah | Paling terang |

Border bercahaya berlaku pada equipment, tas, toko, hasil loot, dan meja tempa. Efeknya CSS statis, tanpa animasi kontinu atau lampu 3D tambahan.

## Delapan bab dan Kontrak Bara

1. Gerbang Abu
2. Reruntuhan Beku
3. Labirin Segel
4. Makam Purba
5. Singgasana Hampa
6. Arsip Nama yang Hilang
7. Jantung Tungku Gerhana
8. Fajar di Bawah Jurang

Cerita disampaikan melalui dialog turun lantai, prasasti, dan NPC. Liora berperan aktif membantu tawanan; singgasana bukan akhir perjalanan. Bab kedelapan memiliki epilog. Setelah selesai, pemain bisa kembali ke Gerbang Abu dengan equipment saat ini.

Saat turun ke lantai berikutnya:

| Pilihan | Konsekuensi |
| --- | --- |
| Jalur normal | Memulihkan 20% max HP saat turun |
| Kontrak Bara | Musuh +20% ATK/+15% HP; hadiah combat +50% gold/+30% EXP |

Boss kontrak memberi meterai khusus dengan keuntungan sekaligus pengurangan stat. Kontrak berlaku pada lantai tujuan dan ditampilkan di subtitle lantai. Pemain yang memilih kontrak tidak mendapat pemulihan jalur normal.

## Tampilan dan performa

- Dungeon memakai renderer 3D bergaya pixel; karakter dan banyak makhluk memakai atlas sprite.
- Tangan/senjata bergerak saat berjalan; tersedia efek serangan dan kematian musuh.
- Menu memakai nuansa gelap merah–abu; warna dunia dan aset dipertahankan.
- Menu **Tampilan** menyediakan pilihan kualitas dan gerakan visual.
- Peran musuh tambahan memakai aset yang tersedia. Kelompok dibatasi agar tetap ringan.

## Struktur proyek

```text
index.html                 Halaman game dan modal
play.bat                   Membuka index.html
play_server.bat             Server Node.js di port 3000
server.js                  Server file lokal
three.min.js               Pustaka grafis lokal
assets/                    Atlas karakter, tangan, font, gambar
css/                       UI, hotbar, menu, skill tree, rarity
js/rpg-data.js             Data dasar kelas, item, musuh, skill, cerita
js/abyss-expansion.js       Balancing, bab tambahan, kontrak, relik
js/inventory.js             Equipment, stat, pembelian skill, save
js/skill-loadout.js         Pemasangan skill dan menu tree
js/combat.js                Giliran, AP, damage, status, AI
js/dungeon.js               Dungeon dan penempatan encounter
js/main.js                  Integrasi, kamera, input, UI
js/retro.js                 Presentasi pixel
js/presentation.js         Efek dan kualitas visual
js/fps-hands.js             Tangan/senjata orang pertama
js/attack-effects.js        Efek serangan
js/death-effects.js         Efek kematian
js/combat-guide.js          Target dan panduan combat
js/audio.js                Audio prosedural
UPDATE-*.txt               Catatan pembaruan historis
```

Urutan script penting: data sebelum ekspansi, inventory sebelum loadout, dan `main.js` setelah modul pendukung. Untuk aturan yang berubah, gunakan README serta implementasi terbaru; catatan UPDATE lama dapat menggambarkan versi terdahulu.

## Status pengujian

Pemeriksaan mencakup sintaks JavaScript, 48 node empat kelas, pemasangan/migrasi save, refund SP, render menu, serta warna rarity. Pengujian balancing sebelumnya mencakup pemuatan delapan lantai/boss, 20 skill dasar empat kelas, 96 peta acak, pemulihan HP, dan hantaman bertelegraph.

Ini bukan playthrough lengkap seluruh kombinasi build. Kurva kesulitan, pacing cerita, dan interaksi build lanjutan masih perlu dievaluasi melalui permainan penuh.
