/**
 * EVER DEEPER II: ABYSSAL TACTICS (TURUN TERUS RPG 2)
 * Real Vector Fantasy SVG Icon Library (100% Offline Compatible, Zero OS Emojis)
 */

window.GameIcons = (function() {
  const DEFS = `
    <defs>
      <linearGradient id="fg-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#eee0ba"/>
        <stop offset="50%" stop-color="#c6a66f"/>
        <stop offset="100%" stop-color="#80623f"/>
      </linearGradient>
      <linearGradient id="fg-steel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="50%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <linearGradient id="fg-crimson" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fca5a5"/>
        <stop offset="50%" stop-color="#ef4444"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </linearGradient>
      <linearGradient id="fg-arcane" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="50%" stop-color="#83bed0"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
      <linearGradient id="fg-void" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e9d5ff"/>
        <stop offset="50%" stop-color="#a296bd"/>
        <stop offset="100%" stop-color="#581c87"/>
      </linearGradient>
      <linearGradient id="fg-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#bbf7d0"/>
        <stop offset="50%" stop-color="#83b88c"/>
        <stop offset="100%" stop-color="#166534"/>
      </linearGradient>
      <linearGradient id="fg-fire" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#dc2626"/>
        <stop offset="55%" stop-color="#f97316"/>
        <stop offset="100%" stop-color="#eee0ba"/>
      </linearGradient>
    </defs>
  `;

  const PATHS = {
    sword: `
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5-3 3z" fill="url(#fg-steel)" stroke="#1e293b" stroke-width="1.2"/>
      <path d="M13 19l6-6 2 2-6 6-2-2z" fill="url(#fg-gold)" stroke="#451a03" stroke-width="1"/>
      <path d="M19 19l2 2-1.5 1.5-2-2L19 19z" fill="#78350f"/>
      <path d="M9.5 17.5L21 6V3h-3L6.5 14.5l3 3z" fill="url(#fg-steel)" stroke="#1e293b" stroke-width="1.2" opacity="0.88"/>
      <path d="M11 19l-6-6-2 2 6 6 2-2z" fill="url(#fg-gold)" stroke="#451a03" stroke-width="1"/>
    `,
    greatsword: `
      <path d="M19 3l2 2-11 11-3-1 1-3L19 3z" fill="url(#fg-steel)" stroke="#0f172a" stroke-width="1.2"/>
      <path d="M6 12l6 6-1.5 1.5-6-6L6 12z" fill="url(#fg-gold)" stroke="#451a03" stroke-width="1"/>
      <path d="M5.5 16.5L3 19l2 2 2.5-2.5-2-2z" fill="#991b1b"/>
      <circle cx="4" cy="20" r="1.5" fill="url(#fg-gold)"/>
    `,
    dagger: `
      <path d="M18 3l3 3-9 9-3-3 9-9z" fill="url(#fg-steel)" stroke="#0f172a" stroke-width="1.2"/>
      <path d="M7.5 10.5l6 6-1.5 1.5-6-6 1.5-1.5z" fill="url(#fg-gold)"/>
      <path d="M6 15l-3 3 2 2 3-3-2-2z" fill="url(#fg-emerald)"/>
    `,
    hammer: `
      <path d="M6 18L16 8l2 2-10 10-2-2z" fill="#92400e" stroke="#451a03" stroke-width="1"/>
      <path d="M12 4l8 8-3.5 3.5-8-8L12 4z" fill="url(#fg-steel)" stroke="#1e293b" stroke-width="1.2"/>
      <path d="M13.5 5.5l5 5" stroke="url(#fg-gold)" stroke-width="1.8" stroke-linecap="round"/>
    `,
    shield: `
      <path d="M12 2L4 5.5v6c0 5.5 3.4 10.3 8 12 4.6-1.7 8-6.5 8-12v-6L12 2z" fill="url(#fg-steel)" stroke="url(#fg-gold)" stroke-width="1.6"/>
      <path d="M12 5v15c3.2-1.4 5.5-5.1 5.5-9.5V6.8L12 5z" fill="url(#fg-crimson)" opacity="0.85"/>
      <path d="M12 8l2.5 4-2.5 4-2.5-4L12 8z" fill="url(#fg-gold)"/>
    `,
    fortress: `
      <path d="M4 21h16V9l-3-2V4h-2v2h-2V4h-2v2H9V4H7v3L4 9v12z" fill="url(#fg-steel)" stroke="url(#fg-gold)" stroke-width="1.4"/>
      <path d="M9 21v-6a3 3 0 0 1 6 0v6H9z" fill="#1e1b4b" stroke="url(#fg-gold)" stroke-width="1.2"/>
      <rect x="7" y="10" width="2.5" height="3" fill="url(#fg-gold)"/>
      <rect x="14.5" y="10" width="2.5" height="3" fill="url(#fg-gold)"/>
    `,
    sun: `
      <circle cx="12" cy="12" r="5" fill="url(#fg-fire)" stroke="#eee0ba" stroke-width="1.2"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2" stroke="url(#fg-gold)" stroke-width="2" stroke-linecap="round"/>
    `,
    spark: `
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill="url(#fg-gold)" stroke="#eee0ba" stroke-width="1"/>
      <circle cx="12" cy="12" r="2.5" fill="#ffffff"/>
    `,
    fire: `
      <path d="M12 2c1.5 3.5 5 5.5 5 10.5a5.5 5.5 0 0 1-11 0C6 9 8.5 6.5 9.5 4.5c.5 1.8 1.8 2.5 2.5-2.5z" fill="url(#fg-fire)" stroke="#eee0ba" stroke-width="1"/>
      <path d="M12 11c1 1.8 2.5 3 2.5 5a2.5 2.5 0 0 1-5 0c0-1.5 1-3 2.5-5z" fill="#eee0ba"/>
    `,
    frost: `
      <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" stroke="url(#fg-arcane)" stroke-width="2" stroke-linecap="round"/>
      <polygon points="12,7 15,12 12,17 9,12" fill="#e0f2fe" stroke="#0284c7" stroke-width="1"/>
    `,
    orb: `
      <circle cx="12" cy="11" r="7.5" fill="url(#fg-arcane)" stroke="url(#fg-gold)" stroke-width="1.5"/>
      <ellipse cx="9.5" cy="8.5" rx="2.5" ry="1.5" transform="rotate(-30 9.5 8.5)" fill="#ffffff" opacity="0.75"/>
      <path d="M7 19h10l-1.5 2.5h-7L7 19z" fill="url(#fg-gold)"/>
    `,
    blast: `
      <polygon points="12,2 14.8,8.5 22,7 17,12.5 20.5,19 13.5,16.5 10,22 9.5,15 3,16 7.5,10.8 4,5 10.2,7.5" fill="url(#fg-fire)" stroke="#eee0ba" stroke-width="1.1"/>
      <circle cx="12" cy="12" r="3" fill="#ffffff"/>
    `,
    lightning: `
      <polygon points="13,2 4,14 11,14 9,22 20,10 13,10" fill="url(#fg-gold)" stroke="#eee0ba" stroke-width="1.2" stroke-linejoin="round"/>
    `,
    smoke: `
      <path d="M6 16a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1.5A4.5 4.5 0 1 1 17 16H6z" fill="url(#fg-void)" stroke="#cbd5e1" stroke-width="1.2" opacity="0.9"/>
      <path d="M4 19h12M7 21.5h10" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round"/>
    `,
    flask: `
      <path d="M9 3h6v2.5l-1 1v3l4.8 7.5A2.5 2.5 0 0 1 16.7 21H7.3a2.5 2.5 0 0 1-2.1-4L10 9.5v-3l-1-1V3z" fill="#1e293b" stroke="url(#fg-gold)" stroke-width="1.5"/>
      <path d="M6.8 15h10.4l1.5 2.4A1.5 1.5 0 0 1 17.4 19.8H6.6a1.5 1.5 0 0 1-1.3-2.4L6.8 15z" fill="url(#fg-emerald)"/>
      <circle cx="10" cy="17" r="1" fill="#ffffff" opacity="0.8"/>
      <circle cx="13.5" cy="16.2" r="0.8" fill="#ffffff" opacity="0.8"/>
    `,
    shadow: `
      <path d="M12 3a6 6 0 0 0-6 6v4l-2 4h16l-2-4V9a6 6 0 0 0-6-6z" fill="url(#fg-void)" stroke="#c084fc" stroke-width="1.2"/>
      <circle cx="9.5" cy="10" r="1.3" fill="#eee0ba"/>
      <circle cx="14.5" cy="10" r="1.3" fill="#eee0ba"/>
      <path d="M7 19c1.5 2 3.5 2.5 5 2.5s3.5-.5 5-2.5" stroke="#a296bd" stroke-width="1.5" fill="none"/>
    `,
    target: `
      <circle cx="12" cy="12" r="8" fill="none" stroke="url(#fg-crimson)" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="4" fill="none" stroke="url(#fg-gold)" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="1.5" fill="#eee0ba"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="url(#fg-crimson)" stroke-width="1.8" stroke-linecap="round"/>
    `,
    ranged: `
      <path d="M5 19L19 5M19 5h-6M19 5v6" stroke="url(#fg-arcane)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 12c0-4.4 3.6-8 8-8" stroke="url(#fg-gold)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M12 20c4.4 0 8-3.6 8-8" stroke="url(#fg-gold)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    `,
    blood: `
      <path d="M12 2.5C12 2.5 6 10 6 14.5a6 6 0 0 0 12 0C18 10 12 2.5 12 2.5z" fill="url(#fg-crimson)" stroke="#fca5a5" stroke-width="1.2"/>
      <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.7"/>
    `,
    staff: `
      <path d="M5 20L16 9" stroke="#92400e" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="17.5" cy="6.5" r="3.2" fill="url(#fg-arcane)" stroke="url(#fg-gold)" stroke-width="1.4"/>
      <path d="M14 9c0-3 2-5.5 5.5-5.5" stroke="url(#fg-gold)" stroke-width="1.4" fill="none"/>
    `,
    book: `
      <path d="M4 5a2 2 0 0 1 2-2h5.5v16H6a2 2 0 0 0-2 2V5z" fill="url(#fg-crimson)" stroke="url(#fg-gold)" stroke-width="1.3"/>
      <path d="M20 5a2 2 0 0 0-2-2h-5.5v16H18a2 2 0 0 1 2 2V5z" fill="#7f1d1d" stroke="url(#fg-gold)" stroke-width="1.3"/>
      <polygon points="8,8 9.5,11 8,14 6.5,11" fill="url(#fg-gold)"/>
    `,
    scroll: `
      <path d="M6 4h11a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H7a2 2 0 0 1-2-2V6a2 2 0 0 1 1-2z" fill="#fde68a" stroke="#80623f" stroke-width="1.5"/>
      <path d="M8 8h7M8 11.5h7M8 15h4" stroke="#78350f" stroke-width="1.4" stroke-linecap="round"/>
    `,
    armor: `
      <path d="M8 3l4 2 4-2 4 4-2.5 4L16 9.5V20H8V9.5L6.5 11 4 7l4-4z" fill="url(#fg-steel)" stroke="url(#fg-gold)" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M12 5v15" stroke="url(#fg-gold)" stroke-width="1.2"/>
    `,
    ring: `
      <circle cx="12" cy="14" r="6" fill="none" stroke="url(#fg-gold)" stroke-width="2.6"/>
      <polygon points="12,3 15.5,7 12,9.5 8.5,7" fill="url(#fg-crimson)" stroke="#eee0ba" stroke-width="1"/>
    `,
    crown: `
      <path d="M3 18h18l-2-10-4.5 4L12 5 9.5 12 5 8 3 18z" fill="url(#fg-gold)" stroke="#eee0ba" stroke-width="1.3" stroke-linejoin="round"/>
      <circle cx="12" cy="14" r="1.4" fill="#ef4444"/>
      <circle cx="7.5" cy="14.5" r="1.1" fill="#83bed0"/>
      <circle cx="16.5" cy="14.5" r="1.1" fill="#83bed0"/>
    `,
    amulet: `
      <path d="M7 3c0 4 2.2 7 5 7s5-3 5-7" fill="none" stroke="url(#fg-gold)" stroke-width="1.5" stroke-dasharray="2 1"/>
      <polygon points="12,9 17,15 12,21 7,15" fill="url(#fg-gold)" stroke="#eee0ba" stroke-width="1.3"/>
      <circle cx="12" cy="15" r="2" fill="url(#fg-crimson)"/>
    `,
    chalice: `
      <path d="M7 3h10v5a5 5 0 0 1-10 0V3z" fill="url(#fg-gold)" stroke="#eee0ba" stroke-width="1.3"/>
      <path d="M8 5h8v2.5a4 4 0 0 1-8 0V5z" fill="url(#fg-crimson)"/>
      <path d="M12 13v5M8 20h8" stroke="url(#fg-gold)" stroke-width="2" stroke-linecap="round"/>
    `,
    skull: `
      <path d="M12 3a7.5 7.5 0 0 0-7.5 7.5c0 2.8 1.5 5.2 3.5 6.5V20h8v-3c2-1.3 3.5-3.7 3.5-6.5A7.5 7.5 0 0 0 12 3z" fill="url(#fg-steel)" stroke="#1e293b" stroke-width="1.3"/>
      <circle cx="9.2" cy="11" r="1.8" fill="#0f172a"/>
      <circle cx="14.8" cy="11" r="1.8" fill="#0f172a"/>
      <path d="M10 17v3M12 17v3M14 17v3" stroke="#0f172a" stroke-width="1.2"/>
    `,
    coin: `
      <circle cx="12" cy="12" r="8.5" fill="url(#fg-gold)" stroke="#eee0ba" stroke-width="1.4"/>
      <circle cx="12" cy="12" r="6" fill="none" stroke="#92400e" stroke-width="1" stroke-dasharray="2 1"/>
      <polygon points="12,7.5 14.5,12 12,16.5 9.5,12" fill="#eee0ba"/>
    `,
    bag: `
      <path d="M8 7h8l3 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2l3-11z" fill="#92400e" stroke="url(#fg-gold)" stroke-width="1.5"/>
      <path d="M9 7c0-2 1.3-3.5 3-3.5S15 5 15 7" fill="none" stroke="url(#fg-gold)" stroke-width="1.6"/>
      <rect x="10.5" y="11" width="3" height="3.5" rx="0.8" fill="url(#fg-gold)"/>
    `,
    tree: `
      <circle cx="12" cy="5" r="2.5" fill="url(#fg-gold)"/>
      <circle cx="6.5" cy="13" r="2.2" fill="url(#fg-arcane)"/>
      <circle cx="17.5" cy="13" r="2.2" fill="url(#fg-crimson)"/>
      <circle cx="12" cy="19" r="2.5" fill="url(#fg-emerald)"/>
      <path d="M12 7.5L7.5 11M12 7.5l4.5 3.5M7.5 15l4.5 2M16.5 15l-4.5 2" stroke="url(#fg-gold)" stroke-width="1.5"/>
    `,
    hourglass: `
      <path d="M6 3h12M6 21h12M7.5 3v4.5L12 12l-4.5 4.5V21h9v-4.5L12 12l4.5-4.5V3h-9z" fill="url(#fg-arcane)" stroke="url(#fg-gold)" stroke-width="1.4" stroke-linejoin="round"/>
    `,
    str: `
      <path d="M5 14l4-4 3 3 5-6 2 2-7 8-3-3-2 2-2-2z" fill="url(#fg-crimson)"/>
      <circle cx="16" cy="7" r="3.5" fill="url(#fg-gold)" stroke="#78350f" stroke-width="1"/>
      <path d="M4 19h16" stroke="url(#fg-gold)" stroke-width="2" stroke-linecap="round"/>
    `,
    agi: `
      <path d="M4 16l6-2 9-9-3 8 4 1-11 6 1-4-6 0z" fill="url(#fg-emerald)" stroke="#bbf7d0" stroke-width="1" stroke-linejoin="round"/>
    `,
    int: `
      <polygon points="12,2 19,9 12,22 5,9" fill="url(#fg-arcane)" stroke="#e0f2fe" stroke-width="1.2"/>
      <polyline points="5,9 12,12 19,9" fill="none" stroke="#e0f2fe" stroke-width="1.1"/>
      <line x1="12" y1="2" x2="12" y2="22" stroke="#e0f2fe" stroke-width="1.1"/>
    `,
    sound_on: `
      <polygon points="4,9 8,9 13,4 13,20 8,15 4,15" fill="url(#fg-gold)"/>
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="url(#fg-gold)" stroke-width="1.8" stroke-linecap="round"/>
    `,
    sound_off: `
      <polygon points="4,9 8,9 13,4 13,20 8,15 4,15" fill="url(#fg-steel)"/>
      <path d="M16 9l5 6M21 9l-5 6" stroke="url(#fg-crimson)" stroke-width="2" stroke-linecap="round"/>
    `,
    chat: `
      <path d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="url(#fg-gold)" stroke="#eee0ba" stroke-width="1.2"/>
      <circle cx="8.5" cy="11.5" r="1.2" fill="#451a03"/>
      <circle cx="12" cy="11.5" r="1.2" fill="#451a03"/>
      <circle cx="15.5" cy="11.5" r="1.2" fill="#451a03"/>
    `,
    lock: `
      <rect x="5" y="11" width="14" height="10" rx="2" fill="url(#fg-steel)" stroke="url(#fg-gold)" stroke-width="1.4"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="url(#fg-gold)" stroke-width="1.8"/>
      <circle cx="12" cy="16" r="1.5" fill="#0f172a"/>
    `,
    key: `
      <circle cx="8" cy="12" r="4.5" fill="none" stroke="url(#fg-gold)" stroke-width="2"/>
      <path d="M12.5 12H21v3h-2v-3h-2v2.5" fill="none" stroke="url(#fg-gold)" stroke-width="2" stroke-linecap="round"/>
    `,
    trophy: `
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" fill="url(#fg-gold)" stroke="#eee0ba" stroke-width="1.3"/>
      <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" fill="none" stroke="url(#fg-gold)" stroke-width="1.5"/>
      <path d="M12 14v4M8 20h8" stroke="url(#fg-gold)" stroke-width="2" stroke-linecap="round"/>
    `,
    reset: `
      <path d="M4 12a8 8 0 1 1 2.3 5.7M4 12V7m0 5h5" fill="none" stroke="url(#fg-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    chest: `
      <rect x="3" y="8" width="18" height="12" rx="2" fill="#78350f" stroke="url(#fg-gold)" stroke-width="1.5"/>
      <path d="M3 13h18" stroke="url(#fg-gold)" stroke-width="1.6"/>
      <rect x="10.5" y="11" width="3" height="4" rx="0.8" fill="url(#fg-gold)"/>
    `,
    warning: `
      <polygon points="12,3 22,20 2,20" fill="url(#fg-gold)" stroke="#78350f" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M12 9v5" stroke="#1e1b4b" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="17" r="1.2" fill="#1e1b4b"/>
    `
  };

  // Semantic aliases
  PATHS.arrow = PATHS.ranged;
  PATHS.bow = PATHS.ranged;
  PATHS.snare = PATHS.shield;
  PATHS.wind = PATHS.smoke;

  // Map emojis & semantic names to icon keys
  const EMOJI_MAP = {
    '⚔️': 'sword',
    '🗡️': 'dagger',
    '🔪': 'dagger',
    '🔨': 'hammer',
    '⚒️': 'hammer',
    '🛡️': 'shield',
    '🏰': 'fortress',
    '☀️': 'sun',
    '🌟': 'spark',
    '✨': 'spark',
    '⭐': 'spark',
    '🔥': 'fire',
    '🌋': 'fire',
    '☄️': 'blast',
    '💥': 'blast',
    '❄️': 'frost',
    '🧊': 'frost',
    '🔮': 'orb',
    '⚡': 'lightning',
    '🌪️': 'smoke',
    '💨': 'smoke',
    '🧪': 'flask',
    '🍷': 'chalice',
    '🌸': 'flask',
    '👤': 'shadow',
    '👻': 'shadow',
    '🌑': 'shadow',
    '🎯': 'target',
    '🏹': 'ranged',
    '🩸': 'blood',
    '💔': 'blood',
    '❤️': 'blood',
    '🪄': 'staff',
    '📖': 'book',
    '📜': 'scroll',
    '🦺': 'armor',
    '🥋': 'armor',
    '🧥': 'armor',
    '👕': 'armor',
    '👟': 'agi',
    '💍': 'ring',
    '👑': 'crown',
    '📿': 'amulet',
    '🔶': 'int',
    '💎': 'int',
    '💀': 'skull',
    '☠️': 'skull',
    '🪙': 'coin',
    '🛒': 'bag',
    '🎒': 'bag',
    '🎁': 'chest',
    '🏺': 'chalice',
    '🌿': 'tree',
    '🌵': 'shield',
    '🦂': 'dagger',
    '🐍': 'flask',
    '⏳': 'hourglass',
    '💫': 'hourglass',
    '💪': 'str',
    '🏃': 'agi',
    '🧠': 'int',
    '🔊': 'sound_on',
    '🔇': 'sound_off',
    '💬': 'chat',
    '🔒': 'lock',
    '🗝️': 'key',
    '🏆': 'trophy',
    '🎉': 'trophy',
    '🔄': 'reset',
    '⚠️': 'warning',
    '📍': 'target',
    '🟢': 'spark',
    '🔴': 'fire',
    '⬅️': 'sword'
  };

  function resolveKey(keyOrEmoji) {
    if (!keyOrEmoji) return 'sword';
    const trimmed = String(keyOrEmoji).trim();
    if (PATHS[trimmed]) return trimmed;
    if (EMOJI_MAP[trimmed]) return EMOJI_MAP[trimmed];
    // Search if string starts with any mapped emoji
    for (const [emo, k] of Object.entries(EMOJI_MAP)) {
      if (trimmed.includes(emo)) return k;
    }
    return 'sword';
  }

  let spriteReady = false;
  function mountSprite() {
    if (spriteReady) return;
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    host.id = 'game-icon-sprite'; host.setAttribute('aria-hidden','true');
    host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    host.innerHTML = DEFS + Object.entries(PATHS).map(([key, body]) => '<symbol id="gi-'+key+'" viewBox="0 0 24 24">'+body+'</symbol>').join('');
    document.body.prepend(host); spriteReady = true;
  }
  function svg(keyOrEmoji, className = 'fantasy-icon') {
    mountSprite();
    const k = resolveKey(keyOrEmoji);
    return '<span class="'+className+'" data-glyph="'+k+'" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" focusable="false"><use href="#gi-'+k+'"/></svg></span>';
  }

  // Strip emojis from any label/tag and optionally prepend its corresponding SVG icon
  function formatTag(rawText) {
    if (!rawText) return '';
    let str = String(rawText);
    let matchedKey = null;
    for (const [emo, k] of Object.entries(EMOJI_MAP)) {
      if (str.includes(emo)) {
        if (!matchedKey) matchedKey = k;
        str = str.split(emo).join('');
      }
    }
    // Strip any leftover unicode emoji range just in case
    str = str.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim();
    if (matchedKey) {
      return `${svg(matchedKey, 'fantasy-icon icon-xs')} <span>${str}</span>`;
    }
    return `<span>${str}</span>`;
  }

  function cleanText(rawText) {
    if (!rawText) return '';
    let str = String(rawText);
    for (const emo of Object.keys(EMOJI_MAP)) {
      str = str.split(emo).join('');
    }
    return str.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();
  }

  return {
    svg,
    resolveKey,
    formatTag,
    cleanText
  };
})();
