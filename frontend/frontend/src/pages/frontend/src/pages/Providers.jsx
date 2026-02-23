import { useState, useEffect } from 'react'
import { listProviders, createProvider, deleteProvider } from '../services/api'
import { useAuth } from '../services/AuthContext'

const EMPTY = { name:'', provider_type:'', capability_tags:'', industries_served:'', delivery_model:'', typical_project_size:'', capacity:'', qualification_score:'', website:'' }

export default function Providers() {
  const { user } = useAuth()
  const [providers, setProviders] = useState([])
  const [form, setForm]     = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const load = () => listProviders().then(r => setProviders(r.data))
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await createProvider({
        ...form,
        capability_tags: form.capability_tags.split(',').map(s=>s.trim()).filter(Boolean),
        industries_served: form.industries_served.split(',').map(s=>s.trim()).filter(Boolean),
        qualification_score: parseInt(form.qualification_score) || null,
      })
      setForm(EMPTY); setShowForm(false); load()
    } catch (e) { setError(e.response?.data?.detail || 'Error') }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this provider?')) return
    await deleteProvider(id); load()
  }

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.provider_type||'').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 className="page-title">Provider Registry</h1>
          <p className="page-sub">{providers.length} identified providers across the network</p>
        </div>
        {user?.is_admin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Provider'}
          </button>
        )}
      </div>

      {showForm && user?.is_admin && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>Add Provider</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-2" style={{ gap: 16 }}>
              <div><label style={L}>Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
              <div><label style={L}>Type</label><input value={form.provider_type} onChange={e=>setForm({...form,provider_type:e.target.value})} placeholder="Global SI / Consulting / ML Specialist" /></div>
              <div><label style={L}>Capability Tags (comma-separated)</label><input value={form.capability_tags} onChange={e=>setForm({...form,capability_tags:e.target.value})} placeholder="ml, automation, nlp" /></div>
              <div><label style={L}>Industries Served</label><input value={form.industries_served} onChange={e=>setForm({...form,industries_served:e.target.value})} placeholder="multi-industry, healthcare" /></div>
              <div><label style={L}>Delivery Model</label>
                <select value={form.delivery_model} onChange={e=>setForm({...form,delivery_model:e.target.value})}>
                  <option value="">—</option><opti
