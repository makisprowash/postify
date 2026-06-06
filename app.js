// Postify — app.js with Supabase Auth + Forgot Password + Personal Profile
const SCRAPER = "https://autolister-scraper-production.up.railway.app";
const SUPABASE_URL = "https://xfkunytzqduvgzauywtq.supabase.co";
const SUPABASE_KEY = "sb_publishable_ro3uOddWt3ZUtnT_ZTkIKw_v7L8_44S";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let state = {
  item: null, content: null, selectedPhotos: [],
  fbUser: null, user: null, profile: null
};

const SAMPLES = {
  ram: {
    year:2024,make:"RAM",model:"1500",trim:"Big Horn Crew Cab 4x4",
    extColor:"Patriot Blue Pearl",intColor:"Black/Diesel Gray",
    mileage:12480,price:44995,stockNumber:"P24831",vin:"1C6SRFFT3RN123456",
    features:["5.7L HEMI V8","8-Speed Auto","Trailer Tow Package","Heated Front Seats","Uconnect 12\"","Apple CarPlay","Bed Utility Group","Remote Start"],
    description:"Well-maintained one-owner RAM 1500 with full service history.",
    photos:["https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800","https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800","https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800","https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800"]
  },
  jeep: {
    year:2025,make:"Jeep",model:"Grand Cherokee",trim:"Limited 4x4",
    extColor:"Diamond Black Crystal",intColor:"Global Black Leather",
    mileage:5210,price:52490,stockNumber:"J25114",vin:"1C4RJFBG5PC200001",
    features:["3.6L Pentastar V6","Quadra-Trac II 4WD","Panoramic Sunroof","McIntosh Audio","Heated & Ventilated Seats","Navigation","Blind Spot Monitoring","Power Liftgate"],
    description:"Nearly new Grand Cherokee Limited with every luxury option.",
    photos:["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800","https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800","https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800","https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800","https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800"]
  },
  durango: {
    year:2024,make:"Dodge",model:"Durango",trim:"R/T AWD",
    extColor:"Destroyer Gray",intColor:"Black Nappa Leather",
    mileage:21300,price:48750,stockNumber:"D24567",vin:"1C4SDJCT5RC400012",
    features:["5.7L HEMI V8 eTorque","AWD","3-Row Seating","20\" Wheels","Harman Kardon Audio","Heated 2nd Row","Tow N Go Package","Performance Pages"],
    description:"Sporty and spacious — the perfect family hauler with muscle.",
    photos:["https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800","https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800","https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=800","https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800","https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800"]
  }
};

// ─── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener("load", async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    state.user = session.user;
    await loadProfile();
  } else {
    showAuth();
  }
});

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────
function showAuth() {
  document.getElementById("auth-screen").style.display = "flex";
  document.getElementById("setup-screen").style.display = "none";
  document.getElementById("main-app").style.display = "none";
}

function showSignup() {
  document.getElementById("signin-form").style.display = "none";
  document.getElementById("forgot-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
}

function showSignin() {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("forgot-form").style.display = "none";
  document.getElementById("signin-form").style.display = "block";
}

function forgotPassword() {
  document.getElementById("signin-form").style.display = "none";
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("forgot-form").style.display = "block";
}

// ─── SIGN IN ──────────────────────────────────────────────────────────────────
async function signIn() {
  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value;
  const errEl = document.getElementById("signin-error");
  const btn = document.getElementById("signin-btn");
  btn.disabled = true; btn.textContent = "Signing in...";
  errEl.style.display = "none";

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    errEl.textContent = error.message;
    errEl.style.display = "block";
    btn.disabled = false; btn.textContent = "Sign In";
    return;
  }
  state.user = data.user;
  await loadProfile();
}

// ─── SIGN UP ──────────────────────────────────────────────────────────────────
async function signUp() {
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const errEl = document.getElementById("signup-error");
  const btn = document.getElementById("signup-btn");
  btn.disabled = true; btn.textContent = "Creating account...";
  errEl.style.display = "none";

  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) {
    errEl.textContent = error.message;
    errEl.style.display = "block";
    btn.disabled = false; btn.textContent = "Create Account";
    return;
  }
  state.user = data.user;
  showSetup();
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
async function sendReset() {
  const email = document.getElementById("forgot-email").value.trim();
  const errEl = document.getElementById("forgot-error");
  const sucEl = document.getElementById("forgot-success");
  const btn = document.getElementById("forgot-btn");

  errEl.style.display = "none";
  sucEl.style.display = "none";

  if (!email) {
    errEl.textContent = "Please enter your email address.";
    errEl.style.display = "block";
    return;
  }

  btn.disabled = true; btn.textContent = "Sending...";

  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: "https://postify-ivory-gamma.vercel.app"
  });

  if (error) {
    errEl.textContent = error.message;
    errEl.style.display = "block";
    btn.disabled = false; btn.textContent = "Send Reset Link";
    return;
  }

  sucEl.textContent = "✓ Reset link sent! Check your email inbox.";
  sucEl.style.display = "block";
  btn.disabled = false; btn.textContent = "Send Reset Link";
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
async function loadProfile() {
  const { data } = await sb.from("profiles").select("*").eq("id", state.user.id).single();
  if (data && data.dealership_name) {
    state.profile = data;
    showApp();
  } else {
    showSetup();
  }
}

