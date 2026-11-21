/* BIZ-BUZ frontend demonstration.
   Data is stored in this browser only. Replace with Supabase-backed operations
   and server-enforced roles before using this platform with real customers. */
const $ = (id) => document.getElementById(id);
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem("bizbuz_" + key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { localStorage.setItem("bizbuz_" + key, JSON.stringify(value)); }
};
let users = store.get("users", []);
let campaigns = store.get("campaigns", []);
let currentUser = store.get("session", null);
let selectedPlan = null;
let authMode = "signup";
const plans = [
  {name:"Starter",price:"₦15,000",desc:"For businesses getting started.",features:["Business profile","Campaign submission","Basic campaign tracking"]},
  {name:"Business",price:"₦30,000",desc:"For growing businesses.",features:["Everything in Starter","More campaign capacity","Enhanced support"]},
  {name:"Professional",price:"₦45,000",desc:"For established brands.",features:["Everything in Business","Priority campaign review","Advanced reporting (when enabled)"]},
  {name:"Enterprise",price:"Custom",desc:"For larger organisations.",features:["Tailored requirements","Custom support arrangement","Contact for quotation"]}
];
const saveAll = () => { store.set("users", users); store.set("campaigns", campaigns); };
const isAdmin = () => currentUser?.role === "admin";
const toast = (message) => { const el=$("toast"); el.textContent=message; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2800); };
const safe = (value="") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const openModal = id => $(id).classList.add("show");
const closeModals = () => document.querySelectorAll(".modal-backdrop").forEach(m=>m.classList.remove("show"));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",closeModals));
document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModals();}));
function showAuth(mode="signup"){authMode=mode;$("authTitle").textContent=mode==="signup"?"Create your account":"Welcome back";$("authEyebrow").textContent=mode==="signup"?"JOIN BIZ-BUZ":"ACCESS YOUR WORKSPACE";$("nameField").classList.toggle("hidden",mode!=="signup");$("authSubmit").textContent=mode==="signup"?"Create account":"Log in";$("authSwitch").innerHTML=mode==="signup"?'Already have an account? <button type="button" id="switchAuth">Log in</button>':'New to BIZ-BUZ? <button type="button" id="switchAuth">Create account</button>';$("switchAuth").onclick=()=>showAuth(mode==="signup"?"login":"signup");openModal("authModal");}
["loginNav"].forEach(id=>$(id).onclick=()=>showAuth("login"));
["signupNav","heroSignup","ctaSignup"].forEach(id=>$(id).onclick=()=>showAuth("signup"));
$("switchAuth").onclick=()=>showAuth("login");
$("authForm").addEventListener("submit",e=>{
  e.preventDefault(); const email=$("email").value.trim().toLowerCase(), password=$("password").value;
  if(authMode==="signup"){
    if(users.some(u=>u.email===email)){toast("An account with this email already exists.");return;}
    const user={id:Date.now(),name:$("fullName").value.trim(),email,password,role:"user",plan:"None",business:{}};
    users.push(user); currentUser=user;
  }else{
    const user=users.find(u=>u.email===email&&u.password===password);
    if(!user){toast("Incorrect email or password.");return;} currentUser=user;
  }
  store.set("session",currentUser);saveAll();closeModals();enterDashboard();
});
function enterDashboard(){
  $("dashboard").classList.remove("hidden");document.querySelector("main").classList.add("hidden");document.querySelector(".site-header").classList.add("hidden");document.querySelector("footer").classList.add("hidden");
  $("sideUserName").textContent=currentUser.name;$("sideUserEmail").textContent=currentUser.email;$("userAvatar").textContent=currentUser.name[0].toUpperCase();$("topAvatar").textContent=currentUser.name[0].toUpperCase();$("welcomeName").textContent=currentUser.name.split(" ")[0];
  document.querySelectorAll(".admin-only").forEach(el=>el.classList.toggle("hidden",!isAdmin()));
  loadBusiness();refreshDashboard();showView("overview");
}
function leaveDashboard(){currentUser=null;store.set("session",null);$("dashboard").classList.add("hidden");document.querySelector("main").classList.remove("hidden");document.querySelector(".site-header").classList.remove("hidden");document.querySelector("footer").classList.remove("hidden");}
$("logoutBtn").onclick=leaveDashboard;
document.querySelectorAll(".side-link[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));
function showView(view){
  if(view==="admin"&&!isAdmin()){toast("Administrator access required.");return;}
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$("view-"+view).classList.remove("hidden");
  document.querySelectorAll(".side-link[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("dashHeading").textContent=({overview:"Overview",business:"My business",campaigns:"Campaigns",subscriptions:"Subscriptions",admin:"Admin panel"})[view];
  refreshDashboard();
}
function userCampaigns(){return campaigns.filter(c=>c.userId===currentUser.id);}
function badge(status){return `<span class="badge ${status.toLowerCase()}">${safe(status)}</span>`;}
function campaignTable(items,admin=false){
  if(!items.length)return '<div class="empty-state">No campaigns to display yet.</div>';
  return `<table><thead><tr><th>CAMPAIGN</th>${admin?'<th>BUSINESS / USER</th>':''}<th>CHANNEL</th><th>SUBMITTED</th><th>STATUS</th>${admin?'<th>ACTION</th>':''}</tr></thead><tbody>${items.map(c=>`<tr><td><b>${safe(c.title)}</b></td>${admin?`<td>${safe(c.business||c.userEmail)}</td>`:""}<td>${safe(c.channel)}</td><td>${safe(c.date)}</td><td>${badge(c.status)}</td>${admin?`<td class="admin-actions">${c.status==="Pending"?`<button class="btn btn-primary" onclick="moderateCampaign(${c.id},'Approved')">Approve</button><button class="btn btn-outline" onclick="moderateCampaign(${c.id},'Rejected')">Reject</button>`:"—"}</td>`:""}</tr>`).join("")}</tbody></table>`;
}
function refreshDashboard(){
 if(!currentUser)return;
 const mine=userCampaigns(),pending=mine.filter(c=>c.status==="Pending").length,approved=mine.filter(c=>c.status==="Approved").length;
 $("metricTotal").textContent=mine.length;$("metricPending").textContent=pending;$("metricApproved").textContent=approved;$("metricPlan").textContent=currentUser.plan||"None";
 $("recentCampaigns").innerHTML=campaignTable(mine.slice(-5).reverse());$("allCampaigns").innerHTML=campaignTable(mine.slice().reverse());
 $("dashPricing").innerHTML=plans.map(p=>`<article class="price-card ${currentUser.plan===p.name?'featured':''}"><h3>${p.name}</h3><p>${p.desc}</p><div class="price">${p.price}</div><ul>${p.features.map(f=>`<li>${f}</li>`).join("")}</ul><button class="btn ${currentUser.plan===p.name?'btn-primary':'btn-outline'} choose-dash-plan" data-plan="${p.name}">${currentUser.plan===p.name?'Selected':'Select plan'}</button></article>`).join("");
 document.querySelectorAll(".choose-dash-plan").forEach(b=>b.onclick=()=>selectPlan(b.dataset.plan));
 if(isAdmin()){ $("adminUsers").textContent=users.length;$("adminCampaigns").textContent=campaigns.length;$("adminPending").textContent=campaigns.filter(c=>c.status==="Pending").length;$("adminPlans").textContent=users.filter(u=>u.plan&&u.plan!=="None").length;$("adminCampaignList").innerHTML=campaignTable(campaigns.slice().reverse(),true);$("adminUserList").innerHTML=users.length?`<table><thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>PLAN</th></tr></thead><tbody>${users.map(u=>`<tr><td>${safe(u.name)}</td><td>${safe(u.email)}</td><td>${safe(u.role)}</td><td>${safe(u.plan||"None")}</td></tr>`).join("")}</tbody></table>`:'<div class="empty-state">No users yet.</div>'; }
}
window.moderateCampaign=(id,status)=>{if(!isAdmin())return;campaigns=campaigns.map(c=>c.id===id?{...c,status}:c);saveAll();refreshDashboard();toast(`Campaign ${status.toLowerCase()}.`);};
function loadBusiness(){const b=currentUser.business||{};$("businessName").value=b.name||"";$("businessIndustry").value=b.industry||"";$("businessDescription").value=b.description||"";$("businessPhone").value=b.phone||"";$("businessWebsite").value=b.website||"";}
$("businessForm").addEventListener("submit",e=>{e.preventDefault();currentUser.business={name:$("businessName").value.trim(),industry:$("businessIndustry").value,description:$("businessDescription").value.trim(),phone:$("businessPhone").value.trim(),website:$("businessWebsite").value.trim()};users=users.map(u=>u.id===currentUser.id?currentUser:u);store.set("session",currentUser);saveAll();toast("Business profile saved.");});
$("campaignForm").addEventListener("submit",e=>{e.preventDefault();const business=currentUser.business?.name||"Business not yet set";campaigns.push({id:Date.now(),userId:currentUser.id,userEmail:currentUser.email,business,title:$("campaignTitle").value.trim(),channel:$("campaignChannel").value,description:$("campaignDescription").value.trim(),start:$("campaignStart").value,end:$("campaignEnd").value,asset:$("campaignAsset").value.trim(),date:new Date().toLocaleDateString(),status:"Pending"});saveAll();$("campaignForm").reset();refreshDashboard();toast("Campaign submitted for review.");});
function selectPlan(name){selectedPlan=name;$("planTitle").textContent=`${name} plan`;$("planDescription").textContent=name==="Enterprise"?"Thank you for your interest. Our team would contact you to discuss a tailored package.":`You selected the ${name} plan (${plans.find(p=>p.name===name).price}). Payment is not enabled in this prototype.`;openModal("planModal");}
document.querySelectorAll(".plan-button").forEach(b=>b.onclick=()=>selectPlan(b.dataset.plan));
$("planContinue").onclick=()=>{closeModals();if(!currentUser){showAuth("signup");toast("Create an account to save your plan selection.");return;}currentUser.plan=selectedPlan;users=users.map(u=>u.id===currentUser.id?currentUser:u);store.set("session",currentUser);saveAll();refreshDashboard();toast(`${selectedPlan} selected. Payment is not processed.`);};
$("menuToggle").onclick=()=>$("mainNav").classList.toggle("open");
$("year").textContent=new Date().getFullYear();
// Demo administrator: create this account only for local testing. Not secure for production.
if(!users.some(u=>u.email==="admin@bizbuz.test")){users.push({id:1,name:"BIZ-BUZ Admin",email:"admin@bizbuz.test",password:"Admin123!",role:"admin",plan:"None",business:{}});saveAll();}
if(currentUser){const fresh=users.find(u=>u.id===currentUser.id);if(fresh){currentUser=fresh;enterDashboard();}else{store.set("session",null);currentUser=null;}}
