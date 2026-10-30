/* Shared, bounded presentation resources. No downloads, postprocessing or VFX lights. */
window.GamePresentation = (() => {
  const settingsKey = 'ever_deeper_v2_visuals';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let settings = { quality: 'balanced', motion: !reduced };
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    if (['balanced', 'lite'].includes(saved.quality)) settings.quality = saved.quality;
    if (typeof saved.motion === 'boolean') settings.motion = saved.motion && !reduced;
  } catch (_) { /* A private browser may not allow storage. */ }
  const active = [], idle = [], geometries = {};
  const MAX_EFFECTS = 12;
  const presets = {
    balanced: { pixelRatio: 1.5, effects: 12, particles: 12, ambient: 48, lights: 4 },
    lite: { pixelRatio: 1, effects: 6, particles: 6, ambient: 20, lights: 2 }
  };
  const profile = () => presets[settings.quality];
  const geo = (key, make) => geometries[key] || (geometries[key] = make());
  const ringGeo = () => geo('ring', () => new THREE.RingBufferGeometry(.84, 1, 32));
  const shardGeo = () => geo('shard', () => new THREE.ConeBufferGeometry(.09, .55, 4));
  const beamGeo = () => geo('beam', () => new THREE.CylinderBufferGeometry(1, 1, 1, 6));
  const arcGeo = () => geo('arc', () => new THREE.RingBufferGeometry(.73, 1, 24, 1, 0, Math.PI * 1.2));
  function material() {
    return new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0,
      depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  }
  function makeSlot() {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(ringGeo(), material());
    const arc = new THREE.Mesh(arcGeo(), material());
    const beam = new THREE.Mesh(beamGeo(), material());
    const shards = new THREE.InstancedMesh(shardGeo(), material(), 12);
    shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    shards.frustumCulled = false;
    const positions = new Float32Array(16 * 3);
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    const points = new THREE.Points(pointsGeo, new THREE.PointsMaterial({color:0xffffff, size:.065,
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
    points.frustumCulled = false;
    group.add(ring, arc, beam, shards, points);
    return {group, ring, arc, beam, shards, points, positions, elapsed:0, duration:.5, mode:'slash'};
  }
  function release(slot) {
    if (slot.group.parent) slot.group.parent.remove(slot.group);
    idle.push(slot);
  }
  function acquire(scene, pos, mode, color, duration) {
    if (!scene || !pos) return null;
    if (active.length >= profile().effects) release(active.shift());
    const slot = idle.pop() || makeSlot();
    slot.group.position.set(pos.x, .06, pos.z);
    slot.group.rotation.set(0,0,0);
    slot.elapsed=0;slot.duration=duration;slot.mode=mode;
    for(const mesh of slot.group.children) {
      mesh.visible=false;mesh.position.set(0,0,0);mesh.rotation.set(0,0,0);mesh.scale.set(1,1,1);
      mesh.material.color.setHex(color);mesh.material.opacity=0;
    }
    slot.ring.rotation.x=-Math.PI/2;
    slot.ring.visible=true;
    scene.add(slot.group);active.push(slot);
    return slot;
  }
  const dummy = new THREE.Object3D(), direction = new THREE.Vector3(), up = new THREE.Vector3(0,1,0);
  function classify(id) {
    if (/fire|combust|pyro|meteor/.test(id)) return ['fire',0xf2a45d,.62];
    if (/frost|cryo|ice|freeze/.test(id)) return ['frost',0x9bdeed,.65];
    if (/arrow_rain|barrage|volley/.test(id)) return ['rain',0xe8c78a,.7];
    if (/snare|trap/.test(id)) return ['snare',0x9fc7a2,.6];
    if (/precision|arrow|shot|snipe/.test(id)) return ['arrow',0xe8d7aa,.4];
    if (/supernova|bolt|beam|comet/.test(id)) return ['beam',/supernova/.test(id)?0xf0d9a0:0x9fd8ee,.4];
    if (/smoke|shadow|flash|vanish|phase|vault/.test(id)) return ['shadow',0xaba1d7,.45];
    if (/heal|poison|venom/.test(id)) return ['heal',0x9ed3a1,.65];
    if (/brace|ward|guard|aegis|shield|bastion/.test(id)) return ['guard',0xaacbdd,.55];
    if (/crushing|avatar|slam|shatter/.test(id)) return ['heavy',0xe8bd77,.5];
    return ['slash',0xe7e1cb,.32];
  }
  function skill(scene,id,start,target) {
    const [mode,color,duration]=classify(id || '');
    const slot=acquire(scene,target,mode,color,settings.motion?duration:.2);
    if(!slot)return;
    slot.radius=['fire','frost','rain'].includes(mode)?1.7:mode==='heavy'?1.1:.65;
    slot.ring.material.opacity=.75;
    if(!settings.motion){slot.ring.scale.setScalar(slot.radius);return;}
    if(mode==='arrow'||mode==='beam') {
      const origin=start||target;
      direction.set(target.x-origin.x,0,target.z-origin.z);
      const distance=Math.max(.2,direction.length());
      slot.beam.visible=true;slot.beam.position.set(-direction.x/2,.85,-direction.z/2);
      slot.beam.quaternion.setFromUnitVectors(up,direction.normalize());
      slot.beam.scale.set(mode==='arrow'?.018:.055,distance,mode==='arrow'?.018:.055);
    } else if(['frost','rain','snare'].includes(mode)) {
      slot.shards.visible=true;slot.shards.count=Math.min(8,profile().particles);
    } else if(['slash','heavy','shadow'].includes(mode)) {
      slot.arc.visible=true;slot.arc.position.y=.8;slot.arc.rotation.x=-Math.PI/2;
      if(start)slot.group.rotation.y=Math.atan2(target.x-start.x,target.z-start.z);
    } else {
      slot.points.visible=true;slot.points.geometry.setDrawRange(0,profile().particles);
    }
    tickSlot(slot,0);
  }
  function sparks(scene,pos,type='normal') {
    const color=({crit:0xf3e3af,stance:0xf1b17b,slash:0xd48e83,block:0x9fcfe4})[type]||0xe8c78a;
    const slot=acquire(scene,pos,'sparks',color,settings.motion?.28:.12);
    if(!slot)return;
    slot.radius=type==='stance'?1.1:.4;
    slot.points.visible=settings.motion;slot.points.geometry.setDrawRange(0,profile().particles);
    tickSlot(slot,0);
  }
  function tickSlot(s,p) {
    const fade=Math.pow(1-p,1.4), ease=1-Math.pow(1-p,3);
    const radius=(s.radius||.7)*(.25+ease);
    s.ring.scale.set(radius,radius,1);s.ring.material.opacity=fade*.55;
    s.arc.rotation.z=ease*Math.PI*.8;s.arc.scale.setScalar(.7+ease*.7);s.arc.material.opacity=fade*.9;
    s.beam.material.opacity=fade*.9;
    if(s.mode==='guard'||s.mode==='heal')s.ring.position.y=0.05+p*.7;
    if(s.shards.visible) {
      s.shards.material.opacity=fade*.85;
      for(let i=0;i<s.shards.count;i++) {
        const a=i/s.shards.count*Math.PI*2;
        dummy.position.set(Math.cos(a)*radius*.85,s.mode==='rain'?2.8*(1-ease)+.15:Math.sin(p*Math.PI)*.35,Math.sin(a)*radius*.85);
        dummy.rotation.set(s.mode==='rain'?Math.PI:0,a,s.mode==='snare'?Math.PI/3:0);
        dummy.scale.setScalar(s.mode==='frost'?1.7:1);dummy.updateMatrix();s.shards.setMatrixAt(i,dummy.matrix);
      }
      s.shards.instanceMatrix.needsUpdate=true;
    }
    if(s.points.visible) {
      s.points.material.opacity=fade;
      for(let i=0;i<profile().particles;i++) {
        const a=i/profile().particles*Math.PI*2, speed=.7+(i%3)*.25;
        s.positions[i*3]=Math.cos(a)*ease*speed;
        s.positions[i*3+1]=s.mode==='sparks'?.7+p*(1.1+(i%3)*.3)-p*p*1.6:.1+p*(.9+(i%3)*.3);
        s.positions[i*3+2]=Math.sin(a)*ease*speed;
      }
      s.points.geometry.attributes.position.needsUpdate=true;
    }
  }
  function update(delta) {
    for(let i=active.length-1;i>=0;i--) {
      const s=active[i];s.elapsed+=delta;
      const p=Math.min(1,s.elapsed/s.duration);tickSlot(s,p);
      if(p===1){active.splice(i,1);release(s);}
    }
  }
  function clearEffects() {while(active.length)release(active.pop());}
  function configure(renderer,patch={}) {
    settings={...settings,...patch};
    if(!presets[settings.quality])settings.quality='balanced';
    if(reduced)settings.motion=false;
    renderer.setPixelRatio(1);
    if(window.GameRetro)GameRetro.resize(renderer);
    document.body.dataset.motion=settings.motion?'full':'reduced';
    document.body.dataset.quality=settings.quality;
    while(active.length>profile().effects)release(active.shift());
    try{localStorage.setItem(settingsKey,JSON.stringify(settings));}catch(_){}
  }
  // Dispose geometries owned by a removed scene. Cached model materials remain reusable.
  function disposeTree(root) {
    if(!root)return;
    const gs=new Set(),ms=new Set();
    root.traverse(n=>{if(n.geometry)gs.add(n.geometry);if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>ms.add(m));});
    gs.forEach(g=>{if(!Object.values(geometries).includes(g))g.dispose();});
    ms.forEach(m=>{if(!m.userData.sharedModelMaterial)m.dispose();});
    if(root.parent)root.parent.remove(root);
  }
  // Flatten static NPC parts by material, leaving only the hand/lantern animated.
  function batchStatic(root,exclude=[]) {
    root.updateMatrixWorld(true);
    const groups=new Map(), inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(), transform=new THREE.Matrix4();
    const parts=[];
    root.traverse(n=>{if(n.isMesh&&!exclude.some(e=>{let p=n;while(p){if(p===e)return true;p=p.parent;}return false;}))parts.push(n);});
    for(const mesh of parts) {
      let g=mesh.geometry.isBufferGeometry?mesh.geometry.clone():new THREE.BufferGeometry().fromGeometry(mesh.geometry);
      if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}
      transform.multiplyMatrices(inverse,mesh.matrixWorld);g.applyMatrix4(transform);
      if(!groups.has(mesh.material))groups.set(mesh.material,[]);
      groups.get(mesh.material).push(g);mesh.parent.remove(mesh);mesh.geometry.dispose();
    }
    groups.forEach((list,mat)=>{
      const merged=new THREE.BufferGeometry();
      for(const attr of ['position','normal','uv']) {
        if(!list.every(g=>g.attributes[attr]))continue;
        const size=list[0].attributes[attr].itemSize;
        const array=new Float32Array(list.reduce((n,g)=>n+g.attributes[attr].array.length,0));
        let offset=0;for(const g of list){array.set(g.attributes[attr].array,offset);offset+=g.attributes[attr].array.length;}
        merged.setAttribute(attr,new THREE.BufferAttribute(array,size));
      }
      list.forEach(g=>g.dispose());merged.computeBoundingSphere();
      const mesh=new THREE.Mesh(merged,mat);root.add(mesh);
    });
  }
  let lightSources=[],lightPool=[],lightClock=0;
  function buildLights(scene) {
    // Restore retained sources before rebuilding after a class change.
    lightSources.forEach(s=>{let node=s.anchor;while(node&&node!==scene)node=node.parent;if(node===scene)s.anchor.add(s.light);});
    lightPool.forEach(l=>scene.remove(l));lightPool=[];lightSources=[];
    scene.updateMatrixWorld(true);
    scene.traverse(n=>{if(n.isPointLight)lightSources.push({light:n,anchor:n.parent,local:n.position.clone(),position:new THREE.Vector3(),distance:0});});
    lightSources.forEach(s=>s.anchor.remove(s.light));
    for(let i=0;i<4;i++){const light=new THREE.PointLight(0xffffff,0,8,1.7);scene.add(light);lightPool.push(light);}
    lightClock=1;
  }
  function updateLights(delta,hero) {
    if(!hero)return;lightClock+=delta;if(lightClock<.1)return;lightClock=0;
    hero.updateMatrixWorld(true);
    for(const s of lightSources) {
      let visible=true,node=s.anchor;
      while(node){if(!node.visible)visible=false;node=node.parent;}
      s.anchor.updateWorldMatrix(true,false);s.position.copy(s.local).applyMatrix4(s.anchor.matrixWorld);
      s.distance=visible?s.position.distanceToSquared(hero.position):Infinity;
    }
    lightSources.sort((a,b)=>a.distance-b.distance);
    for(let i=0;i<lightPool.length;i++) {
      const source=lightSources[i],light=lightPool[i];
      if(i>=profile().lights||!source||source.distance>180){light.intensity=0;continue;}
      light.position.copy(source.position);light.color.copy(source.light.color);
      light.intensity=source.light.intensity*.8;light.distance=source.light.distance;light.decay=source.light.decay;
    }
  }
  const portraits=new Map();
  function portrait(renderer,id,isHero=false) {
    const key=(isHero?'hero:':'npc:')+id;if(portraits.has(key))return portraits.get(key);
    const size=isHero?384:256, scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(30,1,.1,12);
    const model=isHero?GameModels.createHero(id):GameModels.createNPC(id);
    // Portrait has its own two studio lights, so remove decorative point lights.
    const lamps=[];model.traverse(n=>{if(n.isLight)lamps.push(n);});lamps.forEach(n=>n.parent.remove(n));
    scene.add(model,new THREE.HemisphereLight(0xf0e9d7,0x28303a,1.3));
    const light=new THREE.DirectionalLight(0xffd8a0,1.5);light.position.set(-3,5,4);scene.add(light);
    camera.position.set(2.2,1.75,3.4);camera.lookAt(0,.9,0);
    const target=new THREE.WebGLRenderTarget(size,size,{depthBuffer:true,stencilBuffer:false});
    const previous=renderer.getRenderTarget(), color=renderer.getClearColor(new THREE.Color()), alpha=renderer.getClearAlpha();
    renderer.setRenderTarget(target);renderer.setClearColor(0x111519,0);renderer.clear();renderer.render(scene,camera);
    const pixels=new Uint8Array(size*size*4);renderer.readRenderTargetPixels(target,0,0,size,size,pixels);
    renderer.setRenderTarget(previous);renderer.setClearColor(color,alpha);target.dispose();
    const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
    const ctx=canvas.getContext('2d'),data=ctx.createImageData(size,size);
    for(let y=0;y<size;y++)data.data.set(pixels.subarray((size-y-1)*size*4,(size-y)*size*4),y*size*4);
    ctx.putImageData(data,0,0);const url=canvas.toDataURL('image/png');portraits.set(key,url);disposeTree(model);
    return url;
  }
  return {skill,sparks,update,clearEffects,configure,disposeTree,batchStatic,portrait,buildLights,updateLights,
    get settings(){return {...settings};},get profile(){return profile();},
    stats:()=>({activeEffects:active.length,pooledEffects:idle.length,capacity:MAX_EFFECTS})};
})();