function showSetup() {
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("setup-screen").style.display = "block";
  document.getElementById("main-app").style.display = "none";
}

async function saveProfile() {
  const dealer = document.getElementById("setup-dealer").value.trim();
  const cell = document.getElementById("setup-cell").value.trim();
  if (!dealer || !cell) {
    alert("Please enter your dealership name and your direct cell number.");
    return;
  }

  const profile = {
    id: state.user.id,
    email: state.user.email,
    salesperson_name: document.getElementById("setup-name").value.trim(),
    salesperson_title: document.getElementById("setup-title").value.trim(),
    salesperson_cell: cell,
    salesperson_email: document.getElementById("setup-email-display").value.trim(),
    dealership_name: dealer,
    phone: document.getElementById("setup-phone").value.trim(),
    address: document.getElementById("setup-address").value.trim(),
    website: document.getElementById("setup-website").value.trim(),
    custom_cta: document.getElementById("setup-cta").value.trim()
  };

  const { error } = await sb.from("profiles").upsert(profile);
  if (error) { alert("Error saving profile: " + error.message); return; }
  state.profile = profile;
  showApp();
}

// ─── SHOW APP ─────────────────────────────────────────────────────────────────
function showApp() {
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("setup-screen").style.display = "none";
  document.getElementById("main-app").style.display = "block";

  const p = state.profile;
  if (state.user) {
    document.getElementById("user-email-display").textContent = p?.salesperson_name || state.user.email?.split("@")[0];
  }
  if (p?.dealership_name) {
    document.getElementById("dealer-badge").style.display = "flex";
    document.getElementById("dealer-name-display").textContent = p.salesperson_name ? `${p.salesperson_name} · ${p.dealership_name}` : p.dealership_name;
    document.getElementById("dealer-phone-display").textContent = p.salesperson_cell || p.phone || "";
  }

  // Auto-load from Chrome Extension
  const params = new URLSearchParams(window.location.search);
  const urlParam = params.get("url");
  const autoload = params.get("autoload");
  if (urlParam && autoload === "1") {
    document.getElementById("url-input").value = decodeURIComponent(urlParam);
    setTimeout(() => runGenerate(), 500);
  }
}

function showUserMenu() {
  const p = state.profile;
  const name = p?.salesperson_name || state.user?.email;
  if (confirm(`Signed in as ${name}\n\nClick OK to sign out.`)) {
    sb.auth.signOut().then(() => { state.user = null; state.profile = null; showAuth(); });
  }
}

function showSettings() {
  if (!state.profile) return;
  const p = state.profile;
  document.getElementById("setup-name").value = p.salesperson_name || "";
  document.getElementById("setup-title").value = p.salesperson_title || "";
  document.getElementById("setup-cell").value = p.salesperson_cell || "";
  document.getElementById("setup-email-display").value = p.salesperson_email || "";
  document.getElementById("setup-dealer").value = p.dealership_name || "";
  document.getElementById("setup-phone").value = p.phone || "";
  document.getElementById("setup-address").value = p.address || "";
  document.getElementById("setup-website").value = p.website || "";
  document.getElementById("setup-cta").value = p.custom_cta || "";
  showSetup();
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function setTab(tab, el) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("tab-url").style.display = tab === "url" ? "block" : "none";
  document.getElementById("tab-manual").style.display = tab === "manual" ? "block" : "none";
}

function setOTab(tab, el) {
  document.querySelectorAll(".otab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  ["content","photos","publish"].forEach(t => {
    document.getElementById(`otab-${t}`).style.display = t === tab ? "block" : "none";
  });
}

