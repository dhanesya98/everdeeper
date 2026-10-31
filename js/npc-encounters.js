/* Optional sanctuary encounters and a separate, persistent high-price market. */
(() => {
  RPG_DATA.NPCS.vesper_broker = {
    id:'vesper_broker',name:'Vesper, Pedagang Pasar Gelap',title:'Penadah Emas di Balik Topeng',
    role:'blackmarket',icon:'coin',greetings:['Jangan tanya asal barangku. Jika menginginkan senjata yang bisa membunuh kegelapan, siapkan emas yang sepadan.'],
    dialogues:[{topic:'Aturan Pasar Gelap',text:'Stokku terbatas: Legendary dan Mythic, satu salinan per barang pada lantai ini. Tidak ada pengacakan ulang. Relik buronan dan hasil tungku Kaelen tidak kuperdagangkan.'},{topic:'Jejak Liora',text:'Ada gadis berpita merah yang menolak menjual lenteranya kepadaku. Katanya, ada janji yang tidak bisa dibayar dengan emas.'}]
  };
  const proto=GameInventory.InventoryManager.prototype;
  proto.getBlackMarket=function(floor) {
    const key=String(floor);
    this.blackMarkets ||= {};
    if (!this.blackMarkets[key]) {
      const pool=RPG_DATA.ITEMS.filter(item=>!item.dropOnly&&!item.craftOnly&&['legendary','mythic'].includes(item.rarity)&&(!item.classReq||item.classReq===this.heroClassId));
      for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
      const picks=[];
      for(const rarity of ['legendary','mythic']){const item=pool.find(item=>item.rarity===rarity);if(item)picks.push(item);}
      for(const item of pool)if(picks.length<4&&!picks.includes(item))picks.push(item);
      this.blackMarkets[key]=picks.map(item=>({...item,marketPrice:Math.max(item.rarity==='mythic'?2200:1200,Math.round(item.price*(item.rarity==='mythic'?6:5))),sold:false}));
      this.saveToStorage();
    }
    return this.blackMarkets[key];
  };
  proto.buyBlackMarket=function(floor,id) {
    const item=this.getBlackMarket(floor).find(item=>item.id===id);
    if(!item||item.sold)return {success:false,reason:'Stok sudah habis.'};
    if(!this.canEquip(item))return {success:false,reason:'Barang tidak cocok dengan class kamu.'};
    if(this.gold<item.marketPrice)return {success:false,reason:'Gold belum cukup untuk harga pasar gelap.'};
    this.gold-=item.marketPrice;item.sold=true;
    const loot={...item};delete loot.sold;delete loot.marketPrice;
    this.addLoot(loot);this.saveToStorage();return {success:true,item:loot};
  };
  // Reuse the existing cloaked humanoid atlas with a distinct warm tint and silhouette.
  // No extra image download, texture, light, animation loop or high-poly model.
  const createNPC=GameModels.createNPC;
  GameModels.createNPC=function(id) {
    if(id!=='vesper_broker')return createNPC(id);
    const model=createNPC('malakor_shade');model.name='npc_vesper_broker';
    model.bodyRoot.material.color.setHex(0xd9ad79);model.bodyRoot.scale.set(.88,1.08,1);
    return model;
  };
  const portrait=GamePresentation.portrait;
  GamePresentation.portrait=(renderer,id,hero)=>portrait(renderer,id==='vesper_broker'?'malakor_shade':id,hero);
})();
