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
              </span>
            </div>
            <div className="stat-card">
              <div className="stat-num">{opps.length}</div>
              <div className="stat-label">AI Opportunities Identified</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{matches.length}</div>
              <div className="stat-label">Provider Matches</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">${(dashboard.total_pipeline_value / 1000).toFixed(0)}K</div>
              <div className="stat-label">Est. Pipeline Value</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <h3 style={{ fontSize: 18, marginBottom: 20 }}>Readiness Breakdown</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                  <Radar name="Score" dataKey="A" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip formatter={(v) => [`${v.toFixed(1)}`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={{ fontSize: 18, marginBottom: 20 }}>Top AI Opportunities</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {opps.slice(0, 4).map(opp => (
                  <div key={opp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>#{opp.rank} {opp.use_case}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{opp.roi_classification} · Effort: {opp.implementation_effort}</div>
                    </div>
                    <span className={`badge badge-${opp.impact_estimate === 'High' ? 'blue' : opp.impact_estimate === 'Medium' ? 'yellow' : 'red'}`}>
                      {opp.impact_estimate}
                    </span>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/results/${selected.id}`)}>
                View Full Results
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Top Provider Matches</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Provider','Use Case','Match Score','Cap.','Ind.','Est. Value','Stage'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 6).map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}><strong>{m.provider?.name}</strong></td>
                      <td style={{ padding: '12px', color: 'var(--muted)' }}>{m.opportunity?.use_case}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ height: 6, width: 80, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${m.weighted_score}%`, background: 'var(--blue)', borderRadius: 3 }} />
                          </div>
                          <span>{m.weighted_score}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{m.capability_match ? '✓' : '—'}</td>
                      <td style={{ padding: '12px' }}>{m.industry_match ? '✓' : '—'}</td>
                      <td style={{ padding: '12px' }}>${(m.est_pilot_value || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}><span className="badge badge-blue">{m.stage}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