// ─── FACEBOOK ─────────────────────────────────────────────────────────────────
function connectFacebook() {
  if (state.fbUser) {
    state.fbUser = null;
    document.getElementById("fb-status").innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Connect Facebook`;
    updatePublishPanel(); return;
  }
  alert("In production: Facebook OAuth opens here.\nSimulating connection for demo.");
  state.fbUser = { name: state.profile?.salesperson_name || "Dealer", page: state.profile?.dealership_name || "Your Page" };
  document.getElementById("fb-status").innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> ${state.fbUser.page} ✓`;
  updatePublishPanel();
}

// ─── SAMPLES ──────────────────────────────────────────────────────────────────
async function loadSample(key) {
  const item = SAMPLES[key]; if (!item) return;
  clearOutput(); setStatus("AI is writing your listing...");
  state.item = item; state.selectedPhotos = [...(item.photos||[])];
  showItemStrip(item); await generate(item);
}

// ─── SCRAPE ───────────────────────────────────────────────────────────────────
async function runGenerate() {
  const url = document.getElementById("url-input").value.trim();
  if (!url) return;
  clearOutput(); setStatus("Extracting listing data...");
  try {
    const res = await fetch(`${SCRAPER}/scrape`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ url }), mode:"cors"
    });
    if (!res.ok) throw new Error(`Scraper error ${res.status}`);
    const item = await res.json();
    state.item = item; state.selectedPhotos = [...(item.photos||[])];
    showItemStrip(item); setStatus("AI is writing your listing...");
    await generate(item);
  } catch(e) { setError(e.message); }
}

// ─── MANUAL ───────────────────────────────────────────────────────────────────
async function runManual() {
  const title = document.getElementById("m-title").value.trim();
  if (!title) { setError("Please enter a title."); return; }
  const photos = document.getElementById("m-photos").value.split("\n").filter(Boolean);
  const item = {
    title,
    category: document.getElementById("m-category").value,
    price: parseFloat(document.getElementById("m-price").value)||0,
    location: document.getElementById("m-location").value,
    features: document.getElementById("m-details").value.split(",").map(s=>s.trim()).filter(Boolean),
    photos
  };
  state.item = item; state.selectedPhotos = [...photos];
  clearOutput(); showItemStrip(item); setStatus("AI is writing your listing...");
  await generate(item);
}

// ─── GENERATE ─────────────────────────────────────────────────────────────────
async function generate(item) {
  try {
    const res = await fetch(`${SCRAPER}/generate`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ vehicle: item, profile: state.profile }), mode:"cors"
    });
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error||`Error ${res.status}`); }
    const content = await res.json();
    if (content.error) throw new Error(content.error);
    state.content = content; clearStatus(); renderOutput(content, item);
  } catch(e) { setError("AI generation failed: " + e.message); }
}

async function regenField(field) {
  if (!state.item) return;
  document.getElementById(`regen-${field}`).textContent = "...";
  try { await generate(state.item); } catch(e) {}
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function renderOutput(c, item) {
  document.getElementById("output-section").style.display = "block";
  renderCard("out-title-card","FB Title","label-blue",`<div class="out-card-body" style="font-weight:600;font-size:14px">${c.title}</div>`,c.title,"title");
  renderCard("out-seo-card","SEO Title","label-teal",`<div class="out-card-body">${c.seoTitle}</div>`,c.seoTitle,"seoTitle");
  renderCard("out-desc-card","Description","label-purple",`<div class="out-card-body" style="white-space:pre-line">${c.description}</div>`,c.description,"description");
  const hl = c.highlights?.map(h=>`<div class="highlight-item"><span class="highlight-dot">✓</span><span>${h}</span></div>`).join("")||"";
  renderCard("out-highlights-card","Highlights","label-amber",`<div class="out-card-body">${hl}</div>`,c.highlights?.map(h=>`• ${h}`).join("\n")||"","highlights");
  renderCard("out-financing-card","Financing","label-green",`<div class="out-card-body">${c.financing}</div>`,c.financing,"financing");
  renderCard("out-cta-card","Call to Action","label-coral",`<div class="out-card-body" style="font-weight:500">${c.cta}</div>`,c.cta,"cta");
  renderPhotos(item.photos||[]);
  updatePublishPanel();
}

function renderCard(id, label, lc, body, copyText, field) {
  document.getElementById(id).innerHTML = `
    <div class="out-card-header">
      <span class="out-label ${lc}">${label}</span>
      <div class="out-card-actions">
        <button class="out-action-btn" id="regen-${field}" onclick="regenField('${field}')">↺ Regen</button>
        <button class="out-action-btn" onclick="copyText(\`${copyText.replace(/`/g,'\\`')}\`,this)">Copy</button>
      </div>
    </div>${body}`;
}

