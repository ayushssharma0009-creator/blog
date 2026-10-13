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
      <header><h2 id="vehTitle">Submit vehicle info</h2><button type="button" class="vx" data-vclose aria-label="Close">×</button></header>
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
      f.innerHTML=`<header><h2 id="vehTitle">Vehicle info received</h2><button type="button" class="vx" data-vclose aria-label="Close">×</button></header>
        <div class="vdone"><span class="tick" aria-hidden="true">✓</span><p>We have the <b>${esc(veh)}</b> for a <b>${esc(need.toLowerCase())}</b>${n?` with ${n} photo${n===1?"":"s"}`:""}. Our team will follow up at <b>${esc((session&&session.email)||"your account email")}</b>.</p>
        <p class="vnote">Design sample: nothing was sent. Connect this form to your backend.</p></div>
        <footer><button type="button" class="btn" data-vclose>Done</button></footer>`;
    });
    d.showModal();v("vVin").focus();
  };

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
