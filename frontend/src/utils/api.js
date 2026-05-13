import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || ""

const api = axios.create({
  baseURL: BASE_URL
})

export async function solveCube(data) {
  const res = await api.post("/solve", data)
  return res.data
}