function renderPhotos(photos) {
  const grid = document.getElementById("photo-grid");
  if (!photos.length) { grid.innerHTML = '<div style="color:#9ca3af;font-size:13px;padding:12px">No photos found.</div>'; return; }
  grid.innerHTML = photos.map((url,i) => {
    const sel = state.selectedPhotos.includes(url), idx = state.selectedPhotos.indexOf(url);
    return `<div class="photo-item ${sel?'selected':''}" onclick="togglePhoto('${url}',this)">
      <img src="${url}" onerror="this.parentElement.style.display='none'"/>
      ${sel?`<div class="photo-num">${idx+1}</div>`:`<div class="photo-overlay"><span style="color:white;font-size:24px">+</span></div>`}
    </div>`;
  }).join("");
  updatePhotoCount();
}

function togglePhoto(url) {
  state.selectedPhotos = state.selectedPhotos.includes(url)
    ? state.selectedPhotos.filter(p=>p!==url)
    : [...state.selectedPhotos, url];
  renderPhotos(state.item?.photos||[]);
  updatePhotoCount();
}

function selectAllPhotos() { state.selectedPhotos=[...(state.item?.photos||[])]; renderPhotos(state.item?.photos||[]); }
function clearPhotos() { state.selectedPhotos=[]; renderPhotos(state.item?.photos||[]); }
function updatePhotoCount() { document.getElementById("photo-count").textContent=`${state.selectedPhotos.length} selected`; }

function updatePublishPanel() {
  const meta = document.getElementById("publish-meta");
  const wrap = document.getElementById("fb-post-btn-wrap");
  if (meta) meta.textContent = `${state.selectedPhotos.length} photo${state.selectedPhotos.length!==1?"s":""} selected · All copy ready`;
  if (wrap) wrap.innerHTML = state.fbUser
    ? `<button class="btn-fb" onclick="postToFacebook()"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>Post to Facebook Marketplace</button>`
    : `<div style="padding:10px;background:#f9fafb;border-radius:8px;font-size:13px;color:#6b7280;text-align:center;margin-bottom:8px">Connect Facebook above to enable one-click posting</div>`;
}

function postToFacebook() { alert("Full auto-posting requires Meta API approval.\n\nUse the Copy button below to post manually."); }

function copyAndOpenFB() {
  if (!state.content) return;
  const c = state.content;
  const full = [c.title,"",c.description,"",c.highlights?.map(h=>`• ${h}`).join("\n"),"",c.financing,"",c.cta].join("\n");
  navigator.clipboard.writeText(full).then(() => window.open("https://www.facebook.com/marketplace/create/vehicle","_blank"));
}

function showItemStrip(item) {
  const name = item.title||`${item.year||""} ${item.make||""} ${item.model||""} ${item.trim||""}`.trim();
  const strip = document.getElementById("item-strip");
  strip.style.display = "flex";
  strip.innerHTML = `<strong>${name}</strong>
    ${item.mileage?`<span>${Number(item.mileage).toLocaleString()} mi</span>`:""}
    ${item.price?`<span>$${Number(item.price).toLocaleString()}</span>`:""}
    ${item.photos?.length?`<span class="strip-tag">📷 ${item.photos.length} photos</span>`:""}`;
}

function setStatus(msg) {
  const el = document.getElementById("status-bar");
  el.style.display="flex"; el.textContent=msg;
  document.getElementById("error-bar").style.display="none";
}
function clearStatus() { document.getElementById("status-bar").style.display="none"; }
function setError(msg) {
  clearStatus();
  const el = document.getElementById("error-bar");
  el.style.display="block"; el.textContent=msg;
}
function clearOutput() {
  document.getElementById("output-section").style.display="none";
  document.getElementById("item-strip").style.display="none";
  document.getElementById("error-bar").style.display="none";
  document.getElementById("status-bar").style.display="none";
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text);
  const orig = btn.textContent; btn.textContent="Copied!";
  setTimeout(()=>btn.textContent=orig,1800);
}

function copyAll() {
  if (!state.content) return;
  const c = state.content;
  const full = [c.title,"",c.description,"",c.highlights?.map(h=>`• ${h}`).join("\n"),"",c.financing,"",c.cta].join("\n");
  navigator.clipboard.writeText(full);
  event.target.textContent="Copied!";
  setTimeout(()=>event.target.textContent="Copy Full Listing",1800);
}

document.getElementById("url-input").addEventListener("keydown", e => {
  if(e.key==="Enter") runGenerate();
});
