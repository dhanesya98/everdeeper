/* Owned skills and equipped skills are separate for every class. */
(() => {
 const P=GameInventory.InventoryManager.prototype;
 P.equipSkillNode=function(id){
  const node=this.findSkillNode(id);
  if(!node||node.type!=='active'||!this.unlockedNodes.includes(id)||!Number.isInteger(node.slotIdx)||node.slotIdx<0||node.slotIdx>4)return false;
  this.skillLoadout ||= {};this.skillLoadout[node.slotIdx]=id;this.saveToStorage();return true;
 };
 P.restoreBaseSkill=function(slot){if(!Number.isInteger(slot)||slot<0||slot>4)return false;this.skillLoadout ||= {};delete this.skillLoadout[slot];this.saveToStorage();return true;};
 P.getActiveSkills=function(){
  const base=RPG_DATA.CLASSES[this.heroClassId].skills.map(s=>({...s}));
  for(const [slot,id]of Object.entries(this.skillLoadout||{})){
   const n=this.findSkillNode(id);
   if(n?.type==='active'&&n.slotIdx===Number(slot)&&this.unlockedNodes.includes(id)&&n.skillData)base[n.slotIdx]={...n.skillData,isUnlockedNode:true};
  }return base;
 };
 P.getEffectiveSubclass=function(){
  const branches=Object.values(RPG_DATA.SKILL_TREES[this.heroClassId]||{}).filter(b=>b.nodes.some(n=>this.unlockedNodes.includes(n.id)));
  return branches.length===1?branches[0]:null;
 };
 const tree=RPG_DATA.SKILL_TREES;
 tree.warrior.branchA.mechanic.desc='Iron Will mencegah Stance Break saat Guard aktif. Retaliation memantulkan 40% damage yang diterima. Sisa AP menjadi 15 Barrier per AP; Barrier efektif dibatasi 30% max HP.';
 tree.warrior.branchB.mechanic.desc='Rage bertambah saat menyerang atau terluka (maks. 6), +5% damage per stack. HP di bawah 50% memberi +30% damage dan bonus lifesteal 25%, mengikuti batas pemulihan. Shatter Feast: Stance Break memulihkan 25% HP dan 1 AP.';
 tree.warrior.branchC.mechanic.desc='Serangan memberi 1 Command, kuda-kuda memberi 2 (maks. 5). Setiap stack meningkatkan damage 5%. Eksekusi berlaku pada musuh biasa di bawah 25% HP; boss menerima damage tambahan, bukan mati instan.';
 tree.mage.branchA.mechanic.desc='Es lalu Api: Melt (+35% damage, abaikan 50% DEF pada serangan itu). Petir lalu Es: Superconduct (stun). Api lalu Petir: Overload (30 true damage di sekitar target). Reaksi memotong cooldown 1 giliran.';
 tree.mage.branchB.mechanic.desc='Serangan mantra mengisi 1 Charge (maks. 4). Phase Slash atau skill pelepas Charge menghabiskannya untuk +30% damage per Charge; minimal 2 Charge mengembalikan 1 AP. Aegis Mastery memberi 10 Barrier saat mengisi Charge.';
 tree.mage.branchC.mechanic.desc='Corruption: maksimal 5 stack, 8 damage per stack pada awal giliran musuh. Drain memakai damage aktual dan dibatasi 20 HP per tick. Kill terkutuk memberi 8% HP (maks. 40) dan 1 AP.';
 tree.archer.branchA.mechanic.desc='Eagle Eye menambah jangkauan 1 petak dan peluang kritis 20%. Target berjarak minimal 3 petak menerima +25% damage. Killzone Focus menambahkan pengali damage 1,35 dan mengabaikan 5 DEF dari jarak itu.';
 tree.archer.branchB.mechanic.desc='Toxic Tips meracuni target: 15 damage per giliran selama 3 giliran. Skill perangkap memberi Root. Crippling Venom mengabaikan 5 DEF target yang sedang diracun atau dijerat.';
 tree.archer.branchC.mechanic.desc='Twin Shot memiliki peluang 45% menambah panah sebesar 60% damage serangan pertama. Gale Agility: dodge berhasil memberi 1 AP dan mengurangi cooldown 1. Tidak memberi bonus movement atau dodge setiap tembakan.';
 tree.rogue.branchA.mechanic.desc='Flank memberi 1 Mark dan Backstab 2 Mark. Pada 3 Mark, serangan menjadi kritis dan memberi Vanish: dodge maksimal 60% sampai awal giliran berikutnya. Vanish bukan kebal serangan.';
 tree.rogue.branchB.mechanic.desc='Kuda-kuda memberi 2 token; dodge berhasil memberi 1 token (maksimal 3). Saat terkena serangan dan masih hidup, satu token dibelanjakan untuk membalas 60% ATK tanpa AP.';
 tree.rogue.branchC.mechanic.desc='Serangan dengan skill berbeda menambah 1 Chain, +15% damage per Chain. Mengulang skill memutus Chain. Pada 4 Chain, cooldown berkurang 1 sekali, lalu Chain kembali 0. Tidak menambah movement.';
 const corrections={
  vanish_kill:'Setelah membunuh: pulih 8% HP (maks. 35), dodge maksimal 60% hingga awal giliran berikutnya, dan cooldown Flash Strike direset.',
  chain_flow:'Ganti skill serangan untuk menambah 1 Chain (+15% damage per Chain). Ulang skill: Chain putus. Pada 4 Chain: cooldown -1 sekali, lalu Chain habis.',
  riposte_stance:'Kuda-kuda: +2 token; dodge: +1 token (maks. 3). Satu token membalas serangan sebesar 60% ATK tanpa AP.',
  abyssal_corruption:'Serangan menanam Corruption (maks. 5 stack). DoT menyerap HP aktual, maksimal 20 HP per tick. Kill pada target terkutuk: +8% HP (maks. 40) dan +1 AP.'
 };
 for(const branches of Object.values(tree))for(const branch of Object.values(branches))for(const node of branch.nodes){if(corrections[node.id])node.desc=corrections[node.id];}
})();

