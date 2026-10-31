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
 const badge=document.getElementById('skillPointsBadge');if(badge)badge.textContent=inv.skillPoints+' SP';
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const button=(label,action,disabled=false,cls='tree-action')=>{const n=el('button',cls,label);n.type='button';n.disabled=disabled;n.onclick=action;return n;};
 const shortName=str=>String(str||'').split(' (')[0];
 const shortSummary=str=>{const s=String(str||'').split(/(?<=[.!])\s/)[0];return s.length>68?s.slice(0,65)+'…':s;};
 const rerender=()=>{refresh();this.render(inv,{inCombat,refresh});};
 const branches=Object.values(RPG_DATA.SKILL_TREES[inv.heroClassId]);
 const loadout=el('div','tree-loadout-slots');
 inv.getActiveSkills().forEach((s,i)=>{
  const box=el('div','tree-slot'+(inv.skillLoadout?.[i]?' is-custom':''));
  box.title=(s.name||'')+'\n'+(s.desc||'');
  const top=el('div','tree-slot-head');
  top.append(el('small','','SLOT '+(i+1)));
  if(inv.skillLoadout?.[i])top.append(button('↺',()=>{inv.restoreBaseSkill(i);rerender();},inCombat,'tree-slot-reset'));
  box.append(top,el('strong','',shortName(s.name)));
  loadout.append(box);
 });
 root.append(loadout);
 const grid=el('div','tree-branches');root.append(grid);
 for(const branch of branches){
  const unlockedCount=branch.nodes.filter(n=>inv.unlockedNodes.includes(n.id)).length;
  const column=el('section','tree-branch');
  const head=el('div','tree-branch-head');
  head.title=branch.mechanic?.desc||'';
  head.append(el('h3','',shortName(branch.subclassName||branch.name)),el('span','tree-branch-count',unlockedCount+'/4'));
  column.append(head);
  for(const node of branch.nodes){
   const owned=inv.unlockedNodes.includes(node.id),installed=owned&&inv.skillLoadout?.[node.slotIdx]===node.id,can=inv.canUnlockNode(node.id),s=node.skillData;
   const card=el('article','tree-node '+(owned?'owned':can?'available':'locked'));
   const fullTip=[node.name,s?`${s.cost} AP · ${s.range===0?'Diri':s.range+' petak'} · CD ${s.cooldown||0}`:'Pasif',node.desc||s?.desc||'',s?.conditionText||''].filter(Boolean).join('\n');
   card.title=fullTip;
   const topRow=el('div','tree-node-top');
   topRow.append(el('small','','T'+node.tier+' · '+(node.type==='passive'?'PASIF':'SLOT '+(node.slotIdx+1))));
   if(owned){
    if(node.type==='active'&&!installed){
     topRow.append(button('Pasang',()=>{inv.equipSkillNode(node.id);rerender();},inCombat));
    }else{
     topRow.append(el('span','tree-state is-active',node.type==='passive'?'Aktif':'Terpasang'));
    }
   }else if(can){
    topRow.append(button('Buka ('+(node.cost||1)+' SP)',()=>{if(inv.unlockSkillNode(node.id))rerender();},inCombat));
   }else{
    topRow.append(el('span','tree-state',node.req&&!inv.unlockedNodes.includes(node.req)?'Terkunci':'Butuh '+(node.cost||1)+' SP'));
   }
   card.append(topRow,el('h4','',shortName(node.name)));
   const brief=s?`${s.cost} AP · ${s.range===0?'Diri':s.range+' petak'}${s.cooldown?` · CD ${s.cooldown}`:''}`:shortSummary(node.desc||'Pasif aktif otomatis.');
   card.append(el('p','tree-effect',brief));
   column.append(card);
  }
  grid.append(column);
 }
}};
