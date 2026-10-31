/* Anatomical creatures: articulated limbs, curved shells, ribs and wing membranes.
 * No textures, extra lights, animation timers or external model loaders. */
(function () {
  'use strict';
  const A=GameModels.anatomy,{mat,mesh,oval,form,rod,panel,batch}=A;
  const V=(p)=>new THREE.Vector3(...p);
  function sweep(parent,m,points,radii,segments=12,sides=7) {
    const curve=new THREE.CatmullRomCurve3(points.map(V));
    const geo=new THREE.TubeGeometry(curve,segments,1,sides,false),p=geo.attributes.position;
    for(let row=0;row<=segments;row++) {
      const t=row/segments,center=curve.getPointAt(t),r=t*(radii.length-1),i=Math.min(Math.floor(r),radii.length-2),f=r-i;
      const radius=radii[i]*(1-f)+radii[i+1]*f;
      for(let c=0;c<=sides;c++){const index=row*(sides+1)+c;const q=new THREE.Vector3().fromBufferAttribute(p,index).sub(center).multiplyScalar(radius).add(center);p.setXYZ(index,q.x,q.y,q.z);}
    }
    geo.computeVertexNormals();geo.computeBoundingSphere();return mesh(parent,geo,m);
  }
  function fresh(type,isBoss) {
    const g=new THREE.Group(),body=new THREE.Group();g.name='monster_'+type;g.isBoss=isBoss;g.bodyRoot=body;g.add(body);
    g.animTime=0;g.userData.organicCreature=type;g.userData.limbs=[];
    const shadow=mesh(g,new THREE.CircleGeometry(isBoss?.65:.34,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.25,depthWrite:false}),0,.015,0);shadow.rotation.x=-Math.PI/2;
    return g;
  }
  function eye(parent,x,y,z,r=.022,color=0xa8844b) {
    oval(parent,mat(0x1e1815),x,y,z,r*1.3,r,.009,8);oval(parent,mat(color,.05,color),x,y,z+.006,r*.52,r*.72,.004,8);
  }
  function claw(parent,a,b,width=.022) {return rod(parent,mat(0xc1b69a),a,b,width,.001,6);}
  function limb(g,origin,points,radii,m,phase=0) {
    const joint=new THREE.Group();joint.position.copy(V(origin));g.bodyRoot.add(joint);sweep(joint,m,points,radii,8,7);
    g.userData.limbs.push({joint,phase});return joint;
  }
  function skull(parent,x,y,z,scale=1,glow=0x86a9aa) {
    const h=new THREE.Group();h.position.set(x,y,z);h.scale.setScalar(scale);parent.add(h);
    const bone=mat(0xbeb7a4),cavity=mat(0x252829);
    oval(h,bone,0,.025,-.008,.092,.117,.08,12);
    oval(h,bone,0,-.047,.035,.074,.052,.066,10);
    for(const s of [-1,1]){
      oval(h,cavity,s*.039,.014,.062,.029,.028,.015,8);eye(h,s*.039,.011,.075,.011,glow);
      oval(h,bone,s*.069,-.035,.047,.026,.025,.027,8);
    }
    oval(h,cavity,0,-.035,.091,.012,.022,.007,8);
    sweep(h,bone,[[-.064,-.055,.04],[-.055,-.102,.052],[0,-.113,.07],[.055,-.102,.052],[.064,-.055,.04]],[.013,.014,.013],10,6);
    for(let i=0;i<7;i++)rod(h,bone,[(i-3)*.013,-.057,.087],[(i-3)*.013,-.084,.087],.006,.005,5);
    return h;
  }
  function crown(parent,y,color=0xab9060) {
    const m=mat(color,.65);const ring=mesh(parent,new THREE.TorusGeometry(.105,.014,6,14),m,0,y,0);ring.rotation.x=Math.PI/2;
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;rod(parent,m,[Math.sin(a)*.103,y,Math.cos(a)*.103],[Math.sin(a)*.12,y+.09+(i%2)*.025,Math.cos(a)*.12],.018,.002,6);}
  }
  function batWing(parent,side,size,m,bone) {
    const g=new THREE.Group();g.position.set(side*.25,.98,-.1);parent.add(g);g.scale.set(size,size,size);
    const root=[0,0,0],elbow=[side*.42,.35,-.08],tips=[[side*1.15,.63,-.05],[side*1.29,.12,-.34],[side*.96,-.18,-.58],[side*.48,-.25,-.55]];
    sweep(g,bone,[root,elbow,tips[0]],[.055,.032,.006],10,7);
    for(let i=1;i<tips.length;i++)sweep(g,bone,[elbow,[side*(.52+i*.07),.12-i*.04,-.2],tips[i]],[.025,.016,.004],8,6);
    const p=[],idx=[],edge=[tips[0],tips[1],tips[2],tips[3],[0,-.2,-.24]],rows=4,cols=6;
    for(let j=0;j<edge.length-1;j++){
      const start=p.length/3,hinge=V(elbow);
      for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){
        const u=c/cols,v=r/rows,boundary=V(edge[j]).lerp(V(edge[j+1]),u);
        // Recessed trailing edges and a shallow curved web between each wing finger.
        boundary.lerp(hinge,Math.sin(u*Math.PI)*.18);
        const point=hinge.clone().lerp(boundary,v);point.y-=Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*.045;
        p.push(point.x,point.y,point.z);
        if(r&&c){const n=start+r*(cols+1)+c;idx.push(n,n-1,n-cols-2,n,n-cols-2,n-cols-1);}
      }
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();m.side=THREE.DoubleSide;mesh(g,geo,m);
    batch(g);return g;
  }
  function rat(g) {
    const b=g.bodyRoot,fur=mat(0x625446),skin=mat(0x947668);
    oval(b,fur,0,.32,-.09,.23,.25,.4,12);oval(b,fur,0,.29,.24,.16,.17,.23,12);
    oval(b,fur,0,.22,.44,.105,.085,.16);oval(b,mat(0x342c2a),0,.22,.575,.043,.029,.024,8);
    for(const s of [-1,1]){
      const ear=oval(b,skin,s*.13,.43,.29,.075,.09,.022);ear.rotation.z=-s*.35;
      oval(b,fur,s*.14,.415,.27,.077,.085,.025);eye(b,s*.116,.315,.385,.026,0xb09455);
      for(const z of [-.27,.23]){const leg=limb(g,[s*.15,.24,z],[[0,0,0],[s*.06,-.09,-.04],[s*.06,-.2,.04]],[.065,.035,.019],fur,z<0?Math.PI:0);
        oval(leg,skin,s*.06,-.205,.075,.035,.022,.07,8);for(let i=0;i<3;i++)claw(leg,[s*.06+(i-1)*.017,-.205,.12],[s*.06+(i-1)*.019,-.212,.151],.007);}
      for(let i=0;i<2;i++)rod(b,mat(0xb0a58c),[s*.07,.225,.49],[s*(.23+i*.025),.24-i*.025,.49-i*.045],.002);
    }
    g.organicTail=new THREE.Group();g.organicTail.position.set(0,.28,-.42);b.add(g.organicTail);
    sweep(g.organicTail,skin,[[0,0,0],[.1,-.07,-.18],[.22,-.12,-.42],[.12,-.14,-.64]],[.04,.026,.012,.002],15,7);
  }
  function spider(g) {
    const b=g.bodyRoot,shell=mat(0x38313e,.15),joints=mat(0x625362);
    oval(b,shell,0,.38,-.2,.25,.24,.32,12);oval(b,mat(0x534451,.1),0,.34,.17,.18,.15,.19,12);
    for(const s of [-1,1])for(let i=0;i<4;i++){
      const z=.26-i*.145,spread=.5+Math.sin(i/3*Math.PI)*.16;
      const leg=limb(g,[s*.14,.35,z],[[0,0,0],[s*.2,.13,(1.5-i)*.08],[s*spread,.08,(1.5-i)*.18],[s*(spread+.09),-.32,(1.5-i)*.23]],[.032,.033,.018,.003],shell,i*Math.PI+s);
      oval(leg,joints,s*.2,.13,(1.5-i)*.08,.037,.037,.037,8);
    }
    for(const x of [-.085,-.028,.028,.085])eye(b,x,.37,.332,.018,0x9c8b69);
    for(const s of [-1,1])sweep(b,mat(0x978f76),[[s*.07,.28,.31],[s*.1,.2,.4],[s*.035,.15,.42]],[.028,.022,.001],7,6);
  }
  function skeleton(g,lich=false) {
    const b=g.bodyRoot,bone=mat(0xbcb5a1),dark=mat(0x3b4348,.2);
    sweep(b,bone,[[0,.67,0],[0,.93,-.025],[0,1.2,-.015],[0,1.35,0]],[.025,.027,.022,.018],12,7);
    const pelvis=mesh(b,new THREE.TorusGeometry(.11,.024,6,12),bone,0,.74,0);pelvis.scale.set(1,.6,.75);
    for(const s of [-1,1]){
      rod(b,bone,[0,1.22,0],[s*.19,1.21,0],.023,.018);
      for(let i=0;i<5;i++){
        const y=1.17-i*.057,w=.15-i*.011;
        sweep(b,bone,[[0,y,-.04],[s*w,y-.015,-.01],[s*w,y-.035,.08],[s*.03,y-.04,.1]],[.011,.012,.008],9,6);
      }
      const leg=limb(g,[s*.085,.73,0],[[0,0,0],[s*.025,-.31,.015],[s*.015,-.63,-.015]],[.027,.021,.017],bone,s<0?0:Math.PI);
      oval(leg,bone,s*.025,-.31,.017,.033,.034,.032,8);oval(leg,bone,s*.015,-.65,.043,.038,.027,.08,8);
      const arm=limb(g,[s*.19,1.2,0],[[0,0,0],[s*.055,-.23,.02],[s*.07,-.43,.09]],[.023,.019,.014],bone,s<0?Math.PI:0);
      for(let f=0;f<3;f++)sweep(arm,bone,[[s*.07+(f-1)*.016,-.42,.09],[s*.07+(f-1)*.02,-.49,.105],[s*.07+(f-1)*.018,-.51,.13]],[.007,.005,.002],5,5);
    }
    g.creatureHead=skull(b,0,1.42,0,1,lich?0x8cae97:0x869fac);
    if(lich){
      const robe=mat(0x34403e);form(b,robe,[[.12,.24,.15],[.4,.19,.13],[.65,.155,.11],[.8,.13,.095]],14);
      g.creatureCape=panel(b,robe,1.23,.15,.32,.48,-.115,.025);crown(g.creatureHead,.12,0x8c9b75);
      g.phylactery=mesh(b,new THREE.IcosahedronGeometry(.09,0),mat(0xa7c0a7,0,0x4e8f69),0,1.9,0);
      const staff=mat(0x777862);sweep(b,staff,[[.33,.12,.11],[.33,.95,.11],[.36,1.62,.11],[.27,1.7,.11]],[.025,.023,.018],12,7);
    }else{
      oval(b,dark,-.21,1.22,-.01,.11,.06,.1);
      rod(b,mat(0x67513a),[.32,.12,.12],[.32,1.55,.12],.018);
      claw(b,[.32,1.54,.12],[.32,1.76,.12],.05);
      const shield=mesh(b,new THREE.SphereGeometry(1,10,7),dark,-.3,.9,.17);shield.scale.set(.15,.2,.025);
    }
  }
  function troll(g) {
    const b=g.bodyRoot,skin=mat(0x68745a),horn=mat(0xb6ad8e),leather=mat(0x5d4b36);
    form(b,skin,[[.49,.19,.15],[.68,.32,.23,.02],[.9,.37,.25],[1.13,.34,.24,-.06],[1.3,.26,.2,-.1]],14);
    oval(b,skin,0,1.3,.08,.21,.22,.2,12);oval(b,skin,0,1.19,.22,.19,.12,.14,12);
    oval(b,skin,0,1.31,.29,.07,.09,.075);oval(b,mat(0x404835),0,1.17,.336,.115,.015,.011,8);
    for(const s of [-1,1]){
      oval(b,skin,s*.2,1.34,.03,.085,.045,.048,8).rotation.z=s*.4;eye(b,s*.091,1.35,.262,.027,0xbba26c);
      sweep(b,horn,[[s*.13,1.15,.29],[s*.15,1.22,.36],[s*.12,1.3,.34]],[.032,.022,.002],8,6);
      const leg=limb(g,[s*.19,.6,-.01],[[0,0,0],[s*.055,-.25,.07],[s*.04,-.49,.02]],[.14,.09,.065],skin,s<0?0:Math.PI);
      oval(leg,skin,s*.04,-.52,.09,.09,.065,.14);for(let i=0;i<3;i++)claw(leg,[s*.04+(i-1)*.045,-.53,.18],[s*.04+(i-1)*.045,-.54,.23],.016);
      const arm=limb(g,[s*.3,1.14,-.03],[[0,0,0],[s*.2,-.24,.02],[s*.2,-.55,.17]],[.16,.12,.075],skin,s<0?Math.PI:0);
      oval(arm,skin,s*.2,-.57,.17,.095,.12,.07);for(let i=0;i<3;i++)sweep(arm,skin,[[s*.2+(i-1)*.048,-.6,.19],[s*.2+(i-1)*.05,-.72,.21],[s*.2+(i-1)*.04,-.74,.26]],[.025,.022,.009],6,6);
    }
    panel(b,leather,.69,.36,.47,.39,.23,.014);form(b,leather,[[.67,.326,.237],[.73,.337,.24]],14);
    for(let i=0;i<4;i++)oval(b,mat(0x505a48),-.22+i*.14,1.22,-.13,.06,.055,.07,8);
  }
  function ghost(g) {
    const b=g.bodyRoot,cloth=mat(0x667b7b,0,0x243e40);
    form(b,cloth,[[.18,.008,.009,-.04],[.32,.16,.1],[.6,.24,.15],[.95,.18,.11],[1.2,.16,.1],[1.32,.1,.08]],16);
    const face=skull(b,0,1.39,.01,1,0x91beb9);
    const hood=mesh(b,new THREE.SphereGeometry(1,14,8,Math.PI*.8,Math.PI*1.4),cloth,0,1.4,-.005);hood.scale.set(.145,.185,.13);cloth.side=THREE.DoubleSide;
    for(const s of [-1,1]){const arm=limb(g,[s*.15,1.19,0],[[0,0,0],[s*.16,-.18,.02],[s*.23,-.32,.1]],[.085,.065,.025],cloth,s);
      for(let i=0;i<3;i++)sweep(arm,mat(0xa1ada1),[[s*.23+(i-1)*.018,-.31,.1],[s*.25+(i-1)*.02,-.42,.15]],[.009,.001],5,5);}
    g.userData.floats=true;
  }
  function dragon(g) {
    const b=g.bodyRoot,skin=mat(0x775345),belly=mat(0xa08b67),horn=mat(0xaaa18a),membrane=mat(0x684b43);
    oval(b,skin,0,.73,-.1,.34,.38,.59,14);oval(b,belly,0,.57,.03,.255,.22,.45,12);
    sweep(b,skin,[[0,.85,.25],[0,1.12,.46],[0,1.43,.52],[0,1.52,.72]],[.24,.19,.115,.13],14,10);
    oval(b,skin,0,1.52,.77,.18,.16,.24,12);
    const muzzle=new THREE.Group();muzzle.position.set(0,1.46,.85);muzzle.rotation.x=Math.PI/2;b.add(muzzle);
    form(muzzle,skin,[[0,.14,.09],[.13,.125,.075],[.27,.105,.054],[.34,.09,.043],[.35,.03,.022]],12);
    oval(b,mat(0x322823),0,1.405,1.02,.135,.013,.2);oval(b,belly,0,1.38,1.01,.13,.04,.19);
    for(const s of [-1,1]){
      eye(b,s*.148,1.56,.88,.025,0xbca45c);
      sweep(b,skin,[[s*.12,1.615,.76],[s*.17,1.598,.85],[s*.14,1.574,.94]],[.035,.029,.014],7,7);
      oval(b,mat(0x2b2623),s*.065,1.492,1.176,.019,.01,.008,8);
      sweep(b,horn,[[s*.12,1.62,.68],[s*.19,1.82,.54],[s*.2,1.89,.4]],[.047,.025,.001],9,7);
      for(let i=0;i<4;i++)claw(b,[s*.11,1.415,.9+i*.067],[s*.105,1.37,.91+i*.067],.011);
      for(const z of [-.4,.32]){
        const leg=limb(g,[s*.26,.7,z],[[0,0,0],[s*.16,-.2,-.09],[s*.12,-.46,.01],[s*.18,-.61,.12]],[.12,.095,.05,.035],skin,z<0?Math.PI:0);
        oval(leg,skin,s*.18,-.62,.15,.065,.045,.105);for(let i=0;i<3;i++)claw(leg,[s*.18+(i-1)*.035,-.63,.2],[s*.18+(i-1)*.04,-.65,.31],.018);
      }
    }
    g.organicTail=new THREE.Group();g.organicTail.position.set(0,.75,-.5);b.add(g.organicTail);
    sweep(g.organicTail,skin,[[0,0,0],[.1,-.12,-.4],[.28,-.33,-.83],[.46,-.42,-1.1]],[.2,.115,.045,.002],18,9);
    for(let i=0;i<6;i++)claw(b,[0,1.03-i*.06,.2-i*.16],[0,1.22-i*.075,.15-i*.16],.045-i*.004);
    g.organicWings=[batWing(b,-1,1,membrane,skin),batWing(b,1,1,membrane,skin)];
  }
  function mimic(g) {
    const b=g.bodyRoot,shell=mat(0x65503c),gum=mat(0x694940),ivory=mat(0xbdb397);
    // A rounded carapace opens into a living mouth; no rectangular chest body.
    oval(b,shell,0,.23,-.02,.34,.21,.27,14);oval(b,mat(0x272123),0,.38,.04,.29,.04,.22,12);
    const jaw=new THREE.Group();jaw.position.set(0,.43,-.2);b.add(jaw);g.organicJaw=jaw;
    oval(jaw,shell,0,.18,.08,.35,.26,.15,14);oval(jaw,gum,0,.135,.197,.29,.2,.025,12);
    oval(jaw,mat(0x292124),0,.13,.219,.25,.155,.012,12);
    for(let i=0;i<8;i++){const x=(i-3.5)*.065,y=.28-Math.abs(x)*.22;
      claw(jaw,[x,y,.235],[x,y-.09,.255],.019);claw(b,[x,.36,.21],[x,.45,.23],.018);}
    for(const s of [-1,1]){
      eye(jaw,s*.15,.25,.219,.025,0xa9a069);
      for(const z of [-.16,.14])limb(g,[s*.25,.21,z],[[0,0,0],[s*.16,-.04,.04],[s*.2,-.18,.1]],[.047,.033,.004],gum,z*7);
    }
    g.organicTongue=new THREE.Group();g.organicTongue.position.set(0,.37,.11);b.add(g.organicTongue);
    sweep(g.organicTongue,mat(0x986779),[[0,0,0],[0,.03,.21],[.1,-.09,.38],[.11,-.16,.52]],[.055,.04,.023,.003],14,8);
    for(let i=0;i<3;i++)sweep(b,mat(0x8b7d59,.25),[[-.3,.2,-.14+i*.13],[-.2,.38,-.14+i*.13],[0,.43,-.14+i*.13],[.2,.38,-.14+i*.13],[.3,.2,-.14+i*.13]],[.014,.018,.014],12,6);
  }
  function humanoid(type,isBoss) {
    const cfg={vampire:{cloth:0x643e42,trim:0xa39179,skin:0xb8ada3,hair:0x333033},
      dark_king:{cloth:0x3f4d5b,trim:0x98a8ad,skin:0x939e9d,hair:0x555958,beard:true,broad:1.08},
      sorcerer:{cloth:0x63536c,trim:0xb3a27b,skin:0xb19b89,hair:0x8c8174,beard:true},
      emperor:{cloth:0x41434b,trim:0xb6a06d,skin:0x998e80,hair:0x45413c,broad:1.1}}[type];
    const g=A.base({...cfg,name:'monster_'+type}),b=g.bodyRoot;g.isBoss=isBoss;g.userData.organicCreature=type;
    const metal=mat(type==='vampire'?0x775255:0x5d6871,.6),trim=mat(cfg.trim,.55),cloth=mat(cfg.cloth);
    if(type==='sorcerer') {
      form(b,cloth,[[.12,.23,.14],[.4,.2,.13],[.68,.16,.11],[.86,.14,.1]],14);
      for(const s of [-1,1])panel(b,trim,1.19,.17,.025,.04,.132,.006).position.x=s*.075;
      const staff=A.staff(g.rightHand);g.staffRing=staff.ring;g.staffCrystal=staff.crystal;g.weapon=staff.g;g.leftElbow.rotation.x=-.6;
      const orb=oval(g.leftHand,mat(0xb3a4bd,0,0x655073),0,.1,.03,.045,.045,.045,10);
      mesh(b,new THREE.TorusGeometry(.27,.012,6,24),trim,0,1.42,-.15);
    }else{
      form(b,metal,[[.94,.13,.095],[1.04,.16,.115],[1.16,.185,.12],[1.24,.165,.095]],14);
      for(const arm of [g.leftArm,g.rightArm]){const p=mesh(arm,new THREE.SphereGeometry(1,12,7,0,Math.PI*2,0,Math.PI*.65),metal,0,.012,0);p.scale.set(.105,.09,.11);}
      const sword=new THREE.Group();g.rightHand.add(sword);sword.rotation.x=.22;A.blade(sword,type==='vampire'?.64:.86);g.weapon=sword;
      if(type==='vampire'){
        for(const s of [-1,1])claw(g.headGroup,[s*.022,-.071,.084],[s*.021,-.096,.087],.007);
        form(b,cloth,[[1.23,.1,.09],[1.34,.14,.12]],12);g.headGroup.rotation.y=-.08;
      }else crown(g.headGroup,.13,type==='emperor'?0xb39b60:0x94a2a5);
      if(type==='emperor'){
        mesh(b,new THREE.OctahedronGeometry(.045),mat(0xd0ba7f,0,0x9c6b3b),0,1.12,.125);
        mesh(b,new THREE.TorusGeometry(.39,.016,6,26),trim,0,1.35,-.19);
        g.organicWings=[batWing(b,-1,.7,mat(0x494650),metal),batWing(b,1,.7,mat(0x494650),metal)];
      }
    }
    g.cape=panel(b,mat(type==='vampire'?0x54333b:type==='sorcerer'?0x463e51:0x343b48),1.26,.21,.29,.47,-.12,.023);
    A.finish(g);
    if(isBoss)g.scale.setScalar(type==='emperor'?1.28:1.18);return g;
  }
  function create(type,isBoss=false) {
    if(['vampire','dark_king','sorcerer','emperor'].includes(type))return humanoid(type,isBoss);
    const g=fresh(type,isBoss);
    const build={rat,spider,skeleton,troll,ghost,dragon,mimic,lich:g=>skeleton(g,true)}[type];
    if(!build)throw new Error('Unknown creature model: '+type);build(g);
    const animated=[...g.userData.limbs.map(l=>l.joint),g.organicTail,g.organicTongue,g.organicJaw,g.creatureCape,g.phylactery,...(g.organicWings||[])].filter(Boolean);
    animated.forEach(part=>{if(part.isGroup)batch(part);});batch(g.bodyRoot,animated);
    if(isBoss&&type!=='dragon')g.scale.setScalar(type==='lich'?1.16:1.08);
    return g;
  }
  const animate=GameModels.updateAnimation;
  GameModels.createMonster=create;
  GameModels.updateAnimation=function(g,delta,time) {
    animate(g,delta,time);
    if(!g?.userData.organicCreature||!g.visible||!GamePresentation.settings.motion)return;
    const t=g.animTime||0;
    for(const {joint,phase} of g.userData.limbs||[])joint.rotation.x=Math.sin(t*(g.isMoving?8:1.5)+phase)*(g.isMoving?.13:.012);
    if(g.organicTail)g.organicTail.rotation.y=Math.sin(t*1.8)*.09;
    if(g.organicWings)g.organicWings.forEach((w,i)=>{w.rotation.z=(i===0?1:-1)*(.04+Math.sin(t*2.1)*.07);});
    if(g.organicJaw)g.organicJaw.rotation.x=Math.sin(t*2)*.035;
    if(g.organicTongue)g.organicTongue.rotation.y=Math.sin(t*2.4)*.1;
    if(g.userData.floats)g.bodyRoot.position.y=.035+Math.sin(t*1.8)*.035;
    if(g.phylactery&&g.userData.organicCreature==='lich')g.phylactery.position.y=1.9+Math.sin(t*2)*.04;
  };
})();

