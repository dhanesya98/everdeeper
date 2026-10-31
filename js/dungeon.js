/**
 * EVER DEEPER II: 3D Isometric Dungeon Generator & Map Engine
 * Generates modular multi-room abyss levels, tiles, corridors, interactive props & monster spawns.
 */

window.GameDungeon = (function() {
  const TILE_SIZE = 1.4; // 3D units per grid cell

  class DungeonLevel {
    constructor(floorData, savedState=null) {
      this.floorData = floorData;
      this.width = 38;
      this.height = 38;
      this.grid = []; // 2D array: 0: Void, 1: Floor, 2: Wall
      this.rooms = [];
      this.entities = []; // Monsters, chests, shrines, tablets
      this.group = new THREE.Group();
      this.group.name = 'dungeon_level_' + floorData.floor;

      this.startRoom = null;
      this.bossRoom = null;
      this.bountyRoom = null;
      this.playerSpawn = { x: 0, z: 0 };
      this.bossSpawn = null;
      this.stairsPos = null;

      if(!window.FloorState?.restore(this,savedState)){
        this.initGrid();
        this.generateRooms();
      }
      this.build3DScene();
    }

    initGrid() {
      for (let z = 0; z < this.height; z++) {
        this.grid[z] = [];
        for (let x = 0; x < this.width; x++) {
          this.grid[z][x] = 0;
        }
      }
    }

    generateRooms() {
      const targetRoomCount = Math.max(5, (this.floorData.roomsCount || 4));
      const minSize = this.floorData.minRoomSize || 5;
      const maxSize = this.floorData.maxRoomSize || 7;
      const maxAttempts = 180;

      for (let attempt = 0; attempt < maxAttempts && this.rooms.length < targetRoomCount; attempt++) {
        const rw = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
        const rh = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
        const rx = Math.floor(Math.random() * (this.width - rw - 6)) + 3;
        const rz = Math.floor(Math.random() * (this.height - rh - 6)) + 3;

        const newRoom = { x: rx, z: rz, w: rw, h: rh, cx: Math.floor(rx + rw / 2), cz: Math.floor(rz + rh / 2) };

        // Check overlap with 2-tile margin buffer so rooms never touch or merge directly
        let overlaps = false;
        for (let other of this.rooms) {
          if (
            rx <= other.x + other.w + 2 &&
            rx + rw >= other.x - 2 &&
            rz <= other.z + other.h + 2 &&
            rz + rh >= other.z - 2
          ) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          this.rooms.push(newRoom);
          // Carve room floors
          for (let z = rz; z < rz + rh; z++) {
            for (let x = rx; x < rx + rw; x++) {
              this.grid[z][x] = 1;
            }
          }
        }
      }

      // Connect rooms using Minimum Spanning Tree (MST)
      const connected = [this.rooms[0]];
      const unconnected = this.rooms.slice(1);
      const edges = [];

      while (unconnected.length > 0) {
        let bestDist = Infinity;
        let bestA = null;
        let bestB = null;
        let bestBIdx = -1;

        for (let a of connected) {
          for (let bIdx = 0; bIdx < unconnected.length; bIdx++) {
            const b = unconnected[bIdx];
            const dist = Math.hypot(a.cx - b.cx, a.cz - b.cz);
            if (dist < bestDist) {
              bestDist = dist;
              bestA = a;
              bestB = b;
              bestBIdx = bIdx;
            }
          }
        }

        if (bestA && bestB) {
          this.carveCorridor(bestA.cx, bestA.cz, bestB.cx, bestB.cz);
          edges.push({ a: bestA, b: bestB });
          connected.push(bestB);
          unconnected.splice(bestBIdx, 1);
        }
      }

      // Add 1 optional loop corridor between two close rooms for circular exploration
      for (let i = 0; i < this.rooms.length; i++) {
        for (let j = i + 1; j < this.rooms.length; j++) {
          const r1 = this.rooms[i];
          const r2 = this.rooms[j];
          const isDirect = edges.some(e => (e.a === r1 && e.b === r2) || (e.a === r2 && e.b === r1));
          if (!isDirect) {
            const d = Math.hypot(r1.cx - r2.cx, r1.cz - r2.cz);
            if (d < 16) {
              this.carveCorridor(r1.cx, r1.cz, r2.cx, r2.cz);
              i = this.rooms.length;
              break;
            }
          }
        }
      }

      // Add surrounding walls
      for (let z = 0; z < this.height; z++) {
        for (let x = 0; x < this.width; x++) {
          if (this.grid[z][x] === 0) {
            if (this.hasAdjacentFloor(x, z)) {
              this.grid[z][x] = 2; // Wall
            }
          }
        }
      }

      // --- ROOM ROLES ASSIGNMENT ---
      // 1. Start Room: Safe Sanctuary Camp
      const startRoom = this.rooms[0];
      this.startRoom = startRoom;
      this.playerSpawn = { x: startRoom.cx, z: startRoom.cz };

      // 2. Boss Room: The room FARTHEST from startRoom (requiring full dungeon exploration)
      let maxDist = -1;
      let bossRoom = null;
      let bossRoomIdx = -1;
      for (let r = 1; r < this.rooms.length; r++) {
        const d = Math.hypot(this.rooms[r].cx - startRoom.cx, this.rooms[r].cz - startRoom.cz);
        if (d > maxDist) {
          maxDist = d;
          bossRoom = this.rooms[r];
          bossRoomIdx = r;
        }
      }
      this.bossRoom = bossRoom;
      this.bossSpawn = { x: bossRoom.cx, z: bossRoom.cz };

      // Place stairs near back of boss room (offset in direction away from room center)
      const stairsOffsetZ = bossRoom.cz > startRoom.cz ? 2 : -2;
      let sX = bossRoom.cx;
      let sZ = bossRoom.cz + stairsOffsetZ;
      if (!this.grid[sZ] || this.grid[sZ][sX] !== 1) {
        sX = bossRoom.cx + 1;
        sZ = bossRoom.cz;
      }
      this.stairsPos = { x: sX, z: sZ };

      // 3. Bounty Target Room: A secluded side-branch room (separate from start and boss path)
      let bestBountyRoom = null;
      let bestBountyScore = -1;
      for (let r = 1; r < this.rooms.length; r++) {
        if (r === bossRoomIdx) continue;
        const candidate = this.rooms[r];
        const dStart = Math.hypot(candidate.cx - startRoom.cx, candidate.cz - startRoom.cz);
        const dBoss = Math.hypot(candidate.cx - bossRoom.cx, candidate.cz - bossRoom.cz);
        // Prioritize rooms that are far from start and diverge from boss room
        const score = Math.min(dStart, dBoss) + dStart * 0.4;
        if (score > bestBountyScore) {
          bestBountyScore = score;
          bestBountyRoom = candidate;
        }
      }
      this.bountyRoom = bestBountyRoom;

      // Optional encounters occupy secluded rooms, never the arrival/boss/bounty rooms.
      const encounterRooms = this.rooms.filter(room => room !== startRoom && room !== bossRoom && room !== bestBountyRoom);
      const shuffle = list => { for (let i=list.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [list[i],list[j]]=[list[j],list[i]]; } return list; };
      shuffle(encounterRooms);
      const scheduled=this.floorData.vesperScheduled===true;
      const roll = Math.random(), count = Math.max(scheduled?1:0,roll < .20 ? 0 : roll < .75 ? 1 : 2);
      const visitors = shuffle(['eloria_alchemist','valen_lorekeeper','malakor_shade']);
      if(scheduled)visitors.unshift('vesper_broker');
      const encounters = new Map(encounterRooms.slice(0,count).map((room,i)=>[room,visitors[i]]));

      // Intermediate rooms: spawn monsters, elites, chests, altars
      let eliteCount = 0;
      for (let r = 1; r < this.rooms.length; r++) {
        const room = this.rooms[r];
        if (room === bossRoom) continue; // Boss room has only the boss & stairs

        if (encounters.has(room)) {
          const gx = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
          const gz = room.z + 1 + Math.floor(Math.random() * (room.h - 2));
          this.entities.push({type:'npc', npcId:encounters.get(room), gx, gz});
          continue;
        }
        const isBountyRoom = (room === bestBountyRoom);

        // Spawn roaming monsters (guaranteeing at least 1 elite per floor)
        const mPool = this.floorData.monsterPool;
        const mKey = mPool[Math.floor(Math.random() * mPool.length)];
        const isElite = (eliteCount === 0 && r === Math.floor(this.rooms.length / 2)) || Math.random() < 0.35;
        if (isElite) eliteCount++;

        const eliteMod = isElite && RPG_DATA.ELITE_MODIFIERS ? RPG_DATA.ELITE_MODIFIERS[Math.floor(Math.random() * RPG_DATA.ELITE_MODIFIERS.length)] : null;

        // In normal rooms, monster is in center. In bounty room, monster guards the entrance
        this.entities.push({
          type: 'monster',
          monsterKey: mKey,
          isElite: isElite,
          eliteMod: eliteMod,
          gx: isBountyRoom ? room.x + 2 : room.cx,
          gz: isBountyRoom ? room.z + 2 : room.cz
        });

        // Small squads combine roles without increasing arena or asset complexity.
        if (this.floorData.floor >= 2 && !isBountyRoom) {
          const companion = this.floorData.floor >= 3 && r % 2 === 0 ? 'choir_keeper' : 'bone_archer';
          const gx = room.cx + 1, gz = room.cz;
          if (this.isWalkable(gx, gz) && !this.entities.some(e=>e.gx===gx&&e.gz===gz)) {
            this.entities.push({type:'monster',monsterKey:companion,gx,gz,isElite:false});
          }
        }
        // Spawn Destructible Urns / Pots in room corners
        const urnCount = Math.floor(Math.random() * 2) + 1;
        for (let u = 0; u < urnCount; u++) {
          const ux = room.x + 1 + u * 2;
          const uz = room.z + room.h - 2;
          if (this.grid[uz] && this.grid[uz][ux] === 1) {
            this.entities.push({
              type: 'urn',
              gx: ux,
              gz: uz,
              gold: 8 + Math.floor(Math.random() * 15)
            });
          }
        }

        // Chests (Standard Chest, Mimic Chest, or Cursed Chest)
        if (Math.random() < 0.78) {
          const isCursed = Math.random() < 0.35;
          const isMimic = !isCursed && Math.random() < 0.25;
          this.entities.push({
            type: isCursed ? 'cursed_chest' : 'chest',
            isMimic: isMimic,
            gx: room.x + 1,
            gz: room.z + 1,
            opened: false
          });
        }

        // Cursed Altar in a non-bounty intermediate room
        if (!isBountyRoom && r === 1) {
          this.entities.push({
            type: 'cursed_altar',
            gx: room.cx + 1,
            gz: room.cz - 1,
            used: false
          });
        }

        // Sacred Solar Shrine in middle room
        if (!isBountyRoom && r === Math.floor(this.rooms.length / 2)) {
          this.entities.push({
            type: 'shrine',
            gx: room.cx - 1,
            gz: room.cz - 1
          });
        }
      }

      // Safe Sanctuary entities in Room 0 (Start Camp)
      // Lore tablet
      this.entities.push({
        type: 'lore',
        loreIndex: this.floorData.floor - 1,
        gx: startRoom.cx - 1,
        gz: startRoom.cz - 1
      });

      // Sanctuary NPC
      const assignedNpc = 'kaelen_smith';
      this.entities.push({
        type: 'npc',
        npcId: assignedNpc,
        gx: startRoom.cx + 1,
        gz: startRoom.cz - 1
      });

      // Bounty Notice Board in Room 0
      this.entities.push({
        type: 'bounty_board',
        floor: this.floorData.floor,
        gx: startRoom.cx - 2,
        gz: startRoom.cz + 1
      });

      // Floor Bounty Target (Wanted Mini-Boss) placed in deep alcove of secluded Bounty Room
      const bountyDef = RPG_DATA.BOUNTIES && RPG_DATA.BOUNTIES[this.floorData.floor];
      if (bountyDef && bestBountyRoom) {
        const bx = bestBountyRoom.x + bestBountyRoom.w - 2;
        const bz = bestBountyRoom.z + bestBountyRoom.h - 2;
        this.entities.push({
          type: 'bounty_target',
          bountyId: bountyDef.id,
          bountyDef: bountyDef,
          defeated: false,
          gx: bx,
          gz: bz
        });
      }

      // Urns in Start Room
      if (this.grid[startRoom.z + 1] && this.grid[startRoom.z + 1][startRoom.x + startRoom.w - 2] === 1 && !this.entities.some(e => e.gx === startRoom.x + startRoom.w - 2 && e.gz === startRoom.z + 1)) {
        this.entities.push({
          type: 'urn',
          gx: startRoom.x + startRoom.w - 2,
          gz: startRoom.z + 1,
          gold: 12 + Math.floor(Math.random() * 10)
        });
      }

      // Boss in Farthest Room
      this.entities.push({
        type: 'boss',
        bossId: this.floorData.bossId,
        gx: this.bossSpawn.x,
        gz: this.bossSpawn.z
      });

      // Stairs down in Farthest Room (locked until boss dies)
      this.entities.push({
        type: 'stairs',
        gx: this.stairsPos.x,
        gz: this.stairsPos.z,
        locked: true
      });
    }

    carveCorridor(x1, z1, x2, z2) {
      let x = x1;
      let z = z1;
      while (x !== x2) {
        if (this.grid[z]) {
          this.grid[z][x] = 1;
          if (this.grid[z + 1]) this.grid[z + 1][x] = 1;
        }
        x += x < x2 ? 1 : -1;
      }
      while (z !== z2) {
        if (this.grid[z]) {
          this.grid[z][x] = 1;
          if (this.grid[z][x + 1]) this.grid[z][x + 1] = 1;
        }
        z += z < z2 ? 1 : -1;
      }
    }

    hasAdjacentFloor(x, z) {
      for (let dz = -1; dz <= 1; dz++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dz === 0) continue;
          const nx = x + dx;
          const nz = z + dz;
          if (nx >= 0 && nx < this.width && nz >= 0 && nz < this.height) {
            if (this.grid[nz][nx] === 1) return true;
          }
        }
      }
      return false;
    }

    build3DScene() {
      this.tileMeshes = [];

      const floorGeo = new THREE.BoxGeometry(TILE_SIZE * 0.96, 0.22, TILE_SIZE * 0.96);
      const wallGeo = new THREE.BoxGeometry(TILE_SIZE, 2.6, TILE_SIZE);
      const wallCapGeo = new THREE.BoxGeometry(TILE_SIZE * 1.05, 0.14, TILE_SIZE * 1.05);
      const carpetGeo = new THREE.BoxGeometry(TILE_SIZE * 0.88, 0.04, TILE_SIZE * 0.88);

      const floorGroup = new THREE.Group();
      floorGroup.name = 'floors';
      const wallGroup = new THREE.Group();
      wallGroup.name = 'walls';

      // Colors for full vision and dimmed explored memory
      const floorColor = this.floorData.floorTone || 0xadb1a4;
      const wallColor = this.floorData.wallTone || 0xb4b9ac;
      const dimFloorColor = 0x0c0b0e;
      const dimWallColor = 0x120f14;

      // Helper to check if a coordinate is a room center area (for ornate carpet/rune mosaic)
      const isRoomCenterArea = (gx, gz) => {
        for (let r = 0; r < this.rooms.length; r++) {
          const rm = this.rooms[r];
          if (Math.abs(gx - rm.cx) <= 1 && Math.abs(gz - rm.cz) <= 1) {
            return rm === this.bossRoom ? 'boss' : (rm === this.startRoom ? 'sanctuary' : 'normal');
          }
        }
        return null;
      };

      // Helper to check if a coordinate is a room inner corner (for gothic pillars)
      const isRoomCorner = (gx, gz) => {
        for (let r = 0; r < this.rooms.length; r++) {
          const rm = this.rooms[r];
          const isLeft = gx === rm.x;
          const isRight = gx === rm.x + rm.w - 1;
          const isTop = gz === rm.z;
          const isBottom = gz === rm.z + rm.h - 1;
          if ((isLeft || isRight) && (isTop || isBottom)) return true;
        }
        return false;
      };

      for (let z = 0; z < this.height; z++) {
        for (let x = 0; x < this.width; x++) {
          const type = this.grid[z][x];
          const wx = (x - this.width / 2) * TILE_SIZE;
          const wz = (z - this.height / 2) * TILE_SIZE;

          if (type === 1) {
            // Subtle checkerboard / ancient stone variation
            const isAlt = (x + z) % 2 === 0;
            const baseCol = new THREE.Color(floorColor);
            if (isAlt) baseCol. offsetHSL(0, 0, 0.025);
            const tileHex = baseCol.getHex();

            const mat = new THREE.MeshStandardMaterial({
              color: tileHex,
              map: GameRetro.stoneMaps.floor,
              roughness: 0.82,
              metalness: 0.12,
              flatShading: true
            });
            const tile = new THREE.Mesh(floorGeo, mat);
            const heightJitter = ((x * 7 + z * 13) % 5) * 0.008;
            tile.position.set(wx, -0.11 + heightJitter, wz);
            tile.receiveShadow = true;
            tile.visible = false; // Starts hidden in void
            tile.userData = {
              gx: x,
              gz: z,
              isFloor: true,
              origColor: tileHex,
              dimColor: dimFloorColor,
              explored: false
            };

            // Add ornate floor mosaic / carpet in room centers
            const centerType = isRoomCenterArea(x, z);
            if (centerType) {
              const mosaicCol = centerType === 'boss' ? 0x5a1218 : (centerType === 'sanctuary' ? 0x4a3818 : 0x2c2538);
              const mosaicMat = new THREE.MeshStandardMaterial({
                color: mosaicCol,
                roughness: 0.6,
                metalness: 0.3
              });
              const mosaic = new THREE.Mesh(carpetGeo, mosaicMat);
              mosaic.position.y = 0.11;
              mosaic.receiveShadow = true;
              tile.add(mosaic);
            }

            // Add 3D Gothic Pillar at room corners
            if (isRoomCorner(x, z) && typeof GameModels !== 'undefined' && GameModels.createPillar) {
              const pillar = GameModels.createPillar(wallColor);
              pillar.position.set(0, 0.1, 0);
              tile.add(pillar);
            }

            floorGroup.add(tile);
            this.tileMeshes.push(tile);
          } else if (type === 2) {
            // Wall block with custom material instance for fog fading
            const mat = new THREE.MeshStandardMaterial({
              color: wallColor,
              map: GameRetro.stoneMaps.wall,
              roughness: 0.72,
              metalness: 0.2,
              flatShading: true
            });
            const wall = new THREE.Mesh(wallGeo, mat);
            wall.position.set(wx, 1.3, wz);
            wall.castShadow = true;
            wall.receiveShadow = true;
            wall.visible = false; // Starts hidden in void
            wall.userData = {
              gx: x,
              gz: z,
              isWall: true,
              origColor: wallColor,
              dimColor: dimWallColor,
              explored: false
            };

            // Architectural stone cornice / trim cap on top of walls
            const capColor = new THREE.Color(wallColor).offsetHSL(0, 0, 0.06).getHex();
            const capMat = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.6, metalness: 0.25 });
            const cap = new THREE.Mesh(wallCapGeo, capMat);
            cap.position.y = 1.3;
            wall.add(cap);

            wallGroup.add(wall);
            this.tileMeshes.push(wall);

            // Occasional wall torch
            if ((x * 3 + z * 5) % 9 === 0 && typeof GameModels !== 'undefined') {
              const torch = GameModels.createTorch();
              torch.position.set(0, 0, 0);
              torch.userData = { gx: x, gz: z, isTorch: true };
              wall.add(torch);
            }
          }
        }
      }

      this.group.add(floorGroup);
      this.group.add(wallGroup);
      this.floorGroup = floorGroup;
      this.wallGroup = wallGroup;
    }

    // Dynamic Fog of War / Field of View (Diablo / Torchlight Unknown Abyss)
    updateFogOfWar(heroGx, heroGz, entities = [], radius = 5.0) {
      // 1. Update Tiles
      for (let i = 0; i < this.tileMeshes.length; i++) {
        const mesh = this.tileMeshes[i];
        const dist = Math.hypot(mesh.userData.gx - heroGx, mesh.userData.gz - heroGz);

        if (dist <= radius) {
          // Inside Sun Lantern vision cone
          mesh.visible = true;
          mesh.userData.explored = true;
          mesh.material.color.setHex(mesh.userData.origColor);
        } else if (mesh.userData.explored) {
          // Explored memory (dim outline)
          mesh.visible = true;
          mesh.material.color.setHex(mesh.userData.dimColor);
        } else {
          // Unexplored pitch black void
          mesh.visible = false;
        }
      }

      // 2. Update Entities (Monsters concealed in darkness until illuminated)
      for (let j = 0; j < entities.length; j++) {
        const ent = entities[j];
        if (!ent.model) continue;
        if(ent.defeated){ent.model.visible=false;continue;}

        const dist = Math.hypot(ent.gx - heroGx, ent.gz - heroGz);
        if (ent.type === 'monster' || ent.type === 'boss' || ent.type === 'bounty_target') {
          // Conceal in shadow if outside lantern radius
          ent.model.visible = dist <= (radius + 0.5);
        } else {
          // Static props (chest, shrine, urn, stairs) remain visible once explored
          const tileKey = `${ent.gx},${ent.gz}`;
          if (dist <= radius) {
            ent.model.visible = true;
            ent.explored = true;
          } else {
            ent.model.visible = ent.explored === true;
          }
        }
      }
    }

    gridToWorld(gx, gz) {
      return {
        x: (gx - this.width / 2) * TILE_SIZE,
        z: (gz - this.height / 2) * TILE_SIZE
      };
    }

    worldToGrid(wx, wz) {
      return {
        gx: Math.round(wx / TILE_SIZE + this.width / 2),
        gz: Math.round(wz / TILE_SIZE + this.height / 2)
      };
    }

    isWalkable(gx, gz) {
      if (gx < 0 || gx >= this.width || gz < 0 || gz >= this.height) return false;
      return this.grid[gz][gx] === 1;
    }

    // A* Pathfinding for movement & AI
    findPath(startGx, startGz, targetGx, targetGz, maxSteps = 12) {
      if (!this.isWalkable(targetGx, targetGz)) return [];
      const frontier = [{ gx: startGx, gz: startGz, cost: 0, path: [] }];
      const visited = new Set();
      visited.add(`${startGx},${startGz}`);

      while (frontier.length > 0) {
        frontier.sort((a, b) => a.cost - b.cost);
        const curr = frontier.shift();

        if (curr.gx === targetGx && curr.gz === targetGz) {
          return curr.path;
        }

        if (curr.path.length >= maxSteps) continue;

        const neighbors = [
          { gx: curr.gx + 1, gz: curr.gz },
          { gx: curr.gx - 1, gz: curr.gz },
          { gx: curr.gx, gz: curr.gz + 1 },
          { gx: curr.gx, gz: curr.gz - 1 }
        ];

        for (let n of neighbors) {
          const key = `${n.gx},${n.gz}`;
          if (this.isWalkable(n.gx, n.gz) && !visited.has(key)) {
            visited.add(key);
            const dist = Math.abs(n.gx - targetGx) + Math.abs(n.gz - targetGz);
            frontier.push({
              gx: n.gx,
              gz: n.gz,
              cost: curr.path.length + 1 + dist,
              path: [...curr.path, { gx: n.gx, gz: n.gz }]
            });
          }
        }
      }
      return [];
    }

    // Get all walkable tiles within a Manhattan distance
    getReachableTiles(startGx, startGz, maxRange) {
      const results = [];
      const visited = new Set();
      const queue = [{ gx: startGx, gz: startGz, dist: 0 }];
      visited.add(`${startGx},${startGz}`);

      while (queue.length > 0) {
        const curr = queue.shift();
        if (curr.dist > 0 && curr.dist <= maxRange) {
          results.push({ gx: curr.gx, gz: curr.gz, dist: curr.dist });
        }
        if (curr.dist < maxRange) {
          const dirs = [
            { gx: curr.gx + 1, gz: curr.gz },
            { gx: curr.gx - 1, gz: curr.gz },
            { gx: curr.gx, gz: curr.gz + 1 },
            { gx: curr.gx, gz: curr.gz - 1 }
          ];
          for (let d of dirs) {
            const key = `${d.gx},${d.gz}`;
            if (this.isWalkable(d.gx, d.gz) && !visited.has(key)) {
              visited.add(key);
              queue.push({ gx: d.gx, gz: d.gz, dist: curr.dist + 1 });
            }
          }
        }
      }
      return results;
    }
  }

  return {
    TILE_SIZE,
    DungeonLevel
  };
})();
