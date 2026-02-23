import axios from 'axios'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'https://valyntra-api.onrender.com'
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const register  = (data) => api.post('/api/auth/register', data)
export const login     = (data) => api.post('/api/auth/login', data)
export const getMe     = ()     => api.get('/api/auth/me')

export const createCompany  = (data) => api.post('/api/companies', data)
export const listCompanies  = ()     => api.get('/api/companies')
export const getCompany     = (id)   => api.get(`/api/companies/${id}`)

export const submitAssessment = (data) => api.post('/api/assessments', data)
export const getAssessments   = (cid)  => api.get(`/api/assessments/company/${cid}`)

export const getScore         = (cid)  => api.get(`/api/scores/${cid}`)
export const getOpportunities = (cid)  => api.get(`/api/opportunities/${cid}`)

export const listProviders    = ()     => api.get('/api/providers')
export const createProvider   = (data) => api.post('/api/providers', data)
export const deleteProvider   = (id)   => api.delete(`/api/providers/${id}`)

export const getMatches       = (cid)  => api.get(`/api/matches/${cid}`)
export const getDashboard     = (cid)  => api.get(`/api/dashboard/${cid}`)

export default api