window.SkillTreeUI={render(inv,{inCombat,refresh}){
 const root=document.getElementById('skillTreeContainer');if(!root)return;
 root.replaceChildren();root.classList.add('loadout-tree');
 const badge=document.getElementById('skillPointsBadge');if(badge)badge.textContent=inv.skillPoints+' POIN SKILL';
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const button=(label,action,disabled=false)=>{const n=el('button','tree-action',label);n.type='button';n.disabled=disabled;n.onclick=action;return n;};
 const rerender=()=>{refresh();this.render(inv,{inCombat,refresh});};
 const branches=Object.values(RPG_DATA.SKILL_TREES[inv.heroClassId]);
 const summary=el('section','tree-loadout-summary');
 const counts=branches.map(b=>({b,count:b.nodes.filter(n=>inv.unlockedNodes.includes(n.id)).length}));
 summary.append(el('h3','',counts.filter(x=>x.count>0).length>1?'BUILD CAMPURAN':'JALUR KARAKTER'));
 summary.append(el('p','',counts.map(x=>(x.b.subclassName||x.b.name)+' '+x.count+'/4').join(' · ')));
 summary.append(el('p','',inCombat?'Pemasangan, pembelian, dan reset skill tersedia setelah combat.':'Membuka skill menambah koleksi. Pilih Pasang untuk mengganti skill di slot yang sesuai.'));
 const loadout=el('div','tree-loadout-slots');
 inv.getActiveSkills().forEach((s,i)=>{const box=el('div','tree-slot');box.append(el('small','','SLOT '+(i+1)),el('strong','',s.name));if(inv.skillLoadout?.[i])box.append(button('Pakai skill dasar',()=>{inv.restoreBaseSkill(i);rerender();},inCombat));loadout.append(box);});summary.append(loadout);
 const passiveNames=branches.flatMap(b=>b.nodes).filter(n=>n.type==='passive'&&inv.unlockedNodes.includes(n.id)).map(n=>n.name);
 const passives=el('details','tree-passives');passives.append(el('summary','','Pasif aktif ('+passiveNames.length+')'),el('p','',passiveNames.join(' · ')||'Belum ada pasif yang dibuka.'));summary.append(passives);root.append(summary);
 const grid=el('div','tree-branches');root.append(grid);
 for(const branch of branches){
  const column=el('section','tree-branch');column.append(el('h3','',branch.subclassName||branch.name));
  const mechanics=el('details','tree-mechanic');mechanics.append(el('summary','','Mekanik jalur'),el('p','',branch.mechanic?.desc||''));column.append(mechanics);
  for(const node of branch.nodes){
   const owned=inv.unlockedNodes.includes(node.id),installed=owned&&inv.skillLoadout?.[node.slotIdx]===node.id,can=inv.canUnlockNode(node.id),s=node.skillData;
   const card=el('article','tree-node '+(owned?'owned':can?'available':'locked'));
   card.append(el('small','','TINGKAT '+node.tier+' · '+(node.type==='passive'?'PASIF':'SLOT '+(node.slotIdx+1))+' · '+(node.cost||1)+' SP'),el('h4','',node.name));
   card.append(el('p','tree-effect',s?`${s.cost} AP · ${s.range===0?'Diri sendiri':s.range+' petak'} · Cooldown ${s.cooldown||0} giliran${s.adrenalineReq ? " · "+s.adrenalineReq+"% Adrenaline" : ""}`:((node.desc||'Pasif aktif setelah dibuka.').split(/(?<=[.!])\s/)[0])));
   const detail=el('details','tree-detail');detail.append(el('summary','','Lihat efek dan aturan'),el('p','',node.desc||s?.desc||''));if(s?.conditionText)detail.append(el('p','',s.conditionText));
   if(s)detail.append(el('p','tree-rule','Aturan bersama: lifesteal dari damage aktual, maksimal 30% damage / 8% HP per serangan. Dodge maksimal 60% dan berakhir di awal giliran berikutnya. Eksekusi boss menjadi damage, bukan mati instan.'));
   card.append(detail);
   if(owned){card.append(el('span','tree-state',node.type==='passive'?'PASIF AKTIF':installed?'TERPASANG · SLOT '+(node.slotIdx+1):'DIMILIKI'));
    if(node.type==='active'&&!installed)card.append(button('Pasang di Slot '+(node.slotIdx+1),()=>{
     if(card.querySelector('.tree-confirm'))return;
     const confirm=el('div','tree-confirm');confirm.append(el('p','',inv.getActiveSkills()[node.slotIdx].name+' → '+s.name),button('Ganti skill',()=>{inv.equipSkillNode(node.id);rerender();}),button('Batal',()=>confirm.remove()));card.append(confirm);
    },inCombat));
   }else if(can)card.append(button('Buka · '+(node.cost||1)+' SP',()=>{if(inv.unlockSkillNode(node.id))rerender();},inCombat));
   else card.append(el('span','tree-state',node.req&&!inv.unlockedNodes.includes(node.req)?'BUTUH: '+inv.findSkillNode(node.req)?.name:'BUTUH '+(node.cost||1)+' SP'));
   column.append(card);
  }grid.append(column);
 }
}};
