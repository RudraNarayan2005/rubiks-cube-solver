export default function SolvePage({solution}){

  return(
    <div>
      <h2>Solution</h2>

      {solution?.moves?.map((m,i)=>(
        <div key={i}>{i+1}. {m}</div>
      ))}

    </div>
  )
}