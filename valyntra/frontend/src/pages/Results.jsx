import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDashboard } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const LEVEL_COLOR = { 'Ready': '#10B981', 'Developing': '#F59E0B', 'Early Stage': '#EF4444' }

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard(id).then(r => setData(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page">Loading results...</div>
  if (!data?.score) return <div className="page"><p>No results found.</p><button className="btn btn-primary" onClick={() => navigate('/assessment')}>Take Assessment</button></div>

  const { company, score, opportunities, matches, total_pipeline_value } = data

  const barData = [
    { name: 'Data', score: score.data_maturity_score },
    { name: 'Automation', score: score.process_automation_score },
    { name: 'Leadership', score: score.leadership_alignment_score },
    { name: 'Tech Infra', score: score.technical_infrastructure_score },
  ]

  return (
    <div className="page">
      <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:14, cursor:'pointer', marginBottom:16 }}>
        ← Back to Dashboard
      </button>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:32 }}>
        <div>
          <h1 className="page-title">{company.name}</h1>
          <p className="page-sub">{company.industry} · {company.county} · {company.company_size_segment}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/assessment')}>Re-assess</button>
      </div>

      {/* Score Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--blue-deep), var(--blue-mid))', borderRadius: 16, padding: '40px', color: 'white', marginBottom: 24, display:'flex', gap:40, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'Syne', fontSize: 72, fontWeight: 800, lineHeight:1, color: LEVEL_COLOR[score.recommendation_level] }}>
            {score.overall_score}
          </div>
          <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>out of 100</div>
        </div>
        <div>
          <div style={{ fontFamily:'Syne', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{score.recommendation_level}</div>
          <p style={{ opacity: 0.7, fontSize: 15, maxWidth: 400, lineHeight: 1.6 }}>
            {score.recommendation_level === 'Ready' && 'Your organization has strong foundations. You are ready for high-impact AI deployment.'}
            {score.recommendation_level === 'Developing' && 'Good progress made. Focus on data infrastructure and leadership alignment before scaling.'}
            {score.recommendation_level === 'Early Stage' && 'Early stage readiness. Prioritize quick-win automations and building internal awareness.'}
          </p>
          <div style={{ marginTop: 16, fontSize: 13, opacity: 0.5 }}>Est. pipeline value: <strong style={{ opacity:1 }}>${total_pipeline_value.toLocaleString()}</strong></div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Score breakdown chart */}
        <div className="card">
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip formatter={v => [`${v.toFixed(1)}`, 'Score']} />
              <Bar dataKey="score" radius={[0,4,4,0]}>
                {barData.map((_, i) => <Cell key={i} fill="var(--blue)" fillOpacity={0.7 + i*0.07} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { label: 'Data Maturity', val: score.data_maturity_score },
            { label: 'Process Automation', val: score.process_automation_score },
            { label: 'Leadership Alignment', val: score.leadership_alignment_score },
            { label: 'Technical Infrastructure', val: score.technical_infrastructure_score },
          ].map(s => (
            <div key={s.label} style={{ background:'white', border:'1px solid var(--border)', borderRadius:10, padding:'14px 18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:14, fontWeight:600 }}>{s.label}</span>
                <span style={{ fontSize:14, fontWeight:700, color:'var(--blue)' }}>{s.val.toFixed(1)}</span>
              </div>
              <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${s.val}%`, background:'var(--blue)', borderRadius:3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, marginBottom: 20 }}>Recommended AI Use Cases</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {opportunities.map((opp, i) => (
            <div key={opp.id} style={{ display:'flex', gap:20, padding:'18px 0', borderBottom: i < opportunities.length-1 ? '1px solid var(--border)' : 'none', alignItems:'flex-start' }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'rgba(37,99,235,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:800, fontSize:14, color:'var(--blue)', flexShrink:0 }}>
                {opp.rank}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{opp.use_case}</div>
                <div style={{ fontSize:13, color:'var(--muted)' }}>
                  Tag: <code style={{ background:'var(--cream)', padding:'1px 6px', borderRadius:4 }}>{opp.use_case_tag}</code>
                  {' · '}Effort: {opp.implementation_effort}
                  {' · '}ROI: {opp.roi_classification}
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <span className={`badge badge-${opp.impact_estimate==='High'?'blue':opp.impact_estimate==='Medium'?'yellow':'red'}`}>
                  {opp.impact_estimate} Impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider Matches */}
      <div className="card">
        <h3 style={{ fontSize: 18, marginBottom: 20 }}>Provider Matches ({matches.length})</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {matches.map(m => (
            <div key={m.id} style={{ border:'1px solid var(--border)', borderRadius:10, padding:'18px 20px', display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{m.provider?.name}</div>
                <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{m.provider?.provider_type} · {m.provider?.delivery_model}</div>
              </div>
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ fontSize:13, color:'var(--muted)' }}>For:</div>
                <div style={{ fontSize:13, fontWeight:600 }}>{m.opportunity?.use_case}</div>
              </div>
              <div style={{ textAlign:'center', minWidth:80 }}>
                <div style={{ fontFamily:'Syne', fontSize:22, fontWeight:800, color:'var(--blue)' }}>{m.weighted_score}</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>Match Score</div>
              </div>
              <div style={{ textAlign:'right', minWidth:100 }}>
                <div style={{ fontWeight:700 }}>${(m.est_pilot_value||0).toLocaleString()}</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>Est. Pilot Value</div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {m.capability_match && <span className="badge badge-green">Cap ✓</span>}
                {m.industry_match && <span className="badge badge-blue">Ind ✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
