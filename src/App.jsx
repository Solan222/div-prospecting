import { useState, useRef } from "react";

const CIBLES = [
  { id: "legaltech", label: "⚖️ LegalTech (Yousign, Tomorro...)" },
  { id: "avocat", label: "🏛️ Cabinet d'avocats" },
  { id: "notaire", label: "📜 Étude notariale" },
  { id: "media", label: "📰 Média juridique (Décideurs...)" },
  { id: "dsi", label: "💻 DSI / Directeur technique" },
  { id: "custom", label: "✏️ Autre (custom)" },
];

const TONS = [
  { id: "direct", label: "Direct & business" },
  { id: "warm", label: "Warm (contact commun)" },
  { id: "curieux", label: "Curieux & humble" },
];

const SYSTEM_PROMPT = `Tu es un expert en développement commercial B2B pour DIV Protocol, une startup française qui a développé un drive souverain avec chiffrement post-quantique, zéro knowledge et hébergement en France, destiné aux professionnels manipulant des données ultra-sensibles (avocats, notaires, LegalTechs, DSI).

Tu génères des messages WhatsApp de prospection B2B courts, percutants et authentiques pour Solan Desprès, co-fondateur de DIV Protocol.

Règles absolues :
- Maximum 6-8 lignes, aéré, lisible sur mobile
- Jamais de bullet points ou de listes
- Toujours commencer par "Hello [Prénom]," 
- Toujours terminer par une question fermée sur la disponibilité (ex: "Tu as de la dispo mercredi ?")
- Signer "Solan"
- Ton naturel, humain, pas corporate
- Mentionner le contact commun si fourni
- Parler du problème du prospect AVANT de parler de DIV Protocol
- Jamais de superlatifs ou de formules creuses
- Le message doit sembler écrit à la main, pas généré

Format de sortie : uniquement le message WhatsApp, rien d'autre.`;

