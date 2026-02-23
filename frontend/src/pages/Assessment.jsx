import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCompanies, createCompany, submitAssessment } from '../services/api'

const QUESTIONS = [
  { key: 'data_maturity', label: 'Data Maturity', desc: 'How structured, accessible, and consistent is your organization\'s data?',
    options: ['1 — Scattered, mostly paper/manual', '2 — Partially digital, inconsistent', '3 — Digitized, some structure', '4 — Well-organized, mostly accessible', '5 — Centralized, clean, real-time'] },
  { key: 'process_automation', label: 'Process Automation', desc: 'What is your current level of workflow automation?',
    options: ['1 — Almost entirely manual', '2 — A few tools, mostly manual', '3 — Some automation in select areas', '4 — Broadly automated with some gaps', '5 — Highly automated end-to-end'] },
  { key: 'leadership_alignment', label: 'Leadership Alignment', desc: 'How aligned is executive leadership around AI adoption?',
    options: ['1 — No awareness or interest', '2 — Awareness but no commitment', '3 — Interest but no budget', '4 — Active support and some budget', '5 — Full commitment with dedicated resources'] },
  { key: 'technical_infrastructure', label: 'Technical Infrastructure', desc: 'How ready is your IT environment for AI tooling?',
    options: ['1 — Legacy systems, no cloud', '2 — Partially modernized', '3 — Cloud-enabled, some APIs', '4 — Modern stack, API-ready', '5 — Cloud-native, integration-ready'] },
]

const INDUSTRIES = ['Healthcare','Manufacturing','Distribution','Logistics','Hospitality','Aviation','Financial Services','Technology','Retail','Construction','Other']

