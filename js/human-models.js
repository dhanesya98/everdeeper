/* Natural human anatomy, smooth shading and rigid joint animation. No asset downloads. */
(function () {
  'use strict';
  const materials=new Map();
  function mat(color,metalness=0,glow=0) {
    const key=color+':'+metalness+':'+glow;
    if(!materials.has(key)) {
      const m=new THREE.MeshStandardMaterial({color,metalness,roughness:metalness?.48:.85,emissive:glow,emissiveIntensity:glow?.65:0});
      m.userData.sharedModelMaterial=true;materials.set(key,m);
    }
    return materials.get(key);
  }
  function mesh(parent,geometry,material,x=0,y=0,z=0) {
    const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;
  }
  function oval(parent,m,x,y,z,sx,sy,sz,n=10) {
    const o=mesh(parent,new THREE.SphereGeometry(1,n,Math.max(6,n-2)),m,x,y,z);o.scale.set(sx,sy,sz);return o;
  }
  // Cross sections make a fitted body instead of a stack of rectangular blocks.
  function form(parent,m,rings,segments=12) {
    const p=[],indices=[];
    rings.forEach(([y,rx,rz,cz=0],row)=>{
      for(let i=0;i<=segments;i++) {
        const a=i/segments*Math.PI*2;p.push(Math.sin(a)*rx,y,Math.cos(a)*rz+cz);
        if(row&&i){const n=row*(segments+1)+i;indices.push(n,n-1,n-segments-2,n,n-segments-2,n-segments-1);}
      }
    });
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();
    // Average the duplicated seam normals so cylinders have no visible vertical crease.
    const normal=g.attributes.normal;
    for(let r=0;r<rings.length;r++){
      const a=r*(segments+1),b=a+segments,v=new THREE.Vector3().fromBufferAttribute(normal,a).add(new THREE.Vector3().fromBufferAttribute(normal,b)).normalize();
      normal.setXYZ(a,v.x,v.y,v.z);normal.setXYZ(b,v.x,v.y,v.z);
    }
    return mesh(parent,g,m);
  }
  function rod(parent,m,a,b,r=.02,r2=r,n=8) {
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);
    const o=mesh(parent,new THREE.CylinderGeometry(r2,r,d.length(),n),m);o.position.copy(start.add(end).multiplyScalar(.5));
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;
  }
  const box=(parent,m,w,h,d,x,y,z)=>mesh(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z);
  function panel(parent,m,top,bottom,wt,wb,z,fold=.018) {
    const p=[],idx=[],cols=8,rows=5;
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
      const u=i/cols,v=j/rows;p.push((u-.5)*(wt+(wb-wt)*v),top+(bottom-top)*v,z+Math.sin(u*Math.PI*6)*fold*v-.055*v);
      if(j&&i){const n=j*(cols+1)+i;idx.push(n,n-1,n-cols-2,n,n-cols-2,n-cols-1);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();
    m.side=THREE.DoubleSide;return mesh(parent,g,m);
  }
  function batch(root,exclude=[]) {
    root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),parts=[],buckets=new Map();
    root.traverse(n=>{if(n.isMesh&&!exclude.some(e=>{for(let p=n;p;p=p.parent)if(p===e)return true;return false;}))parts.push(n);});
    for(const part of parts){let g=part.geometry.clone();if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,part.matrixWorld));
      if(!buckets.has(part.material))buckets.set(part.material,[]);buckets.get(part.material).push(g);part.parent.remove(part);part.geometry.dispose();}
    buckets.forEach((list,m)=>{const g=new THREE.BufferGeometry();for(const attr of ['position','normal']){
      const data=new Float32Array(list.reduce((s,p)=>s+p.attributes[attr].array.length,0));let offset=0;
      for(const part of list){data.set(part.attributes[attr].array,offset);offset+=part.attributes[attr].array.length;}g.setAttribute(attr,new THREE.BufferAttribute(data,3));}
      list.forEach(p=>p.dispose());g.computeBoundingSphere();mesh(root,g,m);});
  }
  function head(parent,cfg) {
    const h=new THREE.Group();h.position.set(0,1.46,0);parent.add(h);
    const skin=mat(cfg.skin),hair=mat(cfg.hair);
    form(h,skin,[[-.12,.034,.037,.008],[-.101,.059,.059,.014],[-.06,.085,.073,.009],[-.01,.096,.082],
      [.05,.095,.087,-.008],[.099,.073,.066,-.012],[.13,.03,.03,-.012],[.135,0,0,-.012]],16);
    oval(h,skin,0,-.032,.087,.017,.032,.025);oval(h,skin,0,-.053,.107,.021,.012,.017);
    for(const side of [-1,1]) {
      oval(h,skin,side*.1,-.012,-.006,.016,.03,.019,8);
      oval(h,mat(0x8f8777),side*.041,.01,.078,.019,.006,.004,8);
      oval(h,mat(0x363b31),side*.041,.01,.082,.006,.006,.002,8);
      oval(h,hair,side*.043,.03,.074,.027,.005,.008,8).rotation.z=-side*.12;
      oval(h,skin,side*.055,-.028,.068,.033,.016,.015,8);
    }
    oval(h,mat(0x946c60),0,-.079,.076,.025,.0035,.005,8);oval(h,skin,0,-.096,.061,.03,.013,.014,8);
    const cap=mesh(h,new THREE.SphereGeometry(1,14,7,0,Math.PI*2,0,Math.PI*.56),hair,0,.035,-.017);cap.scale.set(.1,.105,.091);
    for(let i=0;i<3;i++)oval(h,hair,-.058+i*.043,.066,.061,.032,.016,.024,8).rotation.z=-.26;
    if(cfg.beard){form(h,hair,[[-.137,.016,.02,.033],[-.115,.046,.044,.034],[-.082,.068,.048,.026],[-.057,.064,.03,.024]],12);
      oval(h,hair,-.022,-.063,.085,.023,.005,.007,8);oval(h,hair,.022,-.063,.085,.023,.005,.007,8);}
    if(cfg.female){for(const s of [-1,1])oval(h,hair,s*.083,-.02,-.037,.023,.112,.043,8);oval(h,hair,0,.027,-.111,.06,.057,.04);}
    return h;
  }
  function base(cfg) {
    const g=new THREE.Group();g.name=cfg.name;const body=new THREE.Group();g.add(body);g.bodyRoot=body;
    const skin=mat(cfg.skin),cloth=mat(cfg.cloth),leather=mat(0x373026),boot=mat(0x252624),trim=mat(cfg.trim,.35),b=cfg.broad||1;
    g.torso=form(body,cloth,[[.74,.106,.078],[.8,.145,.103],[.89,.128,.093],[.97,.123,.082],[1.09,.17*b,.105],[1.2,.2*b,.1],[1.255,.16*b,.082],[1.28,.065,.053]],14);
    rod(body,skin,[0,1.25,0],[0,1.37,0],.048,.043,10);g.headGroup=head(body,cfg);
    for(const s of [-1,1]) {
      const side=s<0?'left':'right',leg=new THREE.Group();leg.position.set(s*.09,.79,0);body.add(leg);g[side+'Leg']=leg;
      form(leg,mat(cfg.pants||0x37393a),[[0,.074,.08],[-.07,.078,.08],[-.2,.063,.063],[-.32,.047,.05],[-.36,.044,.047]],10);
      const knee=new THREE.Group();knee.position.set(0,-.357,.005);leg.add(knee);g[side+'Knee']=knee;
      form(knee,mat(cfg.pants||0x37393a),[[.02,.045,.048],[-.07,.055,.06],[-.18,.043,.048],[-.31,.03,.034]],10);
      form(knee,boot,[[-.13,.047,.05],[-.22,.039,.041],[-.33,.035,.039]],10);
      oval(knee,boot,0,-.36,.033,.046,.044,.09);
      const arm=new THREE.Group();arm.position.set(s*.205*b,1.217,0);arm.rotation.z=s*.105;body.add(arm);g[side+'Arm']=arm;
      const sleeve=cfg.bareArms?skin:cloth;
      oval(arm,sleeve,0,-.027,0,.063,.077,.066);
      form(arm,sleeve,[[0,.058,.061],[-.09,.059,.059],[-.19,.044,.043],[-.23,.037,.038]],10);
      const elbow=new THREE.Group();elbow.position.set(0,-.23,0);elbow.rotation.x=-.14;arm.add(elbow);g[side+'Elbow']=elbow;
      form(elbow,sleeve,[[.015,.039,.041],[-.065,.043,.044],[-.15,.032,.033],[-.21,.025,.028]],10);
      if(!cfg.bareArms)form(elbow,leather,[[-.11,.035,.036],[-.205,.029,.031]],10);
      oval(elbow,skin,0,-.247,.008,.03,.055,.023);oval(elbow,skin,-s*.024,-.24,.023,.012,.028,.012,8);
      const hand=new THREE.Group();hand.position.set(0,-.245,.025);elbow.add(hand);g[side+'Hand']=hand;
    }
    form(body,leather,[[.865,.14,.105],[.91,.138,.101]],14);box(body,trim,.04,.04,.014,0,.888,.107);
    const shadow=mesh(g,new THREE.CircleGeometry(.27,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.25,depthWrite:false}),0,.015,0);shadow.rotation.x=-Math.PI/2;
    g.animTime=0;g.isMoving=false;g.isAttacking=false;g.attackProgress=0;g.userData.humanModel=true;return g;
  }
  function blade(parent,length=.61) {
    const steel=mat(0x9ca4a5,.75),brass=mat(0xa18b5e,.6),shape=new THREE.Shape();
    shape.moveTo(-.028,0);shape.lineTo(-.032,length*.77);shape.lineTo(0,length);shape.lineTo(.032,length*.77);shape.lineTo(.028,0);shape.closePath();
    mesh(parent,new THREE.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:false}),steel,0,.04,0);
    rod(parent,brass,[-.082,.015,0],[.082,.015,0],.011);rod(parent,mat(0x443125),[0,-.095,0],[0,.01,0],.015);
    oval(parent,brass,0,-.104,0,.022,.019,.019,8);
  }
  function staff(hand) {
    const g=new THREE.Group();hand.add(g);g.position.set(0,.15,.04);rod(g,mat(0x594a38),[0,-.78,0],[0,.65,0],.018,.024);
    const ring=mesh(g,new THREE.TorusGeometry(.075,.011,6,16),mat(0xb6a06e,.5),0,.65,0);
    const crystal=mesh(g,new THREE.OctahedronGeometry(.038),mat(0xabc8ca,.1,0x507f85),0,.65,0);return {g,ring,crystal};
  }
  function lantern(parent,x,y,z) {
    const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);const brass=mat(0x9d824f,.6);
    mesh(g,new THREE.CylinderGeometry(.041,.045,.1,8),mat(0xffd397,0,0xe4a55c));
    mesh(g,new THREE.CylinderGeometry(.057,.05,.022,8),brass,0,-.06,0);mesh(g,new THREE.ConeGeometry(.063,.04,8),brass,0,.07,0);
    mesh(g,new THREE.TorusGeometry(.032,.007,5,10),brass,0,.112,0);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;rod(g,brass,[Math.sin(a)*.046,-.06,Math.cos(a)*.046],[Math.sin(a)*.046,.06,Math.cos(a)*.046],.004);}
    return g;
  }
  function finish(g) {
    const animated=[g.staffCrystal,g.staffRing,g.hammer].filter(Boolean);
    for(const side of ['left','right']){batch(g[side+'Knee']);batch(g[side+'Leg'],[g[side+'Knee']]);batch(g[side+'Elbow'],animated);batch(g[side+'Arm'],[g[side+'Elbow']]);}
    if(g.hammer)batch(g.hammer);batch(g.headGroup);
    batch(g.bodyRoot,[g.leftLeg,g.rightLeg,g.leftArm,g.rightArm,g.headGroup,g.cape,...(g.organicWings||[])].filter(Boolean));return g;
  }
  const heroConfigs={
    warrior:{cloth:0x5b6264,trim:0xb49b6b,skin:0xba9074,hair:0x42352d,broad:1.1,beard:true},
    mage:{cloth:0x41536c,trim:0xc3ae80,skin:0xc6a28b,hair:0x877a69,beard:true},
    rogue:{cloth:0x35463e,trim:0x8fa88e,skin:0xa68169,hair:0x2c2b25},
    archer:{cloth:0x586747,trim:0xb09665,skin:0xc79e80,hair:0x594433}
  };
  function hero(id) {
    const cfg=heroConfigs[id]||heroConfigs.warrior,g=base({...cfg,name:'hero_'+id}),metal=mat(0x969fa2,.7),trim=mat(cfg.trim,.4),cloth=mat(cfg.cloth);
    if(id==='warrior') {
      form(g.bodyRoot,metal,[[.94,.129,.091],[1.03,.15,.112],[1.15,.185,.118],[1.235,.172,.097]],14);
      for(const arm of [g.leftArm,g.rightArm]){const p=mesh(arm,new THREE.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI*.62),metal,0,.01,0);p.scale.set(.098,.1,.1);}
      const helm=mesh(g.headGroup,new THREE.SphereGeometry(1,14,7,0,Math.PI*2,0,Math.PI*.5),metal,0,.044,-.016);helm.scale.set(.108,.114,.097);
      rod(g.headGroup,trim,[-.1,.041,.05],[.1,.041,.05],.008);
      const sword=new THREE.Group();g.rightHand.add(sword);sword.rotation.x=.2;blade(sword);g.weapon=sword;
      const shield=oval(g.leftHand,mat(0x44545a,.4),-.025,.08,.085,.17,.23,.033,12);g.shield=shield;
      oval(g.leftHand,trim,-.025,.08,.115,.045,.05,.012,8);
    }else if(id==='mage') {
      form(g.bodyRoot,cloth,[[.13,.213,.136],[.35,.2,.128],[.6,.164,.115],[.85,.139,.1]],14);
      panel(g.bodyRoot,trim,1.18,.17,.03,.054,.13,.006);
      const s=staff(g.rightHand);g.weapon=s.g;g.staffRing=s.ring;g.staffCrystal=s.crystal;
      box(g.leftHand,mat(0x493d30),.16,.026,.2,0,.03,.03);box(g.leftHand,mat(0xc5baa0),.14,.022,.18,0,.054,.03);g.leftElbow.rotation.x=-.7;
    }else if(id==='rogue') {
      for(const hand of [g.leftHand,g.rightHand]){const d=new THREE.Group();hand.add(d);d.rotation.x=.5;blade(d,.28);if(hand===g.rightHand)g.weapon=d;}
      rod(g.bodyRoot,mat(0x3c3227),[-.13,1.23,.1],[.12,.91,.105],.022);panel(g.bodyRoot,cloth,.87,.48,.25,.29,.11,.012);
    }else {
      const bow=new THREE.Group();g.leftHand.add(bow);bow.position.set(0,.04,.055);
      const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.07,-.44,0),new THREE.Vector3(-.045,-.28,0),new THREE.Vector3(0,0,0),new THREE.Vector3(-.045,.28,0),new THREE.Vector3(.07,.44,0)]);
      mesh(bow,new THREE.TubeGeometry(curve,16,.014,6,false),mat(0x715535));rod(bow,mat(0xb9ad8c),[.07,-.44,0],[.07,.44,0],.0025);g.weapon=bow;
      rod(g.bodyRoot,mat(0x4d4030),[-.13,1.23,.11],[.12,.91,.105],.021);rod(g.bodyRoot,mat(0x5e4d38),[.12,.85,-.14],[.17,1.25,-.15],.06,.067);
      for(let i=0;i<3;i++)rod(g.bodyRoot,mat(0xb2a07c),[.13+i*.02,1.1,-.15],[.16+i*.02,1.42,-.15],.004);
    }
    g.cape=panel(g.bodyRoot,mat(id==='warrior'?0x75483f:id==='mage'?0x35435a:0x3d4737),1.25,id==='mage'?.24:.62,.26,.37,-.115,.022);
    g.lantern=lantern(g.bodyRoot,-.16,.82,.13);const light=new THREE.PointLight(0xffb467,2.5,13.5,1.7);light.position.set(-.16,.85,.16);g.bodyRoot.add(light);g.lanternLight=light;
    const ring=mesh(g,new THREE.RingGeometry(.28,.3,24),new THREE.MeshBasicMaterial({color:cfg.trim,transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false}),0,.025,0);ring.rotation.x=-Math.PI/2;g.heroRing=ring;
    return finish(g);
  }
  function npc(type='kaelen_smith') {
    const kind=/eloria|alchemist/.test(type)?'alchemist':/valen|lorekeeper/.test(type)?'lorekeeper':/malakor|shade/.test(type)?'shade':'smith';
    const cfg={smith:{cloth:0x6a5d4a,trim:0xa27b53,skin:0xb68e72,hair:0x554a3e,broad:1.14,beard:true,bareArms:true},
      alchemist:{cloth:0x597568,trim:0xbba984,skin:0xc8a38e,hair:0x64432e,female:true},
      lorekeeper:{cloth:0x4a6078,trim:0xbab096,skin:0xb19988,hair:0xada99f,beard:true},
      shade:{cloth:0x424654,trim:0x9b9eac,skin:0xa49a91,hair:0x433e3c}}[kind];
    const g=base({...cfg,name:'npc_'+type}),cloth=mat(cfg.cloth),trim=mat(cfg.trim),dark=mat(0x35332d);
    if(kind==='smith') {
      panel(g.bodyRoot,mat(0x805c41),1.13,.4,.23,.28,.124,.01);for(const s of [-1,1])rod(g.bodyRoot,trim,[s*.11,1.25,.066],[s*.09,1.08,.128],.012);
      const hammer=new THREE.Group();g.rightHand.add(hammer);rod(hammer,dark,[0,-.08,0],[0,.26,0],.016);box(hammer,mat(0x80817a,.6),.19,.08,.08,0,.26,0);g.hammer=hammer;g.rightElbow.rotation.x=-.45;
      const anvil=new THREE.Group();anvil.position.set(.45,0,.18);g.add(anvil);box(anvil,dark,.28,.075,.24,0,.045,0);box(anvil,mat(0x6f716a,.5),.13,.22,.14,0,.18,0);box(anvil,mat(0x7d8079,.6),.31,.085,.18,0,.33,0);rod(anvil,mat(0x7d8079,.6),[-.14,.33,0],[-.3,.33,0],.06,.006);batch(anvil);
    }else if(kind==='alchemist') {
      form(g.bodyRoot,cloth,[[.13,.205,.132],[.4,.185,.118],[.68,.15,.103],[.86,.137,.098]],14);
      for(const s of [-1,1]){oval(g.bodyRoot,mat(s<0?0x91afa3:0xb0926b),s*.11,.81,.126,.026,.036,.026,8);rod(g.bodyRoot,trim,[s*.11,.84,.126],[s*.11,.868,.126],.009);}
      g.leftElbow.rotation.x=-.65;oval(g.leftHand,mat(0x91b5a5,.1),0,.018,.027,.032,.046,.032);rod(g.leftHand,trim,[0,.053,.027],[0,.078,.027],.011);
      oval(g.bodyRoot,mat(0x796247),.158,.91,-.105,.068,.11,.053);rod(g.bodyRoot,trim,[-.135,1.24,.07],[.16,.91,.08],.012);
    }else if(kind==='lorekeeper') {
      form(g.bodyRoot,cloth,[[.12,.216,.135],[.4,.194,.125],[.7,.157,.108],[.85,.137,.098]],14);
      for(const s of [-1,1])panel(g.bodyRoot,trim,1.19,.17,.027,.04,.133,.004).position.x=s*.082;
      g.leftElbow.rotation.x=-.95;box(g.leftHand,dark,.24,.025,.18,0,.024,.04);box(g.leftHand,mat(0xc7bfa7),.22,.021,.16,0,.048,.04);g.weapon=staff(g.rightHand).g;
    }else {
      g.cape=panel(g.bodyRoot,cloth,1.27,.21,.33,.47,-.11,.022);
      const hood=mesh(g.headGroup,new THREE.SphereGeometry(1,14,9,Math.PI*.8,Math.PI*1.4),cloth,0,.015,-.012);hood.scale.set(.124,.155,.112);
      form(g.bodyRoot,cloth,[[.13,.205,.13],[.47,.168,.114],[.85,.139,.105]],14);lantern(g.leftHand,0,-.15,.035);g.leftElbow.rotation.x=-.25;
    }
    g.phylactery=mesh(g,new THREE.OctahedronGeometry(.043),trim,0,1.72,0);return finish(g);
  }
  const animate=GameModels.updateAnimation;
  // Shared construction primitives for the bestiary; materials stay cached across floors.
  GameModels.anatomy={mat,mesh,oval,form,rod,panel,batch,base,finish,blade,staff};
  GameModels.createHero=hero;GameModels.createNPC=npc;
  GameModels.updateAnimation=function(g,delta,time) {
    animate(g,delta,time);
    if(!g?.userData.humanModel||!g.visible||(window.GamePresentation&&!GamePresentation.settings.motion))return;
    const t=g.animTime||0,gait=Math.sin(t*9);
    g.leftLeg.rotation.x=g.isMoving?gait*.33:0;g.rightLeg.rotation.x=g.isMoving?-gait*.33:0;
    g.leftKnee.rotation.x=g.isMoving?Math.max(0,-gait)*.48:.025;g.rightKnee.rotation.x=g.isMoving?Math.max(0,gait)*.48:.025;
    g.bodyRoot.position.y=g.isMoving?Math.abs(gait)*.014:Math.sin(t*2)*.005;
    if(g.cape)g.cape.rotation.x=g.isMoving?.075+Math.abs(gait)*.04:Math.sin(t*1.5)*.01;
  };
})();

