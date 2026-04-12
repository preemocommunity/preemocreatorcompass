import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── EXACT SAME DESIGN SYSTEM AS DATA ROOM + DASHBOARD ───
const BRAND = {
  navy: "#0A1628",
  blue: "#1E3A5F",
  midBlue: "#2B5C8A",
  lightBlue: "#4A90D9",
  accentBlue: "#6BB5FF",
  skyBlue: "#E8F4FD",
  ice: "#F0F6FC",
  white: "#FFFFFF",
  glass: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(74,144,217,0.18)",
  glassHover: "rgba(255,255,255,0.88)",
  shadow: "0 8px 32px rgba(10,22,40,0.08)",
  shadowHover: "0 12px 40px rgba(10,22,40,0.14)",
  text: "#1A2A3A",
  textMuted: "#5A7080",
  textLight: "#8899AA",
};

const NICHES = ["Luxury Travel", "Lifestyle", "Food & Dining", "Fitness & Wellness", "Fashion", "Real Estate", "Adventure & Surf", "Digital Nomad", "Photography", "Nightlife", "Family Travel", "Sustainability"];
const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X", "LinkedIn", "Podcast"];
const STYLES = ["Cinematic", "Raw & Authentic", "Educational", "Entertaining", "Inspirational", "Behind the Scenes", "Review & Rating", "Day in the Life"];
const FOLLOWER_RANGES = ["Under 1K", "1K - 10K", "10K - 50K", "50K - 100K", "100K - 500K", "500K+"];
const COLLAB_TYPES = ["Free Stay / Meal", "Paid Partnership", "Affiliate", "Revenue Share", "Product Gift", "Any"];
const STATUSES = ["new", "contacted", "in_negotiation", "confirmed", "completed", "passed"];
const STATUS_LABELS = { new: "New", contacted: "Contacted", in_negotiation: "Negotiating", confirmed: "Confirmed ✓", completed: "Completed 🎉", passed: "Passed" };
const STATUS_COLORS = {
  new: { bg: "#F3F0FF", text: "#5B3FC5" },
  contacted: { bg: "#E8F4FD", text: "#1E3A5F" },
  in_negotiation: { bg: "#FFF3E0", text: "#B86E00" },
  confirmed: { bg: "#E6F4EA", text: "#1B7A3D" },
  completed: { bg: "#E6F4EA", text: "#1B7A3D" },
  passed: { bg: "#F5F5F5", text: "#888" },
};

// ─── SHARED STYLE PRIMITIVES (identical to other platforms) ───
const inp = {
  width: "100%", background: BRAND.ice, border: `1px solid ${BRAND.glassBorder}`,
  borderRadius: 12, padding: "11px 14px", fontSize: 13, color: BRAND.text,
  fontFamily: "'Montserrat', sans-serif", boxSizing: "border-box", outline: "none", marginBottom: 12,
};
const lbl = {
  fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
  color: BRAND.textLight, marginBottom: 6, display: "block",
};
const primaryBtn = {
  background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.midBlue} 100%)`,
  color: "#fff", border: "none", borderRadius: 10,
  fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 13,
  cursor: "pointer", boxShadow: "0 4px 16px rgba(10,22,40,0.2)", padding: "10px 24px",
};
const ghostBtn = {
  background: "transparent", color: BRAND.textMuted, border: `1px solid ${BRAND.glassBorder}`,
  borderRadius: 10, fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
  fontSize: 13, cursor: "pointer", padding: "10px 18px",
};

function Tag({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 10,
      border: active ? "none" : `1px solid ${BRAND.glassBorder}`,
      background: active ? BRAND.navy : BRAND.glass,
      color: active ? "#fff" : BRAND.text,
      fontSize: 12, fontWeight: 600, fontFamily: "'Montserrat', sans-serif",
      cursor: "pointer", transition: "all 0.2s", marginBottom: 4,
      backdropFilter: "blur(12px)", boxShadow: active ? "0 4px 16px rgba(10,22,40,0.2)" : "none",
    }}>
      {children}
    </button>
  );
}

// ─── IDENTICAL MODAL SHELL ───
function Modal({ onClose, children, maxWidth = 560 }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,22,40,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} onClick={onClose} />
      <div style={{ position: "relative", background: BRAND.white, borderRadius: 20, padding: 36, maxWidth, width: "100%", boxShadow: "0 24px 80px rgba(10,22,40,0.2)", border: `1px solid ${BRAND.glassBorder}`, maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: BRAND.textLight }}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ─── KPI CARD (identical to dashboard) ───
function KpiCard({ label, value, accent }) {
  return (
    <div style={{ background: BRAND.glass, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${BRAND.glassBorder}`, borderRadius: 16, padding: "20px 24px", boxShadow: BRAND.shadow }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: BRAND.textLight, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: accent ? BRAND.lightBlue : BRAND.navy, letterSpacing: "-1px" }}>{value}</div>
    </div>
  );
}

