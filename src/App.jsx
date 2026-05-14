import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";

// ── Era definitions ────────────────────────────────────────────────────────
const ERAS = [
  { name: "Taylor Swift",           color: "#5a8a73", accent: "#e5eee9", year: "2006", emoji: "🦋" },
  { name: "Fearless",               color: "#c8a951", accent: "#f5edd5", year: "2008", emoji: "🫶" },
  { name: "Speak Now",              color: "#7b5ea7", accent: "#e8dff5", year: "2010", emoji: "💫" },
  { name: "Red",                    color: "#8b1a1a", accent: "#f5dcd8", year: "2012", emoji: "🧣" },
  { name: "1989",                   color: "#6ab0c8", accent: "#daeef5", year: "2014", emoji: "💄" },
  { name: "Reputation",             color: "#e8e8e8", accent: "#050505", year: "2017", emoji: "🐍" },
  { name: "Lover",                  color: "#e891b8", accent: "#fce8f3", year: "2019", emoji: "🏹" },
  { name: "Folklore",               color: "#c8b8a0", accent: "#f5f0e8", year: "2020", emoji: "🪩" },
  { name: "Evermore",               color: "#8b6914", accent: "#f0e0c0", year: "2020", emoji: "🥂" },
  { name: "Midnights",              color: "#2d3561", accent: "#c8cce8", year: "2022", emoji: "💎" },
  { name: "TTPD",                   color: "#7a7a7a", accent: "#ebebeb", year: "2024", emoji: "🖋️" },
  { name: "The Life of a Showgirl", color: "#e05c2a", accent: "#e8f7f5", year: "2025", emoji: "💃" },
];

const ERA_LYRICS = {
  "Taylor Swift": ["Our song is the way you laugh", "You're beautiful, every little piece, love", "Oh my, my, my, my", "I'm only me when I'm with you"],
  "Fearless": ["In this moment now, capture it, remember it", "I had the best day with you today", "You belong with me", "It's a love story, baby just say, \"Yes\""],
  "Speak Now": ["Long live all the mountains we moved", "You are the best thing that's ever been mine", "Oh darling, don't you ever grow up", "I was enchanted to meet you"],
  "Red": ["Tonight's the night when we forget about the deadlines", "And I never saw you coming", "And I'll never be the same", "And right there where we stood was holy ground", "F*ck the patriarchy"],
  "1989": ["We found Wonderland", "We never go out of style", "I've got a blank space baby, and I'll write your name", "Time moved too fast, you played it back"],
  "Reputation": ["Look what you made me do", "I'll be cleaning up bottles with you on New Year's Day", "This is why we can't have nice things", "My baby's fit like a daydream"],
  "Lover": ["Can I go where you go?", "No rules in breakable heaven", "Kiss me once 'cause you know I've had a long night", "It's nice to have a friend", "I'll tell you the truth but never goodbye"],
  "Folklore": ["I'm doing good, I'm on some new sh*t", "She had a marvelous time ruining everything", "I'm still trying everything to get you laughing at me", "Love you to the moon and to Saturn"],
  "Evermore": ["I'm begging for you to take my hand", "There was happiness because of you", "Never be so kind, you forget to be clever", "Never be so clever, you forget to be kind"],
  "Midnights": ["It's me, hi, I'm the problem, it's me", "Meet me at midnight", "Karma is a cat purring in my lap", "Make the friendship bracelets", "Best believe I'm still bejeweled"],
  "TTPD": ["This town is fake, but you're the real thing", "Who's afraid of little old me?", "For a moment, I knew cosmic love", "I'm having his baby"],
  "The Life of a Showgirl": ["It's 'bout to be the sleepless night you've been dreaming of", "You were dancing through the lightning strikes", "Knock on wood", "You can call me \"Honey\" if you want", "I just want you", "I protect the family"],
};

// ── Category config ────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Sleep: "#7298af", Feeding: "#df9a81", Diapering: "#477760", Transport: "#295ba4",
  Bathing: "#7298af", "Play & Development": "#dccf73", "Clothing & Comfort": "#e59bc4", "Wellness": "#7f2922",
  "Travel": "#5a8a73",
  "Potty Training": "#477760", "Big Feelings & Social Emotional": "#e59bc4",
  "Play & Imagination": "#dccf73", "Toddler Feeding & Nutrition": "#df9a81",
  "Sleep (Toddler)": "#7298af", "Books & Learning": "#c8a951", "Outdoor & Active Play": "#5a8a73",
  "Travel (Toddler)": "#5a8a73",
  "Hospital Bag": "#b8a4c9", "Feeding Support": "#df9a81", "Solids & Starting Foods": "#5a8a73",
  "Sleep Resources": "#7298af", "Postpartum Recovery": "#e59bc4", "Mental Health & Wellness": "#7f2922",
  "Parenting Tools & Apps": "#2e4f3f", "Screen Time & Apps": "#295ba4",
  "Childcare & Preschool": "#8b6914", "Recommended Reading": "#dccf73", "Favorite Shops & Resale": "#df9a81",
  "Travel Tips": "#5a8a73",
};
const catColor = (cat) => CATEGORY_COLORS[cat] || "#df9a81";

const BABY_CATS    = ["Sleep", "Feeding", "Diapering", "Transport", "Bathing", "Play & Development", "Clothing & Comfort", "Wellness", "Travel"];
const TODDLER_CATS = ["Potty Training", "Big Feelings & Social Emotional", "Play & Imagination", "Toddler Feeding & Nutrition", "Sleep (Toddler)", "Books & Learning", "Outdoor & Active Play", "Travel (Toddler)"];
const PARENT_CATS  = ["Hospital Bag", "Feeding Support", "Solids & Starting Foods", "Sleep Resources", "Postpartum Recovery", "Mental Health & Wellness", "Parenting Tools & Apps", "Screen Time & Apps", "Childcare & Preschool", "Recommended Reading", "Favorite Shops & Resale", "Travel Tips"];
const BASE_CATEGORIES = [...BABY_CATS, ...TODDLER_CATS, ...PARENT_CATS];
const MEDAL = ["🥇", "🥈", "🥉"];
const SPARKLE = "✦";

