# Ever Deeper II: Abyssal Tactics

RPG dark fantasy bergaya pixel dengan eksplorasi **orang pertama (FPS)** dan pertarungan taktis berbasis giliran. Kamera tetap orang pertama saat combat, dengan tangan dan senjata terlihat.

Ikuti jejak Liora menuju dasar Abyss, temukan rahasia sumpah ayah, dan bantu para tawanan pulang. Versi ini memiliki **empat kelas, delapan bab, build campuran, serta kontrak tantangan opsional**.



## Sprite arah, deteksi musuh, dan save dunia

- Monster dan NPC memiliki tampilan depan, samping, dan belakang sesuai arah hadapnya. Tampilan kiri mencerminkan sprite samping. Sprite tetap memakai atlas bersama; tidak menambah model 3D atau lampu.
- Musuh berpatroli, curiga ketika mendengar langkah dekat, mengejar setelah mendeteksi pemain, lalu mencari di posisi terakhir yang diketahui selama sekitar enam detik sebelum kembali berpatroli. Pandangan memiliki sudut terbatas dan terhalang dinding. Boss tetap di arenanya.
- Saat eksplorasi, arahkan crosshair ke musuh dekat lalu tekan **F** atau klik kiri untuk memulai serangan. Sergapan dari belakang memberi pemain giliran pertama; bonus posisi tetap mengikuti aturan combat dan batas burst.
- Save menyimpan tata ruang setiap lantai yang dikunjungi, posisi/arah pandang pemain, posisi serta kondisi musuh, lokasi NPC, peti terbuka, guci pecah, fog, boss yang dikalahkan, dan tangga terbuka. **Simpan & Home** lalu Continue mengembalikan posisi terakhir. Autosave berlangsung sekitar setiap enam detik ketika eksplorasi aman, serta pada titik perubahan penting.
- Giliran combat yang sedang berlangsung belum disimpan. Menutup game saat bertarung kembali ke checkpoint sebelum pertarungan; mencoba lagi setelah mati mulai dari camp. Save lama tetap memuat gear dan lantai terakhir, tetapi peta lama yang belum pernah disimpan oleh versi ini dibuat sekali saat pertama dimuat.
- Menyelesaikan epilog lalu memulai perjalanan kembali membuat dunia baru sambil mempertahankan equipment. Save tetap lokal pada browser dan alamat yang sama.
- Validasi: 96 peta dari delapan lantai untuk penyimpanan dunia; 28 model untuk pemilihan sprite arah; deteksi, pencarian dan migrasi save diperiksa otomatis. Alur Simpan & Home → reload → Continue diuji di browser untuk posisi, peta, NPC, peti, boss dan tangga.

## Crafting Mimic, jadwal Vesper, dan karakter baru

