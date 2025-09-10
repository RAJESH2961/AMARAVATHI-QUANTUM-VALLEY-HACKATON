import { Link, NavLink, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

function Navbar() {
  const location = useLocation()
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.dot} />
          Quantum Flux
        </Link>
        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => isActive ? styles.linkActive : styles.link}>Home</NavLink>
          {location.pathname !== '/login' && (
            <Link to="/login" className={styles.loginBtn}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar


