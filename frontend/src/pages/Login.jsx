import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, getMe } from '../services/api'
import { useAuth } from '../services/AuthContext'

export default function Login() {
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await login(form)
      localStorage.setItem('token', data.access_token)
      const meRes = await getMe()
      signIn(data.access_token, meRes.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--blue-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, letterSpacing: 3, color: 'white' }}>VALYNTRA</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 6 }}>AI Operational Intelligence Platform</div>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 22, marginBottom: 24 }}>Sign in</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@company.com" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="••••••••" />
            </div>
            {error && <p className="error-msg" style={{ marginBottom: 16 }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--muted)' }}>
            No account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
