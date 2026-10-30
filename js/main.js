/**
 * EVER DEEPER II: ABYSSAL TACTICS (TURUN TERUS RPG 2)
 * Master Game Loop & Isometric Exploration Engine
 */

window.EverDeeperV2 = (function() {
  let scene, camera, renderer;
  let dungeon, heroModel, heroGroup;
  let inventory, combat;
  let currentFloorIndex = 0;
  let currentForgeSlot = 'weapon'; // Active equipment slot selected at Blacksmith Forge
  let gameState = 'explore'; // 'explore', 'combat', 'dialogue', 'menu'
  let keys = {};
  let clock = new THREE.Clock();

  // Camera settings (Locked strictly to maximum close zoom distance for visceral intense gameplay)
  let cameraAngle = Math.PI / 4; // 45 degree isometric yaw
  let cameraPitch = Math.PI / 4.5; // ~40 degree elevation
  const CAMERA_LOCKED_DISTANCE = 8; // Locked to maximum close zoom (zoom in mentok)
  let cameraDistance = CAMERA_LOCKED_DISTANCE;
  let targetCamPos = new THREE.Vector3();
  let isRightMouseDown = false;
  let mousePrevX = 0, mousePrevY = 0, lookPitch = -.015;

  // Active entities in current floor
  let activeEntities = [];
  let ambientParticles = null;
  let modalOpen = false;
  let lastFogCell = "";
  let backdropFrame = 0;
  let victoryPending=false;
  let cameraAim=null;

  function init() {
    gameState = 'title'; // Start at Title Screen / Landing Page
    setupThree();
    setupInventory();
    loadFloor(0);
    setupEvents();
    setupUI();

    // Start background ambient drone
    GameAudio.init();
    GameAudio.startAmbientDrone();

    animate();
  }

  function setupThree() {
    const container = document.getElementById('canvasContainer');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0809);
    scene.fog = new THREE.FogExp2(0x0a0809, 0.05);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(10, 14, 10);

    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    GamePresentation.configure(renderer);
    renderer.shadowMap.enabled = false; // Contact silhouettes replace six-pass point-light shadows.
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    GameRetro.resize(renderer);

    // Global ambient illumination
    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x28303c, 0.65);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight.position.set(15, 25, 10);
    scene.add(dirLight);

    // Floating 3D Abyssal Dust & Solar Ember Particles
    const partCount = 48;
    const partGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = Math.random() * 4.5 + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.09,
      transparent: true,
      opacity: 0.55
    });
    ambientParticles = new THREE.Points(partGeo, partMat);
    scene.add(ambientParticles);
    partGeo.setDrawRange(0, GamePresentation.profile.ambient);

    window.addEventListener('resize', onWindowResize);
  }

  function setupInventory() {
    inventory = new GameInventory.InventoryManager('warrior');
    // Try loading existing save
    inventory.loadFromStorage();
  }

  function loadFloor(floorIdx) {
    currentFloorIndex = floorIdx;
    if (gameState !== 'title') { inventory.savedDepth = floorIdx; inventory.saveToStorage(); }
    const floorData = RPG_DATA.FLOORS[currentFloorIndex];

    victoryPending=false;GameDeath.clear();GameAttack.clear();
    GamePresentation.clearEffects();
    lastFogCell = "";
    // Clear old scene items
    if (dungeon) {
      GamePresentation.disposeTree(dungeon.group);
    }
    activeEntities.forEach(e => {
      if (e.model) GamePresentation.disposeTree(e.model);
    });
    activeEntities = [];

    // Update scene fog color
    scene.fog.color.setHex(floorData.fogColor);
    scene.background.setHex(floorData.fogColor);

    // Build new dungeon level
    dungeon = new GameDungeon.DungeonLevel(floorData);
    scene.add(dungeon.group);

    // Clean up previous combat highlight group if exists
    if (combat && combat.highlightGroup) {
      combat.clearAiTimeouts();
      combat.clearIntentBadges();
      combat.floatingTexts.forEach(item => item.el.remove());
      combat.floatingTexts = [];
      GamePresentation.disposeTree(combat.highlightGroup);
    }

    // Spawn Hero at dungeon spawn - recreate clean model to guarantee upright stance & reset transforms
    if (heroModel) {
      GamePresentation.disposeTree(heroModel);
      heroModel = null;
    }
    heroModel = GameModels.createHero(inventory.heroClassId);
    scene.add(heroModel);
    heroModel.rotation.set(0, 0, 0);

    const spawnWorld = dungeon.gridToWorld(dungeon.playerSpawn.x, dungeon.playerSpawn.z);
    heroModel.position.set(spawnWorld.x, 0, spawnWorld.z);
    heroModel.visible = true;
    targetCamPos.copy(heroModel.position);

    // Reset camera position smoothly to spawn
    const cx = targetCamPos.x + cameraDistance * Math.sin(cameraAngle) * Math.cos(cameraPitch);
    const cz = targetCamPos.z + cameraDistance * Math.cos(cameraAngle) * Math.cos(cameraPitch);
    const cy = targetCamPos.y + cameraDistance * Math.sin(cameraPitch);
    camera.position.set(cx, cy, cz);
    camera.lookAt(targetCamPos.x, targetCamPos.y + 0.8, targetCamPos.z);

    // Spawn dungeon entities
    dungeon.entities.forEach(ent => {
      const wPos = dungeon.gridToWorld(ent.gx, ent.gz);
      let model = null;

      if (ent.type === 'monster') {
        const mDef = RPG_DATA.MONSTERS[ent.monsterKey];
        model = GameModels.createMonster(mDef.modelType, false);
        // Elite Champion Glowing Aura & Imposing Scale
        if (ent.isElite && ent.eliteMod) {
          const aura = GameModels.createEliteAura(ent.eliteMod.auraColor || 0xff5500);
          model.add(aura);
          model.eliteAura = aura;
          model.scale.set(1.22, 1.22, 1.22);
        }
      } else if (ent.type === 'bounty_board') {
        model = GameModels.createBountyBoard ? GameModels.createBountyBoard() : GameModels.createLoreTablet();
      } else if (ent.type === 'bounty_target') {
        const bDef = ent.bountyDef || (RPG_DATA.BOUNTIES && RPG_DATA.BOUNTIES[currentFloorIndex + 1]);
        model = GameModels.createMonster(bDef ? bDef.modelType : 'troll', false);
        model.scale.set(1.32, 1.32, 1.32);
        const bAura = GameModels.createBountyAura ? GameModels.createBountyAura() : null;
        if (bAura) {
          model.add(bAura);
          model.bountyAura = bAura;
        }
      } else if (ent.type === 'boss') {
        const bDef = RPG_DATA.BOSSES[ent.bossId];
        model = GameModels.createMonster(bDef.modelType, true);
      } else if (ent.type === 'urn') {
        model = GameModels.createUrn();
      } else if (ent.type === 'chest') {
        if (ent.isMimic && GameModels.createMimicChest) {
          model = GameModels.createMimicChest();
        } else {
          model = GameModels.createChest();
        }
      } else if (ent.type === 'cursed_chest') {
        model = GameModels.createCursedChest ? GameModels.createCursedChest() : GameModels.createChest();
      } else if (ent.type === 'shrine') {
        model = GameModels.createShrine();
      } else if (ent.type === 'cursed_altar') {
        model = GameModels.createCursedAltar ? GameModels.createCursedAltar() : GameModels.createShrine();
      } else if (ent.type === 'lore') {
        model = GameModels.createLoreTablet();
      } else if (ent.type === 'npc') {
        model = GameModels.createNPC(ent.npcId || 'blacksmith');
      } else if (ent.type === 'stairs') {
        model = GameModels.createStairs();
      }

      if (model) {
        model.position.set(wPos.x, 0, wPos.z);
        scene.add(model);
        ent.model = model;
        activeEntities.push(ent);
      }
    });

    GamePresentation.buildLights(scene);
    GamePresentation.updateLights(1, heroModel);

    // Initialize Fog of War around player (Diablo Unknown Darkness)
    dungeon.updateFogOfWar(dungeon.playerSpawn.x, dungeon.playerSpawn.z, activeEntities, 5.0);

    // Initialize Combat System
    combat = new GameCombat.CombatManager(scene, dungeon, inventory, onCombatFinished);
    if (combat && combat.setCamera) {
      combat.setCamera(camera);
      GameCombatGuide.bind(combat,unit=>{const p=unit.model.position,h=(unit.model.bodyRoot?.geometry?.parameters?.height||1.6)*(unit.model.scale.y||1);cameraAim={angle:Math.atan2(heroModel.position.x-p.x,heroModel.position.z-p.z),pitch:Math.max(-.65,Math.min(.4,Math.atan2(h*.55-1.22,Math.max(.1,heroModel.position.distanceTo(p)))))};});
    }

    // Update Floor Banner UI
    document.getElementById('floorTitle').textContent = floorData.name;
    document.getElementById('floorSubtitle').textContent = floorData.subtitle + (inventory.abyssContract ? ' · KONTRAK BARA: ATK +20%, HP +15%' : '');
    showNotification(`${GameIcons.svg('target')} Masuk ke ${floorData.name}`);
    updateHUD();
  }

  // --- EXPLORATION & MOVEMENT ---

  function updateExploration(delta) {
    if (gameState !== 'explore' || !heroModel) return;

    let moveX = 0;
    let moveZ = 0;

    // Camera relative movement
    const forward = new THREE.Vector3(-Math.sin(cameraAngle), 0, -Math.cos(cameraAngle)).normalize();
    const right = new THREE.Vector3(Math.cos(cameraAngle), 0, -Math.sin(cameraAngle)).normalize();

    if (keys['KeyW'] || keys['ArrowUp']) {
      moveX += forward.x;
      moveZ += forward.z;
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
      moveX -= forward.x;
      moveZ -= forward.z;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
      moveX += right.x;
      moveZ += right.z;
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
      moveX -= right.x;
      moveZ -= right.z;
    }

    const isMoving = moveX !== 0 || moveZ !== 0;
    heroModel.isMoving = isMoving;

    if (isMoving) {
      const moveVec = new THREE.Vector3(moveX, 0, moveZ).normalize().multiplyScalar(2.7 * delta);
      const nextX = heroModel.position.x + moveVec.x;
      const nextZ = heroModel.position.z + moveVec.z;

      // Small collision radius keeps the first-person eye outside masonry.
      const clear=(x,z)=>[-.19,.19].every(dx=>[-.19,.19].every(dz=>{const p=dungeon.worldToGrid(x+dx,z+dz);return dungeon.isWalkable(p.gx,p.gz);}));
      if(clear(nextX,heroModel.position.z))heroModel.position.x=nextX;
      if(clear(heroModel.position.x,nextZ))heroModel.position.z=nextZ;
      const currGrid=dungeon.worldToGrid(heroModel.position.x,heroModel.position.z);
      const fogCell=currGrid.gx+','+currGrid.gz;
      if(fogCell!==lastFogCell){dungeon.updateFogOfWar(currGrid.gx,currGrid.gz,activeEntities,5);lastFogCell=fogCell;}

      // Smooth hero facing rotation
      const targetRotation = Math.atan2(moveVec.x, moveVec.z);
      heroModel.rotation.y = targetRotation;

      // Trigger footstep sound intermittently
      if (Math.random() < 0.08) {
        GameAudio.playFootstep();
      }

      // Check proximity to roaming monsters / bosses -> Trigger Combat!
      checkMonsterTriggers();

      // Check proximity to interactive props
      checkInteractionProximity();
    }
  }

  function checkMonsterTriggers() {
    const heroGrid = dungeon.worldToGrid(heroModel.position.x, heroModel.position.z);

    for (let i = activeEntities.length - 1; i >= 0; i--) {
      const ent = activeEntities[i];
      if ((ent.type === 'monster' || ent.type === 'boss' || ent.type === 'bounty_target') && !ent.defeated) {
        const dist = Math.abs(heroGrid.gx - ent.gx) + Math.abs(heroGrid.gz - ent.gz);
        if (dist <= 2) {
          // ENTER COMBAT!
          startCombatEncounter(ent);
          break;
        }
      }
    }
  }

  function getNPCData(npcId) {
    if (!RPG_DATA.NPCS) return null;
    if (npcId && RPG_DATA.NPCS[npcId]) return RPG_DATA.NPCS[npcId];
    for (let k in RPG_DATA.NPCS) {
      if (RPG_DATA.NPCS[k].id === npcId) return RPG_DATA.NPCS[k];
    }
    const floorNpcMap = { 1: 'kaelen_smith', 2: 'eloria_alchemist', 3: 'valen_lorekeeper', 4: 'malakor_shade', 5: 'kaelen_smith' };
    const mapped = floorNpcMap[currentFloorIndex + 1];
    return RPG_DATA.NPCS[mapped] || RPG_DATA.NPCS.kaelen_smith || RPG_DATA.NPCS.blacksmith || null;
  }

  function checkInteractionProximity() {
    const heroGrid = dungeon.worldToGrid(heroModel.position.x, heroModel.position.z);
    let nearby = null;

    for (let ent of activeEntities) {
      if (ent.type === 'urn' || ent.type === 'chest' || ent.type === 'cursed_chest' || ent.type === 'cursed_altar' || ent.type === 'bounty_board' || ent.type === 'shrine' || ent.type === 'lore' || ent.type === 'npc' || ent.type === 'stairs') {
        const dist = Math.abs(heroGrid.gx - ent.gx) + Math.abs(heroGrid.gz - ent.gz);
        if (dist <= 1) {
          nearby = ent;
          break;
        }
      }
    }

    const promptEl = document.getElementById('interactPrompt');
    if (nearby && promptEl) {
      promptEl.style.display = 'inline-flex';
      let action = 'Berinteraksi';
      let icKey = 'spark';
      if (nearby.type === 'urn') {
        icKey = 'chalice';
        action = nearby.isDestroyed ? 'Pecahan Guci Kuno' : 'Hancurkan Guci Kuno';
      }
      if (nearby.type === 'bounty_board') {
        icKey = 'target';
        action = 'Lihat Papan Buronan Abyss';
      }
      if (nearby.type === 'chest') {
        icKey = 'chest';
        action = nearby.opened ? 'Peti Harta Kosong' : 'Buka Peti Harta';
      }
      if (nearby.type === 'cursed_chest') {
        icKey = 'skull';
        action = nearby.opened ? 'Peti Rantai Terbuka' : 'Buka Peti Rantai Terkutuk';
      }
      if (nearby.type === 'cursed_altar') {
        icKey = 'shadow';
        action = nearby.used ? 'Altar Kutukan Tertidur' : 'Dekati Altar Kutukan Abyssal';
      }
      if (nearby.type === 'shrine') {
        icKey = 'sun';
        action = 'Berdoa di Altar Surya';
      }
      if (nearby.type === 'lore') {
        icKey = 'scroll';
        action = 'Baca Prasasti Kenangan Liora';
      }
      if (nearby.type === 'npc') {
        icKey = 'chat';
        const npcData = getNPCData(nearby.npcId);
        action = `Bicara dengan ${npcData ? npcData.name : 'Penghuni Sanctuary'}`;
      }
      if (nearby.type === 'stairs') {
        icKey = nearby.locked ? 'lock' : 'key';
        action = nearby.locked ? 'Tangga Tersegel (Kalahkan Bos Lantai)' : 'Turun ke Lantai Berikutnya';
      }
      promptEl.innerHTML = `${GameIcons.svg(icKey, 'fantasy-icon icon-md')} <kbd class="interact-key-badge">E</kbd> <span>${action}</span>`;
      promptEl.currentEntity = nearby;
      promptEl.onclick = () => interactWithNearby();
    } else if (promptEl) {
      promptEl.style.display = 'none';
      promptEl.currentEntity = null;
    }
  }

  function interactWithNearby() {
    if(victoryPending)return;
    const promptEl = document.getElementById('interactPrompt');
    if (!promptEl || !promptEl.currentEntity) return;
    const ent = promptEl.currentEntity;

    if (ent.type === 'urn' && !ent.isDestroyed) {
      ent.isDestroyed = true;
      GameAudio.playPotBreak();
      const goldAmt = ent.gold || (10 + Math.floor(Math.random() * 15));
      inventory.gold += goldAmt;
      showNotification(`${GameIcons.svg('chalice')} Guci hancur! Memperoleh +${goldAmt} Gold!`);

      // Spawn shimmering vertical loot beam
      const beam = GameModels.createLootBeam(0xfacc15);
      beam.position.copy(ent.model.position);
      scene.add(beam);
      setTimeout(() => GamePresentation.disposeTree(beam), 2500);

      // Show 3D shattered pottery rubble & gold coins instead of disappearing
      if (ent.model && ent.model.intactGroup && ent.model.rubbleGroup) {
        ent.model.intactGroup.visible = false;
        ent.model.rubbleGroup.visible = true;
      } else if (ent.model) {
        ent.model.position.y = -10;
      }
      inventory.saveToStorage();
    } else if (ent.type === 'npc') {
      showNpcModal(ent.npcId);
    } else if (ent.type === 'bounty_board') {
      showBountyBoardModal();
    } else if (ent.type === 'chest' && !ent.opened) {
      if (ent.isMimic) {
        triggerMimicAmbush(ent);
      } else {
        ent.opened = true;
        if (ent.model && ent.model.lidGroup) {
          ent.model.lidGroup.rotation.x = -Math.PI / 2.5; // open lid
        }
        const loot = inventory.generateRandomLoot(dungeon.floorData.floor);
        inventory.addLoot(loot);
        let goldAmt = 25 + Math.floor(Math.random() * 30);
        const mult = inventory.getGoldMultiplier ? inventory.getGoldMultiplier() : 1.0;
        goldAmt = Math.round(goldAmt * mult);
        inventory.gold += goldAmt;
        GameAudio.playChestOpen();

        // Loot Beam according to rarity
        let beamColor = 0xffffff;
        if (loot.rarity === 'rare') beamColor = 0x38bdf8;
        if (loot.rarity === 'epic') beamColor = 0xa855f7;
        if (loot.rarity === 'legendary') beamColor = 0xf59e0b;
        const beam = GameModels.createLootBeam(beamColor);
        beam.position.copy(ent.model.position);
        scene.add(beam);
        setTimeout(() => GamePresentation.disposeTree(beam), 3000);

        showNotification(`${GameIcons.svg('chest')} Membuka Peti: Memperoleh ${loot.name} & +${goldAmt} Gold!`);
        inventory.saveToStorage();
      }
    } else if (ent.type === 'cursed_chest') {
      if (ent.opened) {
        showNotification(`${GameIcons.svg('chest')} Peti terkutuk telah terbuka dan kosong.`);
      } else {
        showCursedChestModal(ent);
      }
    } else if (ent.type === 'cursed_altar') {
      if (ent.used) {
        showNotification(`${GameIcons.svg('shadow')} Altar ini telah tertidur setelah paktanya diterima.`);
      } else {
        showCursedAltarModal(ent);
      }
    } else if (ent.type === 'shrine') {
      const stats = inventory.getComputedStats();
      const hero = combat.combatants ? combat.combatants.find(c => c.isPlayer) : null;
      if (hero) {
        hero.hp = stats.maxHp;
        hero.poise = stats.maxPoise;
      }
      inventory.currentHp = stats.maxHp;
      inventory.potions = Math.min(inventory.maxPotions, inventory.potions + 2);
      GameAudio.playHeal();
      updateHUD();
      showNotification(`${GameIcons.svg('sun')} Altar Surya memulihkan seluruh luka & mengisi 2 Lentera Flask!`);
    } else if (ent.type === 'lore') {
      showLoreModal(ent.loreIndex);
    } else if (ent.type === 'stairs') {
      if (ent.locked) {
        showNotification(`${GameIcons.svg('lock')} Tangga terkunci oleh aura gelap Bos! Kalahkan bos lantai ini terlebih dahulu!`);
      } else {
        if (currentFloorIndex < RPG_DATA.FLOORS.length - 1) {
          showStoryDescentModal(currentFloorIndex + 1);
        } else {
          showVictoryGameModal();
        }
      }
    }
  }

  // --- CURSED ALTAR & CURSED CHEST AMBUSH SYSTEMS ---

  let activeCursedAltarEntity = null;
  function showCursedAltarModal(altarEntity) {
    activeCursedAltarEntity = altarEntity;
    const modal = document.getElementById('cursedAltarModal');
    const container = document.getElementById('cursedPactsGrid');
    if (!modal || !container) return;

    container.innerHTML = '';
    const deals = RPG_DATA.CURSED_ALTAR_DEALS || [];
    deals.forEach(deal => {
      const card = document.createElement('div');
      card.className = 'cursed-pact-card';
      card.innerHTML = `
        <div>
          <div class="pact-title-row">
            ${GameIcons.svg(deal.icon || 'shadow', 'fantasy-icon icon-sm')}
            <span>${deal.title}</span>
          </div>
          <div class="pact-boon-box">
            <b>${GameIcons.svg('spark', 'fantasy-icon icon-xs')} Berkah Ilahi:</b><br>
            ${deal.boonDesc}
          </div>
          <div class="pact-curse-box">
            <b>${GameIcons.svg('skull', 'fantasy-icon icon-xs')} Kutukan Kegelapan:</b><br>
            ${deal.curseDesc}
          </div>
        </div>
        <button class="pact-accept-btn" id="btn_deal_${deal.id}">Terima Pakta Ini</button>
      `;

      card.querySelector(`#btn_deal_${deal.id}`).onclick = () => {
        inventory.applyCursedPact(deal);
        if (activeCursedAltarEntity) {
          activeCursedAltarEntity.used = true;
        }
        modal.style.display = 'none';
        GameAudio.playHeavyImpact();
        showNotification(`${GameIcons.svg('shadow')} Pakta Diterima: ${deal.title}!`);
        updateHUD();
      };

      container.appendChild(card);
    });

    modal.style.display = 'flex';
  }

  let activeCursedChestEntity = null;
  function showCursedChestModal(chestEntity) {
    activeCursedChestEntity = chestEntity;
    const modal = document.getElementById('cursedChestModal');
    if (modal) modal.style.display = 'flex';
  }

  function startCursedAmbush(chestEntity) {
    if (!chestEntity || chestEntity.opened || gameState !== 'explore') return;
    const heroCell = dungeon.worldToGrid(heroModel.position.x, heroModel.position.z);
    const occupied = new Set(activeEntities.filter(e => !e.defeated).map(e => `${e.gx},${e.gz}`));
    const queue = [heroCell], seen = new Set([`${heroCell.gx},${heroCell.gz}`]), spots = [];
    for (let i = 0; i < queue.length && spots.length < 2; i++) {
      const cell = queue[i];
      for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const gx = cell.gx + dx, gz = cell.gz + dz, key = `${gx},${gz}`;
        if (seen.has(key) || !dungeon.isWalkable(gx, gz)) continue;
        seen.add(key);
        if (occupied.has(key)) continue;
        queue.push({gx,gz});
        if (spots.length < 2) spots.push({gx,gz});
      }
    }
    if (!spots.length) { showNotification('Tidak ada ruang untuk penyergapan. Dekati peti dari sisi lain.'); return; }
    chestEntity.opened = true;
    if (chestEntity.model && chestEntity.model.lidGroup) {
      chestEntity.model.lidGroup.rotation.x = -Math.PI / 2.5;
    }

    gameState = 'combat';
    heroModel.isMoving=false;
    const computedStats = inventory.getComputedStats();
    if (inventory.currentHp !== undefined) {
      computedStats.hp = Math.max(1, inventory.currentHp);
    }

    document.getElementById('combatHud').style.display = 'flex';
    document.getElementById('exploreHud').style.display = 'none';

    // Ambush squad: 2 Elite Shadow Fiends
    const mPool = dungeon.floorData.monsterPool;
    const mKey1 = mPool[0] || 'void_crawler';
    const mKey2 = mPool[1] || mKey1;
    const ambushEnemies = [
      {
        type: 'monster',
        monsterKey: mKey1,
        isElite: true,
        eliteMod: (RPG_DATA.ELITE_MODIFIERS && RPG_DATA.ELITE_MODIFIERS.find(m => m.id === 'corrupting')) || RPG_DATA.ELITE_MODIFIERS[0],
        gx: chestEntity.gx + 1,
        gz: chestEntity.gz
      },
      {
        type: 'monster',
        monsterKey: mKey2,
        isElite: true,
        eliteMod: (RPG_DATA.ELITE_MODIFIERS && RPG_DATA.ELITE_MODIFIERS.find(m => m.id === 'vampiric')) || RPG_DATA.ELITE_MODIFIERS[1],
        gx: chestEntity.gx - 1,
        gz: chestEntity.gz
      }
    ];

    ambushEnemies.length = spots.length;
    ambushEnemies.forEach((enemy, i) => {
      Object.assign(enemy, spots[i]);
      const def = RPG_DATA.MONSTERS[enemy.monsterKey] || Object.values(RPG_DATA.MONSTERS)[0];
      enemy.model = GameModels.createMonster(def.modelType, false);
      const pos = dungeon.gridToWorld(enemy.gx, enemy.gz);
      enemy.model.position.set(pos.x, 0, pos.z);
      scene.add(enemy.model);
      activeEntities.push(enemy);
      dungeon.entities.push(enemy);
    });
    document.getElementById('interactPrompt').style.display = 'none';
    activeCursedChestEntity = null;
    hideSkillTooltip();
    combat.startBattle(heroModel, computedStats, ambushEnemies, true);
    heroModel.isMoving = false;
    GameCombatGuide.begin();
    showNotification(`${GameIcons.svg('skull')} PENYERGAPAN KUTUKAN! Monster Void muncul dari Peti Terkutuk!`);
    updateHUD();
  }

  // --- PETI MIMIC AMBUSH & BOUNTY NOTICE BOARD SYSTEMS ---

  function triggerMimicAmbush(chestEntity) {
    if (!chestEntity) return;
    chestEntity.opened = true;

    // Visual & audio surprise shock
    GameAudio.playMonsterHurt();
    GameAudio.playHeavyImpact();
    if (combat && combat.shakeCamera) {
      combat.shakeCamera(0.42, 380);
    }
    showNotification(`${GameIcons.svg('skull')} PENYERGAPAN MIMIC! Peti ini ternyata monster penyamar haus darah!`);

    // Swap chest model to sprung-open combat mimic model
    if (chestEntity.model) {
      scene.remove(chestEntity.model);
      const mimicCombatModel = GameModels.createMonster('mimic', false);
      mimicCombatModel.position.copy(chestEntity.model.position);
      scene.add(mimicCombatModel);
      chestEntity.model = mimicCombatModel;
    }

    // Start combat encounter against Mimic
    const mimicCombatData = {
      type: 'mimic',
      gx: chestEntity.gx,
      gz: chestEntity.gz,
      model: chestEntity.model
    };
    startCombatEncounter(mimicCombatData);
  }

  function showBountyBoardModal() {
    const modal = document.getElementById('bountyBoardModal');
    if (!modal) return;
    const container = document.getElementById('bountyPosterContent');
    if (!container) return;

    const floorNum = currentFloorIndex + 1;
    const bounty = RPG_DATA.BOUNTIES && RPG_DATA.BOUNTIES[floorNum];
    if (!bounty) {
      container.innerHTML = '<p style="color:#d1c2c5; text-align:center;">Tidak ada catatan buronan di lantai ini.</p>';
      modal.style.display = 'flex';
      return;
    }

    const isDone = inventory.isBountyCompleted(bounty.id);
    const relic = RPG_DATA.ITEMS.find(i => i.id === bounty.relicReward);

    container.innerHTML = `
      <div class="bounty-bento-grid">
        <!-- Left Side: Wanted Criminal Card -->
        <div class="bounty-card-left">
          <div class="bounty-portrait-frame" data-creature="${bounty.modelType}" style="border-color:${bounty.dangerColor};">
            ${GameIcons.svg(bounty.icon || 'skull', 'fantasy-icon icon-lg')}
          </div>
          <div class="bounty-target-name">${bounty.name}</div>
          <div class="bounty-target-title">${bounty.title}</div>
          <div class="bounty-danger-pill" style="background:rgba(239, 68, 68, 0.15); border-color:${bounty.dangerColor}; color:${bounty.dangerColor};">
            ${GameIcons.svg('warning', 'fantasy-icon icon-xs')} ${bounty.danger}
          </div>
          <div style="font-size:11px; color:#a68d91; margin-top:10px;">
            Status: <b style="color:${isDone ? '#4ade80' : '#f59e0b'};">${isDone ? 'TERTUMPAS ✓' : 'BERKELIARAN (WANTED)'}</b>
          </div>
        </div>

        <!-- Right Side: Intelligence & Mechanics & Lore -->
        <div class="bounty-card-right">
          <div class="bounty-intel-box">
            <div class="bounty-section-label">
              ${GameIcons.svg('scroll', 'fantasy-icon icon-xs')} CATATAN INTELIJEN & LOKASI
            </div>
            <p style="font-size:12px; line-height:1.55; color:#fae8d4; margin:0 0 8px;">
              ${bounty.lore}
            </p>
            <div style="font-size:11px; color:#d97706; font-family:var(--font-mono);">
              📍 Bersembunyi di ceruk terpencil salah satu ruangan lantai ini (lingkaran merah rune).
            </div>
          </div>

          <div class="bounty-intel-box">
            <div class="bounty-section-label">
              ${GameIcons.svg('sword', 'fantasy-icon icon-xs')} KEMAMPUAN KHUSUS / GIMMICK
            </div>
            <div class="bounty-skills-list">
              ${(bounty.skills || []).map(s => `
                <div class="bounty-skill-item">
                  <span style="font-weight:bold; color:#fef08a;">${s.name}</span>
                  <span style="color:#f87171;">${s.dmg} DMG (${s.poiseDmg || 20} Poise)</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bento Row: Imposing Rewards -->
      <div class="bounty-rewards-bento">
        <div class="bounty-reward-chip">
          <div style="font-size:24px;">${GameIcons.svg('coin', 'fantasy-icon icon-md')}</div>
          <div>
            <div style="font-size:10px; color:#d97706; font-family:var(--font-mono);">HADIAH EMAS RESMI</div>
            <div style="font-size:16px; font-weight:bold; color:#fde047;">+${bounty.rewardGold} Gold</div>
          </div>
        </div>

        <div class="bounty-reward-chip relic-chip" id="bountyRelicChip" title="Arahkan kursor untuk melihat detail relik">
          <div style="font-size:24px;">${GameIcons.svg((relic && relic.icon) || 'crown', 'fantasy-icon icon-md')}</div>
          <div>
            <div style="font-size:10px; color:#c084fc; font-family:var(--font-mono);">RELIK EKSKLUSIF (EPIC/MYTHIC)</div>
            <div style="font-size:13.5px; font-weight:bold; color:#f3e8ff;">${relic ? relic.name : 'Relik Berharga'}</div>
          </div>
        </div>
      </div>

      <div style="margin-top:6px;">
        <button class="bounty-track-btn" id="bountyTrackCloseBtn">
          ${isDone ? 'Buronan Telah Berhasil Ditumpas ✓ (Tutup)' : 'Lacak Target Buronan & Lanjutkan Penjelajahan'}
        </button>
      </div>
    `;

    // Hook up Bento Tooltip for the relic chip
    const relicChip = container.querySelector('#bountyRelicChip');
    if (relicChip && relic) {
      relicChip.onmouseenter = (e) => showBentoTooltip(relic, e);
      relicChip.onmouseleave = () => hideBentoTooltip();
    }

    const trackBtn = container.querySelector('#bountyTrackCloseBtn');
    if (trackBtn) {
      trackBtn.onclick = () => {
        modal.style.display = 'none';
        if (!isDone) {
          showNotification(`${GameIcons.svg('target')} Melacak buronan: ${bounty.name}. Temukan ceruk tersembunyi!`);
        }
      };
    }

    modal.style.display = 'flex';
  }

  // --- COMBAT INTEGRATION ---

  function startCombatEncounter(targetEntity) {
    gameState = 'combat';
    const computedStats = inventory.getComputedStats();
    if (inventory.currentHp !== undefined) {
      computedStats.hp = Math.max(1, inventory.currentHp);
    }

    // Show Combat Overlays (Target Boss Bar, Turn Banner, Combat Log)
    document.getElementById('combatHud').style.display = 'flex';
    document.getElementById('exploreHud').style.display = 'none';

    // Build enemies group for this fight
    const enemies = [targetEntity];
    if (targetEntity.type === 'monster') {
      const limit = dungeon.floorData.floor >= 4 ? 3 : 2;
      for (const other of activeEntities) {
        if (enemies.length >= limit) break;
        if (other !== targetEntity && other.type === 'monster' && !other.defeated && other.model && !other.model.userData.deathStarted && Math.abs(other.gx-targetEntity.gx)+Math.abs(other.gz-targetEntity.gz)<=5) enemies.push(other);
      }
    }

    if (targetEntity.type === 'boss') {
      const bDef = RPG_DATA.BOSSES[targetEntity.bossId];
      showBossBanner(bDef);
    } else if (targetEntity.type === 'bounty_target') {
      const bDef = targetEntity.bountyDef || (RPG_DATA.BOUNTIES && RPG_DATA.BOUNTIES[currentFloorIndex + 1]);
      showNotification(`${GameIcons.svg('target')} PERTEMPURAN BURONAN: ${bDef ? bDef.name : 'Buronan Berbahaya'}!`);
    } else if (targetEntity.type === 'mimic') {
      showNotification(`${GameIcons.svg('skull')} PERTEMPURAN MIMIC: Habisi peti penyamar lapar!`);
    }

    combat.startBattle(heroModel, computedStats, enemies);
    heroModel.isMoving=false;GameCombatGuide.begin();
    updateHUD();
  }

  function onCombatFinished(playerWon, results) {
    if (playerWon) {
      // Save current surviving HP to inventory exploration state
      const heroCombatant = combat.combatants.find(c => c.isPlayer);
      if (heroCombatant) {
        inventory.currentHp = Math.max(1, heroCombatant.hp);
      }

      // Mark enemy defeated and unlock stairs if boss
      activeEntities.forEach(e => {
        if (e.type === 'monster' || e.type === 'boss' || e.type === 'bounty_target') {
          if (e.model && (e.model.userData.deathStarted || e.model.position.y < 0)) {
            e.defeated = true;
            if (e.type === 'boss') {
              const stairs = activeEntities.find(s => s.type === 'stairs');
              if (stairs) {
                stairs.locked = false;
                showNotification(`${GameIcons.svg('key')} Segel Tangga Terbuka! Jalan menuju lantai lebih dalam telah dapat diakses!`);
              }
            } else if (e.type === 'bounty_target') {
              showNotification(`${GameIcons.svg('trophy')} Buronan lantai ini berhasil dituntaskan!`);
            }
          }
        }
      });

      // Show Victory Modal
      victoryPending=true;const completedCombat=combat;
      setTimeout(()=>{if(combat===completedCombat&&victoryPending){victoryPending=false;showCombatVictoryModal(results);}},1000);
      inventory.saveToStorage();

      // Trigger Hades-Style Boon Selection if leveled up!
      if (results && results.leveledUp) {
        setTimeout(() => showLevelUpBoonModal(), 1200);
      }

      gameState = 'explore';
      document.getElementById('combatHud').style.display = 'none';
      document.getElementById('exploreHud').style.display = 'flex';
      updateHUD();
    } else {
      // Game Over Screen - Lock controls and switch state to gameover
      gameState = 'gameover';
      document.getElementById('combatHud').style.display = 'none';
      document.getElementById('exploreHud').style.display = 'none';
      showGameOverModal();
    }
  }

  // --- CAMERA UPDATE ---

  function updateCamera() {
    if(!heroModel)return;
    const fighting=gameState==='combat',playing=gameState!=='title';
    GameRetro.setMode(dungeon,fighting?'combat-first-person':playing?'first-person':'title');
    heroModel.bodyRoot.visible=!playing;heroModel.heroRing.visible=false;
    if(camera.fov!==70){camera.fov=70;camera.updateProjectionMatrix();}
    if(playing){
      if(cameraAim){const d=Math.atan2(Math.sin(cameraAim.angle-cameraAngle),Math.cos(cameraAim.angle-cameraAngle));cameraAngle+=d*.18;lookPitch+=(cameraAim.pitch-lookPitch)*.18;if(Math.abs(d)<.004&&Math.abs(cameraAim.pitch-lookPitch)<.004)cameraAim=null;}
      camera.position.set(heroModel.position.x,1.22,heroModel.position.z);
      camera.lookAt(heroModel.position.x-Math.sin(cameraAngle)*Math.cos(lookPitch)*5,1.22+Math.sin(lookPitch)*5,heroModel.position.z-Math.cos(cameraAngle)*Math.cos(lookPitch)*5);
      GameRetro.hud(cameraAngle,heroModel);
      if(!fighting)checkInteractionProximity();
    }
    if(window.FpsHands)FpsHands.update(inventory.heroClassId,playing,heroModel.isMoving,clock.elapsedTime,modalOpen,heroModel.position);
  }

  // --- EVENT LISTENERS & CONTROLS ---

  function setupPresentationUI() {
    const titleArt=document.getElementById('landingHeroArt');
    titleArt.src=GamePresentation.portrait(renderer,'warrior',true);
    const settingsModal=document.getElementById('visualSettingsModal');
    const quality=document.getElementById('qualitySelect'),motion=document.getElementById('motionToggle');
    quality.value=GamePresentation.settings.quality;motion.checked=GamePresentation.settings.motion;
    document.getElementById('visualSettingsBtn').onclick=()=>{settingsModal.style.display='flex';};
    document.getElementById('closeVisualSettingsBtn').onclick=()=>{settingsModal.style.display='none';};
    quality.onchange=()=>{
      GamePresentation.configure(renderer,{quality:quality.value});
      ambientParticles.geometry.setDrawRange(0,GamePresentation.profile.ambient);
    };
    motion.onchange=()=>{GamePresentation.configure(renderer,{motion:motion.checked});motion.checked=GamePresentation.settings.motion;};
    let activeModal=null,previousFocus=null;
    const overlays=[...document.querySelectorAll('.modal-overlay')];
    const sync=()=>{
      const next=overlays.filter(el=>getComputedStyle(el).display!=='none').pop()||null;
      modalOpen=!!next;
      if(next===activeModal)return;
      keys={};isRightMouseDown=false;if(heroModel)heroModel.isMoving=false;
      hideSkillTooltip();hideBentoTooltip();
      if(next){
        if(!activeModal)previousFocus=document.activeElement;
        next.setAttribute('role','dialog');next.setAttribute('aria-modal','true');
        const title=next.querySelector('h2');if(title){if(!title.id)title.id=next.id+'Title';next.setAttribute('aria-labelledby',title.id);}
        const first=next.querySelector('button,input,select,[tabindex="0"]');if(first)first.focus({preventScroll:true});
      }else if(previousFocus && previousFocus.isConnected){previousFocus.focus({preventScroll:true});}
      activeModal=next;
    };
    const observer=new MutationObserver(sync);
    overlays.forEach(el=>observer.observe(el,{attributes:true,attributeFilter:['style']}));
    document.addEventListener('keydown',e=>{
      if(!activeModal)return;
      if(e.key==='Escape'){
        const close=activeModal.querySelector('.modal-close-btn');
        if(close){e.preventDefault();close.click();}
      }else if(e.key==='Tab'){
        const controls=[...activeModal.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length);
        if(!controls.length)return;
        const first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
      }
    },true);
    sync();
  }


  function setupEvents() {
    window.addEventListener('keydown', e => {
      if (victoryPending || modalOpen || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      if (e.repeat && !['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) return;
      keys[e.code] = true;

      // Interaction key
      if (e.code === 'KeyE' && gameState === 'explore') {
        interactWithNearby();
      }

      // Camera rotate shortcuts
      if (e.code === 'KeyQ'){cameraAim=null;cameraAngle -= Math.PI / 2;}
      if (e.code === 'KeyR'){cameraAim=null;cameraAngle += Math.PI / 2;}

      // Combat hotkeys 1-5, G (Guard), 6 (Flask) & Space
      if (gameState === 'combat' && combat && combat.isPlayerTurn()) {
        if(e.code==='Tab'){e.preventDefault();GameCombatGuide.cycle();}
        if(e.code==='KeyF'||e.code==='Enter'){e.preventDefault();GameCombatGuide.attack();}
        const skills = inventory.getActiveSkills ? inventory.getActiveSkills() : RPG_DATA.CLASSES[inventory.heroClassId].skills;
        if (e.code === 'Digit1') selectSkill(skills[0],true);
        if (e.code === 'Digit2') selectSkill(skills[1],true);
        if (e.code === 'Digit3') selectSkill(skills[2],true);
        if (e.code === 'Digit4') selectSkill(skills[3],true);
        if (e.code === 'Digit5') selectSkill(skills[4],true);
        if (e.code === 'KeyG') useTacticalGuard();
        if (e.code === 'Digit6') useCombatPotion();
        if (e.code === 'Space') endCombatTurn();
      } else if (gameState === 'explore') {
        if (e.code === 'Digit6') useCombatPotion();
      }

      // Tile steps preserve AP and collision rules during first-person combat.
      if(gameState==='combat'&&!e.repeat&&combat?.isPlayerTurn()&&['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
        const hero=combat.combatants.find(c=>c.isPlayer);
        const forward=['KeyW','ArrowUp'].includes(e.code)?1:['KeyS','ArrowDown'].includes(e.code)?-1:0;
        const side=['KeyD','ArrowRight'].includes(e.code)?1:['KeyA','ArrowLeft'].includes(e.code)?-1:0;
        const x=-Math.sin(cameraAngle)*forward+Math.cos(cameraAngle)*side,z=-Math.cos(cameraAngle)*forward-Math.sin(cameraAngle)*side;
        const dx=Math.abs(x)>Math.abs(z)?Math.sign(x):0,dz=dx?0:Math.sign(z);
        if(hero){const gx=hero.gx+dx,gz=hero.gz+dz;if(dungeon.isWalkable(gx,gz)&&!combat.combatants.some(c=>c!==hero&&c.hp>0&&c.gx===gx&&c.gz===gz))combat.moveUnit(hero,gx,gz);}
      }

      // Toggle UI modals
      if (gameState === 'explore') {
        if (e.code === 'KeyI') toggleInventoryModal();
        if (e.code === 'KeyC' || e.code === 'KeyK') toggleCharacterModal();
      }
    });

    window.addEventListener('blur', () => { keys = {}; isRightMouseDown = false; });
    window.addEventListener('keyup', e => {
      keys[e.code] = false;
    });

    // Mouse drag for camera rotation
    window.addEventListener('mousedown', e => {
      GameAudio.resume();
      if (e.button === 2 && e.target === renderer.domElement && !modalOpen) { // Right click
        isRightMouseDown = true;
        mousePrevX = e.clientX;mousePrevY=e.clientY;
      }
    });

    window.addEventListener('mouseup', e => {
      if (e.button === 2) isRightMouseDown = false;
    });

    window.addEventListener('mousemove', e => {
      if (isRightMouseDown) {
        cameraAim=null;
        const deltaX = e.clientX - mousePrevX;
        lookPitch=Math.max(-.85,Math.min(.65,lookPitch-(e.clientY-mousePrevY)*.004));mousePrevY=e.clientY;
        cameraAngle -= deltaX * 0.006;
        mousePrevX = e.clientX;
      }

      // Combat Target Forecast on Hover
      if (e.target === renderer.domElement && !modalOpen && gameState === 'combat' && combat && combat.isActive) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        // 1. Check if hovering over enemy 3D model directly
        const enemyMeshes = [];
        combat.combatants.forEach(c => {
          if (!c.isPlayer && c.hp > 0 && c.model) {
            c.model.traverse(child => {
              if (child.isMesh) {
                child.userData.unitRef = c;
                enemyMeshes.push(child);
              }
            });
          }
        });

        const enemyHits = raycaster.intersectObjects(enemyMeshes, true);
        if (enemyHits.length > 0) {
          let hUnit = null;
          let obj = enemyHits[0].object;
          while (obj) {
            if (obj.userData && obj.userData.unitRef) {
              hUnit = obj.userData.unitRef;
              break;
            }
            obj = obj.parent;
          }
          if (hUnit) {
            combat.showTargetForecast(hUnit.gx, hUnit.gz, hUnit);
            return;
          }
        }

        // 2. Check if hovering over attack tile
        const intersects = raycaster.intersectObjects(combat.gridHighlights, true);
        let foundAttackTile = false;
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (hit.userData.isAttackTile) {
            combat.showTargetForecast(hit.userData.gx, hit.userData.gz, hit.userData.enemyRef);
            foundAttackTile = true;
          }
        }
        if (!foundAttackTile) {
          combat.hideTargetForecast();
        }
      }
    });

    // Camera Zoom Out is disabled to keep close-up visceral/intense combat & exploration framing
    cameraDistance = CAMERA_LOCKED_DISTANCE;
    window.addEventListener('wheel', e => {
      // Zoom out feature disabled permanently
      cameraDistance = CAMERA_LOCKED_DISTANCE;
    }, { passive: true });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', e => e.preventDefault());

    // Tactical Click on Enemies & Grid Tiles in Combat
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', e => {
      if (e.target !== renderer.domElement || modalOpen || gameState !== 'combat' || !combat.isActive || !combat.isPlayerTurn()) return;

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hero = combat.combatants.find(c => c.isPlayer);
      if (!hero) return;

      const skill = combat.selectedSkill || RPG_DATA.CLASSES[inventory.heroClassId].skills[0];

      // 1. Did player click directly on an enemy 3D model?
      const enemyMeshes = [];
      combat.combatants.forEach(c => {
        if (!c.isPlayer && c.hp > 0 && c.model) {
          c.model.traverse(child => {
            if (child.isMesh) {
              child.userData.unitRef = c;
              enemyMeshes.push(child);
            }
          });
        }
      });

      const enemyHits = raycaster.intersectObjects(enemyMeshes, true);
      if (enemyHits.length > 0) {
        let clickedEnemy = null;
        let obj = enemyHits[0].object;
        while (obj) {
          if (obj.userData && obj.userData.unitRef) {
            clickedEnemy = obj.userData.unitRef;
            break;
          }
          obj = obj.parent;
        }

        if (clickedEnemy) {
          combat.tryAttackOrApproach(hero, clickedEnemy, skill);
          return;
        }
      }

      // 2. Did player click on a grid highlight tile?
      const tileHits = raycaster.intersectObjects(combat.gridHighlights, true);
      if (tileHits.length > 0) {
        const hit = tileHits[0].object;
        const targetTileEnemy = hit.userData.enemyRef || combat.combatants.find(c => !c.isPlayer && c.hp > 0 && c.gx === hit.userData.gx && c.gz === hit.userData.gz);

        if (targetTileEnemy) {
          combat.tryAttackOrApproach(hero, targetTileEnemy, skill);
        } else if (hit.userData.isMoveTile) {
          combat.moveUnit(hero, hit.userData.gx, hit.userData.gz);
          combat.showSkillRange(hero, skill);
        }
      }
    });
  }

  function selectSkill(skill,fireSingle=false) {
    if (!combat || !combat.isPlayerTurn() || !skill) return;
    combat.selectedSkill = skill;
    const hero = combat.combatants.find(c => c.isPlayer);
    if (!hero) return;

    if (skill.type === 'self') {
      combat.useSkill(hero, hero, skill);
    } else {
      combat.showSkillRange(hero, skill);
      if(fireSingle)GameCombatGuide.single(skill);
    }
    combat.updateCombatUI();
  }

  function useCombatPotion() {
    if (gameState === 'combat') {
      if (!combat || !combat.isPlayerTurn()) return;
      const hero = combat.combatants.find(c => c.isPlayer);
      if (hero) combat.usePotion(hero);
    } else if (gameState === 'explore') {
      // Drink potion during exploration
      if (inventory.potions <= 0) {
        showNotification(`${GameIcons.svg('warning')} Lentera Flask kosong! Kunjungi Altar Surya atau Tempa Kaelen.`);
        return;
      }
      const stats = inventory.getComputedStats();
      const cur = inventory.currentHp !== undefined ? inventory.currentHp : stats.maxHp;
      if (cur >= stats.maxHp) {
        showNotification(`${GameIcons.svg('spark')} Darah Anda sudah penuh!`);
        return;
      }
      inventory.potions--;
      const healAmt = Math.min(110, Math.round(stats.maxHp * 0.30));
      inventory.currentHp = Math.min(stats.maxHp, cur + healAmt);
      inventory.saveToStorage();
      GameAudio.playHeal();
      if (typeof GameModels !== 'undefined' && GameModels.spawnSkillVFX && heroModel) {
        GameModels.spawnSkillVFX(scene, 'heal', heroModel.position, heroModel.position);
      }
      showNotification(`${GameIcons.svg('flask')} Meminum Lentera Flask (+${healAmt} HP)!`);
      updateHUD();
    }
  }

  function useTacticalGuard() {
    if (!combat || !combat.isPlayerTurn()) return;
    const hero = combat.combatants.find(c => c.isPlayer);
    if (hero) combat.tacticalGuard(hero);
  }

  function endCombatTurn() {
    if (!combat || !combat.isPlayerTurn()) return;
    combat.nextTurn();
  }

  // --- UI SETUP & MODALS ---

  function switchHeroClass(newClassId) {
    if (!RPG_DATA.CLASSES[newClassId]) return;
    const oldPos = heroModel ? heroModel.position.clone() : new THREE.Vector3(0, 0, 0);
    const oldRot = heroModel ? heroModel.rotation.y : 0;

    // Remove old 3D model
    if (heroModel) GamePresentation.disposeTree(heroModel);

    inventory.heroClassId = newClassId;
    inventory.equipped = { weapon: null, offhand: null, armor: null, relic: null };
    inventory.items = [];
    inventory.initStarterEquipment();
    inventory.chosenBuild = 'buildA';
    inventory.initBuild();
    inventory.recalculateSets();

    // Create new 3D model
    heroModel = GameModels.createHero(newClassId);
    heroModel.position.copy(oldPos);
    heroModel.rotation.y = oldRot;
    scene.add(heroModel);
    GamePresentation.buildLights(scene);
    GamePresentation.updateLights(1, heroModel);

    renderSkillButtons();
    updateHUD();
    inventory.saveToStorage();
    showNotification(`${GameIcons.svg('sword')} Kelas berhasil diubah menjadi: ${RPG_DATA.CLASSES[newClassId].name}!`);
  }

  function hydrateStaticIcons(root = document) {
    if (typeof GameIcons === 'undefined') return;
    root.querySelectorAll('[data-icon]').forEach(el => {
      const key = el.getAttribute('data-icon');
      if (key) {
        el.innerHTML = GameIcons.svg(key);
      }
    });
  }

  function setupUI() {
    hydrateStaticIcons(document);
    setupPresentationUI();

    // Landing Page / Title Screen Buttons
    const landing = document.getElementById('landingPage');
    const mainMenu = document.getElementById('landingMainMenu');
    const charSelect = document.getElementById('landingCharSelect');
    const hasSave = localStorage.getItem('ever_deeper_v2_save');
    const contBtn = document.getElementById('continueGameBtn');
    if (hasSave && contBtn) {
      contBtn.style.display = 'inline-flex';
    }

    // 1. "Mulai Ekspedisi Baru" -> Show Character Selection on Landing Page
    document.getElementById('startNewGameBtn').addEventListener('click', () => {
      if (mainMenu) mainMenu.style.display = 'none';
      if (charSelect) charSelect.style.display = 'block';
      document.querySelectorAll('[data-portrait]').forEach(img => { if (!img.src) img.src = GamePresentation.portrait(renderer, img.dataset.portrait, true); });
      GameAudio.playBoonSelect();
    });

    // 2. Back button from Character Selection to Main Menu
    const backBtn = document.getElementById('backToLandingMenuBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (charSelect) charSelect.style.display = 'none';
        if (mainMenu) mainMenu.style.display = 'block';
      });
    }

    // 3. Select Class on Landing Page & Start Expedition
    document.querySelectorAll('.landing-char-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cls = btn.getAttribute('data-class');
        GameAudio.playBoonSelect();
        inventory.reset(cls);
        if (landing) landing.style.display = 'none';
        if (heroModel) GamePresentation.disposeTree(heroModel);
        heroModel = GameModels.createHero(cls);
        scene.add(heroModel);
        renderSkillButtons();
        gameState = 'explore';
        loadFloor(0);
        showNotification(`${GameIcons.svg('sword')} Menuruni Abyss sebagai ${RPG_DATA.CLASSES[cls].name}! Selamatkan Liora!`);
      });
    });

    // 4. "Lanjutkan Ekspedisi" (Continue Saved Game)
    if (contBtn) {
      contBtn.addEventListener('click', () => {
        inventory.loadFromStorage();
        if (landing) landing.style.display = 'none';
        gameState = 'explore';
        if (heroModel) GamePresentation.disposeTree(heroModel);
        heroModel = GameModels.createHero(inventory.heroClassId);
        scene.add(heroModel);
        renderSkillButtons();
        loadFloor(Math.max(0, Math.min(RPG_DATA.FLOORS.length-1, inventory.savedDepth || 0)));
        showNotification(`${GameIcons.svg('scroll')} Ekspedisi dilanjutkan dari catatan lentera!`);
      });
    }

    // 5. Open Lore Guide
    document.getElementById('openLoreGuideBtn').addEventListener('click', () => {
      showLoreModal(0);
    });

    // Action bar buttons
    document.querySelectorAll('.skill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const skIdx = parseInt(btn.getAttribute('data-skill-idx'));
        const skills = inventory.getActiveSkills ? inventory.getActiveSkills() : RPG_DATA.CLASSES[inventory.heroClassId].skills;
        if (skills[skIdx]) selectSkill(skills[skIdx]);
      });
    });

    // In-Game Class Selection Modal (from Header "Ganti Kelas")
    const classModal = document.getElementById('classSelectModal');
    document.getElementById('classSelectBtn').addEventListener('click', () => {
      classModal.style.display = 'flex';
    });
    document.getElementById('closeClassSelectBtn').addEventListener('click', () => {
      classModal.style.display = 'none';
    });
    document.querySelectorAll('.select-class-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cls = btn.getAttribute('data-class');
        switchHeroClass(cls);
        classModal.style.display = 'none';
        showNotification(`${GameIcons.svg('sword')} Kelas berhasil diubah menjadi: ${RPG_DATA.CLASSES[cls].name}!`);
      });
    });

    document.getElementById('potionBtn').addEventListener('click', useCombatPotion);
    document.getElementById('endTurnBtn').addEventListener('click', endCombatTurn);
    const guardBtn = document.getElementById('guardActionBtn');
    if (guardBtn) guardBtn.addEventListener('click', useTacticalGuard);

    document.getElementById('invBtn').addEventListener('click', toggleInventoryModal);
    document.getElementById('charBtn').addEventListener('click', toggleCharacterModal);
    document.getElementById('soundBtn').addEventListener('click', toggleMute);
    document.getElementById('closeInvBtn').addEventListener('click', toggleInventoryModal);
    document.getElementById('closeCharBtn').addEventListener('click', toggleCharacterModal);

    const resetSkillBtn = document.getElementById('resetSkillTreeBtn');
    if (resetSkillBtn) resetSkillBtn.addEventListener('click', onResetSkillTreeClicked);

    // NPC Modal Tab Triggers
    const tabTalk = document.getElementById('npcTabTalk');
    if (tabTalk) tabTalk.addEventListener('click', () => switchNpcTab('talk'));
    const tabServ = document.getElementById('npcTabService');
    if (tabServ) tabServ.addEventListener('click', () => switchNpcTab('service'));
    const tabShop = document.getElementById('npcTabShop');
    if (tabShop) tabShop.addEventListener('click', () => switchNpcTab('shop'));

    function closeLore() {
      document.getElementById('loreModal').style.display = 'none';
      if (gameState === 'dialogue') {
        const landing = document.getElementById('landingPage');
        gameState = (landing && landing.style.display !== 'none') ? 'title' : 'explore';
      }
    }
    document.getElementById('closeLoreBtn').addEventListener('click', closeLore);
    const loreCloseActionBtn = document.getElementById('loreCloseActionBtn');
    if (loreCloseActionBtn) loreCloseActionBtn.addEventListener('click', closeLore);
    document.getElementById('closeVicBtn').addEventListener('click', () => {
      document.getElementById('victoryModal').style.display = 'none';
    });

    const closeNpcBtn = document.getElementById('closeNpcBtn');
    if (closeNpcBtn) {
      closeNpcBtn.addEventListener('click', () => {
        hideBentoTooltip();
        document.getElementById('npcModal').style.display = 'none';
        if (gameState === 'dialogue') gameState = 'explore';
      });
    }

    // Cursed Altar & Cursed Chest Modal Closers
    const closeAltar = () => {
      const m = document.getElementById('cursedAltarModal');
      if (m) m.style.display = 'none';
    };
    const closeAltarBtn = document.getElementById('closeCursedAltarBtn');
    if (closeAltarBtn) closeAltarBtn.onclick = closeAltar;
    const leaveAltarBtn = document.getElementById('leaveCursedAltarBtn');
    if (leaveAltarBtn) leaveAltarBtn.onclick = closeAltar;

    const cancelChestBtn = document.getElementById('cancelCursedChestBtn');
    if (cancelChestBtn) {
      cancelChestBtn.onclick = () => {
        const m = document.getElementById('cursedChestModal');
        if (m) m.style.display = 'none';
      };
    }
    const openCursedChestBtn = document.getElementById('openCursedChestBtn');
    if (openCursedChestBtn) {
      openCursedChestBtn.onclick = () => {
        const m = document.getElementById('cursedChestModal');
        if (m) m.style.display = 'none';
        if (activeCursedChestEntity) {
          startCursedAmbush(activeCursedChestEntity);
        }
      };
    }

    // Bounty Board Modal Closers & Tracker Pill Trigger
    const bountyTrackerBtn = document.getElementById('bountyTrackerBtn');
    if (bountyTrackerBtn) {
      bountyTrackerBtn.onclick = () => showBountyBoardModal();
    }
    const closeBountyBtn = document.getElementById('closeBountyBoardBtn');
    if (closeBountyBtn) {
      closeBountyBtn.onclick = () => {
        const m = document.getElementById('bountyBoardModal');
        if (m) m.style.display = 'none';
      };
    }

    renderSkillButtons();
  }

  function renderSkillButtons() {
    const skills = inventory.getActiveSkills ? inventory.getActiveSkills() : RPG_DATA.CLASSES[inventory.heroClassId].skills;
    skills.forEach((sk, idx) => {
      const btn = document.querySelector(`.skill-btn[data-skill-idx="${idx}"]`);
      if (btn) {
        const nameEl = btn.querySelector('.skill-name');
        const costEl = btn.querySelector('.skill-cost');
        const icEl = btn.querySelector('.skill-ic');
        const rangeEl = btn.querySelector('.skill-range-badge');
        const tagEl = btn.querySelector('.skill-tag-pill');

        if (nameEl) nameEl.textContent = sk.name.split(' (')[0];
        if (costEl) costEl.textContent = `${sk.cost} AP`;
        if (icEl) {
          icEl.innerHTML = GameIcons.svg(sk.icon || 'sword', 'fantasy-icon icon-md');
        }
        if (rangeEl) {
          rangeEl.textContent = sk.range === 0 ? 'Diri' : `${sk.range} petak${sk.area ? ' · area' : ''}`;
        }
        if (tagEl) {
          tagEl.innerHTML = GameIcons.formatTag(sk.tag || 'Skill');
        }

        // Hover tooltip events for responsive details
        btn.onmouseenter = () => showSkillTooltip(sk, btn);
        btn.onfocus = () => showSkillTooltip(sk, btn);
        btn.onblur = hideSkillTooltip;
        btn.setAttribute("aria-label", `${sk.name}, ${sk.cost} AP, jangkauan ${sk.range} petak`);
        btn.onmouseleave = () => hideSkillTooltip();
      }
    });

    if (combat && combat.isActive) {
      combat.updateCombatUI();
    }
  }

  function updateHUD() {
    const bottomBar = document.getElementById('gameBottomBar');
    if (!bottomBar) return;

    if (gameState === 'title') {
      document.body.dataset.screen = 'title';
      bottomBar.style.display = 'none';
      return;
    }

    document.body.dataset.screen = "game";
    document.getElementById("heroClassLabel").textContent = RPG_DATA.CLASSES[inventory.heroClassId].name.split(" (")[0];
    document.getElementById("heroLevelLabel").textContent = "Lv. " + inventory.level;
    bottomBar.style.display = 'flex';

    const endTurnBtn = document.getElementById('endTurnBtn');
    const apLabel = document.getElementById('heroStatusLabel');
    const apOrbs = document.getElementById('heroApOrbs');
    const hpFill = document.getElementById('heroHpFill');
    const hpText = document.getElementById('heroHpText');
    const poiseFill = document.getElementById('heroPoiseFill');
    const potionSub = document.getElementById('potionSub');
    const potionBtn = document.getElementById('potionBtn');
    const guardBtn = document.getElementById('guardActionBtn');

    if (potionSub) {
      potionSub.textContent = `${inventory.potions}/${inventory.maxPotions} Flask • +30% HP (maks. 110)`;
    }
    if (potionBtn) {
      if (inventory.potions <= 0) {
        potionBtn.style.opacity = '0.5';
        potionBtn.style.cursor = 'not-allowed';
      } else {
        potionBtn.style.opacity = '1';
        potionBtn.style.cursor = 'pointer';
      }
    }

    if (gameState === 'combat' && combat && combat.isActive) {
      if (endTurnBtn) endTurnBtn.style.display = 'flex';
      if (apLabel) apLabel.textContent = 'ACTION POINTS:';
      if (guardBtn) {
        guardBtn.style.opacity = '1';
        guardBtn.style.cursor = 'pointer';
        guardBtn.title = 'Gunakan 1 AP untuk kuda-kuda kokoh (+10 DEF, +20 Poise, -30% DMG)';
      }
      combat.updateCombatUI();
    } else {
      // In exploration or dialogue mode
      if (endTurnBtn) endTurnBtn.style.display = 'none';
      if (apLabel) apLabel.textContent = 'STATUS:';
      if (apOrbs) {
        apOrbs.innerHTML = `<span class="status-ready-tag">${GameIcons.svg('sword', 'fantasy-icon icon-xs')} SIAGA JELAJAH</span>`;
      }
      if (guardBtn) {
        guardBtn.style.opacity = '0.75';
        guardBtn.style.cursor = 'default';
        guardBtn.title = 'Kuda-Kuda Tempur: Siap siaga memasuki pertarungan';
      }

      // Compute hero stats
      const stats = inventory.getComputedStats();
      const currentHp = inventory.currentHp !== undefined ? inventory.currentHp : stats.maxHp;
      if (hpFill && hpText) {
        const pct = Math.max(0, Math.min(100, (currentHp / stats.maxHp) * 100));
        hpFill.style.width = `${pct}%`;
        hpText.textContent = `${currentHp}/${stats.maxHp}`;
      }
      if (poiseFill) {
        poiseFill.style.width = '100%';
      }

      // Refresh skill set buttons state in exploration
      const skills = inventory.getActiveSkills ? inventory.getActiveSkills() : RPG_DATA.CLASSES[inventory.heroClassId].skills;
      skills.forEach((sk, idx) => {
        const btn = document.querySelector(`.skill-btn[data-skill-idx="${idx}"]`);
        if (!btn) return;
        btn.classList.remove('active-skill', 'no-ap');
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        const costEl = btn.querySelector('.skill-cost');
        if (costEl) costEl.style.color = '#38bdf8';
        btn.classList.remove('on-cooldown');
      });
    }

    // Refresh Bounty Tracker Pill in Header
    const bountyPill = document.getElementById('bountyTrackerBtn');
    const bountyText = document.getElementById('bountyTrackerText');
    if (bountyPill && bountyText) {
      const floorNum = currentFloorIndex + 1;
      const bDef = RPG_DATA.BOUNTIES && RPG_DATA.BOUNTIES[floorNum];
      if (bDef) {
        bountyPill.style.display = 'inline-flex';
        const isDone = inventory.isBountyCompleted(bDef.id);
        if (isDone) {
          bountyPill.className = 'bounty-tracker-pill completed';
          bountyText.textContent = `BURONAN: ${bDef.name} (TERTUMPAS ✓)`;
        } else {
          bountyPill.className = 'bounty-tracker-pill';
          bountyText.textContent = `BURONAN: ${bDef.name} (BELUM DITUNTASKAN)`;
        }
      } else {
        bountyPill.style.display = 'none';
      }
    }
  }

  function showSkillTooltip(skill, btn) {
    const tooltip = document.getElementById('skillTooltip');
    if (!tooltip || !skill) return;

    const stats = inventory.getComputedStats();
    const estDmg = skill.dmgMult ? Math.round(stats.atk * skill.dmgMult) : 0;
    const hero = combat && combat.combatants ? combat.combatants.find(c => c.isPlayer) : null;
    const cdRemaining = (hero && hero.cooldowns && hero.cooldowns[skill.id]) || 0;
    const cdText = skill.cooldown
      ? (cdRemaining > 0
          ? `<span style="color:#ef4444;">${GameIcons.svg('hourglass', 'fantasy-icon icon-xs')} Cooldown: ${cdRemaining} Giliran Lagi</span>`
          : `<span style="color:#22c55e;">${GameIcons.svg('hourglass', 'fantasy-icon icon-xs')} CD: ${skill.cooldown} Giliran (Siap)</span>`)
      : `<span style="color:#22c55e;">Tanpa Cooldown</span>`;

    const adrenStatus = skill.adrenalineReq
      ? `<div style="margin-top:6px; color:#fde047; font-weight:bold;">${GameIcons.svg('lightning', 'fantasy-icon icon-xs')} Syarat Adrenaline: ${(hero ? Math.min(100, hero.adrenaline || 0) : 0)} / 100% ${(hero && hero.adrenaline >= 100 ? '→ SIAP DIPICU!' : '→ Kumpulkan dengan bertarung!')}</div>`
      : '';

    document.body.appendChild(tooltip);
    tooltip.style.display = 'block';
    document.body.classList.add('skill-tooltip-open');
    const barTop = document.getElementById('gameBottomBar').getBoundingClientRect().top;
    tooltip.style.setProperty('--tooltip-bottom', Math.max(12, innerHeight - barTop + 12) + 'px');
    tooltip.style.setProperty('--tooltip-room', Math.max(80, barTop - 28) + 'px');
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <div class="tooltip-title">
          ${GameIcons.svg(skill.icon || 'sword', 'fantasy-icon icon-md')}
          <span>${skill.name}</span>
        </div>
        <span class="tooltip-type-badge">${skill.typeTag || 'Taktis'}</span>
      </div>
      <div class="tooltip-stats-grid">
        <div class="tooltip-stat-item">Biaya AP: <b>${GameIcons.svg('lightning', 'fantasy-icon icon-xs')} ${skill.cost} AP</b></div>
        <div class="tooltip-stat-item">Jangkauan: <b>${skill.rangeTag || (skill.range === 0 ? 'Diri Sendiri' : skill.range + ' Petak')}</b></div>
        <div class="tooltip-stat-item">Status CD: <b>${cdText}</b></div>
        <div class="tooltip-stat-item">Kekuatan: <b>${skill.dmgMult ? (skill.dmgMult + 'x ATK (~' + estDmg + ' DMG)') : 'Buff / Bertahan'}</b></div>
        <div class="tooltip-stat-item">Poise Dmg: <b>${GameIcons.svg('shield', 'fantasy-icon icon-xs')} ${skill.poiseDmg || 0} Poise</b></div>
        <div class="tooltip-stat-item">Tipe Target: <b>${skill.area ? 'Area (3x3 AoE)' : (skill.range === 0 ? 'Diri Sendiri' : 'Satu Target')}</b></div>
      </div>
      <div class="tooltip-desc">${skill.desc || ''}</div>
      <div class="tooltip-condition-box">
        <b>${GameIcons.svg('spark', 'fantasy-icon icon-xs')} Aturan Serangan Bersyarat:</b><br>
        ${skill.conditionText || 'Flank (+25% DMG dari samping) dan Backstab (100% Critical Hit +50% DMG dari belakang musuh) berlaku!'}
      </div>
      ${adrenStatus}
    `;
  }

  function hideSkillTooltip() {
    document.body.classList.remove('skill-tooltip-open');
    const tooltip = document.getElementById('skillTooltip');
    if (tooltip) tooltip.style.display = 'none';
  }
  window.addEventListener('resize', hideSkillTooltip);

  // --- UNIVERSAL BENTO FLOATING TOOLTIP ENGINE (ZERO TEXT OVERLOAD) ---
  function showItemTooltip(e, item, source = 'bag') {
    const tip = document.getElementById('bentoTooltip');
    if (!tip || !item) return;

    const forgeLvl = item.forgeLevel || 0;
    const slotNames = {
      weapon: 'Senjata Utama',
      offhand: 'Tangan Kiri',
      armor: 'Zirah Pelindung',
      relic: 'Relik / Jimat'
    };
    const slotName = slotNames[item.slot] || item.slot || 'Peralatan';

    // Stats breakdown
    let forgeBonusHtml = '';
    if (forgeLvl > 0) {
      if (item.slot === 'weapon') forgeBonusHtml = `Bonus Tempa (+${forgeLvl}): +${forgeLvl * 4} ATK, +${forgeLvl * 4} Poise`;
      else if (item.slot === 'armor') forgeBonusHtml = `Bonus Tempa (+${forgeLvl}): +${forgeLvl * 3} DEF, +${forgeLvl * 12} Max HP, +${forgeLvl * 3} Poise`;
      else if (item.slot === 'offhand') forgeBonusHtml = `Bonus Tempa (+${forgeLvl}): +${forgeLvl * 2} DEF, ${(item.atk ? `+${forgeLvl * 2} ATK, ` : '')}+${forgeLvl * 3} Poise`;
      else if (item.slot === 'relic') forgeBonusHtml = `Bonus Tempa (+${forgeLvl}): ${(item.atk ? `+${forgeLvl * 2} ATK, ` : '')}${(item.def ? `+${forgeLvl * 2} DEF, ` : '')}${(item.hp ? `+${forgeLvl * 10} HP` : '+5 Poise')}`;
    }

    // Set description
    let setHtml = '';
    if (item.set && RPG_DATA.SETS && RPG_DATA.SETS[item.set]) {
      const s = RPG_DATA.SETS[item.set];
      setHtml = `
        <div class="bento-tip-set">
          <div style="font-weight:bold; color:#fde047; margin-bottom:2px;">Set: ${s.name}</div>
          <div style="color:#fae8d4; font-size:10px;">• (2P): ${s.bonuses && s.bonuses[2] ? s.bonuses[2].desc : ''}</div>
          <div style="color:#fae8d4; font-size:10px;">• (4P): ${s.bonuses && s.bonuses[4] ? s.bonuses[4].desc : ''}</div>
        </div>
      `;
    }

    // Base stat rows
    const statRows = [];
    if (item.atk) statRows.push(`<span>${GameIcons.svg('sword', 'fantasy-icon icon-xs')} ATK:</span><span class="bento-tip-stat-val" style="color:#fca5a5;">+${item.atk}</span>`);
    if (item.def) statRows.push(`<span>${GameIcons.svg('shield', 'fantasy-icon icon-xs')} DEF:</span><span class="bento-tip-stat-val" style="color:#93c5fd;">+${item.def}</span>`);
    if (item.hp) statRows.push(`<span>${GameIcons.svg('blood', 'fantasy-icon icon-xs')} Max HP:</span><span class="bento-tip-stat-val" style="color:#86efac;">+${item.hp}</span>`);
    if (item.poise) statRows.push(`<span>${GameIcons.svg('fortress', 'fantasy-icon icon-xs')} Poise:</span><span class="bento-tip-stat-val" style="color:#fed7aa;">+${item.poise}</span>`);
    if (item.crit) statRows.push(`<span>${GameIcons.svg('lightning', 'fantasy-icon icon-xs')} Crit:</span><span class="bento-tip-stat-val" style="color:#fde047;">+${Math.round(item.crit * 100)}%</span>`);
    if (item.move) statRows.push(`<span>${GameIcons.svg('footsteps', 'fantasy-icon icon-xs')} Gerak:</span><span class="bento-tip-stat-val" style="color:#d8b4fe;">+${item.move} Petak</span>`);

    let footerText = '';
    if (source === 'bag') {
      const sellVal = Math.max(10, Math.round((item.price || 40) * 0.45));
      footerText = `<span>Klik Pasang untuk memakai</span><span>Jual: +${sellVal} Gold</span>`;
    } else if (source === 'equipped') {
      footerText = `<span>Status: Terpasang Aktif</span><span>Tempa di Kaelen</span>`;
    } else if (source === 'shop') {
      footerText = `<span>Harga Beli: ${item.price || 100} Gold</span><span>Klik Beli untuk mengambil</span>`;
    }

    tip.innerHTML = `
      <div class="bento-tip-head">
        <div class="bento-tip-icon-box rarity-${item.rarity || 'common'}">
          ${GameIcons.svg(item.icon, 'fantasy-icon icon-md')}
        </div>
        <div class="bento-tip-title-box">
          <div class="bento-tip-title">
            <span>${item.name}</span>
            ${forgeLvl > 0 ? `<span class="forge-badge">+${forgeLvl}</span>` : ''}
          </div>
          <div class="bento-tip-tags">
            <span class="rarity-pill ${item.rarity || 'common'}">${item.rarity || 'common'}</span>
            <span style="font-size:10px; color:#a68d91; font-family:var(--font-mono);">${slotName}</span>
          </div>
        </div>
      </div>
      <div class="bento-tip-desc">"${item.desc || 'Perlengkapan peninggalan era fajar.'}"</div>
      ${statRows.length > 0 ? `
        <div class="bento-tip-stats">
          ${statRows.map(r => `<div class="bento-tip-stat-row">${r}</div>`).join('')}
          ${forgeBonusHtml ? `<div class="bento-tip-forge-bonus">${GameIcons.svg('hammer', 'fantasy-icon icon-xs')} ${forgeBonusHtml}</div>` : ''}
        </div>
      ` : ''}
      ${setHtml}
      ${footerText ? `<div class="bento-tip-footer">${footerText}</div>` : ''}
    `;

    positionBentoTooltip(e);
  }

  function showTreeSkillTooltip(e, node, branch) {
    const tip = document.getElementById('bentoTooltip');
    if (!tip || !node) return;

    const isMastered = inventory.unlockedNodes.includes(node.id);
    const canUnlock = inventory.canUnlockNode(node.id);

    let reqNodeName = '';
    if (node.req) {
      const reqNode = inventory.findSkillNode(node.req);
      if (reqNode) reqNodeName = reqNode.name.split(' (')[0];
    }

    tip.innerHTML = `
      <div class="bento-tip-head">
        <div class="bento-tip-icon-box" style="border-color:${branch && branch.color ? branch.color : '#f59e0b'};">
          ${GameIcons.svg(node.icon, 'fantasy-icon icon-md')}
        </div>
        <div class="bento-tip-title-box">
          <div class="bento-tip-title" style="color:${branch && branch.color ? branch.color : '#fef08a'};">
            <span>${node.name}</span>
          </div>
          <div class="bento-tip-tags">
            <span class="node-tier-pill">Tier ${node.tier}</span>
            <span class="node-type-pill ${node.type === 'passive' ? 'passive-type' : ''}">${node.type === 'passive' ? 'PASIF' : (node.slotIdx !== undefined ? `AKTIF Slot ${node.slotIdx + 1}` : 'AKTIF')}</span>
            <span style="font-size:10px; color:#facc15; font-family:var(--font-mono); font-weight:bold;">1 SP</span>
          </div>
        </div>
      </div>
      <div class="bento-tip-desc" style="font-style:normal; color:#e2d5d8;">${node.desc}</div>
      ${node.type !== 'passive' ? `
        <div class="bento-tip-stats">
          <div class="bento-tip-stat-row">
            <span>Biaya AP:</span><span class="bento-tip-stat-val" style="color:#fde047;">${node.ap || 1} AP</span>
          </div>
          <div class="bento-tip-stat-row">
            <span>Jangkauan:</span><span class="bento-tip-stat-val" style="color:#67e8f9;">${node.range ? node.range + ' Petak' : '1 Petak (Melee)'}</span>
          </div>
          <div class="bento-tip-stat-row">
            <span>Cooldown:</span><span class="bento-tip-stat-val" style="color:#f472b6;">${node.cd ? node.cd + ' Turn' : 'Tanpa CD'}</span>
          </div>
        </div>
      ` : ''}
      ${node.req ? `
        <div style="font-size:11px; margin-top:6px; color:${canUnlock || isMastered ? '#86efac' : '#f87171'}; font-family:var(--font-mono);">
          ${isMastered ? '✓ Syarat Terpenuhi' : (canUnlock ? '✓ Syarat Terpenuhi' : `🔒 Memerlukan: ${reqNodeName}`)}
        </div>
      ` : ''}
      <div class="bento-tip-footer">
        <span>${branch ? branch.name : 'Skill Tree'}</span>
        <span style="color:${isMastered ? '#10b981' : (canUnlock ? '#f59e0b' : '#9ca3af')}; font-weight:bold;">
          ${isMastered ? '✓ Dikuasai' : (canUnlock ? 'Dapat Dibuka' : 'Terkunci')}
        </span>
      </div>
    `;

    positionBentoTooltip(e);
  }

  function positionBentoTooltip(e) {
    const tip = document.getElementById('bentoTooltip');
    if (!tip) return;
    tip.style.display = 'block';

    const tipWidth = tip.offsetWidth || 300;
    const tipHeight = tip.offsetHeight || 220;
    let x = e.clientX + 16;
    let y = e.clientY + 16;

    if (x + tipWidth > window.innerWidth - 12) {
      x = e.clientX - tipWidth - 16;
    }
    if (y + tipHeight > window.innerHeight - 12) {
      y = window.innerHeight - tipHeight - 12;
    }
    if (x < 12) x = 12;
    if (y < 12) y = 12;

    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  }

  function hideBentoTooltip() {
    const tip = document.getElementById('bentoTooltip');
    if (tip) tip.style.display = 'none';
  }

  function toggleInventoryModal() {
    const modal = document.getElementById('inventoryModal');
    const isVisible = modal.style.display === 'flex';
    modal.style.display = isVisible ? 'none' : 'flex';
    hideBentoTooltip();
    if (!isVisible) renderInventoryUI();
  }

  function renderInventoryUI() {
    const slotLabels = {
      weapon: `${GameIcons.svg('sword', 'fantasy-icon icon-xs')} Senjata Utama`,
      offhand: `${GameIcons.svg('shield', 'fantasy-icon icon-xs')} Tangan Kiri`,
      armor: `${GameIcons.svg('armor', 'fantasy-icon icon-xs')} Zirah Pelindung`,
      relic: `${GameIcons.svg('ring', 'fantasy-icon icon-xs')} Relik / Jimat`
    };

    // Equip slots (Bento Quadrant Cards)
    ['weapon', 'offhand', 'armor', 'relic'].forEach(slot => {
      const slotEl = document.getElementById(`slot_${slot}`);
      const item = inventory.equipped[slot];
      if (!slotEl) return;

      if (item) {
        const forgeBadge = item.forgeLevel > 0 ? `<span class="forge-badge">+${item.forgeLevel}</span>` : '';
        let quickStats = '';
        if (item.atk) quickStats += `<span class="bento-chip atk">+${item.atk} ATK</span>`;
        if (item.def) quickStats += `<span class="bento-chip def">+${item.def} DEF</span>`;
        if (item.hp) quickStats += `<span class="bento-chip hp">+${item.hp} HP</span>`;

        slotEl.className = `equip-slot rarity-${item.rarity || 'common'}`;
        slotEl.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="bento-tip-icon-box rarity-${item.rarity || 'common'}" style="width:36px; height:36px;">
              ${GameIcons.svg(item.icon, 'fantasy-icon icon-sm')}
            </div>
            <div>
              <div style="font-size:10px; color:#a68d91;">${slotLabels[slot]}</div>
              <div style="font-weight:bold; font-size:13px; color:#fde047; display:flex; align-items:center; gap:6px;">
                <span>${item.name}</span>
                ${forgeBadge}
              </div>
              <div class="bento-chips-row" style="margin:2px 0 0;">${quickStats}</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
            <span class="rarity-pill ${item.rarity || 'common'}">${item.rarity || 'common'}</span>
            <button class="hud-btn unequip-btn" style="padding:2px 8px; font-size:10px; background:#221519;">Lepas</button>
          </div>
        `;

        slotEl.onmouseenter = (e) => showItemTooltip(e, item, 'equipped');
        slotEl.onmousemove = (e) => positionBentoTooltip(e);
        slotEl.onmouseleave = () => hideBentoTooltip();

        const unequipBtn = slotEl.querySelector('.unequip-btn');
        if (unequipBtn) {
          unequipBtn.onclick = (e) => {
            e.stopPropagation();
            hideBentoTooltip();
            inventory.unequipItem(slot);
            GameAudio.playShieldBlock();
            renderInventoryUI();
            inventory.saveToStorage();
          };
        }
      } else {
        slotEl.className = 'equip-slot empty';
        slotEl.innerHTML = `
          <div>
            <div style="font-size:10px; color:#a68d91;">${slotLabels[slot]}</div>
            <div class="empty-slot" style="color:#665558; font-size:12px; margin-top:2px;">(Slot Kosong)</div>
          </div>
          <span style="font-size:10px; color:#4a353c;">—</span>
        `;
        slotEl.onmouseenter = null;
        slotEl.onmousemove = null;
        slotEl.onmouseleave = null;
      }
    });

    // Bag items (Bento Grid Tiles - Zero Text Overload)
    const bagEl = document.getElementById('inventoryBag');
    bagEl.innerHTML = '';
    if (inventory.items.length === 0) {
      bagEl.innerHTML = '<div style="color:#8c7378; font-size:12px; padding:12px; grid-column:1/-1; text-align:center;">Tas kosong. Kalahkan monster atau buka peti untuk mendapatkan jarahan!</div>';
    }

    inventory.items.forEach((item, idx) => {
      const sellVal = Math.max(10, Math.round((item.price || 40) * 0.45));
      const forgeBadge = item.forgeLevel > 0 ? `<span class="forge-badge">+${item.forgeLevel}</span>` : '';
      let statChips = '';
      if (item.atk) statChips += `<span class="bento-chip atk">+${item.atk} ATK</span>`;
      if (item.def) statChips += `<span class="bento-chip def">+${item.def} DEF</span>`;
      if (item.hp) statChips += `<span class="bento-chip hp">+${item.hp} HP</span>`;
      if (item.poise) statChips += `<span class="bento-chip poise">+${item.poise} Poise</span>`;
      if (item.crit) statChips += `<span class="bento-chip crit">+${Math.round(item.crit * 100)}% Crit</span>`;
      if (item.set) statChips += `<span class="bento-chip set">[${item.set.toUpperCase()}]</span>`;

      const card = document.createElement('div');
      card.className = `bag-item-card bento-card rarity-${item.rarity || 'common'}`;
      card.innerHTML = `
        <div>
          <div class="card-head">
            <span style="display:flex; align-items:center; gap:8px;">
              <span class="bento-tip-icon-box" style="width:32px; height:32px; font-size:16px;">
                ${GameIcons.svg(item.icon, 'fantasy-icon icon-sm')}
              </span>
              <b style="font-size:12.5px; color:#fef08a;">${item.name} ${forgeBadge}</b>
            </span>
            <span class="rarity-pill ${item.rarity || 'common'}">${item.rarity || 'common'}</span>
          </div>
          <div class="bento-chips-row">${statChips}</div>
        </div>
        <div class="item-actions-row" style="margin-top:6px;">
          <button class="equip-btn" style="flex:1;">Pasang</button>
          <button class="sell-btn" title="Jual barang">${GameIcons.svg('coin', 'fantasy-icon icon-xs')} +${sellVal}</button>
        </div>
      `;

      card.onmouseenter = (e) => showItemTooltip(e, item, 'bag');
      card.onmousemove = (e) => positionBentoTooltip(e);
      card.onmouseleave = () => hideBentoTooltip();

      card.querySelector('.equip-btn').onclick = (e) => {
        e.stopPropagation();
        hideBentoTooltip();
        inventory.equipItem(item);
        GameAudio.playShieldBlock();
        renderInventoryUI();
        inventory.saveToStorage();
      };

      card.querySelector('.sell-btn').onclick = (e) => {
        e.stopPropagation();
        hideBentoTooltip();
        inventory.items.splice(idx, 1);
        inventory.gold += sellVal;
        GameAudio.playChestOpen();
        showNotification(`${GameIcons.svg('coin')} Menjual ${item.name} seharga +${sellVal} Gold!`);
        renderInventoryUI();
        inventory.saveToStorage();
      };

      bagEl.appendChild(card);
    });

    // Stats summary
    const stats = inventory.getComputedStats();
    document.getElementById('invStats').innerHTML = `
      <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; align-items:center;">
        <span>
          ${GameIcons.svg('sword', 'fantasy-icon icon-xs')} ATK: <b style="color:#fca5a5;">${stats.atk}</b> | 
          ${GameIcons.svg('shield', 'fantasy-icon icon-xs')} DEF: <b style="color:#93c5fd;">${stats.def}</b> | 
          ${GameIcons.svg('blood', 'fantasy-icon icon-xs')} Max HP: <b style="color:#86efac;">${stats.maxHp}</b> |
          ${GameIcons.svg('fortress', 'fantasy-icon icon-xs')} Poise: <b style="color:#fed7aa;">${stats.maxPoise}</b>
        </span>
        <span>
          ${GameIcons.svg('hammer', 'fantasy-icon icon-xs')} Tempa Karakter: <b style="color:#fde047;">+${inventory.forgeLevel || 0}</b> | 
          ${GameIcons.svg('coin', 'fantasy-icon icon-xs')} Gold: <b style="color:#fbbf24;">${inventory.gold}</b> | 
          ${GameIcons.svg('flask', 'fantasy-icon icon-xs')} Flask: <b>${inventory.potions}/${inventory.maxPotions}</b>
        </span>
      </div>
    `;

    // Active Sets
    const setList = document.getElementById('invSets');
    setList.innerHTML = '';
    if (inventory.activeSetBonuses.length === 0) {
      setList.innerHTML = '<span class="muted" style="font-size:12px; color:#8c7378;">Tidak ada efek set aktif. Kumpulkan 2 atau 4 perlengkapan dari set yang sama!</span>';
    } else {
      inventory.activeSetBonuses.forEach(b => {
        const item = document.createElement('div');
        item.className = 'set-badge';
        item.innerHTML = `${GameIcons.svg(b.set === 'blood' ? 'blood' : (b.set === 'shadow' ? 'shadow' : 'fortress'), 'fantasy-icon icon-xs')} <b>${b.name} (${b.tier}P):</b> ${b.desc}`;
        setList.appendChild(item);
      });
    }
  }

  function toggleCharacterModal() {
    hideBentoTooltip();
    const modal = document.getElementById('characterModal');
    const isVisible = modal.style.display === 'flex';
    modal.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
      const cDef = RPG_DATA.CLASSES[inventory.heroClassId];
      const stats = inventory.getComputedStats();
      document.getElementById('charClassName').textContent = cDef.name;
      document.getElementById('charTitle').textContent = cDef.title;
      document.getElementById('charDesc').textContent = cDef.desc;
      document.getElementById('charLvl').textContent = `Level ${inventory.level} (EXP: ${inventory.exp}/${inventory.expNext})`;
      document.getElementById('charDetails').innerHTML = `
        <div>Max HP: <b>${stats.maxHp}</b> | Max Poise: <b>${stats.maxPoise}</b></div>
        <div>ATK: <b>${stats.atk}</b> | DEF: <b>${stats.def}</b></div>
        <div>Critical Chance: <b>${Math.round(stats.critChance * 100)}%</b> | Movement: <b>${stats.moveRange} petak</b></div>
      `;

      // Build Specialization Selector
      const builds = RPG_DATA.CLASS_BUILDS[inventory.heroClassId];
      const selector = document.getElementById('charBuildSelector');
      if (selector && builds) {
        selector.innerHTML = '';
        Object.keys(builds).forEach(bKey => {
          const b = builds[bKey];
          if (!b) return;
          const btn = document.createElement('div');
          btn.className = `build-toggle-btn ${inventory.chosenBuild === bKey ? 'active-build' : ''}`;
          btn.innerHTML = `
            <b style="display:flex; align-items:center; gap:6px;">
              ${GameIcons.svg(b.icon, 'fantasy-icon icon-sm')}
              <span>${b.name}</span>
            </b>
            <p>${b.desc}</p>
          `;
          btn.onclick = () => {
            inventory.setBuild(bKey);
            toggleCharacterModal();
            toggleCharacterModal();
            showNotification(`${GameIcons.svg('sword')} Spesialisasi Build diubah ke: ${b.name}!`);
          };
          selector.appendChild(btn);
        });
      }

      // Active Passives List
      const passivesList = document.getElementById('charPassivesList');
      if (passivesList && builds) {
        passivesList.innerHTML = '';
        const currBuild = builds[inventory.chosenBuild];
        if (currBuild) {
          currBuild.passives.forEach(p => {
            const pEl = document.createElement('div');
            pEl.className = 'set-badge';
            pEl.innerHTML = `<b>${p.name}:</b> ${p.desc}`;
            passivesList.appendChild(pEl);
          });
        }
      }

      // Acquired Boons List
      const boonsList = document.getElementById('charBoonsList');
      if (boonsList) {
        if (inventory.boons.length === 0) {
          boonsList.innerHTML = '<span class="muted">Belum ada Berkat Surya. Naikkan level untuk memilih berkat!</span>';
        } else {
          boonsList.innerHTML = inventory.boons.map(bId => {
            const b = RPG_DATA.LEVEL_UP_BOONS.find(x => x.id === bId);
            return b ? `<div style="margin-bottom:6px; display:flex; align-items:center; gap:6px;">${GameIcons.svg(b.icon, 'fantasy-icon icon-xs')} <b>${b.name}:</b> <span>${b.desc}</span></div>` : '';
          }).join('');
        }
      }

      // Render Interactive Dual-Branch Skill Tree
      renderSkillTree();
    }
  }

  // --- INTERACTIVE SKILL TREE RENDERER (UPGRADED 3 SUBCLASSES & BENTO BOX) ---
  function renderSkillTree() {
    const container = document.getElementById('skillTreeContainer');
    const badge = document.getElementById('skillPointsBadge');
    if (!container) return;

    if (badge) {
      badge.innerHTML = `${GameIcons.svg('spark', 'fantasy-icon icon-xs')} ${inventory.skillPoints || 0} Poin Skill Tersedia`;
    }

    container.innerHTML = '';
    const tree = RPG_DATA.SKILL_TREES && RPG_DATA.SKILL_TREES[inventory.heroClassId];
    if (!tree) {
      container.innerHTML = '<div style="color:#a68d91; padding:20px;">Skill Tree belum tersedia untuk kelas ini.</div>';
      return;
    }

    const branches = Object.values(tree).filter(Boolean);
    const activeSubclass = inventory.getEffectiveSubclass ? inventory.getEffectiveSubclass() : null;

    branches.forEach(branch => {
      const bEl = document.createElement('div');
      bEl.className = 'skill-tree-branch';
      bEl.style.borderColor = branch.color ? `${branch.color}55` : '#3d242d';

      const isCurrentActive = activeSubclass && activeSubclass.id === branch.id;

      bEl.innerHTML = `
        <div class="skill-tree-branch-header">
          <div class="branch-icon-box" style="background:${branch.color}22; border:1px solid ${branch.color}; color:${branch.color};">
            ${GameIcons.svg(branch.icon, 'fantasy-icon icon-md')}
          </div>
          <div style="flex:1;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
              <div class="branch-title-text" style="color:${branch.color || '#fff'}; font-size:13.5px;">${branch.name}</div>
              ${isCurrentActive ? `<span class="subclass-active-badge">SUBCLASS AKTIF</span>` : ''}
            </div>
            <div class="branch-subtitle-text">${branch.subclassName || 'Spesialisasi'} • 4 Tingkatan</div>
          </div>
        </div>

        ${branch.mechanic ? `
          <div class="subclass-mechanic-card" style="border-left-color: ${branch.color || '#eab308'}; padding:8px 12px; margin-bottom:10px;">
            <div class="smc-header" style="margin-bottom:2px;">
              <span class="smc-badge" style="background:${branch.color}25; color:${branch.color};">MEKANIK SUBCLASS</span>
              <span class="smc-title" style="font-size:12.5px;">${branch.mechanic.name}</span>
            </div>
            <div class="smc-desc" style="font-size:11px; line-height:1.4; color:#d1c2c5;">${branch.mechanic.desc}</div>
          </div>
        ` : ''}

        <div class="skill-tree-nodes-list" id="nodes_${branch.id}"></div>
      `;

      const nodesList = bEl.querySelector(`#nodes_${branch.id}`);

      branch.nodes.forEach(node => {
        const isMastered = inventory.unlockedNodes.includes(node.id);
        const canUnlock = inventory.canUnlockNode(node.id);
        const isLocked = !isMastered && !canUnlock;

        let reqNodeName = '';
        if (node.req) {
          const reqNode = inventory.findSkillNode(node.req);
          if (reqNode) reqNodeName = reqNode.name.split(' (')[0];
        }

        const nodeCard = document.createElement('div');
        nodeCard.className = `skill-tree-node bento-node ${isMastered ? 'node-mastered' : (canUnlock ? 'node-available' : 'node-locked')}`;

        nodeCard.innerHTML = `
          <div class="skill-node-header">
            <span class="node-tier-pill">Tier ${node.tier}</span>
            <span class="node-type-pill ${node.type === 'passive' ? 'passive-type' : ''}">${node.type === 'passive' ? 'PASIF' : (node.slotIdx !== undefined ? `AKTIF Slot ${node.slotIdx + 1}` : 'AKTIF')}</span>
            <span style="font-size:10px; color:#facc15; font-family:var(--font-mono); font-weight:bold;">${node.cost || 1} SP</span>
          </div>
          <div class="skill-node-title-row" style="margin:4px 0 6px;">
            <span class="skill-node-icon" style="font-size:20px;">${GameIcons.svg(node.icon, 'fantasy-icon icon-sm')}</span>
            <div style="flex:1; min-width:0;">
              <div class="skill-node-title" style="font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${node.name}</div>
              <div style="font-size:10px; color:#a68d91; font-family:var(--font-mono);">${node.type === 'passive' ? 'Efek Penguat Pasif' : (node.cd ? `CD: ${node.cd} turn` : 'Skill Serangan')}</div>
            </div>
          </div>
          <div class="skill-node-actions">
            <div>
              ${isLocked && reqNodeName ? `<span style="font-size:10px; color:#f87171;">(Butuh: ${reqNodeName})</span>` : '<span style="font-size:10px; color:#a68d91;">Arahkan kursor</span>'}
            </div>
            <div>
              ${isMastered ? `
                <div class="node-status-badge mastered">✓ Dikuasai</div>
              ` : canUnlock ? `
                <button class="node-unlock-btn" id="btn_unlock_${node.id}">Buka (1 SP)</button>
              ` : `
                <div class="node-status-badge locked"><span data-icon="lock"></span> Terkunci</div>
              `}
            </div>
          </div>
        `;

        nodeCard.onmouseenter = (e) => showTreeSkillTooltip(e, node, branch);
        nodeCard.onmousemove = (e) => positionBentoTooltip(e);
        nodeCard.onmouseleave = () => hideBentoTooltip();

        if (canUnlock) {
          const unlockBtn = nodeCard.querySelector(`#btn_unlock_${node.id}`);
          if (unlockBtn) {
            unlockBtn.onclick = () => {
              hideBentoTooltip();
              const ok = inventory.unlockSkillNode(node.id);
              if (ok) {
                GameAudio.playHeal();
                showNotification(`${GameIcons.svg('lightning')} Berhasil membuka node: ${node.name}!`);
                renderSkillTree();
                renderSkillButtons();
                const stats = inventory.getComputedStats();
                document.getElementById('charDetails').innerHTML = `
                  <div>Max HP: <b>${stats.maxHp}</b> | Max Poise: <b>${stats.maxPoise}</b></div>
                  <div>ATK: <b>${stats.atk}</b> | DEF: <b>${stats.def}</b></div>
                  <div>Critical Chance: <b>${Math.round(stats.critChance * 100)}%</b> | Movement: <b>${stats.moveRange} petak</b></div>
                `;
                if (combat && combat.isActive) {
                  combat.updateCombatUI();
                }
              }
            };
          }
        }

        nodesList.appendChild(nodeCard);
      });

      container.appendChild(bEl);
    });
  }

  function onResetSkillTreeClicked() {
    hideBentoTooltip();
    if (!inventory.unlockedNodes || inventory.unlockedNodes.length === 0) {
      showNotification(`${GameIcons.svg('warning')} Belum ada node Skill Tree yang dibuka!`);
      return;
    }
    inventory.resetSkillTree();
    GameAudio.playHeal();
    showNotification(`${GameIcons.svg('reset')} Seluruh Skill Tree telah di-reset! Semua Poin Skill dikembalikan.`);
    renderSkillTree();
    renderSkillButtons();
    const stats = inventory.getComputedStats();
    document.getElementById('charDetails').innerHTML = `
      <div>Max HP: <b>${stats.maxHp}</b> | Max Poise: <b>${stats.maxPoise}</b></div>
      <div>ATK: <b>${stats.atk}</b> | DEF: <b>${stats.def}</b></div>
      <div>Critical Chance: <b>${Math.round(stats.critChance * 100)}%</b> | Movement: <b>${stats.moveRange} petak</b></div>
    `;
    if (combat && combat.isActive) {
      combat.updateCombatUI();
    }
  }

  // --- STORY DESCENT MODAL ---
  function showStoryDescentModal(nextFloorIdx) {
    const key = `floor_${currentFloorIndex + 1}_to_${nextFloorIdx + 1}`;
    const story = RPG_DATA.STORY_DESCENT[key] || RPG_DATA.STORY_DESCENT['floor_1_to_2'];
    
    GameAudio.playStairDescend();

    document.getElementById('storyDescentSpeaker').textContent = story.speaker;
    document.getElementById('storyDescentTitle').textContent = story.title;
    document.getElementById('storyDescentQuote').textContent = `"${story.quote}"`;
    document.getElementById('storyDescentRelic').innerHTML = `${GameIcons.svg('amulet', 'fantasy-icon icon-sm')} <span>Jejak Ditemukan: ${story.relicFound}</span>`;

    const modal = document.getElementById('storyDescentModal');
    modal.style.display = 'flex';
    gameState = 'dialogue';

    let route = document.getElementById('abyssRoute');
    if (!route) { route = document.createElement('div'); route.id='abyssRoute'; document.getElementById('storyContinueBtn').before(route); }
    route.innerHTML = '<label style="display:block;padding:14px;color:#ddd;font:14px/1.6 sans-serif"><input id="abyssContractChoice" type="checkbox"> Kontrak Bara: musuh +20% ATK / +15% HP; hadiah +50% gold / +30% EXP. Tanpa kontrak: pulihkan 20% HP saat turun.</label>';
    document.getElementById('storyContinueBtn').onclick = () => {
      inventory.abyssContract = document.getElementById('abyssContractChoice').checked ? 1 : 0;
      if (!inventory.abyssContract) { const s=inventory.getComputedStats(); inventory.currentHp=Math.min(s.maxHp,s.hp+Math.round(s.maxHp*.2)); }
      inventory.saveToStorage();
      modal.style.display = 'none';
      gameState = 'explore';
      loadFloor(nextFloorIdx);
    };
  }

  // --- LEVEL-UP BOON SELECTION (HADES 3-CARDS) ---
  function showLevelUpBoonModal() {
    GameAudio.playBoonSelect();
    const modal = document.getElementById('boonModal');
    const container = document.getElementById('boonCardsGrid');
    container.innerHTML = '';

    // Pick 3 random boons not yet acquired
    const unacquired = RPG_DATA.LEVEL_UP_BOONS.filter(b => !inventory.boons.includes(b.id));
    const pool = unacquired.length >= 3 ? unacquired : RPG_DATA.LEVEL_UP_BOONS;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected3 = shuffled.slice(0, 3);

    selected3.forEach(boon => {
      const card = document.createElement('div');
      card.className = 'boon-card';
      card.innerHTML = `
        <div class="boon-card-icon">${GameIcons.svg(boon.icon, 'fantasy-icon icon-xl')}</div>
        <div class="boon-card-name">${boon.name}</div>
        <div class="boon-card-type">${boon.type}</div>
        <div class="boon-card-desc">${boon.desc}</div>
        <button class="boon-select-btn">Pilih Berkat</button>
      `;
      card.querySelector('.boon-select-btn').onclick = () => {
        inventory.addBoon(boon.id);
        modal.style.display = 'none';
        showNotification(`${GameIcons.svg('sun')} Berkat Surya Diterima: ${boon.name}!`);
        GameAudio.playHeal();
        renderSkillButtons();
      };
      container.appendChild(card);
    });

    modal.style.display = 'flex';
  }

  function showLoreModal(idx) {
    const tablet = RPG_DATA.LORE_TABLETS[idx] || RPG_DATA.LORE_TABLETS[0];
    document.getElementById('loreTitle').textContent = tablet.title;
    document.getElementById('loreContent').textContent = tablet.text;
    document.getElementById('loreModal').style.display = 'flex';
    gameState = 'dialogue';
  }

  let currentActiveNpcData = null;

  function switchNpcTab(tabKey) {
    hideBentoTooltip();
    const talkSec = document.getElementById('npcTalkSection');
    const servSec = document.getElementById('npcServiceSection');
    const shopSec = document.getElementById('npcShopSection');
    const tabTalk = document.getElementById('npcTabTalk');
    const tabServ = document.getElementById('npcTabService');
    const tabShop = document.getElementById('npcTabShop');

    if (!talkSec || !servSec || !shopSec) return;

    talkSec.style.display = tabKey === 'talk' ? 'block' : 'none';
    servSec.style.display = tabKey === 'service' ? 'block' : 'none';
    shopSec.style.display = tabKey === 'shop' ? 'block' : 'none';

    if (tabTalk) tabTalk.className = `npc-tab-btn ${tabKey === 'talk' ? 'active-tab' : ''}`;
    if (tabServ) tabServ.className = `npc-tab-btn ${tabKey === 'service' ? 'active-tab' : ''}`;
    if (tabShop) tabShop.className = `npc-tab-btn ${tabKey === 'shop' ? 'active-tab' : ''}`;
  }

  function showNpcModal(npcId) {
    const npcData = getNPCData(npcId);
    const modal = document.getElementById('npcModal');
    if (!modal || !npcData) return;

    currentActiveNpcData = npcData;
    const portrait = document.getElementById("npcPortrait");
    portrait.src = GamePresentation.portrait(renderer, npcId);
    portrait.alt = npcData.name;
    document.getElementById("npcRoleHint").textContent = npcData.title;
    gameState = 'dialogue';
    modal.style.display = 'flex';

    document.getElementById('npcNameTitle').innerHTML = `${GameIcons.svg(npcData.icon || 'hammer', 'fantasy-icon icon-md')} <span>${npcData.name}</span>`;
    document.getElementById('npcSubTitle').textContent = npcData.title;
    const greetIdx = Math.min(currentFloorIndex, (npcData.greetings ? npcData.greetings.length : 1) - 1);
    document.getElementById('npcGreetingText').textContent = `"${npcData.greetings ? npcData.greetings[greetIdx] : 'Salam, pembawa lentera.'}"`;

    // Render interactive dialogues list
    const diagContainer = document.getElementById('npcDialogueContainer');
    if (diagContainer) {
      diagContainer.innerHTML = '';
      const dialogues = npcData.dialogues || [
        { topic: 'Kabar Adikku Liora', text: 'Gadis itu masih berjuang di bawah sana. Jangan berhenti, bawa terus Lentera Surya!' }
      ];
      dialogues.forEach((d, dIdx) => {
        const dItem = document.createElement('div');
        dItem.className = 'npc-dialogue-item';
        dItem.innerHTML = `
          <button class="npc-dialogue-btn" id="dBtn_${dIdx}">
            ${GameIcons.svg('chat', 'fantasy-icon icon-xs')} <b>"${d.topic}"</b>
          </button>
          <div class="npc-dialogue-answer" id="dAns_${dIdx}" style="display:none;">${d.text}</div>
        `;
        const btn = dItem.querySelector(`#dBtn_${dIdx}`);
        const ans = dItem.querySelector(`#dAns_${dIdx}`);
        btn.onclick = () => {
          const isHidden = ans.style.display === 'none';
          ans.style.display = isHidden ? 'block' : 'none';
          GameAudio.playBoonSelect();
        };
        diagContainer.appendChild(dItem);
      });
    }

    switchNpcTab('talk');
    renderNpcServicesAndShop(npcData);
  }

  function renderNpcServicesAndShop(npcData) {
    if (!npcData) npcData = currentActiveNpcData || getNPCData('kaelen_smith');
    document.getElementById('npcPlayerGold').innerHTML = `${GameIcons.svg('coin', 'fantasy-icon icon-xs')} ${inventory.gold} Gold`;

    const serviceHeader = document.getElementById('npcServiceHeader');
    const forgeTitle = document.getElementById('npcForgeTitle');
    const serviceDesc = document.getElementById('npcServiceDesc');
    const temperBtn = document.getElementById('npcTemperBtn');
    const refillBtn = document.getElementById('npcRefillBtn');
    const forgeStation = document.getElementById('bentoForgeStation');
    const primaryServiceCard = document.getElementById('npcPrimaryServiceCard');

    // Refill Flask (Always available)
    const refillCost = 35;
    if (refillBtn) {
      refillBtn.innerHTML = `<span>Isi Penuh & Pulihkan (${refillCost} Gold)</span>`;
      refillBtn.onclick = () => {
        if (inventory.gold < refillCost) {
          showNotification(`${GameIcons.svg('warning')} Gold tidak cukup untuk mengisi ulang Lentera Flask!`);
          return;
        }
        inventory.gold -= refillCost;
        inventory.potions = inventory.maxPotions;
        GameAudio.playHeal();
        showNotification(`${GameIcons.svg('flask')} Lentera Flask terisi penuh (5/5) & energi pahlawan dipulihkan!`);
        inventory.saveToStorage();
        renderNpcServicesAndShop(npcData);
      };
    }

    // Role-specific primary service & Blacksmith Forge Station
    const role = npcData.role || npcData.serviceType || 'blacksmith';

    if (role === 'blacksmith') {
      if (serviceHeader) serviceHeader.innerHTML = `${GameIcons.svg('fire', 'fantasy-icon icon-xs')} Layanan Penempaan Senjata & Zirah Kaelen:`;
      if (forgeStation) forgeStation.style.display = 'block';
      if (primaryServiceCard) primaryServiceCard.style.display = 'none';

      // Setup Slot Selector Pills
      const slotPills = document.querySelectorAll('.forge-slot-pill');
      slotPills.forEach(pill => {
        const slotKey = pill.getAttribute('data-slot');
        if (slotKey === currentForgeSlot) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
        pill.onclick = () => {
          currentForgeSlot = slotKey;
          renderNpcServicesAndShop(npcData);
        };
      });

      // Render Active Equipment Workbench Card
      const benchView = document.getElementById('forgeBenchView');
      if (benchView) {
        const equippedItem = inventory.equipped[currentForgeSlot];
        const slotLabels = {
          weapon: 'Senjata Utama',
          offhand: 'Tangan Kiri',
          armor: 'Zirah Pelindung',
          relic: 'Relik / Jimat'
        };
        const currentSlotLabel = slotLabels[currentForgeSlot] || currentForgeSlot;

        if (!equippedItem) {
          benchView.innerHTML = `
            <div style="text-align:center; padding:18px 12px; color:#8c7378; font-size:12px;">
              <div style="font-size:24px; margin-bottom:6px;">${GameIcons.svg('anvil', 'fantasy-icon icon-md')}</div>
              <div style="font-weight:bold; color:#d1c2c5; margin-bottom:2px;">Slot ${currentSlotLabel} Kosong</div>
              <div style="font-size:11px; color:#a68d91;">Buka Tas (I) dan pasang perlengkapan terlebih dahulu untuk mulai menempa.</div>
            </div>
          `;
        } else {
          const curLvl = equippedItem.forgeLevel || 0;
          const isMax = curLvl >= 10;
          const nextLvl = curLvl + 1;
          const temperCost = 45 + (curLvl * 35);

          let deltaStatText = '';
          if (currentForgeSlot === 'weapon') deltaStatText = '+4 ATK & +4 Poise';
          else if (currentForgeSlot === 'armor') deltaStatText = '+3 DEF, +12 Max HP & +3 Poise';
          else if (currentForgeSlot === 'offhand') deltaStatText = `+2 DEF, ${equippedItem.atk ? '+2 ATK, ' : ''}+3 Poise`;
          else if (currentForgeSlot === 'relic') deltaStatText = `${equippedItem.atk ? '+2 ATK, ' : ''}${equippedItem.def ? '+2 DEF, ' : ''}${equippedItem.hp ? '+10 HP' : '+5 Poise'}`;

          benchView.innerHTML = `
            <div class="forge-bench-grid">
              <div class="forge-bench-card rarity-${equippedItem.rarity || 'common'}">
                <div style="font-size:10px; color:#a68d91; margin-bottom:4px; font-family:var(--font-mono);">TINGKAT SAAT INI</div>
                <div style="display:flex; justify-content:center; align-items:center; gap:6px; margin-bottom:4px;">
                  ${GameIcons.svg(equippedItem.icon, 'fantasy-icon icon-sm')}
                  <span style="font-weight:bold; color:#fde047; font-size:13px;">${equippedItem.name}</span>
                </div>
                <span class="forge-badge">+${curLvl}</span>
              </div>

              <div class="forge-arrow">➔</div>

              <div class="forge-bench-card" style="border-color:#f59e0b; background:#201419;">
                <div style="font-size:10px; color:#fde047; margin-bottom:4px; font-family:var(--font-mono);">HASIL TEMPAAN</div>
                <div style="display:flex; justify-content:center; align-items:center; gap:6px; margin-bottom:4px;">
                  ${GameIcons.svg(equippedItem.icon, 'fantasy-icon icon-sm')}
                  <span style="font-weight:bold; color:#86efac; font-size:13px;">${equippedItem.name}</span>
                </div>
                <span class="forge-badge" style="background:#15803d; border-color:#22c55e;">${isMax ? 'MAKSIMAL (+10)' : `+${nextLvl}`}</span>
              </div>
            </div>

            <div style="background:#1b1216; padding:8px 12px; border-radius:6px; font-size:11.5px; margin-bottom:12px; text-align:center; color:#fae8d4; border:1px dashed #d97706;">
              ${isMax ? 'Perlengkapan ini telah mencapai batas puncak penempaan!' : `Peningkatan Setiap Tempa: <b style="color:#fde047;">${deltaStatText}</b>`}
            </div>

            <button class="hud-btn" id="forgeActionBtn" style="width:100%; padding:9px; font-size:13px; font-weight:bold; background:#b45309; border-color:#f59e0b;" ${isMax ? 'disabled style="opacity:0.5;cursor:default;"' : ''}>
              ${isMax ? '✓ Tempa Maksimal (+10)' : `${GameIcons.svg('hammer', 'fantasy-icon icon-xs')} Tempa ${equippedItem.name} ke +${nextLvl} (${temperCost} Gold)`}
            </button>
          `;

          if (!isMax) {
            const forgeBtn = benchView.querySelector('#forgeActionBtn');
            if (forgeBtn) {
              forgeBtn.onclick = () => {
                hideBentoTooltip();
                const res = inventory.temperSlot(currentForgeSlot);
                if (!res.success) {
                  showNotification(`${GameIcons.svg('warning')} ${res.reason}`);
                  return;
                }
                GameAudio.playHeavyImpact();
                showNotification(`${GameIcons.svg('hammer')} ${res.item.name} berhasil ditempa ke +${res.newLevel}!`);
                renderNpcServicesAndShop(npcData);
              };
            }
          }
        }
      }
    } else {
      // Non-blacksmith NPCs (Alchemist, Lorekeeper, Shade)
      if (forgeStation) forgeStation.style.display = 'none';
      if (primaryServiceCard) primaryServiceCard.style.display = 'block';

      if (role === 'alchemist') {
        if (serviceHeader) serviceHeader.innerHTML = `${GameIcons.svg('flask', 'fantasy-icon icon-xs')} Layanan Peracikan Eliksir Bunga Surya:`;
        if (forgeTitle) forgeTitle.innerHTML = `${GameIcons.svg('flask', 'fantasy-icon icon-sm')} Racik Eliksir Darah Surya (+25 Max HP)`;
        if (serviceDesc) serviceDesc.innerHTML = 'Menyaring nektar bunga surya dengan embun beku. Menambah <b>+25 Max HP secara permanen</b> untuk ekspedisi ini!';
        const elixirCost = 90 + Math.min(5, inventory.forgeLevel || 0) * 70;
        if (temperBtn) {
          temperBtn.textContent = `Racik Eliksir Darah (${elixirCost} Gold)`;
          temperBtn.style.background = '#065f46';
          temperBtn.style.borderColor = '#10b981';
          temperBtn.onclick = () => {
            if ((inventory.forgeLevel || 0) >= 5) { showNotification('Limite eliksir tercapai: 5/5.'); return; }
            if (inventory.gold < elixirCost) {
              showNotification(`${GameIcons.svg('warning')} Butuh ${elixirCost} Gold untuk meracik Eliksir Darah!`);
              return;
            }
            inventory.gold -= elixirCost;
            inventory.forgeLevel = (inventory.forgeLevel || 0) + 1;
            GameAudio.playHeal();
            showNotification(`${GameIcons.svg('flask')} Meminum Eliksir Darah Surya! Max HP & ketahanan meningkat secara permanen!`);
            inventory.saveToStorage();
            renderNpcServicesAndShop(npcData);
          };
        }
      } else if (role === 'lorekeeper') {
        if (serviceHeader) serviceHeader.innerHTML = `${GameIcons.svg('scroll', 'fantasy-icon icon-xs')} Layanan Pencerahan Runa Surya & Pengetahuan:`;
        if (forgeTitle) forgeTitle.innerHTML = `${GameIcons.svg('spark', 'fantasy-icon icon-sm')} Bimbingan Runa Fajar (+1 Poin Skill)`;
        if (serviceDesc) serviceDesc.innerHTML = 'Membuka rahasia prasasti kuno untuk mendapatkan <b>+1 Poin Skill (SP)</b> tambahan secara instan!';
        const runeCost = 110;
        if (temperBtn) {
          temperBtn.textContent = `Buka Bimbingan Runa (${runeCost} Gold)`;
          temperBtn.style.background = '#4338ca';
          temperBtn.style.borderColor = '#8b5cf6';
          temperBtn.onclick = () => {
            if (inventory.gold < runeCost) {
              showNotification(`${GameIcons.svg('warning')} Butuh ${runeCost} Gold untuk bimbingan Runa Fajar!`);
              return;
            }
            inventory.gold -= runeCost;
            inventory.skillPoints = (inventory.skillPoints || 0) + 1;
            GameAudio.playMagicBeam();
            showNotification(`${GameIcons.svg('spark')} Pencerahan Runa Fajar! Memperoleh +1 Poin Skill (SP)! Cek di Skill Tree (C).`);
            inventory.saveToStorage();
            renderNpcServicesAndShop(npcData);
          };
        }
      } else if (role === 'shade') {
        if (serviceHeader) serviceHeader.innerHTML = `${GameIcons.svg('skull', 'fantasy-icon icon-xs')} Barter & Pemberkatan Arwah Abyss:`;
        if (forgeTitle) forgeTitle.innerHTML = `${GameIcons.svg('shadow', 'fantasy-icon icon-sm')} Minyak Arwah Gerhana (+100% Adrenaline Awal)`;
        if (serviceDesc) serviceDesc.innerHTML = 'Melumuri senjata dengan esensi malam: Memberikan <b>+100% Adrenaline (Langsung Ultimate) & +15% Crit</b> pada awal pertempuran berikutnya!';
        const shadeCost = 75;
        if (temperBtn) {
          temperBtn.textContent = `Terima Minyak Arwah (${shadeCost} Gold)`;
          temperBtn.style.background = '#6b21a8';
          temperBtn.style.borderColor = '#c084fc';
          temperBtn.onclick = () => {
            if (inventory.gold < shadeCost) {
              showNotification(`${GameIcons.svg('warning')} Butuh ${shadeCost} Gold untuk minyak arwah!`);
              return;
            }
            inventory.gold -= shadeCost;
            inventory.addBoon('boon_adrenaline_surge');
            GameAudio.playHeavyImpact();
            showNotification(`${GameIcons.svg('shadow')} Menerima Minyak Arwah! Adrenaline awal pertempuran akan meluap seketika!`);
            inventory.saveToStorage();
            renderNpcServicesAndShop(npcData);
          };
        }
      }
    }

    // Dynamic Per-Floor Bento Shop System (Zero Text Overload)
    const currentFloor = currentFloorIndex + 1;
    const floorDef = RPG_DATA.FLOORS[currentFloorIndex];
    const floorName = floorDef ? floorDef.name : `Lantai ${currentFloor}`;
    const floorTitleEl = document.getElementById('npcShopFloorTitle');
    if (floorTitleEl) {
      floorTitleEl.innerHTML = `Stok Toko Lantai ${currentFloor}: <span style="color:#fde047;">${floorName}</span>`;
    }

    // Refresh Shop Button (30 Gold)
    const refreshBtn = document.getElementById('npcShopRefreshBtn');
    if (refreshBtn) {
      refreshBtn.onclick = () => {
        hideBentoTooltip();
        const res = inventory.refreshFloorShop(currentFloor);
        if (!res.success) {
          showNotification(`${GameIcons.svg('warning')} ${res.reason}`);
          return;
        }
        GameAudio.playChestOpen();
        showNotification(`${GameIcons.svg('reset')} Stok Toko Lantai ${currentFloor} diacak ulang (-30 Gold)!`);
        renderNpcServicesAndShop(npcData);
      };
    }

    // Populate Dynamic Bento Shop Grid
    const shopGrid = document.getElementById('npcShopGrid');
    if (!shopGrid) return;
    shopGrid.innerHTML = '';

    const shopPool = inventory.getFloorShop(currentFloor);
    shopPool.forEach(item => {
      const price = item.price || 110;
      const alreadyOwned = inventory.items.some(x => x.id === item.id) || Object.values(inventory.equipped).some(x => x && x.id === item.id);
      const forgeBadge = item.forgeLevel > 0 ? `<span class="forge-badge">+${item.forgeLevel}</span>` : '';
      let statChips = '';
      if (item.atk) statChips += `<span class="bento-chip atk">+${item.atk} ATK</span>`;
      if (item.def) statChips += `<span class="bento-chip def">+${item.def} DEF</span>`;
      if (item.hp) statChips += `<span class="bento-chip hp">+${item.hp} HP</span>`;
      if (item.poise) statChips += `<span class="bento-chip poise">+${item.poise} Poise</span>`;
      if (item.crit) statChips += `<span class="bento-chip crit">+${Math.round(item.crit * 100)}% Crit</span>`;
      if (item.set) statChips += `<span class="bento-chip set">[${item.set.toUpperCase()}]</span>`;

      const card = document.createElement('div');
      card.className = `bag-item-card bento-card rarity-${item.rarity || 'rare'}`;
      card.innerHTML = `
        <div>
          <div class="card-head">
            <span style="display:flex; align-items:center; gap:8px;">
              <span class="bento-tip-icon-box" style="width:32px; height:32px; font-size:16px;">
                ${GameIcons.svg(item.icon, 'fantasy-icon icon-sm')}
              </span>
              <b style="font-size:12.5px; color:#fef08a;">${item.name} ${forgeBadge}</b>
            </span>
            <span class="rarity-pill ${item.rarity || 'rare'}">${item.rarity || 'rare'}</span>
          </div>
          <div class="bento-chips-row">${statChips}</div>
        </div>
        <button class="equip-btn" ${alreadyOwned ? 'disabled style="opacity:0.5;cursor:default;"' : ''} style="margin-top:6px;">
          ${alreadyOwned ? '✓ Sudah Dimiliki' : `${GameIcons.svg('coin', 'fantasy-icon icon-xs')} Beli (${price} Gold)`}
        </button>
      `;

      card.onmouseenter = (e) => showItemTooltip(e, item, 'shop');
      card.onmousemove = (e) => positionBentoTooltip(e);
      card.onmouseleave = () => hideBentoTooltip();

      if (!alreadyOwned) {
        card.querySelector('.equip-btn').onclick = (e) => {
          e.stopPropagation();
          hideBentoTooltip();
          if (inventory.gold < price) {
            showNotification(`${GameIcons.svg('warning')} Gold tidak cukup! Butuh ${price} Gold.`);
            return;
          }
          inventory.gold -= price;
          inventory.addLoot({ ...item });
          GameAudio.playChestOpen();
          showNotification(`${GameIcons.svg('bag')} Membeli ${item.name}! Cek di dalam Tas (I).`);
          inventory.saveToStorage();
          renderNpcServicesAndShop(npcData);
        };
      }
      shopGrid.appendChild(card);
    });
  }

  function showBossBanner(bossDef) {
    const banner = document.getElementById('bossBanner');
    banner.style.display = 'block';
    document.getElementById('bossBannerTitle').textContent = bossDef.name;
    document.getElementById('bossBannerQuote').textContent = `"${bossDef.quote}"`;
    setTimeout(() => {
      banner.style.display = 'none';
    }, 4500);
  }

  function showCombatVictoryModal(results) {
    const modal = document.getElementById('victoryModal');
    modal.style.display = 'flex';
    document.getElementById('vicExp').textContent = `+${results.exp} EXP`;
    document.getElementById('vicGold').textContent = `+${results.gold} Gold`;
    const lootList = document.getElementById('vicLootList');
    lootList.innerHTML = '';
    if (results.loot.length === 0) {
      lootList.innerHTML = '<li>Tidak ada relik terjatuh.</li>';
    } else {
      results.loot.forEach(l => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '6px';
        li.style.marginBottom = '4px';
        li.innerHTML = `${GameIcons.svg(l.icon, 'fantasy-icon icon-xs')} <span>${l.name} (${l.rarity})</span>`;
        lootList.appendChild(li);
      });
    }
  }

  function showGameOverModal() {
    gameState = 'gameover';
    // Clear pressed keys
    for (let k in keys) keys[k] = false;

    const modal = document.getElementById('gameOverModal');
    if (modal) modal.style.display = 'flex';

    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.onclick = () => {
        modal.style.display = 'none';

        if (combat) {
          combat.isActive = false;
          combat.clearHighlights();
          combat.clearIntentBadges();
        }

        // Refill potions to at least 3 for retry
        inventory.potions = Math.max(3, inventory.potions);
        inventory.saveToStorage();

        // Reload floor cleanly (recreates upright hero & resets dungeon)
        loadFloor(currentFloorIndex);

        gameState = 'explore';
        document.getElementById('combatHud').style.display = 'none';
        document.getElementById('exploreHud').style.display = 'flex';
        updateHUD();
        GameAudio.playHeal();
        showNotification(`${GameIcons.svg('sun')} Jiwamu bangkit kembali di Sanctuary!`);
      };
    }
  }

  function showVictoryGameModal() {
    gameState = 'dialogue';
    const modal=document.getElementById('storyDescentModal');
    document.getElementById('storyDescentSpeaker').textContent='Liora — Epilog';
    document.getElementById('storyDescentTitle').textContent='Nama Terakhir, Fajar Pertama';
    document.getElementById('storyDescentQuote').textContent='Liora menyebut nama ayah sebagai nama terakhir. Gema penjaga melepaskan senjatanya. Tidak ada pengganti yang ditinggalkan di singgasana: untuk pertama kalinya, sumpah itu berakhir. Di tangga, para tawanan saling menyebut nama agar tidak ada yang tertinggal. Kaelen membuka gerbang, Eloria menunggu dengan obat, dan Valen membawa daftar yang kini utuh. Liora menggenggam tanganmu: “Besok kita boleh takut pada hal-hal kecil lagi.” Di permukaan, lentera ayah padam perlahan. Matahari sudah cukup.';
    document.getElementById('storyDescentRelic').textContent='Ekspedisi selesai — Liora dan para tawanan pulang.';
    const route=document.getElementById('abyssRoute');if(route)route.innerHTML='';
    const button=document.getElementById('storyContinueBtn');button.textContent='Kembali ke Gerbang Abu — lanjutkan dengan equipment saat ini';
    button.onclick=()=>{modal.style.display='none';button.textContent='Lanjutkan';gameState='explore';loadFloor(0);};
    modal.style.display='flex';
  }

  function showNotification(msg) {
    const notif = document.getElementById('notificationBox');
    if (!notif) return;
    notif.innerHTML = msg;
    notif.style.opacity = '1';
    notif.style.transform = 'translateY(0)';
    setTimeout(() => {
      notif.style.opacity = '0';
      notif.style.transform = 'translateY(-10px)';
    }, 3200);
  }

  function toggleMute() {
    const muted = !GameAudio.isMuted();
    GameAudio.setMuted(muted);
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
      soundBtn.innerHTML = GameIcons.svg(muted ? 'sound_off' : 'sound_on', 'fantasy-icon icon-sm');
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    GameRetro.resize(renderer);
  }

  // --- MAIN ANIMATION LOOP ---

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), .05);
    if (document.hidden) return;
    // Menus only need a quiet backdrop; keep full cadence during play.
    if ((gameState === 'title' || modalOpen) && (++backdropFrame % 4 !== 0)) return;
    const time = clock.getElapsedTime();

    // Exploration logic
    if (gameState === 'explore' && !modalOpen && !victoryPending) {
      updateExploration(delta);
    }

    // Camera follow & rotation
    updateCamera();

    // Animated meshes
    if (heroModel) {
      GameModels.updateAnimation(heroModel, delta, time);
      // Keep ambient floating dust/ember particles centered around hero
      if (ambientParticles) {
        ambientParticles.position.x = heroModel.position.x;
        ambientParticles.position.z = heroModel.position.z;
        ambientParticles.rotation.y = time * 0.08;
        ambientParticles.position.y = Math.sin(time * 0.7) * 0.25;
      }
    }
    activeEntities.forEach(ent => {
      if (ent.model) {
        GameModels.updateAnimation(ent.model, delta, time);
      }
    });

    // 3D floating damage numbers
    if (combat) {
      combat.updateFloatingTexts(camera, delta);
    }

    GameAttack.update(delta,!modalOpen&&gameState!=='title');
    GameCombatGuide.update(camera,gameState==='combat'&&!modalOpen);
    GameDeath.update(delta);
    GamePresentation.update(delta);
    GamePresentation.updateLights(delta, heroModel);
    GameRetro.render(renderer,scene,camera);
  }

  return {
    init,
    loadFloor,
    getInventory: () => inventory
  };
})();

// Boot on window load
window.addEventListener('DOMContentLoaded', () => {
  GameRetro.ready.then(() => EverDeeperV2.init()).catch(error => {console.error(error);document.getElementById("landingMainMenu").textContent="Aset gagal dimuat. Ekstrak seluruh isi ZIP, lalu buka kembali play.bat.";});
});
