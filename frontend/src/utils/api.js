import axios from "axios"

const api = axios.create({
  baseURL: "https://rubiks-cube-solver-api.onrender.com"
})

export async function solveCube(data){
  const res = await api.post("/solve",data)
  return res.data
}
