/* One small canvas, at most four attacks, no extra WebGL lights or textures. */
window.GameAttack=(()=>{
 const canvas=document.createElement('canvas');canvas.id='fpsAttackEffects';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);const ctx=canvas.getContext('2d');const active=[];let wasDrawing=false;
 function resize(){canvas.width=Math.min(720,innerWidth);canvas.height=Math.round(canvas.width*innerHeight/innerWidth);}resize();window.addEventListener('resize',resize);
 function play(combat,attacker,target,skill){
  if(!attacker?.isPlayer)return;
  let x=.5,y=.5;const self=skill.type==='self'||target===attacker;
  if(!self&&target?.model&&combat.cameraRef){const height=target.model.bodyRoot?.geometry?.parameters?.height||1.6;const p=target.model.position.clone();p.y+=height*(target.model.scale.y||1)*.55;p.project(combat.cameraRef);if(p.z>=-1&&p.z<=1){x=(p.x+1)/2;y=(1-p.y)/2;}}
  if(active.length>=4)active.shift();active.push({classId:attacker.classId||combat.inventory.heroClassId,elapsed:0,duration:GamePresentation.settings.motion?.48:.15,x,y,self,color:/frost|ice/.test(skill.id)?'#b7d4e0':/poison|snare/.test(skill.id)?'#a3b882':'#e17851'});
 }
 function line(x1,y1,x2,y2,color,width,alpha){ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
 function update(delta,visible=true){
  if(!active.length&&!wasDrawing)return;ctx.clearRect(0,0,canvas.width,canvas.height);wasDrawing=active.length>0;
  const w=canvas.width,h=canvas.height;
  for(let i=active.length-1;i>=0;i--){const a=active[i];a.elapsed+=delta;const p=Math.min(1,a.elapsed/a.duration),x=a.x*w,y=a.y*h,motion=GamePresentation.settings.motion;
   if(visible){
    if(a.self){ctx.globalAlpha=(1-p)*.45;ctx.strokeStyle=a.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(w*.5,h*.78,30+p*35,8+p*12,0,0,Math.PI*2);ctx.stroke();}
    else if(motion){
     const t=Math.min(1,p/.58),fade=Math.max(0,1-p);
     if(a.classId==='mage'||a.classId==='archer'){
      const sx=w*(a.classId==='mage'?.68:.55),sy=h*.83,px=sx+(x-sx)*t,py=sy+(y-sy)*t,dx=x-sx,dy=y-sy,len=Math.max(1,Math.hypot(dx,dy)),trail=a.classId==='mage'?14:24;
      line(px-dx/len*trail,py-dy/len*trail,px,py,a.classId==='mage'?a.color:'#d8c5a2',a.classId==='mage'?3:1,fade);
      if(a.classId==='mage'){ctx.globalAlpha=fade;ctx.fillStyle='#ffe5b4';ctx.fillRect(px-2,py-2,4,4);}else{const angle=Math.atan2(dy,dx);line(px,py,px-Math.cos(angle-.5)*6,py-Math.sin(angle-.5)*6,'#ddd0b7',1,fade);line(px,py,px-Math.cos(angle+.5)*6,py-Math.sin(angle+.5)*6,'#ddd0b7',1,fade);}
     }else{
      const reach=a.classId==='rogue'?32:55,start=p<.42?p/.42:1;
      line(x+reach,y+reach*.6,x+reach-reach*2*start,y+reach*.6-reach*1.2*start,'#e9dfd0',3,fade*.85);
      line(x+reach+3,y+reach*.6+4,x+reach-reach*2*start+3,y+reach*.6-reach*1.2*start+4,'#b14b37',2,fade*.6);
      if(a.classId==='rogue')line(x-reach,y+reach*.4,x-reach+reach*1.6*start,y+reach*.4-reach*start,'#e4d8c7',2,fade*.8);
     }
    }
    if(!a.self&&p>.45){const q=(p-.45)/.55;for(let j=0;j<(motion?12:4);j++){const angle=j*2.399,r=3+q*(10+j%3*4);ctx.globalAlpha=(1-q)*.8;ctx.fillStyle=j%3?a.color:'#f5e5cc';ctx.fillRect(Math.round(x+Math.cos(angle)*r),Math.round(y+Math.sin(angle)*r),j%3?2:3,2);}}
   }
   if(p===1)active.splice(i,1);
  }ctx.globalAlpha=1;
 }
 function clear(){active.length=0;ctx.clearRect(0,0,canvas.width,canvas.height);wasDrawing=false;}
 return {play,update,clear,stats:()=>({active:active.length,capacity:4,width:canvas.width,height:canvas.height})};
})();
