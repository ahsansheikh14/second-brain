import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await API.post('/auth/register', form)
      login({ _id: data._id, name: data.name, email: data.email }, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Second Brain</h1>
        <p style={styles.subtitle}>Create your account</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account?{' '}
          <Link to="/login" style={styles.anchor}>Login</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { background: '#1a1a2e', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '420px', border: '1px solid #2d2d44' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#a78bfa', marginBottom: '0.3rem', textAlign: 'center' },
  subtitle: { color: '#6b7280', textAlign: 'center', marginBottom: '1.8rem', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.85rem 1rem', background: '#0f0f23', border: '1px solid #2d2d44', borderRadius: '8px', color: 'white', fontSize: '0.95rem' },
  button: { padding: '0.85rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', marginTop: '0.5rem' },
  error: { background: '#2d1b1b', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  link: { textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.9rem' },
  anchor: { color: '#a78bfa', textDecoration: 'none', fontWeight: '600' }
}

export default Register