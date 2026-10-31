/* Targeting and instructional UI shared by mouse and keyboard. */
window.GameCombatGuide=(()=>{
 let combat=null,target=null,aim=null,previousTurn=false;
 const panel=document.createElement('div');panel.id='combatHelp';panel.innerHTML='<strong id="combatHelpTitle"></strong><span id="combatHelpText"></span>';document.body.append(panel);
 const mark=document.createElement('button');mark.id='combatTarget';mark.setAttribute('aria-label','Serang target aktif');document.body.append(mark);
 const markLabel=document.createElement('span');mark.append(markLabel);
 const arrow=document.createElement('button');arrow.id='enemyDirection';document.body.append(arrow);
 const legend=document.createElement('div');legend.id='combatLegend';legend.textContent='Petak abu: gerak · merah: area serang · WASD: langkah memakai AP';document.body.append(legend);
 panel.append(legend);
 function living(){return (combat?.combatants||[]).filter(c=>!c.isPlayer&&c.hp>0);}
 function focus(){if(target&&aim)aim(target);}
 function bind(manager,turnCamera){combat=manager;aim=turnCamera;target=null;previousTurn=false;}
 function begin(){target=living()[0]||null;focus();previousTurn=false;}
 function cycle(){const all=living();if(!all.length)return;target=all[(all.indexOf(target)+1)%all.length];focus();}
 function attack(){if(!combat?.isPlayerTurn())return false;const hero=combat.combatants.find(c=>c.isPlayer);if(!hero)return false;if(!target||target.hp<=0)target=living()[0];if(!target)return false;const skill=combat.selectedSkill||combat.inventory.getActiveSkills()[0];if(skill.type==='self')return combat.useSkill(hero,hero,skill);focus();return combat.tryAttackOrApproach(hero,target,skill);}
 function single(skill){const hero=combat?.combatants.find(c=>c.isPlayer);if(!hero)return;const all=living().filter(c=>combat.isUnitInRange(hero,c,skill.range||1));if(all.length===1){target=all[0];attack();}}
 mark.onclick=e=>{e.stopPropagation();attack();};arrow.onclick=focus;
 function update(camera,enabled){
  panel.hidden=mark.hidden=arrow.hidden=legend.hidden=!enabled;
  if(!enabled||!combat)return;const all=living();if(!target||target.hp<=0)target=all[0]||null;
  const mine=combat.isPlayerTurn(),hero=combat.combatants.find(c=>c.isPlayer),skill=combat.selectedSkill||combat.inventory.getActiveSkills()[0];
  document.getElementById('combatHelpTitle').textContent=mine?'GILIRANMU':'GILIRAN MUSUH';
  document.getElementById('combatHelpText').textContent=mine?'1–5 pilih skill · klik musuh / F / Enter serang · Tab ganti target':'Tunggu aksi musuh. AP dan giliran tetap berlaku.';
  if(!target||!hero){mark.hidden=arrow.hidden=true;return;}
  const threats=all.filter(c=>c.windup&&c.windup.gx===hero.gx&&c.windup.gz===hero.gz);
  if(threats.length) document.getElementById('combatHelpText').textContent='BAHAYA: '+threats.map(c=>c.name).join(', ')+' membidik petakmu. Bergerak sebelum giliran musuh berikutnya!';
  const h=(target.model.bodyRoot?.geometry?.parameters?.height||1.6)*(target.model.scale.y||1),p=target.model.position.clone();p.y+=h*.55;
  const local=p.clone().applyMatrix4(camera.matrixWorldInverse),projected=p.clone().project(camera),visible=local.z<0&&Math.abs(projected.x)<.87&&Math.abs(projected.y)<.8;
  if(mine&&!previousTurn&&!visible)focus();previousTurn=mine;
  mark.hidden=!visible;arrow.hidden=visible;
  const dist=Math.abs(hero.gx-target.gx)+Math.abs(hero.gz-target.gz),range=skill.range||1,inRange=combat.isUnitInRange(hero,target,range),steps=Math.max(0,dist-range);
  if(visible){const top=p.clone();top.y+=h*.48;top.project(camera);const height=Math.max(65,Math.min(innerHeight*.65,Math.abs(top.y-projected.y)*innerHeight));mark.style.left=(projected.x+1)*innerWidth/2+'px';mark.style.top=(1-projected.y)*innerHeight/2+'px';mark.style.width=Math.max(75,height*.8)+'px';mark.style.height=height+'px';mark.disabled=!mine;mark.dataset.range=inRange?'yes':'no';markLabel.textContent=({front:'DEPAN',flank:'SAMPING',back:'BELAKANG'}[AbyssBalance.position(hero,target)])+' · '+target.name+' · '+(mine?'Klik / F: ':'')+skill.name+' · '+skill.cost+' AP'+(inRange?'':' · maju '+steps+' petak');mark.setAttribute('aria-label','Serang '+target.name);}
  else{arrow.textContent=(local.x<0?'◀ ':'▶ ')+target.name+' · Lihat target';arrow.style.left=local.x<0?'16px':'auto';arrow.style.right=local.x<0?'auto':'16px';}
 }
 const rune=document.createElement('canvas');rune.width=64;rune.height=128;const c=rune.getContext('2d');c.fillStyle='#292729';c.fillRect(0,0,64,128);c.strokeStyle='#6e6660';c.lineWidth=2;c.strokeRect(4,4,56,120);c.strokeStyle='#c2b5a0';c.beginPath();c.moveTo(32,16);c.lineTo(20,36);c.lineTo(32,54);c.lineTo(44,36);c.closePath();c.moveTo(32,19);c.lineTo(32,67);c.moveTo(17,59);c.lineTo(47,59);c.stroke();for(let row=0;row<4;row++)for(let j=0;j<6;j++){c.fillStyle=j%2?'#82786d':'#a49783';c.fillRect(13+j*7,80+row*9,3+(row+j)%3,2);}
 const inscriptionTexture=new THREE.CanvasTexture(rune);inscriptionTexture.magFilter=THREE.NearestFilter;inscriptionTexture.minFilter=THREE.NearestFilter;inscriptionTexture.generateMipmaps=false;
 return {bind,begin,cycle,attack,single,update,inscriptionTexture};
})();

