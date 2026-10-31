/* Low-resolution first-person ending: no video, new WebGL context or large assets. */
window.EndingCinematic = (() => {
  let active=false;
  const chapters=[
    ['NAMA TERAKHIR','Liora: “Ayah… namamu yang terakhir. Pulanglah.”'],
    ['SUMPAH YANG PADAM','Gema penjaga melepaskan senjatanya. Tidak ada lagi yang harus menggantikannya.'],
    ['JALAN PULANG','Di belakangmu, para tawanan saling menyebut nama. Tak seorang pun ditinggalkan.'],
    ['FAJAR PERTAMA','Liora: “Besok kita boleh takut pada hal-hal kecil lagi.”']
  ];
  function play({heroClass='warrior',onComplete}) {
    if(active)return;active=true;
    const previous=document.activeElement,root=document.createElement('div');
    root.id='endingCinematic';root.className='modal-overlay';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Ending: Nama Terakhir, Fajar Pertama');
    root.style.cssText='position:fixed;inset:0;z-index:10000;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e1ddd3';
    for(const [key,value] of Object.entries({position:'fixed',inset:'0',padding:'0',margin:'0',width:'100vw',height:'100vh','max-width':'none','max-height':'none',background:'#000',opacity:'1',transform:'none','z-index':'10000'}))root.style.setProperty(key,value,'important');
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;canvas.setAttribute('aria-label','Adegan pixel art: penjaga memudar, Liora dan tawanan menuju fajar');
    canvas.style.cssText='width:100%;height:100%;object-fit:contain;image-rendering:pixelated';root.appendChild(canvas);
    const caption=document.createElement('div');caption.style.cssText='position:absolute;bottom:10%;width:min(780px,86%);text-align:center;line-height:1.7;text-shadow:0 2px 4px #000;background:#080808b3;padding:14px;font-size:clamp(13px,1.5vw,18px)';caption.setAttribute('aria-live','polite');root.appendChild(caption);
    const controls=document.createElement('div');controls.style.cssText='position:absolute;right:24px;top:20px;display:flex;gap:10px';
    const pause=document.createElement('button'),skip=document.createElement('button');pause.textContent='Jeda';skip.textContent='Lewati ke epilog';
    for(const b of [pause,skip]){b.className='hud-btn';controls.appendChild(b);}root.appendChild(controls);document.body.appendChild(root);skip.focus();
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    const oath=new Image();oath.src=window.PixelArtAssets?.['abyss-final-bosses']||'assets/abyss-final-bosses.png';
    const atlas=new Image(),hands=new Image();atlas.src=window.PixelArtAssets?.['bestiary']||'assets/bestiary.webp';hands.src='assets/fps-'+(['warrior','mage','rogue','archer'].includes(heroClass)?heroClass:'warrior')+'.webp';
    let elapsed=0,last=performance.now(),lastDraw=0,raf,paused=false,current=-1,finished=false;
    const reduced=window.GamePresentation?.settings.motion===false||matchMedia('(prefers-reduced-motion: reduce)').matches;
    function finish(){if(finished)return;finished=true;active=false;cancelAnimationFrame(raf);root.removeEventListener('keydown',key);root.remove();previous?.focus();onComplete();}
    skip.onclick=finish;pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Lanjutkan':'Jeda';};
    function key(e){e.stopPropagation();if(e.code==='Escape'){e.preventDefault();finish();}if(e.code==='Tab'){e.preventDefault();(document.activeElement===skip?pause:skip).focus();}}
    root.addEventListener('keydown',key);
    const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
    function figure(x,y,scale,liora=false){
      const original=window.GameCharacterArt?.image;
      if(original?.complete&&original.naturalWidth){const index=liora?1:2,h=85*scale,w=h;ctx.save();ctx.globalAlpha=liora?1:.75;ctx.drawImage(original,(index%3)*original.width/3,0,original.width/3,original.height/2,x-w/2,y-h+14*scale,w,h);ctx.restore();return;}
      if(atlas.complete&&atlas.naturalWidth){
        const index=liora?13:14,h=85*scale,w=h;
        ctx.save();ctx.globalAlpha=liora?1:.65;
        ctx.drawImage(atlas,(index%4)*atlas.width/4,Math.floor(index/4)*atlas.height/4,atlas.width/4,atlas.height/4,x-w/2,y-h+14*scale,w,h);
        if(liora){rect(x+7*scale,y-57*scale,8*scale,3*scale,'#b73937');rect(x+12*scale,y-55*scale,2*scale,12*scale,'#912b2b');}
        ctx.restore();return;
      }
      ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
      ctx.fillStyle=liora?'#8a8582':'#48474a';ctx.beginPath();ctx.moveTo(-9,-38);ctx.lineTo(9,-38);ctx.lineTo(17,0);ctx.lineTo(-17,0);ctx.fill();
      rect(-8,-55,16,20,liora?'#43312d':'#29292c');rect(-5,-51,10,13,liora?'#c7a38b':'#827a6b');rect(-10,-55,20,5,'#342925');
      rect(-10,-3,7,17,'#292729');rect(4,-3,7,17,'#292729');
      if(liora){rect(6,-49,10,4,'#b13532');rect(13,-46,3,13,'#912b2b');rect(11,-27,5,19,'#b99a83');rect(-15,-28,5,20,'#b99a83');}
      ctx.restore();
    }
    function draw(t){const stage=Math.min(3,Math.floor(t/8)),p=(t%8)/8;
      if(stage!==current){current=stage;caption.textContent=chapters[stage][0]+' — '+chapters[stage][1];if(stage===3)GameAudio.playHeal();}
      ctx.globalAlpha=1;rect(0,0,640,360,'#08090c');
      if(stage<3){
        rect(0,210,640,150,'#242329');
        const light=stage===2?'#ceb28a':'#39343d';rect(250,35,140,190,light);
        for(let side=0;side<2;side++)for(let row=0;row<7;row++)for(let col=0;col<4;col++)rect(side?390+col*65:-10+col*65,row*34,62,31,(row+col)%2?'#222127':'#2b292e');
        for(let i=0;i<8;i++){ctx.strokeStyle='#302e32';ctx.beginPath();ctx.moveTo(320,210);ctx.lineTo(i*100-30,360);ctx.stroke();}
        for(let i=0;i<1600;i++){const x=(i*137)%640,y=(i*73)%360;if(x<250||x>390){ctx.globalAlpha=.12;rect(x,y,2,1,i%2?'#b2a290':'#000');}}ctx.globalAlpha=1;
        const shade=ctx.createRadialGradient(320,160,20,320,180,350);shade.addColorStop(0,'#0000');shade.addColorStop(1,'#000c');ctx.fillStyle=shade;ctx.fillRect(0,0,640,360);
        if(stage<2&&oath.complete&&oath.naturalWidth){ctx.globalAlpha=stage===0?1:1-p;ctx.drawImage(oath,2*oath.width/3,0,oath.width/3,oath.height/2,227,35+p*16,186,200);ctx.globalAlpha=1;}
        if(stage===1){for(let i=0;i<32;i++)rect(270+(i*37%110),65+(i*19%150)-p*40,2,2,'#bcad86');figure(435,235,1.1,true);}
        if(stage===2){for(let i=0;i<5;i++)figure(265+(i*29%100),210+(i%2)*12,.55+i*.04);figure(430-(reduced?0:p*50),267,1.5,true);}
      }else{
        const sky=ctx.createLinearGradient(0,0,0,300);sky.addColorStop(0,'#484554');sky.addColorStop(.6,'#b6846b');sky.addColorStop(1,'#e5c69a');ctx.fillStyle=sky;ctx.fillRect(0,0,640,360);
        ctx.fillStyle='#f5db9d';ctx.beginPath();ctx.arc(320,185-(reduced?10:p*20),33,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#3e3c40';ctx.beginPath();ctx.moveTo(0,240);for(let x=0;x<=640;x+=40)ctx.lineTo(x,210+Math.sin(x*.02)*20);ctx.lineTo(640,360);ctx.lineTo(0,360);ctx.fill();
        for(let i=0;i<5;i++)figure(180+i*48,255,.65);figure(430,290,1.8,true);
        rect(0,0,60,360,'#141418');rect(580,0,60,360,'#141418');rect(0,0,640,24,'#141418');
      }
      if(hands.complete&&hands.naturalWidth){ctx.globalAlpha=stage===3?.48:.7;const h=180,w=h*hands.width/hands.height;ctx.drawImage(hands,(640-w)/2,252+(stage===3?p*25:0),w,h);ctx.globalAlpha=1;}
      // Gentle fades between shots; reduced motion uses stable tableaux.
      if(!reduced){const fade=Math.max(0,1-p*12,p*12-11);ctx.globalAlpha=fade;rect(0,0,640,360,'#050507');ctx.globalAlpha=1;}
    }
    function tick(now){raf=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.1);last=now;if(!paused&&!document.hidden)elapsed+=dt;if(elapsed>=32){finish();return;}if(now-lastDraw>=1000/24){lastDraw=now;draw(elapsed);}}
    draw(0);raf=requestAnimationFrame(tick);
  }
  return {play,get active(){return active;}};
})();
