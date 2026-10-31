/* Original atlas art, shared textures and a deliberately small drawing buffer. */
window.GameRetro = (() => {
  const classes=['warrior','mage','rogue','archer'];
  const creatures=['rat','spider','skeleton','troll','ghost','vampire','mimic','dragon','dark_king','sorcerer','lich','emperor','kaelen_smith','eloria_alchemist','valen_lorekeeper','malakor_shade'];
  const images={}, textures={}, portraits=new Map();
  const ready=Promise.all(['heroes','bestiary'].map(key=>new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>{images[key]=img;const t=new THREE.Texture(img);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;textures[key]=t;resolve();};img.onerror=()=>reject(new Error('Aset '+key+' gagal dimuat'));img.src=PixelArtAssets[key];
  })));
  function actor(key,index,rows,height,name){
    const g=new THREE.Group();g.name=name;g.userData.pixelActor=true;g.animTime=0;
    const geo=new THREE.PlaneGeometry(height,height);geo.translate(0,height*.5,0);
    const uv=geo.attributes.uv,col=index%4,row=Math.floor(index/4);
    for(let i=0;i<uv.count;i++)uv.setXY(i,(col+uv.getX(i))/4,1-(row+1-uv.getY(i))/rows);
    const mat=new THREE.MeshBasicMaterial({map:textures[key],alphaTest:.22,side:THREE.DoubleSide,fog:true});
    const mesh=new THREE.Mesh(geo,mat);g.add(mesh);g.bodyRoot=mesh;
    const p=new THREE.Vector3(),c=new THREE.Vector3(),q=new THREE.Quaternion(),yaw=new THREE.Quaternion(),axis=new THREE.Vector3(0,1,0);
    mesh.onBeforeRender=(_r,_s,camera)=>{g.getWorldPosition(p);camera.getWorldPosition(c);g.getWorldQuaternion(q);yaw.setFromAxisAngle(axis,Math.atan2(c.x-p.x,c.z-p.z));mesh.quaternion.copy(q.invert().multiply(yaw));mesh.updateMatrixWorld(true);};
    return g;
  }
  GameModels.createHero=(id='warrior')=>{
    const g=actor('heroes',4+Math.max(0,classes.indexOf(id)),2,1.65,'hero_'+id);g.isMoving=false;
    g.lanternLight=new THREE.PointLight(0xc3c69c,1.8,6,2);g.lanternLight.position.set(0,1.25,0);g.add(g.lanternLight);
    g.heroRing=new THREE.Mesh(new THREE.RingGeometry(.28,.31,24),new THREE.MeshBasicMaterial({color:0xd4d6bc,side:THREE.DoubleSide}));g.heroRing.rotation.x=-Math.PI/2;g.heroRing.position.y=.035;g.add(g.heroRing);return g;
  };
  GameModels.createNPC=(id='kaelen_smith')=>actor('bestiary',Math.max(12,creatures.indexOf(id)),4,1.9,'npc_'+id);
  GameModels.createMonster=(id,boss=false)=>actor('bestiary',Math.max(0,creatures.indexOf(id)),4,({rat:.85,spider:1.15,dragon:2.7,troll:2.1,mimic:1.4}[id]||1.8)*(boss?1.15:1),'monster_'+id);
  const oldAnimate=GameModels.updateAnimation;
  GameModels.updateAnimation=(g,delta,time)=>{if(!g?.userData.pixelActor)return oldAnimate(g,delta,time);g.animTime+=delta;if(g.bodyRoot)g.bodyRoot.position.y=GamePresentation.settings.motion&&g.isMoving?Math.floor(Math.abs(Math.sin(g.animTime*9))*3)*.012:0;};
  GamePresentation.portrait=(_renderer,id,hero=false)=>{
    const key=(hero?'h:':'n:')+id;if(portraits.has(key))return portraits.get(key);
    const img=images[hero?'heroes':'bestiary'],rows=hero?2:4,index=hero?Math.max(0,classes.indexOf(id)):Math.max(12,creatures.indexOf(id));
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;canvas.getContext('2d').drawImage(img,(index%4)*img.width/4,Math.floor(index/4)*img.height/rows,img.width/4,img.height/rows,0,0,256,256);
    const data=canvas.toDataURL();portraits.set(key,data);return data;
  };
  function stone(floor=false){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');
    let seed=813;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    ctx.fillStyle='#20272a';ctx.fillRect(0,0,64,64);
    for(let y=0;y<64;y+=floor?32:16)for(let x=-32;x<64;x+=32){const shift=(y/16%2)*16;ctx.fillStyle=['#65716e','#505e5b','#748078'][Math.floor(rand()*3)];ctx.fillRect(x+shift+1,y+1,30,(floor?32:16)-2);ctx.fillStyle='#899087';ctx.fillRect(x+shift+2,y+1,28,1);}
    for(let i=0;i<1500;i++){ctx.fillStyle=rand()>.5?'#20272a':'#a0a08d';ctx.globalAlpha=.16+rand()*.24;ctx.fillRect(Math.floor(rand()*64),Math.floor(rand()*64),1,1);}ctx.globalAlpha=1;
    const t=new THREE.CanvasTexture(canvas);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;
  }
  const stoneMaps={wall:stone(),floor:stone(true)};
  for(const name of ['createChest','createMimicChest','createCursedChest','createShrine','createCursedAltar','createPillar','createUrn','createLoreTablet','createStairs','createBountyBoard','createTorch']){
    const original=GameModels[name];if(!original)continue;
    GameModels[name]=(...args)=>{const g=original(...args);g.traverse(n=>{if(n.isMesh&&n.material&&!Array.isArray(n.material)){n.material=n.material.clone();n.material.userData={};if(n.material.isMeshStandardMaterial){if(!n.material.emissive||n.material.emissive.getHex()===0)n.material.map=stoneMaps.wall;n.material.roughness=1;n.material.metalness=0;n.material.color.lerp(new THREE.Color(0x788273),.35);if(n.material.emissive)n.material.emissive.multiplyScalar(.28);}}if(n.isPointLight)n.color.lerp(new THREE.Color(0xadc392),.7);});return g;};
  }
  const target=new THREE.WebGLRenderTarget(1,1,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:true});
  const screen=new THREE.Scene(),screenCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  screen.name='retro-post';screen.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{map:{value:target.texture}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`precision mediump float;uniform sampler2D map;varying vec2 vUv;void main(){vec3 c=texture2D(map,vUv).rgb;float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,.66);c=floor(clamp(c,0.,1.)*24.)/24.;float v=1.-.38*pow(length(vUv-.5)*1.35,2.);gl_FragColor=vec4(c*v,1.);}`})));
  function render(renderer,scene,camera){renderer.info.autoReset=false;renderer.info.reset();renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(screen,screenCamera);}
  let lastDungeon,lastMode,mode='title',renderSize={width:0,height:0};
  function setMode(dungeon,next){
    mode=next;document.body.dataset.view=next;
    if(dungeon===lastDungeon&&next===lastMode)return;
    if(dungeon!==lastDungeon)mapCell='';
    lastDungeon=dungeon;lastMode=next;
    if(!dungeon.retroCeiling){const ceiling=new THREE.Mesh(new THREE.PlaneGeometry(dungeon.width*1.4,dungeon.height*1.4),new THREE.MeshBasicMaterial({color:0x1e2527,map:stoneMaps.wall,side:THREE.DoubleSide}));ceiling.rotation.x=Math.PI/2;ceiling.position.y=2.69;dungeon.group.add(ceiling);dungeon.retroCeiling=ceiling;}
    dungeon.retroCeiling.visible=next==='first-person'||next==='combat-first-person';
    dungeon.tileMeshes.forEach(tile=>{if(tile.userData.isWall){tile.scale.y=next==='tactical'?.26:1;tile.position.y=1.3*tile.scale.y;}});
  }
  function resize(renderer){const h=Math.min(innerHeight,GamePresentation.settings.quality==='lite'?240:360),w=Math.min(720,Math.round(h*innerWidth/innerHeight));renderer.setPixelRatio(1);renderer.setSize(w,Math.round(w*innerHeight/innerWidth),false);target.setSize(w,renderer.domElement.height);renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';renderSize={width:w,height:renderer.domElement.height};}
  let heading;
  const map=document.createElement('canvas');map.id='retroMap';map.width=map.height=190;map.setAttribute('aria-label','Peta area yang sudah dijelajahi');document.body.append(map);
  const actions=document.querySelector('.top-actions');
  function button(text,action){const b=document.createElement('button');b.className='hud-btn';b.textContent=text;b.onclick=action;actions.append(b);return b;}
  const mapButton=button('Peta M',()=>{map.classList.toggle('open');mapButton.setAttribute('aria-pressed',map.classList.contains('open'));});mapButton.setAttribute('aria-pressed','false');
  document.addEventListener('keydown',e=>{if(e.code==='KeyM'&&!e.repeat&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&!document.querySelector('.modal-overlay[style*="display: flex"]'))mapButton.click();});
  const book=document.createElement('div');book.id='bestiaryModal';book.className='modal-overlay';book.style.display='none';
  book.innerHTML='<section class="modal-window bestiary-window"><div class="modal-header"><h2>Catatan Abyss</h2><button class="modal-close-btn">Tutup</button></div><p class="bestiary-intro">Dua belas penghuni jurang. Pelajari bentuknya sebelum lentera padam.</p><div class="bestiary-grid"></div></section>';
  const labels=['Tikus Jurang','Laba-laba Makam','Prajurit Tulang','Troll Rawa','Arwah Terbelenggu','Bangsawan Darah','Peti Pemangsa','Naga Abu','Raja Kegelapan','Penyihir Terlarang','Lich Mahkota','Kaisar Abyss'];
  labels.forEach((label,i)=>{const card=document.createElement('article');card.innerHTML='<div class="bestiary-art" aria-hidden="true"></div><h3>'+label+'</h3><span>'+(i>=8?'PENGUASA JURANG':'PENGHUNI ABYSS')+'</span>';card.firstChild.style.backgroundPosition=(i%4)*100/3+'% '+Math.floor(i/4)*100/3+'%';book.querySelector('.bestiary-grid').append(card);});
  document.body.append(book);book.querySelector('button').onclick=()=>book.style.display='none';button('Bestiari',()=>book.style.display='flex');
  let mapCell='';
  function hud(angle,hero){heading=heading||document.getElementById('retroCompass');if(heading){const degrees=((angle*180/Math.PI)%360+360)%360;heading.textContent=['UTARA','BARAT LAUT','BARAT','BARAT DAYA','SELATAN','TENGGARA','TIMUR','TIMUR LAUT'][Math.round(degrees/45)%8]+' · '+Math.round(degrees)+'°';}
    if(!hero||!lastDungeon)return;const d=lastDungeon,p=d.worldToGrid(hero.position.x,hero.position.z),key=p.gx+','+p.gz+','+d.floorData.floor+','+Math.round(angle*8);
    if(key===mapCell)return;mapCell=key;const ctx=map.getContext('2d'),scale=190/Math.max(d.width,d.height);ctx.fillStyle='#0b1114';ctx.fillRect(0,0,190,190);
    d.tileMeshes.forEach(t=>{if(!t.userData.explored&&!t.visible)return;ctx.fillStyle=t.userData.isWall?'#5c6c60':'#263c32';ctx.fillRect(t.userData.gx*scale,t.userData.gz*scale,scale-1,scale-1);});ctx.fillStyle='#e0e4c3';ctx.fillRect(p.gx*scale-1,p.gz*scale-1,4,4);ctx.strokeStyle='#b54b3e';ctx.beginPath();ctx.moveTo(p.gx*scale+1,p.gz*scale+1);ctx.lineTo(p.gx*scale+1-Math.sin(angle)*9,p.gz*scale+1-Math.cos(angle)*9);ctx.stroke();
  }
  return {ready,stoneMaps,setMode,resize,render,hud,stats:()=>({mode,...renderSize,atlases:Object.keys(textures).length})};
})();
