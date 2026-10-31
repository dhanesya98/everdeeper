/* Front + side (mirrored for left) + rear frames; shared atlases, 256px cells on GPU. */
window.DirectionalSprites=(()=>{
 const base=['rat','spider','skeleton','troll','ghost','vampire','mimic','dragon','dark_king','sorcerer','lich','emperor','kaelen_smith','eloria_alchemist','valen_lorekeeper','malakor_shade'];
 const final=['name_archivist','furnace_warden','oath_echo','ink_executioner','ash_widow','bell_devourer'];
 const characters=['vesper_broker','liora','freed_captive','bone_archer','seal_breaker','choir_keeper'];
 const packs=[{prefix:'bestiary',cols:4,rows:4,ids:base},{prefix:'final-bosses',cols:3,rows:2,ids:final},{prefix:'characters',cols:3,rows:2,ids:characters}];
 const jobs=packs.flatMap(pack=>['side','back'].map(view=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=pack.cols*256;canvas.height=pack.rows*256;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0,canvas.width,canvas.height);const texture=new THREE.CanvasTexture(canvas);texture.minFilter=texture.magFilter=THREE.NearestFilter;texture.generateMipmaps=false;pack[view]=texture;resolve();};img.onerror=()=>reject(new Error('Atlas arah gagal dimuat: '+pack.prefix+'-'+view));img.src='assets/'+pack.prefix+'-'+view+'.png';})));
 const ready=Promise.all(jobs);GameRetro.ready=Promise.all([GameRetro.ready,ready]);
 function choose(facing,dx,dz){const f=facing||{dx:0,dz:-1},dot=dx*f.dx+dz*f.dz,cross=f.dx*dz-f.dz*dx,side=Math.abs(cross);return dot<0&&-dot>side?{view:'back',flip:false}:side>Math.abs(dot)?{view:'side',flip:cross<0}:{view:'front',flip:false};}
 function bind(group,id){const pack=packs.find(p=>p.ids.includes(id));if(!pack||!group.bodyRoot)return group;
  const index=pack.ids.indexOf(id),body=group.bodyRoot,front=body.material.map,previous=body.onBeforeRender,eye=new THREE.Vector3(),pos=new THREE.Vector3();let last='';
  body.onBeforeRender=function(renderer,scene,camera,...rest){previous?.call(this,renderer,scene,camera,...rest);if(group.userData.deathStarted)return;camera.getWorldPosition(eye);group.getWorldPosition(pos);const frame=choose(group.userData.facing,eye.x-pos.x,eye.z-pos.z),key=frame.view+frame.flip;if(key===last)return;last=key;
   body.material.map=frame.view==='front'?front:pack[frame.view];const uv=body.geometry.attributes.uv;
   const img=body.material.map.image,ix=.5/(img.width||pack.cols*256),iy=.5/(img.height||pack.rows*256);
   for(let n=0;n<uv.count;n++){let u=n%2;const v=n<2?1:0;if(frame.flip)u=1-u;uv.setXY(n,(index%pack.cols)/pack.cols+ix+u*(1/pack.cols-2*ix),1-(Math.floor(index/pack.cols)+1)/pack.rows+iy+v*(1/pack.rows-2*iy));}uv.needsUpdate=true;group.userData.spriteView=frame.view;group.userData.spriteFlip=frame.flip;
  };group.userData.directional=true;group.userData.spriteId=id;return group;
 }
 const monster=GameModels.createMonster,npc=GameModels.createNPC;
 GameModels.createMonster=(id,boss)=>bind(monster(id,boss),id);
 GameModels.createNPC=id=>bind(npc(id),({blacksmith:'kaelen_smith',alchemist:'eloria_alchemist',lorekeeper:'valen_lorekeeper',shade:'malakor_shade'}[id]||id));
 return {ready,choose,packs};
})();