- Setiap kemenangan Mimic memberi satu relik eksklusif yang dijamin masuk tas: Taring Rahang Mimic, lalu Karapas Peti Hidup, lalu Inti Lapar Mimic; siklus berulang tiap tiga kemenangan. Urutan tersimpan saat save/load. Ketiganya juga bisa dipakai sebagai relik universal. Drop Lidah Mimic Keberuntungan (peluang 65%) dan loot acak sebelumnya tetap ada.
- Kaelen, tab Layanan Spesial: Taring + Inti menjadi senjata Mythic khusus class (580 Gold); Karapas + Inti menjadi armor Mythic khusus class (520 Gold). Ada empat senjata dan empat armor, masing-masing dengan syarat class. Hanya resep yang cocok dengan class saat ini ditampilkan dan dapat dibuat.
- Lidah Mimic Keberuntungan + Inti menjadi Meterai Peti Pemakan Emas (Mythic, universal, 460 Gold): +18 ATK, +35 HP, +12% CRIT, +45% Gold saat dipakai. Bonus relik lama diganti, bukan ditumpuk. Lidah dari save lama tetap dapat digunakan dalam resep.
- Kedua bahan harus ada di tas; yang sedang dipakai harus dilepas. Bahan dan Gold habis setelah konfirmasi. Hasil masuk tas, level tempa tertinggi diwariskan sampai +10. Bahan Mimic dan seluruh hasil crafting ini tidak dijual oleh Kaelen/Vesper dan tidak masuk drop acak umum.
- Senjata: Pedang Rahang Peti (Vanguard), Tongkat Inti Pelahap (Arcanist), Belati Kembar Pemakan Emas (Skirmisher), Busur Taring Peti Hidup (Ranger). Armor: Zirah Karapas Peti Hidup, Jubah Selubung Mimic, Mantel Kulit Peniru, Selubung Pemburu Peti. Stat disusun sebagai pilihan tradeoff terhadap gear puncak yang sudah ada; batas burst tetap berlaku.
- Vesper kini mempunyai jadwal acak yang disimpan per ekspedisi: satu lantai dari 2–4, dan satu dari 5–7. Pada lantai terjadwal ia dijamin ditempatkan sekali di ruangan jelajah acak di luar camp, arena boss dan buronan. NPC lain tetap acak. Stok pasar gelap dan pembelian tetap tersimpan per lantai, tanpa refresh.
- Save lama dibuatkan jadwal pada bagian kampanye yang belum terlewat; save yang sudah di lantai 8 mendapat kunjungan lantai 8. Memulai ekspedisi baru membuat jadwal baru. Di Kaelen, buka percakapan Jejak Vesper untuk mengetahui lantai persinggahannya atau petunjuk ketika ia ada di lantai saat ini. Posisi ruangan tersimpan bersama kondisi lantai.
- Enam sprite asli pada assets/abyss-characters-v2.png: Vesper, Liora, tawanan bebas, Pemanah Sumpah, Pemecah Segel, Penjaga Paduan. Vesper memakai sprite dan portrait sendiri; Liora/tawanan dipakai di ending; tiga monster spesialis memakai modelType terpisah dan masuk bestiari. Portrait buronan akhir juga diarahkan ke atlas yang tepat. Tampilan samping dan belakang memakai atlas tambahan; semua memakai nearest filtering tanpa mipmap. Atlas tambahan diperkecil sekali saat dimuat menjadi 256 piksel per karakter (sekitar 14 MiB tekstur GPU tambahan).
- Validasi: 24 kemenangan Mimic lintas empat class, drop tepat sekali, siklus dan save/load; seluruh resep universal/class, proteksi bahan terpakai, tempa warisan dan pengecualian toko; 160 peta dengan Vesper terjadwal serta migrasi save akhir. Tes 400 peta NPC tetap terjangkau dan tidak tumpang tindih. Enam sprite, crop portrait, UV dan satu tekstur bersama diperiksa. Browser: resep Kaelen dan toko Vesper tampil tanpa error. Audit 586.920 skenario serta uji burst 7.600 skenario tetap lulus; 512.520 skenario sebelum gear puncak tanpa one-shot.

## Balancing aktif: hasil audit semua build

Aturan di bagian ini menggantikan angka balancing dalam catatan pembaruan lama di bawah.

