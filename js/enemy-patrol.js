/* Grid decisions at 4 Hz, smooth visual travel. Menus and combat pause patrol. */
window.EnemyPatrol=(()=>{
 const dirs=[[0,1],[1,0],[0,-1],[-1,0]];
 function inside(p,r){return r&&p.gx>=r.x&&p.gx<r.x+r.w&&p.gz>=r.z&&p.gz<r.z+r.h;}
 function safe(d,p){return inside(p,d.startRoom)||d.entities.some(e=>e.type==='npc'&&Math.abs(e.gx-p.gx)+Math.abs(e.gz-p.gz)<=2);}
 function sight(d,a,b){let x=a.gx,z=a.gz,dx=Math.abs(b.gx-x),dz=Math.abs(b.gz-z),sx=Math.sign(b.gx-x),sz=Math.sign(b.gz-z),err=dx-dz;
  while(x!==b.gx||z!==b.gz){const e=2*err;if(e>-dz){err-=dz;x+=sx;}if(e<dx){err+=dx;z+=sz;}if(!d.isWalkable(x,z))return false;}return true;
 }
 function step(d,from,to,blocked){const queue=[{gx:from.gx,gz:from.gz,first:null}],seen=new Set([from.gx+','+from.gz]);
  for(let i=0;i<queue.length&&i<180;i++){const p=queue[i];for(const [dx,dz] of dirs){const q={gx:p.gx+dx,gz:p.gz+dz},k=q.gx+','+q.gz;if(seen.has(k)||!d.isWalkable(q.gx,q.gz)||safe(d,q)||blocked.has(k))continue;seen.add(k);const first=p.first||q;if(q.gx===to.gx&&q.gz===to.gz)return first;queue.push({...q,first});}}return null;
 }
 function marker(model){if(model.userData.facingMarker)return model.userData.facingMarker;
  const shape=new THREE.Shape();shape.moveTo(0,.52);shape.lineTo(-.19,.18);shape.lineTo(-.07,.18);shape.lineTo(-.07,-.18);shape.lineTo(.07,-.18);shape.lineTo(.07,.18);shape.lineTo(.19,.18);shape.closePath();
  const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:0xb5aaa0,side:THREE.DoubleSide,depthWrite:false}));mesh.rotation.x=Math.PI/2;mesh.position.y=.045;model.add(mesh);model.userData.facingMarker=mesh;return mesh;
 }
 function face(model,facing,alert){if(!model||model.userData.deathStarted)return;const m=marker(model);m.rotation.set(Math.PI/2,0,model.rotation.y-Math.atan2(facing.dx,facing.dz));m.material.color.setHex(alert?0xd34c3d:0xb5aaa0);}
 function stop(entities,d){for(const e of entities){if(!e.model)continue;e.model.isMoving=false;if(e.patrol){const p=d.gridToWorld(e.gx,e.gz);e.model.position.set(p.x,0,p.z);e.patrol.travel=null;}}}
 function update(delta,d,entities,heroModel,engage,notify){const hero=d.worldToGrid(heroModel.position.x,heroModel.position.z);
  for(const e of entities){if(!['monster','bounty_target'].includes(e.type)||e.defeated||!e.model||e.model.userData.deathStarted)continue;
   const p=e.patrol||(e.patrol={home:{gx:e.gx,gz:e.gz},clock:0,cooldown:Math.random()*1.5,alert:0,noticed:false,travel:null});e.facing||={dx:0,dz:-1};
   if(p.travel){p.travel.t=Math.min(1,p.travel.t+delta/.38);const t=p.travel.t;e.model.position.lerpVectors(p.travel.from,p.travel.to,t);e.model.isMoving=t<1;if(t===1)p.travel=null;}
   face(e.model,e.facing,p.noticed);p.clock+=delta;if(p.clock<.25)continue;const dt=p.clock;p.clock=0;p.cooldown-=dt;
   const distance=Math.abs(e.gx-hero.gx)+Math.abs(e.gz-hero.gz),homeDist=Math.abs(hero.gx-p.home.gx)+Math.abs(hero.gz-p.home.gz);
   const detected=!safe(d,hero)&&homeDist<=12&&distance<=7&&sight(d,e,hero);
   if(detected){if(!p.noticed){p.noticed=true;p.alert=0;notify('Musuh melihatmu! Bersiap menghadapi sergapan.');}p.alert+=dt;
    if(distance<=2&&p.alert>=.8&&!p.travel){e.ambush=true;stop(entities,d);engage(e);return;}
   }else{p.noticed=false;p.alert=0;}
   if(p.travel||p.cooldown>0)continue;p.cooldown=detected?.65:1.5+Math.random();
   const blocked=new Set(entities.filter(o=>o!==e&&!o.defeated).map(o=>o.gx+','+o.gz));let next;
   if(detected){next=step(d,e,hero,blocked);if(next&&next.gx===hero.gx&&next.gz===hero.gz)next=null;}
   else{const options=dirs.map(([dx,dz])=>({gx:e.gx+dx,gz:e.gz+dz})).filter(q=>d.isWalkable(q.gx,q.gz)&&!safe(d,q)&&!inside(q,d.bossRoom)&&!blocked.has(q.gx+','+q.gz)&&!(q.gx===hero.gx&&q.gz===hero.gz)&&Math.abs(q.gx-p.home.gx)+Math.abs(q.gz-p.home.gz)<=4);next=options[Math.floor(Math.random()*options.length)];}
   if(next){e.facing={dx:next.gx-e.gx,dz:next.gz-e.gz};const world=d.gridToWorld(next.gx,next.gz);p.travel={from:e.model.position.clone(),to:new THREE.Vector3(world.x,0,world.z),t:0};e.gx=next.gx;e.gz=next.gz;e.model.isMoving=true;}
  }
 }
 function combat(cm){if(!cm?.isActive)return;for(const e of cm.combatants)if(!e.isPlayer&&e.hp>0)face(e.model,e.facing,true);}
 return {update,stop,combat,sight,step,safe};
})();
