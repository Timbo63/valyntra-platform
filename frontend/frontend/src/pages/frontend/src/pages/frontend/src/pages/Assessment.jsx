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
        <h2 style={{ fontSize:28, marginBottom:12 }}>Assessment Complete
