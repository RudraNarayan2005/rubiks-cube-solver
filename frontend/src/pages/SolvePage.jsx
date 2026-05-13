import { useState, useEffect, useRef } from "react"
import { Cube3D } from "../components/Cube3D"
import { Button } from "../components/UI"

const MOVE_COLORS = {
  U:"#FFD700", D:"#f0f0f0", F:"#009B48", B:"#0051A2", L:"#FF6B00", R:"#E32636",
  M:"#a78bfa", E:"#34d399", S:"#f472b6"
}

function getMoveColor(move) {
  const base = move.replace(/['2w]/g,"")
  return MOVE_COLORS[base] || "#a78bfa"
}

export default function SolvePage({ solution, faces, size, onBack }) {
  const [step, setStep] = useState(-1) // -1 = not started
  const [playing, setPlaying] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const [doneMoves, setDoneMoves] = useState([])
  const intervalRef = useRef(null)

  const moves = solution?.moves || []
  const total = moves.length
  const currentMove = step >= 0 && step < total ? moves[step] : null
  const isFinished = step >= total

  function goTo(s) {
    if (s < 0 || s > total) return
    setStep(s)
    if (s >= 0 && s < total) {
      setAnimKey(k => k + 1)
      setDoneMoves(moves.slice(0, s))
    }
    if (s >= total) {
      setDoneMoves(moves)
      setPlaying(false)
    }
  }

  function next() { goTo(step + 1) }
  function prev() { goTo(step - 1) }

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          const next = s + 1
          if (next >= total) { setPlaying(false); clearInterval(intervalRef.current); return total }
          setAnimKey(k => k + 1)
          setDoneMoves(moves.slice(0, next))
          return next
        })
      }, 700)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, total])

  function startPlay() {
    if (isFinished) { goTo(0); setTimeout(() => setPlaying(true), 100) }
    else setPlaying(true)
  }

  return (
    <div style={{ minHeight:"100vh", background:"#1a1a2e", color:"#fff", fontFamily:"sans-serif", padding:"16px" }}>
      <h2 style={{ textAlign:"center", color:"#a78bfa", marginBottom:4 }}>
        {isFinished ? "✅ Solved!" : step === -1 ? "🧩 Ready to Solve" : `Move ${step + 1} / ${total}`}
      </h2>

      {currentMove && (
        <div style={{ textAlign:"center", marginBottom:8 }}>
          <span style={{ fontSize:40, fontWeight:700, color: getMoveColor(currentMove),
            textShadow:`0 0 20px ${getMoveColor(currentMove)}88` }}>
            {currentMove}
          </span>
          <div style={{ color:"#aaa", fontSize:13, marginTop:4 }}>
            {solution?.move_details?.find(m => m.move === currentMove)?.face} —{" "}
            {solution?.move_details?.find(m => m.move === currentMove)?.direction}
          </div>
        </div>
      )}

      {isFinished && (
        <p style={{ textAlign:"center", color:"#34d399", fontSize:16, marginBottom:8 }}>
          🎉 All {total} moves done! Your cube is solved!
        </p>
      )}

      {/* 3D Cube */}
      <div style={{ maxWidth:440, margin:"0 auto 16px" }}>
        <Cube3D size={size} faces={faces} currentMove={currentMove} isAnimating={animKey} />
      </div>

      {/* Controls */}
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <button onClick={prev} disabled={step <= 0}
          style={{ padding:"10px 20px", borderRadius:8, background: step<=0?"#333":"#374151",
            color:"#fff", border:"none", cursor: step<=0?"not-allowed":"pointer", fontSize:18 }}>
          ◀
        </button>

        {playing
          ? <button onClick={() => setPlaying(false)}
              style={{ padding:"10px 24px", borderRadius:8, background:"#f59e0b",
                color:"#000", border:"none", cursor:"pointer", fontWeight:700 }}>
              ⏸ Pause
            </button>
          : <button onClick={startPlay}
              style={{ padding:"10px 24px", borderRadius:8, background:"#7c5cfc",
                color:"#fff", border:"none", cursor:"pointer", fontWeight:700 }}>
              {step === -1 ? "▶ Start" : isFinished ? "↺ Replay" : "▶ Play"}
            </button>
        }

        <button onClick={next} disabled={isFinished}
          style={{ padding:"10px 20px", borderRadius:8, background: isFinished?"#333":"#374151",
            color:"#fff", border:"none", cursor: isFinished?"not-allowed":"pointer", fontSize:18 }}>
          ▶
        </button>
      </div>

      {/* Algorithm info */}
      {solution?.algorithm && (
        <p style={{ textAlign:"center", color:"#888", fontSize:12, marginBottom:12 }}>
          Algorithm: <span style={{ color:"#a78bfa" }}>{solution.algorithm}</span>
          {" · "}{total} moves
        </p>
      )}

      {/* Move list */}
      <div style={{ maxWidth:500, margin:"0 auto 20px", background:"#12122a",
        borderRadius:12, padding:"12px 16px" }}>
        <div style={{ fontSize:12, color:"#666", marginBottom:8 }}>All moves</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {moves.map((m, i) => (
            <div key={i} onClick={() => goTo(i)}
              style={{ padding:"4px 10px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600,
                background: i < step ? "#1e3a2a" : i === step ? getMoveColor(m) : "#2a2a3e",
                color: i === step ? (getMoveColor(m)==="#f0f0f0"?"#000":"#fff") : i < step ? "#34d399" : "#aaa",
                border: i === step ? `2px solid ${getMoveColor(m)}` : "2px solid transparent",
                textDecoration: i < step ? "line-through" : "none",
                opacity: i < step ? 0.6 : 1 }}>
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {solution?.explanation && (
        <div style={{ maxWidth:500, margin:"0 auto 20px", background:"#12122a",
          borderRadius:12, padding:"12px 16px", color:"#aaa", fontSize:13, lineHeight:1.6 }}>
          <span style={{ color:"#a78bfa", fontWeight:600 }}>Strategy: </span>
          {solution.explanation}
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"center" }}>
        <Button onClick={onBack}>← Try Another Cube</Button>
      </div>
    </div>
  )
}