// ─── LOCK / ONBOARDING SCREEN ───
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ name: "", bio: "", niches: [], platforms: [], followers: "", style: [], collab: [], location: "Bali, Indonesia" });
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");

  useEffect(() => {
    supabase.from("brands").select("*").order("name").then(({ data }) => setBrands(data || []));
  }, []);

  const toggle = (field, val) => setProfile(p => ({
    ...p, [field]: p[field].includes(val) ? p[field].filter(x => x !== val) : [...p[field], val]
  }));

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", minHeight: "100vh", background: `linear-gradient(165deg, ${BRAND.white} 0%, ${BRAND.ice} 40%, ${BRAND.skyBlue} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,144,217,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,58,95,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 580, position: "relative", zIndex: 1 }}>
        {/* Header identity — same as all platforms */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.midBlue} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 auto 16px" }}>🧭</div>
          <div style={{ fontSize: 10, letterSpacing: "2.5px", color: BRAND.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Creator's Compass</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: BRAND.navy, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Find Your Perfect Collab</h1>
          <p style={{ fontSize: 14, color: BRAND.textMuted, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>Tell us about your content — we'll find the best Bali businesses to partner with</p>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? BRAND.lightBlue : BRAND.ice, transition: "background 0.3s" }} />
          ))}
        </div>

        {/* Glassmorphic card — identical style to data room */}
        <div style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, borderRadius: 20, padding: 32, boxShadow: BRAND.shadow }}>

          {step === 1 && (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.navy, marginBottom: 20 }}>Your Creator Profile</div>
              <label style={lbl}>Name / Handle</label>
              <input style={inp} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="@yourhandle" />
              <label style={lbl}>Short Bio</label>
              <textarea style={{ ...inp, minHeight: 70, resize: "none" }} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="e.g. Luxury travel creator based in Canggu, filming cinematic Bali content..." />
              <label style={lbl}>Your Platforms</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {PLATFORMS.map(p => <Tag key={p} active={profile.platforms.includes(p)} onClick={() => toggle("platforms", p)}>{p}</Tag>)}
              </div>
              <label style={lbl}>Follower Range</label>
              <select style={{ ...inp, cursor: "pointer" }} value={profile.followers} onChange={e => setProfile({ ...profile, followers: e.target.value })}>
                <option value="">Select range...</option>
                {FOLLOWER_RANGES.map(r => <option key={r}>{r}</option>)}
              </select>
              {brands.length > 0 && (
                <>
                  <label style={lbl}>Link to Prëmo Dashboard Brand (optional)</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
                    <option value="">Not linked</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
                  </select>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.navy, marginBottom: 20 }}>Your Content</div>
              <label style={lbl}>Content Niches</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {NICHES.map(n => <Tag key={n} active={profile.niches.includes(n)} onClick={() => toggle("niches", n)}>{n}</Tag>)}
              </div>
              <label style={lbl}>Content Style</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {STYLES.map(s => <Tag key={s} active={profile.style.includes(s)} onClick={() => toggle("style", s)}>{s}</Tag>)}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.navy, marginBottom: 20 }}>Collab Preferences</div>
              <label style={lbl}>Collab Types</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {COLLAB_TYPES.map(c => <Tag key={c} active={profile.collab.includes(c)} onClick={() => toggle("collab", c)}>{c}</Tag>)}
              </div>
              <label style={lbl}>Your Area in Bali</label>
              <input style={inp} value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="e.g. Canggu, Seminyak, Ubud..." />
              <div style={{ background: BRAND.skyBlue, borderRadius: 12, padding: "14px 16px", marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.midBlue, marginBottom: 4 }}>🧭 What happens next</div>
                <div style={{ fontSize: 12, color: BRAND.textMuted, lineHeight: 1.6 }}>The Compass finds matching Bali businesses, scores them by fit, and generates a personalized outreach message for each one. All saved to your profile.</div>
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 1 && <button onClick={() => setStep(s => s - 1)} style={ghostBtn}>← Back</button>}
            {step < 3
              ? <button onClick={() => setStep(s => s + 1)} style={{ ...primaryBtn, flex: 1 }}>Continue →</button>
              : <button onClick={() => onComplete({ ...profile, brand_id: selectedBrand || null })} style={{ ...primaryBtn, flex: 1 }}>🧭 Launch Compass</button>
            }
          </div>
        </div>

        <p style={{ fontSize: 11, color: BRAND.textLight, textAlign: "center", marginTop: 20 }}>Part of the Prëmo Inc. ecosystem · Creator tools built for Bali</p>
      </div>
    </div>
  );
}

