import { useState } from "react"
import { Button } from "../components/UI"
import { solveCube } from "../utils/api"

const COLORS = ["white", "yellow", "orange", "red", "blue", "green"]
const COLOR_HEX = { white:"#f0f0f0", yellow:"#FFD700", orange:"#FF6B00", red:"#E32636", blue:"#0051A2", green:"#009B48" }
const FACE_NAMES = ["Up", "Down", "Front", "Back", "Left", "Right"]
const FACE_SHORT = ["U", "D", "F", "B", "L", "R"]
const FACE_COLORS = { Up:"#f0f0f0", Down:"#FFD700", Front:"#009B48", Back:"#0051A2", Left:"#FF6B00", Right:"#E32636" }

function initFaces(size) {
  return FACE_NAMES.map((name, i) => ({
    name,
    short: FACE_SHORT[i],
    cells: Array(size * size).fill(Object.values(COLOR_HEX)[i])
  }))
}

export default function ColorPage({ size, onSolve }) {
  const [faces, setFaces] = useState(() => initFaces(size))
  const [selected, setSelected] = useState("red")
  const [activeFace, setActiveFace] = useState(0)
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function paintCell(faceIdx, cellIdx) {
    setFaces(prev => prev.map((f, fi) =>
      fi !== faceIdx ? f : { ...f, cells: f.cells.map((c, ci) => ci === cellIdx ? selected : c) }
    ))
  }

  function hexToName(hex) {
    return Object.entries(COLOR_HEX).find(([, v]) => v === hex)?.[0] || "white"
  }

  async function handleSolve() {
    if (!apiKey.trim()) { setError("Please enter your Anthropic API key"); return }
    setError(""); setLoading(true)
    try {
      const payload = {
        size,
        faces: faces.map(f => ({ name: f.name, short: f.short, cells: f.cells.map(hexToName) })),
        api_key: apiKey.trim()
      }
      const sol = await solveCube(payload)
      onSolve(sol, faces)
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to solve. Check your API key.")
    } finally { setLoading(false) }
  }

  const face = faces[activeFace]

  return (
    <div style={{ minHeight:"100vh", background:"#1a1a2e", color:"#fff", fontFamily:"sans-serif", padding:"20px" }}>
      <h2 style={{ textAlign:"center", marginBottom:8, color:"#a78bfa" }}>Paint Your {size}×{size} Cube</h2>
      <p style={{ textAlign:"center", color:"#888", marginBottom:20, fontSize:13 }}>
        Select a color, then click the cells on each face
      </p>

      {/* Color picker */}
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        {COLORS.map(c => (
          <div key={c} onClick={() => setSelected(COLOR_HEX[c])}
            style={{ width:44, height:44, borderRadius:8, background:COLOR_HEX[c], cursor:"pointer",
              border: selected === COLOR_HEX[c] ? "3px solid #fff" : "3px solid transparent",
              boxShadow: selected === COLOR_HEX[c] ? "0 0 12px #fff8" : "none",
              transition:"all .15s" }} />
        ))}
      </div>

      {/* Face tabs */}
      <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {FACE_NAMES.map((name, i) => (
          <div key={name} onClick={() => setActiveFace(i)}
            style={{ padding:"6px 14px", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:600,
              background: activeFace === i ? FACE_COLORS[name] : "#2a2a3e",
              color: activeFace === i ? (name==="Up"||name==="Down" ? "#000":"#fff") : "#aaa",
              border: activeFace === i ? "2px solid #fff4" : "2px solid transparent" }}>
            {name} ({FACE_SHORT[i]})
          </div>
        ))}
      </div>

      {/* Face grid */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
        <div>
          <div style={{ textAlign:"center", marginBottom:8, fontSize:13, color:"#aaa" }}>
            {face.name} face — click to paint
          </div>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${size}, 1fr)`, gap:4 }}>
            {face.cells.map((color, ci) => (
              <div key={ci} onClick={() => paintCell(activeFace, ci)}
                style={{ width:54, height:54, background:color, borderRadius:6, cursor:"pointer",
                  border:"2px solid #0006", transition:"transform .1s" }}
                onMouseEnter={e => e.currentTarget.style.transform="scale(1.08)"}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"} />
            ))}
          </div>
        </div>
      </div>

      {/* All faces mini preview */}
      <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        {faces.map((f, fi) => (
          <div key={fi} onClick={() => setActiveFace(fi)} style={{ cursor:"pointer", textAlign:"center" }}>
            <div style={{ fontSize:11, color:"#888", marginBottom:4 }}>{f.short}</div>
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${size}, 1fr)`, gap:2,
              border: activeFace === fi ? "2px solid #a78bfa" : "2px solid #333", borderRadius:4, padding:2 }}>
              {f.cells.map((c, ci) => (
                <div key={ci} style={{ width:10, height:10, background:c, borderRadius:2 }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* API Key */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
        <input value={apiKey} onChange={e => setApiKey(e.target.value)}
          placeholder="Anthropic API key (sk-ant-...)"
          type="password"
          style={{ width:320, padding:"10px 14px", borderRadius:8, border:"1px solid #444",
            background:"#2a2a3e", color:"#fff", fontSize:13, outline:"none" }} />
      </div>

      {error && <p style={{ textAlign:"center", color:"#f87171", marginBottom:10 }}>{error}</p>}

      <div style={{ display:"flex", justifyContent:"center" }}>
        <Button onClick={handleSolve} disabled={loading}
          style={{ background: loading ? "#555":"#7c5cfc", padding:"12px 32px", fontSize:15 }}>
          {loading ? "🤖 AI Solving..." : "✨ Solve with AI"}
        </Button>
      </div>
    </div>
  )
}