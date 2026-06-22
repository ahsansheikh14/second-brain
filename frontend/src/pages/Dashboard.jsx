import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Second Brain</h1>
        <div style={styles.userInfo}>
          <span style={styles.username}>Hey, {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div style={styles.body}>
        <h2 style={styles.welcome}>Your knowledge base is empty.</h2>
        <p style={styles.sub}>Tomorrow you will be able to add PDFs, URLs, and notes here.</p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0f0f' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem', background: '#1a1a2e', borderBottom: '1px solid #2d2d44' },
  logo: { color: '#a78bfa', fontSize: '1.4rem', fontWeight: '700' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
  username: { color: '#d1d5db', fontSize: '0.95rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #4b5563', borderRadius: '6px', color: '#9ca3af', fontSize: '0.85rem' },
  body: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 65px)', gap: '0.75rem' },
  welcome: { color: '#e5e7eb', fontSize: '1.3rem', fontWeight: '600' },
  sub: { color: '#6b7280', fontSize: '0.95rem' }
}

export default Dashboard