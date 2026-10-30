/* One complete image per class: connected weapons must never be split in half. */
window.FpsHands=(()=>{
  const el=document.createElement('div');el.id='fpsHands';el.setAttribute('aria-hidden','true');document.body.append(el);
  const picture=document.createElement('img');picture.alt='';picture.draggable=false;el.append(picture);
  const classes=['warrior','mage','rogue','archer'];let current='',until=0;
  let attackKind='warrior';
  let previousTime=performance.now(),lastPosition=null,phase=0,walkWeight=0,stepUntil=0;
  const walkProfiles={warrior:{x:7,y:6,r:.9},mage:{x:6,y:4,r:.65},rogue:{x:9,y:5,r:1.1},archer:{x:5,y:3.5,r:.5}};
  const attackProfiles={warrior:{x:-35,y:-20,r:-12,s:.04},mage:{x:0,y:-26,r:3,s:.09},rogue:{x:5,y:-50,r:-5,s:.08},archer:{x:0,y:12,r:2,s:-.035}};
  function swing(){if(GamePresentation.settings.motion){attackKind=current;until=performance.now()+440;}}
  const use=GameCombat.CombatManager.prototype.useSkill;
  GameCombat.CombatManager.prototype.useSkill=function(attacker,target,skill){const result=use.call(this,attacker,target,skill);if(result&&attacker?.isPlayer){swing();if(window.GameAttack)GameAttack.play(this,attacker,target,skill);}return result;};
  const moveUnit=GameCombat.CombatManager.prototype.moveUnit;
  GameCombat.CombatManager.prototype.moveUnit=function(unit,gx,gz){const distance=Math.abs(unit.gx-gx)+Math.abs(unit.gz-gz),result=moveUnit.call(this,unit,gx,gz);if(result&&distance&&unit.isPlayer&&GamePresentation.settings.motion)stepUntil=performance.now()+360;return result;};
  function update(id,show,moving,time,modal,position){
    const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-previousTime)/1000));previousTime=now;
    let distance=0;if(position){if(lastPosition){distance=Math.hypot(position.x-lastPosition.x,position.z-lastPosition.z);lastPosition.x=position.x;lastPosition.z=position.z;}else lastPosition={x:position.x,z:position.z};}
    el.hidden=!show;el.style.opacity=modal?'.2':'1';if(id!==current){current=classes.includes(id)?id:'warrior';el.dataset.class=current;picture.src='assets/fps-'+current+'.webp';walkWeight=0;phase=0;distance=0;stepUntil=0;}
    const motion=GamePresentation.settings.motion&&show&&!modal;
    const walking=motion&&moving&&distance>0&&distance<.6,speed=walking?Math.min(1,distance/Math.max(dt,.001)/2.7):0,stepping=motion&&now<stepUntil;
    const target=walking?speed:stepping?.85:0;
    walkWeight=motion?walkWeight+(target-walkWeight)*(1-Math.exp(-dt*(target>walkWeight?12:9))):0;
    if(walking)phase+=distance*4.2;else if(stepping)phase+=dt*10;
    const profile=walkProfiles[current]||walkProfiles.warrior,sway=Math.sin(phase)*profile.x*walkWeight,bob=(1-Math.cos(phase*2))*profile.y*walkWeight,roll=Math.sin(phase)*profile.r*walkWeight;
    const attack=motion?Math.max(0,(until-now)/440):0,force=Math.sin(attack*Math.PI);
    const move=attackProfiles[attackKind]||attackProfiles.warrior;
    el.style.transform='translateX(-50%) translate('+(sway+force*move.x)+'px,'+(bob+force*move.y)+'px) rotate('+(roll+force*move.r)+'deg) scale('+(1+force*move.s+walkWeight*Math.cos(phase*2)*.003)+')';
  }
  return {update,swing};
})();
