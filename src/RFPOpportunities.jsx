// RFPOpportunities.jsx
// New tab in Creator's Compass — shows live RFP campaigns from Supabase
// Creators can browse and apply. Brands can see their posted RFPs.
// Drop this into the Creator's Compass App.jsx as a new tab.

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const B = {
  navy:"#0A1628", blue:"#1E3A5F", midBlue:"#2B5C8A", lightBlue:"#4A90D9",
  accentBlue:"#6BB5FF", skyBlue:"#E8F4FD", ice:"#F0F6FC", white:"#FFFFFF",
  glass:"rgba(255,255,255,0.72)", glassBorder:"rgba(74,144,217,0.18)",
  glassHover:"rgba(255,255,255,0.92)", shadow:"0 8px 32px rgba(10,22,40,0.08)",
  shadowHover:"0 12px 40px rgba(10,22,40,0.14)", text:"#1A2A3A",
  textMuted:"#5A7080", textLight:"#8899AA",
  green:"#1B7A3D", greenBg:"#E6F4EA",
};

const inp = { width:"100%", background:B.ice, border:`1px solid ${B.glassBorder}`, borderRadius:10, padding:"11px 14px", fontSize:13, color:B.text, fontFamily:"'Montserrat',sans-serif", boxSizing:"border-box", outline:"none", marginBottom:12 };
const primaryBtn = { background:`linear-gradient(135deg,${B.navy} 0%,${B.midBlue} 100%)`, color:"#fff", border:"none", borderRadius:10, fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:"0 4px 16px rgba(10,22,40,0.2)", padding:"10px 22px" };

// ── APPLY MODAL ─────────────────────────────────────────────────
function ApplyModal({ campaign, onClose }) {
  const [form, setForm] = useState({ name:"", email:"", pitch:"", portfolio_url:"", follower_count:"" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    const { error } = await supabase.from("campaign_applications").insert({
      campaign_id: campaign.id,
      creator_name: form.name,
      creator_email: form.email,
      pitch: form.pitch,
      portfolio_url: form.portfolio_url,
      follower_count: parseInt(form.follower_count) || 0,
    });
    setSubmitting(false);
    if (!error) setSubmitted(true);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,22,40,0.45)", backdropFilter:"blur(8px)" }} onClick={onClose} />
      <div style={{ position:"relative", background:B.white, border:`1px solid ${B.glassBorder}`, borderRadius:20, padding:36, maxWidth:500, width:"100%", boxShadow:"0 24px 80px rgba(10,22,40,0.18)", maxHeight:"90vh", overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", fontSize:20, cursor:"pointer", color:B.textLight }}>✕</button>

        {submitted ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>✓</div>
            <div style={{ fontSize:18, fontWeight:700, color:B.navy, marginBottom:8 }}>Application Sent</div>
            <div style={{ fontSize:13, color:B.textMuted }}>The brand will review your profile and reach out if it's a match.</div>
            <button onClick={onClose} style={{ ...primaryBtn, marginTop:20, padding:"11px 28px" }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:B.lightBlue, marginBottom:6 }}>Apply to RFP</div>
            <h3 style={{ fontSize:18, fontWeight:800, color:B.navy, marginBottom:4 }}>{campaign.title}</h3>
            <div style={{ fontSize:12, color:B.textMuted, marginBottom:24 }}>{campaign.brand_name} · {campaign.location}</div>

            {[
              ["name","Your name","text",true],
              ["email","Your email","email",true],
              ["portfolio_url","Portfolio / social link","text",false],
              ["follower_count","Total followers (combined)","number",false],
            ].map(([key, placeholder, type, required]) => (
              <div key={key}>
                <input
                  type={type} placeholder={`${placeholder}${required?" *":""}`} required={required}
                  value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={inp}
                />
              </div>
            ))}

            <textarea
              placeholder="Tell them why you're the right fit for this campaign *"
              value={form.pitch} onChange={e => setForm(f => ({ ...f, pitch: e.target.value }))}
              rows={4}
              style={{ ...inp, resize:"vertical", minHeight:90, marginBottom:16 }}
            />

            <button onClick={handleSubmit} disabled={submitting || !form.name || !form.email}
              style={{ ...primaryBtn, width:"100%", padding:"13px 0", opacity:submitting || !form.name || !form.email ? 0.5 : 1 }}>
              {submitting ? "Sending..." : "Submit Application →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── RFP CARD ──────────────────────────────────────────────────
function RFPCard({ campaign, onApply }) {
  const [hovered, setHovered] = useState(false);

  const daysLeft = campaign.rfp_closes_at
    ? Math.max(0, Math.ceil((new Date(campaign.rfp_closes_at) - new Date()) / (1000*60*60*24)))
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? B.glassHover : B.glass,
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: `1.5px solid ${hovered ? B.lightBlue : B.glassBorder}`,
        borderRadius: 16, padding: "22px 20px",
        transition: "all 0.2s", boxShadow: hovered ? B.shadowHover : B.shadow,
        transform: hovered ? "translateY(-4px)" : "none",
      }}
    >
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:B.lightBlue, marginBottom:4 }}>
            {campaign.brand_name}
          </div>
          <div style={{ fontSize:15, fontWeight:800, color:B.navy, lineHeight:1.3 }}>
            {campaign.title}
          </div>
        </div>
        {daysLeft !== null && (
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"1px", padding:"3px 9px", borderRadius:20, background:daysLeft <= 3 ? "#FEE2E2" : B.skyBlue, color:daysLeft <= 3 ? "#C0392B" : B.midBlue, whiteSpace:"nowrap", flexShrink:0, marginLeft:10 }}>
            {daysLeft === 0 ? "Closes today" : `${daysLeft}d left`}
          </span>
        )}
      </div>

      {/* Description */}
      {campaign.description && (
        <div style={{ fontSize:12, color:B.textMuted, lineHeight:1.65, marginBottom:12 }}>{campaign.description}</div>
      )}

      {/* Details row */}
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:14 }}>
        {campaign.deliverables > 0 && (
          <div style={{ fontSize:11, color:B.textMuted }}>
            <span style={{ fontWeight:700, color:B.navy }}>{campaign.deliverables}</span> deliverables
          </div>
        )}
        {campaign.budget_min > 0 && (
          <div style={{ fontSize:11, color:B.textMuted }}>
            <span style={{ fontWeight:700, color:B.green }}>${campaign.budget_min.toLocaleString()}{campaign.budget_max > campaign.budget_min ? `–$${campaign.budget_max.toLocaleString()}` : ""}</span> budget
          </div>
        )}
        {campaign.location && (
          <div style={{ fontSize:11, color:B.textMuted }}>📍 {campaign.location}</div>
        )}
      </div>

      {/* Platforms + Niches */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:16 }}>
        {(campaign.platforms || []).map(p => (
          <span key={p} style={{ fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:6, background:B.navy, color:"#fff" }}>{p}</span>
        ))}
        {(campaign.niches || []).map(n => (
          <span key={n} style={{ fontSize:9, fontWeight:600, padding:"3px 8px", borderRadius:6, background:B.skyBlue, color:B.midBlue }}>{n}</span>
        ))}
      </div>

      {/* CTA */}
      <button onClick={() => onApply(campaign)} style={{ ...primaryBtn, width:"100%", padding:"11px 0", fontSize:13 }}>
        Apply Now →
      </button>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────
