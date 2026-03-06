import { useState } from "react";

const SYSTEM_PROMPT = `Tu es un expert en prospection B2B pour des solutions technologiques souveraines et confidentielles (stockage, chiffrement, données sensibles).

Tu génères des messages WhatsApp de prospection ultra-personnalisés pour des C-levels, directeurs juridiques, notaires, avocats, directeurs IT, ou décideurs dans des secteurs régulés (finance, santé, juridique, énergie, industrie).

RÈGLES ABSOLUES :
- Ne jamais mentionner le nom de la plateforme ou de la société émettrice
- Ton : direct, professionnel, humain — jamais corporate ou commercial
- Longueur : 80-130 mots maximum, adapté WhatsApp
- Structure : accroche personnalisée → valeur ajoutée claire → signal terrain ou contexte → appel à l'action court avec proposition de créneau
- Si un contact commun est fourni : commence par lui
- Si pas de contact commun : commence par un signal terrain (ce que les clients disent, ce qu'on observe dans leur secteur)
- La proposition de valeur doit être spécifique au secteur cible : avocats → confidentialité dossiers clients / notaires → intégrité actes / finance → conformité / santé → RGPD données sensibles
- Utilise le prénom du prospect, jamais "Monsieur/Madame"
- Termine toujours par une question fermée avec un jour précis
- Ne jamais utiliser de formule de politesse classique ni de signature corporate
- Le message doit sonner comme envoyé par un fondateur, pas par un commercial

FORMAT DE RÉPONSE :
Génère exactement 2 versions du message :

VERSION A — [label court ex: "Avec contact commun" ou "Signal secteur" selon le contexte]
[message]

VERSION B — [label court différent]
[message]

Ensuite ajoute une ligne :
CONSEIL : [une phrase sur laquelle version envoyer et pourquoi]`;

const SECTOR_OPTIONS = [
  { value: "avocat", label: "Avocat / Cabinet" },
  { value: "notaire", label: "Notaire" },
  { value: "finance", label: "Finance / Banque" },
  { value: "sante", label: "Santé / Médical" },
  { value: "energie", label: "Énergie / Industrie" },
  { value: "legaltech", label: "LegalTech / SaaS" },
  { value: "immobilier", label: "Immobilier" },
  { value: "autre", label: "Autre" },
];

const TONE_OPTIONS = [
  { value: "direct", label: "Direct & Business" },
  { value: "relation", label: "Warm & Relation" },
  { value: "urgence", label: "Signal Urgence" },
];

