import axios from "axios"

const api = axios.create({
  baseURL:"/api"
})

export async function solveCube(data){
  const res = await api.post("/solve",data)
  return res.data
}