import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('note')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [note, setNote] = useState({ title: '', content: '' })
  const [urlData, setUrlData] = useState({ url: '', title: '' })
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfTitle, setPdfTitle] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const { data } = await API.get('/documents')
      setDocuments(data)
    } catch (err) {
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const showSuccess = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleAddNote = async () => {
    if (!note.title || !note.content) return setError('Title and content required')
    setSubmitting(true)
    setError('')
    try {
      await API.post('/documents/add-note', note)
      setNote({ title: '', content: '' })
      showSuccess('Note saved!')
      fetchDocuments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddURL = async () => {
    if (!urlData.url) return setError('URL is required')
    setSubmitting(true)
    setError('')
    try {
      await API.post('/documents/add-url', urlData)
      setUrlData({ url: '', title: '' })
      showSuccess('URL content saved!')
      fetchDocuments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scrape URL')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUploadPDF = async () => {
    if (!pdfFile) return setError('Please select a PDF')
    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)
      formData.append('title', pdfTitle || pdfFile.name)
      await API.post('/documents/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setPdfFile(null)
      setPdfTitle('')
      showSuccess('PDF uploaded!')
      fetchDocuments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload PDF')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/documents/${id}`)
      setDocuments(documents.filter(doc => doc._id !== id))
    } catch (err) {
      setError('Failed to delete')
    }
  }

  const typeColor = { pdf: '#f59e0b', url: '#3b82f6', note: '#10b981' }
  const typeIcon = { pdf: '📄', url: '🔗', note: '📝' }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>🧠 Second Brain</h1>
        <div style={styles.userInfo}>
          <span style={styles.username}>Hey, {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.body}>
        {/* Add Content Panel */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Add to your Brain</h2>

          {/* Tabs */}
          <div style={styles.tabs}>
            {['note', 'url', 'pdf'].map(tab => (
              <button
                key={tab}
                style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
                onClick={() => { setActiveTab(tab); setError('') }}
              >
                {typeIcon[tab]} {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          {/* Note Form */}
          {activeTab === 'note' && (
            <div style={styles.form}>
              <input style={styles.input} placeholder="Title" value={note.title}
                onChange={e => setNote({ ...note, title: e.target.value })} />
              <textarea style={styles.textarea} placeholder="Write your note here..."
                value={note.content} rows={5}
                onChange={e => setNote({ ...note, content: e.target.value })} />
              <button style={styles.button} onClick={handleAddNote} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          )}

          {/* URL Form */}
          {activeTab === 'url' && (
            <div style={styles.form}>
              <input style={styles.input} placeholder="https://example.com/article"
                value={urlData.url} onChange={e => setUrlData({ ...urlData, url: e.target.value })} />
              <input style={styles.input} placeholder="Title (optional — auto-detected)"
                value={urlData.title} onChange={e => setUrlData({ ...urlData, title: e.target.value })} />
              <button style={styles.button} onClick={handleAddURL} disabled={submitting}>
                {submitting ? 'Scraping...' : 'Save URL Content'}
              </button>
            </div>
          )}

          {/* PDF Form */}
          {activeTab === 'pdf' && (
            <div style={styles.form}>
              <input style={styles.input} placeholder="Title (optional)"
                value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} />
              <input type="file" accept=".pdf" style={styles.fileInput}
                onChange={e => setPdfFile(e.target.files[0])} />
              {pdfFile && <p style={styles.fileName}>Selected: {pdfFile.name}</p>}
              <button style={styles.button} onClick={handleUploadPDF} disabled={submitting}>
                {submitting ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>
            Your Knowledge Base
            <span style={styles.count}>{documents.length} items</span>
          </h2>

          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : documents.length === 0 ? (
            <p style={styles.empty}>Nothing saved yet. Add your first item above.</p>
          ) : (
            <div style={styles.docList}>
              {documents.map(doc => (
                <div key={doc._id} style={styles.docCard}>
                  <div style={styles.docLeft}>
                    <span style={{ ...styles.docType, color: typeColor[doc.type] }}>
                      {typeIcon[doc.type]} {doc.type.toUpperCase()}
                    </span>
                    <p style={styles.docTitle}>{doc.title}</p>
                    <p style={styles.docDate}>
                      {new Date(doc.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(doc._id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
  body: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.5rem 2rem', maxWidth: '1100px', margin: '0 auto' },
  panel: { background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', border: '1px solid #2d2d44' },
  panelTitle: { color: '#e5e7eb', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' },
  tab: { padding: '0.5rem 1rem', background: '#0f0f23', border: '1px solid #2d2d44', borderRadius: '6px', color: '#6b7280', fontSize: '0.8rem', fontWeight: '600' },
  tabActive: { background: '#2d1b69', border: '1px solid #7c3aed', color: '#a78bfa' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  input: { padding: '0.75rem 1rem', background: '#0f0f23', border: '1px solid #2d2d44', borderRadius: '8px', color: 'white', fontSize: '0.9rem' },
  textarea: { padding: '0.75rem 1rem', background: '#0f0f23', border: '1px solid #2d2d44', borderRadius: '8px', color: 'white', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit' },
  fileInput: { color: '#9ca3af', fontSize: '0.9rem' },
  fileName: { color: '#a78bfa', fontSize: '0.85rem' },
  button: { padding: '0.75rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600' },
  error: { background: '#2d1b1b', color: '#f87171', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.5rem' },
  success: { background: '#1b2d1b', color: '#6ee7b7', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.5rem' },
  count: { background: '#2d2d44', color: '#a78bfa', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' },
  docList: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' },
  docCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f0f23', padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid #2d2d44' },
  docLeft: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  docType: { fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' },
  docTitle: { color: '#e5e7eb', fontSize: '0.9rem', fontWeight: '500' },
  docDate: { color: '#4b5563', fontSize: '0.78rem' },
  deleteBtn: { padding: '0.35rem 0.75rem', background: 'transparent', border: '1px solid #3f1f1f', borderRadius: '6px', color: '#f87171', fontSize: '0.8rem' },
  empty: { color: '#4b5563', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }
}

export default Dashboard