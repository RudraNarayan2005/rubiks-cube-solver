export function Button({children,...props}){
  return(
    <button
      style={{
        padding:"10px 20px",
        borderRadius:"8px",
        border:"none",
        background:"#7c5cfc",
        color:"#fff",
        cursor:"pointer"
      }}
      {...props}
    >
      {children}
    </button>
  )
}