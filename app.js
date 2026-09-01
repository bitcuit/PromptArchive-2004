// Prompt Archive 2004 - generator logic and UI interactions
const $ = s => document.querySelector(s);
const pick = a => a[Math.floor(Math.random()*a.length)];
const sample = (a,n) => [...a].sort(()=>Math.random()-.5).slice(0,Math.min(n,a.length));
const uniq = a => [...new Set(a)];

function parseAddOns(){
  const raw=$("#customAdd").value.trim();
  if(!raw) return {tags:[],label:"NO OTHER"};
  const pieces=raw.split(",").map(x=>x.trim()).filter(Boolean);
  return {tags:uniq(pieces),label:pieces.join(" + ").toUpperCase()};
}

let printId=1;
const locks={color:false,mainStyle:false,heroMode:false,complexity:false,animal:false};

function compatibleHero(styleKey){
  const list=Object.entries(heroMap).filter(([k,v])=>v.styles.includes(styleKey)).map(([k])=>k);
  return pick(list);
}
function updateHeroPreview(k){
  const d=heroMap[k]||heroMap.none;
  $("#heroIcon").textContent=d.icon;$("#heroName").textContent=d.name;$("#heroSub").textContent=d.sub;
}
function randomizeUnlocked(){
  if(!locks.mainStyle) $("#mainStyle").value=pick(["random","random",...Object.keys(styles)]);
  const resolvedStyle=$("#mainStyle").value==="random"?pick(Object.keys(styles)):$("#mainStyle").value;
  if(!locks.heroMode) $("#heroMode").value=Math.random()<.78?compatibleHero(resolvedStyle):"none";
  if(!locks.complexity) $("#complexity").value=pick(["simple","medium","medium","max","random"]);
  if(!locks.animal) $("#animal").value=Math.random()<.36?pick(["rabbit","cat","dog","hamster","bear"]):"none";
  if(!locks.color) $("#color").value=pick(["black","white","brown","blue","pink","gray","red","green","purple","beige"]);
  updateHeroPreview($("#heroMode").value==="random"?compatibleHero(resolvedStyle):$("#heroMode").value);
  $("#status").textContent="PARTS SHUFFLED · READY";
}
function resolveComplexity(){
  const v=$("#complexity").value;return v==="random"?pick(["simple","medium","medium","max"]):v;
}
function generate(){
  const color=$("#color").value;
  const mainKey=$("#mainStyle").value==="random"?pick(Object.keys(styles)):$("#mainStyle").value;
  const main=styles[mainKey];
  const secondaryKey=Math.random()<.68?pick(secondaryCompat[mainKey]):null;
  const secondary=secondaryKey?styles[secondaryKey]:null;

  let heroKey=$("#heroMode").value;
  if(heroKey==="random") heroKey=compatibleHero(mainKey);
  if(heroKey!=="none" && !heroMap[heroKey].styles.includes(mainKey) && Math.random()<.72){
    heroKey=compatibleHero(mainKey);
  }

  const complexity=resolveComplexity();
  let animalKey=$("#animal").value;
  if(animalKey==="random") animalKey=Math.random()<.36?pick(Object.keys(animals)):"none";
  const customAnimal=$("#animalCustom").value.trim();
  const addOn=parseAddOns();

  let arr=[color,main.name,pick(main.sil)];
  if(secondary) arr.push(secondary.name);

  if(animalKey==="custom"){
    if(customAnimal){
      arr.push(`${customAnimal} themed outfit`,"animal motif");
      if(heroKey==="none" && Math.random()<.55 && heroMap.hood.styles.includes(mainKey)) heroKey="hood";
    }
  }else if(animalKey!=="none"){
    arr.push(...animals[animalKey]);
    if(heroKey==="none" && Math.random()<.55 && heroMap.hood.styles.includes(mainKey)) heroKey="hood";
  }

  if(addOn.tags.length){
    arr.push(...addOn.tags);
  }

  const topPool=secondary?main.tops.concat(sample(secondary.tops,2)):main.tops;
  const bottomPool=secondary?main.bottoms.concat(sample(secondary.bottoms,2)):main.bottoms;
  const shoePool=secondary?main.shoes.concat(sample(secondary.shoes,1)):main.shoes;
  const extraPool=secondary?uniq(main.extras.concat(sample(secondary.extras,3))):main.extras;

  arr.push(pick(topPool),pick(bottomPool));

  const hero=heroMap[heroKey];
  if(hero.tag) arr.push(hero.tag);

  if(complexity!=="simple" && Math.random()<.78) arr.push(pick(legwear));

  let extraCount=complexity==="simple"?2:complexity==="medium"?4:6;
  arr.push(...sample(extraPool,extraCount));

  // head-piece connection rules
  if(heroKey==="headset") arr.push(pick(["cable details","audio device pouch","neck cable strap"]));
  if(heroKey==="goggles") arr.push(pick(["pilot strap details","flight buckle hardware"]));
  if(heroKey==="halo") arr.push(pick(["floating tech ornaments","ring hardware"]));
  if(heroKey==="horns") arr.push(pick(["gothic hardware","head straps","metal charm details"]));
  if(heroKey==="visor") arr.push(pick(["technical face hardware","device clips","clear panel accents"]));
  if(heroKey==="beanie") arr.push(pick(["soft knit details","casual layered accessories"]));
  if(heroKey==="hood" && animalKey==="none") arr.push("cute animal motif");

  if(complexity==="max"){
    arr.push(...sample(specials,Math.random()<.5?1:2));
  }

  arr.push(pick(shoePool));

  if(complexity==="medium"){
    arr.push("detailed clothing");
  }else if(complexity==="max"){
    arr.push("layered accessories","highly detailed clothing");
  }
  arr=uniq(arr);

  updateHeroPreview(heroKey);
  $("#prompt").textContent=arr.join(", ");
  $("#chips").innerHTML=[
    main.name.toUpperCase(),
    secondary?secondary.name.toUpperCase():"SOLO STYLE",
    heroKey.toUpperCase(),
    complexity.toUpperCase(),
    animalKey==="none"?"NO ANIMAL":animalKey==="custom"?(customAnimal?customAnimal.toUpperCase():"CUSTOM ANIMAL"):animalKey.toUpperCase(),
    addOn.label
  ].map(x=>`<span class="tag-chip">${x}</span>`).join("");

  const now=new Date();
  $("#meta").innerHTML=`MACHINE NO. 002<br>PRINT ID: ${String(printId++).padStart(4,"0")}<br>STATUS: PRINTED<br>${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const feed=$("#paperFeed");
  const machine=$("#machine");
  feed.classList.remove("feeding","printed");
  machine.classList.add("is-printing");
  void feed.offsetWidth;
  feed.classList.add("feeding");
  $("#status").textContent="PRINTING · BUFFERING";
  setTimeout(()=>$("#status").textContent="PRINTING · FEEDING PAPER",280);
  setTimeout(()=>{
    feed.classList.remove("feeding");
    feed.classList.add("printed");
    machine.classList.remove("is-printing");
    $("#status").textContent=`PRINT COMPLETE · ${mainKey.toUpperCase()}`;
  },1600);
  sparks();
}
function sparks(){
  const machine=$("#machine");
  for(let i=0;i<9;i++){
    const s=document.createElement("span");s.className="spark";s.textContent=pick(["★","✦","♡","◇"]);
    s.style.left=(44+Math.random()*12)+"%";s.style.top="83%";
    s.style.setProperty("--x",(Math.random()*190-95)+"px");s.style.setProperty("--y",(-35-Math.random()*105)+"px");
    machine.appendChild(s);setTimeout(()=>s.remove(),900)
  }
}
async function copyPrompt(){
  const text=$("#prompt").textContent;
  const btn=$("#copyBtn");
  try{
    await navigator.clipboard.writeText(text);
  }catch(e){
    const t=document.createElement("textarea");
    t.value=text;document.body.appendChild(t);t.select();
    document.execCommand("copy");t.remove();
  }
  const old=btn.textContent;
  btn.textContent="COPIED";
  setTimeout(()=>btn.textContent=old,850);
}
function saveTxt(){
  const blob=new Blob([$("#prompt").textContent],{type:"text/plain"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="outfit_prompt.txt";a.click();URL.revokeObjectURL(a.href)
}

document.querySelectorAll(".swatch").forEach(b=>b.addEventListener("click",()=>document.body.dataset.theme=b.dataset.t));
document.querySelectorAll(".lock-btn").forEach(b=>b.addEventListener("click",()=>{
  const key=b.dataset.lock;locks[key]=!locks[key];b.classList.toggle("locked",locks[key]);b.textContent=locks[key]?"◆":"◇";
}));
$("#printBtn").addEventListener("click",()=>generate());
$("#rerollBtn").addEventListener("click",()=>generate());
$("#shuffleBtn").addEventListener("click",randomizeUnlocked);
$("#copyBtn").addEventListener("click",copyPrompt);
$("#saveBtn").addEventListener("click",saveTxt);

function syncAnimalCustom(){
  const isCustom=$("#animal").value==="custom";
  $("#animalCustomRow").hidden=!isCustom;
  if(isCustom) setTimeout(()=>$("#animalCustom").focus(),0);
}
$("#animal").addEventListener("change",syncAnimalCustom);
syncAnimalCustom();

$("#clearCustom").addEventListener("click",()=>{$("#customAdd").value="";$("#status").textContent="OTHER CLEARED"});
$("#heroMode").addEventListener("change",()=>{
  const mk=$("#mainStyle").value==="random"?pick(Object.keys(styles)):$("#mainStyle").value;
  const v=$("#heroMode").value;updateHeroPreview(v==="random"?compatibleHero(mk):v)
});



// Mona emoji quick controls
const themeOrder=["blue","yellow","lime","pink","mono"];
$("#quickTheme").addEventListener("click",()=>{
  const current=document.body.dataset.theme || "blue";
  const next=themeOrder[(themeOrder.indexOf(current)+1)%themeOrder.length];
  document.body.dataset.theme=next;
  $("#status").textContent=`THEME · ${next.toUpperCase()}`;
});
$("#quickHero").addEventListener("click",()=>{
  const mk=$("#mainStyle").value==="random"?pick(Object.keys(styles)):$("#mainStyle").value;
  $("#heroMode").value=compatibleHero(mk);
  updateHeroPreview($("#heroMode").value);
  $("#status").textContent="HEAD PIECE UPDATED";
});
$("#quickAdd").addEventListener("click",()=>{
  $("#customAdd").focus();
  $("#customAdd").scrollIntoView({behavior:"smooth",block:"center"});
});
$("#quickShuffle").addEventListener("click",randomizeUnlocked);
$("#quickHelp").addEventListener("click",()=>$("#helpModal").classList.add("open"));

// Receipt tear-off: drag the perforation downward to close the current receipt.
const tearHandle=$("#tearHandle");
const receiptEl=$("#receipt");
let tearStartY=0, tearDelta=0, tearing=false;

tearHandle.addEventListener("pointerdown",e=>{
  tearing=true;
  tearStartY=e.clientY;
  tearDelta=0;
  tearHandle.setPointerCapture(e.pointerId);
  receiptEl.classList.add("dragging");
});
tearHandle.addEventListener("pointermove",e=>{
  if(!tearing) return;
  tearDelta=Math.max(0,e.clientY-tearStartY);
  const capped=Math.min(tearDelta,120);
  receiptEl.style.transform=`translateY(${capped}px) rotate(${capped*.004}deg)`;
  receiptEl.style.opacity=String(Math.max(.35,1-capped/180));
});
function finishTear(e){
  if(!tearing) return;
  tearing=false;
  try{tearHandle.releasePointerCapture(e.pointerId)}catch(_){}
  receiptEl.classList.remove("dragging");
  if(tearDelta>=72){
    receiptEl.classList.add("torn");
    $("#status").textContent="RECEIPT TORN OFF";
    setTimeout(()=>{
      $("#paperFeed").style.display="none";
    },190);
  }else{
    receiptEl.style.transform="";
    receiptEl.style.opacity="";
  }
}
tearHandle.addEventListener("pointerup",finishTear);
tearHandle.addEventListener("pointercancel",finishTear);

// Any new print restores the receipt.
const originalGenerate=generate;
generate=function(){
  $("#paperFeed").style.display="";
  receiptEl.classList.remove("torn");
  receiptEl.style.transform="";
  receiptEl.style.opacity="";
  originalGenerate();
};


const themeToggle=$("#themeToggle");
const themeControl=document.querySelector(".theme-control");
themeToggle.addEventListener("click",()=>{
  const isOpen=themeControl.classList.toggle("open");
  themeToggle.setAttribute("aria-expanded",String(isOpen));
});
document.addEventListener("click",e=>{
  if(!themeControl.contains(e.target)){
    themeControl.classList.remove("open");
    themeToggle.setAttribute("aria-expanded","false");
  }
});
document.querySelectorAll(".swatch").forEach(b=>b.addEventListener("click",()=>{
  themeControl.classList.remove("open");
  themeToggle.setAttribute("aria-expanded","false");
}));

const modal=$("#helpModal");
$("#helpBtn").addEventListener("click",()=>modal.classList.add("open"));
$("#closeHelp").addEventListener("click",()=>modal.classList.remove("open"));
$("#okHelp").addEventListener("click",()=>modal.classList.remove("open"));
modal.addEventListener("click",e=>{if(e.target===modal) modal.classList.remove("open")});
document.addEventListener("keydown",e=>{if(e.key==="Escape") modal.classList.remove("open")});

updateHeroPreview("headset");
