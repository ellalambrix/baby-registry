import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  peach:      "#df9a81",
  peachDark:  "#c47d62",
  peachLight: "#f5e2da",
  peachFaint: "#faf0ec",
  green:      "#477760",
  greenDark:  "#2e4f3f",
  greenMid:   "#5a8a73",
  greenFaint: "#e8f0ec",
  pink:       "#e59bc4",
  pinkFaint:  "#fbeef6",
  blue:       "#7298af",
  blueFaint:  "#e8eff5",
  gray:       "#a9a392",
  grayLight:  "#e8e6e2",
  grayFaint:  "#f5f4f1",
  page:       "#FAFAF5",
  card:       "#FFFFFF",
  downvote:   "#7f2922",
};

const CATEGORY_COLORS = {
  Sleep:                        "#7298af",
  Feeding:                      "#df9a81",
  Diapering:                    "#477760",
  Transport:                    "#295ba4",
  Bathing:                      "#7298af",
  "Play & Development":         "#dccf73",
  "Clothing & Comfort":         "#e59bc4",
  "Health & Safety":            "#7f2922",
  "Feeding Support":            "#df9a81",
  "Solids & Starting Foods":    "#5a8a73",
  "Sleep Resources":            "#7298af",
  "Postpartum Recovery":        "#e59bc4",
  "Mental Health & Wellness":   "#7f2922",
  "Parenting Tools & Apps":     "#2e4f3f",
  "Recommended Reading":        "#dccf73",
  "Favorite Shops & Resale":    "#df9a81",
};
const DEFAULT_CAT_COLOR = P.peach;
const catColor = (cat) => CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR;

const BABY_CATS   = ["Sleep", "Feeding", "Diapering", "Transport", "Bathing", "Play & Development", "Clothing & Comfort", "Health & Safety"];
const PARENT_CATS = ["Feeding Support", "Solids & Starting Foods", "Sleep Resources", "Postpartum Recovery", "Mental Health & Wellness", "Parenting Tools & Apps", "Recommended Reading", "Favorite Shops & Resale"];
const BASE_CATEGORIES = [...BABY_CATS, ...PARENT_CATS];
const MEDAL = ["🥇", "🥈", "🥉"];

