/* One death transition per unit, shared by direct hits, DoT, splash and retaliation. */
window.GameDeath=(()=>{
 const active=[],idle=[],limit=8;
 function slot(){const positions=new Float32Array(18*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));const points=new THREE.Points(geo,new THREE.PointsMaterial({color:0xa49c92,size:.045,transparent:true,opacity:0,depthWrite:false}));points.frustumCulled=false;return {points,positions};}
 function release(s){if(s.points.parent)s.points.parent.remove(s.points);s.points.material.opacity=0;if(s.model){s.model.visible=false;s.model.position.y=-10;s.model.userData.deathFinished=true;}s.model=null;s.body=null;idle.push(s);}
 function begin(combat,unit){
  if(!unit||unit.isPlayer||unit.hp>0||!unit.model||unit.model.userData.deathStarted)return;
  const model=unit.model;model.userData.deathStarted=true;unit.data&&(unit.data.defeated=true);
  model.rotation.x=0;model.position.y=-.001;
  model.children.forEach(child=>{if(child!==model.bodyRoot)child.visible=false;});
  const body=model.bodyRoot;if(!body)return;
  body.material.transparent=true;body.material.depthWrite=false;body.material.alphaTest=.01;body.material.needsUpdate=true;
  if(active.length>=limit)release(active.shift());const s=idle.pop()||slot();s.model=model;s.body=body;s.elapsed=0;s.duration=GamePresentation.settings.motion?.9:.55;s.scale=body.scale.clone();
  s.points.position.copy(model.position);s.points.position.y=.1;combat.scene.add(s.points);active.push(s);
  combat.showFloatingText(unit,'DIKALAHKAN',0xd7c9b6,'floating-death');
  combat.hideTargetForecast();
 }
 function resolve(combat){for(const unit of combat.combatants||[])if(unit.hp<=0)begin(combat,unit);}
 function update(delta){for(let i=active.length-1;i>=0;i--){const s=active[i];if(!s.model.parent){active.splice(i,1);release(s);continue;}s.elapsed+=delta;const p=Math.min(1,s.elapsed/s.duration),motion=GamePresentation.settings.motion;
   s.model.rotation.x=0;s.body.position.y=.001-(motion?p*.22:0);s.body.scale.copy(s.scale).multiplyScalar(1-(motion?p*.08:0));s.body.material.opacity=Math.pow(1-p,.7);s.body.material.color.setHex(motion&&p<.08?0xe6bda0:0x8f8276);
   s.points.visible=motion;s.points.material.opacity=Math.sin(p*Math.PI)*.65;
   for(let j=0;j<18;j++){const a=j*2.399;s.positions[j*3]=Math.cos(a)*p*(.25+(j%4)*.12);s.positions[j*3+1]=.15+(j%6)*.17+p*.6;s.positions[j*3+2]=Math.sin(a)*p*(.25+(j%4)*.12);}s.points.geometry.attributes.position.needsUpdate=true;
   if(p===1){active.splice(i,1);release(s);}
 }}
 function clear(){while(active.length)release(active.pop());}
 for(const name of ['useSkill','updateCombatUI','startTurn','endBattle']){const original=GameCombat.CombatManager.prototype[name];GameCombat.CombatManager.prototype[name]=function(...args){resolve(this);const result=original.apply(this,args);resolve(this);return result;};}
 return {begin,update,clear,stats:()=>({active:active.length,pooled:idle.length,capacity:limit})};
})();