// ── Reputation snake SVGs ──────────────────────────────────────────────────
function BackgroundSnake() {
  return (
    <svg viewBox="0 0 400 800" style={{ position: "fixed", right: "-60px", top: "5%", width: "260px", height: "70vh", opacity: 0.06, pointerEvents: "none", zIndex: 0 }}>
      <path d="M320,20 C280,60 160,60 140,120 C120,180 260,200 240,270 C220,340 80,350 100,430 C120,510 280,510 260,590 C240,670 100,680 120,750" fill="none" stroke="white" strokeWidth="28" strokeLinecap="round" />
      <ellipse cx="322" cy="18" rx="16" ry="11" fill="white" transform="rotate(-20 322 18)" />
      <ellipse cx="314" cy="12" rx="4" ry="3" fill="#050505" /><ellipse cx="330" cy="12" rx="4" ry="3" fill="#050505" />
      <path d="M322,6 L318,0 M322,6 L326,0" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function SnakeDivider({ color = "white", opacity = 0.2 }) {
  return (
    <svg viewBox="0 0 200 20" style={{ width: "100%", maxWidth: "200px", height: "20px", opacity }}>
      <path d="M10,10 C30,2 50,18 70,10 C90,2 110,18 130,10 C150,2 170,18 190,10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="194" cy="10" rx="5" ry="3.5" fill={color} />
      <circle cx="192" cy="8.5" r="1" fill="#050505" /><circle cx="196" cy="8.5" r="1" fill="#050505" />
      <path d="M199,10 L202,8 M199,10 L202,12" stroke={color} strokeWidth="0.8" fill="none" />
    </svg>
  );
}
function CornerSnake({ flip = false }) {
  return (
    <svg viewBox="0 0 120 120" style={{ position: "absolute", top: flip ? "auto" : "-2px", bottom: flip ? "-2px" : "auto", left: flip ? "auto" : "-2px", right: flip ? "-2px" : "auto", width: "80px", height: "80px", opacity: 0.18, pointerEvents: "none", transform: flip ? "rotate(180deg)" : "none" }}>
      <path d="M10,10 C10,50 30,40 50,60 C70,80 60,100 100,110" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" />
      <ellipse cx="10" cy="8" rx="8" ry="6" fill="white" />
      <circle cx="7" cy="6" r="1.5" fill="#050505" /><circle cx="13" cy="6" r="1.5" fill="#050505" />
    </svg>
  );
}

// ── Help Modal ─────────────────────────────────────────────────────────────
function HelpModal({ isOpen, onClose, cardBg, textMain, textSub, mutedText, accentCol, isRep, R }) {
  if (!isOpen) return null;
  const sections = [
    { icon: "📋", title: "Browse three sections", body: <><strong style={{ fontWeight: "600" }}>For Baby</strong>, <strong style={{ fontWeight: "600" }}>Toddler</strong>, and <strong style={{ fontWeight: "600" }}>For Parents</strong> — each has its own categories. Filter using the pills below the tabs.</> },
    { icon: "🏆", title: "Vote for your favorites", body: "Tap any item to expand it. Hit ▲ if you loved it, ▼ if you didn't. The most-loved pick rises to the top. It's democracy, but make it baby gear." },
    { icon: "✨", title: "Community Wisdom", body: "Each item has a \"Community Wisdom\" tab with general advice — things to know before diving in. Add your own wisdom there." },
    { icon: "💬", title: "Leave a note", body: "Tap 💬 on any recommendation to share the real talk. Or add to Community Wisdom for general advice. Your name is optional. Your opinions are not." },
    { icon: "✦", title: "Add what's missing", body: <>Hit the <strong style={{ fontWeight: "600" }}>✦ button</strong> bottom-right to add a new item, or tap <strong style={{ fontWeight: "600" }}>"Suggest another brand"</strong> inside any item.</> },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", zIndex: 50, animation: "fadeIn 0.2s ease" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 51, width: "90%", maxWidth: "520px", maxHeight: "88vh", overflowY: "auto", background: cardBg, borderRadius: "20px", border: `1.5px solid ${accentCol}50`, boxShadow: "0 24px 60px rgba(0,0,0,0.25)", fontFamily: "'Palatino Linotype', Palatino, serif", animation: "modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ padding: "22px 24px 16px", borderBottom: `1px solid ${accentCol}30`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", color: mutedText }}>Welcome to</p>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "400", color: textMain, fontStyle: "italic" }}>Our Parenting Era</h2>
            <p style={{ margin: "4px 0 0", fontSize: "15px", color: textSub, fontStyle: "italic" }}>Your community-powered registry & resource guide</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1.5px solid ${accentCol}40`, borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", color: textSub, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>✕</button>
        </div>
        <div style={{ padding: "16px 24px 4px" }}>
          <p style={{ margin: 0, fontSize: "16px", color: textSub, lineHeight: "1.75", fontStyle: "italic" }}>Think of this as a group chat — but make it a registry. Everyone who gets this link can browse, vote, suggest, and comment. No login required. We're all in our <em>collaborative era</em>.</p>
        </div>
        <div style={{ padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {sections.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", flexShrink: 0, background: isRep ? R.dim : accentCol + "18", border: `1px solid ${isRep ? R.border : accentCol + "35"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 3px", fontSize: "16px", fontWeight: "600", color: textMain }}>{s.title}</p>
                <p style={{ margin: 0, fontSize: "15px", color: textSub, lineHeight: "1.65", fontStyle: "italic" }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${accentCol}25`, margin: "0 24px" }} />
        <div style={{ padding: "14px 24px 22px", display: "flex", gap: "10px" }}>
          <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>ℹ️</span>
          <p style={{ margin: 0, fontSize: "15px", color: mutedText, lineHeight: "1.65", fontStyle: "italic" }}>All changes — votes, tips, comments, and new items — are saved in real time and visible to everyone with this link. Long story short: your recs matter, and they last.</p>
        </div>
      </div>
    </>
  );
}

// ── Add Item Modal ─────────────────────────────────────────────────────────
function AddItemModal({ isOpen, onClose, categories, activeCategory, onAdd, accentCol, isRep, R, cardBg, textMain, textSub, mutedText, bg, sectionCats, borderCol }) {
  const [step, setStep]               = useState(1);
  const [itemName, setItemName]       = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [newCatName, setNewCatName]   = useState("");
  const [isNewCat, setIsNewCat]       = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [brand, setBrand]             = useState("");
  const [model, setModel]             = useState("");
  const [note, setNote]               = useState("");
  const [author, setAuthor]           = useState("");
  const [linkUrl, setLinkUrl]         = useState("");
  const [linkLabel, setLinkLabel]     = useState("");
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1); setItemName(""); setNewCatName(""); setBrand(""); setModel("");
      setNote(""); setAuthor(""); setLinkUrl(""); setLinkLabel(""); setIsNewCat(false);
      setSelectedTags([]);
      setSelectedCat(activeCategory !== "All" ? activeCategory : categories[0] || "");
      setTimeout(() => firstInputRef.current?.focus(), 120);
    }
  }, [isOpen, activeCategory, categories]);

  if (!isOpen) return null;

  const finalCategory = isNewCat ? newCatName.trim() : selectedCat;
  const cc = catColor(finalCategory) || accentCol;
  const canProceed = itemName.trim() && finalCategory;

  const availableTags = (sectionCats || []).filter(c => c !== finalCategory);
  const toggleTag = (tag) => setSelectedTags(prev =>
    prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
  );

  const iStyle = { width: "100%", padding: "10px 13px", border: `1.5px solid ${isRep ? R.border : "#e8e6e2"}`, borderRadius: isRep ? "4px" : "12px", fontSize: "16px", fontFamily: "inherit", outline: "none", color: textMain, background: isRep ? R.bg : "#fff", boxSizing: "border-box", transition: "border-color 0.15s", fontStyle: "italic" };
  const lStyle = { display: "block", fontSize: "13px", fontWeight: "600", color: mutedText, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" };

  const handleAdd = () => {
    if (!canProceed) return;
    const recId = `r-${Date.now()}`;
    const hasBrand = brand.trim() || model.trim();
    onAdd({ id: Date.now(), category: finalCategory, name: itemName.trim(), tags: selectedTags, tips: [], recs: hasBrand ? [{ id: recId, brand: brand.trim(), model: model.trim(), votes: 1, link_url: linkUrl.trim() || null, link_label: linkLabel.trim() || null, comments: note.trim() ? [{ id: Date.now(), author: author.trim() || "Anonymous", text: note.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }] : [] }] : [] });
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", zIndex: 50, animation: "fadeIn 0.2s ease" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51, background: cardBg, borderRadius: "22px 22px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.25)", padding: "0 0 env(safe-area-inset-bottom,20px)", animation: "slideUp 0.3s cubic-bezier(0.32,0.72,0,1)", maxHeight: "92vh", overflowY: "auto", fontFamily: "'Palatino Linotype', Palatino, serif" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: isRep ? R.border : accentCol + "40" }} />
        </div>
        <div style={{ padding: "8px 22px 14px", borderBottom: `1px solid ${isRep ? R.border : accentCol + "30"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "400", color: textMain, fontStyle: "italic" }}>{step === 1 ? "Add Registry Item" : "Add a Recommendation"}</h2>
            <p style={{ margin: "3px 0 0", fontSize: "14px", color: mutedText }}>Step {step} of 2</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1.5px solid ${isRep ? R.border : accentCol + "40"}`, borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontSize: "15px", color: textSub, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>✕</button>
        </div>
        <div style={{ height: "3px", background: isRep ? R.border : accentCol + "25" }}>
          <div style={{ height: "100%", width: step === 1 ? "50%" : "100%", background: accentCol, borderRadius: "0 2px 2px 0", transition: "width 0.35s ease" }} />
        </div>
        <div style={{ padding: "18px 22px 24px" }}>
          {step === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={lStyle}>Item name *</label>
                <input ref={firstInputRef} value={itemName} onChange={e => setItemName(e.target.value)} onKeyDown={e => e.key === "Enter" && canProceed && setStep(2)} placeholder="e.g. Onesies, Nursing Pillow…" style={iStyle} onFocus={e => e.target.style.borderColor = accentCol} onBlur={e => e.target.style.borderColor = isRep ? R.border : "#e8e6e2"} />
              </div>
              <div>
                <label style={lStyle}>Category *</label>
                {!isNewCat ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {categories.map(cat => { const active = selectedCat === cat; const cc2 = catColor(cat); return <button key={cat} onClick={() => setSelectedCat(cat)} style={{ padding: "6px 13px", borderRadius: "20px", border: `1.5px solid ${active ? cc2 : isRep ? R.border : "#e8e6e2"}`, background: active ? cc2 : "transparent", color: active ? "#fff" : textSub, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", fontWeight: active ? "600" : "400" }}>{cat}</button>; })}
                    <button onClick={() => { setIsNewCat(true); setSelectedCat(""); }} style={{ padding: "6px 13px", borderRadius: "20px", border: `1.5px dashed ${accentCol}`, background: "transparent", color: accentCol, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>+ New</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New category name…" style={{ ...iStyle, flex: 1 }} />
                    <button onClick={() => { setIsNewCat(false); setSelectedCat(categories[0] || ""); }} style={{ padding: "10px 14px", borderRadius: isRep ? "4px" : "12px", border: `1.5px solid ${isRep ? R.border : "#e8e6e2"}`, background: "transparent", color: textSub, fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                  </div>
                )}
              </div>

              {/* Cross-List To tag picker */}
              {availableTags.length > 0 && finalCategory && (
                <div style={{ padding: "12px 14px", borderRadius: isRep ? "4px" : "12px", background: isRep ? R.dim : bg, border: `1.5px solid ${isRep ? R.border : borderCol || "#e8e6e2"}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <label style={{ ...lStyle, marginBottom: 0 }}>Cross-List To</label>
                    <span style={{ fontSize: "12px", color: selectedTags.length >= 3 ? "#c47860" : mutedText }}>{selectedTags.length} of 3</span>
                  </div>
                  {selectedTags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
                      {selectedTags.map(tag => (
                        <span key={tag} onClick={() => toggleTag(tag)} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px 3px 10px", borderRadius: "20px", background: accentCol + "20", color: accentCol, border: `1px solid ${accentCol}50`, fontSize: "13px", cursor: "pointer", fontStyle: "normal" }}>
                          {tag} <span style={{ fontSize: "11px", lineHeight: 1 }}>✕</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {availableTags.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      const isDisabled = !isSelected && selectedTags.length >= 3;
                      return (
                        <button key={tag} onClick={() => toggleTag(tag)} disabled={isDisabled} style={{ padding: "5px 12px", borderRadius: "20px", border: `1.5px solid ${isSelected ? accentCol : isRep ? R.border : "#e8e6e2"}`, background: isSelected ? accentCol + "22" : "transparent", color: isSelected ? accentCol : isDisabled ? mutedText : textSub, fontSize: "13px", cursor: isDisabled ? "default" : "pointer", fontFamily: "inherit", opacity: isDisabled ? 0.4 : 1, transition: "all 0.15s", fontWeight: isSelected ? "600" : "400" }}>{tag}</button>
                      );
                    })}
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: mutedText, fontStyle: "italic" }}>Optional — item will appear in up to 3 additional categories.</p>
                </div>
              )}

              {finalCategory && itemName.trim() && (
                <div style={{ padding: "9px 13px", borderRadius: isRep ? "4px" : "12px", background: accentCol + "18", border: `1px solid ${accentCol}45`, display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: accentCol, flexShrink: 0 }} />
                    <span style={{ fontSize: "15px", color: textMain, fontStyle: "italic" }}><strong>{itemName.trim()}</strong> → <strong>{finalCategory}</strong></span>
                  </div>
                  {selectedTags.length > 0 && (
                    <span style={{ fontSize: "13px", color: accentCol, fontStyle: "italic", paddingLeft: "15px" }}>Cross-listed: {selectedTags.join(", ")}</span>
                  )}
                </div>
              )}
              <button onClick={() => setStep(2)} disabled={!canProceed} style={{ padding: "12px", borderRadius: isRep ? "4px" : "14px", border: "none", background: canProceed ? accentCol : (isRep ? R.border : "#e8e6e2"), color: canProceed ? (isRep ? R.bg : "#fff") : textSub, fontSize: "16px", cursor: canProceed ? "pointer" : "not-allowed", fontFamily: "inherit", fontWeight: "600", fontStyle: "italic", transition: "all 0.2s" }}>Next: Add a recommendation →</button>
              <button onClick={handleAdd} disabled={!canProceed} style={{ padding: "9px", borderRadius: isRep ? "4px" : "14px", border: `1.5px solid ${isRep ? R.border : "#e8e6e2"}`, background: "transparent", color: canProceed ? textSub : mutedText, fontSize: "15px", cursor: canProceed ? "pointer" : "not-allowed", fontFamily: "inherit", fontStyle: "italic" }}>Skip, just add item</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              <div style={{ padding: "8px 13px", borderRadius: isRep ? "4px" : "12px", background: accentCol + "18", border: `1px solid ${accentCol}35`, display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: accentCol, flexShrink: 0 }} />
                <span style={{ fontSize: "14px", color: textMain, fontStyle: "italic", flex: 1 }}><strong>{itemName.trim()}</strong> · {finalCategory}</span>
                <button onClick={() => setStep(1)} style={{ fontSize: "13px", color: accentCol, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, fontStyle: "italic" }}>edit</button>
              </div>
              <p style={{ margin: 0, fontSize: "15px", color: textSub, fontStyle: "italic" }}>Suggest the first brand/model — others can add more and vote.</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 140px" }}><label style={lStyle}>Brand</label><input autoFocus value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Carter's…" style={iStyle} onFocus={e => e.target.style.borderColor = accentCol} onBlur={e => e.target.style.borderColor = isRep ? R.border : "#e8e6e2"} /></div>
                <div style={{ flex: "1 1 160px" }}><label style={lStyle}>Model / version</label><input value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. 5-Pack Bodysuit" style={iStyle} onFocus={e => e.target.style.borderColor = accentCol} onBlur={e => e.target.style.borderColor = isRep ? R.border : "#e8e6e2"} /></div>
              </div>
              <div><label style={lStyle}>Product link (optional)</label><input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://amazon.com/..." style={iStyle} onFocus={e => e.target.style.borderColor = accentCol} onBlur={e => e.target.style.borderColor = isRep ? R.border : "#e8e6e2"} /></div>
              <div><label style={lStyle}>Retailer name (optional)</label><input value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="e.g. Amazon, Target, Brand Site" style={iStyle} onFocus={e => e.target.style.borderColor = accentCol} onBlur={e => e.target.style.borderColor = isRep ? R.border : "#e8e6e2"} /></div>
              <div><label style={lStyle}>Your name</label><input value={author} onChange={e => setAuthor(e.target.value)} placeholder="optional" style={iStyle} onFocus={e => e.target.style.borderColor = accentCol} onBlur={e => e.target.style.borderColor = isRep ? R.border : "#e8e6e2"} /></div>
              <div><label style={lStyle}>Why do you love it?</label><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="optional tip or note…" rows={2} style={{ ...iStyle, resize: "vertical" }} onFocus={e => e.target.style.borderColor = accentCol} onBlur={e => e.target.style.borderColor = isRep ? R.border : "#e8e6e2"} /></div>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button onClick={() => setStep(1)} style={{ padding: "12px 16px", borderRadius: isRep ? "4px" : "14px", border: `1.5px solid ${isRep ? R.border : "#e8e6e2"}`, background: "transparent", color: textSub, fontSize: "16px", cursor: "pointer", fontFamily: "inherit", fontStyle: "italic" }}>← Back</button>
                <button onClick={handleAdd} style={{ flex: 1, padding: "13px", borderRadius: isRep ? "4px" : "14px", border: "none", background: accentCol, color: isRep ? R.bg : "#fff", fontSize: "16px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", fontStyle: "italic" }}>​<span style={{ fontStyle: "normal" }}>🎉</span> Add to Registry</button>
              </div>
              <button onClick={handleAdd} style={{ padding: "9px", borderRadius: isRep ? "4px" : "14px", border: `1.5px solid ${isRep ? R.border : "#e8e6e2"}`, background: "transparent", color: textSub, fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontStyle: "italic" }}>Add without recommendation</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function BabyRegistry() {
  const [items, setItems]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeEra, setActiveEra]           = useState("Taylor Swift");
  const [activeSection, setActiveSection]   = useState("baby");
  const [activeCategory, setActiveCategory] = useState("All");
  const [recVotes, setRecVotes]             = useState({});
  const [helpfulVotes, setHelpfulVotes]     = useState({}); // parent section thumbs up
  const [expandedItem, setExpandedItem]     = useState(null);
  const [activeTab, setActiveTab]           = useState({});       // { [itemId]: "recs" | "tips" }
  const [expandedRec, setExpandedRec]       = useState(null);
  const [newComment, setNewComment]         = useState({});
  const [commentAuthor, setCommentAuthor]   = useState({});
  const [addingTipTo, setAddingTipTo]       = useState(null);
  const [newTipText, setNewTipText]         = useState("");
  const [newTipAuthor, setNewTipAuthor]     = useState("");
  const [newTipSuccess, setNewTipSuccess]   = useState(null);    // itemId of just-posted tip
  const [sortBy, setSortBy]                 = useState("category");
  const [addingRecTo, setAddingRecTo]       = useState(null);
  const [newBrand, setNewBrand]             = useState("");
  const [newModel, setNewModel]             = useState("");
  const [newNote, setNewNote]               = useState("");
  const [newNoteAuthor, setNewNoteAuthor]   = useState("");
  const [newLinkUrl, setNewLinkUrl]         = useState("");
  const [newLinkLabel, setNewLinkLabel]     = useState("");
  const [fabOpen, setFabOpen]               = useState(false);
  const [fabHover, setFabHover]             = useState(false);
  const [helpOpen, setHelpOpen]             = useState(false);
  const [successMsg, setSuccessMsg]         = useState("");
  const [lyric, setLyric]                   = useState(() => { const l = ERA_LYRICS["Taylor Swift"]; return l[Math.floor(Math.random() * l.length)]; });

  // ── Era-derived colors ───────────────────────────────────────────────────
  const era         = ERAS.find(e => e.name === activeEra) || ERAS[5];
  const isRep       = activeEra === "Reputation";
  const isShowgirl  = activeEra === "The Life of a Showgirl";
  const isDark      = ["Midnights"].includes(activeEra);
  const isMidnights = activeEra === "Midnights";
  const R = { bg: "#080808", card: "#111111", border: "#2a2a2a", borderHi: "#555555", textMain: "#f0f0f0", textSub: "#909090", textMuted: "#444444", accent: "#e8e8e8", dim: "#1a1a1a" };

  const lightCardBg = (() => { const hex = era.accent.replace("#",""); const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16); const bl=(c)=>Math.round(c*0.35+255*0.65); return `rgb(${bl(r)},${bl(g)},${bl(b)})`; })();

  const bg        = isRep ? R.bg       : isShowgirl ? "#d6f0ee" : isDark ? "#0a0a12" : era.accent;
  const cardBg    = isRep ? R.card     : isShowgirl ? "#eaf8f6" : isDark ? "#12121e" : lightCardBg;
  const textMain  = isRep ? R.textMain : isShowgirl ? "#1a3a38" : isDark ? "#ddd8f0" : "#1a0a2e";
  const textSub   = isRep ? R.textSub  : isShowgirl ? "#4a8a84" : isMidnights ? "#a8aed8" : isDark ? "#8880a8" : "#6a5a7a";
  const borderCol = isRep ? R.border   : isShowgirl ? "#a8ddd8" : isDark ? "#2a2540" : era.color + "40";
  const mutedText = isRep ? R.textMuted: isShowgirl ? "#80bab5" : isMidnights ? "#6870a8" : isDark ? "#4a4060" : "#b0a0c0";
  const accentCol = isRep ? R.accent   : isMidnights ? "#7880c8" : era.color;

  const handleEraChange = (eraName) => {
    const lyrics = ERA_LYRICS[eraName] || [];
    setLyric(lyrics[Math.floor(Math.random() * lyrics.length)]);
    setActiveEra(eraName);
  };

  const getTab = (itemId) => activeTab[itemId] || "recs";
  const setTab = (itemId, tab) => setActiveTab(t => ({ ...t, [itemId]: tab }));

  // ── Supabase data load ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: itemRows }, { data: recRows }, { data: commentRows }, { data: tipRows }] = await Promise.all([
        supabase.from("items").select("*").order("id"),
        supabase.from("recs").select("*").order("votes", { ascending: false }),
        supabase.from("comments").select("*").order("created_at"),
        supabase.from("item_tips").select("*").order("created_at"),
      ]);
      const commentsByRec = (commentRows || []).reduce((acc, c) => { if (!acc[c.rec_id]) acc[c.rec_id] = []; acc[c.rec_id].push(c); return acc; }, {});
      const recsByItem    = (recRows || []).reduce((acc, r) => { if (!acc[r.item_id]) acc[r.item_id] = []; acc[r.item_id].push({ ...r, comments: commentsByRec[r.id] || [] }); return acc; }, {});
      const tipsByItem    = (tipRows || []).reduce((acc, t) => { if (!acc[t.item_id]) acc[t.item_id] = []; acc[t.item_id].push(t); return acc; }, {});
      setItems((itemRows || []).map(item => ({ ...item, recs: recsByItem[item.id] || [], tips: tipsByItem[item.id] || [] })));
    } catch (err) { console.error("Failed to load registry data:", err); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddItem = async (newItem) => {
    setItems(its => [...its, { ...newItem, tips: [] }]);
    const isParentCat  = PARENT_CATS.includes(newItem.category);
    const isToddlerCat = TODDLER_CATS.includes(newItem.category);
    setActiveSection(isParentCat ? "parents" : isToddlerCat ? "toddler" : "baby");
    setActiveCategory(newItem.category);
    setExpandedItem(newItem.id);
    setSuccessMsg(`"${newItem.name}" added to ${newItem.category}!`);
    setTimeout(() => setSuccessMsg(""), 3000);
    try {
      const { data: itemData } = await supabase.from("items").insert({ id: newItem.id, category: newItem.category, name: newItem.name, tags: newItem.tags || [] }).select().single();
      if (newItem.recs.length > 0) {
        const rec = newItem.recs[0];
        await supabase.from("recs").insert({ id: rec.id, item_id: itemData.id, brand: rec.brand, model: rec.model, votes: rec.votes, link_url: rec.link_url || null, link_label: rec.link_label || null });
        if (rec.comments.length > 0) { const c = rec.comments[0]; await supabase.from("comments").insert({ rec_id: rec.id, author: c.author, text: c.text, date: c.date }); }
      }
    } catch (err) { console.error("Failed to save new item:", err); }
  };

  const handleRecVote = async (itemId, recId, dir) => {
    const existing = recVotes[recId];
    const delta = dir === "up" ? 1 : -1;
    const adjustment = existing === dir ? -delta : existing ? delta * 2 : delta;
    setRecVotes(v => { const n = { ...v }; if (existing === dir) delete n[recId]; else n[recId] = dir; return n; });
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, recs: item.recs.map(r => r.id === recId ? { ...r, votes: r.votes + adjustment } : r) }));
    try { const { data: rec } = await supabase.from("recs").select("votes").eq("id", recId).single(); await supabase.from("recs").update({ votes: rec.votes + adjustment }).eq("id", recId); }
    catch (err) { console.error("Vote failed:", err); }
  };

  const handleHelpfulVote = async (itemId, recId) => {
    const isActive = !!helpfulVotes[recId];
    const adjustment = isActive ? -1 : 1;
    setHelpfulVotes(v => { const n = { ...v }; if (isActive) delete n[recId]; else n[recId] = true; return n; });
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, recs: item.recs.map(r => r.id === recId ? { ...r, votes: r.votes + adjustment } : r) }));
    try { const { data: rec } = await supabase.from("recs").select("votes").eq("id", recId).single(); await supabase.from("recs").update({ votes: rec.votes + adjustment }).eq("id", recId); }
    catch (err) { console.error("Helpful vote failed:", err); }
  };

  const addComment = async (itemId, recId) => {
    const text = (newComment[recId] || "").trim();
    const author = (commentAuthor[recId] || "").trim() || "Anonymous";
    if (!text) return;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const comment = { id: Date.now(), rec_id: recId, author, text, date };
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, recs: item.recs.map(r => r.id === recId ? { ...r, comments: [...r.comments, comment] } : r) }));
    setNewComment(n => ({ ...n, [recId]: "" })); setCommentAuthor(n => ({ ...n, [recId]: "" }));
    try { await supabase.from("comments").insert({ rec_id: recId, author, text, date }); }
    catch (err) { console.error("Comment failed:", err); }
  };

  const addTip = async (itemId) => {
    const text = newTipText.trim();
    const author = newTipAuthor.trim() || "Anonymous";
    if (!text) return;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const tip = { id: Date.now(), item_id: itemId, author, text, date };
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, tips: [...(item.tips || []), tip] }));
    setNewTipText(""); setNewTipAuthor(""); setAddingTipTo(null);
    setNewTipSuccess(itemId); setTimeout(() => setNewTipSuccess(null), 3000);
    try { await supabase.from("item_tips").insert({ item_id: itemId, author, text, date }); }
    catch (err) { console.error("Tip failed:", err); }
  };

  const submitNewRec = async (itemId) => {
    if (!newBrand.trim() && !newModel.trim()) return;
    const recId = `r${itemId}-${Date.now()}`;
    const newRec = { id: recId, item_id: itemId, brand: newBrand.trim(), model: newModel.trim(), votes: 1, link_url: newLinkUrl.trim() || null, link_label: newLinkLabel.trim() || null, comments: newNote.trim() ? [{ id: Date.now(), author: newNoteAuthor.trim() || "Anonymous", text: newNote.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }] : [] };
    setItems(its => its.map(item => item.id !== itemId ? item : { ...item, recs: [...item.recs, newRec] }));
    setRecVotes(v => ({ ...v, [recId]: "up" }));
    setAddingRecTo(null);
    setNewBrand(""); setNewModel(""); setNewNote(""); setNewNoteAuthor(""); setNewLinkUrl(""); setNewLinkLabel("");
    try {
      await supabase.from("recs").insert({ id: recId, item_id: itemId, brand: newRec.brand, model: newRec.model, votes: 1, link_url: newRec.link_url, link_label: newRec.link_label });
      if (newRec.comments.length > 0) { const c = newRec.comments[0]; await supabase.from("comments").insert({ rec_id: recId, author: c.author, text: c.text, date: c.date }); }
    } catch (err) { console.error("Failed to save recommendation:", err); }
  };

  const sortedRecs = (recs) => [...recs].sort((a, b) => b.votes - a.votes);
  const allCategories = [...new Set([...BASE_CATEGORIES, ...items.map(i => i.category)])];
  const sectionCats = activeSection === "baby" ? allCategories.filter(c => BABY_CATS.includes(c))
    : activeSection === "toddler" ? allCategories.filter(c => TODDLER_CATS.includes(c))
    : allCategories.filter(c => PARENT_CATS.includes(c));
  const sectionLabel = activeSection === "baby" ? "For the little one" : activeSection === "toddler" ? "For the toddler" : "For the parent";
  const displayCategories = ["All", ...sectionCats];

  // An item appears in a section if its primary category OR any of its tags belong to that section
  const itemInSection = (item) => {
    const cats = [item.category, ...(item.tags || [])];
    return cats.some(c => sectionCats.includes(c));
  };
  // An item appears under a specific category filter if its primary category OR tags match
  const itemInCategory = (item, cat) => {
    if (cat === "All") return true;
    return item.category === cat || (item.tags || []).includes(cat);
  };
  // When displaying, show the item under whichever category is active (primary or tag)
  const displayCategory = (item) => {
    if (activeCategory !== "All" && (item.tags || []).includes(activeCategory)) return activeCategory;
    return item.category;
  };

  const filtered = items
    .filter(i => itemInSection(i))
    .filter(i => itemInCategory(i, activeCategory))
    .sort((a, b) => sortBy === "votes" ? Math.max(...b.recs.map(r => r.votes), 0) - Math.max(...a.recs.map(r => r.votes), 0) : a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const grouped = filtered.reduce((acc, item) => {
    const cat = displayCategory(item);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
  const totalComments = (item) => item.recs.reduce((s, r) => s + r.comments.length, 0);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Palatino Linotype', Palatino, serif", gap: "16px" }}>
      <div style={{ fontSize: "44px", animation: "spin 2s linear infinite" }}>🍼</div>
      <p style={{ color: textSub, fontSize: "15px", fontStyle: "italic" }}>Loading registry…</p>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="registry-root" style={{ minHeight: "100vh", background: bg, fontFamily: "'Palatino Linotype', Palatino, serif", transition: "background 0.5s ease", position: "relative" }}>

      {isRep && (
        <>
          <BackgroundSnake />
          <svg viewBox="0 0 400 800" style={{ position: "fixed", left: "-80px", bottom: "0%", width: "220px", height: "60vh", opacity: 0.04, pointerEvents: "none", zIndex: 0, transform: "scaleX(-1)" }}>
            <path d="M320,20 C280,60 160,60 140,120 C120,180 260,200 240,270 C220,340 80,350 100,430 C120,510 280,510 260,590" fill="none" stroke="white" strokeWidth="28" strokeLinecap="round" />
          </svg>
        </>
      )}
      {!isRep && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ position: "absolute", top: `${10+(i*7.3)%85}%`, left: `${5+(i*11.7)%90}%`, color: era.color, fontSize: `${8+(i%3)*4}px`, opacity: isDark ? 0.35 : 0.2, animation: `twinkle ${2+(i%3)}s ease-in-out infinite`, animationDelay: `${i*0.4}s` }}>{SPARKLE}</div>
          ))}
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ background: isRep ? "rgba(8,8,8,0.95)" : isDark ? "rgba(10,10,18,0.85)" : "rgba(255,255,255,0.35)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${isRep ? R.border : accentCol + "30"}`, padding: "44px 24px 28px", textAlign: "center", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
            {ERAS.map(e => { const isActive = activeEra === e.name; const btnColor = e.name === "Reputation" ? "#e8e8e8" : e.color; return (
              <button key={e.name} onClick={() => handleEraChange(e.name)} style={{ padding: "4px 12px", borderRadius: "20px", border: `1.5px solid ${isActive ? btnColor : "transparent"}`, background: isActive ? btnColor + "22" : "transparent", color: isActive ? btnColor : mutedText, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", fontWeight: isActive ? "600" : "400", transition: "all 0.2s", whiteSpace: "nowrap" }}>{e.name}</button>
            ); })}
          </div>
          <button onClick={() => setHelpOpen(true)} style={{ position: "absolute", top: "16px", right: "16px", width: "36px", height: "36px", borderRadius: "50%", border: `1.5px solid ${isRep ? R.borderHi : accentCol + "60"}`, background: isRep ? R.dim : accentCol + "20", color: isRep ? R.textMain : accentCol, fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }} title="How to use this">?</button>
          {isRep && (
            <div style={{ position: "relative", height: "18px", overflow: "visible", marginBottom: "4px" }}>
              <svg viewBox="0 0 800 18" preserveAspectRatio="none" style={{ width: "100%", height: "18px", display: "block" }}>
                <path d="M18,9 C60,1 100,17 140,9 C180,1 220,17 260,9 C300,1 340,17 380,9 C420,1 460,17 500,9 C540,1 580,17 620,9 C660,1 700,17 740,9 C760,4 775,9 782,9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
                <ellipse cx="788" cy="9" rx="9" ry="6" fill="white" opacity="0.35" /><circle cx="785" cy="6.5" r="1.5" fill="#050505" opacity="0.8" /><circle cx="791" cy="6.5" r="1.5" fill="#050505" opacity="0.8" />
                <path d="M797,9 L801,6.5 M797,9 L801,11.5" stroke="white" strokeWidth="1" fill="none" opacity="0.35" />
                <path d="M18,9 C10,9 4,8 0,9" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.2" />
              </svg>
            </div>
          )}
          <div style={{ fontSize: "15px", letterSpacing: "0.25em", color: accentCol, textTransform: "uppercase", marginBottom: "10px", fontStyle: "italic" }}>
            {isRep ? "𝕿𝖍𝖊 𝕽𝖊𝖕𝖚𝖙𝖆𝖙𝖎𝖔𝖓 𝕰𝖗𝖆" : <><span style={{ fontStyle: "normal" }}>{era.emoji}</span>{` The ${activeEra} Era `}<span style={{ fontStyle: "normal" }}>{era.emoji}</span></>}
          </div>
          <h1 style={{ margin: "0 0 5px", fontSize: "clamp(26px, 5vw, 42px)", fontWeight: "400", color: textMain, fontStyle: "italic", lineHeight: 1.1 }}>Our Parenting Era</h1>
          <div style={{ fontSize: "15px", color: accentCol, marginTop: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>{lyric}</div>
          <p style={{ margin: "14px 0 20px", color: textSub, fontSize: "16px", fontStyle: "italic" }}>Community-ranked recommendations — vote for your favorites</p>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "7px 14px", borderRadius: "20px", border: `1.5px solid ${accentCol}50`, background: isRep ? R.dim : "rgba(255,255,255,0.6)", color: textMain, fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontStyle: "italic" }}>
            <option value="category">Sort by Category</option>
            <option value="votes">Sort by Most Loved</option>
          </select>
        </div>

        {!isRep && <div style={{ height: "3px", background: `linear-gradient(90deg, transparent, ${accentCol}, ${accentCol}88, transparent)` }} />}

        {/* ── Sticky nav ── */}
        {(() => {
          const stickyBg = isRep ? "#0d0d0d" : isDark ? "#0e0e1a" : isShowgirl ? "#c8eeeb" : era.accent;
          return (
            <div style={{ position: "sticky", top: 0, zIndex: 30, boxShadow: `0 2px 12px ${isRep ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.1)"}` }}>
              <div style={{ background: stickyBg, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: `1px solid ${isRep ? R.border : accentCol + "30"}`, padding: "10px 16px", display: "flex", justifyContent: "center" }}>
                <div style={{ display: "inline-flex", borderRadius: "30px", border: `1.5px solid ${isRep ? R.borderHi : accentCol + "50"}`, overflow: "hidden", background: isRep ? "rgba(30,30,30,0.8)" : "rgba(255,255,255,0.15)" }}>
                  {[{ key: "baby", label: "👶 For Baby" }, { key: "toddler", label: "🧒 Toddler" }, { key: "parents", label: "🧡 For Parents" }].map(s => (
                    <button key={s.key} onClick={() => { setActiveSection(s.key); setActiveCategory("All"); }} style={{ padding: "9px 18px", border: "none", cursor: "pointer", background: activeSection === s.key ? accentCol : "transparent", color: activeSection === s.key ? (isRep ? R.bg : "#fff") : textSub, fontSize: "15px", fontFamily: "inherit", fontWeight: activeSection === s.key ? "600" : "400", transition: "all 0.2s", whiteSpace: "nowrap" }}>{s.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ background: stickyBg, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: `1px solid ${isRep ? R.border : accentCol + "25"}`, padding: "8px 16px", overflowX: "auto" }}>
                <div style={{ display: "flex", gap: "7px", minWidth: "max-content", margin: "0 auto", maxWidth: "960px" }}>
                  {displayCategories.map(cat => { const cc = cat === "All" ? accentCol : catColor(cat); const active = activeCategory === cat;
                    return <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "5px 13px", borderRadius: "20px", border: `1.5px solid ${active ? cc : isRep ? R.border : cc + "40"}`, background: active ? cc : "transparent", color: active ? (isRep && cat !== "All" ? "#000" : "#fff") : textSub, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", fontWeight: active ? "600" : "400", transition: "all 0.18s", whiteSpace: "nowrap" }}>{cat}</button>;
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Section label ── */}
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "22px 16px 0", textAlign: "center" }}>
          {isRep ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ flex: 1, height: "1px", background: R.border }} />
              <span style={{ fontSize: "12px", letterSpacing: "0.3em", color: R.textMuted, textTransform: "uppercase" }}>
                <span style={{ fontStyle: "normal" }}>{era.emoji}</span>{` ${sectionLabel} `}<span style={{ fontStyle: "normal" }}>{era.emoji}</span>
              </span>
              <div style={{ flex: 1, height: "1px", background: R.border }} />
            </div>
          ) : (
            <div style={{ marginBottom: "14px" }}>
              <span style={{ fontSize: "13px", letterSpacing: "0.2em", color: accentCol, textTransform: "uppercase" }}>
                <span style={{ fontStyle: "normal" }}>{era.emoji}</span>{` ${sectionLabel} `}<span style={{ fontStyle: "normal" }}>{era.emoji}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Items ── */}
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 16px 100px" }}>
          {Object.entries(grouped).map(([category, catItems]) => {
            const cc = catColor(category);
            return (
              <div key={category} style={{ marginBottom: "32px" }}>
                {sortBy === "category" && activeCategory === "All" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: cc, flexShrink: 0 }} />
                    <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "400", color: textMain, fontStyle: "italic" }}>{category}</h2>
                    <div style={{ flex: 1, height: "1px", background: isRep ? R.border : borderCol }} />
                    <span style={{ fontSize: "13px", color: mutedText }}>{catItems.length} items</span>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {catItems.map(item => {
                    const cc = catColor(item.category);
                    const sorted = sortedRecs(item.recs);
                    const isOpen = expandedItem === item.id;
                    const topRec = sorted[0];
                    const tipCount = (item.tips || []).length;
                    const commentCount = totalComments(item);
                    const tab = getTab(item.id);
                    const isParentSection = PARENT_CATS.includes(item.category);
                    const totalHelpful = item.recs.reduce((s, r) => s + r.votes, 0);

                    return (
                      <div key={item.id} style={{ background: cardBg, borderRadius: isRep ? "6px" : "16px", border: `1.5px solid ${isOpen ? (isRep ? R.borderHi : cc + "80") : (isRep ? R.border : borderCol)}`, overflow: "hidden", boxShadow: isOpen ? (isRep ? "0 0 0 1px #444, 0 8px 32px rgba(0,0,0,0.8)" : `0 6px 28px ${cc}22`) : (isRep ? "0 2px 8px rgba(0,0,0,0.6)" : "0 1px 5px rgba(0,0,0,0.06)"), transition: "box-shadow 0.2s", position: "relative" }}>
                        {isRep && isOpen && <><CornerSnake /><CornerSnake flip={true} /></>}

                        {/* Card header */}
                        <div onClick={() => { setExpandedItem(isOpen ? null : item.id); if (!isOpen) setAddingRecTo(null); }} style={{ display: "flex", alignItems: "center", padding: "14px 18px", gap: "12px", cursor: "pointer", userSelect: "none" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "17px", fontWeight: "600", color: textMain, fontStyle: "italic" }}>{item.name}</span>
                              <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: isRep ? "2px" : "10px", background: isRep ? R.dim : cc + "22", color: isRep ? R.textSub : textMain, border: `1px solid ${isRep ? R.borderHi : cc + "55"}`, letterSpacing: isRep ? "0.08em" : "0", textTransform: isRep ? "uppercase" : "none" }}>{item.category}</span>
                              {(item.tags || []).map(tag => (
                                <span key={tag} style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "10px", background: accentCol + "18", color: accentCol, border: `1px solid ${accentCol}50`, fontStyle: "normal" }}>{tag}</span>
                              ))}
                            </div>
                            {topRec ? (
                              isParentSection ? (
                                <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "13px", color: isRep ? R.textMuted : accentCol }}>{item.recs.length} resource{item.recs.length !== 1 ? "s" : ""}</span>
                                  {totalHelpful > 0 && <span style={{ fontSize: "13px", color: mutedText }}>· {totalHelpful} found {totalHelpful === 1 ? "this" : "these"} helpful</span>}
                                </div>
                              ) : (
                                <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "13px", color: isRep ? R.textMuted : accentCol }}>Top Pick:</span>
                                  <span style={{ fontSize: "15px", color: textSub, fontStyle: "italic" }}>{topRec.brand} {topRec.model}</span>
                                  <span style={{ fontSize: "13px", color: mutedText }}>({topRec.votes} votes{item.recs.length > 1 ? `, +${item.recs.length - 1} alt${item.recs.length > 2 ? "s" : ""}` : ""})</span>
                                </div>
                              )
                            ) : (
                              <p style={{ margin: "4px 0 0", fontSize: "14px", color: mutedText, fontStyle: "italic" }}>{isParentSection ? "No resources yet — add the first one!" : "No recommendations yet — be the first!"}</p>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            {commentCount > 0 && <span style={{ fontSize: "14px", color: mutedText }}>💬 {commentCount}</span>}
                            {tipCount > 0 && <span style={{ fontSize: "14px", color: mutedText }}>✨ {tipCount}</span>}
                            <span style={{ fontSize: "17px", color: accentCol, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block", lineHeight: 1 }}>⌄</span>
                          </div>
                        </div>

                        {/* Expanded area */}
                        {isOpen && (
                          <div style={{ borderTop: `1px solid ${isRep ? R.border : borderCol}` }}>
                            {isRep && <div style={{ padding: "8px 18px 0", opacity: 0.2 }}><SnakeDivider color="white" opacity={1} /></div>}

                            {/* ── Tab bar ── */}
                            <div style={{ display: "flex", borderBottom: `1px solid ${isRep ? R.border : borderCol}`, background: isRep ? R.dim : cardBg }}>
                              {[
                                { key: "recs",  label: "Recommendations", badge: item.recs.length },
                                { key: "tips",  label: "Community Wisdom",  badge: tipCount },
                              ].map(t => {
                                const isActive = tab === t.key;
                                return (
                                  <button key={t.key} onClick={e => { e.stopPropagation(); setTab(item.id, t.key); }} style={{ flex: 1, padding: "10px 12px", border: "none", cursor: "pointer", fontFamily: "inherit", fontStyle: "italic", fontSize: "15px", background: isActive ? (isRep ? R.card : cardBg) : "transparent", color: isActive ? textMain : mutedText, fontWeight: isActive ? "600" : "400", borderBottom: isActive ? `2px solid ${accentCol}` : "2px solid transparent", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                    <span style={{ fontStyle: "normal" }}>{t.key === "recs" ? "🏆" : "✨"}</span> {t.label}
                                    {t.badge > 0 && <span style={{ fontSize: "12px", padding: "1px 6px", borderRadius: "10px", background: isActive ? accentCol + "25" : (isRep ? R.border : borderCol), color: isActive ? accentCol : mutedText, fontStyle: "normal" }}>{t.badge}</span>}
                                  </button>
                                );
                              })}
                            </div>

                            {/* ── Recommendations tab ── */}
                            {tab === "recs" && (
                              <>
                                {sorted.map((rec, idx) => {
                                  const myVote = recVotes[rec.id];
                                  const isHelpful = !!helpfulVotes[rec.id];
                                  const recOpen = expandedRec === rec.id;
                                  const isTop = idx === 0;
                                  const showPreview = rec.comments.length === 1 && !recOpen;
                                  return (
                                    <div key={rec.id} style={{ borderBottom: `1px solid ${isRep ? R.border : borderCol}`, background: isTop ? (isRep ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)") : "transparent", borderLeft: isRep && isTop ? `3px solid ${R.accent}` : isRep ? `3px solid ${R.border}` : "3px solid transparent" }}>
                                      <div style={{ display: "flex", alignItems: "flex-start", padding: "12px 16px 12px 14px", gap: "10px" }}>

                                        {/* Medal (baby/toddler) OR thumbs up (parents) */}
                                        {isParentSection ? (
                                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", flexShrink: 0, paddingTop: "2px", minWidth: "40px" }}>
                                            <button
                                              onClick={e => { e.stopPropagation(); handleHelpfulVote(item.id, rec.id); }}
                                              style={{ width: "34px", height: "34px", borderRadius: "50%", border: `1.5px solid ${isHelpful ? accentCol : isRep ? R.border : borderCol}`, background: isHelpful ? accentCol + "20" : "transparent", color: isHelpful ? accentCol : mutedText, fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                              title={isHelpful ? "Remove helpful mark" : "Mark as helpful"}
                                            >👍</button>
                                            {rec.votes > 0 && <span style={{ fontSize: "13px", color: isHelpful ? accentCol : mutedText, fontWeight: isHelpful ? "600" : "400" }}>{rec.votes}</span>}
                                          </div>
                                        ) : (
                                          <>
                                            <div style={{ width: "26px", flexShrink: 0, textAlign: "center", paddingTop: "6px" }}>
                                              <span style={{ fontSize: idx < 3 ? "17px" : "12px", lineHeight: 1, color: mutedText, fontWeight: "600" }}>{idx < 3 ? MEDAL[idx] : `#${idx + 1}`}</span>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1px", flexShrink: 0, paddingTop: "2px" }}>
                                              <button onClick={e => { e.stopPropagation(); handleRecVote(item.id, rec.id, "up"); }} style={{ width: "28px", height: "24px", border: "none", borderRadius: isRep ? "2px" : "7px", cursor: "pointer", fontSize: "13px", background: myVote === "up" ? accentCol : (isRep ? R.dim : cc + "20"), color: myVote === "up" ? (isRep ? R.bg : "#fff") : textSub, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}>▲</button>
                                              <span style={{ fontSize: "15px", fontWeight: "700", color: rec.votes > 0 ? accentCol : rec.votes < 0 ? "#c47860" : mutedText, minWidth: "22px", textAlign: "center", lineHeight: "1.6" }}>{rec.votes}</span>
                                              <button onClick={e => { e.stopPropagation(); handleRecVote(item.id, rec.id, "down"); }} style={{ width: "28px", height: "24px", border: "none", borderRadius: isRep ? "2px" : "7px", cursor: "pointer", fontSize: "13px", background: myVote === "down" ? "#c47860" : (isRep ? R.dim : cc + "20"), color: myVote === "down" ? "#fff" : textSub, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}>▼</button>
                                            </div>
                                          </>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "16px", fontWeight: "600", color: textMain }}>{rec.brand}</span>
                                            {rec.model && <span style={{ fontSize: "15px", color: textSub, fontStyle: "italic" }}>{rec.model}</span>}
                                            {isTop && !isParentSection && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: isRep ? "2px" : "8px", background: accentCol, color: isRep ? R.bg : "#fff", fontWeight: "700", letterSpacing: "0.06em" }}>Top Pick</span>}
                                          </div>
                                          {showPreview && <p style={{ margin: "4px 0 0", fontSize: "14px", color: textSub, lineHeight: "1.45", fontStyle: "italic" }}>"{rec.comments[0].text}" <span style={{ fontStyle: "normal", fontWeight: "500", color: mutedText }}>— {rec.comments[0].author}</span></p>}
                                        </div>
                                        {rec.link_url && (
                                          <a href={rec.link_url} target="_blank" rel="noopener noreferrer" style={{ padding: "5px 10px", borderRadius: isRep ? "2px" : "14px", border: `1px solid ${isRep ? R.borderHi : accentCol + "70"}`, background: isRep ? R.dim : accentCol + "15", color: isRep ? R.textMain : accentCol, fontSize: "14px", cursor: "pointer", flexShrink: 0, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", fontFamily: "inherit", fontStyle: "italic", whiteSpace: "nowrap" }}>
                                            🛍 {rec.link_label || "Shop"}
                                          </a>
                                        )}
                                        <button onClick={e => { e.stopPropagation(); setExpandedRec(recOpen ? null : rec.id); }} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: isRep ? "2px" : "14px", border: `1.5px solid ${isRep ? R.border : borderCol}`, background: recOpen ? (isRep ? R.dim : accentCol + "15") : "transparent", color: textSub, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>💬 {rec.comments.length}</button>
                                      </div>
                                      {recOpen && (
                                        <div style={{ background: isRep ? R.bg : cardBg, borderTop: `1px solid ${isRep ? R.border : borderCol}`, padding: "13px 16px 14px 70px" }}>
                                          {rec.comments.length === 0 ? <p style={{ margin: "0 0 11px", color: mutedText, fontSize: "15px", fontStyle: "italic" }}>No notes yet — share why you love this one!</p> : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "13px" }}>
                                              {rec.comments.map(c => (
                                                <div key={c.id} style={{ background: isRep ? R.dim : bg + "80", borderRadius: "10px", padding: "9px 13px", border: `1px solid ${isRep ? R.border : borderCol}` }}>
                                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                                                    <span style={{ fontSize: "14px", fontWeight: "600", color: textMain }}>{c.author}</span>
                                                    <span style={{ fontSize: "13px", color: mutedText }}>{c.date}</span>
                                                  </div>
                                                  <p style={{ margin: 0, fontSize: "15px", color: textSub, lineHeight: "1.5", fontStyle: "italic" }}>{c.text}</p>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                                            <input value={commentAuthor[rec.id] || ""} onChange={e => setCommentAuthor(n => ({ ...n, [rec.id]: e.target.value }))} placeholder="Your name (optional)" style={{ width: "160px", padding: "7px 11px", border: `1.5px solid ${isRep ? R.border : borderCol}`, borderRadius: isRep ? "2px" : "9px", fontSize: "14px", fontFamily: "inherit", background: isRep ? R.bg : bg, outline: "none", color: textMain, boxSizing: "border-box", fontStyle: "italic" }} />
                                            <div style={{ display: "flex", gap: "7px" }}>
                                              <input value={newComment[rec.id] || ""} onChange={e => setNewComment(n => ({ ...n, [rec.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addComment(item.id, rec.id)} placeholder="Why do you love this one?" style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${isRep ? R.border : borderCol}`, borderRadius: isRep ? "2px" : "9px", fontSize: "15px", fontFamily: "inherit", background: isRep ? R.bg : bg, outline: "none", color: textMain, fontStyle: "italic" }} />
                                              <button onClick={() => addComment(item.id, rec.id)} style={{ padding: "8px 15px", border: "none", borderRadius: isRep ? "2px" : "9px", background: accentCol, color: isRep ? R.bg : "#fff", fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", flexShrink: 0 }}>Post</button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {isRep && <div style={{ padding: "0 18px 8px", opacity: 0.15 }}><SnakeDivider color="white" opacity={1} /></div>}
                                {addingRecTo === item.id ? (
                                  <div style={{ padding: "14px 18px", borderTop: `1px solid ${isRep ? R.border : borderCol}`, background: isRep ? R.dim : bg }}>
                                    <p style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: "600", color: textMain, fontStyle: "italic" }}>{isParentSection ? "✦ Add a resource" : isRep ? "🐍 Suggest a brand / model" : "✦ Suggest a brand / model"}</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        <input value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder={isParentSection ? "Resource name *" : "Brand *"} style={{ flex: "1 1 120px", padding: "8px 11px", border: `1.5px solid ${accentCol}`, borderRadius: isRep ? "2px" : "9px", fontSize: "15px", fontFamily: "inherit", outline: "none", color: textMain, background: isRep ? R.bg : cardBg, fontStyle: "italic" }} />
                                        <input value={newModel} onChange={e => setNewModel(e.target.value)} placeholder={isParentSection ? "URL (optional)" : "Model / version"} style={{ flex: "1 1 140px", padding: "8px 11px", border: `1.5px solid ${isRep ? R.border : borderCol}`, borderRadius: isRep ? "2px" : "9px", fontSize: "15px", fontFamily: "inherit", outline: "none", color: textMain, background: isRep ? R.bg : cardBg, fontStyle: "italic" }} />
                                      </div>
                                      <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="Product link (optional, https://...)" style={{ padding: "8px 11px", border: `1.5px solid ${isRep ? R.border : borderCol}`, borderRadius: isRep ? "2px" : "9px", fontSize: "15px", fontFamily: "inherit", outline: "none", color: textMain, background: isRep ? R.bg : cardBg, fontStyle: "italic" }} />
                                      <input value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="Retailer name (optional, e.g. Amazon)" style={{ padding: "8px 11px", border: `1.5px solid ${isRep ? R.border : borderCol}`, borderRadius: isRep ? "2px" : "9px", fontSize: "15px", fontFamily: "inherit", outline: "none", color: textMain, background: isRep ? R.bg : cardBg, fontStyle: "italic" }} />
                                      <input value={newNoteAuthor} onChange={e => setNewNoteAuthor(e.target.value)} placeholder="Your name (optional)" style={{ width: "160px", padding: "7px 11px", border: `1.5px solid ${isRep ? R.border : borderCol}`, borderRadius: isRep ? "2px" : "9px", fontSize: "14px", fontFamily: "inherit", outline: "none", color: textMain, background: isRep ? R.bg : cardBg, boxSizing: "border-box", fontStyle: "italic" }} />
                                      <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Why do you recommend this? (optional)" rows={2} style={{ padding: "8px 11px", border: `1.5px solid ${isRep ? R.border : borderCol}`, borderRadius: isRep ? "2px" : "9px", fontSize: "15px", fontFamily: "inherit", outline: "none", color: textMain, background: isRep ? R.bg : cardBg, resize: "vertical", fontStyle: "italic" }} />
                                      <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={() => submitNewRec(item.id)} style={{ padding: "9px 18px", border: "none", borderRadius: isRep ? "2px" : "9px", background: accentCol, color: isRep ? R.bg : "#fff", fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", fontStyle: "italic" }}>{isParentSection ? "Add Resource" : "Add Recommendation"}</button>
                                        <button onClick={() => { setAddingRecTo(null); setNewBrand(""); setNewModel(""); setNewNote(""); setNewNoteAuthor(""); setNewLinkUrl(""); setNewLinkLabel(""); }} style={{ padding: "9px 14px", border: `1.5px solid ${isRep ? R.border : borderCol}`, borderRadius: isRep ? "2px" : "9px", background: "transparent", color: textSub, fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontStyle: "italic" }}>Cancel</button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ padding: "11px 18px", borderTop: `1px ${isRep ? "solid" : "dashed"} ${isRep ? R.border : accentCol + "40"}` }}>
                                    <button onClick={e => { e.stopPropagation(); setAddingRecTo(item.id); }} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 16px", borderRadius: isRep ? "2px" : "20px", border: `1.5px ${isRep ? "solid" : "dashed"} ${isRep ? R.borderHi : accentCol + "70"}`, background: "transparent", color: isRep ? R.textSub : accentCol, fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontStyle: isRep ? "normal" : "italic" }}>
                                      {isParentSection ? <><span style={{ fontStyle: "normal" }}>✦</span> Add a resource</> : isRep ? "🐍 Suggest another pick" : <><span style={{ fontStyle: "normal" }}>✦</span> Suggest another pick</>}
                                    </button>
                                  </div>
                                )}
                              </>
                            )}

                            {/* ── Tips tab ── */}
                            {tab === "tips" && (
                              <div style={{ padding: "14px 18px" }}>
                                {(item.tips || []).length === 0 && addingTipTo !== item.id && (
                                  <p style={{ margin: "0 0 12px", color: mutedText, fontSize: "15px", fontStyle: "italic" }}>No wisdom shared yet — be the first.</p>
                                )}
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: (item.tips || []).length > 0 ? "14px" : "0" }}>
                                  {(item.tips || []).map((tip, ti) => {
                                    const isNew = newTipSuccess === item.id && ti === (item.tips.length - 1);
                                    return (
                                      <div key={tip.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", borderRadius: isRep ? "2px" : "10px", background: isNew ? (isRep ? "rgba(100,200,100,0.1)" : accentCol + "12") : (isRep ? R.dim : bg + "80"), border: `1px solid ${isNew ? accentCol + "60" : (isRep ? R.border : borderCol)}`, transition: "background 0.3s" }}>
                                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: isRep ? R.border : accentCol + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", color: isRep ? R.textSub : accentCol, flexShrink: 0, fontStyle: "normal" }}>
                                          {tip.author.slice(0,2).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                                            <span style={{ fontSize: "14px", fontWeight: "600", color: textMain }}>{tip.author}</span>
                                            <span style={{ fontSize: "13px", color: mutedText }}>{tip.date}</span>
                                          </div>
                                          <p style={{ margin: 0, fontSize: "15px", color: textSub, lineHeight: "1.5", fontStyle: "italic" }}>{tip.text}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {addingTipTo === item.id ? (
                                  <div style={{ borderTop: (item.tips || []).length > 0 ? `1px solid ${isRep ? R.border : borderCol}` : "none", paddingTop: (item.tips || []).length > 0 ? "12px" : "0" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                                      <input value={newTipAuthor} onChange={e => setNewTipAuthor(e.target.value)} placeholder="Your name (optional)" style={{ width: "160px", padding: "7px 11px", border: `1.5px solid ${isRep ? R.border : borderCol}`, borderRadius: isRep ? "2px" : "9px", fontSize: "14px", fontFamily: "inherit", outline: "none", color: textMain, background: isRep ? R.bg : bg, boxSizing: "border-box", fontStyle: "italic" }} />
                                      <textarea value={newTipText} onChange={e => setNewTipText(e.target.value)} placeholder={`Share your wisdom about ${item.name.toLowerCase()}…`} rows={2} style={{ padding: "8px 11px", border: `1.5px solid ${isRep ? R.border : accentCol}`, borderRadius: isRep ? "2px" : "9px", fontSize: "15px", fontFamily: "inherit", outline: "none", color: textMain, background: isRep ? R.bg : bg, resize: "vertical", fontStyle: "italic" }} />
                                      <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={() => addTip(item.id)} style={{ padding: "9px 18px", border: "none", borderRadius: isRep ? "2px" : "9px", background: accentCol, color: isRep ? R.bg : "#fff", fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", fontStyle: "italic" }}>Post wisdom</button>
                                        <button onClick={() => { setAddingTipTo(null); setNewTipText(""); setNewTipAuthor(""); }} style={{ padding: "9px 14px", border: `1.5px solid ${isRep ? R.border : borderCol}`, borderRadius: isRep ? "2px" : "9px", background: "transparent", color: textSub, fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontStyle: "italic" }}>Cancel</button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ borderTop: (item.tips || []).length > 0 ? `1px ${isRep ? "solid" : "dashed"} ${isRep ? R.border : accentCol + "40"}` : "none", paddingTop: (item.tips || []).length > 0 ? "11px" : "0" }}>
                                    <button onClick={e => { e.stopPropagation(); setAddingTipTo(item.id); }} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 16px", borderRadius: isRep ? "2px" : "20px", border: `1.5px ${isRep ? "solid" : "dashed"} ${isRep ? R.borderHi : accentCol + "70"}`, background: "transparent", color: isRep ? R.textSub : accentCol, fontSize: "15px", cursor: "pointer", fontFamily: "inherit", fontStyle: isRep ? "normal" : "italic" }}>
                                      <span style={{ fontStyle: "normal" }}>✨</span> Share wisdom
                                    </button>
                                  </div>
                                )}
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
            <div style={{ textAlign: "center", padding: "60px 20px", color: mutedText }}>
              <div style={{ fontSize: "38px", marginBottom: "12px" }}>🧸</div>
              <p style={{ fontStyle: "italic" }}>No items in this category yet.</p>
              <button onClick={() => setFabOpen(true)} style={{ marginTop: "12px", padding: "10px 22px", borderRadius: "20px", border: `1.5px solid ${accentCol}`, background: "transparent", color: accentCol, fontSize: "16px", cursor: "pointer", fontFamily: "inherit", fontStyle: "italic" }}>✦ Add the first item</button>
            </div>
          )}
        </div>

        {successMsg && (
          <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: isRep ? R.accent : accentCol, color: isRep ? R.bg : "#fff", padding: "11px 22px", borderRadius: "24px", fontSize: "16px", fontFamily: "inherit", fontStyle: "italic", zIndex: 60, boxShadow: `0 4px 20px ${accentCol}60`, animation: "successPop 0.4s cubic-bezier(0.34,1.56,0.64,1)", whiteSpace: "nowrap" }}>
            🎉 {successMsg}
          </div>
        )}

        <button onClick={() => setHelpOpen(true)} style={{ position: "fixed", top: "20px", right: "20px", zIndex: 40, width: "38px", height: "38px", borderRadius: "50%", border: `1.5px solid ${isRep ? R.borderHi : accentCol + "60"}`, background: isRep ? R.dim : accentCol + "20", color: isRep ? R.textMain : accentCol, fontSize: "16px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 0.2s" }} title="How to use this">?</button>

        <button onClick={() => setFabOpen(true)} onMouseEnter={() => setFabHover(true)} onMouseLeave={() => setFabHover(false)}
          style={{ position: "fixed", bottom: "28px", right: "24px", zIndex: 40, width: fabHover ? "auto" : "58px", height: "58px", padding: fabHover ? "0 22px" : "0", borderRadius: "29px", border: "none", background: `linear-gradient(135deg, ${accentCol}, ${accentCol}cc)`, color: isRep ? R.bg : "#fff", fontSize: fabHover ? "15px" : "24px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", boxShadow: `0 4px 20px ${accentCol}66`, transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", whiteSpace: "nowrap", overflow: "hidden", fontStyle: "italic" }}
          title="Add registry item"
        >
          <span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0, fontStyle: "normal" }}>✦</span>
          {fabHover && <span>Add Item</span>}
        </button>

      </div>

      <AddItemModal isOpen={fabOpen} onClose={() => setFabOpen(false)} categories={allCategories} activeCategory={activeCategory} onAdd={handleAddItem} accentCol={accentCol} isRep={isRep} R={R} cardBg={cardBg} textMain={textMain} textSub={textSub} mutedText={mutedText} bg={bg} sectionCats={sectionCats} borderCol={borderCol} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} cardBg={cardBg} textMain={textMain} textSub={textSub} mutedText={mutedText} accentCol={accentCol} isRep={isRep} R={R} />

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)}to{transform:translateY(0)} }
        @keyframes fabPop { 0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1} }
        @keyframes successPop { 0%{transform:translateX(-50%) scale(0.7);opacity:0}60%{transform:translateX(-50%) scale(1.05)}100%{transform:translateX(-50%) scale(1);opacity:1} }
        @keyframes modalPop { from{opacity:0;transform:translate(-50%,-48%) scale(0.96)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }

        /* ── Prevent emoji from inheriting italic ── */
        .registry-root { font-synthesis: none; }
        .registry-root *::before { font-style: normal; }
        @font-face {
          font-family: 'emoji-upright';
          src: local('Apple Color Emoji'), local('Segoe UI Emoji'), local('Noto Color Emoji');
          font-style: normal;
          unicode-range: U+1F300-1FAFF, U+2600-27BF, U+FE0F, U+200D;
        }
        .emoji-upright, .registry-root span[role="img"] { font-style: normal !important; }

        /* Broadest reliable fix — wrap any element that should never italicize emojis */
        .registry-root button, .registry-root a { font-style: inherit; }
        .registry-root .no-italic { font-style: normal !important; }

        @media (min-width: 768px) {
          .registry-root h1 { font-size: clamp(28px, 5vw, 44px) !important; }
          .registry-root h2 { font-size: 20px !important; }
          .registry-root p, .registry-root span, .registry-root button,
          .registry-root input, .registry-root textarea, .registry-root select,
          .registry-root a, .registry-root label { font-size: calc(1em + 1px); }
        }
      `}</style>
    </div>
  );
}
