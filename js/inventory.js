/**
 * EVER DEEPER II: Inventory & Character Progression Engine
 * Equipment slots, Set bonus calculations, Loot tables, Potions & LocalStorage persistence.
 */

window.GameInventory = (function() {
  class InventoryManager {
    constructor(heroClassId) {
      this.heroClassId = heroClassId || 'warrior';
      this.level = 1;
      this.exp = 0;
      this.expNext = 100;
      this.gold = 50;
      this.potions = 3;
      this.maxPotions = 5;

      this.equipped = {
        weapon: null,
        offhand: null,
        armor: null,
        relic: null
      };

      this.items = []; // Inventory bag
      this.activeSetBonuses = [];
      this.chosenBuild = 'buildA';
      this.passives = [];
      this.skillPoints = 2; // Start with 2 Skill Points to customize initial build
      this.unlockedNodes = [];
      this.skillLoadout = {}; // Unlocked Skill Tree node IDs
      this.boons = []; // Level-up blessing cards
      this.forgeLevel = 0; // Blacksmith weapon tempering level
      this.floorShops = {}; // Per-floor shop stock cache
      this.pactBonuses = { maxHp: 0, atk: 0, critChance: 0, moveRange: 0, maxPoise: 0, maxAp: 0 };
      this.activePacts = [];
      this.isVulnerableNextCombat = false;
      this.bountiesCompleted = []; // Floor bounty target IDs completed

      this.initStarterEquipment();
      this.initBuild();
    }

    reset(heroClassId) {
      this.abyssContract = 0;
      this.savedDepth = 0;
      delete this.currentHp;
      this.heroClassId = heroClassId || 'warrior';
      this.level = 1;
      this.exp = 0;
      this.expNext = 100;
      this.gold = 50;
      this.potions = 3;
      this.maxPotions = 5;
      this.equipped = { weapon: null, offhand: null, armor: null, relic: null };
      this.items = [];
      this.activeSetBonuses = [];
      this.chosenBuild = 'buildA';
      this.passives = [];
      this.skillPoints = 2;
      this.unlockedNodes = [];
      this.skillLoadout = {};
      this.boons = [];
      this.forgeLevel = 0;
      this.floorShops = {};
      this.pactBonuses = { maxHp: 0, atk: 0, critChance: 0, moveRange: 0, maxPoise: 0, maxAp: 0 };
      this.activePacts = [];
      this.isVulnerableNextCombat = false;
      this.bountiesCompleted = [];
      this.initStarterEquipment();
      this.initBuild();
      this.recalculateSets();
      this.saveToStorage();
    }

    initBuild() {
      // Sync passives array with unlocked passive nodes in Skill Tree
      const tree = RPG_DATA.SKILL_TREES && RPG_DATA.SKILL_TREES[this.heroClassId];
      if (tree) {
        const allNodes = Object.values(tree).flatMap(b => b.nodes || []);
        this.passives = allNodes
          .filter(n => n.type === 'passive' && this.unlockedNodes.includes(n.id))
          .map(n => n.id);
      } else {
        const builds = RPG_DATA.CLASS_BUILDS[this.heroClassId];
        if (builds && builds[this.chosenBuild]) {
          this.passives = builds[this.chosenBuild].passives.map(p => p.id);
        }
      }
    }

    setBuild(buildKey) {
      if (buildKey !== 'buildA' && buildKey !== 'buildB' && buildKey !== 'buildC') return;
      this.chosenBuild = buildKey;
      const tree = RPG_DATA.SKILL_TREES && RPG_DATA.SKILL_TREES[this.heroClassId];
      if (tree) {
        // Quick-unlock Tier 1 of that branch if nothing unlocked yet
        const branchKey = buildKey === 'buildA' ? 'branchA' : (buildKey === 'buildB' ? 'branchB' : 'branchC');
        const branch = tree[branchKey];
        if (branch && branch.nodes && branch.nodes[0] && !this.unlockedNodes.includes(branch.nodes[0].id) && this.skillPoints > 0) {
          this.unlockSkillNode(branch.nodes[0].id);
        }
      }
      this.initBuild();
      this.saveToStorage();
    }

    findSkillNode(nodeId) {
      const tree = RPG_DATA.SKILL_TREES && RPG_DATA.SKILL_TREES[this.heroClassId];
      if (!tree) return null;
      const allNodes = Object.values(tree).flatMap(b => b.nodes || []);
      return allNodes.find(n => n.id === nodeId) || null;
    }

    canUnlockNode(nodeId) {
      if (this.unlockedNodes.includes(nodeId)) return false;
      const node = this.findSkillNode(nodeId);
      if (!node) return false;
      if (this.skillPoints < (node.cost || 1)) return false;
      if (node.req && !this.unlockedNodes.includes(node.req)) return false;
      return true;
    }

    unlockSkillNode(nodeId) {
      if (!this.canUnlockNode(nodeId)) return false;
      const node = this.findSkillNode(nodeId);
      this.skillPoints -= (node.cost || 1);
      this.unlockedNodes.push(nodeId);
      this.initBuild();
      this.saveToStorage();
      return true;
    }

    resetSkillTree() {
      const spent = this.unlockedNodes.reduce((sum,id)=>sum+(this.findSkillNode(id)?.cost||1),0);
      this.skillPoints += spent;
      this.unlockedNodes = [];
      this.skillLoadout = {};
      this.initBuild();
      this.saveToStorage();
      return true;
    }

    getEffectiveSubclass() {
      const tree = RPG_DATA.SKILL_TREES && RPG_DATA.SKILL_TREES[this.heroClassId];
      if (!tree) return null;
      let highestCount = -1;
      let dominantBranch = null;
      for (const bKey in tree) {
        const branch = tree[bKey];
        const unlockedInBranch = (branch.nodes || []).filter(n => this.unlockedNodes.includes(n.id)).length;
        if (unlockedInBranch > highestCount) {
          highestCount = unlockedInBranch;
          dominantBranch = branch;
        }
      }
      return dominantBranch || tree.branchA;
    }

    getActiveSkills() {
      const classDef = RPG_DATA.CLASSES[this.heroClassId];
      if (!classDef) return [];
      const activeList = classDef.skills.map(s => ({ ...s }));
      const tree = RPG_DATA.SKILL_TREES && RPG_DATA.SKILL_TREES[this.heroClassId];
      if (tree) {
        const allNodes = Object.values(tree).flatMap(b => b.nodes || []);
        allNodes.forEach(node => {
          if (node.type === 'active' && this.unlockedNodes.includes(node.id) && node.skillData && node.slotIdx !== undefined) {
            activeList[node.slotIdx] = { ...node.skillData, isUnlockedNode: true };
          }
        });
      }
      return activeList;
    }

    addBoon(boonId) {
      if (!this.boons.includes(boonId)) {
        this.boons.push(boonId);
        this.saveToStorage();
      }
    }

    initStarterEquipment() {
      const allItems = RPG_DATA.ITEMS;
      if (this.heroClassId === 'warrior') {
        this.equipItem(allItems.find(i => i.id === 'iron_broadsword'));
        this.equipItem(allItems.find(i => i.id === 'wooden_shield'));
      } else if (this.heroClassId === 'mage') {
        this.equipItem(allItems.find(i => i.id === 'apprentice_staff'));
      } else if (this.heroClassId === 'rogue') {
        this.equipItem(allItems.find(i => i.id === 'scout_daggers'));
      } else if (this.heroClassId === 'archer') {
        this.equipItem(allItems.find(i => i.id === 'hunter_shortbow'));
        this.equipItem(allItems.find(i => i.id === 'leather_quiver'));
      }
      this.equipItem(allItems.find(i => i.id === (this.heroClassId === 'archer' ? 'ranger_tunic' : 'leather_tunic')));
    }

    equipItem(item) {
      if (!item) return;
      const slot = item.slot;
      if (!slot) return;

      // Unequip existing
      if (this.equipped[slot]) {
        this.items.push(this.equipped[slot]);
      }

      // Remove from bag if there
      const idx = this.items.indexOf(item);
      if (idx !== -1) {
        this.items.splice(idx, 1);
      }

      this.equipped[slot] = item;
      this.recalculateSets();
    }

    unequipItem(slot) {
      const item = this.equipped[slot];
      if (item) {
        this.items.push(item);
        this.equipped[slot] = null;
        this.recalculateSets();
      }
    }

    recalculateSets() {
      const setCounts = {};
      Object.values(this.equipped).forEach(item => {
        if (item && item.set) {
          setCounts[item.set] = (setCounts[item.set] || 0) + 1;
        }
      });

      this.activeSetBonuses = [];
      for (let sKey in setCounts) {
        const count = setCounts[sKey];
        const sDef = RPG_DATA.SETS[sKey];
        if (sDef) {
          if (count >= 2) {
            this.activeSetBonuses.push({ set: sKey, tier: 2, desc: sDef.bonus2, name: sDef.name });
          }
          if (count >= 4) {
            this.activeSetBonuses.push({ set: sKey, tier: 4, desc: sDef.bonus4, name: sDef.name });
          }
        }
      }
    }

    getComputedStats() {
      const classDef = RPG_DATA.CLASSES[this.heroClassId];
      const stats = { ...classDef.baseStats };

      // Level scaling
      const lvlBonus = (this.level - 1);
      stats.maxHp += lvlBonus * 15;
      stats.hp = Math.min(stats.hp + lvlBonus * 15, stats.maxHp);
      stats.atk += lvlBonus * 3;
      stats.def += lvlBonus * 2;
      stats.maxPoise += lvlBonus * 5;

      // Blacksmith Forge Tempering Bonus
      if (this.forgeLevel > 0) {
        // Elixirs only increase HP, never ATK.
        stats.maxHp += Math.min(5, this.forgeLevel) * 25;
        stats.hp += Math.min(5, this.forgeLevel) * 25;
        // Elixirs no longer grant DEF.
      }

      // Apply equipment stats and individual equipment tempering
      Object.values(this.equipped).forEach(item => {
        if (!item) return;
        const itemForge = item.forgeLevel || 0;
        let itemAtk = item.atk || 0;
        let itemDef = item.def || 0;
        let itemHp = item.hp || 0;
        let itemPoise = item.poise || 0;

        if (itemForge > 0) {
          if (item.slot === 'weapon') {
            itemAtk += itemForge * 4;
            itemPoise += itemForge * 4;
          } else if (item.slot === 'armor') {
            itemDef += itemForge * 3;
            itemHp += itemForge * 12;
            itemPoise += itemForge * 3;
          } else if (item.slot === 'offhand') {
            itemDef += itemForge * 2;
            if (itemAtk > 0) itemAtk += itemForge * 2;
            itemPoise += itemForge * 3;
          } else if (item.slot === 'relic') {
            if (itemAtk > 0) itemAtk += itemForge * 2;
            if (itemDef > 0) itemDef += itemForge * 2;
            if (itemHp > 0) itemHp += itemForge * 10;
          }
        }

        stats.atk += itemAtk;
        stats.def += itemDef;
        stats.maxHp += itemHp;
        stats.maxPoise += itemPoise;
        if (item.crit) stats.critChance += item.crit;
        if (item.str) stats.str += item.str;
        if (item.agi) stats.agi += item.agi;
        if (item.int) stats.int += item.int;
      });

      // Apply Set bonuses
      this.activeSetBonuses.forEach(b => {
        if (b.set === 'bastion' && b.tier === 2) {
          stats.def = Math.round(stats.def * 1.2);
        }
        if (b.set === 'shadow' && b.tier === 2) {
          stats.critChance += 0.15;
        }
        if (b.set === 'arcanum' && b.tier === 2) {
          stats.atk += 10;
        }
        if (b.set === 'duelist' && b.tier === 2) {
          stats.def += 6;
        }
        if (b.set === 'storm' && b.tier === 2) {
          stats.moveRange += 1;
          stats.atk += 8;
        }
      });

      // Apply Passive Talents from Skill Tree
      if (this.passives.includes('iron_will')) {
        stats.maxPoise = Math.round(stats.maxPoise * 1.25);
        stats.def += 5;
      }
      if (this.passives.includes('blood_frenzy')) {
        stats.atk += 8;
      }
      if (this.passives.includes('tactical_command')) {
        stats.maxHp += 15;
        stats.def += 3;
      }
      if (this.passives.includes('command_aura')) {
        stats.critChance += 0.15;
      }
      if (this.passives.includes('elemental_cycle')) {
        stats.atk += 8;
      }
      if (this.passives.includes('arcane_blade_passive')) {
        stats.atk += 6;
        stats.critChance += 0.10;
      }
      if (this.passives.includes('arcane_aegis_mastery')) {
        stats.def += 5;
      }
      if (this.passives.includes('abyssal_corruption')) {
        stats.maxHp += 20;
        stats.atk += 6;
      }
      if (this.passives.includes('anatomical_insight')) {
        stats.critChance += 0.12;
      }
      if (this.passives.includes('riposte_stance')) {
        stats.def += 5;
        stats.maxPoise += 10;
      }
      if (this.passives.includes('chain_flow')) {
        stats.moveRange += 1;
        stats.atk += 6;
      }
      if (this.passives.includes('adrenaline_chain')) {
        stats.critChance += 0.08;
      }
      // Archer Passives
      if (this.passives.includes('eagle_eye')) {
        stats.critChance += 0.20;
      }
      if (this.passives.includes('killzone_focus')) {
        stats.atk += 6;
      }
      if (this.passives.includes('crippling_venom')) {
        stats.def += 3;
      }
      if (this.passives.includes('wind_momentum')) {
        stats.moveRange += 1;
        stats.agi += 4;
      }
      if (this.passives.includes('gale_agility')) {
        stats.agi += 6;
      }
      // Legacy passives compatibility
      if (this.passives.includes('combustion_wave')) {
        stats.atk += 8;
      }
      if (this.passives.includes('solar_flare')) {
        stats.critChance += 0.15;
      }
      if (this.passives.includes('deep_freeze')) {
        stats.maxHp += 25;
        stats.maxPoise += 20;
      }
      if (this.passives.includes('fleet_footed')) {
        stats.moveRange += 1;
        stats.critChance += 0.15;
      }

      // Apply Level-Up Boons
      if (this.boons.includes('boon_bastion_core')) {
        stats.maxHp += 30;
        stats.def += 6;
      }
      if (this.boons.includes('boon_swift_step')) {
        stats.moveRange += 1;
      }
      if (this.boons.includes('boon_shadow_veil')) {
        stats.critChance += 0.12;
      }

      // Apply Cursed Altar Pacts bonuses
      if (this.pactBonuses) {
        if (this.pactBonuses.maxHp) stats.maxHp += this.pactBonuses.maxHp;
        if (this.pactBonuses.atk) stats.atk += this.pactBonuses.atk;
        if (this.pactBonuses.critChance) stats.critChance += this.pactBonuses.critChance;
        if (this.pactBonuses.moveRange) stats.moveRange += this.pactBonuses.moveRange;
        if (this.pactBonuses.maxPoise) stats.maxPoise = Math.max(10, stats.maxPoise + this.pactBonuses.maxPoise);
        if (this.pactBonuses.maxAp) stats.maxAp = Math.max(2, (stats.maxAp || 3) + this.pactBonuses.maxAp);
      }

      stats.hp = Number.isFinite(this.currentHp) ? Math.max(0,Math.min(stats.maxHp,this.currentHp)) : stats.maxHp;
      return stats;
    }

    applyCursedPact(pact) {
      if (!pact) return false;
      if (!this.activePacts) this.activePacts = [];
      if (!this.pactBonuses) this.pactBonuses = { maxHp: 0, atk: 0, critChance: 0, moveRange: 0, maxPoise: 0, maxAp: 0 };

      this.activePacts.push(pact.id);
      if (pact.boonStats) {
        if (pact.boonStats.maxHp) this.pactBonuses.maxHp += pact.boonStats.maxHp;
        if (pact.boonStats.atk) this.pactBonuses.atk += pact.boonStats.atk;
        if (pact.boonStats.critChance) this.pactBonuses.critChance += pact.boonStats.critChance;
        if (pact.boonStats.moveRange) this.pactBonuses.moveRange += pact.boonStats.moveRange;
        if (pact.boonStats.maxPoise) this.pactBonuses.maxPoise += pact.boonStats.maxPoise;
        if (pact.boonStats.maxAp) this.pactBonuses.maxAp += pact.boonStats.maxAp;
        if (pact.boonStats.gold) this.gold += pact.boonStats.gold;
        if (pact.boonStats.giveRandomRelic && typeof RPG_DATA !== 'undefined' && RPG_DATA.ITEMS) {
          const relicPool = RPG_DATA.ITEMS.filter(i => i.slot === 'relic');
          if (relicPool.length > 0) {
            const r = relicPool[Math.floor(Math.random() * relicPool.length)];
            this.addLoot({ ...r });
          }
        }
      }
      if (pact.curseEffect === 'potion_cost') {
        this.potions = Math.max(0, this.potions - 1);
        this.currentHp = Math.max(1, (this.currentHp || 100) - 25);
      } else if (pact.curseEffect === 'hp_cut') {
        this.currentHp = Math.max(1, Math.round((this.currentHp || 100) * 0.65));
      } else if (pact.curseEffect === 'vulnerable_next_combat') {
        this.isVulnerableNextCombat = true;
      }
      this.saveToStorage();
      return true;
    }

    gainExp(amount) {
      this.exp += amount;
      let leveledUp = false;
      while (this.exp >= this.expNext) {
        this.exp -= this.expNext;
        this.level++;
        this.skillPoints = (this.skillPoints || 0) + 1; // +1 Skill Tree Point per Level!
        this.expNext = Math.round(this.expNext * 1.5);
        leveledUp = true;
      }
      return leveledUp;
    }

    addLoot(item) {
      if (item) {
        this.items.push(item);
      }
    }

    generateRandomLoot(floorNumber) {
      const pool = RPG_DATA.ITEMS.filter(i => {
        if (floorNumber <= 2) return i.rarity === 'common' || i.rarity === 'rare';
        return true;
      });
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      return { ...chosen }; // clone
    }

    getFloorShop(floorNumber, forceRefresh = false) {
      const f = floorNumber || 1;
      if (!this.floorShops[f] || forceRefresh) {
        if (typeof RPG_DATA !== 'undefined' && RPG_DATA.generateFloorShop) {
          this.floorShops[f] = RPG_DATA.generateFloorShop(f, this.heroClassId);
        } else {
          this.floorShops[f] = [];
        }
        this.saveToStorage();
      }
      return this.floorShops[f];
    }

    refreshFloorShop(floorNumber) {
      const cost = 30;
      if (this.gold < cost) return { success: false, reason: 'Gold tidak cukup untuk me-refresh toko! (Butuh 30 Gold)' };
      this.gold -= cost;
      const items = this.getFloorShop(floorNumber, true);
      this.saveToStorage();
      return { success: true, items, cost };
    }

    temperEquipment(item) {
      if (!item) return { success: false, reason: 'Pilih perlengkapan yang ingin ditempa!' };
      const curLvl = item.forgeLevel || 0;
      if (curLvl >= 10) return { success: false, reason: 'Telah mencapai batas tempa maksimal (+10)!' };
      const cost = 45 + (curLvl * 35);
      if (this.gold < cost) return { success: false, reason: `Gold tidak mencukupi! Butuh ${cost} Gold.` };
      this.gold -= cost;
      item.forgeLevel = curLvl + 1;
      this.recalculateSets();
      this.saveToStorage();
      return { success: true, item, newLevel: item.forgeLevel, cost };
    }

    temperSlot(slotKey) {
      const item = this.equipped[slotKey];
      return this.temperEquipment(item);
    }

    // Bounty Management
    isBountyCompleted(floorOrId) {
      if (!this.bountiesCompleted) return false;
      if (typeof floorOrId === 'number') {
        const b = RPG_DATA.BOUNTIES && RPG_DATA.BOUNTIES[floorOrId];
        return b ? this.bountiesCompleted.includes(b.id) : false;
      }
      return this.bountiesCompleted.includes(floorOrId);
    }

    completeBounty(bountyId, bountyDef) {
      if (!this.bountiesCompleted) this.bountiesCompleted = [];
      if (!this.bountiesCompleted.includes(bountyId)) {
        this.bountiesCompleted.push(bountyId);
      }
      let relicAwarded = null;
      if (bountyDef && bountyDef.relicReward) {
        const relic = RPG_DATA.ITEMS.find(i => i.id === bountyDef.relicReward);
        if (relic) {
          relicAwarded = { ...relic };
          this.addLoot(relicAwarded);
        }
      }
      this.saveToStorage();
      return { success: true, relic: relicAwarded };
    }

    getGoldMultiplier() {
      let m = 1.0;
      if (this.boons && this.boons.includes('boon_gold_magnet')) m *= 1.5;
      if (this.equipped && this.equipped.relic && this.equipped.relic.goldBonus) {
        m += this.equipped.relic.goldBonus;
      }
      return m;
    }

    // Save state to localStorage
    saveToStorage() {
      try {
        const data = {
          heroClassId: this.heroClassId,
          currentHp: Number.isFinite(this.currentHp)?this.currentHp:this.getComputedStats().maxHp,
          chosenBuild: this.chosenBuild,
          passives: this.passives,
          skillPoints: this.skillPoints,
          unlockedNodes: this.unlockedNodes,
          skillLoadout: this.skillLoadout || {},
          boons: this.boons,
          level: this.level,
          exp: this.exp,
          expNext: this.expNext,
          gold: this.gold,
          potions: this.potions,
          forgeLevel: this.forgeLevel || 0,
          abyssContract: this.abyssContract || 0,
          savedDepth: this.savedDepth || 0,
          equipped: this.equipped,
          items: this.items,
          floorShops: this.floorShops || {},
          pactBonuses: this.pactBonuses || {},
          activePacts: this.activePacts || [],
          isVulnerableNextCombat: !!this.isVulnerableNextCombat,
          bountiesCompleted: this.bountiesCompleted || []
        };
        localStorage.setItem('ever_deeper_v2_save', JSON.stringify(data));
      } catch (e) {
        console.warn('Could not save game state:', e);
      }
    }

    // Load state from localStorage
    loadFromStorage() {
      try {
        const raw = localStorage.getItem('ever_deeper_v2_save');
        if (!raw) return false;
        const data = JSON.parse(raw);
        this.heroClassId = data.heroClassId || 'warrior';
        this.chosenBuild = data.chosenBuild || 'buildA';
        this.passives = data.passives || [];
        this.skillPoints = data.skillPoints !== undefined ? data.skillPoints : 2;
        this.unlockedNodes = [...new Set(data.unlockedNodes || [])];
        this.skillLoadout = {};
        if (data.skillLoadout && typeof data.skillLoadout === 'object') {
          for (const [slot,id] of Object.entries(data.skillLoadout)) {
            const n=this.findSkillNode(id);if(n?.type==='active'&&n.slotIdx===Number(slot)&&this.unlockedNodes.includes(id))this.skillLoadout[slot]=id;
          }
        } else {
          // Preserve precisely the old tree-order hotbar, with every purchase retained.
          for(const branch of Object.values(RPG_DATA.SKILL_TREES[this.heroClassId]||{}))for(const n of branch.nodes)if(n.type==='active'&&this.unlockedNodes.includes(n.id))this.skillLoadout[n.slotIdx]=n.id;
        }
        this.boons = data.boons || [];
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.expNext = data.expNext || 100;
        this.gold = data.gold || 50;
        this.potions = data.potions !== undefined ? data.potions : 3;
        this.forgeLevel = Math.min(5, data.forgeLevel || 0);
        this.abyssContract = data.abyssContract === 1 ? 1 : 0;
        this.savedDepth = Math.max(0, Math.min(RPG_DATA.FLOORS.length-1, Math.floor(data.savedDepth || 0)));
        this.equipped = data.equipped || this.equipped;
        this.items = data.items || [];
        this.floorShops = data.floorShops || {};
        this.pactBonuses = data.pactBonuses || { maxHp: 0, atk: 0, critChance: 0, moveRange: 0, maxPoise: 0, maxAp: 0 };
        this.activePacts = data.activePacts || [];
        this.isVulnerableNextCombat = !!data.isVulnerableNextCombat;
        this.bountiesCompleted = data.bountiesCompleted || [];
        if(Number.isFinite(data.currentHp))this.currentHp=data.currentHp;else delete this.currentHp;
        this.initBuild();
        this.recalculateSets();
        return true;
      } catch (e) {
        console.warn('Could not load game state:', e);
        return false;
      }
    }
  }

  return {
    InventoryManager
  };
})();
