import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auth
export const register  = (data) => api.post('/auth/register', data)
export const login     = (data) => api.post('/auth/login', data)
export const getMe     = ()     => api.get('/auth/me')

// Companies
export const createCompany  = (data) => api.post('/companies', data)
export const listCompanies  = ()     => api.get('/companies')
export const getCompany     = (id)   => api.get(`/companies/${id}`)

// Assessments
export const submitAssessment     = (data) => api.post('/assessments', data)
export const getAssessments       = (cid)  => api.get(`/assessments/company/${cid}`)

// Scores
export const getScore             = (cid)  => api.get(`/scores/${cid}`)

// Opportunities
export const getOpportunities     = (cid)  => api.get(`/opportunities/${cid}`)

// Providers
export const listProviders        = ()     => api.get('/providers')
export const createProvider       = (data) => api.post('/providers', data)
export const deleteProvider       = (id)   => api.delete(`/providers/${id}`)

// Matches
export const getMatches           = (cid)  => api.get(`/matches/${cid}`)

// Dashboard
export const getDashboard         = (cid)  => api.get(`/dashboard/${cid}`)

export default api
