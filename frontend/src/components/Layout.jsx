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
        display: 'flex', flexDirection: 'column',
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
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              transition: 'all 0.2s',
            })}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
          <button onClick={handleSignOut} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.6)',
            padding: '7px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'left',
          }}>
            Sign out
          </button>
        </div>
      </aside>
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )
}