- Monster biasa sekarang memiliki batas dasar HP per lantai dan peran. Lantai 1 sekitar 150 HP untuk monster umum; pemanah dan support lantai 8 memiliki minimal 684 HP, sementara brute lebih tebal. Boss punya batas dasar terpisah, mulai 650 HP di lantai 1 sampai minimal 4.200 HP di lantai 8. Kontrak tetap menambah kesulitan.
- Pengali serangan berat dan ultimate pada empat class serta semua subclass diturunkan bersama; tooltip dan skill tree mengikuti angka baru. Perlengkapan dan level save lama tetap dihitung ulang dengan aturan ini.
- Ketahanan membatasi TOTAL damage satu aktivasi terhadap masing-masing target: serangan biasa maksimal 38% max HP, serangan berat 65%, ultimate 88%, sebelum gear puncak. Critical, efek reaksi, berkat, panah susulan, splash, penetrasi, dan ledakan terkait memakai anggaran yang sama. Tick DoT berikutnya ikut dicadangkan agar serangan + tick pertama tidak langsung menghabiskan musuh sehat.
- Target yang sudah terluka bisa dihabisi dengan serangan berikutnya; anggaran diperbarui untuk tiap aktivasi. Eksekusi Commander/Shadow tetap berlaku hanya jika target sudah di bawah ambang HP SEBELUM aktivasi dimulai. Damage awal reaksi tidak boleh menurunkan HP dari penuh lalu memicu eksekusi pada aktivasi yang sama.
- Elite selalu memiliki batas 34% / 52% / 72%; boss dan buronan tier boss 14% / 22% / 30%. Keduanya tetap menahan burst meski gear pemain sudah puncak.
- Gear puncak berarti KEEMPAT slot (weapon, armor, offhand, relic) terisi item yang cocok class, memiliki rarity tertinggi yang tersedia pada slot tersebut, dan semuanya tempa +10. Weapon/armor/relic umumnya Mythic; offhand mengikuti rarity tertinggi yang memang ada. Satu item +9 atau slot kosong menghilangkan pengecualian. Gear puncak membebaskan batas burst monster biasa, sehingga one-shot kembali mungkin jika damage mencukupi.
- Ketahanan juga berlaku saat kembali ke lantai rendah sebelum gear puncak. Ini aturan burst eksplisit, bukan kenaikan HP musuh berdasarkan equipment pemain. HP musuh tetap berdasarkan lantai, peran, elite, dan kontrak.
- Regresi: 586.920 skenario serangan di seluruh tahap gear, empat class, 12 cabang, dan campuran cabang. Dari 512.520 skenario sebelum gear puncak: nol one-shot. Uji tekanan tambahan 7.600 skenario mencakup tujuh affix elite, semua pasif/berkat, ATK ekstrem, target berdekatan dan tick status pertama. Pengecualian gear puncak, perlindungan boss, dan kemampuan menghabisi target terluka juga diperiksa. Tes browser: patroli memulai combat, serangan dasar, tooltip skill baru, tanpa error. Ini pengujian otomatis dan terarah, belum playthrough penuh semua susunan giliran/item.

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
- Continue memulihkan kondisi lantai serta posisi eksplorasi terakhir. Giliran combat aktif kembali ke checkpoint sebelum pertarungan.

## Kontrol

| Tombol / aksi | Fungsi |
| --- | --- |
| WASD / tombol panah | Bergerak; saat combat, langkah per petak memakai AP |
| Q / R | Memutar arah pandang 90 derajat |
| Gerakkan mouse | Melihat sekeliling tanpa menahan tombol |
| Tahan Alt | Tampilkan kursor dan gunakan UI; lepas untuk kembali mouse-look |
| Escape | Lepaskan mouse; klik area game untuk melanjutkan |
| E | Interaksi saat eksplorasi: guci, peti, NPC, prasasti, altar, tangga |
| F / klik kiri saat eksplorasi | Sergap musuh dekat yang ditunjuk crosshair |
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

## Pembaruan drop, penggabungan, dan class lock

- Drop kemenangan (mimic, elite, boss, buronan, peti terkutuk, dan kontrak) disimpan ke tas sebelum layar hadiah muncul. Pemanggilan akhir combat berulang tidak menggandakan hadiah. Peti biasa langsung menyimpan hasil drop.
- Senjata/zirah/offhand yang memiliki syarat class hanya dapat dipasang oleh class tersebut. Item universal dan relik tanpa syarat bisa dipakai semua class. Drop class lain tetap masuk tas. Perlengkapan save lama yang tidak cocok dipindahkan ke tas saat dimuat.
- Crafting dilakukan di Kaelen melalui tab Layanan, bukan dari tas. Kaelen hadir di perkemahan awal setiap lantai, bersama NPC spesialis setempat. Tempa biasa +1 tetap layanan terpisah.
- Resep: Cincin Tulang Kragor + Jantung Es Beku Morwen → Cincin Sumsum Beku (Legendary), biaya 180 Gold. Taring Berkobar Pyrax + Selendang Bayangan Vael → Segel Bara Gerhana (Mythic), biaya 320 Gold. Cincin Sumsum Beku + Taring Berkobar Pyrax → Jantung Sumsum Fajar (Mythic), biaya 320 Gold.
- Dua bahan dari tas habis setelah konfirmasi; hasil masuk tas. Bahan yang sedang dipakai harus dilepas terlebih dahulu. Level tempa tertinggi diwariskan hingga +10, tidak dijumlahkan. Efek dan stat diganti sesuai pratinjau hasil, bukan dijumlahkan tanpa batas. Jika ada duplikat, bahan dengan tempa terendah dipilih dahulu. Semua hasil resep ini berupa relik universal. Hasil crafting tidak dijual atau masuk drop acak. Tidak ada perubahan pada hasil tempa dari versi sebelumnya.
- Relik khusus mimic, boss, dan buronan kini tidak dijual di toko atau masuk pool drop acak biasa; stok toko lama dibersihkan dari item khusus tersebut. Drop elite/peti acak masih dapat berisi perlengkapan umum yang juga dijual di toko.
- Drop yang sudah hilang pada versi lama tidak dapat dipulihkan otomatis karena riwayat item yang gagal diterima tidak tersimpan.
- Validasi: uji award tepat sekali dan persistensi untuk tujuh jalur combat, peti, empat class, migrasi perlengkapan, validasi resep crafting, serta regresi skill dan balancing. Belum merupakan playthrough penuh delapan bab.

