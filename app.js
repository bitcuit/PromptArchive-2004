// Prompt Archive 2004 - generator logic and UI interactions
const $ = s => document.querySelector(s);
const pick = a => a[Math.floor(Math.random()*a.length)];
const sample = (a,n) => [...a].sort(()=>Math.random()-.5).slice(0,Math.min(n,a.length));
const uniq = a => [...new Set(a)];

function parseAddOns(){
  if(generatedOtherItems.length){
    const tags=generatedOtherItems.map(item=>item.tag);
    return {tags,label:tags.join(" + ").toUpperCase()};
  }
  const raw=$("#customAdd").value.trim();
  if(!raw) return {tags:[],label:"NO OTHER"};
  const pieces=raw.split(",").map(x=>x.trim()).filter(Boolean);
  return {tags:uniq(pieces),label:pieces.join(" + ").toUpperCase()};
}

let printId=1;
const locks={color:false,accentColor:false,mainStyle:false,heroMode:false,backPiece:false,bottomType:false,complexity:false,animal:false,customAdd:false};
let heroMode="all";
let customAnimalValue={en:"",ko:""};
let customAnimalIsPreset=true;
let generatedOtherItems=[];
let settingsLanguage="en";

function heroInputs(){
  return [...document.querySelectorAll('[data-multi="heroMode"] input[type="checkbox"]')];
}
function selectedHeroes(){
  return heroInputs().filter(input=>input.checked).map(input=>input.value);
}
function updateHeroSummary(){
  const labels=heroInputs().filter(input=>input.checked).map(input=>settingLabel("heroMode",input.value));
  $("#heroModeToggle .multi-summary").textContent=labels.join(" · ");
}
function setHeroValues(values){
  const normalized=values.length>1?values.filter(value=>value!=="none"):values;
  const wanted=new Set(normalized.length?normalized:["none"]);
  heroInputs().forEach(input=>input.checked=wanted.has(input.value));
  if(!selectedHeroes().length){
    const first=heroInputs()[0];
    if(first) first.checked=true;
  }
  updateHeroSummary();
}
function randomSubset(values,maxCount){
  const count=1+Math.floor(Math.random()*Math.min(maxCount,values.length));
  return sample(values,count);
}
function compatibleHeroes(styleKeys,candidates=Object.keys(heroMap)){
  return candidates.filter(key=>{
    const hero=heroMap[key];
    return hero && styleKeys.some(styleKey=>hero.styles.includes(styleKey));
  });
}
function compatibleHero(styleKey,candidates=Object.keys(heroMap)){
  const list=compatibleHeroes([styleKey],candidates);
  return pick(list.length?list:["none"]);
}
let lastPreviewKeys=["headset"];
function heroDisplayText(key){
  const safeKey=heroMap[key]?key:"none";
  if(settingsLanguage!=="ko") return {name:heroMap[safeKey].name,sub:heroMap[safeKey].sub};
  return settingTranslations.heroPreview[safeKey];
}
function updateHeroPreview(keys){
  const active=(Array.isArray(keys)?keys:[keys]).filter(Boolean);
  lastPreviewKeys=active.length?active:["none"];
  const visible=active.filter(key=>key!=="none");
  const single=$("#heroSingle");
  const stack=$("#heroStack");
  if(visible.length>1){
    single.hidden=true;
    stack.hidden=false;
    stack.innerHTML=visible.map(key=>{
      return `<div class="hero-cell"><span class="hero-cell-icon">${heroMap[key].icon}</span><span class="hero-cell-name">${heroDisplayText(key).name}</span></div>`;
    }).join("");
    return;
  }
  single.hidden=false;
  stack.hidden=true;
  stack.innerHTML="";
  const key=visible[0]||active[0]||"none";
  const text=heroDisplayText(key);
  $("#heroIcon").textContent=(heroMap[key]||heroMap.none).icon;
  $("#heroName").textContent=text.name;
  $("#heroSub").textContent=text.sub;
}
function renderColorChips(){
  const korean=settingsLanguage==="ko";
  const chip=(label,value)=>{
    const name=korean?(settingTranslations.values.color[value]||value):value.toUpperCase();
    return `<span class="color-chip"><span class="chip-dot" style="background:${value}"></span>${label} ${name}</span>`;
  };
  const base=$("#color").value;
  const accent=$("#accentColor").value;
  let html=chip(korean?"기본":"BASE",base);
  if(accent!=="none" && accent!==base) html+=chip(korean?"포인트":"ACCENT",accent);
  $("#previewColors").innerHTML=html;
}
function resolvedMainStyle(){
  return $("#mainStyle").value==="random"?pick(Object.keys(styles)):$("#mainStyle").value;
}
function randomizeField(key){
  if(key==="color") $("#color").value=pick(outfitColors);
  if(key==="accentColor"){
    const accentPool=outfitColors.filter(color=>color!==$("#color").value);
    $("#accentColor").value=Math.random()<.5?"none":pick(accentPool);
  }
  if(key==="mainStyle") $("#mainStyle").value=pick(Object.keys(styles));
  if(key==="heroMode"){
    const compatible=compatibleHeroes([resolvedMainStyle()]);
    setHeroValues(randomSubset(compatible.length?compatible:["none"],2));
    updatePreviewFromSelections();
  }
  if(key==="complexity") $("#complexity").value=pick(["simple","medium","medium","max"]);
  if(key==="backPiece") $("#backPiece").value=Math.random()<.42?pick(Object.keys(backPieces).filter(k=>k!=="none")):"none";
  if(key==="bottomType") $("#bottomType").value=pick(["any","skirt","pants"]);
  if(key==="animal"){
    if($("#animal").value==="custom"){
      customAnimalValue=pick(customAnimalNames);
      customAnimalIsPreset=true;
      renderAnimalInput();
    }else{
      const value=Math.random()<.18?"custom":Math.random()<.45?pick(Object.keys(animals)):"none";
      $("#animal").value=value;
      if(value==="custom"){
        customAnimalValue=pick(customAnimalNames);
        customAnimalIsPreset=true;
      }
      updateAnimalChoiceLabel();
      syncAnimalControl();
    }
  }
  if(key==="customAdd"){
    generatedOtherItems=Math.random()<.25?[]:sample(shuffleAddOns,1+Math.floor(Math.random()*2));
    renderOtherInput();
  }
}
function randomizeUnlocked(){
  ["color","accentColor","mainStyle","heroMode","backPiece","bottomType","complexity","animal","customAdd"].forEach(key=>{
    if(!locks[key]) randomizeField(key);
  });
  refreshCustomSelects();
  updatePreviewFromSelections();
  $("#status").textContent="PARTS SHUFFLED · READY";
}
function resolveComplexity(){
  const value=$("#complexity").value;
  return value==="random"?pick(["simple","medium","medium","max"]):value;
}
function generate(){
  const baseColor=$("#color").value;
  const accentColor=$("#accentColor").value;
  const hasAccent=accentColor!=="none" && accentColor!==baseColor;
  const colorTag=hasAccent?`outfit color: ${baseColor} with ${accentColor} accents`:`outfit color: ${baseColor}`;
  const mainKey=resolvedMainStyle();
  const main=styles[mainKey];
  const secondaryKey=Math.random()<.68?pick(secondaryCompat[mainKey]):null;
  const secondary=secondaryKey?styles[secondaryKey]:null;

  const heroCandidates=selectedHeroes();
  let heroKeys=heroMode==="all"?heroCandidates:[pick(heroCandidates)];
  if(heroKeys.length>1) heroKeys=heroKeys.filter(key=>key!=="none");
  if(!heroKeys.length) heroKeys=["none"];

  const complexity=resolveComplexity();
  let animalKey=$("#animal").value;
  if(animalKey==="random") animalKey=Math.random()<.36?pick(Object.keys(animals)):"none";
  if(animalKey==="custom" && !customAnimalValue.en.trim()) animalKey="none";
  const customAnimal=animalKey==="custom"?customAnimalValue.en.trim():"";
  let backKey=$("#backPiece").value;
  if(backKey==="random") backKey=Math.random()<.33?pick(Object.keys(backPieces).filter(k=>k!=="none")):"none";
  const bottomPref=$("#bottomType").value;
  const addOn=parseAddOns();

  let arr=[colorTag,main.name,pick(main.sil)];
  if(secondary) arr.push(secondary.name);

  if(animalKey==="custom" && customAnimal){
    arr.push(`${customAnimal} themed outfit`,"animal motif");
  }else if(animalKey!=="none"){
    arr.push(...animals[animalKey]);
  }
  if(animalKey!=="none" && heroKeys.every(key=>key==="none") && Math.random()<.55 && heroMap.hood.styles.includes(mainKey)){
    heroKeys=["hood"];
  }

  if(addOn.tags.length){
    arr.push(...addOn.tags);
  }

  let topPool=main.tops;
  let bottomPool=main.bottoms;
  let shoePool=main.shoes;
  let extraPool=main.extras;
  if(secondary){
    topPool=topPool.concat(sample(secondary.tops,2));
    bottomPool=bottomPool.concat(sample(secondary.bottoms,2));
    shoePool=shoePool.concat(sample(secondary.shoes,1));
    extraPool=uniq(extraPool.concat(sample(secondary.extras,3)));
  }

  let bottomChoices=bottomPool;
  if(bottomPref==="skirt") bottomChoices=bottomPool.filter(item=>item.includes("skirt"));
  if(bottomPref==="pants") bottomChoices=bottomPool.filter(item=>!item.includes("skirt"));
  if(!bottomChoices.length) bottomChoices=bottomPool;
  const chosenTop=pick(topPool);
  const chosenBottom=pick(bottomChoices);
  arr.push(chosenTop,chosenBottom);

  heroKeys.forEach(heroKey=>{
    const hero=heroMap[heroKey];
    if(hero.tag) arr.push(hero.tag);
  });
  if(backPieces[backKey].tag) arr.push(backPieces[backKey].tag);

  if(complexity!=="simple" && Math.random()<.78) arr.push(pick(legwear));

  let extraCount=complexity==="simple"?2:complexity==="medium"?4:6;
  arr.push(...sample(extraPool,extraCount));

  // head-piece connection rules
  heroKeys.forEach(heroKey=>{
    if(heroKey==="headset") arr.push(pick(["cable details","audio device pouch","neck cable strap"]));
    if(heroKey==="goggles") arr.push(pick(["pilot strap details","flight buckle hardware"]));
    if(heroKey==="halo") arr.push(pick(["floating tech ornaments","ring hardware"]));
    if(heroKey==="horns") arr.push(pick(["gothic hardware","head straps","metal charm details"]));
    if(heroKey==="visor") arr.push(pick(["technical face hardware","device clips","clear panel accents"]));
    if(heroKey==="beanie") arr.push(pick(["soft knit details","casual layered accessories"]));
    if(heroKey==="hood" && animalKey==="none") arr.push("cute animal motif");
  });

  if(complexity==="max"){
    arr.push(...sample(specials,Math.random()<.5?1:2));
  }

  const chosenShoes=pick(shoePool);
  arr.push(chosenShoes);

  if(complexity==="max"){
    [chosenTop,chosenBottom,chosenShoes].forEach(item=>{
      if(itemDetails[item]) arr.push(...itemDetails[item]);
    });
  }

  if(complexity==="medium"){
    arr.push("detailed clothing");
  }else if(complexity==="max"){
    arr.push("layered accessories","highly detailed clothing");
  }
  arr=uniq(arr);

  updateHeroPreview(heroKeys);
  $("#prompt").textContent=arr.join(", ");
  $("#chips").innerHTML=[
    `BASE ${baseColor.toUpperCase()}`,
    hasAccent?`ACCENT ${accentColor.toUpperCase()}`:"NO ACCENT",
    main.name.toUpperCase(),
    secondary?secondary.name.toUpperCase():"SOLO STYLE",
    heroKeys.map(key=>key.toUpperCase()).join(" + "),
    backKey==="none"?null:`BACK ${backKey.toUpperCase()}`,
    bottomPref==="any"?null:`BOTTOM ${bottomPref.toUpperCase()}`,
    complexity.toUpperCase(),
    animalKey==="none"?"NO ANIMAL":animalKey==="custom"?(customAnimal?customAnimal.toUpperCase():"CUSTOM ANIMAL"):animalKey.toUpperCase(),
    addOn.label
  ].filter(Boolean).map(x=>`<span class="tag-chip">${x}</span>`).join("");

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
function updateLockButton(b){
  const key=b.dataset.lock;
  const label=b.closest(".field")?.querySelector("label")?.textContent.trim()||"SETTING";
  const description=settingsLanguage==="ko"
    ?`${label} ${locks[key]?"잠금 해제":"잠그기"}`
    :`${locks[key]?"Unlock":"Lock"} ${label}`;
  b.classList.toggle("locked",locks[key]);
  b.textContent=locks[key]?"◆":"◇";
  b.setAttribute("aria-pressed",String(locks[key]));
  b.setAttribute("aria-label",description);
  b.dataset.tooltip=description;
  b.removeAttribute("title");
}
document.querySelectorAll(".lock-btn").forEach(b=>{
  updateLockButton(b);
  b.addEventListener("click",()=>{
    const key=b.dataset.lock;
    locks[key]=!locks[key];
    updateLockButton(b);
  });
});

function updatePreviewFromSelections(){
  const candidates=selectedHeroes();
  const previewKeys=heroMode==="all"?candidates:[candidates[0]||"none"];
  updateHeroPreview(previewKeys);
  renderColorChips();
}
function setHeroMode(mode){
  heroMode=mode;
  const button=document.querySelector('[data-mode-group="heroMode"]');
  const together=mode==="all";
  button.setAttribute("aria-pressed",String(together));
  button.textContent=together
    ?(settingsLanguage==="ko"?"＋ 함께 사용":"＋ Use together")
    :(settingsLanguage==="ko"?"🎲 랜덤 1개":"🎲 Random one");
  updateHeroSummary();
}
function closeHeroMenu(){
  const root=document.querySelector('[data-multi="heroMode"]');
  root.classList.remove("open");
  root.querySelector(".multi-toggle").setAttribute("aria-expanded","false");
  root.querySelector(".multi-menu").hidden=true;
}
const heroRoot=document.querySelector('[data-multi="heroMode"]');
const heroToggle=$("#heroModeToggle");
const heroMenu=$("#heroModeMenu");
heroToggle.addEventListener("click",event=>{
  event.stopPropagation();
  closeCustomMenus();
  const opening=!heroRoot.classList.contains("open");
  heroRoot.classList.toggle("open",opening);
  heroToggle.setAttribute("aria-expanded",String(opening));
  heroMenu.hidden=!opening;
});
heroMenu.addEventListener("click",event=>event.stopPropagation());
heroInputs().forEach(input=>input.addEventListener("change",()=>{
  if(input.checked){
    if(input.value==="none"){
      heroInputs().forEach(other=>other.checked=other===input);
    }else{
      const noneInput=heroInputs().find(other=>other.value==="none");
      if(noneInput) noneInput.checked=false;
    }
  }
  if(!selectedHeroes().length){
    input.checked=true;
    $("#status").textContent="KEEP AT LEAST ONE OPTION";
  }
  updateHeroSummary();
  updatePreviewFromSelections();
}));
document.querySelector('[data-mode-group="heroMode"]').addEventListener("click",()=>{
  setHeroMode(heroMode==="all"?"random":"all");
  updatePreviewFromSelections();
});
document.addEventListener("click",closeAllMenus);
document.addEventListener("keydown",event=>{
  if(event.key==="Escape") closeAllMenus();
});

// Custom dropdowns: one styled menu design for every select, matching the head-piece menu.
const customSelects=[];
function closeCustomMenus(){customSelects.forEach(cs=>cs.close());}
function closeAllMenus(){closeHeroMenu();closeCustomMenus();}
function refreshCustomSelects(){customSelects.forEach(cs=>cs.refresh());}
function buildCustomSelect(select){
  const wrap=document.createElement("div");
  wrap.className="multi-select custom-select";
  select.parentNode.insertBefore(wrap,select);
  wrap.appendChild(select);
  const toggle=document.createElement("button");
  toggle.type="button";
  toggle.className="multi-toggle";
  toggle.setAttribute("aria-expanded","false");
  toggle.setAttribute("aria-haspopup","listbox");
  toggle.innerHTML='<span class="multi-summary"></span>';
  const menu=document.createElement("div");
  menu.className="multi-menu custom-menu";
  menu.hidden=true;
  wrap.append(toggle,menu);
  const summary=toggle.querySelector(".multi-summary");
  const refresh=()=>{
    const option=select.options[select.selectedIndex];
    summary.textContent=option?option.textContent:"";
  };
  const close=()=>{
    wrap.classList.remove("open");
    toggle.setAttribute("aria-expanded","false");
    menu.hidden=true;
  };
  const open=()=>{
    closeAllMenus();
    menu.innerHTML=[...select.options].map(option=>
      `<button type="button" class="menu-option${option.value===select.value?" selected":""}" data-value="${option.value}">${option.textContent}</button>`
    ).join("");
    wrap.classList.add("open");
    toggle.setAttribute("aria-expanded","true");
    menu.hidden=false;
  };
  toggle.addEventListener("click",event=>{
    event.stopPropagation();
    const opening=menu.hidden;
    closeAllMenus();
    if(opening) open();
  });
  menu.addEventListener("click",event=>{
    event.stopPropagation();
    const target=event.target.closest(".menu-option");
    if(!target) return;
    select.value=target.dataset.value;
    select.dispatchEvent(new Event("change"));
    refresh();
    close();
  });
  refresh();
  customSelects.push({select,wrap,refresh,close,open});
}

$("#animal").addEventListener("change",()=>{
  if($("#animal").value==="custom"){
    customAnimalValue={en:"",ko:""};
    customAnimalIsPreset=true;
  }
  updateAnimalChoiceLabel();
  syncAnimalControl();
  if($("#animal").value==="custom") $("#animalCustom").focus();
});

document.querySelectorAll(".reroll-field-btn").forEach(button=>button.addEventListener("click",()=>{
  randomizeField(button.dataset.reroll);
  refreshCustomSelects();
  renderColorChips();
  $("#status").textContent=`${button.dataset.reroll.replace(/([A-Z])/g," $1").toUpperCase()} UPDATED`;
}));
$("#color").addEventListener("change",renderColorChips);
$("#accentColor").addEventListener("change",renderColorChips);

const settingTranslations={
  labels:{
    color:["BASE COLOR","기본 색상"],accentColor:["ACCENT COLOR","포인트 색상"],mainStyle:["MAIN STYLE","메인 스타일"],
    heroMode:["HEAD PIECE","머리 장식"],backPiece:["BACK PIECE","등 장식"],bottomType:["BOTTOM","하의"],
    complexity:["COMPLEXITY","복잡도"],animal:["ANIMAL","동물"],customAdd:["OTHER","기타"]
  },
  values:{
    color:{black:"검정",white:"흰색",brown:"갈색",blue:"파랑",pink:"분홍",gray:"회색",red:"빨강",green:"초록",purple:"보라",beige:"베이지"},
    accentColor:{none:"없음",black:"검정",white:"흰색",brown:"갈색",blue:"파랑",pink:"분홍",gray:"회색",red:"빨강",green:"초록",purple:"보라",beige:"베이지"},
    mainStyle:{random:"랜덤",y2k:"Y2K 스트리트",soft:"소프트 그런지",cyber:"사이버 Y2K",metal:"메탈 고딕",aviator:"에비에이터",animal:"애니멀 스트리트",angel:"사이버 엔젤",doll:"돌 고스",webcore:"웹코어",winter:"윈터 유틸리티",sport:"스포트 테크",mcbling:"맥블링 Y2K",acubi:"아쿠비 테크",visualkei:"비주얼 케이",rave:"사이버 레이브"},
    heroMode:{headset:"헤드셋",hood:"동물 후드",goggles:"고글",halo:"헤일로",horns:"뿔",visor:"바이저",beanie:"비니",wings:"머리 날개",none:"없음"},
    backPiece:{none:"없음",random:"랜덤",angel:"천사 날개",demon:"악마 날개",fairy:"요정 날개",butterfly:"나비 날개",mech:"기계 날개",waist:"허리 날개",cape:"망토"},
    bottomType:{any:"랜덤",skirt:"치마",pants:"바지"},
    complexity:{medium:"보통",simple:"간단",max:"최대",random:"랜덤"},
    animal:{random:"랜덤 / 선택 사항",none:"없음",rabbit:"토끼",cat:"고양이",dog:"강아지",hamster:"햄스터",bear:"곰",custom:"기타"}
  },
  heroPreview:{
    none:{name:"머리 장식 없음",sub:"깔끔한 머리 실루엣"},
    headset:{name:"헤드셋",sub:"오디오 포인트 머리 장식"},
    hood:{name:"동물 후드",sub:"부드러운 머리 실루엣"},
    goggles:{name:"고글",sub:"레트로 테크 머리 장식"},
    halo:{name:"헤일로",sub:"떠 있는 머리 장식"},
    horns:{name:"뿔",sub:"고딕 머리 실루엣"},
    visor:{name:"바이저",sub:"테크 페이스 장식"},
    beanie:{name:"비니",sub:"캐주얼 Y2K 모자"},
    wings:{name:"머리 날개",sub:"날개 달린 머리 실루엣"}
  }
};
function updateAnimalChoiceLabel(){
  const option=$("#animal").querySelector('option[value="custom"]');
  option.textContent=settingsLanguage==="ko"?"기타":"Other";
}
function renderAnimalInput(){
  if(!customAnimalIsPreset) return;
  $("#animalCustom").value=settingsLanguage==="ko"?customAnimalValue.ko:customAnimalValue.en;
}
function syncAnimalControl(){
  const custom=$("#animal").value==="custom";
  const control=$("#animal").closest(".custom-select")||$("#animal");
  control.hidden=custom;
  $("#animalInlineEditor").hidden=!custom;
  if(custom) renderAnimalInput();
}
function renderOtherInput(){
  if(!generatedOtherItems.length){
    if($("#customAdd").dataset.generated==="true") $("#customAdd").value="";
    $("#customAdd").dataset.generated="false";
    return;
  }
  $("#customAdd").dataset.generated="true";
  $("#customAdd").value=generatedOtherItems.map(item=>settingsLanguage==="ko"?item.ko:item.tag).join(", ");
}
function settingLabel(group,value){
  if(settingsLanguage==="ko") return settingTranslations.values[group]?.[value]||value;
  const input=document.querySelector(`[data-multi="${group}"] input[value="${value}"]`);
  return input?.dataset.label||value;
}
function updateSettingsLanguage(){
  const korean=settingsLanguage==="ko";
  const fieldIds=["color","accentColor","mainStyle","heroMode","backPiece","bottomType","complexity","animal","customAdd"];
  fieldIds.forEach(id=>{
    const control=$("#"+id);
    const label=control?.closest(".field")?.querySelector(":scope > label");
    const pair=settingTranslations.labels[id];
    if(label&&pair) label.textContent=pair[korean?1:0];
  });
  const heroLabel=$("#heroModeToggle").closest(".field").querySelector(":scope > label");
  heroLabel.textContent=settingTranslations.labels.heroMode[korean?1:0];
  ["color","accentColor","mainStyle","backPiece","bottomType","complexity","animal"].forEach(id=>{
    [...$("#"+id).options].forEach(option=>{
      if(!option.dataset.en) option.dataset.en=option.textContent;
      option.textContent=korean?(settingTranslations.values[id]?.[option.value]||option.dataset.en):option.dataset.en;
    });
  });
  heroInputs().forEach(input=>{
    input.nextElementSibling.textContent=korean?settingTranslations.values.heroMode[input.value]:input.dataset.label;
  });
  updateAnimalChoiceLabel();
  renderAnimalInput();
  renderOtherInput();
  const button=$("#settingsLanguage");
  button.textContent=korean?"EN 보기":"한글 보기";
  button.setAttribute("aria-pressed",String(korean));
  document.querySelectorAll(".lock-btn").forEach(updateLockButton);
  document.querySelectorAll(".reroll-field-btn").forEach(reroll=>{
    const label=reroll.closest(".field")?.querySelector("label")?.textContent.trim()||"SETTING";
    const description=korean?`${label}만 랜덤 선택`:`Randomize ${label} only`;
    reroll.setAttribute("aria-label",description);
    reroll.dataset.tooltip=description;
  });
  $("#animalCustom").placeholder=korean?"여우, 사슴, 늑대...":"fox, deer, wolf...";
  refreshCustomSelects();
  updateHeroPreview(lastPreviewKeys);
  renderColorChips();
  setHeroMode(heroMode);
}
$("#settingsLanguage").addEventListener("click",()=>{
  settingsLanguage=settingsLanguage==="en"?"ko":"en";
  updateSettingsLanguage();
});
$("#customAdd").addEventListener("input",()=>{
  if($("#customAdd").dataset.generated==="true"){
    generatedOtherItems=[];
    $("#customAdd").dataset.generated="false";
  }
});
$("#animalCustom").addEventListener("input",()=>{
  const value=$("#animalCustom").value.trim();
  customAnimalValue={en:value,ko:value};
  customAnimalIsPreset=false;
});
// Clicking the arrow area of the custom-animal input returns to the choice list.
$("#animalCustom").addEventListener("click",event=>{
  const rect=event.currentTarget.getBoundingClientRect();
  if(rect.right-event.clientX>30) return;
  event.stopPropagation();
  $("#animal").value="none";
  syncAnimalControl();
  refreshCustomSelects();
  const animalSelect=customSelects.find(cs=>cs.select.id==="animal");
  if(animalSelect) animalSelect.open();
});
["color","accentColor","mainStyle","backPiece","bottomType","complexity","animal"].forEach(id=>buildCustomSelect($("#"+id)));
updateSettingsLanguage();
syncAnimalControl();
updatePreviewFromSelections();

$("#printBtn").addEventListener("click",()=>generate());
$("#rerollBtn").addEventListener("click",()=>generate());
$("#shuffleBtn").addEventListener("click",randomizeUnlocked);
$("#copyBtn").addEventListener("click",copyPrompt);
$("#saveBtn").addEventListener("click",saveTxt);

// Mona emoji quick controls
const themeOrder=["blue","yellow","lime","pink","mono"];
$("#quickTheme").addEventListener("click",()=>{
  const current=document.body.dataset.theme || "blue";
  const next=themeOrder[(themeOrder.indexOf(current)+1)%themeOrder.length];
  document.body.dataset.theme=next;
  $("#status").textContent=`THEME · ${next.toUpperCase()}`;
});
$("#quickHero").addEventListener("click",()=>{
  const hero=compatibleHero(resolvedMainStyle(),selectedHeroes());
  setHeroValues([hero]);
  setHeroMode("random");
  updateHeroPreview([hero]);
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
