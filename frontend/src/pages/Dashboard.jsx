import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCompanies, getDashboard } from '../services/api'
import { useAuth } from '../services/AuthContext'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

const LEVEL_COLOR = { 'Ready': 'var(--success)', 'Developing': 'var(--warning)', 'Early Stage': 'var(--danger)' }

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [companies, setCompanies]   = useState([])
  const [selected, setSelected]     = useState(null)
  const [dashboard, setDashboard]   = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    listCompanies().then(r => {
      setCompanies(r.data)
      if (r.data.length > 0) setSelected(r.data[0])
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    getDashboard(selected.id).then(r => setDashboard(r.data)).catch(() => setDashboard(null))
  }, [selected])

  if (loading) return <div className="page">Loading...</div>

  if (companies.length === 0) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>◈</div>
          <h2 style={{ fontSize: 28, marginBottom: 12 }}>Welcome, {user?.full_name || 'there'}</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28 }}>Start by adding your company and completing an AI readiness assessment.</p>
          <button className="btn btn-primary" onClick={() => navigate('/assessment')}>Start Assessment</button>
        </div>
      </div>
    )
  }

  const score = dashboard?.score
  const opps  = dashboard?.opportunities || []
  const matches = dashboard?.matches || []

  const radarData = score ? [
    { subject: 'Data Maturity',     A: score.data_maturity_score },
    { subject: 'Process Auto.',     A: score.process_automation_score },
    { subject: 'Leadership',        A: score.leadership_alignment_score },
    { subject: 'Tech Infra.',       A: score.technical_infrastructure_score },
  ] : []

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">AI Readiness & Opportunity Overview</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={selected?.id || ''} onChange={e => setSelected(companies.find(c => c.id === parseInt(e.target.value)))} style={{ width: 'auto', minWidth: 200 }}>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/assessment')}>+ New Assessment</button>
        </div>
      </div>

      {!score ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>No assessment submitted for <strong>{selected?.name}</strong> yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/assessment')}>Submit Assessment</button>
        </div>
      ) : (
        <>
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-num">{score.overall_score}</div>
              <div className="stat-label">Overall Readiness Score</div>
              <span className="badge" style={{ marginTop: 8, background: LEVEL_COLOR[score.recommendation_level] + '22', color: LEVEL_COLOR[score.recommendation_level] }}>
                {score.recommendation_level}
