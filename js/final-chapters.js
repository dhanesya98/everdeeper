/* Distinct late-game encounters, persistent chapter objectives and a single sprite atlas. */
window.FinalChapters=(()=>{
 const D=RPG_DATA;
 const specs={
  6:{color:0x81758d,floor:0x514c60,wall:0x8b8098,rooms:9,min:5,max:6,model:'name_archivist',pattern:'column',title:'Pulihkan arsip',labels:['Nama','Ingatan','Pulang'],order:[1,0,2],hint:'Catatan Liora: INGATAN mendahului NAMA. Sesudahnya, PULANG.',bossSkill:'Kolom Penghapusan',bounty:'Serrik, Pencoret Wajah',bmodel:'ink_executioner',relic:'quill_of_names'},
  7:{color:0xa35436,floor:0x654336,wall:0x88604b,rooms:7,min:6,max:8,model:'furnace_warden',pattern:'row',title:'Matikan tiga pengikat tungku',labels:['Pengikat Bara','Pengikat Asap','Pengikat Abu'],hint:'Kalahkan penjaga ruangan, lalu putuskan ketiga pengikat dalam urutan bebas.',bossSkill:'Semburan Tungku',bounty:'Ilyra, Janda Tungku',bmodel:'ash_widow',relic:'cinder_widow_heart'},
  8:{color:0xaaa18a,floor:0x62616b,wall:0xa9a096,rooms:6,min:7,max:9,model:'oath_echo',pattern:'diamond',title:'Patahkan tiga sumpah',labels:['Sumpah Darah','Sumpah Nama','Sumpah Penjaga'],hint:'Tiap sumpah meminta 1 Flask, atau 20 HP jika Flask kosong. Menumpas buronan membebaskan semua biaya.',bossSkill:'Lonceng Sumpah',bounty:'Orthus, Pemakan Lonceng',bmodel:'bell_devourer',relic:'silent_bell'}
 };
 const ids=['name_archivist','furnace_warden','oath_echo','ink_executioner','ash_widow','bell_devourer'];
 const relics=[
  {id:'quill_of_names',name:'Pena Nama yang Kembali',atk:22,int:12,hp:45},
  {id:'cinder_widow_heart',name:'Jantung Janda Bara',atk:26,def:12,hp:55},
  {id:'silent_bell',name:'Lonceng Tanpa Korban',def:24,hp:85,poise:30}
 ];
 relics.forEach((item,i)=>D.ITEMS.push({...item,slot:'relic',rarity:i===2?'mythic':'legendary',price:450+i*70,icon:i===0?'scroll':i===1?'fire':'amulet',dropOnly:true,desc:'Relik eksklusif buronan bab '+(i+6)+'. Nama para korban kembali terukir pada permukaannya.'}));
 for(const [key,s] of Object.entries(specs)){
  const f=Number(key),floor=D.FLOORS[f-1];Object.assign(floor,{color:s.color,fogColor:f===7?0x190b08:f===6?0x0c0915:0x111018,wallColor:s.wall,floorColor:s.floor,wallTone:s.wall,floorTone:s.floor,roomsCount:s.rooms,minRoomSize:s.min,maxRoomSize:s.max});
  Object.assign(D.BOSSES['floor_'+f],{modelType:s.model,chapterPattern:s.pattern,hp:800+(f-6)*160,atk:55+(f-6)*6,skills:[{name:s.bossSkill}],gimmick:'Fase retak: area serangan meluas di bawah 50% HP',rewardItem:s.relic});
  // A boss and its bounty have separate unique rewards; never double-award the bounty relic.
  D.BOSSES['floor_'+f].rewardItem=['crown_of_ruins','solar_seal_orb','crown_of_eternal_dawn'][f-6];
  D.BOUNTIES[f]={id:'bounty_floor_'+f,floor:f,targetKey:s.bmodel,name:s.bounty,title:'Buronan Bab '+f+' — Penagih Nama',danger:'Ancaman Abyss '+f,dangerColor:f===7?'#ed895b':'#c3a5d9',icon:'skull',modelType:s.bmodel,hp:440+(f-6)*100,poise:90+(f-6)*15,atk:40+(f-6)*6,def:15+(f-6)*3,speed:11,moveRange:3,attackRange:2,chapterPattern:s.pattern,skills:[{name:s.bossSkill}],lore:f===6?'Algojo arsip yang menghapus wajah sebelum menghapus nama.':f===7?'Perawat tungku yang mengunci jiwa pekerja dalam lentera perutnya.':'Penjaga lonceng yang memakan nama terakhir. Kalahkan dia agar rantai sumpah tidak meminta Flask atau darah.',rewardGold:1100+(f-6)*250,rewardExp:750+(f-6)*180,relicReward:s.relic};
 }
 const atlas=new Image(),atlasSrc=window.PixelArtAssets?.['abyss-final-bosses']||'assets/abyss-final-bosses.png';let texture;
 const ready=new Promise((resolve,reject)=>{atlas.onload=()=>{texture=new THREE.Texture(atlas);texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.needsUpdate=true;resolve();};atlas.onerror=()=>reject(new Error('Aset boss bab akhir gagal dimuat.'));atlas.src=atlasSrc;});
 GameRetro.ready=Promise.all([GameRetro.ready,ready]);
 const monster=GameModels.createMonster;
 GameModels.createMonster=function(id,boss){const i=ids.indexOf(id);if(i<0)return monster(id,boss);
  const g=new THREE.Group(),height=boss?2.6:2.15,geo=new THREE.PlaneGeometry(height,height);geo.translate(0,height/2,0);const uv=geo.attributes.uv;
  for(let n=0;n<uv.count;n++)uv.setXY(n,(i%3+uv.getX(n))/3,1-(Math.floor(i/3)+1-uv.getY(n))/2);
  const body=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:texture,alphaTest:.3,side:THREE.DoubleSide,fog:true}));g.add(body);g.bodyRoot=body;g.userData.pixelActor=true;g.animTime=0;g.name='chapter_'+id;
  const p=new THREE.Vector3(),c=new THREE.Vector3(),q=new THREE.Quaternion(),yaw=new THREE.Quaternion(),axis=new THREE.Vector3(0,1,0);
  body.onBeforeRender=(_r,_s,camera)=>{g.getWorldPosition(p);camera.getWorldPosition(c);g.getWorldQuaternion(q);yaw.setFromAxisAngle(axis,Math.atan2(c.x-p.x,c.z-p.z));body.quaternion.copy(q.invert().multiply(yaw));body.updateMatrixWorld(true);};return g;
 };
 const generate=GameDungeon.DungeonLevel.prototype.generateRooms;
 GameDungeon.DungeonLevel.prototype.generateRooms=function(){generate.call(this);const s=specs[this.floorData.floor];if(!s)return;
  const rooms=this.rooms.filter(r=>r!==this.startRoom&&r!==this.bossRoom);
  for(let i=0;i<3;i++){const room=rooms[i%rooms.length];let placed=false;
   for(let z=room.z+1;z<room.z+room.h-1&&!placed;z++)for(let x=room.x+1;x<room.x+room.w-1;x++)if(this.isWalkable(x,z)&&!this.entities.some(e=>e.gx===x&&e.gz===z)){this.entities.push({type:'chapter_objective',objectiveIndex:i,gx:x,gz:z,label:s.labels[i]});placed=true;break;}
  }
 };
 function progress(inv,f){return inv.chapterObjectives?.[f]||[];}
 function complete(inv,f){return !specs[f]||progress(inv,f).length===3;}
 function status(inv,f){const s=specs[f];return s?s.title+' · '+progress(inv,f).length+'/3 — '+(complete(inv,f)?'Segel boss terbuka.':s.hint):'';}
 function interact(inv,d,ent){const f=d.floorData.floor,s=specs[f],done=progress(inv,f);
  if(done.includes(ent.objectiveIndex))return {success:false,message:'Bagian ini sudah dipulihkan.'};
  const room=d.rooms.find(r=>ent.gx>=r.x&&ent.gx<r.x+r.w&&ent.gz>=r.z&&ent.gz<r.z+r.h);
  if(d.entities.some(e=>['monster','bounty_target'].includes(e.type)&&!e.defeated&&e.gx>=room.x&&e.gx<room.x+room.w&&e.gz>=room.z&&e.gz<room.z+room.h))return {success:false,message:'Penjaga ruangan masih hidup. Kalahkan mereka sebelum berinteraksi.'};
  if(f===6&&ent.objectiveIndex!==s.order[done.length])return {success:false,message:s.hint};
  if(f===8&&!inv.isBountyCompleted(8)){if(inv.potions>0)inv.potions--;else{const hp=Number.isFinite(inv.currentHp)?inv.currentHp:inv.getComputedStats().maxHp;if(hp<=20)return {success:false,message:'Butuh 1 Flask atau lebih dari 20 HP. Isi bekal di Kaelen atau kalahkan Orthus.'};inv.currentHp=hp-20;}}
  inv.chapterObjectives||={};inv.chapterObjectives[f]=[...done,ent.objectiveIndex];inv.saveToStorage();
  return {success:true,message:s.labels[ent.objectiveIndex]+' dipulihkan. '+(complete(inv,f)?'Segel boss terbuka!':status(inv,f))};
 }
 function objectiveModel(f,done){const model=f===6?GameModels.createLoreTablet():f===7?GameModels.createCursedAltar():GameModels.createShrine();model.scale.multiplyScalar(.75);if(done)model.traverse(o=>{if(o.isMesh&&o.material.color)o.material.color.multiplyScalar(.35);});return model;}
 function inDanger(hero,mark){if(mark.pattern==='column')return Math.abs(hero.gx-mark.gx)<(mark.phase?2:1);if(mark.pattern==='row')return hero.gz===mark.gz||(mark.phase&&hero.gx===mark.gx);return Math.abs(hero.gx-mark.gx)+Math.abs(hero.gz-mark.gz)<=(mark.phase?2:1);}
 function clearMark(cm,enemy){if(enemy.chapterMarkGroup){GamePresentation.disposeTree(enemy.chapterMarkGroup);enemy.chapterMarkGroup=null;}enemy.chapterMark=null;}
 function markTiles(cm,enemy){const group=new THREE.Group(),geo=new THREE.PlaneGeometry(1.2,1.2),mat=new THREE.MeshBasicMaterial({color:0xe35d45,transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false});
  const points=[];for(let z=0;z<cm.dungeon.height;z++)for(let x=0;x<cm.dungeon.width;x++)if(cm.dungeon.isWalkable(x,z)&&inDanger({gx:x,gz:z},enemy.chapterMark))points.push(cm.dungeon.gridToWorld(x,z));
  if(points.length){const tiles=new THREE.InstancedMesh(geo,mat,points.length),dummy=new THREE.Object3D();dummy.rotation.x=-Math.PI/2;points.forEach((p,i)=>{dummy.position.set(p.x,.035,p.z);dummy.updateMatrix();tiles.setMatrixAt(i,dummy.matrix);});tiles.instanceMatrix.needsUpdate=true;tiles.frustumCulled=false;group.add(tiles);}else{geo.dispose();mat.dispose();}cm.scene.add(group);enemy.chapterMarkGroup=group;
 }
 const ai=GameCombat.CombatManager.prototype.executeAiTurn;
 GameCombat.CombatManager.prototype.executeAiTurn=function(enemy){const pattern=enemy.stats.chapterPattern;if(!pattern)return ai.call(this,enemy);
  if(!this.isActive||enemy.hp<=0){clearMark(this,enemy);this.finishAiTurn();return;}
  const hero=this.combatants.find(c=>c.isPlayer);if(!hero||hero.hp<=0){this.endBattle(false);return;}
  if(!enemy.chapterMark){const phase=enemy.hp<enemy.maxHp*.5;enemy.chapterMark={pattern,gx:hero.gx,gz:hero.gz,phase};
   const advice=pattern==='column'?(phase?'Keluar dari TIGA kolom merah!':'Keluar dari kolom merah!'):pattern==='row'?(phase?'Keluar dari baris DAN kolom merah!':'Keluar dari baris merah!'):'Menjauh '+(phase?'3':'2')+' petak dari pusat merah!';
   enemy.chapterWarning=advice;markTiles(this,enemy);this.showFloatingText(hero,advice,0xff7755);this.logCombat(enemy.name+' menyiapkan '+(phase?'FASE RETAK: ':'')+advice,'warning');
   if(this.isUnitInRange(enemy,hero,enemy.stats.attackRange||1))this.useSkill(enemy,hero,{id:'chapter_pressure',name:'Sentuhan Penagih',cost:1,dmgMult:.65,poiseDmg:12});
  }else{const hit=inDanger(hero,enemy.chapterMark);if(hit)this.useSkill(enemy,hero,{id:'chapter_impact',name:'Vonis Abyss',cost:2,dmgMult:1.6,poiseDmg:40});else this.logCombat('Kamu keluar dari tanda. Serangan '+enemy.name+' meleset!','shield');clearMark(this,enemy);}
  this.updateCombatUI();this.finishAiTurn();
 };
 const end=GameCombat.CombatManager.prototype.endBattle;
 GameCombat.CombatManager.prototype.endBattle=function(...args){for(const enemy of this.combatants||[])clearMark(this,enemy);return end.apply(this,args);};
 const turn=GameCombat.CombatManager.prototype.startTurn;
 GameCombat.CombatManager.prototype.startTurn=function(...args){for(const enemy of this.combatants||[])if(enemy.hp<=0||enemy.isStunned)clearMark(this,enemy);return turn.apply(this,args);};
 const guide=GameCombatGuide.update;
 GameCombatGuide.update=function(camera,enabled){guide(camera,enabled);if(!enabled)return;const cm=window.EverDeeperV2?.getCombat?.();const enemy=cm?.combatants.find(e=>e.hp>0&&e.chapterMark);if(enemy)document.getElementById('combatHelpText').textContent='BAHAYA: '+enemy.chapterWarning;};
 window.addEventListener('DOMContentLoaded',()=>{const grid=document.querySelector('#bestiaryModal .bestiary-grid');if(!grid)return;
  document.querySelector('#bestiaryModal .bestiary-intro').textContent='Delapan belas penghuni jurang. Pelajari bentuknya sebelum lentera padam.';
  const names=[...Object.keys(specs).map(f=>D.BOSSES['floor_'+f].name),...Object.values(specs).map(s=>s.bounty)];
  names.forEach((name,i)=>{const card=document.createElement('article'),art=document.createElement('div'),title=document.createElement('h3'),label=document.createElement('span');art.className='bestiary-art';art.style.backgroundImage='url('+atlasSrc+')';art.style.backgroundSize='300% 200%';art.style.backgroundPosition=(i%3)*50+'% '+Math.floor(i/3)*100+'%';title.textContent=name;label.textContent=i<3?'PENGUASA BAB '+(i+6):'BURONAN BAB '+(i+3);card.append(art,title,label);grid.append(card);});
 });
 return {specs,progress,complete,status,interact,objectiveModel,inDanger,ready};
})();