## Pertemuan NPC acak dan pasar gelap

- Kaelen selalu berada dekat titik kedatangan/teleport di perkemahan awal lantai 1–8. Layanan tempa, crafting relik, toko, serta Flask tetap tersedia.
- Eloria, Valen, dan Malakor adalah pertemuan opsional acak. Vesper memakai jadwal acak yang dijamin muncul pada lantai persinggahannya; lihat bagian pembaruan terbaru di atas.
- NPC opsional berada di ruangan jelajah di luar perkemahan, ruang boss, dan ruang buronan. Ruangan pertemuan tidak diisi monster. Semua titik spawn diuji dapat dijangkau dan tidak menumpuk dengan entitas lain.
- Vesper menjual 4 barang Legendary/Mythic yang cocok class atau universal. Legendary minimal 1.200 Gold, Mythic minimal 2.200 Gold; harga dapat lebih tinggi mengikuti nilai barang. Satu stok per barang, tanpa refresh. Stok dan status terjual tersimpan per lantai; menjual kembali item tidak mengisi stok pedagang.
- Relik khusus boss/buronan/mimic serta hasil crafting tidak masuk pasar gelap. Visual dan portrait Vesper kini memakai atlas karakter khusus yang baru, dengan satu tekstur bersama.
- Seperti sistem save sebelumnya, Continue membangkitkan ulang peta lantai: posisi/pertemuan NPC bisa berubah. Stok pasar gelap yang sudah dibuat tetap tersimpan.
- Validasi: 400 peta (87 tanpa NPC opsional, 221 dengan satu, 92 dengan dua), akses spawn, tidak tumpang tindih, keempat NPC muncul dalam sampel; transaksi, pembatasan stok, save/load, dan reset untuk empat class. Bukan pengujian playthrough penuh.

## Notifikasi perolehan

Notifikasi item dari peti, pembelian, tempa, crafting, serta berkat muncul di tengah horizontal pada 44% tinggi layar (sekitar eye level, di atas crosshair). Latar 22% opasitas, teks 85%, tanpa border dan tidak menangkap klik. Nama item mengikuti warna rarity; berkat tanpa rarity memakai warna krem netral. Notifikasi memudar setelah 3,2 detik; timer lama dibatalkan ketika pesan baru muncul. Notifikasi peringatan dan sistem tetap memakai posisi semula. Posisi, warna Legendary, dan transparansi diverifikasi di browser.

## Ending visual dan save manual

- Setelah boss lantai 8 selesai, gunakan pintu/tangga akhir untuk memulai cutscene pixel-art sekitar 32 detik: nama terakhir, penjaga memudar, perjalanan tawanan, dan fajar bersama Liora. Adegan berupa komposisi canvas 640x360, maksimal 24 fps, menggunakan atlas karakter baru dengan sprite Liora dan tawanan tersendiri. Belum berupa animasi karakter/sinematik 3D khusus atau voice acting.
- Jeda/Lanjutkan tersedia; Lewati atau Escape membuka epilog. Setelah epilog, tombol kembali ke Gerbang Abu memulai penjelajahan lantai 1 dengan equipment tetap. Render dungeon berhenti selama cutscene; frame loop ending dibersihkan setelah selesai. Mendukung pengurangan gerakan.
- Tombol **Simpan** dan **Simpan & Home** menyimpan checkpoint lantai dan progres karakter. Hanya tersedia saat aman, bukan saat combat/ending. Tombol Lanjutkan menampilkan nomor lantai save; kegagalan penyimpanan memberi pesan dan membatalkan kembali ke Home.
- Save masih menggunakan localStorage browser dan alamat game yang sama. Continue kembali ke perkemahan lantai tersimpan dengan peta baru, bukan posisi atau kondisi persis tiap musuh/peti. Jangan berpindah browser/origin jika ingin membaca save yang sama. Mulai Ekspedisi Baru mengganti save lama.
- Validasi browser: lantai 5 → Simpan & Home → reload → Lanjutkan kembali ke lantai 5; pintu akhir lantai 8 memicu ending, jeda bekerja, lewati membuka epilog. Ini pengujian terarah, bukan playthrough delapan lantai.

