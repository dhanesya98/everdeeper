/**
 * EVER DEEPER II: 3D Procedural Mesh, Character Rigging, Props & VFX Engine (Three.js)
 * Builds detailed dark-fantasy characters, monsters, bosses, NPCs, architectural props & 3D skill VFX.
 */

window.GameModels = (function() {
  const materials = {};

  function getMat(color, opts = {}) {
    const key = color + '_' + JSON.stringify(opts);
    if (!materials[key]) {
      materials[key] = new THREE.MeshStandardMaterial({
        color: color,
        roughness: opts.roughness !== undefined ? opts.roughness : 0.55,
        metalness: opts.metalness !== undefined ? opts.metalness : 0.25,
        emissive: opts.emissive || 0x000000,
        emissiveIntensity: opts.emissiveIntensity || 0.0,
        wireframe: opts.wireframe || false,
        transparent: opts.transparent || false,
        opacity: opts.opacity !== undefined ? opts.opacity : 1.0,
        flatShading: true
      });
    }
    materials[key].userData.sharedModelMaterial = true;
    return materials[key];
  }

  // --- HERO CHARACTER FACTORY ---

  function createHero(classId) {
    const group = new THREE.Group();
    group.name = 'hero_' + classId;

    const bodyRoot = new THREE.Group();
    group.add(bodyRoot);
    group.bodyRoot = bodyRoot;

    // Ground shadow & subtle class aura ring
    const shadowGeo = new THREE.CircleGeometry(0.48, 20);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    let classAuraColor = 0xef4444;
    if (classId === 'mage') classAuraColor = 0x38bdf8;
    if (classId === 'rogue') classAuraColor = 0x22c55e;
    if (classId === 'archer') classAuraColor = 0xf59e0b;

    const heroRing = new THREE.Mesh(
      new THREE.RingGeometry(0.38, 0.45, 24),
      new THREE.MeshBasicMaterial({ color: classAuraColor, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    heroRing.rotation.x = -Math.PI / 2;
    heroRing.position.y = 0.03;
    group.add(heroRing);
    group.heroRing = heroRing;

    // Armored Boots & Legs
    const legGeo = new THREE.BoxGeometry(0.17, 0.46, 0.19);
    const bootGeo = new THREE.BoxGeometry(0.19, 0.18, 0.25);
    const legMat = getMat(0x231b1e, { roughness: 0.7 });
    const bootMat = getMat(0x3a2d28, { metalness: 0.5, roughness: 0.4 });

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.15, 0.25, 0);
    const lThigh = new THREE.Mesh(legGeo, legMat);
    const lBoot = new THREE.Mesh(bootGeo, bootMat);
    lBoot.position.set(0, -0.16, 0.03);
    leftLeg.add(lThigh);
    leftLeg.add(lBoot);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.15, 0.25, 0);
    const rThigh = new THREE.Mesh(legGeo, legMat);
    const rBoot = new THREE.Mesh(bootGeo, bootMat);
    rBoot.position.set(0, -0.16, 0.03);
    rightLeg.add(rThigh);
    rightLeg.add(rBoot);

    group.add(leftLeg);
    group.add(rightLeg);
    group.leftLeg = leftLeg;
    group.rightLeg = rightLeg;

    // Torso & Layered Armor
    let armorColor = 0x68656e; // Vanguard polished steel
    let trimColor = 0xd49b28;  // Gold trim
    let capeColor = 0x8f1d1d;  // Crimson cape

    if (classId === 'mage') {
      armorColor = 0x1e2442; // Astral cobalt robe
      trimColor = 0xf59e0b;  // Solar gold trim
      capeColor = 0x311b47;  // Royal mystic mantle
    } else if (classId === 'rogue') {
      armorColor = 0x1b2621; // Nightshade leather
      trimColor = 0x10b981;  // Venom emerald
      capeColor = 0x111714;  // Shadow cloak
    } else if (classId === 'archer') {
      armorColor = 0x253320; // Deep woodland olive
      trimColor = 0xd97706;  // Sunlit amber & brass
      capeColor = 0x38271d;  // Hunter mantle
    }

    const torsoGeo = new THREE.BoxGeometry(0.48, 0.56, 0.28);
    const torso = new THREE.Mesh(torsoGeo, getMat(armorColor, { roughness: 0.4, metalness: classId === 'warrior' ? 0.75 : 0.25 }));
    torso.position.y = 0.76;
    bodyRoot.add(torso);
    group.torso = torso;

    // Chest Emblem / Breastplate Trim
    const chestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.34, 0.31),
      getMat(trimColor, { metalness: 0.8, roughness: 0.25 })
    );
    chestPlate.position.set(0, 0.82, 0.01);
    bodyRoot.add(chestPlate);

    // Belt & Buckle
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.51, 0.1, 0.31), getMat(0x2b1d14));
    belt.position.y = 0.52;
    bodyRoot.add(belt);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.33), getMat(0xeab308, { metalness: 0.9 }));
    buckle.position.y = 0.52;
    bodyRoot.add(buckle);

    // Flowing Heroic Cape
    const capeGeo = new THREE.BoxGeometry(0.46, 0.78, 0.05);
    const cape = new THREE.Mesh(capeGeo, getMat(capeColor, { roughness: 0.8 }));
    cape.position.set(0, 0.66, -0.17);
    cape.rotation.x = 0.14;
    bodyRoot.add(cape);
    group.cape = cape;

    // Head & Class Headgear
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.24, 0);
    bodyRoot.add(headGroup);
    group.headGroup = headGroup;

    const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const head = new THREE.Mesh(headGeo, getMat(0xdfc0a3));
    headGroup.add(head);

    if (classId === 'warrior') {
      // Greathelm with Golden Visor & Plume
      const helm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.36, 0.35), getMat(0x525059, { metalness: 0.85, roughness: 0.25 }));
      headGroup.add(helm);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.08, 0.37), getMat(0xd49b28, { metalness: 0.9 }));
      visor.position.set(0, 0.02, 0.01);
      headGroup.add(visor);

      const eyeSlit = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.38), getMat(0xffaa33, { emissive: 0xff6600, emissiveIntensity: 0.9 }));
      eyeSlit.position.set(0, 0.02, 0.01);
      headGroup.add(eyeSlit);

      const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.44), getMat(0xdc2626));
      crest.position.set(0, 0.24, -0.02);
      headGroup.add(crest);

      // Layered Pauldrons
      const pGeo = new THREE.BoxGeometry(0.26, 0.2, 0.28);
      const leftP = new THREE.Mesh(pGeo, getMat(0x74717a, { metalness: 0.8 }));
      leftP.position.set(-0.36, 0.96, 0);
      leftP.rotation.z = 0.2;
      const rightP = leftP.clone();
      rightP.position.x = 0.36;
      rightP.rotation.z = -0.2;
      bodyRoot.add(leftP);
      bodyRoot.add(rightP);
    } else if (classId === 'mage') {
      // Ornate Archmage Hood & Crownlet
      const hoodGeo = new THREE.ConeGeometry(0.32, 0.48, 6);
      const hood = new THREE.Mesh(hoodGeo, getMat(0x281e4a));
      hood.position.set(0, 0.26, -0.03);
      headGroup.add(hood);

      const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 6, 16), getMat(0xfacc15, { metalness: 0.9, emissive: 0xd97706, emissiveIntensity: 0.4 }));
      circlet.rotation.x = Math.PI / 2;
      circlet.position.y = 0.1;
      headGroup.add(circlet);

      // Glowing Arcane Eyes
      const eyeMat = getMat(0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 1.0 });
      const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.05), eyeMat);
      leftEye.position.set(-0.07, 0.01, 0.16);
      const rightEye = leftEye.clone();
      rightEye.position.x = 0.07;
      headGroup.add(leftEye);
      headGroup.add(rightEye);
    } else if (classId === 'rogue') {
      // Assassin Cowl, Mask & Glowing Emerald Eyes
      const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), getMat(0x18221d));
      headGroup.add(cowl);

      const mask = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.36), getMat(0x0f1412));
      mask.position.set(0, -0.07, 0.01);
      headGroup.add(mask);

      const eyeMat = getMat(0x4ade80, { emissive: 0x22c55e, emissiveIntensity: 1.0 });
      const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.05), eyeMat);
      leftEye.position.set(-0.07, 0.03, 0.17);
      const rightEye = leftEye.clone();
      rightEye.position.x = 0.07;
      headGroup.add(leftEye);
      headGroup.add(rightEye);
    } else if (classId === 'archer') {
      // Ranger Cowl, Hood & Hawk Eyes
      const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.35, 0.34), getMat(0x1a2617));
      headGroup.add(cowl);

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.36), getMat(0xd97706, { metalness: 0.8 }));
      brow.position.set(0, 0.08, 0.02);
      headGroup.add(brow);

      // Glowing Hunter Eyes (Hawk Vision Amber)
      const eyeMat = getMat(0xfbbf24, { emissive: 0xf59e0b, emissiveIntensity: 1.0 });
      const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.035, 0.05), eyeMat);
      leftEye.position.set(-0.07, 0.02, 0.17);
      const rightEye = leftEye.clone();
      rightEye.position.x = 0.07;
      headGroup.add(leftEye);
      headGroup.add(rightEye);

      // Leather Quiver Strap over chest
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.62, 0.31), getMat(0x382013));
      strap.position.set(0.04, 0.76, 0.01);
      strap.rotation.z = -0.42;
      bodyRoot.add(strap);

      // Back Quiver with Arrows
      const quiver = new THREE.Group();
      quiver.position.set(0.12, 0.82, -0.2);
      quiver.rotation.z = 0.25;
      quiver.rotation.x = -0.15;
      const qBody = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.048, 0.52, 8), getMat(0x382013));
      const qRim = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.08, 8), getMat(0xd97706, { metalness: 0.8 }));
      qRim.position.y = 0.22;
      quiver.add(qBody, qRim);

      // 4 Golden-Fletched Arrows in Quiver
      for (let i = 0; i < 4; i++) {
        const aShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 6), getMat(0x78350f));
        const aFletch = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.07, 4), getMat(0xfef08a, { emissive: 0xf59e0b, emissiveIntensity: 0.6 }));
        aFletch.position.y = 0.16;
        const arrowMesh = new THREE.Group();
        arrowMesh.position.set((i % 2 - 0.5) * 0.045, 0.32, (Math.floor(i / 2) - 0.5) * 0.045);
        arrowMesh.rotation.z = (i - 1.5) * 0.08;
        arrowMesh.add(aShaft, aFletch);
        quiver.add(arrowMesh);
      }
      bodyRoot.add(quiver);
    }

    // Arms
    const rightArm = new THREE.Group();
    rightArm.position.set(0.36, 0.88, 0);
    bodyRoot.add(rightArm);
    group.rightArm = rightArm;

    const rLimb = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), getMat(armorColor));
    rLimb.position.y = -0.15;
    rightArm.add(rLimb);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.36, 0.88, 0);
    bodyRoot.add(leftArm);
    group.leftArm = leftArm;

    const lLimb = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), getMat(armorColor));
    lLimb.position.y = -0.15;
    leftArm.add(lLimb);

    // MASTERWORK WEAPONS & OFFHANDS
    if (classId === 'warrior') {
      // Sun-Etched Broadsword
      const sword = new THREE.Group();
      sword.position.set(0, -0.28, 0.24);
      sword.rotation.x = Math.PI / 4;

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.88, 0.03), getMat(0xe2e8f0, { metalness: 0.9, roughness: 0.15 }));
      blade.position.y = 0.4;
      const runeCore = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.65, 0.04), getMat(0xfbbf24, { emissive: 0xf59e0b, emissiveIntensity: 0.6 }));
      runeCore.position.y = 0.36;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.16, 4), getMat(0xe2e8f0, { metalness: 0.9 }));
      tip.rotation.y = Math.PI / 4;
      tip.position.y = 0.92;
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.08), getMat(0xd49b28, { metalness: 0.85 }));
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8), getMat(0x451a03));
      handle.position.y = -0.12;
      const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(0.055), getMat(0xd49b28, { metalness: 0.9 }));
      pommel.position.y = -0.24;

      sword.add(blade, runeCore, tip, guard, handle, pommel);
      rightArm.add(sword);
      group.weapon = sword;

      // Ornate Lion Bastion Shield
      const shield = new THREE.Group();
      shield.position.set(-0.04, -0.14, 0.2);
      shield.rotation.y = -Math.PI / 6;
      const sFace = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.64, 0.06), getMat(0x334155, { metalness: 0.75 }));
      const sRim = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.68, 0.04), getMat(0xd49b28, { metalness: 0.85 }));
      sRim.position.z = -0.01;
      const sBoss = new THREE.Mesh(new THREE.OctahedronGeometry(0.1), getMat(0xfbbf24, { emissive: 0xd97706, emissiveIntensity: 0.5 }));
      sBoss.position.z = 0.04;
      shield.add(sFace, sRim, sBoss);
      leftArm.add(shield);
      group.shield = shield;
    } else if (classId === 'mage') {
      // Solar Astrolabe Staff
      const staff = new THREE.Group();
      staff.position.set(0, -0.2, 0.25);
      staff.rotation.x = Math.PI / 10;

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.025, 1.45, 8), getMat(0x452719));
      const headRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 8, 20), getMat(0xfbbf24, { metalness: 0.9 }));
      headRing.position.y = 0.8;
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.11), getMat(0xfffbeb, { emissive: 0xf59e0b, emissiveIntensity: 1.0 }));
      crystal.position.y = 0.8;

      staff.add(shaft, headRing, crystal);
      rightArm.add(staff);
      group.weapon = staff;
      group.staffCrystal = crystal;
      group.staffRing = headRing;

      // Floating Spell Grimoire in Left Hand
      const tome = new THREE.Group();
      tome.position.set(-0.05, -0.1, 0.28);
      const cover = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.06), getMat(0x4c1d95));
      const pages = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.07), getMat(0xfef3c7, { emissive: 0xfde047, emissiveIntensity: 0.3 }));
      tome.add(cover, pages);
      leftArm.add(tome);
    } else if (classId === 'rogue') {
      // Twin Venom-Edged Sabers
      const createDagger = () => {
        const dGroup = new THREE.Group();
        const dBlade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.52, 0.02), getMat(0xe2e8f0, { metalness: 0.95 }));
        dBlade.position.y = 0.24;
        const venomEdge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.48, 0.028), getMat(0x4ade80, { emissive: 0x22c55e, emissiveIntensity: 0.8 }));
        venomEdge.position.set(0.02, 0.24, 0);
        const dHilt = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.05), getMat(0x10b981, { metalness: 0.8 }));
        dGroup.add(dBlade, venomEdge, dHilt);
        return dGroup;
      };
      const rDag = createDagger();
      rDag.position.set(0, -0.25, 0.22);
      rDag.rotation.x = Math.PI / 3;
      rightArm.add(rDag);

      const lDag = createDagger();
      lDag.position.set(0, -0.25, 0.22);
      lDag.rotation.x = Math.PI / 3;
      leftArm.add(lDag);
      group.weapon = rDag;
    } else if (classId === 'archer') {
      // Recurve Bow in Left Hand
      const bowGroup = new THREE.Group();
      bowGroup.position.set(-0.06, -0.15, 0.28);
      bowGroup.rotation.y = Math.PI / 4;
      bowGroup.rotation.z = 0.15;

      const woodMat = getMat(0x452311, { roughness: 0.6 });
      const goldTrim = getMat(0xd97706, { metalness: 0.85, roughness: 0.2 });

      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.18, 8), goldTrim);

      const upperLimb = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.015, 0.44, 8), woodMat);
      upperLimb.position.set(0.05, 0.25, 0);
      upperLimb.rotation.z = -0.25;

      const upperTip = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.008, 0.24, 8), goldTrim);
      upperTip.position.set(0.14, 0.52, 0);
      upperTip.rotation.z = -0.55;

      const lowerLimb = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.015, 0.44, 8), woodMat);
      lowerLimb.position.set(0.05, -0.25, 0);
      lowerLimb.rotation.z = 0.25;

      const lowerTip = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.008, 0.24, 8), goldTrim);
      lowerTip.position.set(0.14, -0.52, 0);
      lowerTip.rotation.z = 0.55;

      // Glowing Bowstring
      const stringMat = getMat(0xfef08a, { emissive: 0xf59e0b, emissiveIntensity: 0.7 });
      const bowString = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.28, 6), stringMat);
      bowString.position.set(0.18, 0, 0);

      bowGroup.add(grip, upperLimb, upperTip, lowerLimb, lowerTip, bowString);
      leftArm.add(bowGroup);
      group.weapon = bowGroup;

      // Nocked Sun Arrow in Right Hand
      const arrowGroup = new THREE.Group();
      arrowGroup.position.set(0, -0.18, 0.25);
      arrowGroup.rotation.x = Math.PI / 3;
      arrowGroup.rotation.y = -Math.PI / 6;

      const aShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.85, 6), getMat(0x78350f));
      aShaft.position.y = 0.25;
      const aHead = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 4), getMat(0xfef08a, { emissive: 0xf59e0b, emissiveIntensity: 1.0 }));
      aHead.position.y = 0.72;
      const aVanes = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.01), getMat(0xd97706));
      aVanes.position.y = -0.14;

      arrowGroup.add(aShaft, aHead, aVanes);
      rightArm.add(arrowGroup);
      group.arrow = arrowGroup;
    }

    // THE ICONIC SUN LANTERN (Lentera Surya)
    const lantern = new THREE.Group();
    lantern.name = 'sun_lantern';
    lantern.position.set(-0.28, 0.62, 0.18);

    const lCap = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.08, 6), getMat(0xd49b28, { metalness: 0.9 }));
    lCap.position.y = 0.12;
    const lBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.04, 6), getMat(0xd49b28, { metalness: 0.9 }));
    lBase.position.y = -0.1;
    const lGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.18, 8),
      getMat(0xffedd5, { transparent: true, opacity: 0.55, emissive: 0xff9900, emissiveIntensity: 0.6 })
    );
    const lCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.055),
      getMat(0xffffff, { emissive: 0xffb700, emissiveIntensity: 1.2 })
    );
    lantern.add(lCap, lBase, lGlass, lCore);
    bodyRoot.add(lantern);
    group.lantern = lantern;

    // Real-time Dynamic Sun Lantern Light
    const lanternLight = new THREE.PointLight(0xffa84c, 2.5, 13.5, 1.7);
    lanternLight.position.set(-0.28, 0.78, 0.25);
    lanternLight.castShadow = true;
    bodyRoot.add(lanternLight);
    group.lanternLight = lanternLight;

    group.animTime = 0;
    group.isMoving = false;
    group.isAttacking = false;
    group.attackProgress = 0;

    return group;
  }

  // --- INTERACTIVE NPC FACTORY (NEW!) ---

  function createNPC(npcType = 'kaelen_smith') {
    const kind = /eloria|alchemist/.test(npcType) ? 'alchemist' : /valen|lorekeeper/.test(npcType) ? 'lorekeeper' : /malakor|shade/.test(npcType) ? 'shade' : 'smith';
    const palette = {
      smith: [0x554334,0x9d6442,0xb5a17c,0xb49170],
      alchemist: [0x294d47,0x698a68,0xc2b692,0xd2ad88],
      lorekeeper: [0x344b63,0x768fa2,0xd1b880,0xb89a80],
      shade: [0x282e41,0x525c75,0xa9b2ce,0x18202d]
    }[kind];
    const group=new THREE.Group();group.name='npc_'+npcType;
    const body=new THREE.Group();group.bodyRoot=body;group.add(body);
    const cloth=getMat(palette[0],{roughness:.96,metalness:0});
    const accent=getMat(palette[1],{roughness:.85,metalness:0});
    const trim=getMat(palette[2],{roughness:.5,metalness:.5});
    const skin=getMat(palette[3],{roughness:.9,metalness:0});
    const dark=getMat(0x24262c,{roughness:.9,metalness:.1});
    const glow=getMat(kind==='shade'?0xb8c9df:kind==='alchemist'?0x9fcfab:0xe7c58a,{emissive:kind==='alchemist'?0x628b64:0x9c8160,emissiveIntensity:.5,metalness:0});
    const excluded=[];
    function box(w,h,d,x,y,z,mat,parent=body) {
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
    }
    function cone(rt,rb,h,s,x,y,z,mat,parent=body) {
      const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
    }
    // Separate boots, shoulders and hands make the silhouette readable at play distance.
    box(.17,.19,.28,-.12,.11,.04,dark);box(.17,.19,.28,.12,.11,.04,dark);
    cone(.22,.32,.72,7,0,.55,0,cloth);
    box(.48,.29,.3,0,.91,0,cloth);
    box(.18,.4,.18,-.31,.76,0,accent).rotation.z=-.18;
    box(.18,.4,.18,.31,.76,0,accent).rotation.z=.18;
    box(.13,.14,.15,-.34,.52,.04,skin);box(.13,.14,.15,.34,.52,.04,skin);
    box(.48,.06,.34,0,.65,.01,dark);
    box(.09,.09,.035,0,.65,.195,trim);
    cone(.16,.14,.26,6,0,1.21,0,skin);
    box(.29,.09,.26,0,1.36,-.02,dark);
    box(.065,.07,.065,0,1.2,.16,skin);
    box(.045,.025,.025,-.075,1.25,.148,dark);box(.045,.025,.025,.075,1.25,.148,dark);
    // Small badge and thin floor outline, without an additional point light.
    const badge=new THREE.Mesh(new THREE.OctahedronGeometry(.075),glow);badge.position.set(0,1.7,0);group.add(badge);group.phylactery=badge;excluded.push(badge);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.62,.64,24),getMat(palette[2],{emissive:palette[2],emissiveIntensity:.3}));
    ring.rotation.x=-Math.PI/2;ring.position.y=.025;group.add(ring);
    if(kind==='smith') {
      group.scale.set(1.12,1.03,1.08);
      box(.35,.59,.045,0,.6,.2,accent);
      box(.045,.36,.04,-.13,.98,.19,accent);box(.045,.36,.04,.13,.98,.19,accent);
      box(.21,.12,.05,0,.52,.235,cloth);
      for(const x of [-.12,.12])for(const y of [.42,.74])box(.025,.025,.025,x,y,.23,trim);
      cone(.15,.035,.25,5,0,1.06,.13,trim).rotation.x=.15;
      box(.12,.07,.055,-.085,1.27,.155,trim);box(.12,.07,.055,.085,1.27,.155,trim);
      box(.07,.035,.02,-.085,1.27,.19,dark);box(.07,.035,.02,.085,1.27,.19,dark);
      box(.16,.13,.35,-.28,1.02,0,trim);
      const hammer=new THREE.Group();hammer.position.set(.4,.62,.17);body.add(hammer);group.hammer=hammer;excluded.push(hammer);
      cone(.025,.025,.55,5,0,.14,0,dark,hammer);box(.3,.16,.17,0,.4,0,trim,hammer);
      box(.38,.13,.3,-.57,.1,.22,dark,group);box(.18,.22,.19,-.57,.25,.22,trim,group);
      box(.46,.12,.24,-.57,.41,.22,trim,group);
      const horn=cone(.08,.01,.23,4,-.87,.42,.22,trim,group);horn.rotation.z=Math.PI/2;
      box(.23,.035,.08,-.58,.49,.22,glow,group);
    } else if(kind==='alchemist') {
      box(.3,.5,.18,0,.84,-.22,accent); // herb satchel
      box(.38,.16,.38,0,1.04,0,accent);
      cone(.24,.27,.12,7,0,1.39,-.04,cloth);
      const hat=cone(.02,.23,.42,7,-.03,1.63,-.05,cloth);hat.rotation.z=.2;
      cone(.205,.23,.06,7,0,1.46,-.04,trim);
      for(const x of [-.18,.18]) {
        cone(.045,.065,.13,6,x,.6,.23,glow);cone(.025,.025,.055,5,x,.69,.23,trim);
      }
      box(.04,.5,.035,-.17,.92,.19,trim).rotation.z=-.12;
      for(let i=0;i<3;i++){const herb=cone(0,.06,.28,4,.17+(i-1)*.06,1.21,-.26,accent);herb.rotation.z=(i-1)*.4;}
      cone(.2,.15,.28,7,-.49,.2,.15,dark,group);
      const brew=new THREE.Mesh(new THREE.CircleGeometry(.18,12),glow);brew.rotation.x=-Math.PI/2;brew.position.set(-.49,.35,.15);group.add(brew);
      box(.05,.36,.045,-.44,.4,.12,trim,group).rotation.z=.4;
    } else if(kind==='lorekeeper') {
      group.scale.y=1.1;
      cone(.23,.4,.9,7,0,.51,-.055,cloth);
      box(.12,.78,.045,-.17,.65,.23,accent);box(.12,.78,.045,.17,.65,.23,accent);
      box(.52,.16,.33,0,1.01,0,accent);
      cone(.155,.17,.24,6,0,1.36,-.04,trim);
      box(.26,.045,.27,0,1.45,0,accent);
      cone(.04,.005,.26,5,0,1.03,.16,trim);
      const book=new THREE.Group();book.position.set(.34,.86,.28);book.rotation.set(-.35,-.4,.1);body.add(book);
      box(.4,.04,.29,0,0,0,dark,book);
      const left=box(.18,.035,.26,-.1,.04,0,trim,book);left.rotation.z=.16;
      const right=box(.18,.035,.26,.1,.04,0,trim,book);right.rotation.z=-.16;
      for(let i=0;i<3;i++)box(.11,.005,.008,.1,.065,-.07+i*.055,dark,book);
      cone(.025,.035,1.35,6,-.4,.69,.05,dark);
      const jewel=new THREE.Mesh(new THREE.OctahedronGeometry(.1),glow);jewel.position.set(-.4,1.4,.05);body.add(jewel);
    } else {
      const cloak=cone(.23,.42,.99,6,0,.6,-.1,cloth);cloak.rotation.z=-.07;
      box(.22,.69,.065,-.18,.72,.22,accent).rotation.z=-.16;
      cone(.12,.25,.35,6,0,1.4,-.055,cloth);
      box(.24,.23,.04,0,1.22,.16,dark);
      box(.05,.018,.02,-.065,1.26,.187,glow);box(.05,.018,.02,.065,1.26,.187,glow);
      box(.07,.07,.035,.19,1.02,.2,trim).rotation.z=Math.PI/4;
      const lantern=new THREE.Group();lantern.position.set(-.43,.66,.26);group.add(lantern);group.hammer=lantern;excluded.push(lantern);
      box(.17,.04,.17,0,-.13,0,trim,lantern);box(.17,.04,.17,0,.13,0,trim,lantern);
      box(.105,.22,.105,0,0,0,glow,lantern);
      for(const x of [-.065,.065])for(const z of [-.065,.065])box(.018,.25,.018,x,0,z,dark,lantern);
      cone(.035,.035,.15,4,0,.22,0,trim,lantern);
    }
    // Static geometry is merged into material batches instead of dozens of draw calls.
    excluded.filter(part => part.isGroup).forEach(part => GamePresentation.batchStatic(part));
    GamePresentation.batchStatic(group,excluded);
    group.animTime=0;return group;
  }


  // --- MONSTER & BOSS FACTORY ---

  function createMonster(modelType, isBoss = false) {
    const group = new THREE.Group();
    group.name = 'monster_' + modelType;
    group.isBoss = isBoss;

    const bodyRoot = new THREE.Group();
    group.add(bodyRoot);
    group.bodyRoot = bodyRoot;

    // Ground Shadow
    const shadowSize = isBoss ? 1.25 : 0.52;
    const shadowGeo = new THREE.CircleGeometry(shadowSize, 20);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    if (modelType === 'rat') {
      // Mutated Abyssal Dire Rat
      const ratBody = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.68, 7), getMat(0x4a3b32));
      ratBody.rotation.x = Math.PI / 2;
      ratBody.position.y = 0.22;
      bodyRoot.add(ratBody);

      const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), getMat(0x3d3028));
      haunch.position.set(0, 0.24, -0.15);
      bodyRoot.add(haunch);

      // Ears & Tail
      const earGeo = new THREE.BoxGeometry(0.1, 0.14, 0.04);
      const lEar = new THREE.Mesh(earGeo, getMat(0x7c5850));
      lEar.position.set(-0.14, 0.38, 0.12);
      const rEar = lEar.clone();
      rEar.position.x = 0.14;
      bodyRoot.add(lEar, rEar);

      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.55, 6), getMat(0x8c6258));
      tail.rotation.x = -Math.PI / 2.4;
      tail.position.set(0, 0.14, -0.52);
      bodyRoot.add(tail);

      // Glowing Dorsal Spines & Eyes
      const spineMat = getMat(0xdc2626, { emissive: 0x991b1b, emissiveIntensity: 0.5 });
      for (let s = 0; s < 3; s++) {
        const spine = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 4), spineMat);
        spine.position.set(0, 0.44, -0.18 + s * 0.14);
        bodyRoot.add(spine);
      }

      const eyeMat = getMat(0xff2222, { emissive: 0xff0000, emissiveIntensity: 1.0 });
      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 4), eyeMat);
      leftEye.position.set(-0.09, 0.26, 0.26);
      const rightEye = leftEye.clone();
      rightEye.position.x = 0.09;
      bodyRoot.add(leftEye, rightEye);

    } else if (modelType === 'spider') {
      // Abyssal Crystal-Back Spider
      const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), getMat(0x181326));
      abdomen.position.set(0, 0.32, -0.18);
      const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), getMat(0x2e2240));
      thorax.position.set(0, 0.25, 0.16);
      bodyRoot.add(abdomen, thorax);

      // Glowing Venom Crystal on Abdomen
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.14),
        getMat(0xa855f7, { emissive: 0x9333ea, emissiveIntensity: 0.9 })
      );
      crystal.position.set(0, 0.56, -0.18);
      bodyRoot.add(crystal);

      // Mandibles & Eyes
      const fangMat = getMat(0x4ade80, { emissive: 0x16a34a, emissiveIntensity: 0.6 });
      const lFang = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 4), fangMat);
      lFang.rotation.x = Math.PI / 2;
      lFang.position.set(-0.08, 0.2, 0.36);
      const rFang = lFang.clone();
      rFang.position.x = 0.08;
      bodyRoot.add(lFang, rFang);

      group.legs = [];
      for (let i = 0; i < 8; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const offset = Math.floor(i / 2) * 0.12 - 0.16;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.015, 0.52), getMat(0x110d19));
        leg.position.set(side * 0.28, 0.18, offset);
        leg.rotation.z = side * 0.78;
        bodyRoot.add(leg);
        group.legs.push(leg);
      }

    } else if (modelType === 'skeleton') {
      // Crypt Skeleton Vanguard
      const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.18), getMat(0xd6d0c4));
      pelvis.position.y = 0.42;
      const ribs = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 0.22), getMat(0xe5e0d5));
      ribs.position.y = 0.74;
      const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.14, 0.26), getMat(0x475569, { metalness: 0.7 }));
      pauldron.position.y = 0.94;
      const skull = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.26), getMat(0xf5f0e6));
      skull.position.y = 1.14;

      // Rusted Helmet Crown
      const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.15, 0.14, 6), getMat(0x52525b, { metalness: 0.8 }));
      helm.position.y = 1.3;

      const socketMat = getMat(0x38bdf8, { emissive: 0x0ea5e9, emissiveIntensity: 1.0 });
      const lEye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.03), socketMat);
      lEye.position.set(-0.06, 1.14, 0.14);
      const rEye = lEye.clone();
      rEye.position.x = 0.06;

      // Halberd & Shield
      const spear = new THREE.Group();
      spear.position.set(0.34, 0.65, 0.2);
      spear.rotation.x = Math.PI / 7;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4), getMat(0x5c4033));
      const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.03), getMat(0x94a3b8, { metalness: 0.85 }));
      axeBlade.position.set(0.06, 0.55, 0);
      spear.add(shaft, axeBlade);

      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 8), getMat(0x3f3f46, { metalness: 0.7 }));
      shield.rotation.x = Math.PI / 2;
      shield.position.set(-0.32, 0.68, 0.16);

      bodyRoot.add(pelvis, ribs, pauldron, skull, helm, lEye, rEye, spear, shield);

    } else if (modelType === 'troll') {
      // Abyssal Stone-Magma Troll
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.92, 0.62), getMat(0x3f4739, { roughness: 0.85 }));
      torso.position.y = 0.86;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), getMat(0x4d5745));
      head.position.set(0, 1.42, 0.12);

      // Tusks & Glowing Eyes
      const lTusk = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 4), getMat(0xfef3c7));
      lTusk.position.set(-0.12, 1.32, 0.34);
      const rTusk = lTusk.clone();
      rTusk.position.x = 0.12;

      const eyeMat = getMat(0xf97316, { emissive: 0xea580c, emissiveIntensity: 1.0 });
      const lEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.04), eyeMat);
      lEye.position.set(-0.1, 1.46, 0.34);
      const rEye = lEye.clone();
      rEye.position.x = 0.1;

      // Craggy Shoulder Rocks
      const rockL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), getMat(0x27272a));
      rockL.position.set(-0.5, 1.22, 0);
      const rockR = rockL.clone();
      rockR.position.x = 0.5;

      // Giant Iron-Spiked War Club
      const club = new THREE.Group();
      club.position.set(0.66, 0.8, 0.24);
      club.rotation.z = -Math.PI / 8;
      const cBody = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.06, 1.2, 7), getMat(0x3b2314));
      const cBand = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.15, 7), getMat(0x52525b, { metalness: 0.85 }));
      cBand.position.y = 0.35;
      club.add(cBody, cBand);

      bodyRoot.add(torso, head, lTusk, rTusk, lEye, rEye, rockL, rockR, club);

    } else if (modelType === 'ghost') {
      // Spectral Wraith of the Abyss
      const shroudMat = getMat(0x38bdf8, { transparent: true, opacity: 0.72, emissive: 0x0284c7, emissiveIntensity: 0.65 });
      const shroud = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.15, 8), shroudMat);
      shroud.position.y = 0.78;
      shroud.rotation.x = Math.PI;

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 10), shroudMat);
      head.position.y = 1.24;

      const eyeMat = getMat(0xffffff, { emissive: 0x7dd3fc, emissiveIntensity: 1.2 });
      const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), eyeMat);
      lEye.position.set(-0.08, 1.24, 0.22);
      const rEye = lEye.clone();
      rEye.position.x = 0.08;

      bodyRoot.add(shroud, head, lEye, rEye);

      // Orbiting Soul Wisps
      group.runes = [];
      for (let w = 0; w < 2; w++) {
        const wisp = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), eyeMat);
        bodyRoot.add(wisp);
        group.runes.push(wisp);
      }

    } else if (modelType === 'vampire') {
      // Crimson Blood Knight (Vampire Aristocrat)
      const armor = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.85, 0.32), getMat(0x450a0a, { metalness: 0.75, roughness: 0.3 }));
      armor.position.y = 0.68;

      const breastplate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.35), getMat(0x991b1b, { metalness: 0.8 }));
      breastplate.position.y = 0.82;

      const cape = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.95, 0.06), getMat(0x1f0505));
      cape.position.set(0, 0.68, -0.2);

      // High Gothic Collar & Noble Head
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.18, 0.22, 6, 1, true), getMat(0x7f1d1d, { side: THREE.DoubleSide }));
      collar.position.y = 1.18;

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.28), getMat(0xe2e8f0));
      head.position.y = 1.24;

      const eyeMat = getMat(0xff0000, { emissive: 0xff0000, emissiveIntensity: 1.0 });
      const lEye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.04), eyeMat);
      lEye.position.set(-0.07, 1.25, 0.15);
      const rEye = lEye.clone();
      rEye.position.x = 0.07;

      // Crimson Blood Greatsword
      const bloodSword = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.15, 0.04),
        getMat(0xdc2626, { emissive: 0x991b1b, emissiveIntensity: 0.7, metalness: 0.9 })
      );
      bloodSword.position.set(0.42, 0.78, 0.25);
      bloodSword.rotation.x = Math.PI / 6;

      bodyRoot.add(armor, breastplate, cape, collar, head, lEye, rEye, bloodSword);

    } else if (modelType === 'dragon') {
      // BOSS 1: YOUNG DRAGON OF THE ASH GATES
      const dBody = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.75, 1.5), getMat(0x7f1d1d, { roughness: 0.45 }));
      dBody.position.y = 0.8;
      bodyRoot.add(dBody);

      // Glowing Magma Belly Core
      const belly = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.3, 1.2), getMat(0xf97316, { emissive: 0xea580c, emissiveIntensity: 0.85 }));
      belly.position.set(0, 0.58, 0.05);
      bodyRoot.add(belly);

      // 4 Clawed Legs
      const legGeo = new THREE.BoxGeometry(0.26, 0.55, 0.28);
      const legMat = getMat(0x5c140e);
      [[-0.45, 0.45], [0.45, 0.45], [-0.45, -0.45], [0.45, -0.45]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.28, lz);
        bodyRoot.add(leg);
      });

      // Neck, Horned Head & Flaming Jaws
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.38), getMat(0x6e1f18));
      neck.position.set(0, 1.3, 0.55);
      neck.rotation.x = -Math.PI / 6;
      bodyRoot.add(neck);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.38, 0.65), getMat(0x8a2b22));
      head.position.set(0, 1.52, 0.88);
      bodyRoot.add(head);

      const hornGeo = new THREE.ConeGeometry(0.08, 0.45, 5);
      const hornMat = getMat(0x1c1917);
      const lHorn = new THREE.Mesh(hornGeo, hornMat);
      lHorn.position.set(-0.2, 1.8, 0.65);
      lHorn.rotation.x = -Math.PI / 3;
      const rHorn = lHorn.clone();
      rHorn.position.x = 0.2;
      bodyRoot.add(lHorn, rHorn);

      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.55), getMat(0xff9900, { emissive: 0xff5500, emissiveIntensity: 1.0 }));
      jaw.position.set(0, 1.38, 0.92);
      bodyRoot.add(jaw);

      // Spiked Tail
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.1, 6), getMat(0x6e1f18));
      tail.rotation.x = -Math.PI / 2.2;
      tail.position.set(0, 0.65, -1.15);
      bodyRoot.add(tail);

      // Articulated Dragon Wings
      const wingGeo = new THREE.BoxGeometry(1.45, 0.06, 0.85);
      const leftWing = new THREE.Mesh(wingGeo, getMat(0x450a0a));
      leftWing.position.set(-0.98, 1.18, 0);
      leftWing.rotation.z = Math.PI / 8;
      const rightWing = leftWing.clone();
      rightWing.position.x = 0.98;
      rightWing.rotation.z = -Math.PI / 8;
      bodyRoot.add(leftWing, rightWing);
      group.leftWing = leftWing;
      group.rightWing = rightWing;

    } else if (modelType === 'dark_king') {
      // BOSS 2: THE CURSED DARK KING OF FROZEN RUINS
      const armor = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.25, 0.48), getMat(0x1e293b, { metalness: 0.75, roughness: 0.25 }));
      armor.position.y = 0.92;
      const cape = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.35, 0.08), getMat(0x1e1b4b));
      cape.position.set(0, 0.85, -0.26);

      // Frost-Crystal Pauldrons
      const pMat = getMat(0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.5, metalness: 0.8 });
      const lPauldron = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26), pMat);
      lPauldron.position.set(-0.52, 1.42, 0);
      const rPauldron = lPauldron.clone();
      rPauldron.position.x = 0.52;

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), getMat(0x0f172a));
      head.position.y = 1.66;

      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.28, 6), getMat(0xfacc15, { metalness: 0.9, emissive: 0xca8a04, emissiveIntensity: 0.4 }));
      crown.position.y = 1.9;

      // Colossal Frostmourne-style Greatsword
      const sword = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 1.75, 0.06),
        getMat(0xbae6fd, { metalness: 0.9, emissive: 0x0ea5e9, emissiveIntensity: 0.7 })
      );
      sword.position.set(0.62, 0.95, 0.32);
      sword.rotation.z = -Math.PI / 10;

      bodyRoot.add(armor, cape, lPauldron, rPauldron, head, crown, sword);

    } else if (modelType === 'sorcerer') {
      // BOSS 3: EVIL SORCERER (ARCHITECT OF THE SOLAR SEAL)
      const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.65, 1.45, 8), getMat(0x3b0764));
      robe.position.y = 0.82;
      const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.66, 0.2, 8), getMat(0xfbbf24, { metalness: 0.85 }));
      trim.position.y = 0.2;
      const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.65, 6), getMat(0x1e1b4b));
      cowl.position.y = 1.65;

      // Eclipse Halo behind Sorcerer
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.04, 8, 24),
        getMat(0xc084fc, { emissive: 0x9333ea, emissiveIntensity: 0.9 })
      );
      halo.position.set(0, 1.45, -0.25);

      bodyRoot.add(robe, trim, cowl, halo);

      group.runes = [];
      for (let r = 0; r < 4; r++) {
        const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), getMat(0xe879f9, { emissive: 0xc026d3, emissiveIntensity: 1.0 }));
        bodyRoot.add(rune);
        group.runes.push(rune);
      }

    } else if (modelType === 'lich') {
      // BOSS 4: ANCIENT LICH OF THE CRYPTS
      const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.58, 1.2, 8), getMat(0x111827));
      robe.position.y = 0.6;
      const bones = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.88, 0.32), getMat(0xd6d3d1));
      bones.position.y = 1.05;
      const skull = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.38), getMat(0xf5f5f4));
      skull.position.y = 1.68;

      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.26, 6), getMat(0x10b981, { emissive: 0x059669, emissiveIntensity: 0.7 }));
      crown.position.y = 1.94;

      // Floating Phylactery Crystal
      const phylactery = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22), getMat(0x34d399, { emissive: 0x10b981, emissiveIntensity: 1.0 }));
      phylactery.position.set(0, 2.35, 0);
      bodyRoot.add(robe, bones, skull, crown, phylactery);
      group.phylactery = phylactery;

    } else if (modelType === 'mimic') {
      // --- ABYSSAL HUNGRY MIMIC (COMBAT FORM) ---
      const chestMat = getMat(0x381e14, { roughness: 0.8 });
      const bandMat = getMat(0x475569, { metalness: 0.85 });
      const toothMat = getMat(0xfef08a, { roughness: 0.3 });

      // Lower Jaw (Chest Base)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.36, 0.52), chestMat);
      base.position.set(0, 0.18, 0);
      bodyRoot.add(base);

      // Claws beneath base
      for (let c = 0; c < 4; c++) {
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 4), bandMat);
        claw.rotation.x = Math.PI / 3;
        claw.position.set(c % 2 === 0 ? -0.32 : 0.32, 0.05, c < 2 ? 0.22 : -0.22);
        bodyRoot.add(claw);
      }

      // Lower Teeth (6 ivory spikes pointing up)
      for (let t = 0; t < 6; t++) {
        const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), toothMat);
        tooth.position.set(-0.25 + t * 0.1, 0.38, 0.22);
        bodyRoot.add(tooth);
      }

      // Upper Jaw (Lid hinged back at wide 70-degree angle)
      const lidGroup = new THREE.Group();
      lidGroup.position.set(0, 0.36, -0.25);
      lidGroup.rotation.x = -Math.PI / 2.3; // gaping wide open maw
      const lid = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.18, 0.54), chestMat);
      lid.position.set(0, 0.09, 0.26);
      lidGroup.add(lid);

      // Upper Teeth (6 ivory spikes pointing down from upper jaw)
      for (let ut = 0; ut < 6; ut++) {
        const uTooth = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.13, 4), toothMat);
        uTooth.rotation.x = Math.PI;
        uTooth.position.set(-0.25 + ut * 0.1, -0.04, 0.5);
        lidGroup.add(uTooth);
      }
      bodyRoot.add(lidGroup);

      // Thrashing Abyssal Purple Tongue
      const tongue = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, 0.48, 8),
        getMat(0xa855f7, { emissive: 0x9333ea, emissiveIntensity: 0.6, roughness: 0.3 })
      );
      tongue.rotation.x = Math.PI / 3;
      tongue.position.set(0, 0.32, 0.24);
      bodyRoot.add(tongue);
      group.tongue = tongue;

      // Glowing Crimson Eyes inside Maw
      const eyeMat = getMat(0xff1111, { emissive: 0xef4444, emissiveIntensity: 1.5 });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 4), eyeMat);
      eyeL.position.set(-0.15, 0.3, -0.05);
      const eyeR = eyeL.clone();
      eyeR.position.x = 0.15;
      bodyRoot.add(eyeL, eyeR);

      const mawLight = new THREE.PointLight(0xef4444, 2.0, 4.0);
      mawLight.position.set(0, 0.35, 0.1);
      bodyRoot.add(mawLight);

    } else {
      // BOSS 5: SHADOW EMPEROR (FINAL BOSS OF THE VOID THRONE)
      const empArmor = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.62, 0.52), getMat(0x09090b, { metalness: 0.85, roughness: 0.2 }));
      empArmor.position.y = 1.0;

      const chestCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), getMat(0xfef08a, { emissive: 0xf59e0b, emissiveIntensity: 1.0 }));
      chestCore.position.set(0, 1.25, 0.28);

      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.65, 5), getMat(0xfbbf24, { emissive: 0xd97706, emissiveIntensity: 0.8 }));
      crown.position.y = 2.05;

      // Blazing Solar Eclipse Ring behind the Emperor
      const eclipseRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.06, 10, 32),
        getMat(0xf59e0b, { emissive: 0xff6600, emissiveIntensity: 1.0 })
      );
      eclipseRing.position.set(0, 1.45, -0.32);

      // Void Seraph Wings
      const wingGeo = new THREE.BoxGeometry(1.6, 0.12, 0.5);
      const wingMat = getMat(0x18181b, { emissive: 0x7c2d12, emissiveIntensity: 0.4 });
      const lWing = new THREE.Mesh(wingGeo, wingMat);
      lWing.position.set(-0.95, 1.35, -0.2);
      lWing.rotation.z = Math.PI / 6;
      const rWing = lWing.clone();
      rWing.position.x = 0.95;
      rWing.rotation.z = -Math.PI / 6;
      group.leftWing = lWing;
      group.rightWing = rWing;

      // Emperor's Sword of Eternal Night
      const sword = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 1.9, 0.06),
        getMat(0xfef08a, { emissive: 0xea580c, emissiveIntensity: 0.9 })
      );
      sword.position.set(0.68, 1.05, 0.35);
      sword.rotation.z = -Math.PI / 12;

      bodyRoot.add(empArmor, chestCore, crown, eclipseRing, lWing, rWing, sword);
    }

    group.animTime = 0;
    return group;
  }

  // --- ARCHITECTURAL & INTERACTIVE PROPS FACTORY ---

  function createChest() {
    const group = new THREE.Group();
    group.name = 'chest';

    // Ornate Wood & Gold Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.38, 0.48), getMat(0x452212));
    base.position.y = 0.19;
    group.add(base);

    // Gold Trim Bands & Lockplate
    const bandMat = getMat(0xeab308, { metalness: 0.9, roughness: 0.2 });
    const band1 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.4, 0.07), bandMat);
    band1.position.set(0, 0.19, 0.14);
    const band2 = band1.clone();
    band2.position.z = -0.14;
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.52), bandMat);
    lock.position.set(0, 0.32, 0);
    group.add(band1, band2, lock);

    // Inner Treasure Glow (visible when lid opens)
    const innerGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.56, 0.38),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide })
    );
    innerGlow.rotation.x = -Math.PI / 2;
    innerGlow.position.y = 0.36;
    group.add(innerGlow);

    // Hinged Domed Lid
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.38, -0.24);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.5), getMat(0x522815));
    lid.position.set(0, 0.09, 0.24);
    const lidRim = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.52), bandMat);
    lidRim.position.set(0, 0.03, 0.24);
    lidGroup.add(lid, lidRim);
    group.add(lidGroup);
    group.lidGroup = lidGroup;
    group.isOpen = false;

    return group;
  }

  function createLoreTablet() {
    const group = new THREE.Group();
    group.name = 'lore_tablet';

    // Stepped Stone Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.46), getMat(0x27272a));
    plinth.position.y = 0.08;
    group.add(plinth);

    // Carved Obelisk Monolith
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.15, 0.22), getMat(0x3f3f46));
    stone.position.y = 0.68;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.25, 4), getMat(0x52525b));
    cap.rotation.y = Math.PI / 4;
    cap.position.y = 1.38;
    group.add(stone, cap);

    // Glowing Golden Inscription & Liora's Red Ribbon
    const glyph = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.72, 0.02),
      getMat(0xfef08a, { emissive: 0xf59e0b, emissiveIntensity: 0.9 })
    );
    glyph.position.set(0, 0.72, 0.12);
    group.add(glyph);

    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.35, 0.04),
      getMat(0xef4444, { emissive: 0xdc2626, emissiveIntensity: 0.5 })
    );
    ribbon.position.set(0.28, 0.85, 0.08);
    ribbon.rotation.z = -0.25;
    group.add(ribbon);

    return group;
  }

  function createShrine() {
    const group = new THREE.Group();
    group.name = 'shrine';

    // Octagonal Stepped Altar
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.76, 0.2, 8), getMat(0x27272a));
    base1.position.y = 0.1;
    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.25, 8), getMat(0x3f3f46));
    base2.position.y = 0.32;
    group.add(base1, base2);

    // Golden Chalice Basin
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.28, 0.38, 8), getMat(0xd49b28, { metalness: 0.85, roughness: 0.2 }));
    basin.position.y = 0.62;
    group.add(basin);

    // Spinning Solar Halo Ring & Sacred Flame
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.025, 8, 24),
      getMat(0xfef08a, { emissive: 0xf59e0b, emissiveIntensity: 0.9 })
    );
    halo.position.y = 1.05;
    group.add(halo);
    group.lootBeam = halo; // spins slowly

    const flame = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.22),
      getMat(0xffffff, { emissive: 0xffaa00, emissiveIntensity: 1.2 })
    );
    flame.position.y = 1.05;
    group.add(flame);
    group.flame = flame;

    const shrineLight = new THREE.PointLight(0xffb733, 2.0, 7.5);
    shrineLight.position.y = 1.2;
    group.add(shrineLight);
    group.light = shrineLight;

    return group;
  }

  function createCursedAltar() {
    const group = new THREE.Group();
    group.name = 'cursed_altar';

    // Obsidian Dark Base
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, 0.22, 6), getMat(0x180f15));
    base1.position.y = 0.11;
    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.6, 0.28, 6), getMat(0x2d1425));
    base2.position.y = 0.35;
    group.add(base1, base2);

    // Dark Runic Altar Pillar
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 0.5, 6), getMat(0x3b0764, { metalness: 0.7, roughness: 0.3 }));
    pillar.position.y = 0.72;
    group.add(pillar);

    // Floating Cursed Dark Crystal
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.26),
      getMat(0xa855f7, { emissive: 0x7e22ce, emissiveIntensity: 1.4, roughness: 0.1 })
    );
    crystal.position.y = 1.25;
    group.add(crystal);
    group.flame = crystal;

    // Dark Void Aura Ring
    const voidRing = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.75, 18),
      new THREE.MeshBasicMaterial({ color: 0x9333ea, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    voidRing.rotation.x = -Math.PI / 2;
    voidRing.position.y = 0.05;
    group.add(voidRing);

    const darkLight = new THREE.PointLight(0xa855f7, 2.4, 8.0);
    darkLight.position.y = 1.3;
    group.add(darkLight);
    group.light = darkLight;

    return group;
  }

  function createCursedChest() {
    const group = new THREE.Group();
    group.name = 'cursed_chest';

    // Darkened Charcoal Wood Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.4, 0.5), getMat(0x1a0d13));
    base.position.y = 0.2;
    group.add(base);

    // Crimson/Purple Metal Chains wrapping chest
    const chainMat = getMat(0x991b1b, { metalness: 0.9, roughness: 0.2, emissive: 0x7f1d1d, emissiveIntensity: 0.4 });
    const chain1 = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 16), chainMat);
    chain1.rotation.y = Math.PI / 2;
    chain1.position.set(-0.16, 0.24, 0);
    const chain2 = chain1.clone();
    chain2.position.x = 0.16;
    group.add(chain1, chain2);

    // Glowing Blood Lock
    const lock = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.2, 0.54),
      getMat(0xef4444, { emissive: 0xdc2626, emissiveIntensity: 0.8 })
    );
    lock.position.set(0, 0.32, 0);
    group.add(lock);

    // Inner Cursed Void Glow
    const innerGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.56, 0.4),
      new THREE.MeshBasicMaterial({ color: 0xec4899, side: THREE.DoubleSide })
    );
    innerGlow.rotation.x = -Math.PI / 2;
    innerGlow.position.y = 0.38;
    group.add(innerGlow);

    // Hinged Domed Lid
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.4, -0.25);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.52), getMat(0x290d18));
    lid.position.set(0, 0.1, 0.25);
    const lidRim = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.07, 0.54), chainMat);
    lidRim.position.set(0, 0.04, 0.25);
    lidGroup.add(lid, lidRim);
    group.add(lidGroup);
    group.lidGroup = lidGroup;
    group.isOpen = false;

    // Glowing Dark Light
    const darkLight = new THREE.PointLight(0xef4444, 1.8, 6.0);
    darkLight.position.y = 0.5;
    group.add(darkLight);

    return group;
  }

