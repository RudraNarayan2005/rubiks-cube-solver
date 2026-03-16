import { useState } from "react"
import SizePage from "./pages/SizePage"
import ColorPage from "./pages/ColorPage"
import SolvePage from "./pages/SolvePage"

export default function App() {

  const [phase,setPhase] = useState(1)
  const [size,setSize] = useState(null)
  const [cubeColors,setCubeColors] = useState([])
  const [solution,setSolution] = useState(null)

  if(phase===1){
    return <SizePage onNext={(s)=>{setSize(s);setPhase(2)}}/>
  }

  if(phase===2){
    return <ColorPage size={size} cubeColors={cubeColors} setCubeColors={setCubeColors}
      onSolve={(sol)=>{setSolution(sol);setPhase(3)}} />
  }

  return <SolvePage solution={solution}/>
}