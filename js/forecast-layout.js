(() => {
 function place(){const panel=document.getElementById('combatForecast'),bar=document.getElementById('gameBottomBar');if(!panel||!bar||panel.style.display==='none')return;
  // A transformed floatingPanels parent changes the containing block of fixed elements.
  const hud=document.getElementById('combatHud');if(hud&&panel.parentElement!==hud)hud.appendChild(panel);
  const bounds=bar.getBoundingClientRect(),vital=bar.querySelector('.player-vital-card')?.getBoundingClientRect();
  const edge=Math.min(bounds.top,vital?.top||bounds.top);
  panel.style.setProperty('bottom',Math.max(12,innerHeight-edge+12)+'px','important');
  panel.style.setProperty('max-height',Math.max(60,edge-24)+'px','important');
  panel.style.setProperty('width',Math.min(bounds.width,780,innerWidth-24)+'px','important');
 }
 const original=GameCombat.CombatManager.prototype.showTargetForecast;
 GameCombat.CombatManager.prototype.showTargetForecast=function(...args){const result=original.apply(this,args),panel=document.getElementById('combatForecast');
  const shown=panel&&panel.style.display!=='none';document.body.classList.toggle('forecast-open',!!shown);
  if(shown){const threats=this.combatants.filter(e=>e.hp>0&&(e.chapterMark||e.windup));if(threats.length){const warning=document.createElement('div');warning.style.cssText='color:#ffbd94;margin-top:6px';warning.textContent=threats.map(e=>e.chapterWarning||'Pindah dari petak yang dibidik!').join(' · ');panel.appendChild(warning);}place();}return result;
 };
 window.addEventListener('resize',place);
 window.addEventListener('DOMContentLoaded',()=>{const bar=document.getElementById('gameBottomBar');if(bar){const observer=new ResizeObserver(place);observer.observe(bar);const vital=bar.querySelector('.player-vital-card');if(vital)observer.observe(vital);}});
})();
