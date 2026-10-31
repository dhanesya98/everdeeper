/* Hand-authored relic recipes. Crafting is offered only at Kaelen's sanctuary. */
window.RelicCrafting = (() => {
  const recipes = [
    {id:'frozen_marrow', ingredients:['kragor_bone_ring','morwen_glacial_heart'], cost:180,
      result:{id:'frozen_marrow_ring',name:'Cincin Sumsum Beku',rarity:'legendary',atk:20,def:12,hp:45,int:8,poise:18,icon:'ring',price:420,desc:'Tulang Kragor membungkus inti es Morwen. Sebuah ikatan yang hanya dapat disatukan oleh tungku Kaelen.'}},
    {id:'eclipse_ember', ingredients:['pyrax_flame_fang','vael_shadow_cloak'], cost:320,
      result:{id:'eclipse_ember_sigil',name:'Segel Bara Gerhana',rarity:'mythic',atk:30,def:20,agi:12,hp:45,crit:0.16,icon:'fire',price:640,desc:'Bara Pyrax terkurung dalam tenunan bayangan Vael. Relik serangan dengan perlindungan bayangan.'}},
    {id:'dawn_marrow', ingredients:['frozen_marrow_ring','pyrax_flame_fang'], cost:320,
      result:{id:'dawn_marrow_heart',name:'Jantung Sumsum Fajar',rarity:'mythic',atk:28,def:16,hp:65,int:12,poise:22,icon:'sun',price:640,desc:'Api Pyrax melebur tulang dan es menjadi inti fajar baru. Pilihan tangguh untuk pembawa lentera.'}}
  ];
  const mimicParts=[
    {id:'mimic_fang',name:'Taring Rahang Mimic',slot:'relic',rarity:'epic',atk:10,poise:12,icon:'dagger',price:160,desc:'Taring peti hidup. Bawa bersama Inti Lapar Mimic ke Kaelen untuk menempa senjata eksklusif.'},
    {id:'mimic_carapace',name:'Karapas Peti Hidup',slot:'relic',rarity:'epic',def:8,hp:25,icon:'armor',price:160,desc:'Cangkang peti yang masih berdenyut. Bawa bersama Inti Lapar Mimic ke Kaelen untuk menjahit armor eksklusif.'},
    {id:'mimic_core',name:'Inti Lapar Mimic',slot:'relic',rarity:'legendary',atk:12,def:6,hp:20,icon:'amulet',price:240,desc:'Inti pemangsa yang diperlukan dalam resep senjata atau armor Mimic.'}
  ].map(item=>({...item,dropOnly:true,mimicExclusive:true}));
  RPG_DATA.ITEMS.push(...mimicParts);
  recipes.push({id:'mimic_treasury_seal',ingredients:['mimic_lucky_tongue','mimic_core'],cost:460,
    result:{id:'mimic_treasury_seal',name:'Meterai Peti Pemakan Emas',slot:'relic',rarity:'mythic',atk:18,hp:35,crit:.12,goldBonus:.45,mimicExclusive:true,icon:'coin',price:580,desc:'Lidah Mimic Keberuntungan dipadukan dengan Inti Lapar. +45% Gold saat dipakai; menggantikan bonus relik lama, bukan menumpuk dengannya.'}});
  const forged={
    warrior:{weapon:{name:'Pedang Rahang Peti',atk:48,str:12,poise:32,crit:.10,icon:'greatsword'},armor:{name:'Zirah Karapas Peti Hidup',def:30,hp:110,poise:32,icon:'armor'}},
    mage:{weapon:{name:'Tongkat Inti Pelahap',atk:50,int:15,def:4,crit:.12,icon:'staff'},armor:{name:'Jubah Selubung Mimic',def:24,hp:65,int:14,icon:'armor'}},
    rogue:{weapon:{name:'Belati Kembar Pemakan Emas',atk:46,agi:14,hp:20,crit:.18,icon:'dagger'},armor:{name:'Mantel Kulit Peniru',def:22,hp:80,agi:12,crit:.10,icon:'armor'}},
    archer:{weapon:{name:'Busur Taring Peti Hidup',atk:50,agi:16,poise:18,crit:.14,icon:'bow'},armor:{name:'Selubung Pemburu Peti',def:24,hp:85,agi:12,crit:.10,icon:'armor'}}
  };
  for(const [cls,slots] of Object.entries(forged))for(const [slot,stats] of Object.entries(slots))recipes.push({
    id:'mimic_'+slot+'_'+cls,ingredients:[slot==='weapon'?'mimic_fang':'mimic_carapace','mimic_core'],cost:slot==='weapon'?580:520,
    result:{...stats,id:'mimic_'+slot+'_'+cls,slot,classReq:cls,rarity:'mythic',price:600,mimicExclusive:true,desc:'Tempa eksklusif Kaelen dari relik Mimic. '+(slot==='weapon'?'Senjata':'Armor')+' untuk '+RPG_DATA.CLASSES[cls].name+'. Tidak dijual dan tidak masuk drop acak.'}
  });
  for (const recipe of recipes) Object.assign(recipe.result,{slot:recipe.result.slot||'relic',dropOnly:true,craftOnly:true});
  RPG_DATA.CRAFT_RECIPES = recipes;
  RPG_DATA.ITEMS.push(...recipes.map(recipe => recipe.result));
  const names = ids => ids.map(id => RPG_DATA.ITEMS.find(item => item.id === id)?.name || id);
  function preview(inv, id) {
    const recipe = recipes.find(recipe => recipe.id === id);
    if (!recipe) return {success:false,reason:'Resep tidak dikenal.'};
    if(recipe.result.classReq&&recipe.result.classReq!==inv.heroClassId)return {success:false,recipe,reason:'Resep ini khusus '+RPG_DATA.CLASSES[recipe.result.classReq].name+'.'};
    const materials = recipe.ingredients.map(id => inv.items.filter(item => item.id === id).sort((a,b)=>(a.forgeLevel||0)-(b.forgeLevel||0))[0]);
    const missing = recipe.ingredients.filter((id,index) => !materials[index]);
    return {recipe,materials,success:!missing.length && inv.gold >= recipe.cost,
      reason:missing.length ? 'Bahan belum ada di tas: '+names(missing).join(', ')+'. Lepas dahulu jika sedang dipakai.' : inv.gold < recipe.cost ? 'Gold belum cukup.' : ''};
  }
  function craft(inv,id,context) {
    if (context?.npcId !== 'kaelen_smith' || context.inCombat || !context.atStation) return {success:false,reason:'Datangi Kaelen di perkemahan saat tidak bertarung.'};
    const state=preview(inv,id);
    if (!state.success) return state;
    // Validate all ingredients before any mutation; keep equipped relics untouched.
    const retainedForge=Math.max(...state.materials.map(item=>Math.min(10,item.forgeLevel||0)));
    const result={...state.recipe.result,forgeLevel:retainedForge};
    const consumed=new Set(state.materials);
    inv.items=inv.items.filter(item=>!consumed.has(item));
    inv.gold-=state.recipe.cost;
    inv.items.push(result);
    inv.saveToStorage();
    return {success:true,item:result};
  }
  function render(root,inv,ctx) {
    root.style.cssText='margin:10px 0 8px;display:grid;gap:8px';
    const heading=document.createElement('div');heading.className='modal-section-label';heading.textContent='Tungku Relik & Tempa Mimic';root.appendChild(heading);
    const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px';root.appendChild(grid);
    for (const recipe of recipes) {
      if(recipe.result.classReq&&recipe.result.classReq!==inv.heroClassId)continue;
      const state=preview(inv,recipe.id),item=recipe.result;
      const card=document.createElement('div');card.className='forge-bench-card rarity-'+item.rarity;card.style.cssText='padding:10px;text-align:left;display:flex;flex-direction:column;justify-content:space-between;gap:6px';
      card.title=item.desc+'\n'+(state.reason||'');
      const top=document.createElement('div');
      const title=document.createElement('strong');title.style.cssText='font-size:12px;display:block;color:#eee';title.textContent=item.name;top.appendChild(title);
      const stats=document.createElement('div');stats.style.cssText='font-size:11px;color:#b8b0aa;margin-top:2px';stats.textContent=['atk','def','hp','str','int','agi','poise','crit','goldBonus'].filter(key=>item[key]).map(key=>'+'+(['crit','goldBonus'].includes(key)?Math.round(item[key]*100)+'%':item[key])+' '+(key==='goldBonus'?'GOLD':key.toUpperCase())).join(' · ');top.appendChild(stats);
      const ingredients=document.createElement('div');ingredients.style.cssText='font-size:10.5px;color:#9a908a;margin-top:4px';ingredients.textContent=names(recipe.ingredients).map((name,i)=>name+' '+(state.materials[i]?'✓':'✗')).join(' + ');top.appendChild(ingredients);
      card.appendChild(top);
      const button=document.createElement('button');button.className='hud-btn';button.style.cssText='padding:5px 8px;font-size:11px;width:100%';button.textContent='Tempa ('+recipe.cost+'G)';button.disabled=!state.success||ctx.inCombat();
      button.onclick=()=>{
        const result=craft(inv,recipe.id,{npcId:ctx.npcId,inCombat:ctx.inCombat(),atStation:ctx.isPresent()});
        ctx.notify(result.success ? result.item.name+' berhasil diciptakan!' : result.reason, result.success ? result.item : null);
        ctx.refresh();
      };
      card.appendChild(button);grid.appendChild(card);
    }
  }
  function mimicDrop(inv){const index=(inv.mimicVictories||0)%mimicParts.length;inv.mimicVictories=(inv.mimicVictories||0)+1;return {...mimicParts[index]};}
  return {preview,craft,render,mimicDrop};
})();
