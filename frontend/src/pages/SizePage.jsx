import { useState } from "react"

const SIZES = [
  { value: 2, label: "2×2", desc: "Pocket Cube", emoji: "🟦" },
  { value: 3, label: "3×3", desc: "Classic Rubik's Cube", emoji: "🧩" },
  { value: 4, label: "4×4", desc: "Rubik's Revenge", emoji: "🟪" },
]

export default function SizePage({ onNext }) {
  const [size, setSize] = useState(3)

  return (
    <div style={{
      minHeight: "100vh", background: "#1a1a2e", color: "#fff",
      fontFamily: "sans-serif", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "20px"
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🧩</div>
        <h1 style={{ color: "#a78bfa", margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          Rubik's Cube Solver
        </h1>
        <p style={{ color: "#666", marginTop: 10, fontSize: 15 }}>
          Powered by AI — select your cube size to begin
        </p>
      </div>

      {/* Size cards */}
      <div style={{ display: "flex", gap: 20, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
        {SIZES.map(({ value, label, desc, emoji }) => (
          <div key={value} onClick={() => setSize(value)}
            style={{
              width: 140, padding: "28px 16px", borderRadius: 18, cursor: "pointer",
              textAlign: "center",
              background: size === value ? "linear-gradient(135deg,#7c5cfc,#a78bfa)" : "#2a2a3e",
              border: `2px solid ${size === value ? "#c4b0ff" : "#3a3a5c"}`,
              boxShadow: size === value ? "0 0 28px #7c5cfc55" : "none",
              transform: size === value ? "scale(1.06)" : "scale(1)",
              transition: "all .2s ease"
            }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>{emoji}</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 6, letterSpacing: -1 }}>{label}</div>
            <div style={{ fontSize: 12, color: size === value ? "#e0d4ff" : "#777", lineHeight: 1.4 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Selected info */}
      <p style={{ color: "#a78bfa", fontSize: 14, marginBottom: 24, fontWeight: 600 }}>
        Selected: {SIZES.find(s => s.value === size)?.label} — {SIZES.find(s => s.value === size)?.desc}
      </p>

      {/* Next button */}
      <button onClick={() => onNext(size)}
        style={{
          padding: "14px 48px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg,#7c5cfc,#a78bfa)",
          color: "#fff", fontSize: 16, fontWeight: 700,
          cursor: "pointer", letterSpacing: 0.5,
          boxShadow: "0 4px 20px #7c5cfc55",
          transition: "opacity .15s"
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        Next →
      </button>
    </div>
  )
}