function createMimicChest() {
    const group = new THREE.Group();
    group.name = 'chest';
    group.isMimic = true;

    // Gnarled, darker wood planks
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.38, 0.48), getMat(0x361c16, { roughness: 0.9 }));
    base.position.y = 0.19;
    group.add(base);

    // Weathered iron bands
    const bandMat = getMat(0x374151, { metalness: 0.85, roughness: 0.4 });
    const band1 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.4, 0.07), bandMat);
    band1.position.set(0, 0.19, 0.14);
    const band2 = band1.clone();
    band2.position.z = -0.14;
    group.add(band1, band2);

    // Subtle lock with blinking red eye inside keyhole (The Tell!)
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.52), bandMat);
    lock.position.set(0, 0.32, 0);
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 4),
      getMat(0xef4444, { emissive: 0xdc2626, emissiveIntensity: 1.2 })
    );
    eye.position.set(0, 0.32, 0.27);
    group.add(lock, eye);
    group.mimicEye = eye;

    const eyeLight = new THREE.PointLight(0xef4444, 0.6, 2.5);
    eyeLight.position.set(0, 0.32, 0.3);
    group.add(eyeLight);
    group.mimicEyeLight = eyeLight;

    // Subtle faint purple void vapor plane at ground
    const voidVapor = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.42, 16),
      new THREE.MeshBasicMaterial({ color: 0x9333ea, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    voidVapor.rotation.x = -Math.PI / 2;
    voidVapor.position.y = 0.02;
    group.add(voidVapor);

    // Hinged Domed Lid
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.38, -0.24);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.5), getMat(0x42221b));
    lid.position.set(0, 0.09, 0.24);
    const lidRim = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.52), bandMat);
    lidRim.position.set(0, 0.03, 0.24);
    lidGroup.add(lid, lidRim);
    group.add(lidGroup);
    group.lidGroup = lidGroup;
    group.isOpen = false;

    return group;
  }

  function createBountyBoard() {
    const group = new THREE.Group();
    group.name = 'bounty_board';

    // Stone Foundation
    const stoneBase = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.65), getMat(0x1e293b, { roughness: 0.9 }));
    stoneBase.position.y = 0.08;
    group.add(stoneBase);

    // Thick Timber Post
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.6, 0.18), getMat(0x451a03));
    post.position.y = 0.88;
    group.add(post);

    // Notice Board Panel (Wooden backing)
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.08), getMat(0x78350f));
    board.position.set(0, 1.25, 0.1);
    group.add(board);

    const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.86, 0.04), getMat(0x27272a, { metalness: 0.8 }));
    boardFrame.position.set(0, 1.25, 0.08);
    group.add(boardFrame);

    // Nailed Parchment Posters
    const paperMat1 = getMat(0xfef3c7, { roughness: 0.7 });
    const poster1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.02), paperMat1);
    poster1.position.set(-0.24, 1.26, 0.15);
    poster1.rotation.z = 0.04;

    const skullIcon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.08),
      getMat(0xef4444, { emissive: 0xdc2626, emissiveIntensity: 0.8 })
    );
    skullIcon.position.set(-0.24, 1.36, 0.17);

    const poster2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.46, 0.02), getMat(0xfde68a));
    poster2.position.set(0.24, 1.24, 0.15);
    poster2.rotation.z = -0.06;

    group.add(poster1, skullIcon, poster2);

    // Lantern Bracket & Glowing Amber Lantern
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.35), getMat(0x334155, { metalness: 0.9 }));
    arm.position.set(0.42, 1.68, 0.2);
    group.add(arm);

    const lantern = new THREE.Group();
    lantern.position.set(0.42, 1.52, 0.34);
    const lFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.18, 6), getMat(0x1e293b, { metalness: 0.9 }));
    const lGlow = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), getMat(0xfef08a, { emissive: 0xf59e0b, emissiveIntensity: 1.5 }));
    lantern.add(lFrame, lGlow);
    group.add(lantern);
    group.bountyLantern = lantern;

    const lanternLight = new THREE.PointLight(0xf59e0b, 2.0, 6.0);
    lanternLight.position.set(0.42, 1.52, 0.34);
    group.add(lanternLight);

    return group;
  }

  function createBountyAura() {
    const group = new THREE.Group();
    group.name = 'bounty_aura';

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 1.15, 24),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    group.add(ring);

    // 4 Corner Skull Markers
    const gemGeo = new THREE.OctahedronGeometry(0.09);
    const gemMat = getMat(0xff2222, { emissive: 0xdc2626, emissiveIntensity: 1.2 });
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.set(Math.cos(angle) * 0.9, 0.1, Math.sin(angle) * 0.9);
      group.add(gem);
    }

    const light = new THREE.PointLight(0xef4444, 2.2, 5.5);
    light.position.y = 0.5;
    group.add(light);

    group.bountyAura = ring;
    return group;
  }

  function createStairs() {
    const group = new THREE.Group();
    group.name = 'stairs';

    // Stone Stairwell Frame
    const rim = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.16, 1.32), getMat(0x27272a));
    rim.position.y = 0.08;
    group.add(rim);

    // Twin Gateway Pillars on Left & Right
    const pGeo = new THREE.CylinderGeometry(0.12, 0.15, 1.35, 8);
    const pMat = getMat(0x3f3f46, { metalness: 0.4 });
    const leftP = new THREE.Mesh(pGeo, pMat);
    leftP.position.set(-0.54, 0.68, -0.45);
    const rightP = leftP.clone();
    rightP.position.x = 0.54;
    group.add(leftP, rightP);

    // Descending Steps Visual
    for (let s = 0; s < 3; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.28), getMat(0x18181b));
      step.position.set(0, 0.12 - s * 0.04, -0.3 + s * 0.3);
      group.add(step);
    }

    // Glowing Abyss Portal Surface
    const hole = new THREE.Mesh(
      new THREE.PlaneGeometry(1.04, 1.04),
      new THREE.MeshBasicMaterial({ color: 0x090d16 })
    );
    hole.rotation.x = -Math.PI / 2;
    hole.position.y = 0.17;
    group.add(hole);

    // Portal Rune Ring
    const portalRing = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.46, 20),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    portalRing.rotation.x = -Math.PI / 2;
    portalRing.position.y = 0.19;
    group.add(portalRing);
    group.eliteAura = portalRing;

    const light = new THREE.PointLight(0x38bdf8, 1.5, 6);
    light.position.y = 0.6;
    group.add(light);

    return group;
  }

  function createTorch() {
    const group = new THREE.Group();
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.18), getMat(0x27272a, { metalness: 0.8 }));
    bracket.position.set(0, 0.35, 0.1);
    group.add(bracket);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.65, 6), getMat(0x451a03));
    pole.position.set(0, 0.5, 0.15);
    pole.rotation.x = 0.25;
    group.add(pole);

    const flame = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.09),
      getMat(0xffaa22, { emissive: 0xff5500, emissiveIntensity: 1.2 })
    );
    flame.position.set(0, 0.85, 0.22);
    group.add(flame);
    group.flame = flame;

    const light = new THREE.PointLight(0xff8822, 1.2, 6.5);
    light.position.set(0, 0.9, 0.25);
    group.add(light);
    group.light = light;

    return group;
  }

  function createPillar(wallColor = 0x3f3f46) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.52), getMat(wallColor, { roughness: 0.7 }));
    base.position.y = 0.11;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.6, 8), getMat(wallColor, { roughness: 0.6 }));
    shaft.position.y = 0.9;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.2, 0.54), getMat(wallColor, { roughness: 0.7 }));
    cap.position.y = 1.75;
    group.add(base, shaft, cap);
    return group;
  }

  function createUrn() {
    const group = new THREE.Group();
    group.name = 'destructible_urn';

    const intactGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.17, 0.46, 8), getMat(0x7c4d33, { roughness: 0.8 }));
    body.position.y = 0.23;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.14, 8), getMat(0x5c3824));
    neck.position.y = 0.5;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 6, 12), getMat(0xd49b28, { metalness: 0.85 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.56;
    const goldBand = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 4, 12), getMat(0xd49b28, { metalness: 0.85 }));
    goldBand.rotation.x = Math.PI / 2;
    goldBand.position.y = 0.28;

    intactGroup.add(body, neck, rim, goldBand);
    group.add(intactGroup);
    group.intactGroup = intactGroup;

    // Broken Shards & Gold Coins Group (shown after smashing!)
    const rubbleGroup = new THREE.Group();
    rubbleGroup.visible = false;
    for (let i = 0; i < 6; i++) {
      const shard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.12), getMat(0x7c4d33));
      const angle = (i / 6) * Math.PI * 2;
      shard.position.set(Math.cos(angle) * 0.24, 0.03, Math.sin(angle) * 0.24);
      shard.rotation.set(0.2, angle, 0.1);
      rubbleGroup.add(shard);
    }
    for (let c = 0; c < 3; c++) {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), getMat(0xfacc15, { metalness: 0.9, emissive: 0xca8a04, emissiveIntensity: 0.5 }));
      coin.position.set((c - 1) * 0.12, 0.04, (c % 2) * 0.1);
      rubbleGroup.add(coin);
    }
    group.add(rubbleGroup);
    group.rubbleGroup = rubbleGroup;

    group.isDestroyed = false;
    return group;
  }

  function createLootBeam(colorHex = 0xffffff) {
    const group = new THREE.Group();
    group.name = 'loot_beam';

    const beamGeo = new THREE.CylinderGeometry(0.1, 0.22, 4.2, 12, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 2.1;
    group.add(beam);
    group.lootBeam = beam;

    const ringGeo = new THREE.RingGeometry(0.18, 0.52, 20);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    group.add(ring);

    return group;
  }

  function createEliteAura(auraColor = 0xff5500) {
    const group = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(0.46, 0.66, 20);
    const ringMat = new THREE.MeshBasicMaterial({
      color: auraColor,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const aura = new THREE.Mesh(ringGeo, ringMat);
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.04;
    group.add(aura);

    // Outer rune ring
    const outerGeo = new THREE.RingGeometry(0.7, 0.76, 8);
    const outer = new THREE.Mesh(outerGeo, ringMat);
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = 0.04;
    group.add(outer);

    return group;
  }

  // --- 3D SKILL VISUAL EFFECTS (VFX) FACTORY (NEW!) ---

  function spawnSkillVFX(scene, skillId, start, target) {
    GamePresentation.skill(scene, skillId, start, target);
  }
  function spawnHitSparks(scene, position, type) {
    GamePresentation.sparks(scene, position, type);
  }

  // --- ANIMATION UPDATE LOOP ---

  function updateAnimation(entity, delta, time) {
    if (!entity || !entity.visible || !GamePresentation.settings.motion) return;
    entity.animTime = (entity.animTime || 0) + delta;

    // Hero / Walking animation
    if (entity.leftLeg && entity.rightLeg) {
      if (entity.isMoving) {
        const gait = Math.sin(entity.animTime * 12);
        entity.leftLeg.rotation.x = gait * 0.65;
        entity.rightLeg.rotation.x = -gait * 0.65;
        if (entity.rightArm && entity.leftArm) {
          entity.rightArm.rotation.x = -gait * 0.35;
          entity.leftArm.rotation.x = gait * 0.35;
        }
        if (entity.cape) {
          entity.cape.rotation.x = 0.28 + Math.abs(gait) * 0.2;
        }
        if (entity.bodyRoot) {
          entity.bodyRoot.position.y = Math.abs(Math.sin(entity.animTime * 12)) * 0.06;
        }
      } else {
        entity.leftLeg.rotation.x = 0;
        entity.rightLeg.rotation.x = 0;
        if (entity.rightArm && entity.leftArm) {
          entity.rightArm.rotation.x = Math.sin(entity.animTime * 2.5) * 0.05;
          entity.leftArm.rotation.x = -Math.sin(entity.animTime * 2.5) * 0.05;
        }
        if (entity.cape) {
          entity.cape.rotation.x = 0.14 + Math.sin(entity.animTime * 2) * 0.04;
        }
        if (entity.bodyRoot) {
          entity.bodyRoot.position.y = Math.sin(entity.animTime * 3) * 0.025;
        }
      }
    }

    // Arcanist staff crystal & astrolabe ring spin
    if (entity.staffCrystal) {
      entity.staffCrystal.rotation.y = time * 3;
    }
    if (entity.staffRing) {
      entity.staffRing.rotation.z = time * 2;
      entity.staffRing.rotation.x = Math.sin(time * 2) * 0.4;
    }

    // NPC Hammer smithing bob
    if (entity.hammer) {
      entity.hammer.rotation.x = Math.sin(time * 4) * 0.25;
    }

    // Lantern subtle flicker & bob
    if (entity.lanternLight) {
      const flicker = 0.92 + Math.sin(time * 16) * 0.06 + Math.cos(time * 29) * 0.04;
      entity.lanternLight.intensity = 2.5 * flicker;
    }

    // Boss wings flapping
    if (entity.leftWing && entity.rightWing) {
      const flap = Math.sin(time * 5) * 0.32;
      entity.leftWing.rotation.z = Math.PI / 8 + flap;
      entity.rightWing.rotation.z = -Math.PI / 8 - flap;
    }

    // Sorcerer / Ghost orbiting runes
    if (entity.runes) {
      entity.runes.forEach((rune, idx) => {
        const count = entity.runes.length;
        const angle = time * 2.5 + (idx * Math.PI * 2 / count);
        rune.position.set(Math.cos(angle) * 0.72, 1.25 + Math.sin(time * 3 + idx) * 0.15, Math.sin(angle) * 0.72);
        rune.rotation.y = time * 3;
      });
    }

    // Lich phylactery / NPC indicator float
    if (entity.phylactery) {
      entity.phylactery.rotation.y = time * 2.2;
      entity.phylactery.position.y = (entity.name && entity.name.startsWith('npc_') ? 1.72 : 2.25) + Math.sin(time * 3.5) * 0.08;
    }

    // Torches & Shrines
    if (entity.flame && entity.light) {
      entity.light.intensity = 1.2 + Math.sin(time * 15) * 0.2;
      entity.flame.rotation.y = time * 2;
    }

    // Elite monster / NPC / Portal glowing aura spin
    if (entity.eliteAura) {
      entity.eliteAura.rotation.z = time * 1.8;
    }

    // Loot beam / Shrine halo spin
    if (entity.lootBeam) {
      entity.lootBeam.rotation.y = time * 1.6;
    }

    // Mimic chest subtle breathing & eye pulse tell in exploration
    if (entity.isMimic) {
      const breathe = 1.0 + Math.sin(time * 3.5) * 0.035;
      entity.scale.set(breathe, 1.0 + Math.sin(time * 3.5 + 0.4) * 0.04, breathe);
      if (entity.mimicEyeLight) {
        entity.mimicEyeLight.intensity = 0.5 + Math.sin(time * 4) * 0.35;
      }
    }

    // Mimic monster combat tongue thrashing
    if (entity.tongue) {
      entity.tongue.rotation.z = Math.sin(time * 6) * 0.22;
      entity.tongue.rotation.x = Math.PI / 3 + Math.sin(time * 8) * 0.12;
    }

    // Bounty Board lantern sway
    if (entity.bountyLantern) {
      entity.bountyLantern.rotation.z = Math.sin(time * 2.2) * 0.08;
    }

    // Bounty Target red runic aura spin
    if (entity.bountyAura) {
      entity.bountyAura.rotation.z = -time * 1.4;
    }
  }

  return {
    createHero,
    createNPC,
    createMonster,
    createChest,
    createMimicChest,
    createBountyBoard,
    createBountyAura,
    createLoreTablet,
    createShrine,
    createCursedAltar,
    createCursedChest,
    createStairs,
    createTorch,
    createPillar,
    createUrn,
    createLootBeam,
    createEliteAura,
    spawnSkillVFX,
    spawnHitSparks,
    updateAnimation
  };
})();
