import { Button } from "../components/UI"

export default function ColorPage({size,onSolve}){

  return(
    <div>
      <h2>Paint the Cube</h2>
      <p>Cube Size: {size}</p>

      <Button onClick={()=>onSolve({
        moves:["R","U","R'","U'"]
      })}>
        Solve Cube
      </Button>
    </div>
  )
}