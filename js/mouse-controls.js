/* Pointer lock gives continuous FPS mouse-look; Alt temporarily releases UI input. */
window.GameMouse=(()=>{
 let canvas,options,button,pending=false,requestId=0,alt=new Set(),enabled=false,painted=null;
 function locked(){return document.pointerLockElement===canvas;}
 function looking(){return !!canvas&&locked()&&enabled&&options.canPlay()&&!alt.size;}
 function release(){if(locked())document.exitPointerLock();}
 function paint(){if(!canvas)return;
  const playing=options.canPlay(),look=looking();
  const mode=look?'look':!playing?'menu':alt.size?'cursor':'released';
  if(painted!==mode){document.body.classList.toggle('mouse-look',look);document.body.dataset.mouseMode=mode;painted=mode;}
  const hide=!playing||look||alt.size>0||pending;if(button.hidden!==hide)button.hidden=hide;
 }
 function refresh(){if(!canvas)return;const play=options.canPlay();
  if(!play||alt.size){enabled=false;release();}
  paint();
 }
 function suspend(){if(!canvas)return;alt.clear();enabled=false;requestId++;pending=false;options.clearInput();release();paint();}
 async function capture(){if(!canvas||!options.canPlay()||alt.size||document.hidden||pending||locked())return;
  if(!canvas.requestPointerLock){button.textContent='Kontrol mouse tidak didukung browser ini · Q/R untuk melihat';paint();return;}
  const id=++requestId;pending=true;enabled=true;paint();
  try{canvas.focus?.({preventScroll:true});await canvas.requestPointerLock();if(id===requestId&&(alt.size||!options.canPlay()||document.hidden)){enabled=false;release();}}
  catch(_error){if(id===requestId){enabled=false;document.body.dataset.mouseLockError=_error.message||_error.name||'Pointer lock gagal';button.textContent='Klik untuk aktifkan mouse · tahan Alt untuk kursor';}}
  finally{if(id===requestId)pending=false;paint();}
 }
 function init(surface,callbacks){canvas=surface;options=callbacks;canvas.tabIndex=-1;
  button=document.createElement('button');button.id='mouseCaptureBtn';button.type='button';button.textContent='Klik untuk melanjutkan · tahan Alt untuk kursor';button.hidden=true;document.body.appendChild(button);
  document.addEventListener('pointerlockchange',()=>{pending=false;
   if(locked()){
    // A lock request may complete after a menu, Alt, or blur released input.
    if(!enabled||!options.canPlay()||alt.size||document.hidden){release();paint();return;}
    delete document.body.dataset.mouseLockError;
    options.onCapture();
   }else{enabled=false;options.clearInput();}
   paint();
  });
  document.addEventListener('pointerlockerror',()=>{pending=false;enabled=false;paint();});
  document.addEventListener('mousemove',e=>{if(looking())options.look(e.movementX||0,e.movementY||0);});
  document.addEventListener('keydown',e=>{
   if(e.code!=='AltLeft'&&e.code!=='AltRight')return;
   if(!options.canPlay())return;
   e.preventDefault();e.stopPropagation();alt.add(e.code);enabled=false;requestId++;pending=false;options.clearInput();release();paint();
  },true);
  document.addEventListener('keyup',e=>{
   if(e.code!=='AltLeft'&&e.code!=='AltRight')return;
   const held=alt.delete(e.code);if(!held)return;e.preventDefault();e.stopPropagation();
   if(!alt.size&&options.canPlay())capture();else paint();
  },true);
  // Consume the acquisition click: resuming control must never spend AP or attack.
  document.addEventListener('click',e=>{
   if(e.button!==0||!options.canPlay())return;
   if(looking()){e.preventDefault();e.stopImmediatePropagation();options.attack();return;}
   if(!alt.size&&(e.target===canvas||e.target===button)){
    e.preventDefault();e.stopImmediatePropagation();capture();
   }
  },true);
  // A character-choice or menu-close click supplies the browser's required gesture.
  document.addEventListener('click',()=>queueMicrotask(()=>{if(options.canPlay()&&!alt.size&&!locked())capture();else refresh();}));
  window.addEventListener('blur',suspend);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});
  refresh();
 }
 return {init,refresh,suspend,isLooking:looking,isAltDown:()=>alt.size>0};
})();
