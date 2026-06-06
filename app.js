// Postify — app.js
const SCRAPER = "https://autolister-scraper-production.up.railway.app";
const CLAUDE  = "https://api.anthropic.com/v1/messages";

// ─── STATE ────────────────────────────────────────────────────────────────────
let state = {
  item: null,
  content: null,
  selectedPhotos: [],
  fbUser: null,
  activeTab: "url",
  activeOTab: "copy"
};

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────
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

// ─── TAB SWITCHING ────────────────────────────────────────────────────────────
function setTab(tab, el) {
  state.activeTab = tab;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("tab-url").style.display = tab === "url" ? "block" : "none";
  document.getElementById("tab-manual").style.display = tab === "manual" ? "block" : "none";
}

function setOTab(tab, el) {
  state.activeOTab = tab;
  document.querySelectorAll(".otab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  ["copy","photos","publish"].forEach(t => {
    document.getElementById(`otab-${t}`).style.display = t === tab ? "block" : "none";
  });
}

// ─── FACEBOOK ─────────────────────────────────────────────────────────────────
function connectFacebook() {
  if (state.fbUser) {
    state.fbUser = null;
    const btn = document.getElementById("fb-status");
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Connect Facebook`;
    btn.classList.remove("connected");
    updatePublishPanel();
    return;
  }
  alert("In production: Facebook OAuth popup opens here.\n\nSimulating successful connection.");
  state.fbUser = { name: "Marko Petricevic", page: "Folsom Lake CDJR" };
  const btn = document.getElementById("fb-status");
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> ${state.fbUser.page} ✓`;
  btn.classList.add("connected");
  updatePublishPanel();
}

// ─── LOAD SAMPLE ──────────────────────────────────────────────────────────────
async function loadSample(key) {
  const item = SAMPLES[key];
  if (!item) return;
  setStatus("AI is writing your listing...");
  state.item = item;
  state.selectedPhotos = [...(item.photos || [])];
  showItemStrip(item);
  await generate(item);
}

// ─── URL SCRAPE ───────────────────────────────────────────────────────────────
async function runGenerate() {
  const url = document.getElementById("url-input").value.trim();
  if (!url) return;
  clearOutput();
  setStatus("Extracting listing data...");
  try {
    const res = await fetch(`${SCRAPER}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      mode: "cors"
    });
    if (!res.ok) throw new Error(`Scraper error ${res.status}`);
    const item = await res.json();
    state.item = item;
    state.selectedPhotos = [...(item.photos || [])];
    showItemStrip(item);
    setStatus("AI is writing your listing...");
    await generate(item);
  } catch (e) {
    setError(e.message);
  }
}

// ─── MANUAL ENTRY ─────────────────────────────────────────────────────────────
async function runManual() {
  const title = document.getElementById("m-title").value.trim();
  if (!title) { setError("Please enter a title."); return; }
  const photos = document.getElementById("m-photos").value.split("\n").filter(Boolean);
  const item = {
    title,
    category: document.getElementById("m-category").value,
    price: parseFloat(document.getElementById("m-price").value) || 0,
    location: document.getElementById("m-location").value,
    features: document.getElementById("m-details").value.split(",").map(s => s.trim()).filter(Boolean),
    photos
  };
  state.item = item;
  state.selectedPhotos = [...photos];
  clearOutput();
  showItemStrip(item);
  setStatus("AI is writing your listing...");
  await generate(item);
}

// ─── AI GENERATE ─────────────────────────────────────────────────────────────
async function generate(item) {
  try {
    const feats = Array.isArray(item.features) ? item.features.join(", ") : (item.features || "");
    const name = item.title || `${item.year||""} ${item.make||""} ${item.model||""} ${item.trim||""}`.trim();
    const prompt = `You are Postify AI, an expert listing copywriter for Facebook Marketplace at Folsom Lake CDJR in Folsom, CA.

Item: ${name}
Category: ${item.category || "Vehicle"}
Price: $${Number(item.price||0).toLocaleString()}
Location: ${item.location || "Folsom, CA"}
Details: ${feats || "N/A"}
VIN: ${item.vin || "N/A"} | Stock: ${item.stockNumber || "N/A"}
Mileage: ${item.mileage ? Number(item.mileage).toLocaleString() + " miles" : "N/A"}
Exterior: ${item.extColor || "N/A"} | Interior: ${item.intColor || "N/A"}
Notes: ${item.description || ""}

Return ONLY valid JSON, no markdown:
{"title":"Facebook Marketplace title max 100 chars, no emojis","description":"3 paragraphs. Para 1: item appeal. Para 2: key features/details. Para 3: why buy from Folsom Lake CDJR. Friendly NorCal tone.","highlights":["5-7 bullet points each starting with a power word"],"financing":"2-3 sentences about flexible financing, all credit welcome. No specific APR.","cta":"2 sentences. Urgency + contact. Mention Folsom Lake CDJR.","seoTitle":"SEO variant with Folsom CA or NorCal"}`;

    const res = await fetch(CLAUDE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!res.ok) throw new Error(`Claude API error ${res.status}`);
    const data = await res.json();
    const text = data.content?.map(b => b.text || "").join("") || "";
    const content = JSON.parse(text.replace(/```json|```/g, "").trim());
    state.content = content;
    clearStatus();
    renderOutput(content, item);
  } catch (e) {
    setError("AI generation failed: " + e.message);
  }
}

// ─── REGEN SINGLE FIELD ───────────────────────────────────────────────────────
async function regenField(field) {
  if (!state.item) return;
  document.getElementById(`regen-${field}`).textContent = "...";
  try {
    await generate(state.item);
  } catch(e) {}
}

// ─── RENDER OUTPUT ────────────────────────────────────────────────────────────
function renderOutput(c, item) {
  document.getElementById("output-section").style.display = "block";

  renderCard("out-title-card", "FB Title", "label-blue", `<div class="out-card-body title">${c.title}</div>`, c.title, "title");
  renderCard("out-seo-card", "SEO Title", "label-teal", `<div class="out-card-body">${c.seoTitle}</div>`, c.seoTitle, "seoTitle");
  renderCard("out-desc-card", "Description", "label-purple", `<div class="out-card-body" style="white-space:pre-line">${c.description}</div>`, c.description, "description");

  const highlights = c.highlights?.map(h => `<div class="highlight-item"><span class="highlight-dot">✓</span><span>${h}</span></div>`).join("") || "";
  renderCard("out-highlights-card", "Highlights", "label-amber", `<div class="out-card-body">${highlights}</div>`, c.highlights?.map(h=>`• ${h}`).join("\n") || "", "highlights");
  renderCard("out-financing-card", "Financing", "label-green", `<div class="out-card-body">${c.financing}</div>`, c.financing, "financing");
  renderCard("out-cta-card", "Call to Action", "label-coral", `<div class="out-card-body" style="font-weight:500">${c.cta}</div>`, c.cta, "cta");

  renderPhotos(item.photos || []);
  updatePublishPanel();
}

function renderCard(id, label, labelClass, bodyHtml, copyText, field) {
  document.getElementById(id).innerHTML = `
    <div class="out-card-header">
      <span class="out-label ${labelClass}">${label}</span>
      <div class="out-card-actions">
        <button class="out-action-btn" id="regen-${field}" onclick="regenField('${field}')">↺ Regen</button>
        <button class="out-action-btn" onclick="copyText(\`${copyText.replace(/`/g,'\\`')}\`, this)">Copy</button>
      </div>
    </div>
    ${bodyHtml}
  `;
}

function renderPhotos(photos) {
  const grid = document.getElementById("photo-grid");
  if (!photos.length) { grid.innerHTML = '<div style="color:#9ca3af;font-size:13px;padding:12px">No photos found. Add URLs in Manual Entry.</div>'; return; }
  grid.innerHTML = photos.map((url, i) => {
    const sel = state.selectedPhotos.includes(url);
    const idx = state.selectedPhotos.indexOf(url);
    return `<div class="photo-item ${sel ? 'selected' : ''}" onclick="togglePhoto('${url}', this)">
      <img src="${url}" onerror="this.parentElement.style.display='none'" />
      ${sel ? `<div class="photo-num">${idx+1}</div>` : `<div class="photo-overlay"><span style="color:white;font-size:24px">+</span></div>`}
    </div>`;
  }).join("");
  updatePhotoCount();
}

function togglePhoto(url, el) {
  if (state.selectedPhotos.includes(url)) {
    state.selectedPhotos = state.selectedPhotos.filter(p => p !== url);
  } else {
    state.selectedPhotos.push(url);
  }
  renderPhotos(state.item?.photos || []);
  updatePhotoCount();
}

function selectAllPhotos() { state.selectedPhotos = [...(state.item?.photos || [])]; renderPhotos(state.item?.photos || []); }
function clearPhotos() { state.selectedPhotos = []; renderPhotos(state.item?.photos || []); }
function updatePhotoCount() {
  document.getElementById("photo-count").textContent = `${state.selectedPhotos.length} selected`;
}

function updatePublishPanel() {
  const meta = document.getElementById("publish-meta");
  const wrap = document.getElementById("fb-post-btn-wrap");
  if (meta) meta.textContent = `${state.selectedPhotos.length} photo${state.selectedPhotos.length!==1?"s":""} selected · All copy ready`;
  if (wrap) {
    if (state.fbUser) {
      wrap.innerHTML = `<button class="btn-fb-post" onclick="postToFacebook()">Post to Facebook Marketplace</button>`;
    } else {
      wrap.innerHTML = `<div class="fb-note">Connect Facebook above to enable one-click posting</div>`;
    }
  }
}

function postToFacebook() {
  alert("Full Facebook posting requires Meta Marketplace API approval.\n\nUse 'Copy listing + open Facebook' to post manually right now.");
}

function copyAndOpenFB() {
  if (!state.content) return;
  const c = state.content;
  const full = [c.title, "", c.description, "", c.highlights?.map(h=>`• ${h}`).join("\n"), "", c.financing, "", c.cta].join("\n");
  navigator.clipboard.writeText(full).then(() => {
    window.open("https://www.facebook.com/marketplace/create/vehicle", "_blank");
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function showItemStrip(item) {
  const name = item.title || `${item.year||""} ${item.make||""} ${item.model||""} ${item.trim||""}`.trim();
  const strip = document.getElementById("item-strip");
  strip.style.display = "flex";
  strip.innerHTML = `
    <strong>${name}</strong>
    ${item.mileage ? `<span>${Number(item.mileage).toLocaleString()} mi</span>` : ""}
    ${item.price ? `<span>$${Number(item.price).toLocaleString()}</span>` : ""}
    ${item.photos?.length ? `<span class="strip-tag">📷 ${item.photos.length} photos</span>` : ""}
  `;
}

function setStatus(msg) {
  const el = document.getElementById("status-bar");
  el.style.display = "flex";
  el.textContent = msg;
  document.getElementById("error-bar").style.display = "none";
}

function clearStatus() {
  document.getElementById("status-bar").style.display = "none";
}

function setError(msg) {
  clearStatus();
  const el = document.getElementById("error-bar");
  el.style.display = "block";
  el.textContent = msg;
}

function clearOutput() {
  document.getElementById("output-section").style.display = "none";
  document.getElementById("item-strip").style.display = "none";
  document.getElementById("error-bar").style.display = "none";
  document.getElementById("status-bar").style.display = "none";
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text);
  const orig = btn.textContent;
  btn.textContent = "Copied!";
  setTimeout(() => btn.textContent = orig, 1800);
}

function copyAll() {
  if (!state.content) return;
  const c = state.content;
  const full = [c.title, "", c.description, "", c.highlights?.map(h=>`• ${h}`).join("\n"), "", c.financing, "", c.cta].join("\n");
  navigator.clipboard.writeText(full);
  const btn = event.target;
  btn.textContent = "Copied!";
  setTimeout(() => btn.textContent = "Copy Full Listing", 1800);
}

// Enter key on URL input
document.getElementById("url-input").addEventListener("keydown", e => {
  if (e.key === "Enter") runGenerate();
});
