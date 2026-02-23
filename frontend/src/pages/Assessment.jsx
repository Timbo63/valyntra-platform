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

cons