export default function App() {
  const [form, setForm] = useState({
    prenom: "",
    entreprise: "",
    poste: "",
    cible: "legaltech",
    ton: "direct",
    contact_commun: "",
    contexte: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.prenom || !form.entreprise) {
      setError("Prénom et entreprise sont requis.");
      return;
    }
    setError("");
    setLoading(true);
    setMessage("");

    const cibleLabel = CIBLES.find((c) => c.id === form.cible)?.label || form.cible;
    const tonLabel = TONS.find((t) => t.id === form.ton)?.label || form.ton;

    const userPrompt = `Génère un message WhatsApp de prospection pour :
- Prénom : ${form.prenom}
- Entreprise : ${form.entreprise}
- Poste : ${form.poste || "non précisé"}
- Type de cible : ${cibleLabel}
- Ton souhaité : ${tonLabel}
- Contact commun : ${form.contact_commun || "aucun"}
- Contexte spécifique : ${form.contexte || "aucun"}

Génère le message maintenant.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("") || "";
      setMessage(text.trim());
    } catch (e) {
      setError("Erreur lors de la génération. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerate = () => {
    setMessage("");
    generate();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a0f1e 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "40px 20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: #4a5568; }
        input:focus, textarea:focus, select:focus { outline: none; }
        .btn-gen:hover { background: #2563eb !important; transform: translateY(-1px); }
        .btn-gen:active { transform: translateY(0); }
        .chip:hover { background: rgba(59,130,246,0.2) !important; border-color: #3b82f6 !important; color: #93c5fd !important; }
        .copy-btn:hover { background: rgba(34,197,94,0.15) !important; }
        .regen-btn:hover { background: rgba(255,255,255,0.08) !important; }
        input, textarea, select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #e2e8f0;
          padding: 12px 16px;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        input:focus, textarea:focus, select:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.06);
        }
        select option { background: #1a2744; color: #e2e8f0; }
        .pulse { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dot-loader span {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          margin: 0 3px;
          animation: bounce 1.2s ease-in-out infinite;
        }
        .dot-loader span:nth-child(2) { animation-delay: 0.2s; }
        .dot-loader span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 100, padding: "6px 16px", marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", animation: "pulse 2s infinite" }} />
            <span style={{ color: "#93c5fd", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>DIV PROTOCOL × CLAUDE API</span>
          </div>
          <h1 style={{ color: "#f8fafc", fontSize: 32, fontWeight: 700, margin: "0 0 8px", letterSpacing: -0.5, lineHeight: 1.2 }}>
            Générateur de messages<br />
            <span style={{ color: "#3b82f6" }}>WhatsApp prospect</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            Propulsé par Claude · Messages prêts à envoyer en 1 clic
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 28, marginBottom: 20,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: 0.8, display: "block", marginBottom: 6 }}>PRÉNOM *</label>
              <input placeholder="Guillaume" value={form.prenom} onChange={e => set("prenom", e.target.value)} />
            </div>
            <div>
              <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: 0.8, display: "block", marginBottom: 6 }}>ENTREPRISE *</label>
              <input placeholder="Yousign" value={form.entreprise} onChange={e => set("entreprise", e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: 0.8, display: "block", marginBottom: 6 }}>POSTE</label>
            <input placeholder="CEO, CTO, Directeur Juridique..." value={form.poste} onChange={e => set("poste", e.target.value)} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: 0.8, display: "block", marginBottom: 10 }}>TYPE DE CIBLE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CIBLES.map(c => (
                <button key={c.id} className="chip" onClick={() => set("cible", c.id)} style={{
                  padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                  background: form.cible === c.id ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                  border: form.cible === c.id ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                  color: form.cible === c.id ? "#93c5fd" : "#64748b",
                }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: 0.8, display: "block", marginBottom: 10 }}>TON</label>
            <div style={{ display: "flex", gap: 8 }}>
              {TONS.map(t => (
                <button key={t.id} className="chip" onClick={() => set("ton", t.id)} style={{
                  padding: "7px 16px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                  background: form.ton === t.id ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                  border: form.ton === t.id ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                  color: form.ton === t.id ? "#93c5fd" : "#64748b",
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: 0.8, display: "block", marginBottom: 6 }}>CONTACT COMMUN</label>
            <input placeholder="Germain, CTO d'Allaw..." value={form.contact_commun} onChange={e => set("contact_commun", e.target.value)} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: 0.8, display: "block", marginBottom: 6 }}>CONTEXTE SPÉCIFIQUE</label>
            <textarea
              placeholder="Ex: ils ont eu une fuite de données récemment, ils cherchent à s'étendre aux notaires..."
              value={form.contexte}
              onChange={e => set("contexte", e.target.value)}
              rows={3}
              style={{ resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button className="btn-gen" onClick={generate} disabled={loading} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: loading ? "#1e3a6e" : "#1d4ed8",
            color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "default" : "pointer",
            transition: "all 0.2s", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            {loading ? (
              <>
                <span style={{ color: "#93c5fd", fontSize: 13 }}>Claude rédige</span>
                <div className="dot-loader"><span /><span /><span /></div>
              </>
            ) : (
              <>✦ Générer le message</>
            )}
          </button>
        </div>

        {/* Result */}
        {message && (
          <div className="fade-in" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: 20, padding: 28,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>💬</span>
                <span style={{ color: "#93c5fd", fontSize: 12, fontWeight: 600, letterSpacing: 0.8 }}>MESSAGE WHATSAPP GÉNÉRÉ</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="regen-btn" onClick={regenerate} style={{
                  padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}>
                  ↺ Regénérer
                </button>
                <button className="copy-btn" onClick={copy} style={{
                  padding: "7px 16px", borderRadius: 8,
                  border: "1px solid rgba(34,197,94,0.4)",
                  background: copied ? "rgba(34,197,94,0.15)" : "transparent",
                  color: copied ? "#86efac" : "#22c55e",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}>
                  {copied ? "✓ Copié !" : "Copier"}
                </button>
              </div>
            </div>

            {/* WhatsApp bubble */}
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 14, padding: "4px 8px 8px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 8,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                }}>S</div>
                <div>
                  <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>Solan · DIV Protocol</div>
                  <div style={{ color: "#22c55e", fontSize: 10 }}>● En ligne</div>
                </div>
              </div>
              <div style={{
                background: "#005c4b", borderRadius: "2px 12px 12px 12px",
                padding: "12px 14px", margin: "0 4px", maxWidth: "85%",
              }}>
                <pre style={{ color: "#e9edef", fontSize: 13.5, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                  {message}
                </pre>
                <div style={{ color: "#8ea8a0", fontSize: 10, textAlign: "right", marginTop: 6 }}>
                  {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ✓✓
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 14, padding: "10px 14px",
              background: "rgba(59,130,246,0.06)", borderRadius: 10,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>⚡</span>
              <span style={{ color: "#64748b", fontSize: 12 }}>
                Conseil : personnalise à la main si tu as un signal récent (article LinkedIn, actualité de leur boîte).
              </span>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 28, color: "#334155", fontSize: 11 }}>
          DIV Protocol · Souveraineté des données, dès la prospection.
        </div>
      </div>
    </div>
  );
}