// ─── COMPASS RUNNING ───
function CompassRunning({ profile, onResults }) {
  const phases = [
    "Scanning Bali business landscape...",
    "Matching by niche and content style...",
    "Scoring fit for your profile...",
    "Generating outreach messages...",
    "Saving your opportunities...",
  ];
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let p = 0;
    const timer = setInterval(() => { p++; setPhase(p); if (p >= phases.length - 1) clearInterval(timer); }, 1800);
    runCompassAgent(profile).then(results => { clearInterval(timer); setTimeout(() => onResults(results), 400); });
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", minHeight: "100vh", background: `linear-gradient(165deg, ${BRAND.white} 0%, ${BRAND.ice} 40%, ${BRAND.skyBlue} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ fontSize: 52, marginBottom: 24, display: "inline-block", animation: "spin 4s linear infinite" }}>🧭</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: BRAND.navy, marginBottom: 8 }}>Compass is calibrating...</h2>
        <p style={{ fontSize: 14, color: BRAND.textMuted, marginBottom: 32 }}>Finding the best Bali businesses for <strong>{profile.name || "you"}</strong></p>
        <div style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, borderRadius: 16, padding: "20px 24px", boxShadow: BRAND.shadow }}>
          {phases.map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < phases.length - 1 ? `1px solid ${BRAND.skyBlue}` : "none" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: i < phase ? BRAND.lightBlue : i === phase ? BRAND.accentBlue : BRAND.ice, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0, transition: "all 0.3s" }}>{i < phase ? "✓" : ""}</div>
              <span style={{ fontSize: 13, color: i <= phase ? BRAND.navy : BRAND.textLight, fontWeight: i === phase ? 600 : 400, animation: i === phase ? "pulse 1.5s ease infinite" : "none" }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AGENTS ───
async function runCompassAgent(profile) {
  const prompt = `You are Creator's Compass. Find 8 perfect Bali business collab partners for this creator.

Creator: ${profile.name} | Bio: ${profile.bio} | Platforms: ${profile.platforms.join(", ")} | Followers: ${profile.followers} | Niches: ${profile.niches.join(", ")} | Style: ${profile.style.join(", ")} | Collab types: ${profile.collab.join(", ")} | Location: ${profile.location}

Return ONLY a raw JSON array, no markdown:
[{"name":"","category":"","location":"","instagram":"@handle","fitScore":95,"fitReason":"one sentence","collabIdea":"specific idea","estimatedValue":"$X - $Y","contactType":"Instagram DM","emoji":"🏨"}]

Vary fit scores 70-98. Make businesses specific and realistic for Bali.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const businesses = JSON.parse((data.content?.[0]?.text || "[]").replace(/```json|```/g, "").trim());

    const { data: creator } = await supabase.from("creators").insert({
      name: profile.name, bio: profile.bio, niches: profile.niches,
      platforms: profile.platforms, followers: profile.followers,
      style: profile.style, collab_prefs: profile.collab,
      location: profile.location, brand_id: profile.brand_id || null,
    }).select().single();

    if (creator) {
      await supabase.from("collab_opportunities").insert(
        businesses.map(b => ({
          creator_id: creator.id, business_name: b.name, business_category: b.category,
          business_location: b.location, business_instagram: b.instagram,
          fit_score: b.fitScore, fit_reason: b.fitReason, collab_idea: b.collabIdea,
          estimated_value: b.estimatedValue, contact_type: b.contactType, emoji: b.emoji, status: "new",
        }))
      );
      return businesses.map(b => ({ ...b, creator_id: creator.id }));
    }
    return businesses;
  } catch (e) { return getFallback(); }
}

async function generateOutreach(business, profile) {
  const prompt = `Write a short personalized collab DM from ${profile.name || "a creator"} (${profile.niches.join(", ")} creator, ${profile.followers} followers on ${profile.platforms.join(", ")}) to ${business.name} (${business.category} in ${business.location}). Collab idea: ${business.collabIdea}. Under 120 words. Human and warm. Specific. Soft CTA. Return ONLY the message.`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "";
  } catch (e) {
    return `Hi! I'm ${profile.name || "a creator"} — I make ${profile.niches[0] || "lifestyle"} content on ${profile.platforms[0] || "Instagram"}. I love what you do at ${business.name} and I think we could create something really special together. Would love to chat about a collab — happy to come by and see the space. Let me know if you're open to it!`;
  }
}

function getFallback() {
  return [
    { name: "Katamama Boutique Hotel", category: "Luxury Boutique Hotel", location: "Seminyak", instagram: "@katamama", fitScore: 96, fitReason: "Perfect for luxury lifestyle content", collabIdea: "3-night stay + infinity pool content shoot", estimatedValue: "$1,200 - $3,000", contactType: "Instagram DM", emoji: "🏨" },
    { name: "Deus Ex Machina", category: "Lifestyle Brand & Café", location: "Canggu", instagram: "@deuscustoms", fitScore: 91, fitReason: "Iconic Bali brand with global reach", collabIdea: "Custom merch feature + café morning shoot", estimatedValue: "$500 - $1,500", contactType: "Email", emoji: "🏍️" },
    { name: "Finns Beach Club", category: "Beach Club", location: "Canggu", instagram: "@finnsbeachclub", fitScore: 89, fitReason: "Premier beach club for aspirational content", collabIdea: "Pool day access + sunset content shoot", estimatedValue: "$800 - $2,000", contactType: "Instagram DM", emoji: "🌊" },
    { name: "Avocado Factory", category: "Trendy Café", location: "Canggu", instagram: "@avocadofactorybali", fitScore: 84, fitReason: "Highly photogenic, massive social following", collabIdea: "Brunch content + story takeover", estimatedValue: "$150 - $400", contactType: "Instagram DM", emoji: "🥑" },
    { name: "Tropicola Beach Club", category: "Beach Club & Restaurant", location: "Seminyak", instagram: "@tropi_cola", fitScore: 87, fitReason: "Retro aesthetic, extremely photogenic", collabIdea: "Sunset dinner shoot + Instagram reel", estimatedValue: "$400 - $1,000", contactType: "Instagram DM", emoji: "🌅" },
    { name: "Pyramids of Chi", category: "Wellness & Sound Healing", location: "Ubud", instagram: "@pyramidsofchi", fitScore: 78, fitReason: "Unique spiritual experience, viral potential", collabIdea: "Sound healing session + transformation story", estimatedValue: "$200 - $500", contactType: "Email", emoji: "🔮" },
    { name: "Sea Circus", category: "Restaurant & Bar", location: "Seminyak", instagram: "@seacircusbali", fitScore: 82, fitReason: "Vibrant aesthetic, photographs beautifully", collabIdea: "Dinner for two + cocktail feature", estimatedValue: "$200 - $600", contactType: "Instagram DM", emoji: "🎪" },
    { name: "Canggu Community", category: "Co-working & Community", location: "Canggu", instagram: "@canggucommunity", fitScore: 75, fitReason: "Strong nomad creator community", collabIdea: "Day pass + workspace content series", estimatedValue: "$100 - $300", contactType: "Email", emoji: "💻" },
  ];
}

// ─── RESULTS — identical layout to dashboard brand view ───
function Results({ businesses, profile, onNewSearch }) {
  const [selected, setSelected] = useState(null);
  const [outreach, setOutreach] = useState({});
  const [generating, setGenerating] = useState(null);
  const [copied, setCopied] = useState(null);
  const [statuses, setStatuses] = useState({});

  const handleOutreach = async (biz) => {
    setGenerating(biz.name);
    const msg = await generateOutreach(biz, profile);
    setOutreach(o => ({ ...o, [biz.name]: msg }));
    if (biz.creator_id) {
      const { data: opp } = await supabase.from("collab_opportunities").select("id").eq("creator_id", biz.creator_id).eq("business_name", biz.name).single();
      if (opp) await supabase.from("outreach_messages").insert({ creator_id: biz.creator_id, opportunity_id: opp.id, message_text: msg, platform: profile.platforms[0] || "Instagram" });
    }
    setGenerating(null);
  };

  const handleStatus = async (biz, status) => {
    setStatuses(s => ({ ...s, [biz.name]: status }));
    if (biz.creator_id) {
      const { data: opp } = await supabase.from("collab_opportunities").select("id").eq("creator_id", biz.creator_id).eq("business_name", biz.name).single();
      if (opp) await supabase.from("collab_opportunities").update({ status }).eq("id", opp.id);
    }
  };

  const copy = (text, name) => { navigator.clipboard.writeText(text); setCopied(name); setTimeout(() => setCopied(null), 2000); };
  const sorted = [...businesses].sort((a, b) => b.fitScore - a.fitScore);
  const avgScore = Math.round(sorted.reduce((a, b) => a + b.fitScore, 0) / sorted.length);

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", minHeight: "100vh", background: `linear-gradient(165deg, ${BRAND.white} 0%, ${BRAND.ice} 40%, ${BRAND.skyBlue} 100%)`, color: BRAND.text, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,144,217,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,58,95,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* IDENTICAL HEADER TO ALL PLATFORMS */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${BRAND.glassBorder}`, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.midBlue} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>🧭</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.navy, letterSpacing: "1.5px" }}>CREATOR'S COMPASS</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: BRAND.textMuted, letterSpacing: "2.5px", textTransform: "uppercase", marginTop: -2 }}>Collab Opportunities</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", padding: "5px 12px", borderRadius: 20, background: BRAND.skyBlue, color: BRAND.midBlue }}>{profile.name}</span>
          <button onClick={onNewSearch} style={{ ...ghostBtn, padding: "8px 16px", fontSize: 12 }}>New Search</button>
        </div>
      </header>

      {/* CONTENT — same maxWidth, padding, spacing as dashboard */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Hero — same pattern as data room */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BRAND.lightBlue, marginBottom: 8 }}>Compass Results</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: BRAND.navy, letterSpacing: "-0.5px", marginBottom: 8 }}>{businesses.length} Collab Opportunities Found</h1>
          <p style={{ fontSize: 15, color: BRAND.textMuted, maxWidth: 600, lineHeight: 1.6 }}>{profile.niches.join(" · ")} · {profile.location}</p>
        </div>

        {/* KPI row — identical to dashboard */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
          <KpiCard label="Matches Found" value={businesses.length} />
          <KpiCard label="Top Fit Score" value={`${Math.max(...businesses.map(b => b.fitScore))}%`} accent />
          <KpiCard label="Avg Fit Score" value={`${avgScore}%`} />
          <KpiCard label="Est. Value" value="$150–$3K+" />
        </div>

        {/* Progress bar — identical to data room */}
        <div style={{ width: "100%", height: 4, borderRadius: 2, background: BRAND.ice, marginBottom: 8 }}>
          <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${BRAND.lightBlue} 0%, ${BRAND.accentBlue} 100%)`, width: `${avgScore}%`, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textLight, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 40 }}>{avgScore}% Average Fit Score</div>

        {/* Business cards — identical card style to data room doc cards */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: BRAND.textLight, marginBottom: 16 }}>Ranked by Fit Score</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {sorted.map((biz, i) => {
            const [hovered, setHovered] = useState(false);
            const status = statuses[biz.name] || "new";
            const sc = STATUS_COLORS[status];
            return (
              <div key={biz.name}
                style={{ background: hovered ? BRAND.glassHover : BRAND.glass, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${hovered ? BRAND.lightBlue : BRAND.glassBorder}`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.3s ease", boxShadow: hovered ? BRAND.shadowHover : BRAND.shadow, transform: hovered ? "translateY(-3px)" : "none", display: "flex", flexDirection: "column", gap: 10, position: "relative", overflow: "hidden" }}
                onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => setSelected(biz)}>

                {/* Card thumbnail — same style as data room */}
                <div style={{ width: "100%", height: 80, borderRadius: 10, background: `linear-gradient(135deg, ${BRAND.ice} 0%, ${BRAND.skyBlue} 50%, rgba(74,144,217,0.1) 100%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <span style={{ fontSize: 32 }}>{biz.emoji}</span>
                  {i === 0 && <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700, color: "#fff", background: BRAND.lightBlue, padding: "2px 8px", borderRadius: 20 }}>TOP MATCH</span>}
                  <span style={{ position: "absolute", top: 8, right: 8, fontSize: 14, fontWeight: 800, color: BRAND.lightBlue }}>{biz.fitScore}%</span>
                </div>

                <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.navy, lineHeight: 1.3 }}>{biz.name}</div>
                <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "3px 8px", borderRadius: 6, background: sc.bg, color: sc.text, alignSelf: "flex-start" }}>{STATUS_LABELS[status]}</span>
                <div style={{ fontSize: 11, color: BRAND.textLight }}>{biz.category} · {biz.location}</div>
                <div style={{ fontSize: 12, color: BRAND.textMuted, lineHeight: 1.5 }}>{biz.fitReason}</div>

                <div style={{ background: BRAND.skyBlue, borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: BRAND.midBlue, marginBottom: 2 }}>💡 COLLAB IDEA</div>
                  <div style={{ fontSize: 11, color: BRAND.textMuted }}>{biz.collabIdea}</div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.lightBlue }}>{biz.estimatedValue}</span>
                  <span style={{ fontSize: 10, color: BRAND.textLight }}>{biz.contactType}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "32px 24px", fontSize: 11, color: BRAND.textLight, letterSpacing: "1px", fontWeight: 500 }}>
        CREATOR'S COMPASS · PRËMO INC. ECOSYSTEM · CANGGU, BALI · {new Date().getFullYear()}
      </div>

      {/* MODAL — identical to data room and dashboard */}
      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 32 }}>{selected.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.navy }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: BRAND.textLight }}>{selected.category} · {selected.location}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: BRAND.lightBlue }}>{selected.fitScore}%</div>
          </div>

          <div style={{ height: 1, background: BRAND.skyBlue, margin: "0 0 16px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["Instagram", selected.instagram], ["Est. Value", selected.estimatedValue], ["Contact Via", selected.contactType], ["Location", selected.location]].map(([l, v]) => (
              <div key={l} style={{ background: BRAND.skyBlue, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: BRAND.textLight, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.navy }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ background: BRAND.skyBlue, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: BRAND.midBlue, marginBottom: 6 }}>💡 COLLAB IDEA</div>
            <div style={{ fontSize: 13, color: BRAND.textMuted, lineHeight: 1.6 }}>{selected.collabIdea}</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.navy, marginBottom: 8 }}>Update Status</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {STATUSES.map(s => {
                const sc = STATUS_COLORS[s];
                const active = (statuses[selected.name] || "new") === s;
                return <button key={s} onClick={() => handleStatus(selected, s)} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, border: `1.5px solid ${active ? sc.text : "transparent"}`, background: active ? sc.bg : "transparent", color: active ? sc.text : BRAND.textLight, cursor: "pointer", fontFamily: "'Montserrat', sans-serif" }}>{STATUS_LABELS[s]}</button>;
              })}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={lbl}>Notes & Outreach Message</label>
            {outreach[selected.name] ? (
              <>
                <div style={{ background: BRAND.ice, border: `1px solid ${BRAND.glassBorder}`, borderRadius: 12, padding: "14px 16px", fontSize: 13, color: BRAND.text, lineHeight: 1.7, marginBottom: 10 }}>{outreach[selected.name]}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => copy(outreach[selected.name], selected.name)} style={{ ...primaryBtn, flex: 1, padding: "10px 0", fontSize: 12 }}>{copied === selected.name ? "✓ Copied!" : "Copy Message"}</button>
                  <button onClick={() => handleOutreach(selected)} style={{ ...ghostBtn, padding: "10px 14px", fontSize: 12 }}>Regenerate</button>
                </div>
              </>
            ) : (
              <button onClick={() => handleOutreach(selected)} disabled={generating === selected.name} style={{ ...primaryBtn, width: "100%", padding: "12px 0", fontSize: 13 }}>
                {generating === selected.name ? "🧭 Generating..." : "🧭 Generate Outreach Message"}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ROOT ───
export default function App() {
  const [stage, setStage] = useState("onboard");
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{background:#F0F6FC;} button:hover{opacity:0.88;} select option{background:#fff;}`}</style>
      {stage === "onboard" && <Onboarding onComplete={p => { setProfile(p); setStage("running"); }} />}
      {stage === "running" && <CompassRunning profile={profile} onResults={r => { setResults(r); setStage("results"); }} />}
      {stage === "results" && <Results businesses={results} profile={profile} onNewSearch={() => { setStage("onboard"); setProfile(null); setResults([]); }} />}
    </>
  );
}