## Bab 6–8: arsip, tungku, dan sumpah

- Lantai 6: pulihkan tiga arsip dalam urutan Ingatan, Nama, Pulang. Petunjuk tercantum di HUD objektif. Boss menyerang kolom yang ditandai; di bawah 50% HP, ancaman melebar menjadi tiga kolom.
- Lantai 7: kalahkan penjaga ruangan lalu matikan Pengikat Bara, Asap, dan Abu dalam urutan bebas. Boss menyapu baris; fase retak membentuk silang baris dan kolom.
- Lantai 8: patahkan tiga sumpah. Masing-masing memakai 1 Flask, atau 20 HP bila Flask kosong; tidak bisa mengorbankan HP sampai mati. Menumpas Orthus menghapus biaya sumpah. Boss menandai area berjarak Manhattan 1 petak, lalu 2 petak pada fase retak; pindah keluar sebelum giliran berikutnya.
- Ketiga objektif wajib selesai sebelum boss dapat dilawan. Progres objektif tersimpan meski Continue membangkitkan peta baru. Objektif yang selesai tidak perlu dibayar/diaktifkan lagi.
- Buronan baru: Serrik, Pencoret Wajah (6), Ilyra, Janda Tungku (7), dan Orthus, Pemakan Lonceng (8). Hadiah khusus: Pena Nama yang Kembali (Legendary), Jantung Janda Bara (Legendary), dan Lonceng Tanpa Korban (Mythic). Relik ini tidak dijual di toko. Hadiah boss terpisah dari hadiah buronan.
- Enam sprite baru memakai satu atlas transparan `assets/abyss-final-bosses.png` (~3 MB), berbagi tekstur tanpa model 3D berat. Petak ancaman memakai instancing agar tetap satu draw call. Layout ukuran/jumlah ruangan dan palet batu berbeda per lantai. Ending memakai visual Gema Sumpah baru.
- Forecast combat dipindahkan keluar dari wadah bertransformasi dan ditempatkan 12 px di atas panel status/hotbar. Petunjuk duplikat disembunyikan selama forecast tampil; ancaman serangan tetap dicantumkan. Ukuran diperbarui saat layar berubah.
- Validasi: 180 peta lantai akhir dengan objektif terjangkau dan posisi unik; save/load objektif; biaya HP/Flask; ketiga pola serangan mengenai dan meleset; delapan lantai dimuat tanpa error browser; jarak forecast diperiksa pada layar 1224×600. Regresi skill empat class, loot, crafting, dan NPC lulus. Belum merupakan playthrough penuh untuk mengukur keseimbangan semua build.

## Balancing dan musuh bergerak