// ── Help Modal ─────────────────────────────────────────────────────────────
function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  const sections = [
    { icon: "📋", title: "Browse two tabs", body: <><strong style={{ fontWeight: "600" }}>For Baby</strong> has all the gear. <strong style={{ fontWeight: "600" }}>For Parents</strong> has resources, reading, postpartum help, and everything your friends wished they'd told you. Filter by category using the pills below the tabs.</> },
    { icon: "🏆", title: "Vote for your favorites", body: "Tap any item to expand it and see all the brand recommendations. Hit ▲ if you loved it, ▼ if you didn't. The most-loved pick rises to the top and earns the Top Pick badge. It's democracy, but make it baby gear." },
    { icon: "💬", title: "Leave a note", body: "Tap 💬 on any recommendation to share the real talk — why you loved it, what to watch out for, or the tip you wish someone had given you. Your name is optional. Your opinions are not." },
    { icon: "✦", title: "Add what's missing", body: <>>See a product that isn't listed? Hit the <strong style={{ fontWeight: "600" }}>✦ button</strong> in the bottom right to add a new item — or tap <strong style={{ fontWeight: "600" }}>"Suggest another brand"</strong> inside any existing item to add your pick to the lineup.</> },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", zIndex: 50, animation: "fadeIn 0.2s ease" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 51, width: "90%", maxWidth: "520px", maxHeight: "88vh", overflowY: "auto", background: P.card, borderRadius: "20px", border: `1.5px solid ${P.peach}50`, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", fontFamily: "Georgia, serif", animation: "modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ padding: "22px 24px 16px", borderBottom: `1px solid ${P.peach}30`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: P.gray }}>Welcome to</p>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "400", color: P.greenDark, fontStyle: "italic" }}>Our Parenting Era</h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: P.gray, fontStyle: "italic" }}>Your community-powered registry & resource guide</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1.5px solid ${P.peach}40`, borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "14px", color: P.gray, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>✕</button>
        </div>
        <div style={{ padding: "16px 24px 4px" }}>
          <p style={{ margin: 0, fontSize: "14px", color: P.gray, lineHeight: "1.75", fontStyle: "italic" }}>
            Think of this as a group chat — but make it a registry. Everyone who gets this link can browse, vote, suggest, and comment. No login required. We're all in our <em>collaborative era</em>.
          </p>
        </div>
        <div style={{ padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {sections.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", flexShrink: 0, background: P.peach + "18", border: `1px solid ${P.peach}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 3px", fontSize: "14px", fontWeight: "600", color: P.greenDark }}>{s.title}</p>
                <p style={{ margin: 0, fontSize: "13px", color: P.gray, lineHeight: "1.65", fontStyle: "italic" }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${P.peach}25`, margin: "0 24px" }} />
        <div style={{ padding: "14px 24px 22px", display: "flex", gap: "10px" }}>
          <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>ℹ️</span>
          <p style={{ margin: 0, fontSize: "13px", color: P.gray, lineHeight: "1.65", fontStyle: "italic" }}>
            All changes — votes, comments, and new items — are saved in real time and visible to everyone with this link. Long story short: your recs matter, and they last.
          </p>
        </div>
      </div>
    </>
  );
}

// ── Add Item Modal ─────────────────────────────────────────────────────────
function AddItemModal({ isOpen, onClose, categories, activeCategory, onAdd }) {
  const [step, setStep] = useState(1);
  const [itemName, setItemName]       = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [newCatName, setNewCatName]   = useState("");
  const [isNewCat, setIsNewCat]       = useState(false);
  const [brand, setBrand]             = useState("");
  const [model, setModel]             = useState("");
  const [note, setNote]               = useState("");
  const [author, setAuthor]           = useState("");
  const [linkUrl, setLinkUrl]         = useState("");
  const [linkLabel, setLinkLabel]     = useState("");
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setItemName(""); setNewCatName(""); setBrand(""); setModel("");
      setNote(""); setAuthor(""); setLinkUrl(""); setLinkLabel("");
      setIsNewCat(false);
      setSelectedCat(activeCategory !== "All" ? activeCategory : categories[0] || "");
      setTimeout(() => firstInputRef.current?.focus(), 120);
    }
  }, [isOpen, activeCategory, categories]);

  if (!isOpen) return null;

  const finalCategory = isNewCat ? newCatName.trim() : selectedCat;
  const cc = catColor(finalCategory) || P.peach;
  const canProceed = itemName.trim() && finalCategory;

  const inputStyle = {
    width: "100%", padding: "10px 13px",
    border: `1.5px solid ${P.grayLight}`,
    borderRadius: "12px", fontSize: "14px",
    fontFamily: "inherit", outline: "none",
    color: P.greenDark, background: P.card,
    boxSizing: "border-box", transition: "border-color 0.15s",
  };

  const labelStyle = {
    display: "block", fontSize: "11.5px", fontWeight: "600",
    color: P.gray, letterSpacing: "0.07em",
    textTransform: "uppercase", marginBottom: "6px",
  };

  const handleAdd = () => {
    if (!canProceed) return;
    const recId = `r-${Date.now()}`;
    const hasBrand = brand.trim() || model.trim();
    onAdd({
      id: Date.now(), category: finalCategory, name: itemName.trim(),
      recs: hasBrand ? [{
        id: recId, brand: brand.trim(), model: model.trim(), votes: 1,
        link_url: linkUrl.trim() || null,
        link_label: linkLabel.trim() || null,
        comments: note.trim()
          ? [{ id: Date.now(), author: author.trim() || "Anonymous", text: note.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }]
          : [],
      }] : [],
    });
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(42,28,18,0.45)", backdropFilter: "blur(3px)", zIndex: 50, animation: "fadeIn 0.2s ease" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51, background: P.page, borderRadius: "24px 24px 0 0", boxShadow: "0 -8px 40px rgba(42,28,18,0.18)", padding: "0 0 env(safe-area-inset-bottom, 20px)", animation: "slideUp 0.3s cubic-bezier(0.32,0.72,0,1)", maxHeight: "92vh", overflowY: "auto", fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: P.grayLight }} />
        </div>
        <div style={{ padding: "8px 22px 16px", borderBottom: `1.5px solid ${P.grayLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "400", color: P.greenDark, fontStyle: "italic" }}>Add Registry Item</h2>
            <p style={{ margin: "3px 0 0", fontSize: "13px", color: P.gray }}>Step {step} of 2 — {step === 1 ? "Item details" : "First recommendation"}</p>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: P.grayFaint, color: P.gray, fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ height: "3px", background: P.grayLight }}>
          <div style={{ height: "100%", width: step === 1 ? "50%" : "100%", background: cc, borderRadius: "0 2px 2px 0", transition: "width 0.35s ease, background 0.3s ease" }} />
        </div>

        <div style={{ padding: "20px 22px 28px" }}>
          {step === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Item name *</label>
                <input ref={firstInputRef} value={itemName} onChange={e => setItemName(e.target.value)} onKeyDown={e => e.key === "Enter" && canProceed && setStep(2)} placeholder="e.g. Onesies, Nursing Pillow…" style={inputStyle} onFocus={e => e.target.style.borderColor = cc} onBlur={e => e.target.style.borderColor = P.grayLight} />
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                {!isNewCat ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                    {categories.map(cat => {
                      const cc2 = catColor(cat);
                      const active = selectedCat === cat;
                      return <button key={cat} onClick={() => setSelectedCat(cat)} style={{ padding: "7px 14px", borderRadius: "20px", border: `1.5px solid ${active ? cc2 : P.grayLight}`, background: active ? cc2 : "transparent", color: active ? "#fff" : P.gray, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", fontWeight: active ? "600" : "400" }}>{cat}</button>;
                    })}
                    <button onClick={() => { setIsNewCat(true); setSelectedCat(""); }} style={{ padding: "7px 14px", borderRadius: "20px", border: `1.5px dashed ${P.peach}`, background: "transparent", color: P.peach, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>+ New category</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New category name…" style={{ ...inputStyle, flex: 1 }} onFocus={e => e.target.style.borderColor = P.peach} onBlur={e => e.target.style.borderColor = P.grayLight} />
                    <button onClick={() => { setIsNewCat(false); setSelectedCat(categories[0] || ""); }} style={{ padding: "10px 14px", borderRadius: "12px", border: `1.5px solid ${P.grayLight}`, background: "transparent", color: P.gray, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                  </div>
                )}
              </div>
              {finalCategory && itemName.trim() && (
                <div style={{ padding: "10px 14px", borderRadius: "12px", background: cc + "18", border: `1px solid ${cc}45`, display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cc, flexShrink: 0 }} />
                  <span style={{ fontSize: "13.5px", color: P.green }}><strong>{itemName.trim()}</strong> → <strong>{finalCategory}</strong></span>
                </div>
              )}
              <button onClick={() => setStep(2)} disabled={!canProceed} style={{ padding: "13px", borderRadius: "14px", border: "none", background: canProceed ? cc : P.grayLight, color: canProceed ? "#fff" : P.gray, fontSize: "15px", cursor: canProceed ? "pointer" : "not-allowed", fontFamily: "inherit", fontWeight: "600", transition: "all 0.2s", marginTop: "4px" }}>Next: Add a recommendation →</button>
              <button onClick={handleAdd} disabled={!canProceed} style={{ padding: "10px", borderRadius: "14px", border: `1.5px solid ${P.grayLight}`, background: "transparent", color: canProceed ? P.gray : P.grayLight, fontSize: "13.5px", cursor: canProceed ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Skip, just add item</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "10px 14px", borderRadius: "12px", background: cc + "18", border: `1px solid ${cc}45`, display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cc, flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: P.green }}><strong>{itemName.trim()}</strong> · {finalCategory}</span>
                <button onClick={() => setStep(1)} style={{ marginLeft: "auto", fontSize: "11.5px", color: cc, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>edit</button>
              </div>
              <p style={{ margin: 0, fontSize: "13.5px", color: P.gray, fontStyle: "italic" }}>Suggest the first brand/model — others can add more and vote.</p>

              <div>
                <label style={labelStyle}>Brand</label>
                <input autoFocus value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Carter's, Lovevery…" style={inputStyle} onFocus={e => e.target.style.borderColor = cc} onBlur={e => e.target.style.borderColor = P.grayLight} />
              </div>
              <div>
                <label style={labelStyle}>Model / version</label>
                <input value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. 5-Pack Short Sleeve…" style={inputStyle} onFocus={e => e.target.style.borderColor = cc} onBlur={e => e.target.style.borderColor = P.grayLight} />
              </div>

              {/* ── Shop link fields ── */}
              <div>
                <label style={labelStyle}>Product link (optional)</label>
                <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://amazon.com/..." style={inputStyle} onFocus={e => e.target.style.borderColor = cc} onBlur={e => e.target.style.borderColor = P.grayLight} />
              </div>
              <div>
                <label style={labelStyle}>Retailer name (optional)</label>
                <input value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="e.g. Amazon, Target, Brand Site" style={inputStyle} onFocus={e => e.target.style.borderColor = cc} onBlur={e => e.target.style.borderColor = P.grayLight} />
              </div>

              <div>
                <label style={labelStyle}>Your name</label>
                <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="optional" style={inputStyle} onFocus={e => e.target.style.borderColor = cc} onBlur={e => e.target.style.borderColor = P.grayLight} />
              </div>
              <div>
                <label style={labelStyle}>Why do you love it?</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="optional tip or note…" rows={2} style={{ ...inputStyle, resize: "vertical" }} onFocus={e => e.target.style.borderColor = cc} onBlur={e => e.target.style.borderColor = P.grayLight} />
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button onClick={() => setStep(1)} style={{ padding: "12px 16px", borderRadius: "14px", border: `1.5px solid ${P.grayLight}`, background: "transparent", color: P.gray, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                <button onClick={handleAdd} style={{ flex: 1, padding: "13px", borderRadius: "14px", border: "none", background: cc, color: "#fff", fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>🎉 Add to Registry</button>
              </div>
              <button onClick={handleAdd} style={{ padding: "10px", borderRadius: "14px", border: `1.5px solid ${P.grayLight}`, background: "transparent", color: P.gray, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Add without recommendation</button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)}to{transform:translateY(0)} }
        @keyframes modalPop { from{opacity:0;transform:translate(-50%,-48%) scale(0.96)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
      `}</style>
    </>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function BabyRegistry() {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeSection, setActiveSection] = useState("baby");
  const [activeCategory, setActiveCategory] = useState("All");
  const [recVotes, setRecVotes]         = useState({});
  const [expandedItem, setExpandedItem] = useState(null);
  const [expandedRec, setExpandedRec]   = useState(null);
  const [newComment, setNewComment]     = useState({});
  const [commentAuthor, setCommentAuthor] = useState({});
  const [sortBy, setSortBy]             = useState("category");
  const [addingRecTo, setAddingRecTo]   = useState(null);
  const [newBrand, setNewBrand]         = useState("");
  const [newModel, setNewModel]         = useState("");
  const [newNote, setNewNote]           = useState("");
  const [newNoteAuthor, setNewNoteAuthor] = useState("");
  const [newLinkUrl, setNewLinkUrl]     = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [fabOpen, setFabOpen]           = useState(false);
  const [fabHover, setFabHover]         = useState(false);
  const [helpOpen, setHelpOpen]         = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");

  // ── Load from Supabase ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: itemRows }, { data: recRows }, { data: commentRows }] = await Promise.all([
        supabase.from("items").select("*").order("id"),
        supabase.from("recs").select("*").order("votes", { ascending: false }),
        supabase.from("comments").select("*").order("created_at"),
      ]);
      const commentsByRec = (commentRows || []).reduce((acc, c) => {
        if (!acc[c.rec_id]) acc[c.rec_id] = [];
        acc[c.rec_id].push(c);
        return acc;
      }, {});
      const recsByItem = (recRows || []).reduce((acc, r) => {
        if (!acc[r.item_id]) acc[r.item_id] = [];
        acc[r.item_id].push({ ...r, comments: commentsByRec[r.id] || [] });
        return acc;
      }, {});
      setItems((itemRows || []).map(item => ({ ...item, recs: recsByItem[item.id] || [] })));
    } catch (err) {
      console.error("Failed to load registry data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddItem = async (newItem) => {
    setItems(its => [...its, newItem]);
    const isParentCat = PARENT_CATS.includes(newItem.category);
    setActiveSection(isParentCat ? "parents" : "baby");
    setActiveCategory(newItem.category);
    setExpandedItem(newItem.id);
    setSuccessMsg(`"${newItem.name}" added to ${newItem.category}!`);
    setTimeout(() => setSuccessMsg(""), 3000);
    try {
      const { data: itemData } = await supabase.from("items").insert({ id: newItem.id, category: newItem.category, name: newItem.name }).select().single();
      if (newItem.recs.length > 0) {
        const rec = newItem.recs[0];
        await supabase.from("recs").insert({ id: rec.id, item_id: itemData.id, brand: rec.brand, model: rec.model, votes: rec.votes, link_url: rec.link_url || null, link_label: rec.link_label || null });
        if (rec.comments.length > 0) {
          const c = rec.comments[0];
          await supabase.from("comments").insert({ rec_id: rec.id, author: c.author, text: c.text, date: c.date });
        }
      }
    } catch (err) { console.error("Failed to save new item:", err); }
  };

  const handleRecVote = async (itemId, recId, dir) => {
    const existing = recVotes[recId];
    const delta = dir === "up" ? 1 : -1;
    const adjustment = existing === dir ? -delta : existing ? delta * 2 : delta;
    setRecVotes(v => { const n = { ...v }; if (existing === dir) delete n[recId]; else n[recId] = dir; return n; });
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, recs: item.recs.map(r => r.id === recId ? { ...r, votes: r.votes + adjustment } : r) }));
    try {
      const { data: rec } = await supabase.from("recs").select("votes").eq("id", recId).single();
      await supabase.from("recs").update({ votes: rec.votes + adjustment }).eq("id", recId);
    } catch (err) { console.error("Vote failed:", err); }
  };

  const addComment = async (itemId, recId) => {
    const text = (newComment[recId] || "").trim();
    const author = (commentAuthor[recId] || "").trim() || "Anonymous";
    if (!text) return;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const comment = { id: Date.now(), rec_id: recId, author, text, date };
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, recs: item.recs.map(r => r.id === recId ? { ...r, comments: [...r.comments, comment] } : r) }));
    setNewComment(n => ({ ...n, [recId]: "" }));
    setCommentAuthor(n => ({ ...n, [recId]: "" }));
    try {
      await supabase.from("comments").insert({ rec_id: recId, author, text, date });
    } catch (err) { console.error("Comment failed:", err); }
  };

  const submitNewRec = async (itemId) => {
    if (!newBrand.trim() && !newModel.trim()) return;
    const recId = `r${itemId}-${Date.now()}`;
    const newRec = {
      id: recId, item_id: itemId, brand: newBrand.trim(), model: newModel.trim(), votes: 1,
      link_url: newLinkUrl.trim() || null, link_label: newLinkLabel.trim() || null,
      comments: newNote.trim() ? [{ id: Date.now(), author: newNoteAuthor.trim() || "Anonymous", text: newNote.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }] : [],
    };
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, recs: [...item.recs, newRec] }));
    setRecVotes(v => ({ ...v, [recId]: "up" }));
    setAddingRecTo(null);
    setNewBrand(""); setNewModel(""); setNewNote(""); setNewNoteAuthor("");
    setNewLinkUrl(""); setNewLinkLabel("");
    try {
      await supabase.from("recs").insert({ id: recId, item_id: itemId, brand: newRec.brand, model: newRec.model, votes: 1, link_url: newRec.link_url, link_label: newRec.link_label });
      if (newRec.comments.length > 0) {
        const c = newRec.comments[0];
        await supabase.from("comments").insert({ rec_id: recId, author: c.author, text: c.text, date: c.date });
      }
    } catch (err) { console.error("Failed to save recommendation:", err); }
  };

  const sortedRecs = (recs) => [...recs].sort((a, b) => b.votes - a.votes);
  const allCategories = [...new Set([...BASE_CATEGORIES, ...items.map(i => i.category)])];
  const sectionCats = activeSection === "baby"
    ? allCategories.filter(c => !PARENT_CATS.includes(c) || BABY_CATS.includes(c))
    : allCategories.filter(c => PARENT_CATS.includes(c) || (!BABY_CATS.includes(c) && !PARENT_CATS.includes(c)));
  const displayCategories = ["All", ...sectionCats];
  const filtered = items
    .filter(i => sectionCats.includes(i.category))
    .filter(i => activeCategory === "All" || i.category === activeCategory)
    .sort((a, b) => sortBy === "votes"
      ? Math.max(...b.recs.map(r => r.votes), 0) - Math.max(...a.recs.map(r => r.votes), 0)
      : a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const grouped = filtered.reduce((acc, item) => { if (!acc[item.category]) acc[item.category] = []; acc[item.category].push(item); return acc; }, {});
  const totalComments = (item) => item.recs.reduce((s, r) => s + r.comments.length, 0);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: P.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", gap: "16px" }}>
      <div style={{ fontSize: "44px", animation: "spin 2s linear infinite" }}>🍼</div>
      <p style={{ color: P.gray, fontSize: "15px", fontStyle: "italic" }}>Loading registry…</p>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: P.page, fontFamily: "Georgia, serif" }}>

      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(135deg, ${P.peachFaint} 0%, ${P.greenFaint} 50%, ${P.blueFaint} 100%)`, borderBottom: `2px solid ${P.grayLight}`, padding: "44px 24px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 15% 85%, ${P.pink}22 0%, transparent 55%), radial-gradient(circle at 85% 15%, ${P.blue}18 0%, transparent 55%)` }} />
        {/* Help button */}
        <button onClick={() => setHelpOpen(true)} style={{ position: "absolute", top: "16px", right: "16px", width: "36px", height: "36px", borderRadius: "50%", border: `1.5px solid ${P.peach}60`, background: P.peach + "20", color: P.peach, fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }} title="How to use this registry">?</button>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "36px", marginBottom: "6px" }}>🍼</div>
          <h1 style={{ margin: "0 0 5px", fontSize: "clamp(26px, 5vw, 40px)", fontWeight: "400", color: P.greenDark, letterSpacing: "0.02em", fontStyle: "italic" }}>Our Parenting Era</h1>
          <p style={{ margin: "0 0 18px", color: P.gray, fontSize: "14.5px" }}>Community-ranked recommendations — vote for your favorites</p>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "7px 18px", borderRadius: "20px", border: `1.5px solid ${P.peach}`, background: "rgba(255,255,255,0.8)", color: P.greenDark, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
            <option value="category">Sort by Category</option>
            <option value="votes">Sort by Most Loved</option>
          </select>
        </div>
      </div>

      {/* ── Section switcher ── */}
      <div style={{ background: P.greenDark, display: "flex" }}>
        {[{ key: "baby", label: "👶  For Baby" }, { key: "parents", label: "🧡  For Parents" }].map(s => (
          <button key={s.key} onClick={() => { setActiveSection(s.key); setActiveCategory("All"); }} style={{ flex: 1, padding: "13px 8px", border: "none", cursor: "pointer", fontFamily: "inherit", background: activeSection === s.key ? P.page : "transparent", color: activeSection === s.key ? P.greenDark : "rgba(255,255,255,0.65)", fontSize: "14px", fontWeight: "600", letterSpacing: "0.02em", borderBottom: activeSection === s.key ? `3px solid ${activeSection === "baby" ? P.peach : P.pink}` : "3px solid transparent", transition: "all 0.2s" }}>{s.label}</button>
        ))}
      </div>

      {/* ── Category Tabs ── */}
      <div style={{ background: P.page, borderBottom: `1.5px solid ${P.grayLight}`, padding: "10px 16px", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: "7px", minWidth: "max-content", margin: "0 auto", maxWidth: "960px" }}>
          {displayCategories.map(cat => {
            const cc = cat === "All" ? (activeSection === "baby" ? P.peach : P.pink) : catColor(cat);
            const active = activeCategory === cat;
            return <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "6px 14px", borderRadius: "20px", border: `1.5px solid ${active ? cc : P.grayLight}`, background: active ? cc : "transparent", color: active ? "#fff" : P.gray, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", fontWeight: active ? "600" : "400", transition: "all 0.18s", whiteSpace: "nowrap" }}>{cat}</button>;
          })}
        </div>
      </div>

      {/* ── Items ── */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "26px 16px 100px" }}>
        {Object.entries(grouped).map(([category, catItems]) => {
          const cc = catColor(category);
          return (
            <div key={category} style={{ marginBottom: "34px" }}>
              {sortBy === "category" && activeCategory === "All" && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: cc, flexShrink: 0 }} />
                  <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "400", color: P.green, fontStyle: "italic" }}>{category}</h2>
                  <div style={{ flex: 1, height: "1px", background: P.grayLight }} />
                  <span style={{ fontSize: "11.5px", color: P.gray }}>{catItems.length} items</span>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {catItems.map(item => {
                  const cc = catColor(item.category);
                  const sorted = sortedRecs(item.recs);
                  const isOpen = expandedItem === item.id;
                  const topRec = sorted[0];
                  return (
                    <div key={item.id} style={{ background: P.card, borderRadius: "16px", border: `1.5px solid ${P.grayLight}`, overflow: "hidden", boxShadow: isOpen ? `0 6px 28px ${cc}22` : "0 1px 5px rgba(46,79,63,0.06)", transition: "box-shadow 0.2s" }}>
                      <div onClick={() => { setExpandedItem(isOpen ? null : item.id); if (!isOpen) setAddingRecTo(null); }} style={{ display: "flex", alignItems: "center", padding: "14px 18px", gap: "12px", cursor: "pointer", userSelect: "none" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "15.5px", fontWeight: "600", color: P.greenDark }}>{item.name}</span>
                            <span style={{ fontSize: "10.5px", padding: "2px 8px", borderRadius: "10px", background: cc + "22", color: P.greenDark, border: `1px solid ${cc}55` }}>{item.category}</span>
                          </div>
                          {topRec ? (
                            <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "12px", color: cc, fontWeight: "600" }}>🥇 Top Pick:</span>
                              <span style={{ fontSize: "13px", color: P.green, fontWeight: "500" }}>{topRec.brand}</span>
                              {topRec.model && <><span style={{ color: P.gray, fontSize: "11px" }}>·</span><span style={{ fontSize: "12.5px", color: P.gray, fontStyle: "italic" }}>{topRec.model}</span></>}
                              <span style={{ fontSize: "11.5px", color: P.gray }}>({topRec.votes} votes{item.recs.length > 1 ? `, +${item.recs.length - 1} alt${item.recs.length > 2 ? "s" : ""}` : ""})</span>
                            </div>
                          ) : (
                            <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: P.gray, fontStyle: "italic" }}>No recommendations yet — be the first!</p>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                          {totalComments(item) > 0 && <span style={{ fontSize: "12px", color: P.gray }}>💬 {totalComments(item)}</span>}
                          <span style={{ fontSize: "17px", color: cc, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block", lineHeight: 1 }}>⌄</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ borderTop: `1.5px solid ${P.grayLight}` }}>
                          {sorted.map((rec, idx) => {
                            const myVote = recVotes[rec.id];
                            const recOpen = expandedRec === rec.id;
                            const isTop = idx === 0;
                            return (
                              <div key={rec.id} style={{ borderBottom: `1px solid ${P.grayFaint}`, background: isTop ? "#fff" : P.grayFaint }}>
                                <div style={{ display: "flex", alignItems: "flex-start", padding: "12px 16px 12px 14px", gap: "10px" }}>
                                  <div style={{ width: "26px", flexShrink: 0, textAlign: "center", paddingTop: "6px" }}>
                                    <span style={{ fontSize: idx < 3 ? "17px" : "12px", lineHeight: 1, color: P.gray, fontWeight: "600" }}>{idx < 3 ? MEDAL[idx] : `#${idx + 1}`}</span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1px", flexShrink: 0, paddingTop: "2px" }}>
                                    <button onClick={e => { e.stopPropagation(); handleRecVote(item.id, rec.id, "up"); }} style={{ width: "30px", height: "25px", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "11px", background: myVote === "up" ? cc : P.grayLight, color: myVote === "up" ? "#fff" : P.gray, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}>▲</button>
                                    <span style={{ fontSize: "13.5px", fontWeight: "700", color: rec.votes > 0 ? P.green : rec.votes < 0 ? P.downvote : P.gray, minWidth: "22px", textAlign: "center", lineHeight: "1.6" }}>{rec.votes}</span>
                                    <button onClick={e => { e.stopPropagation(); handleRecVote(item.id, rec.id, "down"); }} style={{ width: "30px", height: "25px", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "11px", background: myVote === "down" ? P.downvote : P.grayLight, color: myVote === "down" ? "#fff" : P.gray, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}>▼</button>
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "14.5px", fontWeight: "600", color: P.greenDark }}>{rec.brand}</span>
                                      {rec.model && <span style={{ fontSize: "13px", color: P.gray, fontStyle: "italic" }}>{rec.model}</span>}
                                      {isTop && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "8px", background: P.pink, color: "#fff", fontWeight: "700", letterSpacing: "0.04em" }}>Top Pick</span>}
                                    </div>
                                    {rec.comments.length > 0 && <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: P.gray, lineHeight: "1.45", fontStyle: "italic" }}>"{rec.comments[0].text}" <span style={{ fontStyle: "normal", fontWeight: "500", color: P.gray }}>— {rec.comments[0].author}</span></p>}
                                  </div>

                                  {/* ── Shop link ── */}
                                  {rec.link_url && (
                                    <a href={rec.link_url} target="_blank" rel="noopener noreferrer" style={{ padding: "5px 10px", borderRadius: "14px", border: `1.5px solid ${cc}70`, background: cc + "15", color: cc, fontSize: "12px", cursor: "pointer", flexShrink: 0, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", fontFamily: "inherit", fontStyle: "italic", whiteSpace: "nowrap" }}>
                                      🛍 {rec.link_label || "Shop"}
                                    </a>
                                  )}

                                  <button onClick={e => { e.stopPropagation(); setExpandedRec(recOpen ? null : rec.id); }} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "14px", border: `1.5px solid ${P.grayLight}`, background: recOpen ? P.grayFaint : "transparent", color: P.gray, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>💬 {rec.comments.length}</button>
                                </div>

                                {recOpen && (
                                  <div style={{ background: P.card, borderTop: `1px solid ${P.grayLight}`, padding: "13px 16px 14px 70px" }}>
                                    {rec.comments.length === 0 ? <p style={{ margin: "0 0 11px", color: P.gray, fontSize: "13px", fontStyle: "italic" }}>No notes yet — share why you love this one!</p> : (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "13px" }}>
                                        {rec.comments.map(c => (
                                          <div key={c.id} style={{ background: P.grayFaint, borderRadius: "10px", padding: "9px 13px", border: `1px solid ${P.grayLight}` }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                                              <span style={{ fontSize: "12.5px", fontWeight: "600", color: P.green }}>{c.author}</span>
                                              <span style={{ fontSize: "11.5px", color: P.gray }}>{c.date}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: "13.5px", color: P.greenDark, lineHeight: "1.5" }}>{c.text}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                                      <input value={commentAuthor[rec.id] || ""} onChange={e => setCommentAuthor(n => ({ ...n, [rec.id]: e.target.value }))} placeholder="Your name (optional)" style={{ width: "160px", padding: "7px 11px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "12.5px", fontFamily: "inherit", background: P.page, outline: "none", color: P.greenDark, boxSizing: "border-box" }} />
                                      <div style={{ display: "flex", gap: "7px" }}>
                                        <input value={newComment[rec.id] || ""} onChange={e => setNewComment(n => ({ ...n, [rec.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addComment(item.id, rec.id)} placeholder="Why do you love this one?" style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "13px", fontFamily: "inherit", background: P.page, outline: "none", color: P.greenDark }} />
                                        <button onClick={() => addComment(item.id, rec.id)} style={{ padding: "8px 15px", border: "none", borderRadius: "9px", background: cc, color: "#fff", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", flexShrink: 0 }}>Post</button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* ── Suggest another rec — inline form ── */}
                          {addingRecTo === item.id ? (
                            <div style={{ padding: "16px 18px", background: P.page, borderTop: `1px solid ${P.grayLight}` }}>
                              <p style={{ margin: "0 0 11px", fontSize: "13.5px", fontWeight: "600", color: P.green }}>➕ Suggest a brand / model</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                  <input value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="Brand *" style={{ flex: "1 1 130px", padding: "8px 12px", border: `1.5px solid ${catColor(item.category)}`, borderRadius: "9px", fontSize: "13px", fontFamily: "inherit", outline: "none", color: P.greenDark, background: P.card }} />
                                  <input value={newModel} onChange={e => setNewModel(e.target.value)} placeholder="Model / version" style={{ flex: "1 1 150px", padding: "8px 12px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "13px", fontFamily: "inherit", outline: "none", color: P.greenDark, background: P.card }} />
                                </div>
                                {/* Shop link fields */}
                                <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="Product link (optional, https://...)" style={{ padding: "8px 12px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "13px", fontFamily: "inherit", outline: "none", color: P.greenDark, background: P.card }} />
                                <input value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="Retailer name (optional, e.g. Amazon)" style={{ padding: "8px 12px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "13px", fontFamily: "inherit", outline: "none", color: P.greenDark, background: P.card }} />
                                <input value={newNoteAuthor} onChange={e => setNewNoteAuthor(e.target.value)} placeholder="Your name (optional)" style={{ width: "160px", padding: "7px 12px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "12.5px", fontFamily: "inherit", outline: "none", color: P.greenDark, background: P.card, boxSizing: "border-box" }} />
                                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Why do you recommend this? (optional)" rows={2} style={{ padding: "8px 12px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", fontSize: "13px", fontFamily: "inherit", outline: "none", color: P.greenDark, background: P.card, resize: "vertical" }} />
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button onClick={() => submitNewRec(item.id)} style={{ padding: "9px 20px", border: "none", borderRadius: "9px", background: catColor(item.category), color: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>Add Recommendation</button>
                                  <button onClick={() => { setAddingRecTo(null); setNewBrand(""); setNewModel(""); setNewNote(""); setNewNoteAuthor(""); setNewLinkUrl(""); setNewLinkLabel(""); }} style={{ padding: "9px 15px", border: `1.5px solid ${P.grayLight}`, borderRadius: "9px", background: "transparent", color: P.gray, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ padding: "11px 18px", borderTop: `1px dashed ${P.grayLight}`, background: P.grayFaint }}>
                              <button onClick={e => { e.stopPropagation(); setAddingRecTo(item.id); }} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 16px", borderRadius: "20px", border: `1.5px dashed ${catColor(item.category)}`, background: "transparent", color: catColor(item.category), fontSize: "13px", cursor: "pointer", fontFamily: "inherit", fontWeight: "500" }}>
                                <span style={{ fontSize: "15px", lineHeight: 1 }}>+</span> Suggest another brand / model
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: P.gray }}>
            <div style={{ fontSize: "38px", marginBottom: "12px" }}>🧸</div>
            <p style={{ fontStyle: "italic" }}>No items in this category yet.</p>
            <button onClick={() => setFabOpen(true)} style={{ marginTop: "12px", padding: "10px 22px", borderRadius: "20px", border: `1.5px solid ${P.peach}`, background: "transparent", color: P.peach, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>+ Add the first item</button>
          </div>
        )}
      </div>

      {/* ── Success toast ── */}
      {successMsg && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: P.greenDark, color: "#fff", padding: "11px 22px", borderRadius: "24px", fontSize: "14px", fontFamily: "inherit", zIndex: 60, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "successPop 0.4s cubic-bezier(0.34,1.56,0.64,1)", whiteSpace: "nowrap" }}>
          🎉 {successMsg}
        </div>
      )}

      {/* ── FAB ── */}
      <button onClick={() => setFabOpen(true)} onMouseEnter={() => setFabHover(true)} onMouseLeave={() => setFabHover(false)}
        style={{ position: "fixed", bottom: "28px", right: "24px", zIndex: 40, width: fabHover ? "auto" : "58px", height: "58px", padding: fabHover ? "0 22px" : "0", borderRadius: "29px", border: "none", background: `linear-gradient(135deg, ${P.peach} 0%, ${P.peachDark} 100%)`, color: "#fff", fontSize: fabHover ? "15px" : "26px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", boxShadow: `0 4px 20px ${P.peach}66`, transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", whiteSpace: "nowrap", animation: "fabPop 0.45s cubic-bezier(0.34,1.56,0.64,1)", overflow: "hidden" }}
        title="Add registry item"
      >
        <span style={{ fontSize: "20px", lineHeight: 1, flexShrink: 0 }}>＋</span>
        {fabHover && <span style={{ fontSize: "14px", fontWeight: "600" }}>Add Item</span>}
      </button>

      <AddItemModal isOpen={fabOpen} onClose={() => setFabOpen(false)} categories={allCategories} activeCategory={activeCategory} onAdd={handleAddItem} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      <style>{`
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)}to{transform:translateY(0)} }
        @keyframes fabPop { 0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1} }
        @keyframes successPop { 0%{transform:translateX(-50%) scale(0.7);opacity:0}60%{transform:translateX(-50%) scale(1.05)}100%{transform:translateX(-50%) scale(1);opacity:1} }
        @keyframes modalPop { from{opacity:0;transform:translate(-50%,-48%) scale(0.96)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
      `}</style>
    </div>
  );
}
