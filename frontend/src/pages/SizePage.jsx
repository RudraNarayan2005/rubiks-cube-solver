import { useState } from "react"
import { Button } from "../components/UI"

export default function SizePage({onNext}){

  const [size,setSize] = useState(3)

  return(
    <div>
      <h1>Select Cube Size</h1>

      <Button onClick={()=>setSize(2)}>2x2</Button>
      <Button onClick={()=>setSize(3)}>3x3</Button>
      <Button onClick={()=>setSize(4)}>4x4</Button>

      <br/><br/>

      <Button onClick={()=>onNext(size)}>Next</Button>
    </div>
  )
}