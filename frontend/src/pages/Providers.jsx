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
                  <option value="">—</option><option>remote</option><option>hybrid</option><option>onsite+remote</option>
                </select>
              </div>
              <div><label style={L}>Project Size</label>
                <select value={form.typical_project_size} onChange={e=>setForm({...form,typical_project_size:e.target.value})}>
                  <option value="">—</option><option>SMB</option><option>mid-enterprise</option><option>enterprise</option>
                </select>
              </div>
              <div><label style={L}>Capacity</label>
                <select value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}>
                  <option value="">—</option><option>Low</option><option>Med</option><option>High</option>
                </select>
              </div>
              <div><label style={L}>Qualification Score (1–30)</label><input type="number" min={1} max={30} value={form.qualification_score} onChange={e=>setForm({...form,qualification_score:e.target.value})} /></div>
              <div style={{ gridColumn:'1/-1' }}><label style={L}>Website</label><input value={form.website} onChange={e=>setForm({...form,website:e.target.value})} placeholder="https://" /></div>
            </div>
            {error && <p className="error-msg" style={{marginTop:12}}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ marginTop:20 }} disabled={loading}>
              {loading ? 'Saving...' : 'Add Provider'}
            </button>
          </form>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search providers..." style={{ maxWidth: 320 }} />
      </div>

      <div className="grid-3">
        {filtered.map(p => (
          <div key={p.id} className="card" style={{ position:'relative' }}>
            {user?.is_admin && (
              <button onClick={() => handleDelete(p.id)} style={{ position:'absolute', top:12, right:12, background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:16 }}>✕</button>
            )}
            <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:16, marginBottom:4 }}>
