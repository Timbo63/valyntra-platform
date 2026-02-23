import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

const NAV = [
  { to: '/',           label: 'Dashboard',   icon: '▦' },
  { to: '/assessment', label: 'Assessment',  icon: '◈' },
  { to: '/providers',  label: 'Providers',   icon: '◉' },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => { signOut(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 240, background: 'var(--blue-deep)', color: 'white',
        display: 'flex', flexDirection: 'column', padding: '0',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, letterSpacing: 2 }}>VALYNTRA</div>
          <div style={{ fontSize: 11, opacity: 0.45, letterSpacing: 1, marginTop: 4 }}>PLATFORM</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 8, marginBottom: 4,
              textDecoration:
