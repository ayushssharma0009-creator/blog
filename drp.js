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
