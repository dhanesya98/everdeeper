/* Grid decisions at 4 Hz, smooth visual travel. Menus and combat pause patrol. */
window.EnemyPatrol=(()=>{
 const dirs=[[0,1],[1,0],[0,-1],[-1,0]];let noticeCooldown=0;
 function inside(p,r){return r&&p.gx>=r.x&&p.gx<r.x+r.w&&p.gz>=r.z&&p.gz<r.z+r.h;}
 function safe(d,p){return inside(p,d.startRoom)||d.entities.some(e=>e.type==='npc'&&Math.abs(e.gx-p.gx)+Math.abs(e.gz-p.gz)<=2);}
 function sight(d,a,b){let x=a.gx,z=a.gz,dx=Math.abs(b.gx-x),dz=Math.abs(b.gz-z),sx=Math.sign(b.gx-x),sz=Math.sign(b.gz-z),err=dx-dz;
  while(x!==b.gx||z!==b.gz){const px=x,pz=z,e=2*err;if(e>-dz){err-=dz;x+=sx;}if(e<dx){err+=dx;z+=sz;}if(x!==px&&z!==pz&&(!d.isWalkable(x,pz)||!d.isWalkable(px,z)))return false;if(!d.isWalkable(x,z))return false;}return true;
 }
 function step(d,from,to,blocked){const queue=[{gx:from.gx,gz:from.gz,first:null}],seen=new Set([from.gx+','+from.gz]);
  for(let i=0;i<queue.length&&i<180;i++){const p=queue[i];for(const [dx,dz] of dirs){const q={gx:p.gx+dx,gz:p.gz+dz},k=q.gx+','+q.gz;if(seen.has(k)||!d.isWalkable(q.gx,q.gz)||safe(d,q)||blocked.has(k))continue;seen.add(k);const first=p.first||q;if(q.gx===to.gx&&q.gz===to.gz)return first;queue.push({...q,first});}}return null;
 }
 function marker(model){if(model.userData.facingMarker)return model.userData.facingMarker;
  const shape=new THREE.Shape();shape.moveTo(0,.52);shape.lineTo(-.19,.18);shape.lineTo(-.07,.18);shape.lineTo(-.07,-.18);shape.lineTo(.07,-.18);shape.lineTo(.07,.18);shape.lineTo(.19,.18);shape.closePath();
  const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:0xb5aaa0,side:THREE.DoubleSide,depthWrite:false}));mesh.rotation.x=Math.PI/2;mesh.position.y=.045;model.add(mesh);model.userData.facingMarker=mesh;return mesh;
 }
 function face(model,facing,alert){if(!model||model.userData.deathStarted)return;model.userData.facing=facing;const m=marker(model);m.rotation.set(Math.PI/2,0,model.rotation.y-Math.atan2(facing.dx,facing.dz));m.material.color.setHex(alert==='chase'||alert===true?0xd34c3d:alert==='suspicious'||alert==='search'?0xc69c50:0xb5aaa0);model.userData.alertState=alert||'patrol';}
 function stop(entities,d){for(const e of entities){if(!e.model)continue;e.model.isMoving=false;if(e.patrol){const p=d.gridToWorld(e.gx,e.gz);e.model.position.set(p.x,0,p.z);e.patrol.travel=null;}}}
 function inCone(e,hero){const dx=hero.gx-e.gx,dz=hero.gz-e.gz,f=e.facing||{dx:0,dz:-1},len=Math.hypot(dx,dz)*Math.hypot(f.dx,f.dz);return len===0||(dx*f.dx+dz*f.dz)/len>=.5;}
 function toward(e,p){const dx=p.gx-e.gx,dz=p.gz-e.gz;if(dx||dz)e.facing=Math.abs(dx)>Math.abs(dz)?{dx:Math.sign(dx),dz:0}:{dx:0,dz:Math.sign(dz)};}
 function update(delta,d,entities,heroModel,engage,notify){const hero=d.worldToGrid(heroModel.position.x,heroModel.position.z);noticeCooldown=Math.max(0,noticeCooldown-delta);
  for(const e of entities){if(!['monster','bounty_target'].includes(e.type)||e.defeated||!e.model||e.model.userData.deathStarted)continue;
   let p=e.patrol;if(!p?.runtime){p=e.patrol={home:{gx:e.gx,gz:e.gz},state:'patrol',awareness:0,alert:0,memory:0,cooldown:Math.random()*1.5,...p,clock:0,travel:null,runtime:true};}e.facing||={dx:0,dz:-1};
   if(p.travel){p.travel.t=Math.min(1,p.travel.t+delta/.38);const t=p.travel.t;e.model.position.lerpVectors(p.travel.from,p.travel.to,t);e.model.isMoving=t<1;if(t===1)p.travel=null;}
   face(e.model,e.facing,p.state);p.clock+=delta;if(p.clock<.25)continue;const dt=p.clock;p.clock=0;p.cooldown-=dt;
   const distance=Math.abs(e.gx-hero.gx)+Math.abs(e.gz-hero.gz),homeDist=Math.abs(hero.gx-p.home.gx)+Math.abs(hero.gz-p.home.gz);
   const line=!safe(d,hero)&&homeDist<=12&&sight(d,e,hero),seen=line&&distance<=7&&(distance<=1||inCone(e,hero)),heard=line&&distance<=3&&heroModel.isMoving;
   const previous=p.state;
   if(seen||heard){p.lastSeen={...hero};p.memory=6;p.awareness=Math.min(1,p.awareness+dt*(seen?(distance<=2?1.8:1):.55));p.state=p.awareness>=1?'chase':'suspicious';if(p.state==='suspicious')toward(e,hero);
   }else{p.awareness=Math.max(0,p.awareness-dt*.45);p.alert=0;if(p.state!=='patrol'){p.state='search';p.memory=Math.max(0,p.memory-dt);if(p.memory===0){p.state='patrol';p.lastSeen=null;}}}
   p.noticed=p.state==='chase';if(p.noticed)p.alert+=dt;
   if(previous!==p.state&&noticeCooldown===0&&(p.state==='suspicious'||p.state==='chase')){notify(p.state==='chase'?'Musuh mengejarmu! Putuskan pandangannya atau bersiap bertarung.':'Musuh mulai curiga pada gerakanmu.');noticeCooldown=2;}
   const role=RPG_DATA.MONSTERS[e.monsterKey]?.role,reach=role==='archer'||role==='support'?3:2;
   if(p.noticed&&seen&&distance<=reach&&p.alert>=.8&&!p.travel){e.ambush=true;stop(entities,d);engage(e);return;}
   if(p.travel||p.cooldown>0)continue;p.cooldown=p.noticed?.65:p.state==='search'?.85:1.5+Math.random();
   const blocked=new Set();for(const other of entities)if(other!==e&&!other.defeated){blocked.add(other.gx+','+other.gz);if(other.patrol?.travel){const from=d.worldToGrid(other.patrol.travel.from.x,other.patrol.travel.from.z);blocked.add(from.gx+','+from.gz);}}
   let next;
   if(p.state==='chase'||p.state==='search'){if(p.lastSeen)next=step(d,e,p.lastSeen,blocked);if(!next&&p.state==='search'){const f=e.facing;e.facing={dx:f.dz,dz:-f.dx};}}
   else if(p.state==='patrol'&&Math.abs(e.gx-p.home.gx)+Math.abs(e.gz-p.home.gz)>4)next=step(d,e,p.home,blocked);
   else if(p.state==='patrol'){const options=dirs.map(([dx,dz])=>({gx:e.gx+dx,gz:e.gz+dz})).filter(q=>d.isWalkable(q.gx,q.gz)&&!safe(d,q)&&!inside(q,d.bossRoom)&&!blocked.has(q.gx+','+q.gz)&&!(q.gx===hero.gx&&q.gz===hero.gz)&&Math.abs(q.gx-p.home.gx)+Math.abs(q.gz-p.home.gz)<=4);next=options[Math.floor(Math.random()*options.length)];}
   if(next&&next.gx===hero.gx&&next.gz===hero.gz)next=null;
   if(next){e.facing={dx:next.gx-e.gx,dz:next.gz-e.gz};const world=d.gridToWorld(next.gx,next.gz);p.travel={from:e.model.position.clone(),to:new THREE.Vector3(world.x,0,world.z),t:0};e.gx=next.gx;e.gz=next.gz;e.model.isMoving=true;}
  }
 }
 function combat(cm){if(!cm?.isActive)return;for(const e of cm.combatants)if(!e.isPlayer&&e.hp>0)face(e.model,e.facing,true);}
 return {update,stop,combat,sight,step,safe,inCone};
})();
