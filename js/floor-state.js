/* Compact, versioned world snapshots; no meshes, timers or textures enter storage. */
window.FloorState=(()=>{
 const fields=['type','gx','gz','monsterKey','isElite','eliteMod','bountyId','bossId','npcId','floor','gold','loreIndex','isMimic','opened','used','destroyed','isDestroyed','defeated','locked','explored','objectiveIndex','label','facing'];
 const clone=v=>JSON.parse(JSON.stringify(v));
 function valid(s,floor){
  if(!s||s.version!==1||s.floor!==floor||s.width!==38||s.height!==38||!Array.isArray(s.grid)||s.grid.length!==38||!s.grid.every(r=>Array.isArray(r)&&r.length===38&&r.every(v=>v===0||v===1||v===2)))return false;
  const point=p=>p&&Number.isInteger(p.x)&&Number.isInteger(p.z)&&s.grid[p.z]?.[p.x]===1;
  if(!Array.isArray(s.rooms)||s.rooms.length<2||!s.rooms.every(r=>['x','z','w','h','cx','cz'].every(k=>Number.isFinite(r[k]))&&r.x>=0&&r.z>=0&&r.w>0&&r.h>0&&r.x+r.w<=38&&r.z+r.h<=38)||!point(s.playerSpawn)||!point(s.bossSpawn)||!point(s.stairsPos))return false;
  if(![s.start,s.boss].every(i=>Number.isInteger(i)&&i>=0&&i<s.rooms.length)||!(s.bounty===-1||Number.isInteger(s.bounty)&&s.bounty>=0&&s.bounty<s.rooms.length))return false;
  const types=['monster','boss','bounty_target','npc','urn','chest','cursed_chest','cursed_altar','shrine','lore','stairs','bounty_board','chapter_objective'];
  return Array.isArray(s.entities)&&s.entities.length<1000&&s.entities.every(e=>types.includes(e.type)&&Number.isInteger(e.gx)&&Number.isInteger(e.gz)&&s.grid[e.gz]?.[e.gx]===1);
 }
 function capture(d,hero,angle,pitch){
  const entities=d.entities.map(e=>{const saved={};for(const key of fields)if(e[key]!==undefined)saved[key]=clone(e[key]);
   if(e.destroyed||e.isDestroyed){saved.destroyed=true;saved.isDestroyed=true;}
   if(e.model?.userData.deathStarted)saved.defeated=true;
   if(e.patrol)saved.patrol={home:clone(e.patrol.home),state:e.patrol.state||'patrol',awareness:e.patrol.awareness||0,lastSeen:e.patrol.lastSeen?clone(e.patrol.lastSeen):null,memory:e.patrol.memory||0,cooldown:e.patrol.cooldown||0,alert:e.patrol.alert||0};
   return saved;
  });
  if(entities.some(e=>e.type==='boss'&&e.defeated))for(const e of entities)if(e.type==='stairs')e.locked=false;
  return {version:1,floor:d.floorData.floor,width:d.width,height:d.height,grid:clone(d.grid),rooms:clone(d.rooms),start:d.rooms.indexOf(d.startRoom),boss:d.rooms.indexOf(d.bossRoom),bounty:d.rooms.indexOf(d.bountyRoom),playerSpawn:clone(d.playerSpawn),bossSpawn:clone(d.bossSpawn),stairsPos:clone(d.stairsPos),entities,explored:[...new Set((d.tileMeshes||[]).filter(m=>m.userData.explored).map(m=>m.userData.gz*d.width+m.userData.gx))],player:{x:hero.position.x,z:hero.position.z,angle,pitch}};
 }
 function restore(d,s){if(!valid(s,d.floorData.floor))return false;
  for(const key of ['width','height','grid','rooms','playerSpawn','bossSpawn','stairsPos','entities'])d[key]=clone(s[key]);
  d.startRoom=d.rooms[s.start];d.bossRoom=d.rooms[s.boss];d.bountyRoom=d.rooms[s.bounty];
  for(const e of d.entities){
   if(e.type==='bounty_target')e.bountyDef=RPG_DATA.BOUNTIES[d.floorData.floor];
   if(e.destroyed||e.isDestroyed){e.destroyed=true;e.isDestroyed=true;}
  }
  d.restoredState=s;return true;
 }
 function fog(d,s){const seen=new Set(s?.explored||[]);for(const mesh of d.tileMeshes||[])if(seen.has(mesh.userData.gz*d.width+mesh.userData.gx))mesh.userData.explored=true;}
 function prop(e){const m=e.model;if(!m)return;if(e.opened&&m.lidGroup)m.lidGroup.rotation.x=-Math.PI/2.5;
  if(e.destroyed||e.isDestroyed){e.destroyed=true;e.isDestroyed=true;if(m.intactGroup&&m.rubbleGroup){m.intactGroup.visible=false;m.rubbleGroup.visible=true;}else m.position.y=-10;}
  if(e.used&&e.type==='cursed_altar')m.traverse(o=>{if(o.isMesh&&o.material.color)o.material.color.multiplyScalar(.35);});
 }
 return {valid,capture,restore,fog,prop};
})();
