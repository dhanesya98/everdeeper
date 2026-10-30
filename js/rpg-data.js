/**
 * EVER DEEPER II: ABYSSAL TACTICS (TURUN TERUS RPG 2)
 * Core RPG Data: Lore, Classes, Monsters, Bosses, Skills, Equipment & Sets.
 */

window.RPG_DATA = (function() {
  const CLASSES = {
    warrior: {
      id: 'warrior',
      name: 'Vanguard (Ksatria Garda)',
      title: 'Benteng Terakhir Permukaan',
      desc: 'Petarung tangguh bersenjatakan pedang besar dan perisai baja. Menguasai pertahanan kokoh, serangan penghancur Poise, dan pukulan pemecah barisan musuh.',
      primaryStat: 'str',
      baseStats: {
        hp: 120,
        maxHp: 120,
        poise: 50,
        maxPoise: 50,
        ap: 4,
        maxAp: 4,
        str: 16,
        agi: 8,
        int: 6,
        atk: 22,
        def: 12,
        critChance: 0.08,
        moveRange: 4,
        potions: 3
      },
      skills: [
        {
          id: 'basic_slash',
          name: 'Tebasan Pedang',
          cost: 1,
          range: 1,
          rangeTag: '1 Petak',
          typeTag: 'Fisik Melee',
          tag: 'Dasar',
          type: 'single',
          dmgMult: 1.0,
          poiseDmg: 12,
          conditionText: 'Flank: +25% DMG dari samping | Backstab: 100% Critical Hit (+50% DMG) dari belakang musuh.',
          desc: 'Tebasan pedang baja cepat ke musuh di petak berdekatan.',
          icon: 'sword'
        },
        {
          id: 'crushing_blow',
          name: 'Pukulan Penghancur (Crushing Blow)',
          cost: 2,
          range: 1,
          rangeTag: '1 Petak',
          typeTag: 'Penghancur Kuda-Kuda',
          tag: 'Anti-Poise +35',
          type: 'single',
          dmgMult: 2.2,
          poiseDmg: 35,
          cooldown: 2,
          conditionText: 'Anti-Poise: Memberikan 35 Poise Dmg. Jika Poise musuh habis, memicu STANCE BREAK (Target pingsan 1 giliran & rentan critical)!',
          desc: 'Hantaman brutal berkekuatan penuh untuk meremukkan pertahanan lawan.',
          icon: 'hammer'
        },
        {
          id: 'shield_slam',
          name: 'Hantaman Perisai (Shield Slam)',
          cost: 2,
          range: 1,
          rangeTag: '1 Petak',
          typeTag: 'Taktis Kontrol',
          tag: 'Dorong & +6 DEF',
          type: 'single',
          dmgMult: 1.3,
          poiseDmg: 20,
          pushBack: 1,
          guardGain: 6,
          cooldown: 2,
          conditionText: 'Kondisi Dorongan: Mendorong target mundur 1 petak ke belakang dan seketika memberi karakter +6 DEF tambahan untuk 1 giliran.',
          desc: 'Menghantamkan perisai baja ke dada musuh dan memperkokoh pertahanan.',
          icon: 'shield'
        },
        {
          id: 'steel_brace',
          name: 'Kuda-Kuda Benteng (Bastion Brace)',
          cost: 1,
          range: 0,
          rangeTag: 'Diri Sendiri',
          typeTag: 'Pertahanan Murni',
          tag: '+10 DEF & +15 Poise',
          type: 'self',
          defBuff: 10,
          poiseRegen: 15,
          cooldown: 2,
          conditionText: 'Kondisi Bertahan: Langsung memulihkan 15 Poise sendiri dan memberi +10 DEF hingga giliran berikutnya.',
          desc: 'Mengunci posisi kaki ke lantai, menyerap benturan serangan musuh.',
          icon: 'fortress'
        },
        {
          id: 'avatar_blood',
          name: 'Avatar Surya Abadi (Ultimate)',
          cost: 3,
          range: 2,
          rangeTag: '2 Petak Terjang',
          typeTag: 'Ultimate Finisher',
          tag: 'Break & Heal 25%',
          type: 'single',
          dmgMult: 3.2,
          poiseDmg: 60,
          healPercent: 0.25,
          adrenalineReq: 100,
          conditionText: 'Kondisi Ultimate: Butuh 100% Adrenaline. Menerjang musuh dari 2 petak, menghancurkan 60 Poise, dan langsung memulihkan 25% Max HP!',
          desc: 'Membakar esensi Lentera Surya untuk menerjang dan menghancurkan musuh.',
          icon: 'sun'
        }
      ]
    },

    mage: {
      id: 'mage',
      name: 'Arcanist (Penyihir Surya)',
      title: 'Penjaga Api Pengetahuan Kuno',
      desc: 'Penyihir berdaya hancur tinggi yang menyalurkan api Lentera Surya. Menguasai ledakan area, serangan jarak jauh, dan sihir pembeku waktu.',
      primaryStat: 'int',
      baseStats: {
        hp: 85,
        maxHp: 85,
        poise: 30,
        maxPoise: 30,
        ap: 4,
        maxAp: 4,
        str: 5,
        agi: 9,
        int: 18,
        atk: 28,
        def: 5,
        critChance: 0.12,
        moveRange: 3,
        potions: 3
      },
      skills: [
        {
          id: 'arcane_bolt',
          name: 'Panah Arcanum',
          cost: 1,
          range: 4,
          rangeTag: '4 Petak Ranged',
          typeTag: 'Sihir Jarak Jauh',
          tag: 'Jarak Jauh 4P',
          type: 'single',
          dmgMult: 1.0,
          poiseDmg: 8,
          conditionText: 'Sihir Ranged: Menyerang aman dari jarak 4 petak tanpa perlu mendekat. Flank & Backstab tetap berlaku.',
          desc: 'Menembakkan proyektil energi sihir murni hingga jarak 4 petak.',
          icon: 'spark'
        },
        {
          id: 'fireball_abyss',
          name: 'Bola Api Surya (Fireball)',
          cost: 2,
          range: 4,
          area: 1, // 3x3 AoE
          rangeTag: '4P Jarak (Area 3x3)',
          typeTag: 'Ledakan Area (AoE)',
          tag: 'AoE 3x3 + Burn',
          type: 'aoe',
          dmgMult: 2.4,
          poiseDmg: 25,
          burnDuration: 2,
          cooldown: 3,
          conditionText: 'Kondisi Bakar Area: Meledakkan petak 3x3, melukai semua musuh dalam area sekaligus dan membakar mereka selama 2 giliran.',
          desc: 'Menjatuhkan bola api raksasa ke area target (3x3 petak), membakar tanah dan musuh.',
          icon: 'fire'
        },
        {
          id: 'frost_nova',
          name: 'Ledakan Beku (Frost Nova)',
          cost: 2,
          range: 0,
          area: 1,
          rangeTag: 'Keliling Tubuh',
          typeTag: 'Kontrol Area Beku',
          tag: 'Keliling + Freeze Slow',
          type: 'surround',
          dmgMult: 1.2,
          poiseDmg: 15,
          slowEffect: true,
          cooldown: 2,
          conditionText: 'Kondisi Pembekuan: Menghempaskan embun beku ke semua musuh di petak sekeliling, mengurangi AP mereka di giliran berikutnya.',
          desc: 'Membekukan semua petak di sekitar penyihir dan memperlambat musuh.',
          icon: 'frost'
        },
        {
          id: 'arcane_ward',
          name: 'Aura Segel Surya (Mana Shield)',
          cost: 1,
          range: 0,
          rangeTag: 'Diri Sendiri',
          typeTag: 'Pelindung Sihir',
          tag: 'Barrier +35 HP',
          type: 'self',
          barrier: 35,
          cooldown: 3,
          conditionText: 'Kondisi Perisai: Menyerap 35 damage berikutnya secara total sebelum damage menyentuh HP asli.',
          desc: 'Membentuk perisai kristal sihir pelindung nyawa.',
          icon: 'orb'
        },
        {
          id: 'solar_supernova',
          name: 'Supernova Lentera (Ultimate)',
          cost: 3,
          range: 5,
          rangeTag: 'Garis Lurus 5P',
          typeTag: 'Ultimate Laser',
          tag: 'Laser Piercing 5P',
          type: 'line',
          dmgMult: 3.5,
          poiseDmg: 50,
          adrenalineReq: 100,
          conditionText: 'Kondisi Ultimate: Butuh 100% Adrenaline. Menembakkan berkas laser suci lurus 5 petak menembus semua musuh dengan 50 Poise Damage!',
          desc: 'Membuka penuh tutup Lentera Surya menembakkan laser fajar penembus bayangan.',
          icon: 'blast'
        }
      ]
    },

    rogue: {
      id: 'rogue',
      name: 'Skirmisher (Pengintai Bayangan)',
      title: 'Hantu di Balik Tirai Kegelapan',
      desc: 'Pembunuh bayangan bertubuh lincah. Mengandalkan kecepatan gerak, serangan tipuan dari belakang (Backstab), dan bom asap untuk kabur atau menyerang tiba-tiba.',
      primaryStat: 'agi',
      baseStats: {
        hp: 95,
        maxHp: 95,
        poise: 35,
        maxPoise: 35,
        ap: 4,
        maxAp: 4,
        str: 9,
        agi: 17,
        int: 8,
        atk: 25,
        def: 7,
        critChance: 0.22,
        moveRange: 5,
        potions: 4
      },
      skills: [
        {
          id: 'dagger_thrust',
          name: 'Tusukan Belati Ganda',
          cost: 1,
          range: 1,
          rangeTag: '1 Petak Melee',
          typeTag: 'Serangan Kritis',
          tag: '+20% Peluang Crit',
          type: 'single',
          dmgMult: 1.0,
          poiseDmg: 10,
          critBonus: 0.20,
          conditionText: 'Kondisi Presisi: Memiliki tambahan +20% Critical Chance bawaan. Backstab otomatis memicu 100% Critical Hit!',
          desc: 'Serangan cepat belati baja ke titik lemah lawan.',
          icon: 'dagger'
        },
        {
          id: 'flash_strike',
          name: 'Serangan Kilat (Flash Strike)',
          cost: 2,
          range: 2,
          rangeTag: '2 Petak Tembus',
          typeTag: 'Teleport & Flank',
          tag: 'Teleport & Auto-Backstab',
          type: 'teleport_attack',
          dmgMult: 2.0,
          poiseDmg: 20,
          cooldown: 2,
          conditionText: 'Kondisi Backstab Otomatis: Melesat menembus musuh hingga ke petak di belakangnya dan mengeksekusi Backstab 100% Kritis seketika!',
          desc: 'Melesat secepat kilat menembus bayangan lawan.',
          icon: 'lightning'
        },
        {
          id: 'smoke_screen',
          name: 'Bom Asap Bayangan (Smoke Screen)',
          cost: 1,
          range: 2,
          rangeTag: 'Lompat 2P Bebas',
          typeTag: 'Evasion & Reposisi',
          tag: '+50% Evasion & Kabur',
          type: 'teleport_self',
          dodgeBuff: 0.50,
          cooldown: 2,
          conditionText: 'Kondisi Halimun: Melompat bebas 2 petak tanpa terkena serangan kesempatan dan memperoleh +50% Dodge hingga giliran berikutnya.',
          desc: 'Melempar bom asap pekat untuk menghilang dan berpindah posisi.',
          icon: 'smoke'
        },
        {
          id: 'poison_coat',
          name: 'Racun Jurang Kuno',
          cost: 1,
          range: 0,
          rangeTag: 'Diri Sendiri',
          typeTag: 'Buff Racun',
          tag: 'Racun Kalajengking 3 Turn',
          type: 'self',
          poisonTurns: 3,
          cooldown: 3,
          conditionText: 'Kondisi Racun: Melapisi belati dengan neurotoksin. 3 serangan berikutnya memberikan racun yang menguras HP musuh tiap giliran.',
          desc: 'Melumuri kedua bilah belati dengan racun kalajengking purba.',
          icon: 'flask'
        },
        {
          id: 'shadow_dance',
          name: 'Tarian Bayangan Abadi (Ultimate)',
          cost: 3,
          range: 3,
          rangeTag: '3 Petak Jangkau',
          typeTag: 'Multi-Hit Eksekusi',
          tag: '4x Hit Kritis Beruntun',
          type: 'multi_strike',
          dmgMult: 3.6,
          poiseDmg: 45,
          adrenalineReq: 100,
          conditionText: 'Kondisi Ultimate: Butuh 100% Adrenaline. Berpindah secepat kilat menebas 4 kali berturut-turut dengan 100% Critical Hit dan 45 Poise Dmg!',
          desc: 'Tarian maut bayangan yang menebas titik vital tanpa ampun.',
          icon: 'shadow'
        }
      ]
    },
    archer: {
      id: 'archer',
      name: 'Ranger Surya (Pemanah Fajar)',
      title: 'Pembidik Fajar dari Menara Penjaga',
      desc: 'Penembak jitu lincah dengan busur komposit berukir rune surya. Menguasai tembakan presisi jarak jauh (3-5 petak), anak panah penusuk barisan, jebakan jerat berduri, dan hujan panah ledakan fajar.',
      primaryStat: 'agi',
      baseStats: {
        hp: 95,
        maxHp: 95,
        poise: 35,
        maxPoise: 35,
        ap: 4,
        maxAp: 4,
        str: 9,
        agi: 16,
        int: 8,
        atk: 24,
        def: 7,
        critChance: 0.16,
        moveRange: 4,
        potions: 3
      },
      skills: [
        {
          id: 'precision_shot',
          name: 'Tembakan Presisi (Snipe)',
          cost: 1,
          range: 4,
          rangeTag: '4 Petak Jauh',
          typeTag: 'Fisik Jarak Jauh',
          tag: 'Sniper: +25% DMG di Jarak >= 3P',
          type: 'single',
          dmgMult: 1.15,
          poiseDmg: 12,
          sniperBonus: true,
          conditionText: 'Bonus Penembak Jitu: Memberikan +25% bonus damage jika target berjarak 3 petak atau lebih!',
          desc: 'Membidik titik vital musuh dengan tarikan busur penuh dari jarak aman.',
          icon: 'target'
        },
        {
          id: 'piercing_arrow',
          name: 'Panah Penusuk (Piercing Arrow)',
          cost: 2,
          range: 4,
          rangeTag: '4 Petak Tembus',
          typeTag: 'Anti-Barisan & Poise',
          tag: 'Tembus Garis Lurus',
          type: 'pierce_line',
          dmgMult: 1.65,
          poiseDmg: 28,
          cooldown: 2,
          conditionText: 'Tembakan Garis Lurus: Menembus seluruh musuh yang berada dalam satu garis lurus hingga 4 petak.',
          desc: 'Melepaskan anak panah berkepala baja berat yang melubangi barisan pertahanan musuh.',
          icon: 'arrow'
        },
        {
          id: 'barbed_snare',
          name: 'Jerat Kawat Berduri (Snare Trap)',
          cost: 2,
          range: 3,
          rangeTag: '3 Petak Pasang',
          typeTag: 'Kontrol & Pincang',
          tag: 'Kunci Gerak (Root 1T)',
          type: 'trap',
          dmgMult: 1.2,
          poiseDmg: 18,
          rootTurns: 1,
          cooldown: 2,
          conditionText: 'Jerat Kaki: Mengunci pergerakan musuh (Rooted: Jangkauan Gerak 0) selama 1 giliran penuh!',
          desc: 'Melempar kawat jerat berduri yang mengikat pergelangan kaki musuh saat mendekat.',
          icon: 'shield'
        },
        {
          id: 'vault_retreat',
          name: 'Lompatan Mundur (Vault Retreat)',
          cost: 1,
          range: 0,
          rangeTag: 'Diri Sendiri',
          typeTag: 'Reposisi Taktis',
          tag: 'Mundur 2P & +35% Dodge',
          type: 'vault_leap',
          dodgeBuff: 0.35,
          apRefund: 1,
          cooldown: 2,
          conditionText: 'Lompatan Akrobatik: Melompat mundur 2 petak menjauhi musuh, memberi +35% Dodge dan mengembalikan 1 AP!',
          desc: 'Menjejakkan kaki ke dada musuh atau lantai untuk melompat mundur menjaga jarak tembak ideal.',
          icon: 'lightning'
        },
        {
          id: 'solar_arrow_rain',
          name: 'Hujan Panah Surya (Solar Barrage)',
          cost: 3,
          range: 4,
          area: 1,
          rangeTag: '4P Area 3x3',
          typeTag: 'Ultimate Badai Panah',
          tag: '3x3 AoE Ledakan Surya',
          type: 'aoe',
          dmgMult: 2.5,
          poiseDmg: 45,
          adrenalineReq: 100,
          conditionText: 'Kondisi Ultimate: Butuh 100% Adrenaline. Menghujani area 3x3 petak dengan ratusan panah bara surya!',
          desc: 'Menembakkan puluhan anak panah berpendar fajar ke angkasa yang menghujam bumi secara serempak.',
          icon: 'blast'
        }
      ]
    }
  };

  const MONSTERS = {
    giant_rat: {
      name: 'Tikus Jurang Raksasa',
      type: 'beast',
      modelType: 'rat',
      hp: 45,
      poise: 20,
      atk: 12,
      def: 2,
      speed: 12,
      moveRange: 4,
      attackRange: 1,
      skills: ['Gigitan Liar'],
      exp: 25,
      gold: 15
    },
    cave_spider: {
      name: 'Laba-laba Batu Gua',
      type: 'beast',
      modelType: 'spider',
      hp: 55,
      poise: 25,
      atk: 15,
      def: 4,
      speed: 14,
      moveRange: 4,
      attackRange: 1,
      poisonChance: 0.35,
      skills: ['Sengatan Racun', 'Jaring Pelambat'],
      exp: 35,
      gold: 20
    },
    skeleton_warrior: {
      name: 'Prajurit Tengkorak Makam',
      type: 'undead',
      modelType: 'skeleton',
      hp: 75,
      poise: 40,
      atk: 18,
      def: 8,
      speed: 8,
      moveRange: 3,
      attackRange: 1,
      skills: ['Tusukan Tombak Purba', 'Tangkisan Tulang'],
      exp: 50,
      gold: 35
    },
    cave_troll: {
      name: 'Troll Batu Abyss',
      type: 'brute',
      modelType: 'troll',
      hp: 130,
      poise: 65,
      atk: 25,
      def: 12,
      speed: 6,
      moveRange: 2,
      attackRange: 1,
      skills: ['Gada Pemecah Tanah', 'Auman Menggetarkan'],
      exp: 80,
      gold: 50
    },
    abyss_ghost: {
      name: 'Roh Gentayangan Jurang',
      type: 'spirit',
      modelType: 'ghost',
      hp: 60,
      poise: 25,
      atk: 20,
      def: 2,
      speed: 15,
      moveRange: 5,
      attackRange: 3,
      skills: ['Jeritan Dingin Jiwa', 'Sentuhan Hampa'],
      exp: 65,
      gold: 40
    },
    vampire_knight: {
      name: 'Ksatria Darah Abyss',
      type: 'vampire',
      modelType: 'vampire',
      hp: 110,
      poise: 50,
      atk: 24,
      def: 10,
      speed: 13,
      moveRange: 4,
      attackRange: 1,
      lifeSteal: 0.25,
      skills: ['Tebasan Menghisap Darah', 'Langkah Kelelawar'],
      exp: 95,
      gold: 70
    },
    mimic: {
      name: 'Peti Mimic Lapar (Hungry Mimic)',
      type: 'mimic',
      modelType: 'mimic',
      hp: 175,
      poise: 60,
      atk: 26,
      def: 10,
      speed: 12,
      moveRange: 3,
      attackRange: 1,
      skills: ['Gigitan Pemakan Koin', 'Lidah Menjerat Hampa', 'Semburan Asam Karat'],
      exp: 130,
      gold: 140
    }
  };

  const BOSSES = {
    floor_1: {
      id: 'young_dragon',
      name: 'Young Dragon (Naga Muda Gerbang Abu)',
      title: 'Penjaga Gerbang Abu - Lantai 1',
      modelType: 'dragon',
      hp: 280,
      maxHp: 280,
      poise: 90,
      maxPoise: 90,
      atk: 28,
      def: 14,
      speed: 11,
      moveRange: 3,
      attackRange: 3,
      gimmick: 'Napas Bara: Membakar petak arena di sekelilingnya setiap 2 giliran.',
      quote: 'Sayapku telah memanggang ratusan pembawa lentera sebelum dirimu... Gadis kecil Liora sudah diseret jauh ke dasar terdalam!',
      skills: [
        { name: 'Cakaran Raksasa', dmg: 24, poiseDmg: 20, range: 1 },
        { name: 'Semburan Api Abu', dmg: 32, poiseDmg: 30, range: 3, aoe: true },
        { name: 'Kepakan Sayap Badai', dmg: 18, poiseDmg: 25, push: 2 }
      ],
      exp: 300,
      gold: 250,
      rewardItem: 'dragon_claw_ring'
    },
    floor_2: {
      id: 'dark_king',
      name: 'Dark King (Raja Terkutuk dari Reruntuhan)',
      title: 'Raja Terkutuk dari Reruntuhan - Lantai 2',
      modelType: 'dark_king',
      hp: 420,
      maxHp: 420,
      poise: 120,
      maxPoise: 120,
      atk: 36,
      def: 20,
      speed: 9,
      moveRange: 3,
      attackRange: 1,
      gimmick: 'Titah Raja: Mengaktifkan Royal Barrier setiap 3 giliran (+2 Poise & memantulkan 20% damage).',
      quote: 'Demi kerajaanku yang membeku dalam kegelapan, kuserahkan jiwa Liora pada Sang Penguasa Jurang! Jangan harap kau bisa turun lebih jauh!',
      skills: [
        { name: 'Tebasan Pedang Mahkota Kegelapan', dmg: 35, poiseDmg: 30, range: 1 },
        { name: 'Titah Hukuman Mati', dmg: 45, poiseDmg: 40, range: 2 },
        { name: 'Segel Reruntuhan Beku', dmg: 25, poiseDmg: 20, slow: true }
      ],
      exp: 550,
      gold: 450,
      rewardItem: 'crown_of_ruins'
    },
    floor_3: {
      id: 'evil_sorcerer',
      name: 'Evil Sorcerer (Arsitek Segel Surya)',
      title: 'Arsitek Segel Surya - Lantai 3',
      modelType: 'sorcerer',
      hp: 520,
      maxHp: 520,
      poise: 100,
      maxPoise: 100,
      atk: 44,
      def: 15,
      speed: 13,
      moveRange: 4,
      attackRange: 4,
      gimmick: 'Segel Mana: Menyerap Adrenaline pemain dan memanggil tombak kristal hampa.',
      quote: 'Cahaya di lenteramu... bergetar selaras dengan detak jantung Liora saat kami menyegelnya di ruang singgasana jurang!',
      skills: [
        { name: 'Ledakan Komet Hampa', dmg: 48, poiseDmg: 35, range: 4, aoe: true },
        { name: 'Kutukan Jiwa Memudar', dmg: 30, poiseDmg: 20, drainAdrenaline: 30 },
        { name: 'Teleportasi Bayangan Arcanum', dmg: 0, escape: true }
      ],
      exp: 800,
      gold: 700,
      rewardItem: 'solar_seal_orb'
    },
    floor_4: {
      id: 'ancient_lich',
      name: 'Ancient Lich (Penilik Makam Abadi)',
      title: 'Penilik Makam Abadi - Lantai 4',
      modelType: 'lich',
      hp: 680,
      maxHp: 680,
      poise: 140,
      maxPoise: 140,
      atk: 52,
      def: 22,
      speed: 10,
      moveRange: 3,
      attackRange: 3,
      gimmick: 'Filakteri Tulang: Saat HP mencapai 50%, membangkitkan perisai tulang kebal selama 1 giliran.',
      quote: 'Kematian hanyalah awal di jurang ini. Liora masih bernapas di dasar terdalam, tapi jiwanya mulai menyatu dengan kegelapan abadi...',
      skills: [
        { name: 'Hujan Tengkorak Kutukan', dmg: 55, poiseDmg: 40, range: 4, aoe: true },
        { name: 'Hisapan Jiwa Makam Kuno', dmg: 42, poiseDmg: 25, heal: 35 },
        { name: 'Genggaman Tulang Belulang', dmg: 30, poiseDmg: 30, root: true }
      ],
      exp: 1200,
      gold: 1000,
      rewardItem: 'lich_phylactery_shard'
    },
    floor_5: {
      id: 'shadow_emperor',
      name: 'Shadow Emperor (Kaisar Jurang Abadi)',
      title: 'Sang Penguasa Kegelapan - Lantai Terakhir',
      modelType: 'emperor',
      hp: 1000,
      maxHp: 1000,
      poise: 200,
      maxPoise: 200,
      atk: 65,
      def: 28,
      speed: 14,
      moveRange: 4,
      attackRange: 3,
      gimmick: 'Gerhana Total: Lentera Surya meredup, setiap serangan menghasilkan gelombang bayangan hampa.',
      quote: 'Kau akhirnya sampai, pembawa lentera. Liora ada tepat di belakang tahtaku! Rebut kembali adikmu jika lentera rapuhmu sanggup melawan malam abadi!',
      skills: [
        { name: 'Pedang Pemenggal Fajar', dmg: 70, poiseDmg: 50, range: 2 },
        { name: 'Badai Hampa Jurang', dmg: 60, poiseDmg: 45, range: 4, aoe: true },
        { name: 'Dominasi Mutlak Kaisar', dmg: 85, poiseDmg: 70, range: 1 }
      ],
      exp: 3000,
      gold: 2500,
      rewardItem: 'crown_of_eternal_dawn'
    }
  };

  const SETS = {
    bastion: {
      id: 'bastion',
      name: 'Set Benteng Abadi (Bastion)',
      icon: 'fortress',
      bonus2: '+20% Total DEF & Kebal Knockback.',
      bonus4: 'Penghancur Perisai: Guard Break menghasilkan +40% Bonus Damage dan +30 Barrier awal pertempuran.'
    },
    blood: {
      id: 'blood',
      name: 'Set Darah Abadi (Blood Set)',
      icon: 'blood',
      bonus2: '+10% Lifesteal & +20% ATK saat HP di bawah 50%.',
      bonus4: 'Avatar Darah: Memicu Stance Break memulihkan 20% Max HP & +1 AP.'
    },
    shadow: {
      id: 'shadow',
      name: 'Set Bayangan Jurang (Shadow Set)',
      icon: 'shadow',
      bonus2: '+15% Dodge & +15% Critical Chance.',
      bonus4: 'Eksekutor Malam: Serangan pertama menghancurkan +30 Poise dan langsung memberi efek Camouflage.'
    },
    arcanum: {
      id: 'arcanum',
      name: 'Set Tenunan Arcanum (Arcanum Weave)',
      icon: 'spark',
      bonus2: '+10 Magic ATK & +20 Barrier Shield pasif.',
      bonus4: 'Katalis Kosmik: Cooldown semua mantra berkurang 1 giliran ekstra.'
    },
    duelist: {
      id: 'duelist',
      name: 'Set Pendekar Tangkas (Duelist Finesse)',
      icon: 'dagger',
      bonus2: '+12% Dodge & +6 DEF tangkisan.',
      bonus4: 'Kontra Balas: Serangan balik Riposte menghasilkan +35% damage tambahan.'
    },
    storm: {
      id: 'storm',
      name: 'Set Badai Bilah (Blade Storm)',
      icon: 'lightning',
      bonus2: '+1 Jangkauan gerak langkah & +8 ATK.',
      bonus4: 'Aliran Badai: Setiap Combo Chain memberi ekstra +8% Critical Chance.'
    }
  };

  const ITEMS = [
    // === WEAPONS: WARRIOR ===
    { id: 'iron_broadsword', name: 'Pedang Panjang Baja', slot: 'weapon', classReq: 'warrior', rarity: 'common', atk: 12, str: 2, price: 40, icon: 'sword', desc: 'Pedang tempa standar pelindung benteng permukaan.' },
    { id: 'steel_battleaxe', name: 'Kapak Tempur Tempaan Baja', slot: 'weapon', classReq: 'warrior', rarity: 'common', atk: 15, str: 1, poise: 12, price: 50, icon: 'hammer', desc: 'Bilah kapak berat untuk membelah perisai lawan.' },
    { id: 'vanguard_claymore', name: 'Claymore Garda Depan', slot: 'weapon', classReq: 'warrior', rarity: 'rare', atk: 22, str: 5, poise: 14, set: 'bastion', price: 95, icon: 'greatsword', desc: 'Pedang raksasa pemecah perisai lawan peninggalan ksatria benteng.' },
    { id: 'war_hammer_colossus', name: 'Palu Perang Kolosal', slot: 'weapon', classReq: 'warrior', rarity: 'rare', atk: 20, str: 4, poise: 25, set: 'bastion', price: 105, icon: 'hammer', desc: 'Palu batu bertatahkan besi granit purba yang menghancurkan kuda-kuda.' },
    { id: 'crimson_cleaver', name: 'Golok Jagal Darah', slot: 'weapon', classReq: 'warrior', rarity: 'epic', atk: 30, str: 7, crit: 0.08, set: 'blood', price: 175, icon: 'greatsword', desc: 'Bilah bergerigi yang haus darah, mengalirkan daya hidup korban ke pemakainya.' },
    { id: 'bastion_halberd', name: 'Tombak Kapak Penjaga Gerbang', slot: 'weapon', classReq: 'warrior', rarity: 'epic', atk: 27, def: 6, poise: 20, set: 'bastion', price: 170, icon: 'sword', desc: 'Tombak panjang penangkal serbuan monster Abyss bertaring baja.' },
    { id: 'judicator_gavel', name: 'Palu Hakim Vonis Suci', slot: 'weapon', classReq: 'warrior', rarity: 'epic', atk: 29, str: 7, crit: 0.12, price: 185, icon: 'hammer', desc: 'Menghakimi lawan dengan hantaman palu berlapis emas suci.' },
    { id: 'sun_blessed_blade', name: 'Pedang Berkat Surya', slot: 'weapon', classReq: 'warrior', rarity: 'legendary', atk: 38, str: 10, crit: 0.12, set: 'blood', price: 260, icon: 'sun', desc: 'Bilah suci yang memancarkan serpihan cahaya matahari pertama yang hilang.' },
    { id: 'dragonslayer_greatsword', name: 'Pedang Pembantai Naga Abyss', slot: 'weapon', classReq: 'warrior', rarity: 'mythic', atk: 52, str: 15, poise: 35, crit: 0.15, price: 390, icon: 'greatsword', desc: 'Ditempa dari tulang rusuk naga purba yang pernah meruntuhkan benteng fajar.' },

    // === WEAPONS: MAGE ===
    { id: 'apprentice_staff', name: 'Tongkat Sihir Kayu Ek', slot: 'weapon', classReq: 'mage', rarity: 'common', atk: 14, int: 3, price: 40, icon: 'staff', desc: 'Fokus sihir permulaan seorang arcanist muda.' },
    { id: 'pyromancer_tome', name: 'Kitab Mantra Api Surya', slot: 'weapon', classReq: 'mage', rarity: 'rare', atk: 25, int: 7, crit: 0.08, set: 'arcanum', price: 95, icon: 'book', desc: 'Halaman kuno yang menyimpan rumus pembakar bayangan malam.' },
    { id: 'cryo_glacial_scepter', name: 'Tongkat Kristal Glasier Abadi', slot: 'weapon', classReq: 'mage', rarity: 'rare', atk: 22, int: 6, poise: 15, price: 100, icon: 'staff', desc: 'Tongkat es yang membekukan udara di sekeliling pemakainya.' },
    { id: 'astral_spellblade', name: 'Bilah Pedang Sihir Astral', slot: 'weapon', classReq: 'mage', rarity: 'epic', atk: 30, int: 8, agi: 5, set: 'arcanum', price: 180, icon: 'sword', desc: 'Pedang bermata sihir murni yang beresonansi dengan rapalan mantra.' },
    { id: 'hexbound_codex', name: 'Kodeks Pembusukan Maut', slot: 'weapon', classReq: 'mage', rarity: 'epic', atk: 28, int: 9, hp: 25, set: 'shadow', price: 175, icon: 'book', desc: 'Kitab bertuliskan tinta darah arwah penunggu jurang Abyss.' },
    { id: 'chrono_hourglass_wand', name: 'Tongkat Jam Pasir Waktu', slot: 'weapon', classReq: 'mage', rarity: 'legendary', atk: 36, int: 11, crit: 0.12, price: 255, icon: 'staff', desc: 'Mampu memperlambat hembusan waktu dan mempercepat perputaran mantra.' },
    { id: 'abyssal_prism_staff', name: 'Tongkat Prisma Jurang Surya', slot: 'weapon', classReq: 'mage', rarity: 'legendary', atk: 42, int: 13, crit: 0.15, set: 'shadow', price: 270, icon: 'orb', desc: 'Mengubah energi kegelapan menjadi sinar spektrum pemusnah beruntun.' },
    { id: 'supernova_grimoire', name: 'Grimoire Bintang Kataklisme', slot: 'weapon', classReq: 'mage', rarity: 'mythic', atk: 54, int: 17, crit: 0.20, set: 'arcanum', price: 410, icon: 'sun', desc: 'Menyimpan inti kehancuran bintang yang mampu membakar seisi jurang terdalam.' },

    // === WEAPONS: ROGUE ===
    { id: 'scout_daggers', name: 'Belati Baja Kembar', slot: 'weapon', classReq: 'rogue', rarity: 'common', atk: 11, agi: 3, crit: 0.06, price: 40, icon: 'dagger', desc: 'Sepasang belati ringan untuk serangan kilat tanpa suara.' },
    { id: 'shadow_stiletto', name: 'Stiletto Bayangan Malam', slot: 'weapon', classReq: 'rogue', rarity: 'rare', atk: 20, agi: 7, crit: 0.15, set: 'shadow', price: 95, icon: 'dagger', desc: 'Bilah tipis yang menusuk langsung celah zirah musuh.' },
    { id: 'duelist_rapier', name: 'Rapier Anggun Sang Penangkis', slot: 'weapon', classReq: 'rogue', rarity: 'rare', atk: 19, agi: 6, def: 5, set: 'duelist', price: 100, icon: 'sword', desc: 'Bilah lentur berujung jarum, sempurna untuk tangkisan dan serangan balik kilat.' },
    { id: 'poisoned_kris', name: 'Keris Beracun Kalajengking', slot: 'weapon', classReq: 'rogue', rarity: 'rare', atk: 18, agi: 5, crit: 0.10, price: 90, icon: 'dagger', desc: 'Bilah berliku yang telah direndam dalam bisa kalajengking jurang.' },
    { id: 'bladedancer_scythes', name: 'Sabit Kembar Penari Badai', slot: 'weapon', classReq: 'rogue', rarity: 'epic', atk: 29, agi: 10, crit: 0.12, set: 'storm', price: 180, icon: 'dagger', desc: 'Sabit lengkung berputar indah yang mencabik-cabik barisan musuh.' },
    { id: 'phantom_assassin_edge', name: 'Belati Malaikat Maut', slot: 'weapon', classReq: 'rogue', rarity: 'epic', atk: 33, agi: 10, crit: 0.18, set: 'shadow', price: 185, icon: 'dagger', desc: 'Menghilangkan keberadaan pemakainya saat korban menghembuskan napas terakhir.' },
    { id: 'lioras_lost_blade', name: 'Belati Kenangan Liora', slot: 'weapon', classReq: 'rogue', rarity: 'legendary', atk: 36, agi: 12, crit: 0.22, set: 'blood', price: 260, icon: 'spark', desc: 'Belati ukir peninggalan adikmu yang berpendar hangat oleh lentera surya.' },
    { id: 'obsidian_void_katana', name: 'Katana Kaca Obsidian Kehampaan', slot: 'weapon', classReq: 'rogue', rarity: 'mythic', atk: 50, agi: 16, crit: 0.25, set: 'shadow', price: 400, icon: 'sword', desc: 'Bilah hitam pekat yang menyerap seluruh pantulan cahaya dan membelah ruang hampa.' },

    // === WEAPONS: ARCHER (BOWS) ===
    { id: 'hunter_shortbow', name: 'Busur Pemburu Pendek', slot: 'weapon', classReq: 'archer', rarity: 'common', atk: 12, agi: 3, crit: 0.05, price: 40, icon: 'arrow', desc: 'Busur kayu lentur pemburu hutan permukaan yang akurat dan ringan.' },
    { id: 'bone_composite_bow', name: 'Busur Komposit Tulang Monster', slot: 'weapon', classReq: 'archer', rarity: 'common', atk: 15, agi: 4, poise: 10, price: 50, icon: 'arrow', desc: 'Busur bertulang monster abyss dengan tarikan tali kencang berdaya tembus tinggi.' },
    { id: 'tower_guard_longbow', name: 'Busur Panjang Penjaga Menara', slot: 'weapon', classReq: 'archer', rarity: 'rare', atk: 22, agi: 6, crit: 0.08, set: 'storm', price: 100, icon: 'arrow', desc: 'Busur panjang pengintai menara fajar dengan jarak lontar anak panah menakjubkan.' },
    { id: 'windrunner_galebow', name: 'Busur Badai Penjelajah Angin', slot: 'weapon', classReq: 'archer', rarity: 'rare', atk: 20, agi: 7, poise: 14, set: 'storm', price: 110, icon: 'arrow', desc: 'Busur ringan bersiul angin yang mempercepat momentum tarikan tali.' },
    { id: 'sunlit_recurve_bow', name: 'Busur Lengkung Surya Fajar', slot: 'weapon', classReq: 'archer', rarity: 'epic', atk: 30, agi: 10, crit: 0.12, set: 'bastion', price: 180, icon: 'arrow', desc: 'Busur lengkung bersepuh emas yang mengalirkan percikan api matahari ke setiap bidikan.' },
    { id: 'phantom_stalker_bow', name: 'Busur Bayangan Pemburu Sunyi', slot: 'weapon', classReq: 'archer', rarity: 'epic', atk: 32, agi: 11, crit: 0.15, set: 'shadow', price: 185, icon: 'arrow', desc: 'Melepaskan panah tanpa suara yang menembus baju zirah dari kegelapan.' },
    { id: 'stormstrider_greatbow', name: 'Busur Raksasa Pembelah Badai', slot: 'weapon', classReq: 'archer', rarity: 'legendary', atk: 40, agi: 14, crit: 0.18, set: 'storm', price: 275, icon: 'arrow', desc: 'Busur raksasa legendaris yang anak panahnya bergemuruh bagai kilat badai.' },
    { id: 'lioras_dawnstar_bow', name: 'Busur Bintang Fajar Liora', slot: 'weapon', classReq: 'archer', rarity: 'mythic', atk: 54, agi: 18, crit: 0.22, hp: 50, price: 420, icon: 'sun', desc: 'Ditempa dengan serpihan pita fajar Liora. Memancarkan sinar fajar suci pemusnah kegelapan mutlak.' },

    // === OFFHANDS ===
    { id: 'wooden_shield', name: 'Perisai Kayu Diperkuat', slot: 'offhand', classReq: 'warrior', rarity: 'common', def: 4, poise: 8, price: 35, icon: 'shield', desc: 'Perisai bundar sederhana berlapis plat besi penahan benturan.' },
    { id: 'iron_buckler', name: 'Buckler Baja Penangkis', slot: 'offhand', classReq: 'warrior', rarity: 'common', def: 6, poise: 12, price: 45, icon: 'shield', desc: 'Perisai kecil fleksibel untuk menangkis sabetan senjata.' },
    { id: 'tower_shield', name: 'Perisai Benteng Baja', slot: 'offhand', classReq: 'warrior', rarity: 'rare', def: 10, poise: 20, set: 'bastion', price: 90, icon: 'shield', desc: 'Dinding baja yang sanggup menahan hantaman gada troll raksasa.' },
    { id: 'spiked_aegis_wall', name: 'Dinding Duri Benteng Kinetis', slot: 'offhand', classReq: 'warrior', rarity: 'epic', def: 16, poise: 30, set: 'bastion', price: 165, icon: 'shield', desc: 'Perisai berduri baja runcing yang memantulkan kembali daya benturan musuh.' },
    { id: 'sun_crest_pavise', name: 'Pavise Mahkota Surya', slot: 'offhand', classReq: 'warrior', rarity: 'legendary', def: 22, poise: 40, hp: 30, price: 250, icon: 'crown', desc: 'Perisai lantai bertatahkan ukiran matahari lambang pelindung dinasti fajar.' },

    { id: 'apprentice_manuscript', name: 'Manuskrip Catatan Pemula', slot: 'offhand', classReq: 'mage', rarity: 'common', atk: 4, int: 2, price: 35, icon: 'book', desc: 'Buku catatan kecil berisi penjaga stabilitas aliran mana.' },
    { id: 'solar_orb', name: 'Orb Kristal Surya', slot: 'offhand', classReq: 'mage', rarity: 'rare', atk: 8, int: 5, price: 90, icon: 'orb', desc: 'Kristal berputar yang menstabilkan konsentrasi sihir matahari.' },
    { id: 'glacial_mirror', name: 'Cermin Es Abadi', slot: 'offhand', classReq: 'mage', rarity: 'epic', atk: 10, int: 6, def: 8, price: 160, icon: 'shield', desc: 'Memantulkan mantra dingin untuk membentuk tameng kristal es tipis.' },
    { id: 'astral_catalyst_orb', name: 'Katalis Bola Astral Surya', slot: 'offhand', classReq: 'mage', rarity: 'legendary', atk: 15, int: 10, set: 'arcanum', price: 245, icon: 'orb', desc: 'Mengumpulkan serpihan energi astral setiap kali mantra berhasil dirapal.' },

    { id: 'throwing_kunai', name: 'Kunai Bayangan Beracun', slot: 'offhand', classReq: 'rogue', rarity: 'rare', atk: 7, agi: 5, crit: 0.06, set: 'shadow', price: 90, icon: 'dagger', desc: 'Senjata lempar cepat untuk merusak keseimbangan musuh dari sisi buta.' },
    { id: 'parrying_dagger', name: 'Belati Tangkis Sayap Kiri', slot: 'offhand', classReq: 'rogue', rarity: 'rare', atk: 5, def: 6, agi: 5, set: 'duelist', price: 95, icon: 'dagger', desc: 'Didesain khusus untuk menangkap dan mengunci bilah pedang lawan.' },
    { id: 'shadow_buckler', name: 'Buckler Bayangan Pengelana', slot: 'offhand', classReq: 'rogue', rarity: 'epic', def: 8, agi: 7, crit: 0.06, set: 'duelist', price: 160, icon: 'shield', desc: 'Perisai kulit dilapisi perak malam yang membantu gerak menghindar cepat.' },
    { id: 'duelist_main_gauche', name: 'Main-Gauche Pembalas Maut', slot: 'offhand', classReq: 'rogue', rarity: 'legendary', atk: 14, agi: 9, def: 8, set: 'duelist', price: 245, icon: 'dagger', desc: 'Belati penangkis legendaris yang melancarkan tebasan balas secepat kedipan mata.' },

    // === OFFHANDS: ARCHER (QUIVERS) ===
    { id: 'leather_quiver', name: 'Tabung Panah Kulit Rusa', slot: 'offhand', classReq: 'archer', rarity: 'common', atk: 4, agi: 2, price: 35, icon: 'arrow', desc: 'Tabung anak panah kulit ringan yang mempermudah pengambilan panah cepat.' },
    { id: 'falcon_quiver', name: 'Tabung Panah Bulu Elang', slot: 'offhand', classReq: 'archer', rarity: 'rare', atk: 8, agi: 5, crit: 0.06, price: 90, icon: 'arrow', desc: 'Dihiasi bulu elang fajar, menambah kestabilan lintasan anak panah.' },
    { id: 'venom_quiver', name: 'Tabung Panah Racun Purba', slot: 'offhand', classReq: 'archer', rarity: 'rare', atk: 9, agi: 4, hp: 15, price: 95, icon: 'flask', desc: 'Ujung anak panah terendam racun neurotoksin pekat.' },
    { id: 'solar_flare_quiver', name: 'Tabung Panah Fajar Berpendar', slot: 'offhand', classReq: 'archer', rarity: 'epic', atk: 14, agi: 7, crit: 0.08, price: 165, icon: 'sun', desc: 'Setiap anak panah menyerap cahaya lentera untuk ledakan bara saat menghantam sasaran.' },
    { id: 'void_piercer_quiver', name: 'Tabung Panah Penembus Hampa', slot: 'offhand', classReq: 'archer', rarity: 'legendary', atk: 20, agi: 11, crit: 0.12, price: 255, icon: 'shadow', desc: 'Menghasilkan anak panah berenergi hampa yang menembus baja zirah tanpa hambatan.' },

    // === ARMORS: HEAVY / MEDIUM / LIGHT ===
    { id: 'leather_tunic', name: 'Rompi Kulit Petualang', slot: 'armor', rarity: 'common', def: 5, hp: 15, price: 40, icon: 'armor', desc: 'Zirah ringan untuk mobilitas penjelajahan di lorong sempit.' },
    { id: 'iron_chainmail', name: 'Baju Rantai Besi Tempa', slot: 'armor', rarity: 'common', def: 8, hp: 25, poise: 10, price: 50, icon: 'armor', desc: 'Baju zirah anyaman cincin besi standar ksatria penjaga gerbang.' },
    { id: 'vanguard_cuirass', name: 'Cuirass Plat Garda Depan', slot: 'armor', classReq: 'warrior', rarity: 'rare', def: 12, hp: 35, poise: 15, set: 'bastion', price: 110, icon: 'armor', desc: 'Pelindung dada logam padat penahan gigitan taring monster.' },
    { id: 'plate_of_the_bastion', name: 'Zirah Plat Benteng Abadi', slot: 'armor', classReq: 'warrior', rarity: 'epic', def: 18, hp: 45, poise: 25, set: 'bastion', price: 185, icon: 'armor', desc: 'Zirah logam tebal bertatahkan rune pelindung suci tak tertembus.' },
    { id: 'blood_stained_mail', name: 'Baju Rantai Darah Abadi', slot: 'armor', classReq: 'warrior', rarity: 'epic', def: 12, hp: 35, atk: 8, set: 'blood', price: 175, icon: 'armor', desc: 'Rantai berkarat yang semakin kokoh saat menyerap percikan darah pertempuran.' },
    { id: 'titan_colossus_plate', name: 'Zirah Baja Raksasa Titan', slot: 'armor', classReq: 'warrior', rarity: 'legendary', def: 25, hp: 70, poise: 35, set: 'bastion', price: 280, icon: 'armor', desc: 'Baja gunung yang menjadikan pemakainya benteng kokoh yang mustahil roboh.' },
    { id: 'dreadlord_carapace', name: 'Karapas Raja Kegelapan Purba', slot: 'armor', classReq: 'warrior', rarity: 'mythic', def: 34, hp: 95, poise: 40, price: 420, icon: 'armor', desc: 'Zirah dari cangkang iblis jurang yang menelan dan mematahkan setiap serangan.' },

    { id: 'apprentice_robe', name: 'Jubah Tenun Arcanist Magang', slot: 'armor', classReq: 'mage', rarity: 'common', def: 3, hp: 12, int: 3, price: 40, icon: 'armor', desc: 'Kain linen biru bergaris emas penenang aliran mana.' },
    { id: 'pyromancer_vestment', name: 'Jubah Api Penyihir Fajar', slot: 'armor', classReq: 'mage', rarity: 'rare', def: 7, hp: 25, int: 6, set: 'arcanum', price: 110, icon: 'armor', desc: 'Tenunan benang tahan api yang menyalurkan panas surya ke setiap mantra.' },
    { id: 'cryo_silk_mantle', name: 'Mantel Sutra Es Glasier', slot: 'armor', classReq: 'mage', rarity: 'rare', def: 8, hp: 30, int: 5, price: 115, icon: 'armor', desc: 'Sutra dingin yang meredam hawa panas dan memperkuat ketahanan tubuh.' },
    { id: 'astral_weave_tunic', name: 'Tunik Tenunan Bintang Astral', slot: 'armor', classReq: 'mage', rarity: 'epic', def: 10, hp: 40, int: 9, set: 'arcanum', price: 185, icon: 'armor', desc: 'Kain langit malam yang membentuk perisai transparan pelindung jiwa.' },
    { id: 'robe_of_the_eclipse', name: 'Jubah Gerhana Penguasa Jiwa', slot: 'armor', classReq: 'mage', rarity: 'legendary', def: 14, hp: 50, int: 13, crit: 0.10, set: 'shadow', price: 270, icon: 'armor', desc: 'Mengaburkan wujud penyihir ke dalam bayang-bayang kegelapan abyss.' },
    { id: 'vestment_of_the_sun_king', name: 'Jubah Keagungan Raja Surya', slot: 'armor', classReq: 'mage', rarity: 'mythic', def: 22, hp: 85, int: 18, set: 'arcanum', price: 430, icon: 'armor', desc: 'Pakaian kebesaran pembawa lentera pertama yang memancarkan aura fajar abadi.' },

    { id: 'scout_leathers', name: 'Rompi Kulit Pengintai Ringan', slot: 'armor', classReq: 'rogue', rarity: 'common', def: 4, hp: 12, agi: 3, price: 40, icon: 'armor', desc: 'Rompi kulit kelinci gunung yang memungkinkan langkah tanpa suara.' },
    { id: 'duelist_doublet', name: 'Doublet Sutra Pendekar Anggun', slot: 'armor', classReq: 'rogue', rarity: 'rare', def: 7, hp: 22, agi: 6, set: 'duelist', price: 110, icon: 'armor', desc: 'Pakaian duel mewah yang dirancang untuk kelincahan gerak menghindar.' },
    { id: 'bladedancer_silk_garb', name: 'Busana Sutra Penari Bilah', slot: 'armor', classReq: 'rogue', rarity: 'epic', def: 9, hp: 32, agi: 9, set: 'storm', price: 180, icon: 'armor', desc: 'Pita sutra berputar yang meningkatkan momentum langkah kaki di medan tempur.' },
    { id: 'shadow_cloak', name: 'Jubah Bayangan Halimun', slot: 'armor', classReq: 'rogue', rarity: 'epic', def: 8, hp: 25, agi: 8, crit: 0.08, set: 'shadow', price: 185, icon: 'armor', desc: 'Kain tenun kegelapan yang menyamarkan siluet pemakainya dari incaran lawan.' },
    { id: 'phantom_shroud_veil', name: 'Selubung Hantu Pencabut Nyawa', slot: 'armor', classReq: 'rogue', rarity: 'legendary', def: 12, hp: 42, agi: 13, crit: 0.12, set: 'shadow', price: 275, icon: 'armor', desc: 'Membuat pemakainya berkelebat seperti ilusi asap di tengah pertarungan.' },
    { id: 'nightstalker_shadowsuit', name: 'Zirah Malam Pembunuh Tak Bernama', slot: 'armor', classReq: 'rogue', rarity: 'mythic', def: 18, hp: 65, agi: 18, crit: 0.16, price: 425, icon: 'armor', desc: 'Ditenun dari benang kegelapan mutlak, mengubah pemakainya menjadi maut berwujud.' },

    // === ARMORS: ARCHER ===
    { id: 'ranger_tunic', name: 'Tunik Kulit Pengelana Rimba', slot: 'armor', classReq: 'archer', rarity: 'common', def: 4, hp: 14, agi: 3, price: 40, icon: 'armor', desc: 'Pakaian kulit kelinci hutan penyamar jejak langkah di alam liar.' },
    { id: 'gale_strider_garb', name: 'Busana Penjelajah Badai', slot: 'armor', classReq: 'archer', rarity: 'rare', def: 8, hp: 26, agi: 6, set: 'storm', price: 110, icon: 'armor', desc: 'Tenunan sutra angin yang meringankan bobot tarikan busur.' },
    { id: 'deadeye_camouflage_cloak', name: 'Jubah Kamuflase Penembak Jitu', slot: 'armor', classReq: 'archer', rarity: 'epic', def: 10, hp: 35, agi: 9, crit: 0.10, set: 'shadow', price: 185, icon: 'armor', desc: 'Jubah tenun bayangan yang menyamarkan siluet pembidik di tengah kegelapan.' },
    { id: 'vestment_of_the_solar_hawk', name: 'Zirah Sayap Elang Surya', slot: 'armor', classReq: 'archer', rarity: 'legendary', def: 14, hp: 55, agi: 14, crit: 0.14, set: 'storm', price: 280, icon: 'armor', desc: 'Zirah berbulu emas suci peninggalan legiun pemanah langit fajar.' },
    { id: 'phantom_windrunner_shroud', name: 'Selubung Angin Hampa Penembak Dewa', slot: 'armor', classReq: 'archer', rarity: 'mythic', def: 20, hp: 75, agi: 18, crit: 0.18, price: 430, icon: 'armor', desc: 'Mengubah pemakainya menjadi angin tak kasat mata yang melepaskan anak panah maut dari ketiadaan.' },

    // === RELICS, RINGS & AMULETS ===
    { id: 'dragon_claw_ring', name: 'Cincin Cakar Naga Muda', slot: 'relic', rarity: 'rare', atk: 6, crit: 0.05, price: 95, icon: 'ring', desc: 'Ditempa dari sisik Young Dragon. Menyalurkan bara ke setiap pukulan.' },
    { id: 'berserker_blood_fang', name: 'Taring Darah Binatang Buas', slot: 'relic', rarity: 'rare', atk: 8, hp: 15, set: 'blood', price: 100, icon: 'blood', desc: 'Taring serigala jurang yang mendidihkan darah saat kondisi terdesak.' },
    { id: 'windwalker_talisman', name: 'Jimat Penjelajah Angin', slot: 'relic', rarity: 'rare', agi: 5, crit: 0.05, set: 'storm', price: 95, icon: 'lightning', desc: 'Batu giok ringan yang meringankan bobot langkah kaki.' },
    { id: 'arcanum_mana_lens', name: 'Lensa Fokus Mana Purba', slot: 'relic', rarity: 'rare', int: 6, atk: 5, set: 'arcanum', price: 100, icon: 'orb', desc: 'Lensa kristal yang memusatkan aliran partikel cahaya matahari.' },
    { id: 'crown_of_ruins', name: 'Mahkota Reruntuhan Beku', slot: 'relic', rarity: 'epic', def: 8, poise: 15, price: 150, icon: 'crown', desc: 'Mahkota Dark King yang memancarkan aura wibawa abadi sang penguasa benteng.' },
    { id: 'solar_seal_orb', name: 'Serpihan Segel Surya', slot: 'relic', rarity: 'epic', int: 8, atk: 10, price: 165, icon: 'sun', desc: 'Pecahan segel pemancar cahaya yang menghangatkan jiwa di tengah dinginnya abyss.' },
    { id: 'crimson_vampire_chalice', name: 'Cawan Darah Ksatria Malam', slot: 'relic', rarity: 'epic', atk: 11, hp: 30, set: 'blood', price: 160, icon: 'chalice', desc: 'Cawan perak berukir mawar merah yang berdenyut mengikuti detak jantung pemakainya.' },
    { id: 'ring_of_the_duelist', name: 'Cincin Kemahiran Sang Penangkis', slot: 'relic', rarity: 'epic', def: 6, agi: 6, crit: 0.08, set: 'duelist', price: 160, icon: 'ring', desc: 'Cincin bertatahkan rubi yang mempertajam refleks serangan balasan.' },
    { id: 'sun_pendant', name: 'Liontin Lentera Liora', slot: 'relic', rarity: 'legendary', hp: 50, atk: 12, def: 8, price: 260, icon: 'amulet', desc: 'Liontin bertuliskan: "Jangan menyerah kakak, jemput aku di bawah sana!"' },
    { id: 'eclipse_signet', name: 'Cincin Meterai Gerhana', slot: 'relic', rarity: 'legendary', atk: 16, crit: 0.12, poise: 15, set: 'shadow', price: 240, icon: 'ring', desc: 'Cincin kuno milik tetua pengintai yang membelokkan cahaya di sekitar senjata.' },
    { id: 'aegis_sunstone', name: 'Batu Surya Benteng Suci', slot: 'relic', rarity: 'legendary', def: 14, hp: 60, poise: 25, set: 'bastion', price: 250, icon: 'int', desc: 'Permata emas murni yang berisi nyala fajar pertama sebelum dunia tenggelam.' },
    { id: 'heart_of_the_abyss', name: 'Jantung Kegelapan Abyss', slot: 'relic', rarity: 'mythic', atk: 20, def: 14, hp: 80, crit: 0.15, price: 390, icon: 'skull', desc: 'Inti kristal hitam hidup yang berdenyut dengan kekuatan primordial jurang.' },
    { id: 'lioras_golden_locket', name: 'Locket Emas Fajar Liora', slot: 'relic', rarity: 'mythic', hp: 100, atk: 15, def: 15, crit: 0.10, price: 420, icon: 'sun', desc: 'Kenangan terindah dari adik tercinta yang melindungi jiwa ksatria dari kematian.' },
    // === EXCLUSIVE BOUNTY & MIMIC RELICS ===
    { id: 'mimic_lucky_tongue', name: 'Lidah Mimic Keberuntungan', slot: 'relic', rarity: 'legendary', atk: 12, crit: 0.10, goldBonus: 0.35, price: 320, icon: 'coin', desc: 'Lidah kenyal beraroma koin emas. Melipatgandakan perolehan emas dari musuh dan peti sebesar +35%!' },
    { id: 'kragor_bone_ring', name: 'Cincin Tulang Kragor', slot: 'relic', rarity: 'epic', atk: 14, hp: 25, poise: 15, price: 210, icon: 'ring', desc: 'Ditempa dari tulang belulang mangsa Kragor. Menguatkan pukulan fisik (+14 ATK) dan stabilitas kuda-kuda (+15 Poise).' },
    { id: 'morwen_glacial_heart', name: 'Jantung Es Beku Morwen', slot: 'relic', rarity: 'epic', int: 16, hp: 35, def: 8, price: 230, icon: 'frost', desc: 'Inti kristal beku abadi. Memberikan +16 INT, ketahanan tubuh +35 HP, dan kekebalan dari efek Chill/Freeze.' },
    { id: 'pyrax_flame_fang', name: 'Taring Berkobar Pyrax', slot: 'relic', rarity: 'legendary', atk: 22, crit: 0.14, hp: 30, price: 310, icon: 'fire', desc: 'Taring serigala neraka yang masih membara panas. Memberikan +22 ATK dahsyat dan +14% Critical Chance.' },
    { id: 'vael_shadow_cloak', name: 'Selendang Bayangan Vael', slot: 'relic', rarity: 'legendary', def: 18, agi: 12, crit: 0.12, price: 340, icon: 'shadow', desc: 'Selendang halus algojo bayangan. Menyelubungi pemakai dalam bayangan (+18 DEF, +12 AGI, +12% Crit).' },
    { id: 'xylar_void_eye', name: 'Mata Inti Kekosongan Xylar', slot: 'relic', rarity: 'mythic', atk: 28, def: 20, hp: 80, crit: 0.16, price: 460, icon: 'skull', desc: 'Mata pusaran hampa primordial. Mengalirkan kekuatan kehancuran Abyss (+28 ATK, +20 DEF, +80 HP, +16% Crit).' }
  ];

  /* --- FLOOR-BASED DYNAMIC SHOP GENERATOR --- */
  function generateFloorShop(floorNumber, heroClassId = 'warrior') {
    const f = Math.max(1, Math.min(5, floorNumber || 1));
    const rarityPools = {
      1: ['common', 'rare'],
      2: ['rare', 'epic'],
      3: ['rare', 'epic', 'legendary'],
      4: ['epic', 'legendary'],
      5: ['epic', 'legendary', 'mythic']
    };
    const allowed = rarityPools[f] || ['common', 'rare'];

    const pool = ITEMS.filter(i => allowed.includes(i.rarity));
    const classWeapons = pool.filter(i => i.slot === 'weapon' && (!i.classReq || i.classReq === heroClassId));
    const classOffhands = pool.filter(i => i.slot === 'offhand' && (!i.classReq || i.classReq === heroClassId));
    const armors = pool.filter(i => i.slot === 'armor' && (!i.classReq || i.classReq === heroClassId));
    const relics = pool.filter(i => i.slot === 'relic');

    const result = [];
    const pick = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    const w = pick(classWeapons);
    if (w) result.push({ ...w });

    const o = pick(classOffhands);
    if (o && !result.some(x => x.id === o.id)) result.push({ ...o });

    const a = pick(armors);
    if (a && !result.some(x => x.id === a.id)) result.push({ ...a });

    const r = pick(relics);
    if (r && !result.some(x => x.id === r.id)) result.push({ ...r });

    // Fill with 2 more distinct items
    const others = pool.filter(i => (!i.classReq || i.classReq === heroClassId) && !result.some(x => x.id === i.id));
    for (let k = 0; k < 2 && others.length > 0; k++) {
      const idx = Math.floor(Math.random() * others.length);
      result.push({ ...others.splice(idx, 1)[0] });
    }

    return result;
  }

  const NPCS = {
    kaelen_smith: {
      id: 'kaelen_smith',
      name: 'Kaelen, Pandai Besi Lentera',
      title: 'Penempa Besi Surya Terakhir',
      role: 'blacksmith',
      icon: 'hammer',
      color: '#f59e0b',
      greetings: [
        'Api lenteramu masih menyala terang, anak muda... Gadis kecil bernama Liora sempat melewati perapianku sambil menangis, diseret oleh bayangan menuju gerbang bawah. Ambillah perbekalan sebelum kau turun lebih jauh.',
        'Udara di Reruntuhan Beku ini sanggup meremukkan baja biasa. Biarkan paluku memperkuat zirah dan senjatamu dengan bara surya!',
        'Hati-hati di Labirin Segel ini. Mantra sang penyihir memutarbalikkan pikiran. Pastikan Lentera Flask milikmu terisi penuh!',
        'Pekuburan Purba... tak banyak ksatria yang sanggup bernapas sejauh ini. Aku menemukan beberapa relik kuno dari jasad petualang terdahulu, lihatlah.',
        'Di balik pintu itu adalah Singgasana Hampa. Pertaruhkan seluruh emas dan kekuatanmu di sini—adikmu Liora sudah menantimu!'
      ],
      dialogues: [
        {
          topic: 'Kabar Keberadaan Liora',
          text: 'Gadis kecil itu mengenakan jubah abu dengan pita merah di rambutnya... Pasukan Abyss menyeretnya ke lantai bawah untuk upacara persembahan malam abadi. Ia sempat menjatuhkan serpihan permata ini sambil menangis memanggil kakak kesayangannya. Cepatlah, jangan biarkan bara lentera di hatinya padam!'
        },
        {
          topic: 'Rahasia Menempa Besi Surya',
          text: 'Baja biasa akan getas dan hancur melawan iblis abyss. Palu tempa milikku dialiri minyak lentera suci. Setiap kali senjata ditempa (+Tempa Senjata), seranganmu akan bertambah tajam (+5 ATK), tubuhmu lebih liat (+15 HP), dan pertahananmu lebih kokoh (+2 DEF)!'
        },
        {
          topic: 'Nasihat Menghadapi Cacing Purba (Bos Lantai 1)',
          text: 'Cacing Purba Abyss memiliki kerak batu tebal. Jangan terburu-buru menghabiskan AP! Serang bagian kepalanya dengan jurus peremuk Poise hingga ia terkena Stance Break, barulah lancarkan tebasan pamungkasmu.'
        }
      ],
      serviceType: 'forge'
    },

    eloria_alchemist: {
      id: 'eloria_alchemist',
      name: 'Eloria, Alchemist Bunga Surya',
      title: 'Peramu Eliksir Lentera & Penjaga Benih Fajar',
      role: 'alchemist',
      icon: 'flask',
      color: '#10b981',
      greetings: [
        'Kabut es di Reruntuhan Beku ini membekukan pembuluh darah... Dekatkan lenteramu pada kualiku sebelum ramuanku membeku!',
        'Aku menemukan jejak tetesan darah segar dan serpihan pita merah Liora di antara bebatuan es. Gadis itu sangat berani, ia terus melawan!',
        'Gelas-gelas ramuanku mendidih saat bara suryamu mendekat. Campuran herbal ini bisa meningkatkan kapasitas darah dan kuda-kudamu secara permanen!'
      ],
      dialogues: [
        {
          topic: 'Jejak Pelarian Liora di Reruntuhan Beku',
          text: 'Liora sempat berlindung di balik meja racikanku beberapa saat lalu! Ia meninggalkan pesan bahwa monster es membenci panasnya tebasan lentera. Ia melarikan diri ke celah tangga sebelum para gargoyle menyergap.'
        },
        {
          topic: 'Ramuan Eliksir Surya Permanen',
          text: 'Dengan emas dan sari embun fajar, aku dapat menyeduh Eliksir Surya Permanen untukmu! Eliksir Darah Surya memberi +25 Max HP permanen, sedangkan Ramuan Kuda-Kuda Baja memperkuat kestabilanmu dengan +15 Max Poise permanen.'
        },
        {
          topic: 'Kelemahan Raja Beku (Frost King)',
          text: 'Raja Beku memanggil perisai es saat HP-nya berkurang. Jangan gunakan mantra es melawannya! Manfaatkan serangan fisik beruntun dan simpan AP untuk bertahan saat badai saljunya datang.'
        }
      ],
      serviceType: 'alchemy'
    },

    valen_lorekeeper: {
      id: 'valen_lorekeeper',
      name: 'Valen, Penjaga Arsip Lentera',
      title: 'Tetua Pembaca Segel & Reruntuhan Purba',
      role: 'lorekeeper',
      icon: 'scroll',
      color: '#8b5cf6',
      greetings: [
        'Penyihir Abyss telah memutarbalikkan dimensi dan gravitasi di Labirin Segel ini... Berhati-hatilah, setiap langkahmu diawasi ribuan mata hampa.',
        'Gulungan kitab suci ini berdenyut kencang... Nama adikmu Liora tertera di dalam nubuatan Pengorbanan Fajar. Waktu kita tidak banyak!',
        'Aku bisa membimbing pemahaman taktismu. Rangkaian Skill Tree milikmu menyimpan kekuatan fajar kuno yang belum kau buka seutuhnya!'
      ],
      dialogues: [
        {
          topic: 'Misteri Ritual Pengorbanan Liora',
          text: 'Kaisar Abyss membutuhkan jiwa yang belum tersentuh kebencian untuk membuka segel Matahari Purba di dasar jurang. Jiwa Liora yang penuh cinta kepada kakaknya menjadi target utama mereka. Jika gerhana sempurna, dunia atas akan tenggelam selamanya!'
        },
        {
          topic: 'Pencerahan Rangkaian Skill Tree',
          text: 'Buka Skill Tree milikmu (Tekan C)! Setiap tingkatan dari Tier 1 hingga Tier 4 memberikan lompatan kekuatan yang masif. Kamu bahkan bisa mereset seluruh rangkaian kapan pun untuk menyesuaikan taktik melawan bos!'
        },
        {
          topic: 'Kelemahan Sang Penyihir Hampa (Void Archmage)',
          text: 'Archmage Hampa akan menyedot Adrenaline-mu untuk memanggil tombak kristal hampa. Kuras Poise-nya dengan cepat menggunakan serangan beruntun agar serangannya gagal terpanggil!'
        }
      ],
      serviceType: 'rune'
    },

    malakor_shade: {
      id: 'malakor_shade',
      name: 'Malakor, Pengelana Arwah Abyss',
      title: 'Penyelundup Relik Terlarang & Rahasia Makam',
      role: 'shade',
      icon: 'skull',
      color: '#a855f7',
      greetings: [
        'Hehehe... Bau daging hidup di Pekuburan Purba. Apakah kau ksatria yang mencari anak perempuan berliontin surya itu?',
        'Kaisar Bayangan telah membawanya ke depan gerbang Singgasana Abyss. Liora masih bernapas... tapi jiwanya mulai membeku dalam kegelapan.',
        'Aku punya relik-relik terlarang yang kurampas dari peti-peti makam para jenderal kegelapan terdahulu. Kau punya emas, aku punya kekuatan mutlak!'
      ],
      dialogues: [
        {
          topic: 'Keadaan Terakhir Liora di Singgasana Abyss',
          text: 'Adikmu sungguh luar biasa... Meski tubuhnya terikat rantai bayangan, kedua tangannya terus mendekap lentera yang kau berikan. Dia berbisik bahwa kakaknya pasti akan datang menembus kegelapan!'
        },
        {
          topic: 'Pemberkatan Arwah Bayangan',
          text: 'Kekuatan jurang bisa dipinjam jika kau berani membayarnya. Dengan segenggam emas, aku bisa memberimu Pemberkatan Arwah: langsung mengisi 100% Adrenaline di awal pertempuran berikutnya dan melipatgandakan Critical Chance!'
        },
        {
          topic: 'Kelemahan Penguasa Kubur (Lich Lord)',
          text: 'Saat HP sang Lich mencapai separuh, ia memanggil Filakteri Tulang yang membuatnya kebal selama 1 giliran. Jangan buang AP menyerangnya saat itu! Gunakan giliran tersebut untuk meminum ramuan dan memasang Kuda-kuda (Guard)!'
        }
      ],
      serviceType: 'shade'
    }
  };

  // Aliases for backwards compatibility
  NPCS.blacksmith = NPCS.kaelen_smith;
  NPCS.alchemist = NPCS.eloria_alchemist;
  NPCS.lorekeeper = NPCS.valen_lorekeeper;
  NPCS.shade = NPCS.malakor_shade;

  const LORE_TABLETS = [
    {
      title: 'Catatan Perjalanan Liora: Babak I - Pintu Masuk Abu',
      text: 'Hari ke-1 setelah mereka menyeretku dari desa. Lentera ayah tertinggal di atas meja. Aku sengaja menjatuhkan pita rambut merahku di tangga menuju Gerbang Abu agar Kakak bisa melacak jalanku... Jurang ini begitu dingin dan gelap gulita.'
    },
    {
      title: 'Prasasti Kuno: Reruntuhan Kerajaan yang Dilupakan',
      text: 'Dahulu kala, raja di tempat ini menolak mengakui padamnya fajar. Demi menjaga kehangatan tahtanya, ia bersekutu dengan kegelapan Abyss dan mengorbankan setiap lentera di permukaan. Kutukan pun menjadikannya Dark King selamanya.'
    },
    {
      title: 'Pesan Tersembunyi Liora: Labirin Segel Surya',
      text: 'Penyihir berkerudung itu terus merapal mantra... Mereka bilang jiwaku adalah kunci untuk memenjarakan matahari abadi di dasar lautan hampa. Kakak, kalau kau membaca ini, Lentera Surya milikmu bisa membakar segel mereka! Bergegaslah!'
    },
    {
      title: 'Catatan Penilik Makam: Surat Kematian Abadi',
      text: 'Semua yang turun ke dasar jurang pada akhirnya akan berlutut di depan Kaisar Bayangan. Jiwa anak perempuan itu terus memancarkan denyut kehangatan yang mengusik para iblis kubur... Betapa sia-sia perjuangan ksatria permukaan yang mencoba menyelamatkannya.'
    },
    {
      title: 'Bisikan Terakhir Liora: Gerbang Singgasana Bayangan',
      text: 'Aku bisa merasakan hangatnya Lentera Surya milik Kakak! Cahayanya mulai menembus tirai hampa di depanku! Bertahanlah Kakak, Kaisar Bayangan sudah menunggu di depan altar...'
    }
  ];

  const FLOORS = [
    {
      floor: 1,
      name: 'Gerbang Abu (Ash Gates)',
      subtitle: 'Lantai 1 - Gerbang Masuk Menuju Jurang',
      color: 0x8a624a,
      fogColor: 0x140d0a,
      ambientColor: 0x221812,
      lightColor: 0xffa550,
      wallColor: 0x3d2c25,
      floorColor: 0x251c17,
      monsterPool: ['giant_rat', 'cave_spider'],
      bossId: 'floor_1',
      roomsCount: 5
    },
    {
      floor: 2,
      name: 'Reruntuhan Beku (Frozen Ruins)',
      subtitle: 'Lantai 2 - Istana Kuno yang Membeku dalam Hampa',
      color: 0x4a738a,
      fogColor: 0x071118,
      ambientColor: 0x0f202c,
      lightColor: 0x7ad0ff,
      wallColor: 0x203544,
      floorColor: 0x12222d,
      monsterPool: ['cave_spider', 'skeleton_warrior'],
      bossId: 'floor_2',
      roomsCount: 6
    },
    {
      floor: 3,
      name: 'Labirin Segel (Seal Labyrinth)',
      subtitle: 'Lantai 3 - Koridor Mantra Gelap',
      color: 0x784a8a,
      fogColor: 0x140718,
      ambientColor: 0x230e2c,
      lightColor: 0xd67aff,
      wallColor: 0x391f45,
      floorColor: 0x24122d,
      monsterPool: ['skeleton_warrior', 'abyss_ghost'],
      bossId: 'floor_3',
      roomsCount: 6
    },
    {
      floor: 4,
      name: 'Makam Purba (Ancient Crypts)',
      subtitle: 'Lantai 4 - Pekuburan Kuno Tak Berdasar',
      color: 0x8a3a3a,
      fogColor: 0x1a0707,
      ambientColor: 0x2c0d0d,
      lightColor: 0xff5555,
      wallColor: 0x471d1d,
      floorColor: 0x2a1010,
      monsterPool: ['skeleton_warrior', 'cave_troll', 'vampire_knight'],
      bossId: 'floor_4',
      roomsCount: 7
    },
    {
      floor: 5,
      name: 'Singgasana Hampa (Throne of the Void)',
      subtitle: 'Lantai 5 - Kedalaman Abadi Ruang Penjara Liora',
      color: 0xffc83b,
      fogColor: 0x0b0805,
      ambientColor: 0x2e1e08,
      lightColor: 0xffcc44,
      wallColor: 0x453112,
      floorColor: 0x2a1c06,
      monsterPool: ['vampire_knight', 'cave_troll'],
      bossId: 'floor_5',
      roomsCount: 5
    }
  ];

  /* --- STORY DIALOGUES ON STAIRCASE DESCENT --- */
  const STORY_DESCENT = {
    floor_1_to_2: {
      floorTarget: 2,
      title: 'Pita Rambut yang Membeku (Menuju Reruntuhan Beku)',
      speaker: 'Bisikan Jiwa Liora',
      quote: 'Kakak... angin di sini mulai membekukan napasku. Sang Dark King menukar jiwaku demi memperpanjang kehangatan tahtanya... Tapi bara di lenteramu masih terasa dari atas sana. Jangan menyerah!',
      relicFound: 'Pita Merah Liora yang Membeku',
      bgVignette: '#0a1420'
    },
    floor_2_to_3: {
      floorTarget: 3,
      title: 'Menara Segel Surya (Menuju Labirin Mantra Gelap)',
      speaker: 'Gema Kenangan Abyss',
      quote: 'Dinding es mencair menjadi lorong batu bertatahkan mantra terlarang. Arsitek Segel mengikat denyut jantung Liora ke inti gerhana untuk memenjarakan matahari abadi di dasar lautan hampa. Lentera milikmu adalah satu-satunya api yang sanggup meremukkan segel mereka!',
      relicFound: 'Pecahan Kristal Resonansi Jiwa',
      bgVignette: '#180a22'
    },
    floor_3_to_4: {
      floorTarget: 4,
      title: 'Lembah Peti Tulang (Menuju Pekuburan Purba)',
      speaker: 'Surat Kematian Sang Penilik',
      quote: 'Bau dupa pemakaman begitu pekat menusuk dada. Sang Ancient Lich telah menyiapkan peti tulang abadi untuk mengubur jiwa Liora selamanya... Suara tangisan adikmu terdengar semakin lirih. Cepatlah sebelum jiwanya larut sepenuhnya dalam ketiadaan!',
      relicFound: 'Debu Tulang Abadi',
      bgVignette: '#220808'
    },
    floor_4_to_5: {
      floorTarget: 5,
      title: 'Di Depan Singgasana Hampa (Kedalaman Terakhir)',
      speaker: 'Tantangan Kaisar Bayangan',
      quote: 'Kau berdiri di tubir jurang terdalam tempat matahari purba dirantai. Tawa dingin Shadow Emperor menggetarkan relung jiwa: "Adikmu ada tepat di belakang tahtaku, pembawa lentera! Rebut kembali jika lenteramu sanggup melawan malam abadi!"',
      relicFound: 'Aura Fajar yang Merekah',
      bgVignette: '#2a1a05'
    }
  };

  /* --- INTERACTIVE SKILL TREES WITH BRANCHING SUBCLASSES & UNIQUE GAMEPLAY MECHANICS --- */
  const SKILL_TREES = {
    warrior: {
      branchA: {
        id: 'bastion',
        name: 'Jalur Benteng Abadi (Bastion)',
        subclassName: 'Benteng Abadi (Bastion)',
        icon: 'fortress',
        color: '#38bdf8',
        mechanic: {
          name: 'Pertahanan Kinetis (Kinetic Bulwark & Thorns)',
          desc: 'Kebal Stance Break saat memiliki Guard. Memantulkan 40% damage fisik musuh sebagai Duri Pantul. Sisa AP di akhir giliran diubah menjadi +15 Barrier Shield per AP!'
        },
        nodes: [
          {
            id: 'iron_will',
            tier: 1,
            type: 'passive',
            name: 'Kehendak Baja (Iron Will)',
            icon: 'shield',
            cost: 1,
            req: null,
            desc: 'Pasif: +25% Max Poise & +5 DEF permanen. Mengaktifkan Stagger Immunity (kebal Stance Break) selama Guard aktif.'
          },
          {
            id: 'skill_seismic_slam',
            tier: 2,
            type: 'active',
            slotIdx: 2,
            name: 'Hentakan Gempa (Seismic Slam)',
            icon: 'hammer',
            cost: 1,
            req: 'iron_will',
            desc: 'Skill Aktif (Slot 3): Menghantam tanah meremukkan musuh (2.0x ATK, 45 Poise DMG, jangkauan 2 petak) dan memberi +15 DEF Guard.',
            skillData: {
              id: 'seismic_slam',
              name: 'Hentakan Gempa (Seismic Slam)',
              cost: 2,
              range: 2,
              rangeTag: '2 Petak Gempa',
              typeTag: 'Aktif Bastion',
              tag: '45 Poise & +15 DEF',
              type: 'single',
              dmgMult: 2.0,
              poiseDmg: 45,
              guardGain: 15,
              cooldown: 2,
              conditionText: 'Jangkauan 2 petak! Meremukkan 45 Poise musuh dari jarak menengah dan langsung memberi +15 DEF Guard.',
              desc: 'Menghantamkan perisai dan pedang ke lantai, memicu retakan gempa ke arah target.',
              icon: 'hammer'
            }
          },
          {
            id: 'retaliation_thorns',
            tier: 3,
            type: 'passive',
            name: 'Duri Pembalasan (Retaliation)',
            icon: 'shield',
            cost: 1,
            req: 'skill_seismic_slam',
            desc: 'Pasif: Saat memiliki Guard DEF aktif, memantulkan 40% serangan musuh kembali sebagai True Damage!'
          },
          {
            id: 'skill_aegis_fortress',
            tier: 4,
            type: 'active',
            slotIdx: 3,
            name: 'Benteng Surya Aegis (Aegis Fortress)',
            icon: 'crown',
            cost: 1,
            req: 'retaliation_thorns',
            desc: 'Skill Aktif Puncak (Slot 4): Seketika memberi +25 DEF, +30 Poise, dan +60 Barrier Shield suci!',
            skillData: {
              id: 'aegis_fortress',
              name: 'Benteng Surya Aegis',
              cost: 1,
              range: 0,
              rangeTag: 'Diri Sendiri',
              typeTag: 'Puncak Bastion',
              tag: '+25 DEF & +60 Barrier',
              type: 'self',
              defBuff: 25,
              poiseRegen: 30,
              barrier: 60,
              cooldown: 2,
              conditionText: 'Puncak Bastion: Langsung memberi +25 DEF, +30 Poise, dan +60 Barrier pelindung nyawa!',
              desc: 'Memanggil segel perisai emas raksasa Lentera Surya yang nyaris mustahil ditembus.',
              icon: 'crown'
            }
          }
        ]
      },
      branchB: {
        id: 'berserker',
        name: 'Jalur Algojo Darah (Berserker)',
        subclassName: 'Algojo Darah (Berserker)',
        icon: 'blood',
        color: '#ef4444',
        mechanic: {
          name: 'Murka Darah (Blood Rage & Frenzy)',
          desc: 'Menerima luka atau menyerang membangun stack Rage (+5% ATK/stack, maks 6). Saat HP < 50%, memicu Frenzy (+30% DMG & 25% Lifesteal). Stance Break memulihkan +25% HP & +1 AP!'
        },
        nodes: [
          {
            id: 'blood_frenzy',
            tier: 1,
            type: 'passive',
            name: 'Amukan Darah (Blood Frenzy)',
            icon: 'fire',
            cost: 1,
            req: null,
            desc: 'Pasif: +8 ATK permanen. Mengaktifkan stack Rage dan memicu Frenzy (+30% DMG & 25% Lifesteal) saat HP di bawah 50%!'
          },
          {
            id: 'skill_whirlwind',
            tier: 2,
            type: 'active',
            slotIdx: 1,
            name: 'Tebasan Badai Darah (Blood Cleave)',
            icon: 'greatsword',
            cost: 1,
            req: 'blood_frenzy',
            desc: 'Skill Aktif (Slot 2): Tebasan memutar ganas (2.5x ATK, 40 Poise DMG) yang menyerap 25% HP (Lifesteal)!',
            skillData: {
              id: 'whirlwind_cleave',
              name: 'Badai Darah (Blood Cleave)',
              cost: 2,
              range: 1,
              rangeTag: '1 Petak Brutal',
              typeTag: 'Aktif Berserker',
              tag: '2.5x DMG & Lifesteal',
              type: 'single',
              dmgMult: 2.5,
              poiseDmg: 40,
              lifesteal: 0.25,
              cooldown: 2,
              conditionText: 'Menghasilkan 2.5x ATK + 40 Poise Dmg dan langsung menyerap 25% damage menjadi HP!',
              desc: 'Memutar pedang besar dengan kekuatan penuh, menyabet musuh dan menyerap esensi darah mereka.',
              icon: 'greatsword'
            }
          },
          {
            id: 'shatter_feast',
            tier: 3,
            type: 'passive',
            name: 'Santapan Kuda-Kuda (Shatter Feast)',
            icon: 'skull',
            cost: 1,
            req: 'skill_whirlwind',
            desc: 'Pasif: Setiap kali berhasil memicu Stance Break pada musuh, langsung memulihkan 25% Max HP & +1 AP seketika!'
          },
          {
            id: 'skill_crimson_guillotine',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Guillotine Merah (Ultimate Baru)',
            icon: 'blast',
            cost: 1,
            req: 'shatter_feast',
            desc: 'Skill Ultimate Puncak (Slot 5): Lompatan eksekusi jarak 3 petak (4.2x ATK, 85 Poise DMG, 35% Lifesteal)!',
            skillData: {
              id: 'crimson_guillotine',
              name: 'Guillotine Merah (Ultimate)',
              cost: 3,
              range: 3,
              rangeTag: '3 Petak Lompat',
              typeTag: 'Puncak Berserker',
              tag: '4.2x DMG & 85 Poise',
              type: 'single',
              dmgMult: 4.2,
              poiseDmg: 85,
              lifesteal: 0.35,
              adrenalineReq: 100,
              conditionText: 'Jangkauan 3 petak! Menghantam 4.2x ATK, meremukkan 85 Poise seketika, dan menyerap 35% darah!',
              desc: 'Melompat tinggi ke udara dengan aura merah membara dan membelah bumi tepat di atas kepala target.',
              icon: 'blast'
            }
          }
        ]
      },
      branchC: {
        id: 'commander',
        name: 'Jalur Panglima Taktis (Commander)',
        subclassName: 'Panglima Taktis (Commander)',
        icon: 'crown',
        color: '#eab308',
        mechanic: {
          name: 'Sistem Taktis Komando (Command & Judicator)',
          desc: 'Serangan biasa memberi +1 Command, Kuda-Kuda memberi +2 Command (maks. 5 stack). Setiap stack memberi +5% Skill DMG & +4 DEF. Menyerang musuh di bawah 25% HP mengeksekusi mereka seketika!'
        },
        nodes: [
          {
            id: 'tactical_command',
            tier: 1,
            type: 'passive',
            name: 'Komando Medan Perang (Command)',
            icon: 'crown',
            cost: 1,
            req: null,
            desc: 'Pasif: Mengaktifkan stack Command. Setiap serangan memberi +1 Command, Kuda-Kuda memberi +2 Command (+5% Skill DMG & +4 DEF per stack, maks 5). +15 Max HP & +3 DEF permanen.'
          },
          {
            id: 'skill_tactical_strike',
            tier: 2,
            type: 'active',
            slotIdx: 2,
            name: 'Perintah Tempur (Tactical Strike)',
            icon: 'sword',
            cost: 1,
            req: 'tactical_command',
            desc: 'Skill Aktif (Slot 3): Menyerang musuh dari jarak 2 petak (2.2x ATK, 35 Poise DMG), menarik mereka mendekat, dan memberi +2 Command seketika!',
            skillData: {
              id: 'tactical_strike',
              name: 'Perintah Tempur (Tactical Strike)',
              cost: 2,
              range: 2,
              rangeTag: '2 Petak Tarik',
              typeTag: 'Aktif Commander',
              tag: '2.2x DMG & +2 Command',
              type: 'single',
              dmgMult: 2.2,
              poiseDmg: 35,
              commandGain: 2,
              cooldown: 2,
              conditionText: 'Jangkauan 2 petak! Menyerang 2.2x ATK dan langsung menambah +2 Command stacks.',
              desc: 'Manuver taktis yang memaksa musuh masuk ke dalam jangkauan tebasan ksatria.',
              icon: 'sword'
            }
          },
          {
            id: 'command_aura',
            tier: 3,
            type: 'passive',
            name: 'Aura Kemenangan (Warlord Presence)',
            icon: 'spark',
            cost: 1,
            req: 'skill_tactical_strike',
            desc: 'Pasif: Saat memiliki 3+ Command, ksatria sepenuhnya kebal terhadap Stun dan seluruh skill mendapatkan tambahan +15% Critical Chance!'
          },
          {
            id: 'skill_judicator_verdict',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Vonis Keadilan (Judicator Execution)',
            icon: 'hammer',
            cost: 1,
            req: 'command_aura',
            desc: 'Skill Ultimate Puncak (Slot 5): Membelanjakan Command untuk 3.8x ATK True Damage dan mengeksekusi mati seketika musuh di bawah 25% HP!',
            skillData: {
              id: 'judicator_verdict',
              name: 'Vonis Judicator (Ultimate)',
              cost: 3,
              range: 2,
              rangeTag: '2 Petak Vonis',
              typeTag: 'Puncak Commander',
              tag: '3.8x True DMG & Eksekusi',
              type: 'single',
              dmgMult: 3.8,
              poiseDmg: 70,
              isExecute: true,
              adrenalineReq: 100,
              conditionText: 'Puncak Commander: 3.8x True Damage! Musuh dengan HP di bawah 25% langsung dieksekusi mati seketika!',
              desc: 'Menjatuhkan palu penghakiman suci, memvonis kehancuran total bagi musuh yang sekarat.',
              icon: 'hammer'
            }
          }
        ]
      }
    },

    mage: {
      branchA: {
        id: 'elementalist',
        name: 'Jalur Elementalis Surya & Es (Elementalist)',
        subclassName: 'Elementalis Surya (Elementalist)',
        icon: 'fire',
        color: '#f97316',
        mechanic: {
          name: 'Siklus Rantai Reaksi Elemen (Elemental Chain)',
          desc: 'Bergantian menggunakan sihir memicu reaksi: Api ➔ Es memicu Melt (-50% DEF & +35% DMG). Es ➔ Petir memicu Superconduct (Stun 1 giliran). Petir ➔ Api memicu Overload (AoE True Damage). Reaksi memotong CD semua skill −1 giliran!'
        },
        nodes: [
          {
            id: 'elemental_cycle',
            tier: 1,
            type: 'passive',
            name: 'Katalis Elemen (Elemental Cycle)',
            icon: 'spark',
            cost: 1,
            req: null,
            desc: 'Pasif: Mengaktifkan Rantai Reaksi Elemen (Melt, Superconduct, Overload). +8 ATK Sihir permanen dan Cooldown berkurang 1 saat reaksi terpicu.'
          },
          {
            id: 'skill_meteor_swarm',
            tier: 2,
            type: 'active',
            slotIdx: 1,
            name: 'Hujan Meteor Surya (Meteor Swarm)',
            icon: 'blast',
            cost: 1,
            req: 'elemental_cycle',
            desc: 'Skill Aktif (Slot 2): Menghujani area 3x3 dengan meteor api (3.0x ATK, 45 Poise DMG, membakar musuh selama 3 giliran)!',
            skillData: {
              id: 'fireball_abyss',
              name: 'Hujan Meteor Surya',
              cost: 2,
              range: 4,
              area: 1,
              rangeTag: '4P Jarak (Area 3x3)',
              typeTag: 'Aktif Elementalis',
              tag: '3.0x DMG (Api)',
              type: 'aoe',
              element: 'fire',
              dmgMult: 3.0,
              poiseDmg: 45,
              burnDuration: 3,
              cooldown: 2,
              conditionText: 'Elemen Api: Area 3x3 dengan 3.0x ATK, membakar musuh dan memicu reaksi jika target sebelumnya terkena Es atau Petir!',
              desc: 'Memanggil runtuhan batu meteor matahari untuk meratakan musuh dari jarak jauh.',
              icon: 'blast'
            }
          },
          {
            id: 'elemental_resonance',
            tier: 3,
            type: 'passive',
            name: 'Resonansi Elemen (Resonance)',
            icon: 'sun',
            cost: 1,
            req: 'skill_meteor_swarm',
            desc: 'Pasif: Setiap kali reaksi elemen terpicu, menghasilkan +25% bonus damage tambahan dan membentuk +10 Barrier Shield gratis!'
          },
          {
            id: 'skill_cataclysm_star',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Bintang Kataklisme (Ultimate Baru)',
            icon: 'spark',
            cost: 1,
            req: 'elemental_resonance',
            desc: 'Skill Ultimate Puncak (Slot 5): Ledakan bintang raksasa 4.6x ATK jarak 5 petak yang memicu ketiga reaksi elemen sekaligus!',
            skillData: {
              id: 'solar_supernova',
              name: 'Bintang Kataklisme (Ultimate)',
              cost: 3,
              range: 5,
              rangeTag: 'Jarak 5 Petak',
              typeTag: 'Puncak Elementalis',
              tag: '4.6x DMG (Tri-Elemen)',
              type: 'line',
              element: 'fire',
              dmgMult: 4.6,
              poiseDmg: 80,
              lifesteal: 0.25,
              adrenalineReq: 100,
              conditionText: 'Puncak Elementalis: Menembakkan pilar tri-elemen 4.6x ATK, meremukkan 80 Poise, dan memicu reaksi elemen beruntun!',
              desc: 'Melepaskan inti penuh Lentera Surya menjadi ledakan bintang raksasa yang memusnahkan musuh.',
              icon: 'spark'
            }
          }
        ]
      },
      branchB: {
        id: 'spellblade',
        name: 'Jalur Pendekar Bilah Sihir (Spellblade)',
        subclassName: 'Pendekar Bilah Sihir (Spellblade)',
        icon: 'sword',
        color: '#06b6d4',
        mechanic: {
          name: 'Muatan Bilah Astral (Arcane Blade Charge)',
          desc: 'Setiap kali merapal mantra (Skill 2-5), pedang astral terisi +1 Arcane Charge (maks 4). Serangan biasa (Slot 1) melepaskan seluruh Charge untuk tebasan astral beruntun (+30% DMG/charge) dan me-refund 1 AP!'
        },
        nodes: [
          {
            id: 'arcane_blade_passive',
            tier: 1,
            type: 'passive',
            name: 'Bilah Astral (Arcane Charge)',
            icon: 'sword',
            cost: 1,
            req: null,
            desc: 'Pasif: Mengaktifkan Arcane Charge pada pedang. Setiap spell memberi +1 Charge. +6 ATK & +10% Crit Chance permanen.'
          },
          {
            id: 'skill_phase_strike',
            tier: 2,
            type: 'active',
            slotIdx: 0,
            name: 'Tebasan Astral (Phase Slash)',
            icon: 'spark',
            cost: 1,
            req: 'arcane_blade_passive',
            desc: 'Skill Aktif (Slot 1): Menggantikan serangan dasar dengan Tebasan Astral berbiaya 1 AP (1.8x ATK + 30% per Charge, me-refund 1 AP jika memiliki 2+ charge)!',
            skillData: {
              id: 'phase_slash',
              name: 'Tebasan Astral (Phase Slash)',
              cost: 1,
              range: 2,
              rangeTag: '2P Tebasan Astral',
              typeTag: 'Aktif Spellblade',
              tag: 'Pelepas Charge & Refund AP',
              type: 'single',
              dmgMult: 1.8,
              poiseDmg: 30,
              consumesCharges: true,
              cooldown: 0,
              conditionText: 'Mengonsumsi seluruh Arcane Charge! Memberi +30% DMG per charge dan me-refund 1 AP bila melepaskan 2+ charge!',
              desc: 'Menebas musuh menggunakan bilah sihir murni yang berdenyut dengan energi kosmik.',
              icon: 'spark'
            }
          },
          {
            id: 'arcane_aegis_mastery',
            tier: 3,
            type: 'passive',
            name: 'Perisai Bilah (Aegis Mastery)',
            icon: 'orb',
            cost: 1,
            req: 'skill_phase_strike',
            desc: 'Pasif: Setiap Arcane Charge yang tersimpan memberi +10 Barrier Shield pasif dan +5 DEF pelindung tubuh.'
          },
          {
            id: 'skill_omnislash_astral',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Seratus Bilah Astral (Omnislash)',
            icon: 'lightning',
            cost: 1,
            req: 'arcane_aegis_mastery',
            desc: 'Skill Ultimate Puncak (Slot 5): 4 tebasan teleportasi beruntun (total 4.8x ATK, 80 Poise DMG) tanpa bisa di-counter musuh!',
            skillData: {
              id: 'omnislash_astral',
              name: 'Seratus Bilah Astral (Ultimate)',
              cost: 3,
              range: 4,
              rangeTag: '4 Petak Teleport',
              typeTag: 'Puncak Spellblade',
              tag: '4.8x DMG Multi-Hit',
              type: 'single',
              dmgMult: 4.8,
              poiseDmg: 80,
              adrenalineReq: 100,
              conditionText: 'Puncak Spellblade: Berpindah seketika menembus musuh, melancarkan 4 tebasan astral beruntun berkekuatan 4.8x ATK!',
              desc: 'Menjadi kilatan cahaya astral murni yang mencabik-cabik target dari segala sudut.',
              icon: 'lightning'
            }
          }
        ]
      },
      branchC: {
        id: 'necromancer',
        name: 'Jalur Kutukan Pembusuk Jiwa (Hexbound)',
        subclassName: 'Kutukan Pembusuk (Hexbound)',
        icon: 'skull',
        color: '#a855f7',
        mechanic: {
          name: 'Kutukan Pembusuk & Hisapan Jiwa (Corruption & Life Drain)',
          desc: 'Setiap serangan menanam kutukan Corruption pada musuh (maks 5 stack). Setiap awal giliran musuh, Corruption membakar HP mereka dan 50% damage diserap kembali memulihkan HP pemain! Membunuh musuh ber-Corruption memberi +30% HP & +1 AP.'
        },
        nodes: [
          {
            id: 'abyssal_corruption',
            tier: 1,
            type: 'passive',
            name: 'Kutukan Pembusuk (Corruption)',
            icon: 'flask',
            cost: 1,
            req: null,
            desc: 'Pasif: Mengaktifkan kutukan Corruption pada semua serangan sihir (membakar musuh setiap gilirannya). +20 Max HP & +6 Magic ATK.'
          },
          {
            id: 'skill_decay_grasp',
            tier: 2,
            type: 'active',
            slotIdx: 2,
            name: 'Jeratan Maut (Decay Grasp)',
            icon: 'shadow',
            cost: 1,
            req: 'abyssal_corruption',
            desc: 'Skill Aktif (Slot 3): Menembakkan cengkeraman maut jarak 3 petak (2.0x Magic DMG, menanam 3 stack Corruption dan melumpuhkan gerak musuh)!',
            skillData: {
              id: 'decay_grasp',
              name: 'Jeratan Maut (Decay Grasp)',
              cost: 2,
              range: 3,
              rangeTag: '3 Petak Jeratan',
              typeTag: 'Aktif Hexbound',
              tag: '2.0x DMG & 3 Corruption',
              type: 'single',
              dmgMult: 2.0,
              poiseDmg: 35,
              corruptionStacks: 3,
              slowEffect: true,
              cooldown: 2,
              conditionText: 'Jangkauan 3 petak! Menghantam 2.0x ATK, menanam seketika 3 stack Corruption dan memotong gerak musuh menjadi 0.',
              desc: 'Tangan-tangan arwah hitam bangkit dari lantai Abyss, mencengkeram kaki target dan meracuni jiwa mereka.',
              icon: 'shadow'
            }
          },
          {
            id: 'soul_siphon',
            tier: 3,
            type: 'passive',
            name: 'Hisapan Jiwa (Soul Siphon)',
            icon: 'blood',
            cost: 1,
            req: 'skill_decay_grasp',
            desc: 'Pasif: Life Drain dari Corruption meningkat menjadi 60% dan musuh yang menderita Corruption kehilangan -5 DEF per stack.'
          },
          {
            id: 'skill_abyssal_eclipse',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Gerhana Abyssal (Ultimate Baru)',
            icon: 'skull',
            cost: 1,
            req: 'soul_siphon',
            desc: 'Skill Ultimate Puncak (Slot 5): Meledakkan seluruh Corruption di arena (4.2x AoE Magic DMG) dan memulihkan HP pemain hingga penuh!',
            skillData: {
              id: 'abyssal_eclipse',
              name: 'Gerhana Abyssal (Ultimate)',
              cost: 3,
              range: 4,
              area: 2,
              rangeTag: '4P Area Luas',
              typeTag: 'Puncak Hexbound',
              tag: '4.2x AoE & Full Heal',
              type: 'aoe',
              dmgMult: 4.2,
              poiseDmg: 70,
              lifesteal: 0.50,
              adrenalineReq: 100,
              conditionText: 'Puncak Hexbound: Meledakkan kutukan kegelapan di area 5x5, menyerap 50% seluruh damage untuk memulihkan nyawa penyihir!',
              desc: 'Menciptakan gerhana hitam pekat yang menghisap esensi kehidupan semua makhluk di sekitarnya.',
              icon: 'skull'
            }
          }
        ]
      }
    },

    rogue: {
      branchA: {
        id: 'shadow',
        name: 'Jalur Pembunuh Bayangan (Shadow Stalker)',
        subclassName: 'Pembunuh Bayangan (Shadow)',
        icon: 'dagger',
        color: '#c084fc',
        mechanic: {
          name: 'Incar Titik Lemah & Kamuflase (Weakness Mark & 100% Crit Vanish)',
          desc: 'Menyerang dari Flank memberi +1 Mark, Backstab memberi +2 Mark (maks 5 mark). Pada 3+ Mark, serangan berikutnya dijamin 100% Critical Hit (+75% Crit DMG) dan memicu status Vanish (musuh tidak bisa menargetkanmu selama 1 giliran)!'
        },
        nodes: [
          {
            id: 'anatomical_insight',
            tier: 1,
            type: 'passive',
            name: 'Titik Vital (Anatomical Insight)',
            icon: 'target',
            cost: 1,
            req: null,
            desc: 'Pasif: Mengaktifkan Weakness Mark pada serangan Flank & Backstab. +12% Crit Chance permanen dan Backstab multiplier naik menjadi 1.9x!'
          },
          {
            id: 'skill_phantom_ambush',
            tier: 2,
            type: 'active',
            slotIdx: 1,
            name: 'Sergapan Hantu (Phantom Ambush)',
            icon: 'shadow',
            cost: 1,
            req: 'anatomical_insight',
            desc: 'Skill Aktif (Slot 2): Teleportasi 3 petak ke belakang musuh (2.6x ATK, 30 Poise DMG, otomatis Backstab & menanam 2 Mark)!',
            skillData: {
              id: 'flash_strike',
              name: 'Sergapan Hantu (Phantom Ambush)',
              cost: 2,
              range: 3,
              rangeTag: '3 Petak Teleport',
              typeTag: 'Aktif Shadow',
              tag: '2.6x DMG & 2 Mark',
              type: 'teleport_attack',
              dmgMult: 2.6,
              poiseDmg: 30,
              markGain: 2,
              cooldown: 2,
              conditionText: 'Teleportasi 3 petak ke belakang target! Menghasilkan 2.6x ATK dengan kepastian Backstab dan menanam 2 Weakness Mark.',
              desc: 'Menghilang ke dalam bayangan dan menebas leher lawan tepat dari belakang.',
              icon: 'shadow'
            }
          },
          {
            id: 'vanish_kill',
            tier: 3,
            type: 'passive',
            name: 'Lenyap Dalam Darah (Vanish on Kill)',
            icon: 'smoke',
            cost: 1,
            req: 'skill_phantom_ambush',
            desc: 'Pasif: Membunuh musuh langsung memulihkan 20% Max HP, memberi Camouflage (+50% Dodge), dan mereset CD Sergapan!'
          },
          {
            id: 'skill_reaper_lotus',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Tarian Malaikat Maut (Ultimate Baru)',
            icon: 'skull',
            cost: 1,
            req: 'vanish_kill',
            desc: 'Skill Ultimate Puncak (Slot 5): 7 tebasan bayangan mematikan (4.5x ATK, 70 Poise DMG, 30% Lifesteal, mengeksekusi musuh di bawah 30% HP)!',
            skillData: {
              id: 'shadow_dance',
              name: 'Tarian Malaikat Maut (Ultimate)',
              cost: 3,
              range: 3,
              rangeTag: '3 Petak Eksekusi',
              typeTag: 'Puncak Shadow',
              tag: '4.5x DMG & Eksekusi 30%',
              type: 'single',
              dmgMult: 4.5,
              poiseDmg: 70,
              lifesteal: 0.30,
              isExecute: true,
              adrenalineReq: 100,
              conditionText: 'Puncak Shadow: Menebas 7 kali dari jarak 3 petak dengan 4.5x ATK, 70 Poise DMG, dan mengeksekusi instan musuh di bawah 30% HP!',
              desc: 'Membelah bayangan menjadi tujuh wujud pembunuh yang menghujam titik vital musuh secara serempak.',
              icon: 'skull'
            }
          }
        ]
      },
      branchB: {
        id: 'duelist',
        name: 'Jalur Pembalas Tangkisan (Duelist)',
        subclassName: 'Pembalas Tangkisan (Duelist)',
        icon: 'shield',
        color: '#38bdf8',
        mechanic: {
          name: 'Tangkisan & Serangan Balas Otomatis (Riposte Auto-Counter)',
          desc: 'Memasang Kuda-Kuda atau berhasil Dodge menghasilkan Riposte Token (maks 3 token). Saat diserang musuh, pemain SECARA OTOMATIS membalas musuh seketika dengan 60% ATK tanpa menghabiskan giliran!'
        },
        nodes: [
          {
            id: 'riposte_stance',
            tier: 1,
            type: 'passive',
            name: 'Tangkisan Tanggap (Riposte)',
            icon: 'shield',
            cost: 1,
            req: null,
            desc: 'Pasif: Mengaktifkan Token Riposte & Serangan Balas Otomatis saat memasang Kuda-Kuda atau menghindar. +5 DEF & +10 Poise permanen.'
          },
          {
            id: 'skill_parry_riposte',
            tier: 2,
            type: 'active',
            slotIdx: 2,
            name: 'Kuda-Kuda Tangkis (Parry Stance)',
            icon: 'dagger',
            cost: 1,
            req: 'riposte_stance',
            desc: 'Skill Aktif (Slot 3): Memberi +50% Dodge, +15 DEF Guard, dan langsung meraih 2 Riposte Token seketika!',
            skillData: {
              id: 'parry_stance',
              name: 'Kuda-Kuda Tangkis (Parry Stance)',
              cost: 1,
              range: 0,
              rangeTag: 'Diri Sendiri',
              typeTag: 'Aktif Duelist',
              tag: '+50% Dodge & +2 Riposte',
              type: 'self',
              dodgeBuff: 0.50,
              defBuff: 15,
              riposteGain: 2,
              cooldown: 2,
              conditionText: 'Memberi 50% peluang Dodge, +15 DEF Guard, dan langsung meraih 2 Riposte Token untuk serangan balik gratis!',
              desc: 'Memasang posisi menangkis sempurna, siap membalas setiap serangan yang mendekat.',
              icon: 'dagger'
            }
          },
          {
            id: 'armor_shred_counter',
            tier: 3,
            type: 'passive',
            name: 'Pecah Zirah (Armor Shred)',
            icon: 'hammer',
            cost: 1,
            req: 'skill_parry_riposte',
            desc: 'Pasif: Setiap serangan balik Riposte merusak armor musuh permanen (-5 DEF per hit) dan memulihkan +10 Poise pemain.'
          },
          {
            id: 'skill_flawless_finale',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Duel Maut Riposte (Flawless Finale)',
            icon: 'crown',
            cost: 1,
            req: 'armor_shred_counter',
            desc: 'Skill Ultimate Puncak (Slot 5): Membalas seluruh serangan musuh dalam 1 giliran dengan 100% Critical Damage dan memicu Stance Break seketika!',
            skillData: {
              id: 'flawless_finale',
              name: 'Duel Maut (Flawless Finale)',
              cost: 3,
              range: 2,
              rangeTag: '2 Petak Duel',
              typeTag: 'Puncak Duelist',
              tag: '4.2x DMG & Instant Break',
              type: 'single',
              dmgMult: 4.2,
              poiseDmg: 90,
              riposteGain: 3,
              adrenalineReq: 100,
              conditionText: 'Puncak Duelist: Tebasan balasan presisi 4.2x ATK yang seketika menghancurkan 90 Poise musuh dan mengisi 3 Riposte Token!',
              desc: 'Puncak kemahiran berpedang: mematahkan serangan lawan dan mengakhiri pertarungan dalam satu tebasan fatal.',
              icon: 'crown'
            }
          }
        ]
      },
      branchC: {
        id: 'bladedancer',
        name: 'Jalur Penari Seratus Bilah (Bladedancer)',
        subclassName: 'Penari Seratus Bilah (Bladedancer)',
        icon: 'spark',
        color: '#f59e0b',
        mechanic: {
          name: 'Tarian Rantai Seratus Bilah (Combo Chain & Finisher)',
          desc: 'Bergantian melancarkan skill yang berbeda membangun stack Chain (+15% Damage & +10% Movement per chain, maks. 4 chain). Pada Chain 4, memicu Finale: Cooldown semua skill dipotong 1 giliran dan membuka Finisher badai tebasan!'
        },
        nodes: [
          {
            id: 'chain_flow',
            tier: 1,
            type: 'passive',
            name: 'Aliran Rantai (Chain Flow)',
            icon: 'agi',
            cost: 1,
            req: null,
            desc: 'Pasif: Mengaktifkan Combo Chain saat bergantian menggunakan skill berbeda (+15% DMG per chain). +1 Jangkauan gerak petak & +6 ATK.'
          },
          {
            id: 'skill_twin_waltz',
            tier: 2,
            type: 'active',
            slotIdx: 2,
            name: 'Tarian Pedang Kembar (Twin Waltz)',
            icon: 'dagger',
            cost: 1,
            req: 'chain_flow',
            desc: 'Skill Aktif (Slot 3): 2 tebasan beruntun berbiaya hanya 1 AP (total 2.4x ATK, 25 Poise DMG) dan langsung membangun 2 Chain!',
            skillData: {
              id: 'twin_waltz',
              name: 'Tarian Pedang Kembar (Twin Waltz)',
              cost: 1,
              range: 1,
              rangeTag: '1 Petak Kilat',
              typeTag: 'Aktif Bladedancer',
              tag: '1 AP & 2 Chain Builder',
              type: 'single',
              dmgMult: 2.4,
              poiseDmg: 25,
              chainGain: 2,
              cooldown: 1,
              conditionText: 'Hanya butuh 1 AP! Menebas 2 kali beruntun dengan total 2.4x ATK dan langsung mengisi +2 Combo Chain!',
              desc: 'Tarian bilah mematikan yang mengalir anggun dari satu tebasan ke tebasan berikutnya.',
              icon: 'dagger'
            }
          },
          {
            id: 'adrenaline_chain',
            tier: 3,
            type: 'passive',
            name: 'Irama Pembunuh (Deadly Rhythm)',
            icon: 'hourglass',
            cost: 1,
            req: 'skill_twin_waltz',
            desc: 'Pasif: Setiap stack Chain mengurangi Cooldown semua skill sebesar 1 giliran dan memberi +8% Critical Chance tambahan!'
          },
          {
            id: 'skill_blade_storm',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Tarian Badai Pisau (Blade Storm Finale)',
            icon: 'blast',
            cost: 1,
            req: 'adrenaline_chain',
            desc: 'Skill Ultimate Puncak (Slot 5): 5 tebasan badai pisau berturut-turut (total 4.8x ATK, 80 Poise DMG) ke seluruh musuh di sekitar!',
            skillData: {
              id: 'blade_storm',
              name: 'Badai Pisau (Blade Storm Finale)',
              cost: 3,
              range: 2,
              area: 1,
              rangeTag: '2P Area Badai',
              typeTag: 'Puncak Bladedancer',
              tag: '4.8x DMG Multi-Hit',
              type: 'aoe',
              dmgMult: 4.8,
              poiseDmg: 80,
              adrenalineReq: 100,
              conditionText: 'Puncak Bladedancer: Berputar melancarkan 5 tebasan badai pisau ke area sekitar dengan total 4.8x ATK!',
              desc: 'Tarian kematian berkecepatan tinggi yang menyapu bersih seluruh musuh di sekeliling sang penari.',
              icon: 'blast'
            }
          }
        ]
      }
    },
    archer: {
      branchA: {
        id: 'deadeye',
        name: 'Jalur Pembidik Mutlak (Deadeye)',
        subclassName: 'Pembidik Mutlak (Deadeye)',
        icon: 'target',
        color: '#f59e0b',
        mechanic: {
          name: 'Mata Rajawali (Eagle Eye & Sniper Mastery)',
          desc: 'Jangkauan dasar bertambah +1 petak (hingga 5 petak). Target yang berjarak >= 3 petak menerima +30% Critical Chance dan +25% Ekstra Damage!'
        },
        nodes: [
          {
            id: 'eagle_eye',
            tier: 1,
            type: 'passive',
            name: 'Mata Rajawali (Eagle Eye)',
            icon: 'target',
            cost: 1,
            req: null,
            desc: 'Pasif: +1 Jangkauan Serangan tembakan, +10% Critical Chance, dan +6 ATK permanen.'
          },
          {
            id: 'skill_aimed_headshot',
            tier: 2,
            type: 'active',
            slotIdx: 1,
            name: 'Bidikan Kepala (Aimed Headshot)',
            icon: 'arrow',
            cost: 1,
            req: 'eagle_eye',
            desc: 'Skill Aktif (Slot 2): Tembakan terfokus 2.6x ATK (35 Poise DMG) yang mengabaikan 50% DEF musuh dari jarak 5 petak!',
            skillData: {
              id: 'aimed_headshot',
              name: 'Bidikan Kepala (Headshot)',
              cost: 2,
              range: 5,
              rangeTag: '5P Ekstrem',
              typeTag: 'Aktif Deadeye',
              tag: '2.6x DMG & Abaikan 50% DEF',
              type: 'single',
              dmgMult: 2.6,
              poiseDmg: 35,
              ignoreDefPct: 0.5,
              cooldown: 2,
              conditionText: 'Jangkauan 5 petak! Mengabaikan 50% DEF target dan memberikan 35 Poise Damage besar.',
              desc: 'Menahan napas dan membidik tepat ke pelipis lawan dengan anak panah berpucuk baja runcing.',
              icon: 'arrow'
            }
          },
          {
            id: 'killzone_focus',
            tier: 3,
            type: 'passive',
            name: 'Fokus Titik Maut (Killzone Focus)',
            icon: 'spark',
            cost: 1,
            req: 'skill_aimed_headshot',
            desc: 'Pasif: Membunuh musuh dari jarak jauh langsung mengisi +35% Adrenaline seketika dan mengembalikan +1 AP!'
          },
          {
            id: 'skill_starbreaker_arrow',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Panah Pemecah Bintang (Starbreaker Finale)',
            icon: 'blast',
            cost: 1,
            req: 'killzone_focus',
            desc: 'Skill Ultimate Puncak (Slot 5): 4.6x ATK tembakan laser panah fajar berdaya hancur 85 Poise yang dijamin 100% Critical Hit!',
            skillData: {
              id: 'starbreaker_arrow',
              name: 'Panah Pemecah Bintang (Ultimate)',
              cost: 3,
              range: 5,
              rangeTag: '5P Laser Fajar',
              typeTag: 'Puncak Deadeye',
              tag: '4.6x DMG & 100% Critical',
              type: 'single',
              dmgMult: 4.6,
              poiseDmg: 85,
              autoCrit: true,
              adrenalineReq: 100,
              conditionText: 'Puncak Deadeye: Tembakan anak panah energi surya berkekuatan 4.6x ATK yang menembus target dengan 100% Critical Hit!',
              desc: 'Memusatkan seluruh kehangatan lentera menjadi satu anak panah fajar menyilaukan yang meremukkan segalanya.',
              icon: 'blast'
            }
          }
        ]
      },
      branchB: {
        id: 'trapmaster',
        name: 'Jalur Ahli Perangkap & Racun (Trapmaster)',
        subclassName: 'Ahli Perangkap & Racun (Trapmaster)',
        icon: 'flask',
        color: '#10b981',
        mechanic: {
          name: 'Jebakan Alkimia (Toxic Trap & Pincang)',
          desc: 'Semua tembakan panah melumuri musuh dengan racun neurotoksin. Musuh yang terkena jebakan atau jerat menerima efek Pincang (Rooted) dan penurunan -6 DEF.'
        },
        nodes: [
          {
            id: 'toxic_arrowheads',
            tier: 1,
            type: 'passive',
            name: 'Mata Panah Berbisa (Toxic Tips)',
            icon: 'flask',
            cost: 1,
            req: null,
            desc: 'Pasif: Semua serangan panah menimbulkan racun 10 HP/turn selama 3 giliran. +15 Max HP & +5 ATK permanen.'
          },
          {
            id: 'skill_cluster_trap',
            tier: 2,
            type: 'active',
            slotIdx: 2,
            name: 'Ranjau Kluster Alkimia (Cluster Mine)',
            icon: 'fire',
            cost: 1,
            req: 'toxic_arrowheads',
            desc: 'Skill Aktif (Slot 3): Menanam ranjau kluster 3x3 petak berdaya ledak 2.2x ATK + 35 Poise yang melumpuhkan pergerakan!',
            skillData: {
              id: 'cluster_trap',
              name: 'Ranjau Kluster (Cluster Mine)',
              cost: 2,
              range: 3,
              area: 1,
              rangeTag: '3P Area 3x3',
              typeTag: 'Aktif Trapmaster',
              tag: '2.2x DMG & Ledakan Racun',
              type: 'aoe',
              dmgMult: 2.2,
              poiseDmg: 35,
              rootTurns: 1,
              cooldown: 2,
              conditionText: 'Meledakkan serpihan kawat dan racun di area 3x3 petak, menghasilkan 2.2x ATK dan mengunci gerak musuh 1 giliran!',
              desc: 'Melempar bola jebakan bertekanan tinggi yang menyebarkan kawat pegas berduri beracun saat meledak.',
              icon: 'fire'
            }
          },
          {
            id: 'crippling_neurotoxin',
            tier: 3,
            type: 'passive',
            name: 'Neurotoksin Pelumpuh (Crippling Venom)',
            icon: 'shield',
            cost: 1,
            req: 'skill_cluster_trap',
            desc: 'Pasif: Musuh yang keracunan kehilangan -6 DEF dan jangkauan serangannya dipotong 1 petak.'
          },
          {
            id: 'skill_abyssal_snare_field',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Jaring Maut Gerhana (Eclipse Snare Field)',
            icon: 'shadow',
            cost: 1,
            req: 'crippling_neurotoxin',
            desc: 'Skill Ultimate Puncak (Slot 5): Menjerat seluruh musuh di arena pertempuran, memberikan 3.6x AoE damage dan mengunci gerak 2 giliran!',
            skillData: {
              id: 'abyssal_snare_field',
              name: 'Jaring Maut Gerhana (Ultimate)',
              cost: 3,
              range: 4,
              area: 2,
              rangeTag: '4P Area Luas',
              typeTag: 'Puncak Trapmaster',
              tag: '3.6x DMG & Root 2 Giliran',
              type: 'aoe',
              dmgMult: 3.6,
              poiseDmg: 70,
              rootTurns: 2,
              adrenalineReq: 100,
              conditionText: 'Puncak Trapmaster: Membentangkan jaring kawat beracun raksasa yang meremukkan 70 Poise dan melumpuhkan gerak seluruh musuh 2 giliran!',
              desc: 'Memicu perangkap massal kegelapan yang menjerat dan menyiksa setiap makhluk di medan pertempuran.',
              icon: 'shadow'
            }
          }
        ]
      },
      branchC: {
        id: 'windrunner',
        name: 'Jalur Penjelajah Badai (Windrunner)',
        subclassName: 'Penjelajah Badai (Windrunner)',
        icon: 'lightning',
        color: '#38bdf8',
        mechanic: {
          name: 'Irama Angin & Panah Ganda (Gale Flow & Double Draw)',
          desc: 'Setiap aksi tembakan memberi +1 Petak jangkauan gerak dan +15% Dodge. Tembakan biasa berpeluang 50% menembakkan panah kedua secara gratis!'
        },
        nodes: [
          {
            id: 'wind_momentum',
            tier: 1,
            type: 'passive',
            name: 'Momentum Angin (Wind Momentum)',
            icon: 'lightning',
            cost: 1,
            req: null,
            desc: 'Pasif: +1 Jangkauan gerak petak permanen, +12% Peluang Dodge, dan mengaktifkan tembakan panah ganda.'
          },
          {
            id: 'skill_twin_arrow_barrage',
            tier: 2,
            type: 'active',
            slotIdx: 2,
            name: 'Tembakan Ganda Cepat (Twin Shot)',
            icon: 'arrow',
            cost: 1,
            req: 'wind_momentum',
            desc: 'Skill Aktif (Slot 3): 2 tembakan anak panah beruntun hanya 1 AP (total 2.3x ATK, 24 Poise DMG) yang langsung memberi +25% Dodge!',
            skillData: {
              id: 'twin_shot',
              name: 'Tembakan Ganda (Twin Shot)',
              cost: 1,
              range: 4,
              rangeTag: '4P Kilat',
              typeTag: 'Aktif Windrunner',
              tag: '1 AP & 2x Panah Kilat',
              type: 'single',
              dmgMult: 2.3,
              poiseDmg: 24,
              dodgeBuff: 0.25,
              cooldown: 1,
              conditionText: 'Hanya 1 AP! Menembakkan 2 anak panah kilat berturut-turut dan memberi pahlawan +25% Dodge untuk 1 giliran.',
              desc: 'Menarik dua anak panah sekaligus pada busur dan melepaskannya dalam satu desingan secepat kilat.',
              icon: 'arrow'
            }
          },
          {
            id: 'gale_agility',
            tier: 3,
            type: 'passive',
            name: 'Kelincahan Badai (Gale Agility)',
            icon: 'spark',
            cost: 1,
            req: 'skill_twin_arrow_barrage',
            desc: 'Pasif: Setiap kali berhasil menghindar (Dodge), seketika mendapatkan +1 AP gratis dan Cooldown semua skill berkurang 1 giliran!'
          },
          {
            id: 'skill_cyclone_arrow_storm',
            tier: 4,
            type: 'active',
            slotIdx: 4,
            name: 'Siklon Badai Panah (Arrow Cyclone Finale)',
            icon: 'blast',
            cost: 1,
            req: 'gale_agility',
            desc: 'Skill Ultimate Puncak (Slot 5): Berputar melepaskan puluhan panah badai ke segala penjuru (total 4.4x ATK, 75 Poise DMG) dengan knockback!',
            skillData: {
              id: 'arrow_cyclone',
              name: 'Siklon Badai Panah (Ultimate)',
              cost: 3,
              range: 3,
              area: 1,
              rangeTag: '3P Area Siklon',
              typeTag: 'Puncak Windrunner',
              tag: '4.4x DMG & Dorong 1P',
              type: 'aoe',
              dmgMult: 4.4,
              poiseDmg: 75,
              pushBack: 1,
              adrenalineReq: 100,
              conditionText: 'Puncak Windrunner: Melepaskan 12 anak panah berputar yang menghantam seluruh musuh di sekeliling pahlawan dan mendorong mereka mundur 1 petak!',
              desc: 'Tarian busur badai berkecepatan tinggi yang menciptakan pusaran angin berbilah tajam penumpas kepungan lawan.',
              icon: 'blast'
            }
          }
        ]
      }
    }
  };
  const CLASS_BUILDS = {
    warrior: {
      buildA: {
        id: 'bastion',
        name: 'Benteng Abadi (Bastion)',
        icon: 'fortress',
        desc: 'Pertahanan baja tak tertembus, kebal Stance Break saat Guard, memantulkan 40% duri damage, dan mengubah sisa AP menjadi Barrier!',
        passives: [
          { id: 'iron_will', name: 'Kehendak Baja (Iron Will)', desc: '+25% Max Poise & +5 DEF permanen. Kebal Stance Break saat Guard aktif.' },
          { id: 'retaliation_thorns', name: 'Duri Pembalasan (Retaliation)', desc: 'Saat Guard aktif, memantulkan 40% serangan musuh kembali sebagai True Damage.' }
        ]
      },
      buildB: {
        id: 'berserker',
        name: 'Algojo Darah (Berserker)',
        icon: 'blood',
        desc: 'Membangun Rage stack saat bertarung, memicu amukan Frenzy (+30% DMG & 25% Lifesteal) saat HP < 50%, dan pulih saat Stance Break musuh.',
        passives: [
          { id: 'blood_frenzy', name: 'Amukan Darah (Blood Frenzy)', desc: '+8 ATK. Membangun Rage (+5% ATK/stack, maks 6) dan memicu Frenzy saat HP < 50%.' },
          { id: 'shatter_feast', name: 'Santapan Kuda-Kuda (Shatter Feast)', desc: 'Memicu Stance Break pada musuh memulihkan 25% Max HP & +1 AP seketika.' }
        ]
      },
      buildC: {
        id: 'commander',
        name: 'Panglima Taktis (Commander)',
        icon: 'crown',
        desc: 'Sistem Command stack (+5% DMG & +4 DEF/stack), kebal stun pada 3+ Command, dan mengeksekusi musuh berdarah rendah (< 25% HP).',
        passives: [
          { id: 'tactical_command', name: 'Komando Medan Perang (Command)', desc: '+15 HP, +3 DEF. Serangan memberi +1 Command, Guard memberi +2 Command (maks 5).' },
          { id: 'command_aura', name: 'Aura Kemenangan (Warlord)', desc: 'Pada 3+ Command, ksatria kebal Stun dan meraih +15% Critical Chance.' }
        ]
      }
    },
    mage: {
      buildA: {
        id: 'elementalist',
        name: 'Elementalis Surya & Es (Elementalist)',
        icon: 'fire',
        desc: 'Rantai Reaksi Elemen bergantian: Api->Es (Melt), Es->Petir (Superconduct Stun), Petir->Api (Overload AoE). Memotong cooldown -1 turn!',
        passives: [
          { id: 'elemental_cycle', name: 'Katalis Elemen (Elemental Cycle)', desc: '+8 Magic ATK. Reaksi elemen (Melt, Superconduct, Overload) memotong CD skill -1 giliran.' },
          { id: 'elemental_resonance', name: 'Resonansi Elemen (Resonance)', desc: 'Reaksi elemen memberi +25% bonus damage ekstra dan membentuk +10 Barrier Shield gratis.' }
        ]
      },
      buildB: {
        id: 'spellblade',
        name: 'Pendekar Bilah Sihir (Spellblade)',
        icon: 'sword',
        desc: 'Mantra mengisi Arcane Charge pedang astral. Serangan dasar melepaskan seluruh Charge untuk tebasan beruntun (+30% DMG/charge) & me-refund 1 AP!',
        passives: [
          { id: 'arcane_blade_passive', name: 'Bilah Astral (Arcane Charge)', desc: '+6 ATK, +10% Crit Chance. Mantra mengisi +1 Charge pedang astral (maks 4).' },
          { id: 'arcane_aegis_mastery', name: 'Perisai Bilah (Aegis Mastery)', desc: 'Setiap Arcane Charge memberi +10 Barrier Shield pasif dan +5 DEF pelindung tubuh.' }
        ]
      },
      buildC: {
        id: 'necromancer',
        name: 'Kutukan Pembusuk Jiwa (Hexbound)',
        icon: 'skull',
        desc: 'Kutukan Corruption DoT membakar musuh tiap gilirannya dan menyerap 50-60% damage memulihkan HP pemain. Kills memberi +30% HP & +1 AP.',
        passives: [
          { id: 'abyssal_corruption', name: 'Kutukan Pembusuk (Corruption)', desc: '+20 Max HP, +6 Magic ATK. Serangan menanam kutukan Corruption yang membakar musuh.' },
          { id: 'soul_siphon', name: 'Hisapan Jiwa (Soul Siphon)', desc: 'Life Drain Corruption naik ke 60% dan musuh ber-Corruption kehilangan -5 DEF per stack.' }
        ]
      }
    },
    rogue: {
      buildA: {
        id: 'shadow',
        name: 'Pembunuh Bayangan (Shadow Stalker)',
        icon: 'dagger',
        desc: 'Flank & Backstab menanam Weakness Mark. Pada 3+ Mark, serangan dijamin 100% Critical (+75% Crit DMG) & memicu Vanish. Eksekusi mati musuh < 30% HP.',
        passives: [
          { id: 'anatomical_insight', name: 'Titik Vital (Anatomical Insight)', desc: '+12% Crit Chance permanen. Flank & Backstab menanam Weakness Mark (Backstab 1.8x DMG).' },
          { id: 'vanish_kill', name: 'Lenyap Dalam Darah (Vanish on Kill)', desc: 'Membunuh musuh memulihkan 20% Max HP, memberi Camouflage (+50% Dodge), dan mereset CD.' }
        ]
      },
      buildB: {
        id: 'duelist',
        name: 'Pembalas Tangkisan (Duelist)',
        icon: 'shield',
        desc: 'Kuda-Kuda atau Dodge mengumpulkan Riposte Token. Saat diserang musuh, OTOMATIS membalas musuh dengan 60% ATK tanpa menghabiskan giliran!',
        passives: [
          { id: 'riposte_stance', name: 'Tangkisan Tanggap (Riposte)', desc: '+5 DEF, +10 Poise. Kuda-Kuda & Dodge menghasilkan Riposte Token untuk serangan balas instan.' },
          { id: 'armor_shred_counter', name: 'Pecah Zirah (Armor Shred)', desc: 'Serangan balas Riposte merusak armor musuh permanen (-5 DEF per hit) & memulihkan +10 Poise.' }
        ]
      },
      buildC: {
        id: 'bladedancer',
        name: 'Penari Seratus Bilah (Bladedancer)',
        icon: 'spark',
        desc: 'Bergantian menggunakan skill membangun stack Chain (+15% DMG & +10% Speed per chain). Pada Chain 4, memicu Finale: Cooldown semua skill dipotong -1 giliran!',
        passives: [
          { id: 'chain_flow', name: 'Aliran Rantai (Chain Flow)', desc: '+1 Gerak langkah petak, +6 ATK. Bergantian menggunakan skill berbeda membangun stack Combo Chain.' },
          { id: 'adrenaline_chain', name: 'Irama Pembunuh (Deadly Rhythm)', desc: 'Chain 4 memotong Cooldown semua skill sebesar -1 giliran dan memberi +8% Critical Chance.' }
        ]
      }
    },
    archer: {
      buildA: {
        id: 'deadeye',
        name: 'Mata Rajawali (Deadeye)',
        icon: 'target',
        desc: 'Spesialis tembakan jarak jauh mematikan (Jarak >= 3 petak mendapat +25% Sniper DMG), peluang tembakan kritis tinggi, dan penetrasi pelindung zirah musuh.',
        passives: [
          { id: 'eagle_eye', name: 'Mata Rajawali (Eagle Eye)', desc: '+20% Critical Chance dan +1 Jarak Jangkauan Serangan Dasar.' },
          { id: 'killzone_focus', name: 'Fokus Zona Maut (Killzone Focus)', desc: 'Tembakan berjarak >= 3 petak menghasilkan +35% Critical Damage dan mengabaikan 5 DEF musuh.' }
        ]
      },
      buildB: {
        id: 'trapmaster',
        name: 'Pakar Perangkap & Racun (Trapmaster)',
        icon: 'shield',
        desc: 'Ahli ranjau jerat dan racun mematikan. Menjerat musuh, menguras HP secara berkala, melemahkan DEF lawan yang terjebak, serta meledakkan perangkap berantai.',
        passives: [
          { id: 'toxic_tips', name: 'Mata Panah Beracun (Toxic Tips)', desc: 'Semua serangan panah menanamkan racun berkala (3 turn DoT, 15 damage per turn).' },
          { id: 'crippling_venom', name: 'Bisa Pelumpuh (Crippling Venom)', desc: 'Musuh yang terjerat perangkap atau terkena racun kehilangan -5 DEF dan mobilitasnya berkurang drastis.' }
        ]
      },
      buildC: {
        id: 'windrunner',
        name: 'Penjelajah Badai Angin (Windrunner)',
        icon: 'lightning',
        desc: 'Mobilitas kilat dan kecepatan menembak ganda. Bergerak menghasilkan momentum kecepatan dan peluang melepaskan panah ganda beruntun tanpa biaya AP tambahan.',
        passives: [
          { id: 'wind_momentum', name: 'Momentum Angin (Wind Momentum)', desc: '+1 Gerak langkah petak dan +20% Dodge Chance saat bergerak di gilirannya.' },
          { id: 'twin_shot', name: 'Panah Ganda (Twin Shot)', desc: 'Tembakan dasar memiliki 45% peluang melepaskan panah kedua seketika dengan 60% ATK.' }
        ]
      }
    }
  };

  /* --- LEVEL-UP BOONS (HADES-STYLE BLESSING POOL) --- */
  const LEVEL_UP_BOONS = [
    { id: 'boon_solar_edge', name: 'Bilah Percikan Surya', icon: 'sun', type: 'Offensive', desc: 'Serangan dasar memiliki 30% peluang memicu percikan bara suci (+18 True DMG).' },
    { id: 'boon_bastion_core', name: 'Teras Benteng Abadi', icon: 'shield', type: 'Defensive', desc: '+30 Max HP permanen dan +6 DEF tambahan.' },
    { id: 'boon_swift_step', name: 'Langkah Kilat Fajar', icon: 'lightning', type: 'Utility', desc: '+1 Jangkauan gerak langkah petak di mode eksplorasi & pertempuran.' },
    { id: 'boon_potion_master', name: 'Eliksir Surya Murni', icon: 'flask', type: 'Utility', desc: 'Lentera Flask kini memulihkan 60% HP (dari 45%) dan seketika memberi +1 AP gratis.' },
    { id: 'boon_poise_crush', name: 'Hantaman Gempa Purba', icon: 'hammer', type: 'Offensive', desc: 'Semua skill serangan menghasilkan +15 Poise Damage tambahan ke musuh.' },
    { id: 'boon_adrenaline_surge', name: 'Gelombang Tekad', icon: 'fire', type: 'Combat', desc: 'Mengisi Adrenaline 2x lebih cepat saat menyerang atau terkena hantaman.' },
    { id: 'boon_critical_echo', name: 'Gema Kritis Fajar', icon: 'spark', type: 'Offensive', desc: 'Setiap Critical Hit memicu gelombang kejut yang melukai musuh terdekat sebesar 20 DMG.' },
    { id: 'boon_shadow_veil', name: 'Tirai Halimun Jurang', icon: 'shadow', type: 'Defensive', desc: '+12% Peluang Menghindar (Dodge) permanen.' },
    { id: 'boon_mana_siphon', name: 'Sedotan Esensi Jiwa', icon: 'orb', type: 'Combat', desc: 'Membunuh musuh seketika memulihkan 1 AP kembali pada giliran yang sama.' },
    { id: 'boon_sun_ward', name: 'Restu Lentera Ayah', icon: 'amulet', type: 'Defensive', desc: 'Di awal setiap pertarungan, langsung memperoleh +30 Barrier Shield gratis.' },
    { id: 'boon_vampiric_bite', name: 'Sentuhan Darah Abyss', icon: 'blood', type: 'Offensive', desc: '+15% Lifesteal dari seluruh damage fisik dan sihir yang dihasilkan.' },
    { id: 'boon_gold_magnet', name: 'Mata Emas Kegelapan', icon: 'coin', type: 'Utility', desc: 'Peti harta dan monster menjatuhkan +50% lebih banyak koin emas.' }
  ];

  /* --- ELITE MONSTER CHAMPION AFFIXES (TACTICAL MUTATORS) --- */
  const ELITE_MODIFIERS = [
    {
      id: 'vampiric',
      name: 'Penghisap Jiwa',
      prefix: 'Penghisap Jiwa ',
      auraColor: 0xef4444,
      statMult: 1.35,
      desc: 'Menghisap 30% dari damage yang dihasilkan menjadi HP monster.',
      icon: 'blood'
    },
    {
      id: 'explosive',
      name: 'Bara Mesiu',
      prefix: 'Bara Mesiu ',
      auraColor: 0xf97316,
      statMult: 1.30,
      desc: 'Meledak dahsyat saat mati, menghasilkan 28 DMG pada 8 petak sekelilingnya.',
      icon: 'fire'
    },
    {
      id: 'thorns',
      name: 'Duri Kinetis',
      prefix: 'Duri Kinetis ',
      auraColor: 0x10b981,
      statMult: 1.30,
      desc: 'Memantulkan 25% damage serangan jarak dekat langsung ke penyerang.',
      icon: 'fortress'
    },
    {
      id: 'shielded',
      name: 'Perisai Baja',
      prefix: 'Perisai Baja ',
      auraColor: 0x38bdf8,
      statMult: 1.35,
      desc: 'Memulai pertempuran dengan +40 Barrier Shield pelindung.',
      icon: 'shield'
    },
    {
      id: 'frenzied',
      name: 'Kilat Amarah',
      prefix: 'Kilat Amarah ',
      auraColor: 0xfacc15,
      statMult: 1.25,
      desc: '+1 Petak jangkauan gerak dan +20% Peluang Serangan Kritis.',
      icon: 'lightning'
    },
    {
      id: 'corrupting',
      name: 'Kutukan Void',
      prefix: 'Kutukan Void ',
      auraColor: 0xa855f7,
      statMult: 1.30,
      desc: 'Serangan menyebabkan efek Korosi (Corruption) selama 3 giliran.',
      icon: 'shadow'
    },
    {
      id: 'regenerator',
      name: 'Darah Abadi',
      prefix: 'Darah Abadi ',
      auraColor: 0x06b6d4,
      statMult: 1.40,
      desc: 'Memulihkan 8% Max HP di setiap awal giliran monster.',
      icon: 'flask'
    }
  ];

  /* --- CURSED ALTAR PACTS (HIGH RISK - HIGH REWARD) --- */
  const CURSED_ALTAR_DEALS = [
    {
      id: 'pact_blood_god',
      title: 'Pakta Darah Abadi',
      icon: 'blood',
      boonDesc: '+45 Max HP & +10 ATK secara permanen.',
      curseDesc: 'Lentera Flask berkurang 1 botol (potions -1) & darah saat ini dikurangi 25 HP.',
      boonStats: { maxHp: 45, atk: 10 },
      curseEffect: 'potion_cost'
    },
    {
      id: 'pact_shadow_eye',
      title: 'Mata Gerhana Abyssal',
      icon: 'shadow',
      boonDesc: '+25% Peluang Critical Hit & +1 Petak Jangkauan Gerak.',
      curseDesc: 'Memotong 35% HP saat ini seketika sebagai persembahan darah.',
      boonStats: { critChance: 0.25, moveRange: 1 },
      curseEffect: 'hp_cut'
    },
    {
      id: 'pact_forbidden_greed',
      title: 'Peti Ketamakan Terlarang',
      icon: 'coin',
      boonDesc: 'Memperoleh +160 Gold & 1 Perlengkapan Langka seketika.',
      curseDesc: 'Kutukan Kerentanan: Menerima +25% damage lebih tinggi di pertempuran berikutnya.',
      boonStats: { gold: 160, giveRandomRelic: true },
      curseEffect: 'vulnerable_next_combat'
    },
    {
      id: 'pact_iron_berserk',
      title: 'Kemarahan Ksatria Hampa',
      icon: 'sword',
      boonDesc: '+18 ATK permanen & +1 AP Maksimal di pertempuran!',
      curseDesc: 'Pertahanan goyah: Max Poise pahlawan dikurangi 15 poin.',
      boonStats: { atk: 18, maxAp: 1, maxPoise: -15 },
      curseEffect: 'poise_penalty'
    }
  ];

  /* --- ABYSSAL BOUNTY TARGETS (MISI BURONAN TIAP LANTAI) --- */
  const BOUNTIES = {
    1: {
      id: 'bounty_floor_1',
      floor: 1,
      targetKey: 'kragor_bonecleaver',
      name: 'Kragor si Pemecah Tulang',
      title: 'Ogre Pelarian Pembelot - Misi Buronan Lantai 1',
      danger: 'Tingkat I (Bahaya)',
      dangerColor: '#f97316',
      icon: 'hammer',
      modelType: 'troll',
      hp: 230,
      poise: 70,
      atk: 25,
      def: 10,
      speed: 8,
      moveRange: 2,
      attackRange: 1,
      skills: [
        { name: 'Auman Haus Darah', dmg: 20, poiseDmg: 20 },
        { name: 'Hantaman Pemecah Tulang', dmg: 32, poiseDmg: 35 }
      ],
      lore: 'Mantan algojo kuburan yang membelot dari barisan penjaga Abu. Bersembunyi di ceruk terpencil lantai ini untuk menyergap para penjelajah!',
      rewardGold: 220,
      rewardExp: 160,
      relicReward: 'kragor_bone_ring'
    },
    2: {
      id: 'bounty_floor_2',
      floor: 2,
      targetKey: 'morwen_frost_queen',
      name: 'Morwen Ratu Embun Beku',
      title: 'Penyihir Kristal Es Terkutuk - Misi Buronan Lantai 2',
      danger: 'Tingkat II (Sangat Tinggi)',
      dangerColor: '#06b6d4',
      icon: 'frost',
      modelType: 'ghost',
      hp: 330,
      poise: 80,
      atk: 32,
      def: 12,
      speed: 12,
      moveRange: 4,
      attackRange: 3,
      skills: [
        { name: 'Embun Beku Absolut', dmg: 28, poiseDmg: 25 },
        { name: 'Hujan Duri Glasier', dmg: 38, poiseDmg: 30, aoe: true }
      ],
      lore: 'Penyihir istana kuno yang membekukan jantungnya sendiri ke dalam kristal es abadi. Bersemayam di sudut terdalam Reruntuhan Beku.',
      rewardGold: 340,
      rewardExp: 260,
      relicReward: 'morwen_glacial_heart'
    },
    3: {
      id: 'bounty_floor_3',
      floor: 3,
      targetKey: 'pyrax_hellhound',
      name: 'Pyrax Anjing Api Neraka',
      title: 'Binatang Purba Segel Abu - Misi Buronan Lantai 3',
      danger: 'Tingkat III (Mematikan)',
      dangerColor: '#ef4444',
      icon: 'fire',
      modelType: 'rat',
      hp: 440,
      poise: 95,
      atk: 40,
      def: 14,
      speed: 15,
      moveRange: 4,
      attackRange: 1,
      skills: [
        { name: 'Lompatan Bara Liar', dmg: 36, poiseDmg: 30, push: 1 },
        { name: 'Gigitan Kobaran Magma', dmg: 48, poiseDmg: 40 }
      ],
      lore: 'Monster berkaki empat dengan surai api yang lolos dari rantai Labirin Segel. Membakar siapa saja yang melangkah di lorong mantra gelap.',
      rewardGold: 480,
      rewardExp: 380,
      relicReward: 'pyrax_flame_fang'
    },
    4: {
      id: 'bounty_floor_4',
      floor: 4,
      targetKey: 'vael_eclipse_blade',
      name: 'Vael Algojo Gerhana',
      title: 'Pendekar Pedang Bayangan Mutlak - Misi Buronan Lantai 4',
      danger: 'Tingkat IV (Maut Seketika)',
      dangerColor: '#a855f7',
      icon: 'shadow',
      modelType: 'vampire',
      hp: 580,
      poise: 120,
      atk: 48,
      def: 18,
      speed: 16,
      moveRange: 4,
      attackRange: 2,
      skills: [
        { name: 'Langkah Bayangan Hantu', dmg: 44, poiseDmg: 35 },
        { name: 'Tebasan Pemenggal Jiwa', dmg: 62, poiseDmg: 55 }
      ],
      lore: 'Pembunuh bayaran tak bernama yang diperintahkan memburu setiap pembawa lentera sebelum mendekati pintu gerbang Singgasana Hampa.',
      rewardGold: 680,
      rewardExp: 550,
      relicReward: 'vael_shadow_cloak'
    },
    5: {
      id: 'bounty_floor_5',
      floor: 5,
      targetKey: 'xylar_void_emperor',
      name: 'Xylar Penguasa Kekosongan',
      title: 'Anomali Primordial Abyssal - Misi Buronan Lantai 5',
      danger: 'Tingkat V (Bencana Mutlak)',
      dangerColor: '#ec4899',
      icon: 'skull',
      modelType: 'emperor',
      hp: 850,
      poise: 160,
      atk: 58,
      def: 24,
      speed: 14,
      moveRange: 3,
      attackRange: 3,
      skills: [
        { name: 'Runtuhan Ruang Hampa', dmg: 55, poiseDmg: 45, aoe: true },
        { name: 'Hisapan Jiwa Primordial', dmg: 72, poiseDmg: 60 }
      ],
      lore: 'Entitas purba tertua yang terperangkap di dasar jurang terdalam. Menguapkan realitas di sekeliling sarangnya.',
      rewardGold: 1000,
      rewardExp: 900,
      relicReward: 'xylar_void_eye'
    }
  };

  return {
    CLASSES,
    SKILL_TREES,
    CLASS_BUILDS,
    LEVEL_UP_BOONS,
    ELITE_MODIFIERS,
    CURSED_ALTAR_DEALS,
    BOUNTIES,
    STORY_DESCENT,
    MONSTERS,
    BOSSES,
    SETS,
    ITEMS,
    generateFloorShop,
    NPCS,
    LORE_TABLETS,
    FLOORS
  };
})();
