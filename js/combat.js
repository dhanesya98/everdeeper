/**
 * EVER DEEPER II: Tactical Isometric Turn-Based Combat Engine
 * Turn timeline, Grid pathing, AP system, Flanking/Backstabs, Poise & Stance Break, Enemy AI.
 */

window.GameCombat = (function() {
  class CombatManager {
    constructor(scene, dungeon, inventory, onCombatEnd) {
      this.scene = scene;
      this.dungeon = dungeon;
      this.inventory = inventory;
      this.onCombatEnd = onCombatEnd; // callback (won: boolean, loot: array)

      this.isActive = false;
      this.combatants = []; // array of unit objects
      this.currentTurnIdx = 0;
      this.selectedSkill = null;
      this.gridHighlights = []; // 3D highlight meshes
      this.floatingTexts = []; // 3D text popups
      this.intentBadges = []; // 3D-to-2D intent elements

      this.comboCount = 0;
      this.cameraRef = null;
      this.isShaking = false;
      this.isAiActing = false; // Prevents turn conflicts & input during enemy turn
      this.aiTimeouts = []; // Tracks all AI timers to prevent zombie executions

      this.highlightGroup = new THREE.Group();
      this.highlightGroup.name = 'combat_highlights';
      this.scene.add(this.highlightGroup);
    }

    clearAiTimeouts() {
      if (this.aiTimeouts && this.aiTimeouts.length > 0) {
        this.aiTimeouts.forEach(t => clearTimeout(t));
        this.aiTimeouts = [];
      }
    }

    isPlayerTurn() {
      if (!this.isActive || this.isAiActing) return false;
      const activeUnit = this.combatants[this.currentTurnIdx];
      return !!(activeUnit && activeUnit.isPlayer);
    }

    setCamera(camera) {
      this.cameraRef = camera;
    }

    shakeCamera(intensity = 0.22, duration = 180) {
      if (!GamePresentation.settings.motion) return;
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.classList.remove('shake-screen');
        void canvas.offsetWidth;
        canvas.classList.add('shake-screen');
        setTimeout(() => canvas.classList.remove('shake-screen'), Math.max(220, duration));
      }

      if (this.cameraRef && !this.isShaking) {
        this.isShaking = true;
        const origX = this.cameraRef.position.x;
        const origY = this.cameraRef.position.y;
        const origZ = this.cameraRef.position.z;
        const start = Date.now();
        const timer = setInterval(() => {
          const elapsed = Date.now() - start;
          if (elapsed >= duration) {
            clearInterval(timer);
            this.cameraRef.position.x = origX;
            this.cameraRef.position.y = origY;
            this.cameraRef.position.z = origZ;
            this.isShaking = false;
          } else {
            const decay = 1 - (elapsed / duration);
            this.cameraRef.position.x = origX + (Math.random() - 0.5) * intensity * decay;
            this.cameraRef.position.y = origY + (Math.random() - 0.5) * intensity * decay;
            this.cameraRef.position.z = origZ + (Math.random() - 0.5) * intensity * decay;
          }
        }, 16);
      }
    }

    triggerDamageVignette() {
      const vig = document.getElementById('damageVignette');
      if (vig) {
        vig.classList.add('active-vignette');
        setTimeout(() => vig.classList.remove('active-vignette'), 220);
      }
    }

    triggerCritFlash() {
      if (!GamePresentation.settings.motion) return;
      const fl = document.getElementById('critFlash');
      if (fl) {
        fl.classList.add('active-flash');
        setTimeout(() => fl.classList.remove('active-flash'), 180);
      }
    }

    flashModel(model, colorHex = 0xffffff, duration = 120) {
      if (!model) return;
      const meshes = [];
      model.traverse(node => {
        if (node.isMesh && node.material) {
          meshes.push({
            mesh: node,
            origEmissive: node.material.emissive ? node.material.emissive.getHex() : 0,
            origIntensity: node.material.emissiveIntensity !== undefined ? node.material.emissiveIntensity : 0
          });
          if (node.material.emissive) {
            node.material.emissive.setHex(colorHex);
            node.material.emissiveIntensity = 1.0;
          }
        }
      });
      setTimeout(() => {
        meshes.forEach(m => {
          if (m.mesh && m.mesh.material && m.mesh.material.emissive) {
            m.mesh.material.emissive.setHex(m.origEmissive);
            m.mesh.material.emissiveIntensity = m.origIntensity;
          }
        });
      }, duration);
    }

    updateComboUI() {
      const badge = document.getElementById('comboBadge');
      if (!badge) return;
      if (this.comboCount > 0) {
        badge.style.display = 'flex';
        badge.innerHTML = `${GameIcons.svg('fire', 'fantasy-icon icon-sm')} <span>COMBO x${this.comboCount} (+${this.comboCount * 10}% DMG)</span>`;
      } else {
        badge.style.display = 'none';
      }
    }

    tacticalGuard(hero) {
      if (!this.isActive || !this.isPlayerTurn() || !hero || !hero.isPlayer || hero.ap < 1) {
        if (!this.isPlayerTurn()) {
          this.logCombat(`Bukan giliran Anda!`, 'warning');
        } else {
          this.logCombat(`Butuh minimal 1 AP untuk memasang Kuda-Kuda!`, 'warning');
        }
        return false;
      }
      hero.ap -= 1;
      const guardBonus = 10;
      const poiseBonus = 20;
      hero.buffs.guard = (hero.buffs.guard || 0) + guardBonus;
      hero.poise = Math.min(hero.maxPoise, hero.poise + poiseBonus);
      this.showFloatingText(hero, `+${guardBonus} DEF Guard`, 0x38bdf8);
      this.showFloatingText(hero, `+${poiseBonus} Poise`, 0x22c55e);
      GameAudio.playShieldBlock();
      this.shakeCamera(0.08, 120);

      // Subclass bonuses for Guard:
      const passives = (this.inventory && this.inventory.passives) || [];
      if (passives.includes('tactical_command')) {
        hero.commandStacks = Math.min(5, (hero.commandStacks || 0) + 2);
        this.showFloatingText(hero, `+2 Command (${hero.commandStacks}/5)`, 0xfacc15);
        this.logCombat(`Kuda-Kuda Komando! Memperoleh +2 Command stacks (${hero.commandStacks}/5).`, 'crown');
      }
      if (passives.includes('riposte_stance')) {
        hero.riposteTokens = Math.min(3, (hero.riposteTokens || 0) + 2);
        this.showFloatingText(hero, `+2 Riposte Token (${hero.riposteTokens}/3)`, 0x38bdf8);
        this.logCombat(`Kuda-Kuda Tangkis! Meraih 2 Riposte Tokens untuk serangan balas otomatis!`, 'sword');
      }

      this.logCombat(`Memasang Kuda-Kuda Kokoh (+10 DEF, +20 Poise)!`, 'shield');
      this.updateCombatUI();
      return true;
    }

    calculateEnemyIntents() {
      const hero = this.combatants.find(c => c.isPlayer);
      if (!hero) return;

      this.clearIntentBadges();

      const livingEnemies = this.combatants.filter(c => !c.isPlayer && c.hp > 0);
      const hud = document.getElementById('combatPopups');
      if (!hud) return;

      livingEnemies.forEach(enemy => {
        let intentType = 'intent-attack';
        let intentHtml = `${GameIcons.svg('sword', 'fantasy-icon icon-xs')} <span>${Math.round((enemy.stats.atk || 18) * 0.9)}</span>`;

        if (enemy.isBoss) {
          const bossDef = RPG_DATA.BOSSES[enemy.data.bossId];
          if (enemy.hp < enemy.maxHp * 0.5 && !enemy.usedGimmick) {
            intentType = 'intent-guard';
            intentHtml = `${GameIcons.svg('shield', 'fantasy-icon icon-xs')} <span>${bossDef ? bossDef.gimmick.split(':')[0] : 'Kuda-Kuda'}</span>`;
          } else {
            intentType = 'intent-skill';
            const firstSkill = (enemy.stats.skills && enemy.stats.skills[0]) || 'Amukan Bos';
            const skillName = typeof firstSkill === 'string' ? firstSkill : firstSkill.name;
            intentHtml = `${GameIcons.svg('fire', 'fantasy-icon icon-xs')} <span>${skillName}</span>`;
          }
        } else if (enemy.isElite) {
          intentType = 'intent-skill';
          const modName = enemy.eliteMod ? enemy.eliteMod.name : 'Elit';
          const modIcon = enemy.eliteMod && enemy.eliteMod.icon ? enemy.eliteMod.icon : 'spark';
          intentHtml = `${GameIcons.svg(modIcon, 'fantasy-icon icon-xs')} <span style="color:#fde047; font-weight:bold;">[ELIT: ${modName}]</span>`;
        }

        const el = document.createElement('div');
        el.className = `combat-intent-badge ${intentType}`;
        el.innerHTML = intentHtml;
        hud.appendChild(el);

        this.intentBadges.push({
          unit: enemy,
          el: el
        });
      });
    }

    clearIntentBadges() {
      this.intentBadges.forEach(b => {
        if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
      });
      this.intentBadges = [];
    }

    updateIntentBadges(camera) {
      if (!camera) return;
      for (let i = this.intentBadges.length - 1; i >= 0; i--) {
        const item = this.intentBadges[i];
        if (!item.unit || item.unit.hp <= 0 || !item.unit.model) {
          if (item.el && item.el.parentNode) item.el.parentNode.removeChild(item.el);
          this.intentBadges.splice(i, 1);
          continue;
        }

        const worldPos = item.unit.model.position.clone().add(new THREE.Vector3(0, item.unit.isBoss ? 2.5 : 1.9, 0));
        const v = worldPos.project(camera);
        const x = (v.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;
        item.el.style.left = `${x}px`;
        item.el.style.top = `${y}px`;
      }
    }

    startBattle(heroModel, heroStats, enemiesData, isCursedAmbush = false) {
      this.isActive = true;
      this.isAiActing = false;
      this.clearAiTimeouts();
      this.combatants = [];
      this.currentTurnIdx = 0;
      this.selectedSkill = null;
      this.comboCount = 0;
      this.isCursedAmbush = !!isCursedAmbush;
      this.updateComboUI();
      this.clearHighlights();
      this.clearIntentBadges();

      GameAudio.startBattleMusic();

      // Setup Hero combatant
      const hPos = this.dungeon.worldToGrid(heroModel.position.x, heroModel.position.z);
      const heroUnit = {
        isPlayer: true,
        name: RPG_DATA.CLASSES[this.inventory.heroClassId].name,
        classId: this.inventory.heroClassId,
        model: heroModel,
        gx: hPos.gx,
        gz: hPos.gz,
        stats: { ...heroStats },
        hp: heroStats.hp,
        maxHp: heroStats.maxHp,
        poise: heroStats.maxPoise,
        maxPoise: heroStats.maxPoise,
        ap: 4,
        maxAp: 4,
        adrenaline: 0,
        facing: { dx: 0, dz: 1 }, // Facing forward
        buffs: {},
        cooldowns: {},
        isStunned: false,
        stunImmunity: 0,
        commandStacks: 0,
        rageStacks: 0,
        arcaneCharges: 0,
        riposteTokens: 0,
        chainCount: 0,
        lastSkillId: null,
        isVanished: false,
        isCursedVulnerable: false
      };
      this.combatants.push(heroUnit);

      // Check Cursed Altar Vulnerability from inventory
      if (this.inventory && this.inventory.isVulnerableNextCombat) {
        heroUnit.isCursedVulnerable = true;
        this.inventory.isVulnerableNextCombat = false;
        this.inventory.saveToStorage();
        this.showFloatingText(heroUnit, 'Kutukan Kerentanan Aktif (+25% DMG)', 0xef4444);
        this.logCombat('Kutukan Altar Aktif: Pahlawan menerima +25% damage lebih tinggi di pertempuran ini!', 'skull');
      }

      // Setup Enemy combatants
      enemiesData.forEach((ed, idx) => {
        let eStats = {};
        let eName = '';
        let isBoss = ed.type === 'boss';
        let isBounty = ed.type === 'bounty_target';
        let isMimic = ed.type === 'mimic';

        if (isBoss) {
          const bDef = RPG_DATA.BOSSES[ed.bossId] || Object.values(RPG_DATA.BOSSES)[0];
          eName = bDef.name;
          eStats = { ...bDef };
        } else if (isBounty) {
          const bDef = ed.bountyDef || (RPG_DATA.BOUNTIES && RPG_DATA.BOUNTIES[this.dungeon.floorData.floor]);
          eName = `☠️ BURONAN: ${bDef.name}`;
          eStats = { ...bDef, maxHp: bDef.hp, maxPoise: bDef.poise };
          isBoss = true; // Treats as boss tier for UI & AP
        } else if (isMimic) {
          const mDef = RPG_DATA.MONSTERS['mimic'] || { name: 'Peti Mimic Lapar', hp: 175, poise: 60, atk: 26, def: 10, speed: 12, exp: 130, gold: 140 };
          eName = `🦷 ${mDef.name}`;
          eStats = { ...mDef, maxHp: mDef.hp, maxPoise: mDef.poise };
        } else {
          const mDef = RPG_DATA.MONSTERS[ed.monsterKey] || Object.values(RPG_DATA.MONSTERS)[0];
          eName = mDef.name;
          eStats = { ...mDef, maxHp: mDef.hp, maxPoise: mDef.poise };

          // Apply Elite Modifiers if Elite
          if (ed.isElite && ed.eliteMod) {
            eName = `⭐ ${ed.eliteMod.prefix}${eName}`;
            eStats.hp = Math.round((eStats.hp || 50) * ed.eliteMod.statMult);
            eStats.maxHp = eStats.hp;
            eStats.atk = Math.round((eStats.atk || 15) * ed.eliteMod.statMult);
            eStats.poise = Math.round((eStats.poise || 25) * 1.3);
            eStats.maxPoise = eStats.poise;
            eStats.exp = Math.round((eStats.exp || 30) * 1.8);
            eStats.gold = Math.round((eStats.gold || 20) * 2.2);
          }
        }

        eStats = AbyssBalance.enemy(eStats, this.dungeon.floorData.floor, this.inventory.abyssContract);
        const enemyUnit = {
          isPlayer: false,
          isBoss: isBoss,
          isBounty: isBounty,
          isMimic: isMimic,
          isElite: ed.isElite,
          eliteMod: ed.eliteMod,
          name: eName,
          data: ed,
          model: ed.model,
          gx: ed.gx,
          gz: ed.gz,
          stats: eStats,
          hp: eStats.hp || eStats.maxHp,
          maxHp: eStats.maxHp || eStats.hp,
          poise: eStats.poise || eStats.maxPoise,
          maxPoise: eStats.maxPoise || eStats.poise,
          ap: isBoss ? 4 : 3,
          maxAp: isBoss ? 4 : 3,
          facing: { dx: 0, dz: -1 },
          buffs: {},
          cooldowns: {},
          isStunned: false,
          stunImmunity: 0,
          usedGimmick: false,
          corruptionStacks: 0,
          weaknessMarks: 0,
          isPoisoned: false,
          poisonTurns: 0,
          isRooted: false,
          rootTurns: 0,
          lastElementHit: null
        };
        this.combatants.push(enemyUnit);
      });

      // Apply Elite Champion Startup Affixes (Shielded, Frenzied, etc.)
      this.combatants.forEach(unit => {
        if (!unit.isPlayer && unit.isElite && unit.eliteMod) {
          if (unit.eliteMod.id === 'shielded') {
            unit.buffs.barrier = (unit.buffs.barrier || 0) + 40;
            this.showFloatingText(unit, '+40 Barrier Perisai Baja', 0x38bdf8);
            this.logCombat(`${unit.name} dilindungi oleh Perisai Baja Kuno (+40 Barrier)!`, 'shield');
          }
          if (unit.eliteMod.id === 'frenzied') {
            unit.stats.moveRange = (unit.stats.moveRange || 3) + 1;
            unit.stats.critChance = (unit.stats.critChance || 0) + 0.20;
          }
        }
      });

      // Boon: Restu Lentera Ayah (Starts battle with +30 Barrier)
      if (this.inventory.boons && this.inventory.boons.includes('boon_sun_ward')) {
        heroUnit.buffs.barrier = (heroUnit.buffs.barrier || 0) + 30;
        this.showFloatingText(heroUnit, '+30 Barrier Awal', 0x9b59b6);
      }

      // Sets start-of-battle bonuses (Bastion 4P & Arcanum 2P)
      if (this.inventory.activeSetBonuses) {
        if (this.inventory.activeSetBonuses.some(b => b.set === 'bastion' && b.tier >= 4)) {
          heroUnit.buffs.barrier = (heroUnit.buffs.barrier || 0) + 30;
          this.showFloatingText(heroUnit, '+30 Barrier Benteng (4P)', 0x38bdf8);
        }
        if (this.inventory.activeSetBonuses.some(b => b.set === 'arcanum' && b.tier >= 2)) {
          heroUnit.buffs.barrier = (heroUnit.buffs.barrier || 0) + 20;
          this.showFloatingText(heroUnit, '+20 Barrier Arcanum (2P)', 0x9b59b6);
        }
      }

      // Calculate initiative based on AGI & speed
      this.combatants.sort((a, b) => {
        const speedA = (a.stats.agi || a.stats.speed || 10) + Math.random() * 5;
        const speedB = (b.stats.agi || b.stats.speed || 10) + Math.random() * 5;
        return speedB - speedA;
      });

      this.logCombat(`Pertarungan taktis dimulai! Inisiatif tertinggi: ${this.combatants[0].name}`, 'sword');
      this.calculateEnemyIntents();
      this.startTurn();
    }

    startTurn() {
      if (!this.isActive) return;
      this.clearAiTimeouts();

      // Check win/loss conditions
      const hero = this.combatants.find(c => c.isPlayer);
      if (!hero || hero.hp <= 0) {
        this.endBattle(false);
        return;
      }

      const livingEnemies = this.combatants.filter(c => !c.isPlayer && c.hp > 0);
      if (livingEnemies.length === 0) {
        this.endBattle(true);
        return;
      }

      const activeUnit = this.combatants[this.currentTurnIdx];

      // Skip dead units
      if (activeUnit.hp <= 0) {
        this.currentTurnIdx = (this.currentTurnIdx + 1) % this.combatants.length;
        this.startTurn();
        return;
      }

      // Reset AP & Process Buffs/Cooldowns
      activeUnit.ap = activeUnit.maxAp;
      activeUnit.buffs.guard = 0;
      activeUnit.buffs.dodge = 0;
      activeUnit.buffs.barrier = Math.min(activeUnit.buffs.barrier || 0, Math.round(activeUnit.maxHp * .3));

      // Handle Stun Immunity cooldown
      if (activeUnit.stunImmunity && activeUnit.stunImmunity > 0) {
        activeUnit.stunImmunity--;
      }

      // Hexbound: Corruption DoT tick at start of enemy turn
      if (!activeUnit.isPlayer && activeUnit.corruptionStacks > 0 && activeUnit.hp > 0) {
        const dotDmg = Math.min(activeUnit.hp, activeUnit.corruptionStacks * 8);
        activeUnit.hp = Math.max(0, activeUnit.hp - dotDmg);
        this.showFloatingText(activeUnit, `-${dotDmg} Corruption DoT`, 0xa855f7);
        this.shakeCamera(0.12, 120);

        // Life Drain healing to hero
        const hero = this.combatants.find(c => c.isPlayer);
        if (hero && hero.hp > 0) {
          const passives = (this.inventory && this.inventory.passives) || [];
          const drainPct = passives.includes('soul_siphon') ? 0.60 : 0.50;
          const healAmt = Math.min(20, Math.round(dotDmg * drainPct));
          hero.hp = Math.min(hero.maxHp, hero.hp + healAmt);
          this.showFloatingText(hero, `+${healAmt} HP Life Drain`, 0x22c55e);
          GameAudio.playHeal();
          this.logCombat(`Kutukan Corruption membakar ${activeUnit.name} (-${dotDmg} HP) dan menyerap ${healAmt} HP untuk pahlawan!`, 'skull');
        }

        if (activeUnit.hp <= 0) {

          this.logCombat(`${activeUnit.name} tewas akibat pembusukan jiwa Corruption!`, 'skull');
          if (hero) {
            const hAmt = Math.min(40, Math.round(hero.maxHp * .08));
            hero.hp = Math.min(hero.maxHp, hero.hp + hAmt);
            hero.ap = Math.min(hero.maxAp, hero.ap + 1);
            this.showFloatingText(hero, `+${hAmt} HP & +1 AP (Harvest)`, 0x22c55e);
          }
          this.updateCombatUI();
          this.currentTurnIdx = (this.currentTurnIdx + 1) % this.combatants.length;
          this.startTurn();
          return;
        }
      }

      // Trapmaster: Poison DoT tick at start of enemy turn
      if (!activeUnit.isPlayer && activeUnit.isPoisoned && activeUnit.poisonTurns > 0 && activeUnit.hp > 0) {
        const pDmg = activeUnit.poisonDmg || 15;
        activeUnit.hp = Math.max(0, activeUnit.hp - pDmg);
        activeUnit.poisonTurns--;
        if (activeUnit.poisonTurns <= 0) activeUnit.isPoisoned = false;
        this.showFloatingText(activeUnit, `-${pDmg} Racun DoT`, 0x10b981);
        this.shakeCamera(0.1, 100);
        this.logCombat(`Bisa racun kawat jerat membakar ${activeUnit.name} (-${pDmg} HP)!`, 'flask');

        if (activeUnit.hp <= 0) {

          this.logCombat(`${activeUnit.name} tewas akibat bisa racun mematikan!`, 'skull');
          this.updateCombatUI();
          this.currentTurnIdx = (this.currentTurnIdx + 1) % this.combatants.length;
          this.startTurn();
          return;
        }
      }

      // Check Stun / Stance Break
      if (activeUnit.isStunned) {
        this.logCombat(`${activeUnit.name} masih terhuyung (Stance Break) dan kehilangan gilirannya!`, 'hourglass');
        activeUnit.isStunned = false;
        activeUnit.stunImmunity = 1; // 1 Turn immunity after recovering from stun!
        activeUnit.poise = Math.round(activeUnit.maxPoise * 0.6); // restore 60% poise
        this.showFloatingText(activeUnit, 'Kuda-Kuda Pulih (Kebal Stun 1T)', 0x55ff55);
        this.updateCombatUI();
        const t = setTimeout(() => {
          this.currentTurnIdx = (this.currentTurnIdx + 1) % this.combatants.length;
          this.startTurn();
        }, 1200);
        this.aiTimeouts.push(t);
        return;
      }

      // Decrement player cooldowns
      if (activeUnit.isPlayer) {
        this.isAiActing = false;
        if (activeUnit.isVanished) {
          activeUnit.isVanished = false;
          this.showFloatingText(activeUnit, 'Vanish Berakhir', 0xa855f7);
        }
        for (let sk in activeUnit.cooldowns) {
          if (activeUnit.cooldowns[sk] > 0) activeUnit.cooldowns[sk]--;
        }
        const activeSkills = this.inventory.getActiveSkills ? this.inventory.getActiveSkills() : RPG_DATA.CLASSES[this.inventory.heroClassId].skills;
        this.selectedSkill = activeSkills[0]; // default basic
        this.showSkillRange(activeUnit, this.selectedSkill);
        this.calculateEnemyIntents();
        this.logCombat(`Giliranmu! Silakan gunakan Skill, Gerak, atau Kuda-Kuda.`, 'spark');
      } else {
        // AI Turn execution - lock inputs and run AI turn
        this.isAiActing = true;
        this.logCombat(`Giliran: ${activeUnit.name}...`, 'fire');
        const t = setTimeout(() => this.executeAiTurn(activeUnit), 600);
        this.aiTimeouts.push(t);
      }

      this.updateCombatUI();
    }

    nextTurn() {
      if (!this.isActive) return;
      if (this.isAiActing) {
        // AI is currently acting, ignore manual end-turn requests
        return;
      }

      this.clearAiTimeouts();

      const activeUnit = this.combatants[this.currentTurnIdx];
      // If hero finished their turn with remaining AP, convert to Guard DEF & Barrier!
      if (activeUnit && activeUnit.isPlayer && activeUnit.ap > 0) {
        const guardDef = activeUnit.ap * 3;
        activeUnit.buffs.guard = (activeUnit.buffs.guard || 0) + guardDef;
        this.showFloatingText(activeUnit, `+${guardDef} DEF Guard (Sisa AP)`, 0x38bdf8);

        // Bastion Kinetic AP-to-Barrier mechanic
        const passives = (this.inventory && this.inventory.passives) || [];
        if (passives.includes('iron_will') || passives.includes('retaliation_thorns')) {
          const barrierGain = activeUnit.ap * 15;
          activeUnit.buffs.barrier = (activeUnit.buffs.barrier || 0) + barrierGain;
          this.showFloatingText(activeUnit, `+${barrierGain} Barrier Kinetis`, 0x38bdf8);
          this.logCombat(`Pertahanan Kinetis mengubah sisa ${activeUnit.ap} AP menjadi +${barrierGain} Barrier & +${guardDef} DEF Guard!`, 'fortress');
        } else {
          this.logCombat(`Sisa ${activeUnit.ap} AP diubah menjadi +${guardDef} DEF Guard untuk menahan serangan!`, 'shield');
        }
        GameAudio.playShieldBlock();
      }

      this.clearHighlights();
      this.currentTurnIdx = (this.currentTurnIdx + 1) % this.combatants.length;
      this.startTurn();
    }

    finishAiTurn() {
      if (!this.isActive) return;
      this.isAiActing = false;
      this.clearHighlights();
      this.currentTurnIdx = (this.currentTurnIdx + 1) % this.combatants.length;
      this.startTurn();
    }

    endBattle(playerWon) {
      this.isActive = false;
      this.isAiActing = false;
      this.clearAiTimeouts();
      this.clearHighlights();
      this.clearIntentBadges();
      this.comboCount = 0;
      this.updateComboUI();

      const vig = document.getElementById('damageVignette');
      if (vig) vig.classList.remove('active-vignette');
      const fl = document.getElementById('critFlash');
      if (fl) fl.classList.remove('active-flash');

      GameAudio.stopBattleMusic();

      const lootGained = [];
      let expGained = 0;
      let goldGained = 0;
      let didLevelUp = false;

      if (playerWon) {
        this.combatants.filter(c => !c.isPlayer).forEach(e => {
          expGained += e.stats.exp || 30;
          goldGained += e.stats.gold || 20;

          if (e.isBounty) {
            // Bounty Target Mini-Boss Defeated
            const bDef = e.data.bountyDef || (RPG_DATA.BOUNTIES && RPG_DATA.BOUNTIES[this.dungeon.floorData.floor]);
            if (bDef) {
              goldGained += (bDef.rewardGold || 220);
              expGained += (bDef.rewardExp || 160);
              this.inventory.completeBounty(bDef.id, bDef);
              if (bDef.relicReward) {
                const bRelic = RPG_DATA.ITEMS.find(i => i.id === bDef.relicReward);
                if (bRelic) lootGained.push({ ...bRelic });
              }
              this.logCombat(`BURONAN DITUMPAS! Misi buronan ${bDef.name} berhasil diselesaikan (+${bDef.rewardGold} Gold & Relik Eksklusif)!`, 'trophy');
            }
          } else if (e.isMimic) {
            // Abyssal Mimic Defeated
            goldGained += 120;
            expGained += 85;
            const tongueRelic = RPG_DATA.ITEMS.find(i => i.id === 'mimic_lucky_tongue');
            if (tongueRelic && Math.random() < 0.65) {
              lootGained.push({ ...tongueRelic });
            }
            lootGained.push(this.inventory.generateRandomLoot(this.dungeon.floorData.floor));
            this.logCombat('Peti Mimic Lapar dimusnahkan! Harta karun curian dan relik berhasil direbut!', 'chest');
          } else if (e.isBoss) {
            const bDef = RPG_DATA.BOSSES[e.data.bossId];
            if (bDef && bDef.rewardItem) {
              const item = RPG_DATA.ITEMS.find(i => i.id === bDef.rewardItem);
              if (item) lootGained.push(item);
            }
          } else if (e.isElite) {
            // Guaranteed Elite drop: Rare or Epic equipment piece + bonus Gold & EXP
            goldGained += 45;
            expGained += 50;
            const floorPool = RPG_DATA.ITEMS.filter(i => (i.rarity === 'rare' || i.rarity === 'epic'));
            if (floorPool.length > 0) {
              const dropped = floorPool[Math.floor(Math.random() * floorPool.length)];
              lootGained.push({ ...dropped });
            }
          } else if (Math.random() < 0.4) {
            lootGained.push(this.inventory.generateRandomLoot(this.dungeon.floorData.floor));
          }
        });

        // Cursed Ambush Bonus Rewards
        if (this.isCursedAmbush) {
          goldGained += 95;
          expGained += 85;
          const highPool = RPG_DATA.ITEMS.filter(i => (i.rarity === 'epic' || i.rarity === 'legendary'));
          if (highPool.length > 0) {
            const highItem = highPool[Math.floor(Math.random() * highPool.length)];
            lootGained.push({ ...highItem });
          }
        }

        if (this.inventory.abyssContract) {
          goldGained = Math.round(goldGained * 1.5);
          expGained = Math.round(expGained * 1.3);
          if (this.combatants.some(c => !c.isPlayer && c.isBoss)) {
            lootGained.push({...AbyssContractRelics[(this.dungeon.floorData.floor - 1) % AbyssContractRelics.length]});
          }
        }
        // Apply Gold Multiplier (from Boons and Relics like Mimic Lucky Tongue)
        const goldMult = this.inventory.getGoldMultiplier ? this.inventory.getGoldMultiplier() : 1.0;
        goldGained = Math.round(goldGained * goldMult);

        this.inventory.gold += goldGained;
        didLevelUp = this.inventory.gainExp(expGained);
        GameAudio.playHeal();
        this.logCombat(`Kemenangan! Memperoleh +${expGained} EXP & +${goldGained} Gold!`, 'trophy');
        if (didLevelUp) {
          this.logCombat(`Naik Level! Level karakter kini: ${this.inventory.level}!`, 'spark');
        }
      } else {
        this.logCombat(`Karakter gugur di dalam kegelapan Jurang...`, 'skull');
      }

      if (this.onCombatEnd) {
        this.onCombatEnd(playerWon, { exp: expGained, gold: goldGained, loot: lootGained, leveledUp: didLevelUp });
      }
    }

    // --- GRID HIGHLIGHTING & TARGETING ---

    clearHighlights() {
      while (this.highlightGroup.children.length > 0) {
        const obj = this.highlightGroup.children[0];
        GamePresentation.disposeTree(obj);
      }
      this.gridHighlights = [];
    }

    isUnitInRange(attacker, target, range = 1) {
      if (!attacker || !target) return false;
      const dx = Math.abs(attacker.gx - target.gx);
      const dz = Math.abs(attacker.gz - target.gz);
      let maxR = Math.max(1, range || 1);
      if (attacker.isPlayer && this.inventory && this.inventory.passives && this.inventory.passives.includes('eagle_eye')) {
        maxR += 1;
      }
      // Chebyshev distance: covers all 8 touching tiles (orthogonal & diagonal) for melee range 1
      return Math.max(dx, dz) <= maxR;
    }

    showMovementGrid(unit) {
      const activeSkills = this.inventory.getActiveSkills ? this.inventory.getActiveSkills() : RPG_DATA.CLASSES[this.inventory.heroClassId].skills;
      const skill = this.selectedSkill || activeSkills[0];
      this.showSkillRange(unit, skill);
    }

    showSkillRange(unit, skill) {
      this.clearHighlights();
      if (!unit) return;
      const activeSkills = this.inventory.getActiveSkills ? this.inventory.getActiveSkills() : RPG_DATA.CLASSES[this.inventory.heroClassId].skills;
      if (!skill) skill = activeSkills[0];

      let range = skill.range || 1;
      if (unit.isPlayer && this.inventory && this.inventory.passives && this.inventory.passives.includes('eagle_eye')) {
        range += 1;
      }
      const tileGeo = new THREE.PlaneGeometry(GameDungeon.TILE_SIZE * 0.92, GameDungeon.TILE_SIZE * 0.92);

      // 1. Walkable Movement Tiles (Soft Blue)
      const maxMove = Math.min(unit.stats.moveRange || 4, unit.ap * 2);
      if (maxMove > 0) {
        const reachable = this.dungeon.getReachableTiles(unit.gx, unit.gz, maxMove);
        const moveMat = new THREE.MeshBasicMaterial({
          color: 0x8abcc9,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide
        });

        reachable.forEach(t => {
          // Don't draw blue over occupied tiles
          const occupied = this.combatants.some(c => c.hp > 0 && c.gx === t.gx && c.gz === t.gz);
          if (occupied) return;

          const mesh = new THREE.Mesh(tileGeo, moveMat);
          mesh.rotation.x = -Math.PI / 2;
          const wPos = this.dungeon.gridToWorld(t.gx, t.gz);
          mesh.position.set(wPos.x, 0.04, wPos.z);
          mesh.userData = { isMoveTile: true, gx: t.gx, gz: t.gz, dist: t.dist };
          this.highlightGroup.add(mesh);
          this.gridHighlights.push(mesh);
        });
      }

      // 2. Direct Attack Perimeter (Soft Red Tiles)
      const maxR = Math.max(1, range);
      const attackMat = new THREE.MeshBasicMaterial({
        color: 0xc97969,
        transparent: true,
        opacity: 0.24,
        side: THREE.DoubleSide
      });

      for (let dz = -maxR; dz <= maxR; dz++) {
        for (let dx = -maxR; dx <= maxR; dx++) {
          if (dx === 0 && dz === 0) continue;
          const gx = unit.gx + dx;
          const gz = unit.gz + dz;

          if (gx < 0 || gx >= this.dungeon.width || gz < 0 || gz >= this.dungeon.height) continue;
          if (Math.max(Math.abs(dx), Math.abs(dz)) > maxR) continue;
          if (!this.dungeon.isWalkable(gx, gz)) continue;
          if (this.gridHighlights.some(m => m.userData.isMoveTile && m.userData.gx === gx && m.userData.gz === gz)) continue;

          // Don't draw over existing move tile if empty
          const mesh = new THREE.Mesh(tileGeo, attackMat);
          mesh.rotation.x = -Math.PI / 2;
          const wPos = this.dungeon.gridToWorld(gx, gz);
          mesh.position.set(wPos.x, 0.05, wPos.z);
          mesh.userData = { isAttackTile: true, gx, gz };
          this.highlightGroup.add(mesh);
          this.gridHighlights.push(mesh);
        }
      }

      // 3. Highlight All Enemies (Glowing Red for Direct Range, Glowing Orange for Reachable with Move+Attack)
      const aliveEnemies = this.combatants.filter(c => !c.isPlayer && c.hp > 0);
      aliveEnemies.forEach(enemy => {
        const inDirectRange = this.isUnitInRange(unit, enemy, range);
        const wPos = this.dungeon.gridToWorld(enemy.gx, enemy.gz);

        if (inDirectRange) {
          // Direct Attack Target (Bright Glowing Red)
          const targetMat = new THREE.MeshBasicMaterial({
            color: 0xff1111,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
          });
          const targetMesh = new THREE.Mesh(tileGeo, targetMat);
          targetMesh.rotation.x = -Math.PI / 2;
          targetMesh.position.set(wPos.x, 0.06, wPos.z);
          targetMesh.userData = { isAttackTile: true, isDirectEnemy: true, gx: enemy.gx, gz: enemy.gz, enemyRef: enemy };
          this.highlightGroup.add(targetMesh);
          this.gridHighlights.push(targetMesh);
        } else {
          // Check if reachable with Move + Attack
          const dist = Math.abs(unit.gx - enemy.gx) + Math.abs(unit.gz - enemy.gz);
          const moveAp = Math.max(1, Math.ceil((dist - 1) / 2));
          const totalAp = moveAp + skill.cost;

          if (unit.ap >= totalAp) {
            // Reachable Target (Orange: Move + Attack Ready)
            const approachMat = new THREE.MeshBasicMaterial({
              color: 0xf59e0b,
              transparent: true,
              opacity: 0.65,
              side: THREE.DoubleSide
            });
            const approachMesh = new THREE.Mesh(tileGeo, approachMat);
            approachMesh.rotation.x = -Math.PI / 2;
            approachMesh.position.set(wPos.x, 0.06, wPos.z);
            approachMesh.userData = { isAttackTile: true, isApproachEnemy: true, gx: enemy.gx, gz: enemy.gz, enemyRef: enemy };
            this.highlightGroup.add(approachMesh);
            this.gridHighlights.push(approachMesh);
          }
        }
      });
    }

    // --- ACTIONS & SKILLS EXECUTION ---

    moveUnit(unit, targetGx, targetGz) {
      if (unit.isPlayer && !this.isPlayerTurn()) return false;
      const dist = Math.abs(unit.gx - targetGx) + Math.abs(unit.gz - targetGz);
      const apCost = Math.ceil(dist / 2);
      if (unit.ap < apCost) return false;

      unit.ap -= apCost;
      const dx = targetGx - unit.gx;
      const dz = targetGz - unit.gz;
      if (dx !== 0 || dz !== 0) {
        unit.facing = { dx: Math.sign(dx), dz: Math.sign(dz) };
        if (unit.model) {
          unit.model.rotation.y = Math.atan2(dx, dz);
        }
      }

      unit.gx = targetGx;
      unit.gz = targetGz;
      const wPos = this.dungeon.gridToWorld(targetGx, targetGz);

      // Smooth step
      unit.model.position.set(wPos.x, 0, wPos.z);
      GameAudio.playFootstep();

      this.updateCombatUI();
      if (unit.isPlayer) {
        const activeSkills = this.inventory.getActiveSkills ? this.inventory.getActiveSkills() : RPG_DATA.CLASSES[this.inventory.heroClassId].skills;
        const skill = this.selectedSkill || activeSkills[0];
        this.showSkillRange(unit, skill);
      }
      return true;
    }

    tryAttackOrApproach(hero, targetUnit, skill) {
      if (!this.isActive || !this.isPlayerTurn() || !hero || !targetUnit || targetUnit.hp <= 0) return false;
      const activeSkills = this.inventory.getActiveSkills ? this.inventory.getActiveSkills() : RPG_DATA.CLASSES[this.inventory.heroClassId].skills;
      if (!skill) skill = activeSkills[0];

      // 1. Target is ALREADY in attack range (including diagonals for range 1)
      if (this.isUnitInRange(hero, targetUnit, skill.range || 1)) {
        const dx = targetUnit.gx - hero.gx;
        const dz = targetUnit.gz - hero.gz;
        hero.facing = { dx: Math.sign(dx) || hero.facing.dx, dz: Math.sign(dz) || hero.facing.dz };
        if (hero.model) hero.model.rotation.y = Math.atan2(dx, dz);
        return this.useSkill(hero, targetUnit, skill);
      }

      // 2. Target is out of range. Check if hero can approach and attack!
      const adjacentDirs = [
        { dx: 1, dz: 0 }, { dx: -1, dz: 0 }, { dx: 0, dz: 1 }, { dx: 0, dz: -1 },
        { dx: 1, dz: 1 }, { dx: 1, dz: -1 }, { dx: -1, dz: 1 }, { dx: -1, dz: -1 }
      ];

      const candidateTiles = [];
      adjacentDirs.forEach(d => {
        const gx = targetUnit.gx + d.dx;
        const gz = targetUnit.gz + d.dz;
        if (this.dungeon.isWalkable(gx, gz)) {
          const isOccupied = this.combatants.some(c => c.hp > 0 && c.gx === gx && c.gz === gz);
          if (!isOccupied) {
            candidateTiles.push({ gx, gz });
          }
        }
      });

      if (candidateTiles.length === 0) {
        this.logCombat(`Semua petak di sekeliling ${targetUnit.name} terhalang!`, 'warning');
        this.showFloatingText(hero, 'Jalur Terhalang!', 0xef4444);
        return false;
      }

      // Find closest adjacent tile
      let bestTile = null;
      let minDistance = Infinity;
      candidateTiles.forEach(t => {
        const d = Math.abs(hero.gx - t.gx) + Math.abs(hero.gz - t.gz);
        if (d < minDistance) {
          minDistance = d;
          bestTile = t;
        }
      });

      const moveAp = Math.max(1, Math.ceil(minDistance / 2));
      const totalAp = moveAp + skill.cost;

      if (hero.ap < totalAp) {
        this.logCombat(`Jarak terlalu jauh! Butuh ${totalAp} AP untuk mendekat & menyerang (${moveAp} AP Gerak + ${skill.cost} AP Skill). AP Anda: ${hero.ap}.`, 'warning');
        this.showFloatingText(hero, `Butuh ${totalAp} AP`, 0xef4444);
        GameAudio.playShieldBlock();
        return false;
      }

      // Auto-step to best adjacent tile
      this.logCombat(`${hero.name} melangkah mendekati ${targetUnit.name}...`, 'lightning');
      this.moveUnit(hero, bestTile.gx, bestTile.gz);

      // Execute attack immediately after step
      setTimeout(() => {
        if (this.isActive && targetUnit.hp > 0) {
          const dx = targetUnit.gx - hero.gx;
          const dz = targetUnit.gz - hero.gz;
          hero.facing = { dx: Math.sign(dx) || hero.facing.dx, dz: Math.sign(dz) || hero.facing.dz };
          if (hero.model) hero.model.rotation.y = Math.atan2(dx, dz);
          this.useSkill(hero, targetUnit, skill);
        }
      }, 150);

      return true;
    }

    useSkill(attacker, target, skill) {
      skill = {...skill};
      attacker.cooldowns = attacker.cooldowns || {};

      if (attacker.ap < skill.cost) {
        this.logCombat(`AP tidak mencukupi untuk menggunakan ${skill.name}!`, 'warning');
        return false;
      }

      if (skill.cooldown && (attacker.cooldowns[skill.id] || 0) > 0) {
        this.logCombat(`${skill.name} masih cooldown (${attacker.cooldowns[skill.id]} giliran)!`, 'hourglass');
        return false;
      }

      if (skill.adrenalineReq && attacker.adrenaline < skill.adrenalineReq) {
        this.logCombat(`Butuh 100% Adrenaline untuk memicu Ultimate!`, 'warning');
        return false;
      }

      attacker.ap -= skill.cost;
      if (skill.cooldown) attacker.cooldowns[skill.id] = skill.cooldown;
      if (skill.adrenalineReq) attacker.adrenaline = 0;

      // Handle Self/Buff/Vault skill
      if (skill.type === 'self' || skill.type === 'vault_leap') {
        if (typeof GameModels !== 'undefined' && GameModels.spawnSkillVFX && attacker.model) {
          GameModels.spawnSkillVFX(this.scene, skill.id, attacker.model.position, attacker.model.position);
        }
        if (skill.type === 'vault_leap') {
          // Leap back 2 tiles opposite facing
          const fX = attacker.facing ? attacker.facing.dx : 0;
          const fZ = attacker.facing ? attacker.facing.dz : 1;
          let leapDist = 2;
          let landingX = attacker.gx - (fX * leapDist);
          let landingZ = attacker.gz - (fZ * leapDist);

          if (!this.dungeon.isWalkable(landingX, landingZ) || this.combatants.some(c => c.hp > 0 && c.gx === landingX && c.gz === landingZ)) {
            leapDist = 1;
            landingX = attacker.gx - (fX * leapDist);
            landingZ = attacker.gz - (fZ * leapDist);
          }

          if (this.dungeon.isWalkable(landingX, landingZ) && !this.combatants.some(c => c.hp > 0 && c.gx === landingX && c.gz === landingZ)) {
            this.moveUnit(attacker, landingX, landingZ);
            this.showFloatingText(attacker, 'LOMPAT MUNDUR! (Vault)', 0x38bdf8);
            GameAudio.playSlash();
          }

          if (skill.dodgeBuff) {
            attacker.buffs.dodge = Math.min(0.6, (attacker.buffs.dodge || 0) + skill.dodgeBuff);
            this.showFloatingText(attacker, `+${Math.round(skill.dodgeBuff * 100)}% Dodge`, 0x22c55e);
          }
          if (skill.apRefund) {
            attacker.ap = Math.min(attacker.maxAp, attacker.ap + skill.apRefund);
            this.showFloatingText(attacker, `+${skill.apRefund} AP Refund`, 0xfacc15);
          }
          this.logCombat(`${attacker.name} melompat mundur akrobatik dan meraih bonus Dodge + AP!`, 'lightning');
          this.updateCombatUI();
          return true;
        }
        if (skill.defBuff) {
          attacker.buffs.guard = (attacker.buffs.guard || 0) + skill.defBuff;
          this.showFloatingText(attacker, `+${skill.defBuff} DEF (Brace)`, 0x3498db);
          GameAudio.playShieldBlock();
        }
        if (skill.barrier) {
          attacker.buffs.barrier = (attacker.buffs.barrier || 0) + skill.barrier;
          this.showFloatingText(attacker, `+${skill.barrier} Barrier`, 0x9b59b6);
          GameAudio.playMagicBeam();
        }
        if (skill.poiseRegen) {
          attacker.poise = Math.min(attacker.maxPoise, attacker.poise + skill.poiseRegen);
        }
        this.logCombat(`${attacker.name} menggunakan ${skill.name}!`, 'shield');
        this.updateCombatUI();
        return true;
      }

      // Handle Attack skill against target
      if (!target || target.hp <= 0) return false;

      const passives = attacker.isPlayer ? ((this.inventory && this.inventory.passives) || []) : [];
      const boons = attacker.isPlayer ? ((this.inventory && this.inventory.boons) || []) : [];

      // Check Dodge on Target
      if (target.buffs && target.buffs.dodge && Math.random() < target.buffs.dodge) {
        this.showFloatingText(target, 'DODGE! (Lolos)', 0x38bdf8);
        this.logCombat(`${target.name} berhasil menghindar (Dodge) dari serangan ${skill.name}!`, 'shield');
        GameAudio.playSlash();
        if (target.isPlayer && passives.includes('riposte_stance')) {
          target.riposteTokens = Math.min(3, (target.riposteTokens || 0) + 1);
          this.showFloatingText(target, `+1 Riposte (${target.riposteTokens}/3)`, 0x38bdf8);
        }
        if (target.isPlayer && passives.includes('gale_agility')) {
          target.ap = Math.min(target.maxAp, target.ap + 1);
          for (let sk in target.cooldowns) {
            if (target.cooldowns[sk] > 0) target.cooldowns[sk]--;
          }
          this.showFloatingText(target, '+1 AP & CD -1 (Gale Agility)', 0x38bdf8);
        }
        this.updateCombatUI();
        return true;
      }

      // Spawn 3D Skill VFX & Hit Recoil Animation
      if (typeof GameModels !== 'undefined' && GameModels.spawnSkillVFX && attacker.model && target.model) {
        GameModels.spawnSkillVFX(this.scene, skill.id, attacker.model.position, target.model.position);
      }
      if (attacker.model && target.model && GamePresentation.settings.motion) {
        // Lunge attacker slightly toward target and recoil target
        const origAtkX = attacker.model.position.x;
        const origAtkZ = attacker.model.position.z;
        const dirX = Math.sign(target.model.position.x - origAtkX) * 0.25;
        const dirZ = Math.sign(target.model.position.z - origAtkZ) * 0.25;
        attacker.model.position.x += dirX;
        attacker.model.position.z += dirZ;
        setTimeout(() => {
          if (attacker.model) {
            attacker.model.position.x = origAtkX;
            attacker.model.position.z = origAtkZ;
          }
        }, 160);
      }

      // Check Flanking / Backstab
      const isBackstab = (attacker.facing.dx === target.facing.dx && attacker.facing.dz === target.facing.dz);
      const isFlank = !isBackstab && (attacker.facing.dx !== 0 && target.facing.dz !== 0 || attacker.facing.dz !== 0 && target.facing.dx !== 0);

      let mult = skill.dmgMult || 1.0;
      let critChance = attacker.stats.critChance || 0.1;

      // Hero Combo / Momentum Multiplier
      if (attacker.isPlayer) {
        this.comboCount = Math.min(5, (this.comboCount || 0) + 1);
        const comboBonus = 1 + (this.comboCount * 0.10);
        mult *= comboBonus;
        this.updateComboUI();
      }

      if (isBackstab) {
        mult *= passives.includes('anatomical_insight') ? 1.8 : 1.5;
        critChance = 1.0; // Guaranteed crit on backstab!
      } else if (isFlank) {
        mult *= 1.25;
      }

      // --- SUBCLASS MECHANICS ---
      // 1. Warrior: Commander (Command stacks)
      if (attacker.isPlayer && passives.includes('tactical_command')) {
        const cmdGain = skill.commandGain || 1;
        attacker.commandStacks = Math.min(5, (attacker.commandStacks || 0) + cmdGain);
        mult *= (1 + (attacker.commandStacks * 0.05));
        if (attacker.commandStacks >= 3 && passives.includes('command_aura')) {
          critChance += 0.15;
          attacker.isStunned = false;
        }
      }

      // 2. Warrior: Berserker (Blood Rage & Frenzy)
      if (attacker.isPlayer && passives.includes('blood_frenzy')) {
        attacker.rageStacks = Math.min(6, (attacker.rageStacks || 0) + 1);
        mult *= (1 + (attacker.rageStacks * 0.05));
        if (attacker.hp < attacker.maxHp * 0.5) {
          mult *= 1.30;
          skill.lifesteal = (skill.lifesteal || 0) + 0.25;
          this.showFloatingText(attacker, 'FRENZY! (+30% DMG & 25% Heal)', 0xef4444);
        }
      }

      // 3. Mage: Spellblade (Arcane Blade Charge)
      if (attacker.isPlayer && passives.includes('arcane_blade_passive')) {
        if (skill.consumesCharges || skill.id === 'phase_slash' || skill.slotIdx === 0) {
          const charges = attacker.arcaneCharges || 0;
          if (charges > 0) {
            attacker.arcaneCharges = 0;
            mult *= (1 + (charges * 0.30));
            this.showFloatingText(attacker, `PELEPAS ASTRAL! x${charges} (+${charges * 30}% DMG)`, 0x06b6d4);
            if (charges >= 2) {
              attacker.ap = Math.min(attacker.maxAp, attacker.ap + 1);
              this.showFloatingText(attacker, '+1 AP Refund!', 0x38bdf8);
            }
          }
        } else {
          // Spell casting adds +1 Charge
          attacker.arcaneCharges = Math.min(4, (attacker.arcaneCharges || 0) + 1);
          this.showFloatingText(attacker, `+1 Astral Charge (${attacker.arcaneCharges}/4)`, 0x06b6d4);
          if (passives.includes('arcane_aegis_mastery')) {
            attacker.buffs.barrier = (attacker.buffs.barrier || 0) + 10;
          }
        }
      }

      // 4. Mage: Elementalist (Elemental Reaction Chain)
      if (attacker.isPlayer && passives.includes('elemental_cycle')) {
        let currElem = skill.element;
        if (!currElem) {
          if (skill.id.includes('fire') || skill.id.includes('meteor') || skill.id.includes('sun')) currElem = 'fire';
          else if (skill.id.includes('frost') || skill.id.includes('glacial') || skill.id.includes('ice')) currElem = 'ice';
          else if (skill.id.includes('lightning') || skill.id.includes('bolt') || skill.id.includes('supernova')) currElem = 'lightning';
        }

        if (currElem && target.lastElementHit) {
          let triggeredReaction = null;
          if (target.lastElementHit === 'ice' && currElem === 'fire') {
            triggeredReaction = 'MELT';
            mult *= 1.35;
            this.showFloatingText(target, 'REAKSI: MELT! (+35% DMG, -50% DEF)', 0xf97316);
            this.logCombat(`Reaksi Elemen terpicu: MELT! Mencairkan pertahanan ${target.name}!`, 'fire');
          } else if (target.lastElementHit === 'lightning' && currElem === 'ice') {
            triggeredReaction = 'SUPERCONDUCT';
            target.isStunned = true;
            this.showFloatingText(target, 'REAKSI: SUPERCONDUCT! (STUN 1T)', 0x38bdf8);
            this.logCombat(`Reaksi Elemen terpicu: SUPERCONDUCT! Melumpuhkan ${target.name} 1 giliran!`, 'lightning');
          } else if (target.lastElementHit === 'fire' && currElem === 'lightning') {
            triggeredReaction = 'OVERLOAD';
            this.showFloatingText(target, 'REAKSI: OVERLOAD! (30 True DMG AoE)', 0xeab308);
            this.logCombat(`Reaksi Elemen terpicu: OVERLOAD! Ledakan bintang membakar area!`, 'blast');
            // Overload AoE True DMG
            this.combatants.forEach(c => {
              if (!c.isPlayer && c.hp > 0) {
                const dist = Math.abs(c.gx - target.gx) + Math.abs(c.gz - target.gz);
                if (dist <= 2) {
                  c.hp = Math.max(0, c.hp - 30);
                  this.showFloatingText(c, '-30 Overload', 0xeab308);
                }
              }
            });
          }

          if (triggeredReaction) {
            // Cut cooldown of all skills by 1 turn!
            for (let sk in attacker.cooldowns) {
              if (attacker.cooldowns[sk] > 0) attacker.cooldowns[sk]--;
            }
            if (passives.includes('elemental_resonance')) {
              mult *= 1.25;
              attacker.buffs.barrier = (attacker.buffs.barrier || 0) + 10;
              this.showFloatingText(attacker, '+10 Barrier Resonansi', 0x38bdf8);
            }
            GameAudio.playMagicBeam();
          }
        }
        if (currElem) {
          target.lastElementHit = currElem;
        }
      }

      // 5. Mage: Hexbound (Corruption stacks)
      if (attacker.isPlayer && passives.includes('abyssal_corruption')) {
        const cStacks = skill.corruptionStacks || 1;
        target.corruptionStacks = Math.min(5, (target.corruptionStacks || 0) + cStacks);
        this.showFloatingText(target, `+${cStacks} Corruption (${target.corruptionStacks}/5)`, 0xa855f7);
      }

      // 6. Rogue: Shadow Stalker (Weakness Mark & 100% Crit Vanish)
      if (attacker.isPlayer && passives.includes('anatomical_insight')) {
        let markGain = skill.markGain || 0;
        if (isBackstab) markGain = Math.max(markGain, 2);
        else if (isFlank) markGain = Math.max(markGain, 1);

        if (markGain > 0) {
          target.weaknessMarks = Math.min(5, (target.weaknessMarks || 0) + markGain);
          this.showFloatingText(target, `+${markGain} Titik Lemah (${target.weaknessMarks}/5)`, 0xc084fc);
        }

        if (target.weaknessMarks >= 3) {
          target.weaknessMarks -= 3;
          critChance = 1.0;
          mult *= 1.75;
          attacker.isVanished = true;
          attacker.buffs.dodge = Math.min(0.6, (attacker.buffs.dodge || 0) + 0.60);
          this.showFloatingText(attacker, '100% CRIT & VANISH AKTIF!', 0xc084fc);
          this.logCombat(`Titik Vital Terbuka! Serangan 100% Critical dan ${attacker.name} lenyap (Vanish)!`, 'shadow');
        }
      }

      // 7. Rogue: Bladedancer (Combo Chain)
      if (attacker.isPlayer && passives.includes('chain_flow')) {
        if (attacker.lastSkillId !== skill.id) {
          const cGain = skill.chainGain || 1;
          attacker.chainCount = Math.min(4, (attacker.chainCount || 0) + cGain);
          mult *= (1 + (attacker.chainCount * 0.15));
          this.showFloatingText(attacker, `COMBO CHAIN x${attacker.chainCount} (+${attacker.chainCount * 15}% DMG)`, 0xf59e0b);

          if (attacker.chainCount >= 4) {
            for (let sk in attacker.cooldowns) {
              if (attacker.cooldowns[sk] > 0) attacker.cooldowns[sk]--;
            }
            if (passives.includes('adrenaline_chain')) {
              critChance += 0.08;
            }
            this.showFloatingText(attacker, 'FINALE! COOLDOWN -1', 0xf59e0b);
            GameAudio.playMagicBeam();
          }
        }
        attacker.lastSkillId = skill.id;
      }

      // Passive: Arcane Aegis (+10 Barrier Shield per spell)
      if (passives.includes('arcane_aegis')) {
        attacker.buffs.barrier = (attacker.buffs.barrier || 0) + 10;
        this.showFloatingText(attacker, '+10 Barrier Aegis', 0x9b59b6);
      }

      // 8. Archer: Deadeye (Sniper Bonus, Eagle Eye, Killzone Focus)
      const targetDist = Math.abs(attacker.gx - target.gx) + Math.abs(attacker.gz - target.gz);
      if (attacker.isPlayer && (skill.sniperBonus || passives.includes('killzone_focus') || passives.includes('eagle_eye'))) {
        if (passives.includes('eagle_eye')) {
          critChance += 0.20;
        }
        if (targetDist >= 3) {
          mult *= 1.25;
          this.showFloatingText(attacker, 'SNIPER BONUS (+25%)', 0xf59e0b);
          if (passives.includes('killzone_focus')) {
            mult *= 1.35;
          }
        }
      }

      // 9. Archer: Trapmaster (Toxic Tips & Crippling Venom)
      if (attacker.isPlayer && passives.includes('toxic_tips')) {
        target.isPoisoned = true;
        target.poisonTurns = Math.max(target.poisonTurns || 0, 3);
        target.poisonDmg = Math.max(target.poisonDmg || 0, 15);
        this.showFloatingText(target, '+15 Racun Berbisa DoT', 0x10b981);
      }

      // 10. Archer: Windrunner (Twin Shot Chance)
      let triggeredTwinShot = false;
      if (attacker.isPlayer && passives.includes('twin_shot') && Math.random() < 0.45 && !skill.isFollowUp) {
        triggeredTwinShot = true;
      }

      // Snare / Root Trap Mechanic
      if (skill.type === 'trap' || skill.rootTurns) {
        target.isRooted = true;
        target.rootTurns = (target.rootTurns || 0) + (skill.rootTurns || 1);
        this.showFloatingText(target, `TERJERAT! (Root ${target.rootTurns}T)`, 0xeab308);
        this.logCombat(`${target.name} terjerat kawat berduri dan tidak dapat bergerak!`, 'shield');
      }

      const isCrit = Math.random() < critChance;
      if (isCrit) mult *= 1.75;

      const baseAtk = attacker.stats.atk || 20;
      let targetDef = (target.stats.def || 5) + (target.buffs.guard || 0);

      // Hexbound Soul Siphon DEF shred
      if (passives.includes('soul_siphon') && target.corruptionStacks > 0) {
        targetDef = Math.max(0, targetDef - (target.corruptionStacks * 5));
      }
      // Melt Reaction DEF shred
      if (target.lastElementHit === 'ice' && skill.element === 'fire') {
        targetDef = Math.round(targetDef * 0.5);
      }
      // Crippling Venom DEF shred
      if (attacker.isPlayer && passives.includes('crippling_venom') && (target.isPoisoned || target.isRooted)) {
        targetDef = Math.max(0, targetDef - 5);
      }
      // Killzone Focus DEF bypass
      if (attacker.isPlayer && passives.includes('killzone_focus') && targetDist >= 3) {
        targetDef = Math.max(0, targetDef - 5);
      }

      let rawDmg = AbyssBalance.damage(baseAtk, mult, targetDef);
      let poiseDmg = Math.round((skill.poiseDmg || 15) * (isCrit ? 1.5 : 1.0));

      // Cursed Altar Vulnerability (+25% damage taken by hero)
      if (target.isPlayer && target.isCursedVulnerable) {
        rawDmg = Math.round(rawDmg * 1.25);
      }

      // Judicator & Shadow Execution (< 25% or < 30% HP)
      const isCommanderExec = attacker.isPlayer && passives.includes('tactical_command') && (skill.isExecute || (target.hp <= target.maxHp * 0.25));
      const isShadowExec = attacker.isPlayer && passives.includes('anatomical_insight') && (skill.isExecute || (target.hp <= target.maxHp * 0.30));
      if (isCommanderExec || isShadowExec) {
        rawDmg = target.isBoss ? Math.max(rawDmg, Math.round(target.maxHp * .12)) : target.hp;
        this.showFloatingText(target, 'EKSEKUSI MATI!', 0xff0000, 'floating-crit');
        this.logCombat(`VONIS EKSEKUSI! ${target.name} langsung dieksekusi mati seketika!`, 'skull');
        GameAudio.playHeavyImpact();
      }

      // Boon: Hantaman Gempa Purba (+15 Poise Damage)
      if (boons.includes('boon_poise_crush')) {
        poiseDmg += 15;
      }

      // Boon: Bilah Percikan Surya (30% chance +18 true damage)
      if (boons.includes('boon_solar_edge') && Math.random() < 0.3) {
        rawDmg += 18;
        this.showFloatingText(target, '+18 Percikan Surya', 0xffa500);
      }

      // Deal damage: barrier absorbs actual damage and cannot grow without bound.
      const barrier = Math.min(target.buffs.barrier || 0, Math.round(target.maxHp * .3));
      const absorbed = Math.min(barrier, rawDmg);
      target.buffs.barrier = barrier - absorbed;
      rawDmg -= absorbed;
      const actualDamage = Math.min(target.hp, rawDmg);
      target.hp = Math.max(0, target.hp - rawDmg);
      target.poise = Math.max(0, target.poise - poiseDmg);

      // Elite Affix: Thorns (reflect 25% damage back to player)
      if (attacker.isPlayer && target.isElite && target.eliteMod && target.eliteMod.id === 'thorns') {
        const reflectDmg = Math.max(3, Math.round(rawDmg * 0.25));
        attacker.hp = Math.max(1, attacker.hp - reflectDmg);
        this.showFloatingText(attacker, `-${reflectDmg} Duri Pantulan`, 0x10b981);
        this.logCombat(`${target.name} memantulkan ${reflectDmg} DMG berkat Duri Kinetis!`, 'shield');
      }

      // Elite Affix: Vampiric (enemy heals 30% of damage dealt)
      if (!attacker.isPlayer && attacker.isElite && attacker.eliteMod && attacker.eliteMod.id === 'vampiric') {
        const vHeal = Math.max(4, Math.round(rawDmg * 0.30));
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + vHeal);
        this.showFloatingText(attacker, `+${vHeal} HP Lifesteal`, 0xef4444);
        this.logCombat(`${attacker.name} menghisap ${vHeal} HP darah pahlawan!`, 'blood');
      }

      // Elite Affix: Corrupting (enemy inflicts corruption DoT)
      if (!attacker.isPlayer && attacker.isElite && attacker.eliteMod && attacker.eliteMod.id === 'corrupting' && target.isPlayer) {
        target.corruptionStacks = (target.corruptionStacks || 0) + 1;
        this.showFloatingText(target, '+1 Kutukan Void', 0xa855f7);
        this.logCombat(`${attacker.name} mengutuk pahlawan dengan Korosi Void!`, 'shadow');
      }

      // Hit Impact Juice & Camera Shake
      if (attacker.isPlayer) {
        this.flashModel(target.model, isCrit ? 0xfef08a : (isBackstab ? 0xc084fc : 0xff3838), 130);
        if (isCrit) {
          this.triggerCritFlash();
          this.shakeCamera(0.26, 200);
          if (typeof GameModels !== 'undefined' && GameModels.spawnHitSparks && target.model) {
            GameModels.spawnHitSparks(this.scene, target.model.position, 'crit');
          }
        } else if (isBackstab) {
          this.shakeCamera(0.28, 220);
          if (typeof GameModels !== 'undefined' && GameModels.spawnHitSparks && target.model) {
            GameModels.spawnHitSparks(this.scene, target.model.position, 'slash');
          }
        } else {
          this.shakeCamera(0.09, 120);
          if (typeof GameModels !== 'undefined' && GameModels.spawnHitSparks && target.model) {
            GameModels.spawnHitSparks(this.scene, target.model.position, 'normal');
          }
        }
      } else if (target.isPlayer) {
        // Player got hit by enemy: Break combo & flash damage vignette
        if (this.comboCount > 0) {
          this.logCombat(`Combo terputus akibat terkena serangan musuh!`, 'blood');
          this.comboCount = 0;
          this.updateComboUI();
        }
        this.triggerDamageVignette();
        this.shakeCamera(0.32, 240);
        this.flashModel(target.model, 0xef4444, 150);
        if (typeof GameModels !== 'undefined' && GameModels.spawnHitSparks && target.model) {
          GameModels.spawnHitSparks(this.scene, target.model.position, 'slash');
        }
      }

      // Increase Adrenaline (Boon: Gelombang Tekad gives 2x adrenaline)
      const adrenGain = boons.includes('boon_adrenaline_surge') ? (isCrit ? 50 : 35) : (isCrit ? 30 : 20);
      attacker.adrenaline = Math.min(100, (attacker.adrenaline || 0) + adrenGain);

      // Boon: Sentuhan Darah Abyss (15% Lifesteal) or Skill / Passive Lifesteal
      const skillLifesteal = (skill.lifesteal || 0) + (boons.includes('boon_vampiric_bite') ? 0.15 : 0) + (passives.includes('neurotoxin_stasis') ? 0.15 : 0);
      if (skillLifesteal > 0) {
        const vHeal = Math.max(0, Math.min(Math.round(attacker.maxHp * .08), Math.round(actualDamage * Math.min(.30, skillLifesteal))));
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + vHeal);
        this.showFloatingText(attacker, `+${vHeal} HP Lifesteal`, 0x22c55e);
      }

      if (skill.guardGain) {
        attacker.buffs.guard = (attacker.buffs.guard || 0) + skill.guardGain;
        this.showFloatingText(attacker, `+${skill.guardGain} DEF Guard`, 0x38bdf8);
      }

      // Boon: Gema Kritis Fajar (Shockwave to nearby enemies on critical hit)
      if (isCrit && boons.includes('boon_critical_echo')) {
        this.combatants.forEach(c => {
          if (!c.isPlayer && c !== target && c.hp > 0) {
            const dist = Math.abs(c.gx - target.gx) + Math.abs(c.gz - target.gz);
            if (dist <= 2) {
              c.hp = Math.max(0, c.hp - 20);
              this.showFloatingText(c, '-20 Gema Kritis', 0xfde047);
              this.logCombat(`Gema Kritis merambat ke ${c.name} sebesar 20 DMG!`, 'lightning');
            }
          }
        });
      }

      // Retaliation Thorns (Enemy hit player in Guard - 40% reflect for Bastion)
      if (!attacker.isPlayer && target.isPlayer && (target.buffs.guard || 0) > 0 && this.inventory.passives.includes('retaliation_thorns')) {
        const retDmg = Math.max(1, Math.round(rawDmg * 0.40));
        attacker.hp = Math.max(0, attacker.hp - retDmg);
        this.showFloatingText(attacker, `-${retDmg} Duri Pantul (40%)`, 0xeab308);
        this.logCombat(`Duri perisai Bastion memantulkan ${retDmg} True Damage ke ${attacker.name}!`, 'shield');
      }

      // Rogue Duelist: Riposte Auto-Counter
      if (!attacker.isPlayer && target.isPlayer && (target.riposteTokens || 0) > 0 && target.hp > 0 && attacker.hp > 0) {
        target.riposteTokens--;
        let counterDmg = Math.max(1, Math.round((target.stats.atk || 20) * 0.60));
        if (this.inventory.activeSetBonuses && this.inventory.activeSetBonuses.some(b => b.set === 'duelist' && b.tier >= 4)) {
          counterDmg = Math.round(counterDmg * 1.35);
        }
        attacker.hp = Math.max(0, attacker.hp - counterDmg);
        this.showFloatingText(attacker, `-${counterDmg} RIPOSTE COUNTER!`, 0x38bdf8);
        this.logCombat(`Tangkisan Riposte! ${target.name} membalas serangan ${attacker.name} secara otomatis sebesar ${counterDmg} DMG!`, 'sword');
        GameAudio.playSlash();

        // Armor Shred passive
        if (this.inventory.passives.includes('armor_shred_counter')) {
          attacker.stats.def = Math.max(0, (attacker.stats.def || 5) - 5);
          target.poise = Math.min(target.maxPoise, target.poise + 10);
          this.showFloatingText(attacker, '-5 DEF (Pecah Zirah)', 0xef4444);
          this.showFloatingText(target, '+10 Poise Pulih', 0x22c55e);
        }

        if (attacker.hp <= 0) {
          attacker.hp = 0;

          this.logCombat(`${attacker.name} terbunuh oleh serangan balas Riposte!`, 'skull');
        }
      }

      // Berserker: Build rage when hero takes damage
      if (!attacker.isPlayer && target.isPlayer && this.inventory.passives.includes('blood_frenzy')) {
        target.rageStacks = Math.min(6, (target.rageStacks || 0) + 1);
        this.showFloatingText(target, `+1 Rage (${target.rageStacks}/6)`, 0xef4444);
      }

      // Audio & Popups
      if (skill.id === 'crushing_blow' || skill.id === 'avatar_blood' || skill.id === 'seismic_slam') {
        GameAudio.playHeavyImpact();
      } else if (skill.id === 'fireball_abyss' || skill.id === 'meteor_swarm') {
        GameAudio.playFireball();
      } else if (skill.id === 'arcane_bolt' || skill.id === 'solar_supernova' || skill.id === 'glacial_spike') {
        GameAudio.playMagicBeam();
      } else {
        GameAudio.playSlash();
      }

      // Floating text popups with distinct styling classes
      let text = `-${rawDmg}`;
      let color = isCrit ? 0xf1c40f : 0xffffff;
      let styleClass = '';
      if (isBackstab) {
        text += ' BACKSTAB!';
        styleClass = 'floating-backstab';
      } else if (isCrit) {
        text += ' CRITICAL!';
        styleClass = 'floating-crit';
      }
      this.showFloatingText(target, text, color, styleClass);

      this.logCombat(`${attacker.name} melancarkan ${skill.name} ke ${target.name} sebesar ${rawDmg} DMG!`, 'blast');

      // Check STANCE BREAK (with Stagger Immunity & Stun Immunity protection)
      const hasStaggerImmunity = target.isPlayer && this.inventory.passives.includes('iron_will') && (target.buffs.guard || 0) > 0;
      if (target.poise <= 0 && !target.isStunned && target.hp > 0 && !hasStaggerImmunity && (!target.stunImmunity || target.stunImmunity <= 0)) {
        target.isStunned = true;
        GameAudio.playStanceBreak();
        this.triggerCritFlash();
        this.shakeCamera(0.42, 340);
        if (typeof GameModels !== 'undefined' && GameModels.spawnHitSparks && target.model) {
          GameModels.spawnHitSparks(this.scene, target.model.position, 'stance');
        }
        this.showFloatingText(target, 'STANCE BREAK! (STUN)', 0xe67e22, 'floating-break');
        this.logCombat(`PERTAHANAN HANCUR! ${target.name} mengalami STANCE BREAK dan pingsan 1 giliran!`, 'lightning');

        // Check Passive: Shatter Feast (Heal 25% HP & +1 AP on Stance Break)
        if (attacker.isPlayer && this.inventory.passives.includes('shatter_feast')) {
          const sHeal = Math.round(attacker.maxHp * 0.25);
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + sHeal);
          attacker.ap = Math.min(attacker.maxAp, attacker.ap + 1);
          this.showFloatingText(attacker, `+${sHeal} HP & +1 AP (Shatter Feast)`, 0x22c55e);
          GameAudio.playHeal();
        }

        // Check 4-piece Blood Set bonus
        if (attacker.isPlayer && this.inventory.activeSetBonuses.some(b => b.set === 'blood' && b.tier === 4)) {
          const healAmt = Math.min(35, Math.round(attacker.maxHp * .08));
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
          this.showFloatingText(attacker, `+${healAmt} HP (Avatar Darah)`, 0x2ecc71);
          GameAudio.playHeal();
        }
      } else if (target.poise <= 0 && hasStaggerImmunity) {
        this.showFloatingText(target, 'KEBAL STAGGER (Iron Will)', 0x38bdf8);
        this.logCombat(`${target.name} kebal Stance Break berkat Kehendak Baja (Iron Will)!`, 'shield');
      }

      // Check Target Death
      if (target.hp <= 0) {
        GameAudio.playMonsterHurt();

        this.logCombat(`${target.name} tewas terhempas ke lantai Abyss!`, 'skull');
        if (target.model) {
          GameDeath.begin(this, target);
          if (typeof GameModels !== 'undefined' && GameModels.spawnHitSparks) {
            GameModels.spawnHitSparks(this.scene, target.model.position, 'stance');
          }
        }

        // Elite Affix: Explosive on Death (28 damage in adjacent tiles)
        if (target.isElite && target.eliteMod && target.eliteMod.id === 'explosive') {
          this.logCombat(`LEDAKAN BARA! ${target.name} meledak dahsyat saat tumbang!`, 'fire');
          this.shakeCamera(0.35, 260);
          if (typeof GameModels !== 'undefined' && GameModels.spawnHitSparks && target.model) {
            GameModels.spawnHitSparks(this.scene, target.model.position, 'stance');
          }
          GameAudio.playHeavyImpact();
          this.combatants.forEach(u => {
            if (u.hp > 0 && u !== target) {
              const dist = Math.abs(u.gx - target.gx) + Math.abs(u.gz - target.gz);
              if (dist <= 1.5) {
                const expDmg = 28;
                u.hp = Math.max(0, u.hp - expDmg);
                this.showFloatingText(u, `-${expDmg} Ledakan Bara`, 0xf97316);
                this.logCombat(`${u.name} terkena ledakan mayat (-${expDmg} HP)!`, 'fire');
              }
            }
          });
        }

        // Hexbound: Harvest on Kill (+30% HP & +1 AP)
        if (attacker.isPlayer && this.inventory.passives.includes('abyssal_corruption') && (target.corruptionStacks || 0) > 0) {
          const hAmt = Math.min(40, Math.round(attacker.maxHp * .08));
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + hAmt);
          attacker.ap = Math.min(attacker.maxAp, attacker.ap + 1);
          this.showFloatingText(attacker, `+${hAmt} HP & +1 AP (Hisap Jiwa)`, 0x22c55e);
          GameAudio.playHeal();
        }

        // Passive: Vanish on Kill (Shadow Stalker)
        if (attacker.isPlayer && this.inventory.passives.includes('vanish_kill')) {
          attacker.buffs.dodge = Math.min(.6, (attacker.buffs.dodge || 0) + .5);
          const vHeal = Math.min(35, Math.round(attacker.maxHp * .08));
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + vHeal);
          if (attacker.cooldowns['flash_strike']) attacker.cooldowns['flash_strike'] = 0;
          this.showFloatingText(attacker, `+${vHeal} HP & Vanish!`, 0xa855f7);
          this.logCombat(`Lenyap Dalam Darah! ${attacker.name} memulihkan ${vHeal} HP dan meraih Camouflage!`, 'shadow');
        }

        // Boon: Sedotan Esensi Jiwa (+1 AP on kill)
        if (attacker.isPlayer && this.inventory.boons.includes('boon_mana_siphon')) {
          attacker.ap = Math.min(attacker.maxAp, attacker.ap + 1);
          this.showFloatingText(attacker, '+1 AP (Sedotan Jiwa)', 0x38bdf8);
        }
      }

      // Archer: Trigger Twin Shot follow-up arrow
      if (triggeredTwinShot && target && target.hp > 0) {
        const twinDmg = Math.max(1, Math.round(rawDmg * 0.60));
        target.hp = Math.max(0, target.hp - twinDmg);
        this.showFloatingText(target, `-${twinDmg} PANAH GANDA!`, 0x38bdf8);
        this.logCombat(`Panah Ganda menyusul kilat ke arah ${target.name} (-${twinDmg} DMG)!`, 'ranged');
        GameAudio.playSlash();
        if (target.hp <= 0) {

          if (target.model) {
            GameDeath.begin(this, target);
          }
        }
      }

      // AoE Splash Damage (e.g. Solar Arrow Rain, Fireball)
      if ((skill.type === 'aoe' || skill.area) && target) {
        const radius = skill.area || 1;
        this.combatants.forEach(c => {
          if (!c.isPlayer && c !== target && c.hp > 0) {
            const dx = Math.abs(c.gx - target.gx);
            const dz = Math.abs(c.gz - target.gz);
            if (dx <= radius && dz <= radius) {
              const splashDmg = Math.max(1, Math.round(rawDmg * 0.75));
              const splashPoise = Math.max(1, Math.round(poiseDmg * 0.75));
              c.hp = Math.max(0, c.hp - splashDmg);
              c.poise = Math.max(0, c.poise - splashPoise);
              this.showFloatingText(c, `-${splashDmg} Hujan Panah`, 0xf97316);
              this.flashModel(c.model, 0xf97316, 120);
              if (c.hp <= 0) {

                if (c.model) {
                  GameDeath.begin(this, c);
                }
              }
            }
          }
        });
      }

      // Line Piercing (e.g. Piercing Arrow)
      if (skill.type === 'pierce_line' && target) {
        const stepX = Math.sign(target.gx - attacker.gx);
        const stepZ = Math.sign(target.gz - attacker.gz);
        if (stepX !== 0 || stepZ !== 0) {
          for (let step = 1; step <= (skill.range || 4); step++) {
            const tx = attacker.gx + (stepX * step);
            const tz = attacker.gz + (stepZ * step);
            const piercedUnit = this.combatants.find(c => !c.isPlayer && c !== target && c.hp > 0 && c.gx === tx && c.gz === tz);
            if (piercedUnit) {
              const pierceDmg = Math.max(1, Math.round(rawDmg * 0.85));
              const piercePoise = Math.max(1, Math.round(poiseDmg * 0.85));
              piercedUnit.hp = Math.max(0, piercedUnit.hp - pierceDmg);
              piercedUnit.poise = Math.max(0, piercedUnit.poise - piercePoise);
              this.showFloatingText(piercedUnit, `-${pierceDmg} PENETRASI!`, 0xfde047);
              this.flashModel(piercedUnit.model, 0xfde047, 120);
              if (piercedUnit.hp <= 0) {

                if (piercedUnit.model) {
                  GameDeath.begin(this, piercedUnit);
                }
              }
            }
          }
        }
      }

      this.updateCombatUI();
      return true;
    }

    usePotion(unit) {
      if (!this.isActive || !this.isPlayerTurn() || !unit.isPlayer || this.inventory.potions <= 0 || unit.ap < 2) return false;
      unit.ap -= 2;
      this.inventory.potions--;

      const hasMaster = this.inventory.boons && this.inventory.boons.includes('boon_potion_master');
      const healPct = hasMaster ? 0.40 : 0.30;
      const healAmt = Math.min(hasMaster ? 140 : 110, Math.round(unit.maxHp * healPct));
      unit.hp = Math.min(unit.maxHp, unit.hp + healAmt);
      unit.poise = Math.min(unit.maxPoise, unit.poise + 20);

      if (hasMaster) {
        unit.ap = Math.min(unit.maxAp, unit.ap + 1);
        this.showFloatingText(unit, '+1 AP (Eliksir Murni)', 0x38bdf8);
      }

      if (typeof GameModels !== 'undefined' && GameModels.spawnSkillVFX && unit.model) {
        GameModels.spawnSkillVFX(this.scene, 'heal', unit.model.position, unit.model.position);
      }

      GameAudio.playHeal();
      this.showFloatingText(unit, `+${healAmt} HP`, 0x2ecc71);
      this.logCombat(`Meminum Lentera Flask! Memulihkan +${healAmt} HP & +20 Poise!`, 'flask');
      this.updateCombatUI();
      return true;
    }

    // --- ENEMY AI (UPGRADED TACTICAL & BOSS GIMMICKS) ---

    executeAiTurn(enemy) {
      if (!this.isActive || enemy.hp <= 0) {
        this.finishAiTurn();
        return;
      }

      const hero = this.combatants.find(c => c.isPlayer);
      if (!hero || hero.hp <= 0) {
        this.endBattle(false);
        return;
      }

      // Elite Affix: Regenerator (+8% Max HP at turn start)
      if (enemy.isElite && enemy.eliteMod && enemy.eliteMod.id === 'regenerator' && enemy.hp < enemy.maxHp) {
        const rHeal = Math.max(6, Math.round(enemy.maxHp * 0.08));
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + rHeal);
        this.showFloatingText(enemy, `+${rHeal} HP Darah Abadi`, 0x06b6d4);
        this.logCombat(`${enemy.name} meregenerasi ${rHeal} HP berkat Darah Abadi!`, 'flask');
      }

      // Support buys time for allies; a readable priority target.
      if (enemy.stats.role === 'support' && !enemy.supportRest) {
        const ally = this.combatants.filter(c => !c.isPlayer && c.hp > 0 && c.hp < c.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
        if (ally) { const heal = Math.round(ally.maxHp * .12); ally.hp = Math.min(ally.maxHp, ally.hp + heal); enemy.ap = Math.max(0, enemy.ap - 2); enemy.supportRest = true; this.showFloatingText(ally, '+'+heal+' HP — Paduan Jiwa', 0xcccccc); }
      } else { enemy.supportRest = false; }
      // Heavy attacks mark a tile one enemy turn before impact.
      if (enemy.stats.role === 'breaker' || enemy.isBoss) {
        if (!enemy.windup) {
          enemy.windup = {gx:hero.gx,gz:hero.gz};
          this.logCombat(enemy.name + ' menyiapkan hantaman di petakmu. Pindah sebelum giliran berikutnya!', 'warning');
          this.showFloatingText(hero, 'BAHAYA: PINDAH PETAK!', 0xff5555);
        } else {
          if (hero.gx === enemy.windup.gx && hero.gz === enemy.windup.gz) {
            hero.buffs.guard = 0; hero.buffs.barrier = 0;
            this.useSkill(enemy, hero, {id:'heavy_telegraph',name:'Hantaman Pemecah Segel',cost:2,dmgMult:1.7,poiseDmg:35});
          } else { this.logCombat('Hantaman ' + enemy.name + ' meleset — perpindahanmu berhasil!', 'shield'); }
          enemy.windup = null;
        }
      }
      // Check Boss Phase Gimmick at 50% HP
      if (enemy.isBoss && enemy.hp < enemy.maxHp * 0.5 && !enemy.usedGimmick) {
        enemy.usedGimmick = true;
        const bossDef = RPG_DATA.BOSSES[enemy.data.bossId];
        const gimmickName = bossDef ? bossDef.gimmick.split(':')[0] : 'Kekuatan Abyss';
        enemy.buffs.barrier = (enemy.buffs.barrier || 0) + 40;
        enemy.poise = Math.min(enemy.maxPoise, enemy.poise + 25);
        this.showFloatingText(enemy, `GIMMIK: ${gimmickName} (+40 Barrier & +25 Poise)`, 0xf59e0b, 'floating-break');
        this.logCombat(`${enemy.name} mengaktifkan ${bossDef ? bossDef.gimmick : 'Kekuatan Abyss'}!`, 'crown');
        GameAudio.playHeavyImpact();
        this.shakeCamera(0.35, 250);
      }

      // Step 1: Check distance to hero and approach if needed
      const attackRange = enemy.stats.attackRange || 1;
      let inRange = this.isUnitInRange(enemy, hero, attackRange);

      // Check Root / Snare
      if (enemy.isRooted && (enemy.rootTurns || 0) > 0) {
        enemy.rootTurns--;
        if (enemy.rootTurns <= 0) enemy.isRooted = false;
        this.showFloatingText(enemy, 'TERJERAT! (Tidak Bisa Bergerak)', 0xeab308);
        this.logCombat(`${enemy.name} terkunci di tempat akibat jerat berduri!`, 'shield');
      } else if (!inRange && enemy.ap >= 1) {
        const path = this.dungeon.findPath(enemy.gx, enemy.gz, hero.gx, hero.gz, 8);
        if (path && path.length > 0) {
          const maxSteps = Math.min(path.length - 1, enemy.ap * 2);
          if (maxSteps > 0) {
            const nextStep = path[maxSteps - 1];
            const occupied = this.combatants.some(c => c.hp > 0 && c.gx === nextStep.gx && c.gz === nextStep.gz);
            if (!occupied) {
              this.moveUnit(enemy, nextStep.gx, nextStep.gz);
            }
          }
        }
      }

      // Step 2: Strike hero if in range, or brace defense
      const t1 = setTimeout(() => {
        if (!this.isActive) return;
        inRange = this.isUnitInRange(enemy, hero, attackRange);

        if (inRange && enemy.ap >= 1 && enemy.hp > 0 && hero.hp > 0) {
          // Select skill
          let skillName = 'Serangan Liar';
          let dmgMult = 1.0;
          let poiseDmg = 14;
          let skillCost = 1;

          if (enemy.isBoss && enemy.stats.skills && enemy.stats.skills.length > 0) {
            const pick = enemy.stats.skills[Math.floor(Math.random() * enemy.stats.skills.length)];
            skillName = typeof pick === 'string' ? pick : pick.name;
            dmgMult = 1.35;
            poiseDmg = 22;
            skillCost = 2;
          } else if (enemy.isElite) {
            skillName = `${enemy.eliteMod ? enemy.eliteMod.prefix : ''}Hantaman Brutal`;
            dmgMult = 1.2;
            poiseDmg = 18;
          }

          if (enemy.ap < skillCost) skillCost = 1;

          const aiSkill = {
            id: 'enemy_skill',
            name: skillName,
            cost: skillCost,
            dmgMult: dmgMult,
            poiseDmg: poiseDmg
          };
          this.useSkill(enemy, hero, aiSkill);

          // Only Bosses with remaining AP might execute a secondary light strike
          if ((enemy.isBoss || enemy.stats.role === 'archer') && enemy.ap >= 1 && enemy.hp > 0 && hero.hp > 0) {
            const t2 = setTimeout(() => {
              if (!this.isActive) return;
              if (this.isUnitInRange(enemy, hero, attackRange)) {
                const followUp = {
                  id: 'boss_atk2',
                  name: 'Tebasan Cepat',
                  cost: 1,
                  dmgMult: 0.85,
                  poiseDmg: 10
                };
                this.useSkill(enemy, hero, followUp);
              } else {
                enemy.buffs.guard = (enemy.buffs.guard || 0) + 8;
                this.showFloatingText(enemy, '+8 DEF Kuda-Kuda', 0x38bdf8);
              }
              const t3 = setTimeout(() => {
                this.calculateEnemyIntents();
                this.finishAiTurn();
              }, 600);
              this.aiTimeouts.push(t3);
            }, 550);
            this.aiTimeouts.push(t2);
            return;
          }
        } else if (enemy.ap >= 1 && enemy.hp > 0) {
          // Hero out of reach, brace defense
          enemy.ap = 0;
          enemy.buffs.guard = (enemy.buffs.guard || 0) + 6;
          this.showFloatingText(enemy, '+6 DEF Kuda-Kuda', 0x38bdf8);
        }

        const t4 = setTimeout(() => {
          this.calculateEnemyIntents();
          this.finishAiTurn();
        }, 650);
        this.aiTimeouts.push(t4);
      }, 450);
      this.aiTimeouts.push(t1);
    }

    // --- VISUAL FEEDBACK & UI UPDATES ---

    showFloatingText(unit, text, colorHex = 0xffffff, extraClass = '') {
      if (!unit || !unit.model) return;
      const popup = document.createElement('div');
      popup.className = 'combat-floating-number' + (extraClass ? (' ' + extraClass) : '');
      popup.textContent = text;
      popup.style.color = '#' + colorHex.toString(16).padStart(6, '0');

      const hud = document.getElementById('combatPopups');
      if (hud) hud.appendChild(popup);

      // Link to world position
      this.floatingTexts.push({
        el: popup,
        pos: unit.model.position.clone().add(new THREE.Vector3(0, 1.8, 0)),
        life: 1.2
      });
    }

    updateFloatingTexts(camera, delta) {
      this.updateIntentBadges(camera);

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const item = this.floatingTexts[i];
        item.life -= delta;
        item.pos.y += delta * 0.8; // float upward

        if (item.life <= 0) {
          if (item.el.parentNode) item.el.parentNode.removeChild(item.el);
          this.floatingTexts.splice(i, 1);
          continue;
        }

        // Project 3D pos to 2D screen coordinates
        const v = item.pos.clone().project(camera);
        const x = (v.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;
        item.el.style.left = `${x}px`;
        item.el.style.top = `${y}px`;
        item.el.style.opacity = Math.min(1, item.life * 1.5);
      }
    }

    logCombat(msg, iconKey = null) {
      const logBox = document.getElementById('combatLog');
      if (logBox) {
        const p = document.createElement('div');
        p.className = 'log-entry';
        const iconPrefix = (iconKey && typeof GameIcons !== 'undefined' && GameIcons.svg) 
          ? GameIcons.svg(iconKey, 'fantasy-icon icon-xs log-icon') + ' ' 
          : '';
        p.innerHTML = `${iconPrefix}<span>${msg}</span>`;
        logBox.appendChild(p);
        while (logBox.children.length > 80) logBox.firstElementChild.remove();
        logBox.scrollTop = logBox.scrollHeight;
      }
    }

    updateCombatUI() {
      const hero = this.combatants.find(c => c.isPlayer);
      if (!hero) return;

      // Update Hero Bars
      const hpFill = document.getElementById('heroHpFill');
      const hpText = document.getElementById('heroHpText');
      if (hpFill && hpText) {
        const pct = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
        hpFill.style.width = `${pct}%`;
        hpText.textContent = `${hero.hp}/${hero.maxHp}`;
      }

      const poiseFill = document.getElementById('heroPoiseFill');
      if (poiseFill) {
        const pct = Math.max(0, Math.min(100, (hero.poise / hero.maxPoise) * 100));
        poiseFill.style.width = `${pct}%`;
      }

      const apOrbs = document.getElementById('heroApOrbs');
      if (apOrbs) {
        apOrbs.innerHTML = '';
        for (let i = 0; i < hero.maxAp; i++) {
          const orb = document.createElement('span');
          orb.className = 'ap-orb' + (i < hero.ap ? ' filled' : ' spent');
          apOrbs.appendChild(orb);
        }
      }

      // Update Target Enemy Bar
      const enemy = this.combatants.find(c => !c.isPlayer && c.hp > 0);
      const enemyBar = document.getElementById('combatEnemyBar');
      if (enemyBar && enemy) {
        enemyBar.style.display = 'block';
        if ((enemy.corruptionStacks || 0) > 0 || (enemy.weaknessMarks || 0) > 0 || enemy.isPoisoned || enemy.isRooted) {
          const debuffs = [
            enemy.corruptionStacks > 0 ? `☠️ Corruption x${enemy.corruptionStacks}` : '',
            enemy.weaknessMarks > 0 ? `🎯 Mark x${enemy.weaknessMarks}` : '',
            enemy.isPoisoned ? `🧪 Racun (${enemy.poisonTurns}T)` : '',
            enemy.isRooted ? `⛓️ Terjerat (${enemy.rootTurns}T)` : ''
          ].filter(Boolean).join(' • ');
          document.getElementById('enemyName').textContent = `${enemy.name} (${debuffs})`;
        } else {
          document.getElementById('enemyName').textContent = enemy.name;
        }
        const eHpPct = (enemy.hp / enemy.maxHp) * 100;
        document.getElementById('enemyHpFill').style.width = `${eHpPct}%`;
        document.getElementById('enemyHpText').textContent = `${enemy.hp}/${enemy.maxHp}`;
        const ePoisePct = (enemy.poise / enemy.maxPoise) * 100;
        document.getElementById('enemyPoiseFill').style.width = `${ePoisePct}%`;
      } else if (enemyBar) {
        enemyBar.style.display = 'none';
      }

      // Update Subclass Stacks Badge
      const subBadge = document.getElementById('subclassStackBadge');
      if (subBadge) {
        let badgeHtml = '';
        let badgeColor = '#eab308';
        const passives = (this.inventory && this.inventory.passives) || [];

        if (passives.includes('tactical_command') && (hero.commandStacks || 0) > 0) {
          badgeHtml = `${GameIcons.svg('crown', 'fantasy-icon icon-xs')} <span>COMMAND x${hero.commandStacks} (+${hero.commandStacks * 5}% DMG, +${hero.commandStacks * 4} DEF)</span>`;
          badgeColor = '#eab308';
        } else if (passives.includes('blood_frenzy') && ((hero.rageStacks || 0) > 0 || hero.hp < hero.maxHp * 0.5)) {
          if (hero.hp < hero.maxHp * 0.5) {
            badgeHtml = `${GameIcons.svg('blood', 'fantasy-icon icon-xs')} <span>FRENZY AKTIF (+30% DMG & 25% Lifesteal)</span>`;
            badgeColor = '#ef4444';
          } else {
            badgeHtml = `${GameIcons.svg('blood', 'fantasy-icon icon-xs')} <span>RAGE x${hero.rageStacks} (+${hero.rageStacks * 5}% ATK)</span>`;
            badgeColor = '#ef4444';
          }
        } else if (passives.includes('arcane_blade_passive') && (hero.arcaneCharges || 0) > 0) {
          badgeHtml = `${GameIcons.svg('spark', 'fantasy-icon icon-xs')} <span>ASTRAL CHARGE x${hero.arcaneCharges} (+${hero.arcaneCharges * 30}% Slash)</span>`;
          badgeColor = '#06b6d4';
        } else if (passives.includes('riposte_stance') && (hero.riposteTokens || 0) > 0) {
          badgeHtml = `${GameIcons.svg('shield', 'fantasy-icon icon-xs')} <span>RIPOSTE x${hero.riposteTokens} (Auto-Counter Siap)</span>`;
          badgeColor = '#38bdf8';
        } else if (passives.includes('chain_flow') && (hero.chainCount || 0) > 0) {
          badgeHtml = `${GameIcons.svg('spark', 'fantasy-icon icon-xs')} <span>COMBO CHAIN x${hero.chainCount} (+${hero.chainCount * 15}% DMG)</span>`;
          badgeColor = '#f59e0b';
        } else if (hero.buffs && hero.buffs.barrier > 0) {
          badgeHtml = `${GameIcons.svg('fortress', 'fantasy-icon icon-xs')} <span>BARRIER ${hero.buffs.barrier} HP</span>`;
          badgeColor = '#a855f7';
        } else if (hero.isVanished) {
          badgeHtml = `${GameIcons.svg('shadow', 'fantasy-icon icon-xs')} <span>VANISH AKTIF (Kebal Target 1T)</span>`;
          badgeColor = '#c084fc';
        } else if (passives.includes('eagle_eye') || passives.includes('killzone_focus')) {
          badgeHtml = `${GameIcons.svg('target', 'fantasy-icon icon-xs')} <span>DEADEYE (Sniper >= 3P: +25% DMG)</span>`;
          badgeColor = '#eab308';
        } else if (passives.includes('wind_momentum') || passives.includes('twin_shot')) {
          badgeHtml = `${GameIcons.svg('ranged', 'fantasy-icon icon-xs')} <span>WINDRUNNER (+20% Dodge & 45% Panah Ganda)</span>`;
          badgeColor = '#38bdf8';
        } else if (passives.includes('toxic_tips') || passives.includes('crippling_venom')) {
          badgeHtml = `${GameIcons.svg('flask', 'fantasy-icon icon-xs')} <span>TRAPMASTER (15 Racun DoT & Jerat Kaki)</span>`;
          badgeColor = '#10b981';
        }

        if (badgeHtml) {
          subBadge.style.display = 'flex';
          subBadge.innerHTML = badgeHtml;
          subBadge.style.borderColor = badgeColor;
        } else {
          subBadge.style.display = 'none';
        }
      }

      // Update All 5 Skill Buttons (State, Cooldown, AP, Active Selection)
      const skills = this.inventory.getActiveSkills ? this.inventory.getActiveSkills() : RPG_DATA.CLASSES[this.inventory.heroClassId].skills;
      skills.forEach((sk, idx) => {
        const btn = document.querySelector(`.skill-btn[data-skill-idx="${idx}"]`);
        if (!btn) return;

        // Check active selection
        if (this.selectedSkill && this.selectedSkill.id === sk.id) {
          btn.classList.add('active-skill');
        } else {
          btn.classList.remove('active-skill');
        }

        // Check Cooldown
        const cd = hero.cooldowns[sk.id] || 0;
        const cdOverlay = btn.querySelector('.skill-cooldown-overlay');
        if (cd > 0) {
          btn.classList.add('on-cooldown');
          if (cdOverlay && typeof cdOverlay.querySelector === 'function') {
            const cdNum = cdOverlay.querySelector('.cd-num');
            if (cdNum) cdNum.textContent = `${cd} Turn`;
          }
        } else {
          btn.classList.remove('on-cooldown');
        }

        // Check AP Cost
        const costEl = btn.querySelector('.skill-cost');
        if (hero.ap < sk.cost) {
          btn.classList.add('no-ap');
          if (costEl) costEl.style.color = '#ef4444';
        } else {
          btn.classList.remove('no-ap');
          if (costEl) costEl.style.color = '#38bdf8';
        }

        // Ultimate Adrenaline Bar
        if (sk.adrenalineReq) {
          const adrenPct = Math.min(100, hero.adrenaline || 0);
          const adrenFill = document.getElementById('adrenFill');
          if (adrenFill) adrenFill.style.width = `${adrenPct}%`;

          if (adrenPct >= 100) {
            btn.classList.add('ultimate-ready');
            if (costEl) costEl.textContent = `3 AP (SIAP!)`;
          } else {
            btn.classList.remove('ultimate-ready');
            if (costEl) costEl.textContent = `3 AP (${adrenPct}%)`;
          }
        }
      });

      // Update Turn Banner & Action Bar Lock State
      const isHeroTurn = this.isPlayerTurn();
      const turnBanner = document.getElementById('combatTurnBanner');
      const bottomBar = document.querySelector('.combat-bottom-bar');
      const activeUnit = this.combatants[this.currentTurnIdx];

      if (turnBanner) {
        if (isHeroTurn) {
          turnBanner.className = 'combat-turn-banner player-turn';
          turnBanner.innerHTML = `${GameIcons.svg('sword', 'fantasy-icon icon-sm')} <span>GILIRAN ANDA (PLAYER TURN)</span>`;
        } else {
          const unitName = activeUnit ? activeUnit.name : 'Musuh';
          turnBanner.className = 'combat-turn-banner enemy-turn';
          turnBanner.innerHTML = `${GameIcons.svg('hourglass', 'fantasy-icon icon-sm')} <span>GILIRAN: ${unitName.toUpperCase()}...</span>`;
        }
      }

      if (bottomBar) {
        if (isHeroTurn) {
          bottomBar.classList.remove('enemy-turn-active');
        } else {
          bottomBar.classList.add('enemy-turn-active');
        }
      }

      // Update Potion Button
      const potionBtn = document.getElementById('potionBtn');
      const potionSub = document.getElementById('potionSub');
      if (potionBtn && potionSub) {
        potionSub.textContent = `${this.inventory.potions}/${this.inventory.maxPotions} Flask • +30% HP (maks. 110)`;
        if (!isHeroTurn || this.inventory.potions <= 0 || hero.ap < 2) {
          potionBtn.style.opacity = '0.5';
          potionBtn.style.cursor = 'not-allowed';
        } else {
          potionBtn.style.opacity = '1';
          potionBtn.style.cursor = 'pointer';
        }
      }

      // Update Guard Button
      const guardBtn = document.getElementById('guardActionBtn');
      if (guardBtn) {
        if (!isHeroTurn || hero.ap < 1) {
          guardBtn.style.opacity = '0.5';
          guardBtn.style.cursor = 'not-allowed';
        } else {
          guardBtn.style.opacity = '1';
          guardBtn.style.cursor = 'pointer';
        }
      }

      // Update End Turn Button
      const endTurnBtn = document.getElementById('endTurnBtn');
      const endTurnSub = document.getElementById('endTurnSub');
      if (endTurnSub) {
        if (isHeroTurn) {
          endTurnSub.textContent = hero.ap > 0 ? `Sisa ${hero.ap} AP → +${hero.ap * 3} DEF Guard` : `Giliran selesai`;
          if (endTurnBtn) {
            endTurnBtn.style.opacity = '1';
            endTurnBtn.style.cursor = 'pointer';
          }
        } else {
          endTurnSub.textContent = `Menunggu aksi musuh...`;
          if (endTurnBtn) {
            endTurnBtn.style.opacity = '0.5';
            endTurnBtn.style.cursor = 'not-allowed';
          }
        }
      }
    }

    // Predictive Target Forecast Banner
    showTargetForecast(targetGx, targetGz, directTarget = null) {
      const forecastEl = document.getElementById('combatForecast');
      if (!forecastEl) return;

      const hero = this.combatants.find(c => c.isPlayer);
      if (!hero) return;

      const activeSkills = this.inventory.getActiveSkills ? this.inventory.getActiveSkills() : RPG_DATA.CLASSES[this.inventory.heroClassId].skills;
      const skill = this.selectedSkill || activeSkills[0];
      const target = directTarget || this.combatants.find(c => !c.isPlayer && c.hp > 0 && c.gx === targetGx && c.gz === targetGz);
      if (!target) {
        forecastEl.style.display = 'none';
        return;
      }

      // Check range & Auto-Move status
      const inRange = this.isUnitInRange(hero, target, skill.range || 1);
      let rangeStatus = '';
      if (inRange) {
        rangeStatus = `<span style="color:#4ade80; font-weight:bold; display:inline-flex; align-items:center; gap:4px;">${GameIcons.svg('target', 'fantasy-icon icon-xs')} Dalam Jangkauan (${skill.cost} AP)</span>`;
      } else {
        const dist = Math.abs(hero.gx - target.gx) + Math.abs(hero.gz - target.gz);
        const moveAp = Math.max(1, Math.ceil((dist - 1) / 2));
        const totalAp = moveAp + skill.cost;
        if (hero.ap >= totalAp) {
          rangeStatus = `<span style="color:#f59e0b; font-weight:bold; display:inline-flex; align-items:center; gap:4px;">${GameIcons.svg('lightning', 'fantasy-icon icon-xs')} Auto-Move + Serang (${totalAp} AP: ${moveAp} Gerak + ${skill.cost} Serang)</span>`;
        } else {
          rangeStatus = `<span style="color:#ef4444; font-weight:bold; display:inline-flex; align-items:center; gap:4px;">${GameIcons.svg('warning', 'fantasy-icon icon-xs')} Jarak Terlalu Jauh (Butuh ${totalAp} AP, AP Anda: ${hero.ap})</span>`;
        }
      }

      // Calculate Flanking / Backstab
      const isBackstab = (hero.facing.dx === target.facing.dx && hero.facing.dz === target.facing.dz);
      const isFlank = !isBackstab && (hero.facing.dx !== 0 && target.facing.dz !== 0 || hero.facing.dz !== 0 && target.facing.dx !== 0);

      let mult = skill.dmgMult || 1.0;
      let posText = '<span style="color:#a68d91;">Serangan Berhadapan</span>';
      if (isBackstab) {
        mult *= 1.5;
        posText = `<span style="color:#f59e0b; font-weight:bold; display:inline-flex; align-items:center; gap:4px;">${GameIcons.svg('lightning', 'fantasy-icon icon-xs')} BACKSTAB (+50% DMG & 100% CRIT!)</span>`;
      } else if (isFlank) {
        mult *= 1.25;
        posText = `<span style="color:#38bdf8; font-weight:bold; display:inline-flex; align-items:center; gap:4px;">${GameIcons.svg('dagger', 'fantasy-icon icon-xs')} FLANK (+25% DMG)</span>`;
      }

      const baseAtk = hero.stats.atk || 20;
      const targetDef = (target.stats.def || 5) + (target.buffs.guard || 0);
      const estDmg = AbyssBalance.damage(baseAtk, mult, targetDef);
      const poiseDmg = skill.poiseDmg || 15;
      const willBreak = (target.poise - poiseDmg) <= 0;

      forecastEl.style.display = 'block';
      forecastEl.innerHTML = `
        <span class="forecast-item" style="display:inline-flex; align-items:center; gap:4px;">${GameIcons.svg('target', 'fantasy-icon icon-xs')} <b>${skill.name}</b> → <span style="color:#fca5a5;">${target.name}</span></span> &nbsp;|&nbsp; 
        <span class="forecast-item">${rangeStatus}</span> &nbsp;|&nbsp; 
        <span class="forecast-item">${posText}</span> &nbsp;|&nbsp; 
        <span class="forecast-item" style="display:inline-flex; align-items:center; gap:4px;">${GameIcons.svg('blast', 'fantasy-icon icon-xs')} <b>Perkiraan:</b> ~${estDmg} DMG</span> &nbsp;|&nbsp; 
        <span class="forecast-item" style="display:inline-flex; align-items:center; gap:4px;">${GameIcons.svg('shield', 'fantasy-icon icon-xs')} <b>Poise:</b> ${target.poise} → ${Math.max(0, target.poise - poiseDmg)}</span> 
        ${willBreak ? `<span style="color:#f97316; font-weight:bold; display:inline-flex; align-items:center; gap:4px;">(${GameIcons.svg('lightning', 'fantasy-icon icon-xs')} STANCE BREAK!)</span>` : ''}
      `;
    }

    hideTargetForecast() {
      const forecastEl = document.getElementById('combatForecast');
      if (forecastEl) forecastEl.style.display = 'none';
    }
  }

  return {
    CombatManager
  };
})();