export default function Assessment() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(0)
  const [companies, setCompanies] = useState([])
  const [companyId, setCompanyId] = useState(null)
  const [isNew, setIsNew]     = useState(false)
  const [company, setCompany] = useState({ name:'', industry:'', county:'', employee_count:'', primary_function:'' })
  const [answers, setAnswers] = useState({ data_maturity:0, process_automation:0, leadership_alignment:0, technical_infrastructure:0 })
  const [details, setDetails] = useState({ primary_pain:'', current_tools:'', budget_range:'', timeline:'' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listCompanies().then(r => setCompanies(r.data))
  }, [])

  const totalSteps = 7
  const progress = ((step) / (totalSteps - 1)) * 100

  const handleCompanyNext = async () => {
    setError('')
    if (isNew) {
      if (!company.name) { setError('Company name required'); return }
      setLoading(true)
      try {
        const r = await createCompany({ ...company, employee_count: parseInt(company.employee_count) || null })
        setCompanyId(r.data.id)
      } catch (e) { setError(e.response?.data?.detail || 'Error'); setLoading(false); return }
      setLoading(false)
    } else {
      if (!companyId) { setError('Please select a company'); return }
    }
    setStep(1)
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      await submitAssessment({ company_id: companyId, ...answers, ...details })
      setStep(6)
    } catch (e) {
      setError(e.response?.data?.detail || 'Submission failed')
    } finally { setLoading(false) }
  }

  if (step === 6) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh' }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>✓</div>
        <h2 style={{ fontSize:28, marginBottom:12 }}>Assessment Complete</h2>
        <p style={{ color:'var(--muted)', marginBottom:28 }}>Your AI readiness score, opportunities, and provider matches are ready.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>View Dashboard</button>
      </div>
    </div>
  )

  const q = step >= 1 && step <= 4 ? QUESTIONS[step - 1] : null

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <h1 className="page-title">AI Readiness Assessment</h1>
      <p className="page-sub">Answer 4 questions to receive your score, opportunities, and matched providers.</p>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 36 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--blue)', borderRadius: 2, transition: 'width 0.4s' }} />
      </div>
      <div className="card">
        {step === 0 && (
          <>
            <h3 style={{ fontSize: 20, marginBottom: 20 }}>Your Company</h3>
            {companies.length > 0 && !isNew && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={L}>Select existing company</label>
                  <select value={companyId || ''} onChange={e => setCompanyId(parseInt(e.target.value))}>
                    <option value="">— Choose —</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <p style={{ textAlign:'center', color:'var(--muted)', fontSize:14, margin:'16px 0' }}>or</p>
              </>
            )}
            <button className="btn btn-secondary" style={{ marginBottom: 20 }} onClick={() => setIsNew(!isNew)}>
              {isNew ? '← Use existing company' : '+ Add new company'}
            </button>
            {isNew && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div><label style={L}>Company Name *</label><input value={company.name} onChange={e=>setCompany({...company,name:e.target.value})} placeholder="Acme Corp" /></div>
                <div><label style={L}>Industry</label>
                  <select value={company.industry} onChange={e=>setCompany({...company,industry:e.target.value})}>
                    <option value="">— Select —</option>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div><label style={L}>County</label><input value={company.county} onChange={e=>setCompany({...company,county:e.target.value})} placeholder="Broward" /></div>
                  <div><label style={L}>Employees</label><input type="number" value={company.employee_count} onChange={e=>setCompany({...company,employee_count:e.target.value})} placeholder="250" /></div>
                </div>
                <div><label style={L}>Primary Business Function</label><input value={company.primary_function} onChange={e=>setCompany({...company,primary_function:e.target.value})} placeholder="Operations, Sales, etc." /></div>
              </div>
            )}
            {error && <p className="error-msg" style={{marginTop:12}}>{error}</p>}
            <button className="btn btn-primary" style={{ marginTop:24, width:'100%', justifyContent:'center' }} onClick={handleCompanyNext} disabled={loading}>
              {loading ? 'Saving...' : 'Continue →'}
            </button>
          </>
        )}
        {q && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Question {step} of 4
            </div>
            <h3 style={{ fontSize: 22, marginBottom: 8 }}>{q.label}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28 }}>{q.desc}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => setAnswers({...answers, [q.key]: i+1})}
                  style={{
                    padding: '14px 18px', borderRadius: 8, border: `2px solid ${answers[q.key] === i+1 ? 'var(--blue)' : 'var(--border)'}`,
                    background: answers[q.key] === i+1 ? 'rgba(37,99,235,0.06)' : 'white',
                    textAlign:'left', fontSize:14, fontWeight: answers[q.key] === i+1 ? 600 : 400,
                    color: answers[q.key] === i+1 ? 'var(--blue)' : 'var(--ink)',
                    cursor:'pointer', transition:'all 0.15s',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button className="btn btn-secondary" onClick={() => setStep(step-1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}
                onClick={() => { if (!answers[q.key]) { setError('Please select an answer'); return; } setError(''); setStep(step+1) }}>
                {step === 4 ? 'Final Details →' : 'Next →'}
              </button>
            </div>
            {error && <p className="error-msg" style={{marginTop:8}}>{error}</p>}
          </>
        )}
        {step === 5 && (
          <>
            <h3 style={{ fontSize: 20, marginBottom: 20 }}>Final Details <span style={{fontWeight:300,color:'var(--muted)'}}>(optional)</span></h3>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={L}>Primary operational pain point</label>
                <textarea rows={3} value={details.primary_pain} onChange={e=>setDetails({...details,primary_pain:e.target.value})} placeholder="e.g. Manual scheduling across 6 locations consuming 30% of staff time" style={{resize:'vertical'}} />
              </div>
              <div>
                <label style={L}>Current tools in use</label>
                <input value={details.current_tools} onChange={e=>setDetails({...details,current_tools:e.target.value})} placeholder="e.g. Salesforce, QuickBooks, spreadsheets" />
              </div>
              <div className="grid-2">
                <div>
                  <label style={L}>Budget range</label>
                  <select value={details.budget_range} onChange={e=>setDetails({...details,budget_range:e.target.value})}>
                    <option value="">— Select —</option>
                    <option>Under $25K</option><option>$25K – $100K</option>
                    <option>$100K – $500K</option><option>$500K+</option>
                  </select>
                </div>
                <div>
                  <label style={L}>Implementation timeline</label>
                  <select value={details.timeline} onChange={e=>setDetails({...details,timeline:e.target.value})}>
                    <option value="">— Select —</option>
                    <option>0–3 months</option><option>3–6 months</option>
                    <option>6–12 months</option><option>12+ months</option>
                  </select>
                </div>
              </div>
            </div>
            {error && <p className="error-msg" style={{marginTop:12}}>{error}</p>}
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button className="btn btn-secondary" onClick={() => setStep(4)}>← Back</button>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : 'Submit & Generate Results'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const L = { fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }
