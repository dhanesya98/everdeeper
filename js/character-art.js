/* Six original sprites share one atlas, texture and existing animation pipeline. */
window.GameCharacterArt=(()=>{
 const cells={vesper_broker:0,liora:1,freed_captive:2,bone_archer:3,seal_breaker:4,choir_keeper:5};
 const aliases={blacksmith:'kaelen_smith',alchemist:'eloria_alchemist',lorekeeper:'valen_lorekeeper',shade:'malakor_shade'};
 const image=new Image(),cache=new Map();let texture;
 const ready=new Promise((resolve,reject)=>{image.onload=()=>{texture=new THREE.Texture(image);texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.needsUpdate=true;resolve();};image.onerror=()=>reject(new Error('Atlas karakter baru gagal dimuat.'));image.src='assets/abyss-characters-v2.png';});
 GameRetro.ready=Promise.all([GameRetro.ready,ready]);
 for(const id of ['bone_archer','seal_breaker','choir_keeper'])RPG_DATA.MONSTERS[id].modelType=id;
 function actor(id,height){const index=cells[id],group=new THREE.Group(),geo=new THREE.PlaneGeometry(height,height);geo.translate(0,height*.5,0);const uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(index%3+uv.getX(i))/3,1-(Math.floor(index/3)+1-uv.getY(i))/2);
  const body=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:texture,alphaTest:.3,side:THREE.DoubleSide,fog:true}));group.add(body);group.bodyRoot=body;group.userData.pixelActor=true;group.animTime=0;group.name='original_'+id;
  const pos=new THREE.Vector3(),eye=new THREE.Vector3(),q=new THREE.Quaternion(),yaw=new THREE.Quaternion(),axis=new THREE.Vector3(0,1,0);
  body.onBeforeRender=(_r,_s,camera)=>{group.getWorldPosition(pos);camera.getWorldPosition(eye);group.getWorldQuaternion(q);yaw.setFromAxisAngle(axis,Math.atan2(eye.x-pos.x,eye.z-pos.z));body.quaternion.copy(q.invert().multiply(yaw));body.updateMatrixWorld(true);};return group;
 }
 const npc=GameModels.createNPC,monster=GameModels.createMonster,portrait=GamePresentation.portrait;
 GameModels.createNPC=id=>id in cells?actor(id,1.95):npc(aliases[id]||id);
 GameModels.createMonster=(id,boss=false)=>id in cells?actor(id,id==='seal_breaker'?2.75:id==='choir_keeper'?2.25:2.1):monster(id,boss);
 GamePresentation.portrait=(renderer,id,hero=false)=>{if(hero||!(id in cells))return portrait(renderer,aliases[id]||id,hero);if(cache.has(id))return cache.get(id);
  const index=cells[id],canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,(index%3)*image.width/3,Math.floor(index/3)*image.height/2,image.width/3,image.height/2,0,0,256,256);const url=canvas.toDataURL();cache.set(id,url);return url;
 };
 window.addEventListener('DOMContentLoaded',()=>{const grid=document.querySelector('#bestiaryModal .bestiary-grid');if(!grid)return;
  for(const id of ['bone_archer','seal_breaker','choir_keeper']){const i=cells[id],card=document.createElement('article'),art=document.createElement('div'),title=document.createElement('h3'),label=document.createElement('span');art.className='bestiary-art';art.style.backgroundImage='url(assets/abyss-characters-v2.png)';art.style.backgroundSize='300% 200%';art.style.backgroundPosition=(i%3)*50+'% 100%';title.textContent=RPG_DATA.MONSTERS[id].name;label.textContent='PENGHUNI ABYSS';card.append(art,title,label);grid.append(card);}
  document.querySelector('#bestiaryModal .bestiary-intro').textContent='Dua puluh satu penghuni jurang. Pelajari bentuknya sebelum lentera padam.';
 });
 return {ready,image,cells};
})();
