/* Depth progression is fixed by chapter and player-selected contract, never gear. */
window.AbyssBalance = {
 damage(atk, mult, def) { return Math.max(1, Math.round(atk * mult * Math.max(.25, 60 / (60 + Math.max(0, def))))); },
 position(attacker,target) {
  const dx=attacker.gx-target.gx,dz=attacker.gz-target.gz,f=target.facing||{dx:0,dz:-1};
  const dot=dx*f.dx+dz*f.dz,side=Math.abs(dx*f.dz-dz*f.dx);
  return dot<0&&-dot>side?'back':side>Math.abs(dot)?'flank':'front';
 },
 outgoing(mult,base) { const extra=Math.max(0,mult/Math.max(.1,base)-1);return base*(1+extra/(1+extra/1.5)); },
 peakGear(inv) {
  const ranks=['common','uncommon','rare','epic','legendary','mythic'],cls=inv?.heroClassId;
  if(!cls)return false;
  this._peakRanks ||= {};
  const ceilings=this._peakRanks[cls] ||= Object.fromEntries(['weapon','armor','offhand','relic'].map(slot=>[slot,Math.max(...RPG_DATA.ITEMS.filter(i=>i.slot===slot&&(!i.classReq||i.classReq===cls)).map(i=>ranks.indexOf(i.rarity)))]));
  return ['weapon','armor','offhand','relic'].every(slot=>{const i=inv.equipped?.[slot];return i&&(!i.classReq||i.classReq===cls)&&ranks.indexOf(i.rarity)>=ceilings[slot]&&(i.forgeLevel||0)>=10;});
 },
 burstFraction(skill, target, inv) {
  const ultimate=!!skill.adrenalineReq,heavy=(skill.cost||1)>=2||(skill.dmgMult||1)>=1.8;
  if(target.isBoss)return ultimate?.30:heavy?.22:.14;
  if(target.isElite)return ultimate?.72:heavy?.52:.34;
  if(this.peakGear(inv))return Infinity;
  return ultimate?.88:heavy?.65:.38;
 },
 enemy(stats, depth, contract, boss = false, eliteScale = 1) {
  const out = {...stats}, d = Math.max(0, depth - 1);
  const floor=Math.min(8,Math.max(1,depth));
  const role=stats.role==='archer'||stats.role==='support'?.90:stats.type==='brute'?1.22:1;
  const minimum=boss?[0,650,900,1250,1700,2200,2800,3400,4200][floor]:[0,150,210,300,390,480,570,670,760][floor]*role*eliteScale;
  const natural=(stats.hp || stats.maxHp)*(boss?1+d*.20:1+d*.32+d*d*.045);
  out.hp = out.maxHp = Math.round(Math.max(minimum,natural)*(contract?1.15:1));
  out.def = Math.round((stats.def || 0) + d * 2.5);
  out.poise = Math.round((stats.poise || 25) * (1 + d * .10));
  out.maxPoise = out.poise;
  out.atk = Math.round(stats.atk * (1 + d * .22) * (contract ? 1.2 : 1));
  return out;
 }
};
(() => {
 const D = RPG_DATA;
 D.MONSTERS.bone_archer = {...D.MONSTERS.skeleton_warrior, name:'Pemanah Sumpah Patah', role:'archer', hp:65, atk:22, attackRange:4, skills:['Panah Penagih Sumpah']};
 D.MONSTERS.seal_breaker = {...D.MONSTERS.cave_troll, name:'Pemecah Segel', role:'breaker', hp:115, atk:28, skills:['Hantaman Perobek Perisai']};
 D.MONSTERS.choir_keeper = {...D.MONSTERS.abyss_ghost, name:'Penjaga Paduan Jiwa', role:'support', hp:85, atk:18, skills:['Nyanyian Pemulih']};
 D.FLOORS[1].monsterPool.push('bone_archer');
 D.FLOORS[2].monsterPool.push('choir_keeper');
 D.FLOORS[3].monsterPool.push('seal_breaker','bone_archer');
 D.FLOORS[4].monsterPool.push('choir_keeper','seal_breaker');
 const chapters = [
  {name:'Arsip Nama yang Hilang', base:2, boss:'Penjaga Daftar Persembahan', model:'skeleton', pool:['bone_archer','choir_keeper'], quote:'Aku menemukan namaku di sini, Kak. Bukan sebagai tawanan pertama, tetapi sebagai pewaris penjaga. Ayah pernah turun dan menukar namanya agar kita dilupakan. Raja menghapus janji itu. Bawa daftar ini: setiap nama yang kita pulangkan melemahkan mesin di bawah.', relic:'Daftar persembahan dengan tulisan tangan ayah', lore:'Kaelen mengenali paku pada lentera: ia sendiri yang menempanya untuk ayahmu. Ia diam karena takut anak-anakmu akan mewarisi utang yang sama. Di arsip, Liora telah menandai nama para tawanan yang masih hidup. Menyelamatkannya berarti membawa mereka pulang juga.'},
  {name:'Jantung Tungku Gerhana', base:3, boss:'Mandor Tungku Tanpa Fajar', model:'troll', pool:['seal_breaker','vampire_knight','choir_keeper'], quote:'Singgasana hanya pintunya. Tungku ini memakan ingatan tawanan untuk menyalakan matahari palsu. Aku bisa memutus alirannya dari dalam, tetapi seseorang harus menghancurkan tiga pengikatnya. Jangan ikuti suaraku jika ia menyuruhmu meninggalkanku. Mesin itu sudah belajar berbicara.', relic:'Peta pengikat yang digambar Liora', lore:'Eloria pernah mengirim obat ke tungku. Botol-botolnya kembali kosong, tetapi para pekerja tidak pernah pulang. Ia kini mengirim resep penawar melalui lorong pembuangan. Liora memakai tinta dari arang dan obat itu untuk menyusun jalan keluar bagi para tawanan.'},
  {name:'Fajar di Bawah Jurang', base:4, boss:'Gema Sumpah Sang Ayah', model:'vampire', pool:['bone_archer','seal_breaker','choir_keeper'], quote:'Penjaga terakhir memakai wajah ayah. Ia bukan ayah kita; ia sisa sumpah yang menolak padam. Aku akan membuka pintu untuk para tawanan saat kau mematahkan rantainya. Kali ini aku tidak menunggu diselamatkan. Kita pulang bersama, Kak.', relic:'Separuh medali keluarga yang dibawa Liora', lore:'Valen akhirnya membaca bagian sumpah yang dihapus: penjaga tidak harus digantikan jika semua nama persembahan dikembalikan. Malakor menyembunyikannya karena hidupnya bergantung pada siklus itu. Liora menghafal nama-nama dari arsip. Lentera hanya perlu bertahan sampai nama terakhir selesai diucapkan.'}
 ];
 chapters.forEach((c,i)=>{
  const floor=6+i, id='floor_'+floor, template=D.BOSSES['floor_'+(c.base+1)];
  D.FLOORS.push({...D.FLOORS[c.base],floor,name:c.name,subtitle:'Bab '+floor+' — Jejak Liora',bossId:id,monsterPool:c.pool,roomsCount:7});
  D.BOSSES[id]={...template,id,name:c.boss,modelType:c.model,hp:1000+i*120,atk:66+i*6,def:16+i*4,quote:c.quote,gimmick:'Sumpah Retak: penjaga memperkuat pertahanan pada separuh nyawa'};
  D.LORE_TABLETS.push({title:'Kesaksian Liora — '+c.name,text:c.lore});
  D.STORY_DESCENT['floor_'+(floor-1)+'_to_'+floor]={floorTarget:floor,title:c.name,speaker:'Liora',quote:c.quote,relicFound:c.relic,bgVignette:'#170c10'};
 });
 D.LORE_TABLETS[4].text += ' Di balik altar, Liora meninggalkan pesan baru: singgasana bukan dasar jurang. Tubuhnya telah dipindahkan ke tungku, tetapi ia mencuri daftar jalur menuju arsip. Ia meminta agar Kakak mengikuti nama-nama yang dicoret, bukan cahaya palsu.';
 for (const npc of Object.values(D.NPCS)) {
  while(npc.greetings.length<5)npc.greetings.push(npc.greetings[npc.greetings.length-1]);
  npc.greetings.push('Liora menandai arsip agar kita bisa membaca utang kerajaan. Carilah daftar nama, bukan emasnya. Ayahmu pernah mencoba hal yang sama sendirian.', 'Pintu tungku mulai retak. Para tawanan mendengar suara Liora dari saluran udara. Lindungi mereka dengan mematahkan penjaganya; jangan habiskan seluruh bekal sebelum pengikat terakhir.', 'Jika sumpah itu berakhir, pekerjaanku di sini juga selesai. Pulangkan mereka. Kali ini kita tidak akan menghapus nama siapa pun dari sejarah.');
 }
 window.AbyssContractRelics = [
  {id:'contract_ember',name:'Meterai Bara Nekat',slot:'relic',rarity:'legendary',atk:22,def:-10,hp:-25,crit:.08,price:0,icon:'spark',desc:'Hadiah kontrak: +22 ATK, +8% kritis; -10 DEF, -25 HP. Kekuatan yang meminta keberanian.'},
  {id:'contract_memory',name:'Meterai Ingatan Penjaga',slot:'relic',rarity:'legendary',atk:-10,def:14,hp:45,price:0,icon:'shield',desc:'Hadiah kontrak: +14 DEF, +45 HP; -10 ATK. Bertahan lebih lama dengan serangan lebih lemah.'},
  {id:'contract_lastlight',name:'Meterai Fajar Terakhir',slot:'relic',rarity:'legendary',atk:8,def:-8,crit:.2,price:0,icon:'sun',desc:'Hadiah kontrak: +8 ATK, +20% kritis; -8 DEF. Pertaruhan pada serangan penentu.'}
 ];
})();

// Keep every base/subclass skill on the same damage budget; equipment remains meaningful.
(()=>{const seen=new Set();for(const cls of Object.keys(RPG_DATA.CLASSES)){
 const skills=[...RPG_DATA.CLASSES[cls].skills,...Object.values(RPG_DATA.SKILL_TREES[cls]||{}).flatMap(b=>b.nodes.map(n=>n.skillData).filter(Boolean))];
 for(const sk of skills){if(seen.has(sk)||!sk.dmgMult)continue;seen.add(sk);const old=sk.dmgMult;
  const value=sk.adrenalineReq?Math.min(2.65,2+(old-3)*.3):old>1.5?Math.min(2,1+(old-1)*.55):old;
  sk.dmgMult=Math.round(value*100)/100;
  for(const key of ['desc','conditionText','tag'])if(typeof sk[key]==='string')sk[key]=sk[key].split(old+'x').join(sk.dmgMult+'x');
  for(const branch of Object.values(RPG_DATA.SKILL_TREES[cls]||{}))for(const node of branch.nodes)if(node.skillData===sk&&node.desc)node.desc=node.desc.split(old+'x').join(sk.dmgMult+'x');
 }
}})();
