import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/')
    }, 700)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Sign in to IBM Quantum</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            IBM Account Email
            <input
              className={styles.input}
              type="email"
              placeholder="you@ibm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className={styles.label}>
            IBM Cloud API Key
            <input
              className={styles.input}
              type="password"
              placeholder="**** **** **** ****"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </label>
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Authenticating…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login