// Usage in Creator's Compass App.jsx:
// <RFPOpportunities userType="creator" />
// or
// <RFPOpportunities userType="brand" brandFilter="Ayook" />

export default function RFPOpportunities({ userType = "creator", brandFilter }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [applying, setApplying]   = useState(null); // campaign being applied to
  const [search, setSearch]       = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");

  useEffect(() => {
    let query = supabase.from("campaigns").select("*").eq("status", "open_rfp").order("created_at", { ascending: false });
    if (brandFilter) query = query.ilike("brand_name", `%${brandFilter}%`);

    query.then(({ data, error }) => {
      setLoading(false);
      if (!error && data) setCampaigns(data);
    });
  }, [brandFilter]);

  const allPlatforms = ["All", ...new Set(campaigns.flatMap(c => c.platforms || []))];

  const filtered = campaigns.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.brand_name.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === "All" || (c.platforms || []).includes(platformFilter);
    return matchSearch && matchPlatform;
  });

  if (loading) return (
    <div style={{ padding:"40px 24px", textAlign:"center" }}>
      <div style={{ fontSize:12, color:B.textMuted, fontWeight:600 }}>Loading opportunities...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:B.lightBlue, marginBottom:6 }}>
          Open RFPs
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:12, marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:24, fontWeight:800, color:B.navy, letterSpacing:"-0.5px" }}>
              {filtered.length} Open Opportunit{filtered.length !== 1 ? "ies" : "y"}
            </h2>
            <p style={{ fontSize:13, color:B.textMuted }}>Brands and agencies looking for creators — apply directly.</p>
          </div>
        </div>

        {/* Search + filter */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <input
            placeholder="Search by brand or campaign..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inp, maxWidth:320, marginBottom:0, flex:1 }}
          />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {allPlatforms.map(p => (
              <button key={p} onClick={() => setPlatformFilter(p)}
                style={{ padding:"8px 14px", borderRadius:20, fontSize:11, fontWeight:600, fontFamily:"'Montserrat',sans-serif", cursor:"pointer", background:platformFilter===p?B.navy:B.glass, color:platformFilter===p?"#fff":B.text, border:`1px solid ${platformFilter===p?B.navy:B.glassBorder}`, backdropFilter:"blur(12px)" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RFP grid */}
      {filtered.length === 0 ? (
        <div style={{ background:B.glass, backdropFilter:"blur(16px)", border:`1px solid ${B.glassBorder}`, borderRadius:14, padding:"40px 24px", textAlign:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:B.navy, marginBottom:8 }}>No open opportunities right now</div>
          <div style={{ fontSize:12, color:B.textMuted }}>Check back soon — new campaigns are posted regularly.</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:14 }}>
          {filtered.map(c => (
            <RFPCard key={c.id} campaign={c} onApply={setApplying} />
          ))}
        </div>
      )}

      {/* Apply modal */}
      {applying && <ApplyModal campaign={applying} onClose={() => setApplying(null)} />}
    </div>
  );
}

// ── POST RFP FORM (for Brand/Agency view in Creator's Compass) ──
export function PostRFPForm({ onSuccess }) {
  const [form, setForm] = useState({
    title:"", brand_name:"", description:"", deliverables:20, budget_min:0, budget_max:0,
    location:"Bali, Indonesia", platforms:[], niches:[], rfp_closes_at:"",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const toggleArr = (key, val) => setForm(f => ({
    ...f, [key]: f[key].includes(val) ? f[key].filter(x=>x!==val) : [...f[key], val],
  }));

  const handleSubmit = async () => {
    if (!form.title || !form.brand_name) return;
    setSubmitting(true);
    const { error } = await supabase.from("campaigns").insert({
      ...form, status:"open_rfp", posted_as_rfp:true,
    });
    setSubmitting(false);
    if (!error) { setSubmitted(true); onSuccess && onSuccess(); }
  };

  if (submitted) return (
    <div style={{ background:B.glass, backdropFilter:"blur(16px)", border:`1px solid ${B.glassBorder}`, borderRadius:14, padding:"36px 28px", textAlign:"center" }}>
      <div style={{ fontSize:32, marginBottom:12 }}>✓</div>
      <div style={{ fontSize:18, fontWeight:700, color:B.navy, marginBottom:8 }}>RFP Published</div>
      <div style={{ fontSize:13, color:B.textMuted }}>Creators can now see and apply to your campaign.</div>
    </div>
  );

  const PLATFORMS = ["TikTok","Instagram","YouTube","LinkedIn","Facebook"];
  const NICHES = ["Lifestyle","Travel","Food","Fitness","Business","Tech","Fashion","Sustainability"];

  return (
    <div style={{ background:B.glass, backdropFilter:"blur(16px)", border:`1px solid ${B.glassBorder}`, borderRadius:14, padding:"28px 24px", maxWidth:600 }}>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:B.lightBlue, marginBottom:6 }}>Post a Campaign</div>
      <h3 style={{ fontSize:20, fontWeight:800, color:B.navy, marginBottom:20 }}>Create an RFP</h3>

      {[["Campaign title *","title","text"],["Brand / Company name *","brand_name","text"],["Location","location","text"]].map(([ph, key, type]) => (
        <input key={key} type={type} placeholder={ph} value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={inp} />
      ))}

      <textarea placeholder="Campaign description — what you're looking for *" rows={3}
        value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        style={{ ...inp, resize:"vertical", minHeight:80 }} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
        {[["Deliverables","deliverables"],["Budget min ($)","budget_min"],["Budget max ($)","budget_max"]].map(([ph, key]) => (
          <input key={key} type="number" placeholder={ph} value={form[key] || ""}
            onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value)||0 }))}
            style={{ ...inp, marginBottom:0 }} />
        ))}
      </div>

      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Platforms</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => toggleArr("platforms", p)}
              style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:600, fontFamily:"'Montserrat',sans-serif", cursor:"pointer", background:form.platforms.includes(p)?B.navy:B.white, color:form.platforms.includes(p)?"#fff":B.text, border:`1px solid ${B.glassBorder}` }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Niches</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {NICHES.map(n => (
            <button key={n} onClick={() => toggleArr("niches", n)}
              style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:600, fontFamily:"'Montserrat',sans-serif", cursor:"pointer", background:form.niches.includes(n)?B.lightBlue:B.white, color:form.niches.includes(n)?"#fff":B.text, border:`1px solid ${B.glassBorder}` }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Application deadline</div>
        <input type="date" value={form.rfp_closes_at} onChange={e => setForm(f => ({ ...f, rfp_closes_at: e.target.value }))} style={{ ...inp, marginBottom:0 }} />
      </div>

      <button onClick={handleSubmit} disabled={submitting || !form.title || !form.brand_name}
        style={{ ...primaryBtn, width:"100%", padding:"13px 0", opacity:submitting || !form.title || !form.brand_name ? 0.5 : 1 }}>
        {submitting ? "Publishing..." : "Publish RFP →"}
      </button>
    </div>
  );
}
