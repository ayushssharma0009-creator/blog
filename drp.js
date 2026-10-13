/* DRP B2B Parts Portal — shared by every page. Load it in <head> so the sign-in gate runs before the page draws.
   The portal is post-login only: signed-out visitors are sent to login.html, and a signed-in dealer who opens
   login.html goes straight to the portal. Sign-in here is a front-end mock; replace DRP.signIn/signOut with your auth. */
(function(){
  const KEY="drp_session";
  const isLogin=document.documentElement.dataset.page==="login";
  function read(){
    try{return JSON.parse(sessionStorage.getItem(KEY)||localStorage.getItem(KEY)||"null");}
    catch(e){return isLogin?null:{name:"Demo Dealer",company:"Demo Diesel Shop"};} // storage blocked: let the sample open
  }
  const session=read();
  if(!session&&!isLogin){location.replace("login.html");return;}
  if(session&&isLogin){location.replace("index.html");return;}

  window.DRP={
    session,
    signIn(data,remember){
      try{(remember?localStorage:sessionStorage).setItem(KEY,JSON.stringify(data));}catch(e){}
      location.href="index.html";
    },
    signOut(){
      try{sessionStorage.removeItem(KEY);localStorage.removeItem(KEY);}catch(e){}
      location.href="login.html";
    }
  };

  /* Submit Vehicle Info (nav button): the dealer sends a customer's truck details for a custom tune,
     fitment check or parts quote. Front-end only; connect the submit to your backend. */
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const YEARS=[];for(let y=2026;y>=1999;y--)YEARS.push(y);
  const opts=list=>`<option value="">Select…</option>`+list.map(o=>`<option>${o}</option>`).join("");
  DRP.openVehicleForm=function(){
    let d=document.getElementById("vehDlg");
    if(!d){
      d=document.createElement("dialog");d.id="vehDlg";d.className="vehdlg";d.setAttribute("aria-labelledby","vehTitle");
      document.body.appendChild(d);
      d.addEventListener("click",e=>{if(e.target===d||e.target.closest("[data-vclose]"))d.close();});
    }
    d.innerHTML=`<form class="vform" novalidate>
      <header><h2 id="vehTitle">Submit Vehicle Info</h2><button type="button" class="vx" data-vclose aria-label="Close">×</button></header>
      <p class="vlead">Send your customer's truck details for a custom tune, a fitment check or a parts quote.</p>
      <div class="vgrid2">
        <div class="vf full"><label for="vVin">VIN</label><input class="in" id="vVin" maxlength="17" autocomplete="off" spellcheck="false" placeholder="17 characters"><small>Or fill in the year, make and engine instead.</small></div>
        <div class="vf"><label for="vYear">Year</label><select class="in" id="vYear">${opts(YEARS)}</select></div>
        <div class="vf"><label for="vMake">Make</label><select class="in" id="vMake">${opts(["Ford","Ram","Chevrolet","GMC","Jeep","Nissan"])}</select></div>
        <div class="vf"><label for="vEngine">Engine</label><input class="in" id="vEngine" placeholder="e.g. 6.7L Powerstroke"></div>
        <div class="vf"><label for="vMiles">Mileage</label><input class="in" id="vMiles" inputmode="numeric" placeholder="e.g. 84,000"></div>
        <div class="vf"><label for="vNeed">What do you need? <span class="req">*</span></label><select class="in" id="vNeed">${opts(["Custom tune","Fitment check","Parts quote","Other"])}</select></div>
        <div class="vf"><label for="vRef">Customer or RO number</label><input class="in" id="vRef" placeholder="Optional"></div>
        <div class="vf full"><label for="vNotes">Current mods and notes</label><textarea class="in" id="vNotes" rows="3" placeholder="Intake, exhaust, transmission, towing, anything we should know"></textarea></div>
        <div class="vf full"><label for="vPhotos">Photos</label><input id="vPhotos" type="file" accept="image/*" multiple><small>VIN plate, engine bay or dash. Optional.</small></div>
      </div>
      <div class="msg err" id="vMsg" role="alert"></div>
      <footer><button type="button" class="btn lite" data-vclose>Cancel</button><button type="submit" class="btn">Submit vehicle info</button></footer>
    </form>`;
    const f=d.querySelector("form"),v=id=>d.querySelector("#"+id);
    const fail=(text,id)=>{v("vMsg").textContent=text;v(id).focus();};
    f.addEventListener("submit",e=>{
      e.preventDefault();
      const vin=v("vVin").value.trim().toUpperCase(),year=v("vYear").value,make=v("vMake").value,eng=v("vEngine").value.trim(),need=v("vNeed").value;
      if(vin&&!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin))return fail("A VIN is 17 letters and numbers, without I, O or Q.","vVin");
      if(!vin&&!(year&&make&&eng))return fail("Enter the VIN, or the year, make and engine.",vin?"vVin":!year?"vYear":!make?"vMake":"vEngine");
      if(!need)return fail("Choose what you need for this vehicle.","vNeed");
      const veh=vin?"VIN "+vin:`${year} ${make} ${eng}`,n=v("vPhotos").files.length;
      f.innerHTML=`<header><h2 id="vehTitle">Vehicle Info Received</h2><button type="button" class="vx" data-vclose aria-label="Close">×</button></header>
        <div class="vdone"><span class="tick" aria-hidden="true">✓</span><p>We have the <b>${esc(veh)}</b> for a <b>${esc(need.toLowerCase())}</b>${n?` with ${n} photo${n===1?"":"s"}`:""}. Our team will follow up at <b>${esc((session&&session.email)||"your account email")}</b>.</p>
        <p class="vnote">Design sample: nothing was sent. Connect this form to your backend.</p></div>
        <footer><button type="button" class="btn" data-vclose>Done</button></footer>`;
    });
    d.showModal();v("vVin").focus();
  };

  /* ---------- Catalog structure shared by the nav and the portal ---------- */
  DRP.ENGINES={
    ford:{name:"Ford Powerstroke",list:[["ps67-20","6.7L Powerstroke (2020-2026)"],["ps67-11","6.7L Powerstroke (2011-2019)"],["ps30","3.0L Powerstroke (2018-2020)"],["ps64","6.4L Powerstroke (2008-2010)"],["ps60","6.0L Powerstroke (2003-2007)"],["ps73","7.3L Powerstroke (1999-2003)"]]},
    ram:{name:"Ram Cummins",list:[["c67-13","6.7L Ram Cummins (2013-2025)"],["c67-10","6.7L Ram Cummins (2010-2012)"],["c67-07","6.7L Ram Cummins (2007.5-2009)"],["c50","5.0L Nissan Cummins (2016-2019)"]]},
    gm:{name:"GM Duramax",list:[["l5p","6.6L Duramax L5P (2017-2026)"],["lml","6.6L Duramax LML (2011-2016)"],["lmm","6.6L Duramax LMM (2007.5-2010)"],["lb7","6.6L LB7/LLY/LBZ (2001-2007)"],["lm2","3.0L Duramax LM2/LZ0 (2020-2025)"]]},
    eco:{name:"EcoDiesel",list:[["eco-ram","3.0L EcoDiesel RAM (2014-2023)"],["eco-jgc","Jeep Grand Cherokee (2014-2020)"],["eco-jw","Jeep Wrangler / Gladiator (2020-2023)"]]}
  };
  /* Menu categories, shortest to longest as rendered (14px IBM Plex Sans), so each list reads as a tidy ramp. */
  DRP.PARTS=["EGR Kits","Up-Pipes","Fuel pump","Down-Pipe","Intercooler","Head Studs","Y-Bridge Kit","Intake Horn","Accessories","Manifold Kit","Fuel System","Intake Elbow","Turbocharger","Race Exhaust","Coolant Filter","Exhaust Parts","Coolant Y-Pipe","Cold Air Intake","Intercooler Pipe","Performance Pipe"];
  DRP.TUNING=["HP Tunes","TCM Tunes","Tuning Credit","Blank Devices","EZ Lynk Tunes","EFI Live Tunes","Custom Tuning Packages"];
  DRP.typeSet=t=>new Set(t==="Parts"?DRP.PARTS:t==="Tuning"?DRP.TUNING:[t]);

  /* ---------- Main nav (shared by every signed-in page) ----------
     By default each choice opens the portal with it applied. The portal sets DRP.hooks to act in place
     and to show live counts and totals. */
  const go=q=>{location.href="index.html"+(q&&Object.keys(q).length?"?"+new URLSearchParams(q):"");};
  DRP.go=go;
  DRP.hooks={
    count:null,                         // (make,type,engine) => number of products, shown beside menu items
    total:null,                         // items => "$1,234.00", shown on saved builds
    filter:f=>go(f),                    // {make, engine} or {make, type}
    quickAdd:(sku,qty)=>{go({sku,qty});return true;},
    loadSaved:i=>go({load:i}),
    focus:where=>go({focus:where})      // "quick" | "reorder": open the full tool in Your Build
  };
  const SUPPORT=[["Fitment help","Fitment help – connect to your support desk"],["Order status","Order status – connect to your order API"],["Returns & warranty","Returns & warranty – connect to your RMA form"],["Contact your rep","Contact your rep – connect to your sales team"]];
  /* Toast; pass {label, fn} to add an action such as Undo (stays up longer so it can be reached). */
  let tt;DRP.toast=(m,action)=>{const t=document.getElementById("toast");if(!t)return;t.textContent=m;
    if(action){const b=document.createElement("button");b.type="button";b.textContent=action.label;b.onclick=()=>{t.classList.remove("on","act");action.fn();};t.append(b);}
    t.classList.toggle("act",!!action);t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on","act"),action?6000:2200);};
  /* Press / anywhere to jump to search, as in most ordering tools. */
  document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;const a=document.activeElement;
    if(a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||a.isContentEditable))return;const q=document.getElementById("q");if(q){e.preventDefault();q.focus();q.select();}});
  const savedBuilds=()=>{try{return JSON.parse(localStorage.getItem("drp_saved"))||[];}catch(e){return [];}};
  const count=(make,type,engine)=>DRP.hooks.count?DRP.hooks.count(make,type,engine):null;
  /* One menu link; a = {make, type} or {make, engine} becomes data-* attributes and drives the count. */
  const item=(label,a,cls)=>{const n=count(a.make||"",a.type||"",a.engine||""),c=[cls,n===0&&"zero"].filter(Boolean).join(" ");
    return `<li><button type="button"${c?` class="${c}"`:""} ${Object.entries(a).map(([k,v])=>`data-${k}="${esc(v)}"`).join(" ")}>${esc(label)}${n==null?"":`<small>${n}</small>`}</button></li>`;};
  const platforms=type=>Object.entries(DRP.ENGINES).map(([k,m])=>item(m.name,{make:k,type})).join("");
  function panelHTML(m){
    if(m==="vehicle")return [`<div class="vgrid">`,...Object.entries(DRP.ENGINES).map(([k,mk])=>`<div><h4>${mk.name}</h4><ul>${item("Shop all "+mk.name,{make:k,engine:""},"all")}${mk.list.map(([id,n])=>item(n,{make:k,engine:id})).join("")}</ul></div>`),`</div>`].join("");
    if(m==="parts"||m==="tuning"){const g=m==="parts"?"Parts":"Tuning",list=m==="parts"?DRP.PARTS:DRP.TUNING;
      return `<div class="pgrid"><div><h4>${g} Categories</h4><ul class="${m==="parts"?"cols2":""}">${item("Shop all "+g,{make:"",type:g},"all")}${list.map(t=>item(t,{make:"",type:t})).join("")}</ul></div><div><h4>${g} By Platform</h4><ul>${platforms(g)}</ul></div></div>`;}
    if(m==="quick")return `<form class="qo" id="navQo" novalidate><h4>Quick Order By SKU</h4><p>Type or paste a part number from your PO.</p>
      <div class="row"><input class="in" id="navSku" list="skuList" placeholder="Enter SKU" aria-label="SKU" autocomplete="off"><input class="in" id="navQty" type="number" min="1" value="1" aria-label="Quantity"><button class="btn">Add to Build</button></div>
      <div class="msg" id="navQoMsg" role="status"></div><button type="button" class="linkbtn" data-focus="quick">Open Your Build →</button></form>`;
    if(m==="reorder"){const s=savedBuilds();
      return `<div class="ro"><h4>Reorder A Saved Build</h4>${s.length?`<ul>${s.slice(0,6).map((b,i)=>{const n=b.items.reduce((a,x)=>a+x.q,0),t=DRP.hooks.total&&DRP.hooks.total(b.items);
        return `<li><span><b>${esc(b.name)}</b><small>${n} part${n===1?"":"s"}${t?" · "+t:""}${b.date?" · Saved "+esc(b.date):""}</small></span><button type="button" class="btn ghost" data-load="${i}">Load</button></li>`;}).join("")}</ul>`
        :`<p>No saved builds yet. Name and save a build in Your Build to reorder it here.</p>`}<button type="button" class="linkbtn" data-focus="reorder">Manage saved builds →</button></div>`;}
    if(m==="support")return `<ul>${SUPPORT.map(([l],i)=>`<li><button type="button" data-support="${i}">${esc(l)}</button></li>`).join("")}</ul>`;
    return "";
  }
  function initNav(){
    const nav=document.getElementById("mainNav");if(!nav)return;
    const panel=document.getElementById("navPanel");let openBtn=null;
    const close=()=>{if(!openBtn)return;openBtn.setAttribute("aria-expanded","false");openBtn=null;panel.hidden=true;};
    const open=b=>{close();openBtn=b;b.setAttribute("aria-expanded","true");const m=b.dataset.menu;
      panel.className="navpanel"+(m==="vehicle"?" wide":m==="parts"||m==="tuning"?" mid":"");panel.innerHTML=panelHTML(m);panel.hidden=false;
      const nr=nav.getBoundingClientRect(),br=b.getBoundingClientRect();
      panel.style.left=Math.max(16,Math.min(br.left-nr.left,nr.width-panel.offsetWidth-16))+"px";
      if(m==="quick")panel.querySelector("#navSku").focus();};
    DRP.closeMenu=close;
    nav.addEventListener("click",e=>{
      const b=e.target.closest(".ni");
      if(b){if(b.dataset.menu){openBtn===b?close():open(b);return;}close();if(b.id==="vehNav")DRP.openVehicleForm();return;}
      const t=e.target.closest(".navpanel button");if(!t||t.type==="submit")return; /* the Quick Order form submits on its own */
      if(t.dataset.support!==undefined){DRP.toast(SUPPORT[+t.dataset.support][1]);close();return;}
      if(t.dataset.focus){close();DRP.hooks.focus(t.dataset.focus);return;}
      if(t.dataset.load!==undefined){close();DRP.hooks.loadSaved(+t.dataset.load);return;}
      if(t.dataset.type!==undefined){close();DRP.hooks.filter({make:t.dataset.make,type:t.dataset.type});return;}
      if(t.dataset.engine!==undefined){close();DRP.hooks.filter({make:t.dataset.make,engine:t.dataset.engine});}
    });
    nav.addEventListener("submit",e=>{
      if(e.target.id!=="navQo")return;e.preventDefault();
      const sku=panel.querySelector("#navSku"),qty=Math.max(1,parseInt(panel.querySelector("#navQty").value)||1),m=panel.querySelector("#navQoMsg");
      if(!sku.value.trim()){m.className="msg err";m.textContent="Enter a SKU.";sku.focus();return;}
      const ok=DRP.hooks.quickAdd(sku.value.trim(),qty);
      if(ok===false){m.className="msg err";m.textContent=`SKU “${sku.value.trim()}” not found. Check the part number.`;sku.select();return;}
      m.className="msg ok";m.textContent=`Added ${qty} × ${sku.value.trim().toUpperCase()} to your build.`;sku.value="";panel.querySelector("#navQty").value=1;sku.focus();
    });
    document.addEventListener("click",e=>{if(openBtn&&!nav.contains(e.target))close();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&openBtn){const b=openBtn;close();b.focus();}});
    nav.querySelector(".bar").addEventListener("scroll",close);addEventListener("resize",close);
  }
  document.addEventListener("DOMContentLoaded",initNav);

  /* Product photos come from the Shopify CDN; hide any that fail so the image well shows instead of a broken icon. */
  addEventListener("error",e=>{if(e.target.tagName==="IMG")e.target.classList.add("noimg");},true);

  /* Signed-in header: dealer name, initials and sign out. */
  document.addEventListener("DOMContentLoaded",()=>{
    if(!session)return;
    const name=session.company||session.name||"Dealer";
    const n=document.getElementById("dealerName"),a=document.getElementById("avatar"),so=document.getElementById("signOut");
    if(n)n.textContent=name;
    if(a)a.textContent=name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("");
    if(so)so.onclick=()=>DRP.signOut();
  });
})();