- Monster biasa dan buronan berpatroli hingga 4 petak dari posisi awal. Jika pemain terlihat dalam 7 petak, mereka mengejar; batas pengejaran 12 petak dari titik awal. Deteksi terhalang dinding. Boss tetap di arena. Mimic tetap menyamar sampai diaktifkan.
- Kontak dalam 2 petak setelah peringatan minimal 0,8 detik memulai combat, termasuk ketika pemain diam. Giliran tetap mengikuti inisiatif; tidak ada damage gratis di luar combat. POV tetap FPS. Perkemahan awal dan radius 2 petak NPC aman. Menu, dialog, dan combat menghentikan patroli.
- Keputusan patroli maksimal 4 kali per detik per musuh, pergerakan visual diinterpolasi. Tidak ada aset gambar atau model berat tambahan.
- Panah di kaki menunjukkan arah hadap nyata (abu saat patroli, merah saat waspada/combat). Target memberi label DEPAN/SAMPING/BELAKANG. Sprite monster masih billboard satu arah: panah dan label adalah acuan posisi, bukan wajah sprite. Belum ada sprite tubuh tampak belakang/samping baru.
- Backstab sekarang memakai posisi penyerang terhadap arah hadap target. Bonus belakang 30% (40% dengan Anatomical Insight), peluang critical +15%; tidak otomatis critical. Samping memberi bonus 10%. Penyerang menghadap sasaran setelah menyerang. Eagle Eye dihitung sekali.
- Combo umum +4% per hit, maksimal +20%. Critical 1,5x. Bonus damage pemain gabungan memakai diminishing returns; pengali dasar skill tetap dipertahankan. Weakness Mark memicu critical terjamin sekali, tanpa pengali critical ganda. Stat peluang critical permanen maksimal 75%; proc khusus tetap dapat menjamin critical.
- Eksekusi Commander/Shadow membutuhkan target <=25%/30% HP. Skill dengan flag execute tidak lagi otomatis membunuh monster yang HP-nya penuh. Boss tetap tidak terkena instant kill.
- Tempa senjata memberi +2 ATK per tingkat (sebelumnya +4). Level tempa dan item save lama tetap tersimpan; stat dihitung dengan aturan baru. Bonus Poise tempa tidak berubah.
- HP monster biasa: multiplier 1 + 0,32d + 0,045d², d=lantai-1. DEF bertambah 2,5 per kedalaman, Poise +10% per kedalaman. Boss/buronan memakai kurva HP boss sebelumnya agar tidak ikut menggandakan HP secara berlebihan. Kontrak tetap penguat tambahan. Contoh monster biasa lantai 8: pemanah 354 HP, pemecah segel 626 HP, penjaga paduan 463 HP.
- Forecast menampilkan estimasi dasar non-critical, bukan janji damage final; proc, passive, pertahanan khusus, dan critical dapat mengubah hasilnya.
- Validasi: posisi depan/samping/belakang, eksekusi pada HP penuh, Eagle Eye tanpa penghitungan ganda, patroli mengejar pemain diam, boss tidak bergerak, deteksi terhalang dinding, wilayah aman, serta regresi loot/crafting/skill. Browser mengonfirmasi pergerakan -> combat otomatis, penanda arah, tanpa error. Ini bukan playthrough lengkap semua build; ultimate atau keunggulan equipment masih dapat menghasilkan one-shot pada musuh lemah.


## Kontrol mouse FPS

Gerakkan mouse untuk melihat tanpa klik kanan. Browser memakai pointer lock agar gerakan tidak berhenti di tepi layar dan kursor tersembunyi. Memilih karakter atau Lanjutkan mencoba mengaktifkannya; jika browser meminta klik, gunakan tombol di layar sekali. Klik pengaktifan ini tidak menyerang atau memakai AP.

Tahan Alt untuk menampilkan kursor dan memakai HUD/hotbar/peta. Kamera berhenti mengikuti mouse selama Alt ditahan. Lepas Alt untuk kembali mouse-look. Menu/dialog otomatis melepaskan mouse; menutup menu lewat klik mengaktifkan mouse-look kembali. Jika browser meminta interaksi ulang, klik area game. Escape, pindah tab dan kehilangan fokus juga melepaskan mouse; tidak ada penguncian ulang otomatis setelah Escape.

Saat mouse-look, klik kiri menyerang musuh yang terkena arah tengah layar. Klik lantai tidak memakai AP. Untuk memilih petak gerak dengan mouse, tahan Alt lalu klik petak. F/Enter tetap menyerang target aktif, Tab berganti target, dan hotkey lainnya tetap tersedia. Gerak/putar keyboard tidak diproses selama Alt ditahan; eksplorasi dan musuh tidak dijeda hanya karena Alt. Menu tetap menjeda patroli seperti sebelumnya.

Validasi: pengujian mouse-look tanpa tombol kanan, kedua tombol Alt, menu, Escape, klik pertama tanpa serangan, kehilangan fokus, tab tersembunyi, penolakan pointer lock dan permintaan terlambat. Browser yang tidak mendukung pointer lock tetap dapat memakai Q/R dan kontrol UI biasa.

Pengujian browser desktop: mode mouse-look dan kursor tersembunyi, serta mode kursor Alt teramati pada Chrome. Pratinjau bawaan/halaman yang tidak aktif dapat menolak pointer lock; buka game di tab browser desktop aktif dan klik tombol pengaktifan bila diperlukan.
