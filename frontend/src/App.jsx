import { useState } from "react"
import SizePage from "./pages/SizePage"
import ColorPage from "./pages/ColorPage"
import SolvePage from "./pages/SolvePage"

export default function App() {
  const [phase, setPhase] = useState(1)
  const [size, setSize] = useState(null)
  const [solution, setSolution] = useState(null)
  const [faces, setFaces] = useState(null)

  if (phase === 1) {
    return <SizePage onNext={(s) => { setSize(s); setPhase(2) }} />
  }

  if (phase === 2) {
    return (
      <ColorPage
        size={size}
        onSolve={(sol, f) => { setSolution(sol); setFaces(f); setPhase(3) }}
      />
    )
  }

  return (
    <SolvePage
      solution={solution}
      faces={faces}
      size={size}
      onBack={() => setPhase(1)}
    />
  )
}