export default function App() {
  const [form, setForm] = useState({
    prenom: "",
    entreprise: "",
    poste: "",
    secteur: "",
    tone: "direct",
    contactCommun: "",
    contexte: "",
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const buildPrompt = () => {
    const sectorLabel = SECTOR_OPTIONS.find((s) => s.value === form.secteur)?.label || form.secteur;
    const toneLabel = TONE_OPTIONS.find((t) => t.value === form.tone)?.label || form.tone;

    return `Génère un message WhatsApp de prospection pour :
- Prénom : ${form.prenom || "inconnu"}
- Entreprise : ${form.entreprise || "non précisée"}
- Poste : ${form.poste || "non précisé"}
- Secteur : ${sectorLabel}
- Ton souhaité : ${toneLabel}
${form.contactCommun ? `- Contact commun : ${form.contactCommun}` : "- Pas de contact commun"}
${form.contexte ? `- Contexte spécifique : ${form.contexte}` : ""}

Génère 2 versions selon les règles.`;
  };

  const generate = async () => {
    if (!form.prenom || !form.secteur) {
      setError("Prénom et secteur sont obligatoires.");
      return;
    }
    setError("");
    setLoading(true);
    setResult("");

    try {
      const prompt = SYSTEM_PROMPT + "\n\n" + buildPrompt();

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`Erreur API : ${res.status}`);

      const data = await res.json();
      setResult(data.text || "Aucune réponse générée.");
    } catch (err) {
      setError("Erreur de génération. Vérifie ta clé API et le déploiement.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setForm({ prenom: "", entreprise: "", poste: "", secteur: "", tone: "direct", contactCommun: "", contexte: "" });
    setResult("");
    setError("");
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        ::placeholder { color: #3a3a3a; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #c8f04a !important; }
        .btn-main:hover { background: #d4f55a !important; transform: translateY(-1px); }
        .btn-copy:hover { background: #1a2a00 !important; }
        .btn-reset:hover { color: #c8f04a !important; }
        .field-group { position: relative; }
        select option { background: #111; color: #eee; }
        .result-block { white-space: pre-wrap; }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>PROSPECTION</div>
          <h1 style={styles.title}>Outil Solan</h1>
          <p style={styles.subtitle}>Génération de messages WhatsApp B2B — Secteurs régulés</p>
        </div>

        {/* Form */}
        <div style={styles.card}>
          <div style={styles.sectionLabel}>PROSPECT</div>
          <div style={styles.grid2}>
            <div className="field-group">
              <label style={styles.label}>Prénom *</label>
              <input
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                placeholder="Guillaume"
                style={styles.input}
              />
            </div>
            <div className="field-group">
              <label style={styles.label}>Entreprise</label>
              <input
                name="entreprise"
                value={form.entreprise}
                onChange={handleChange}
                placeholder="Doctrine"
                style={styles.input}
              />
            </div>
            <div className="field-group">
              <label style={styles.label}>Poste</label>
              <input
                name="poste"
                value={form.poste}
                onChange={handleChange}
                placeholder="CEO / Directeur Juridique"
                style={styles.input}
              />
            </div>
            <div className="field-group">
              <label style={styles.label}>Secteur *</label>
              <select
                name="secteur"
                value={form.secteur}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Sélectionner</option>
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.sectionLabel}>CONTEXTE</div>
          <div className="field-group" style={{ marginBottom: 16 }}>
            <label style={styles.label}>Contact commun</label>
            <input
              name="contactCommun"
              value={form.contactCommun}
              onChange={handleChange}
              placeholder="Germain, CTO d'Allaw"
              style={styles.input}
            />
          </div>
          <div className="field-group" style={{ marginBottom: 16 }}>
            <label style={styles.label}>Contexte spécifique</label>
            <textarea
              name="contexte"
              value={form.contexte}
              onChange={handleChange}
              placeholder="Actualité, signal terrain, info sur la boîte, projet en cours..."
              style={{ ...styles.input, height: 80, resize: "vertical" }}
            />
          </div>

          <div style={styles.sectionLabel}>TON</div>
          <div style={styles.toneRow}>
            {TONE_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm({ ...form, tone: t.value })}
                style={{
                  ...styles.toneBtn,
                  ...(form.tone === t.value ? styles.toneBtnActive : {}),
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            className="btn-main"
            onClick={generate}
            disabled={loading}
            style={styles.btnMain}
          >
            {loading ? "Génération..." : "Générer les messages →"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <div style={styles.sectionLabel}>RÉSULTAT</div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="btn-copy"
                  onClick={copyToClipboard}
                  style={styles.btnCopy}
                >
                  {copied ? "✓ Copié" : "Copier tout"}
                </button>
                <button
                  className="btn-reset"
                  onClick={reset}
                  style={styles.btnReset}
                >
                  Nouveau
                </button>
              </div>
            </div>
            <div className="result-block" style={styles.resultText}>
              {result}
            </div>
          </div>
        )}

        <div style={styles.footer}>
          Outil Solan — Usage interne
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0a",
    fontFamily: "'DM Mono', monospace",
    color: "#eee",
    padding: "40px 16px 80px",
  },
  container: {
    maxWidth: 680,
    margin: "0 auto",
  },
  header: {
    marginBottom: 40,
  },
  badge: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    letterSpacing: 4,
    color: "#c8f04a",
    marginBottom: 12,
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 48,
    fontWeight: 800,
    color: "#f5f5f5",
    lineHeight: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    letterSpacing: 0.5,
  },
  card: {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: 12,
    padding: 32,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    letterSpacing: 3,
    color: "#444",
    marginBottom: 16,
    marginTop: 8,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 11,
    color: "#555",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    background: "#0a0a0a",
    border: "1px solid #222",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#eee",
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    transition: "border-color 0.2s",
    appearance: "none",
  },
  toneRow: {
    display: "flex",
    gap: 8,
    marginBottom: 28,
  },
  toneBtn: {
    flex: 1,
    padding: "10px 8px",
    background: "transparent",
    border: "1px solid #222",
    borderRadius: 8,
    color: "#555",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  toneBtnActive: {
    border: "1px solid #c8f04a",
    color: "#c8f04a",
    background: "#0f1800",
  },
  btnMain: {
    width: "100%",
    padding: "16px",
    background: "#c8f04a",
    border: "none",
    borderRadius: 8,
    color: "#0a0a0a",
    fontSize: 14,
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.5,
    transition: "all 0.15s",
  },
  error: {
    background: "#1a0000",
    border: "1px solid #3a0000",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#ff6b6b",
    fontSize: 12,
    marginBottom: 16,
  },
  resultCard: {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: 12,
    padding: 32,
    marginBottom: 24,
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  resultText: {
    fontSize: 13,
    lineHeight: 1.8,
    color: "#ccc",
  },
  btnCopy: {
    padding: "8px 16px",
    background: "#0f1800",
    border: "1px solid #c8f04a",
    borderRadius: 6,
    color: "#c8f04a",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  btnReset: {
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid #222",
    borderRadius: 6,
    color: "#444",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#2a2a2a",
    letterSpacing: 2,
  },
};