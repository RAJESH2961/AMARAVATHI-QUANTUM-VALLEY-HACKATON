import React, { useEffect, useState } from 'react'
import styles from './Home.module.css'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'

// Mock Data (replace with API)
const mockJobs = [
  { id: 'QJ-1001', status: 'running', backend: 'ibmq_manila', created: '2025-09-09 10:00', duration: null, shots: 1024 },
  { id: 'QJ-1002', status: 'waiting', backend: 'ibmq_qasm', created: '2025-09-09 10:05', duration: null, shots: 512 },
  { id: 'QJ-1003', status: 'finished', backend: 'ibmq_montreal', created: '2025-09-09 09:50', duration: '2m 10s', shots: 2048 },
  { id: 'QJ-1004', status: 'finished', backend: 'ibmq_montreal', created: '2025-09-09 09:30', duration: '1m 34s', shots: 1024 },
  { id: 'QJ-1005', status: 'failed', backend: 'ibmq_toronto', created: '2025-09-09 09:20', duration: '30s', shots: 256 },
]

const mockBackends = [
  { name: 'ibmq_manila', status: 'online', queue: 5, avgTime: 45, uptime: 99.5, errorRate: 0.02 },
  { name: 'ibmq_qasm', status: 'online', queue: 12, avgTime: 60, uptime: 97.8, errorRate: 0.05 },
  { name: 'ibmq_montreal', status: 'online', queue: 3, avgTime: 38, uptime: 98.2, errorRate: 0.03 },
  { name: 'ibmq_toronto', status: 'maintenance', queue: 0, avgTime: null, uptime: 92.1, errorRate: null },
]

const mockTrends = [
  { time: '09:00', running: 2, finished: 3, failed: 1 },
  { time: '09:30', running: 1, finished: 4, failed: 1 },
  { time: '10:00', running: 3, finished: 5, failed: 1 },
]

function Home() {
  const [jobs, setJobs] = useState(mockJobs)
  const [backends, setBackends] = useState(mockBackends)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Simulate auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
      // In real app: fetch(`/api/jobs`)
    }, 30000) // every 30s
    return () => clearInterval(interval)
  }, [])

  // Chart Data
  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  const barData = backends.map((b) => ({ name: b.name, queue: b.queue }))
  const busiestBackend = backends.reduce((prev, curr) =>
    prev.queue > curr.queue ? prev : curr, backends[0]
  )

  // Filter + Search
  const filteredJobs = jobs
    .filter((j) => (filter === 'all' ? true : j.status === filter))
    .filter((j) => j.id.toLowerCase().includes(search.toLowerCase()))

  // Export Jobs as CSV
  const exportJobs = () => {
    const csv = [
      ['Job ID', 'Status', 'Backend', 'Created', 'Duration', 'Shots'].join(','),
      ...jobs.map(j => [j.id, j.status, j.backend, j.created, j.duration || '-', j.shots].join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jobs.csv'
    a.click()
  }

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Quantum Jobs Dashboard</h1>
          <p className={styles.subtitle}>
            Monitor, analyze, and optimize your quantum workloads in real-time.
          </p>
        </div>
      </section>

      {/* Control Panel */}
      <section className={styles.controlPanel}>
        <h2>Controls</h2>
        <button onClick={() => setLastUpdated(new Date())} className={styles.refreshBtn}>
          🔄 Refresh Now
        </button>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Jobs</option>
          <option value="running">Running</option>
          <option value="waiting">Waiting</option>
          <option value="finished">Finished</option>
          <option value="failed">Failed</option>
        </select>
        <input
          type="text"
          placeholder="Search job ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
        <button onClick={exportJobs} className={styles.exportBtn}>⬇ Export CSV</button>
        <p className={styles.timestamp}>Last updated: {lastUpdated.toLocaleTimeString()}</p>
      </section>

      {/* Summary Cards */}
      <section className={styles.cardsSection}>
        <div className={styles.grid}>
          <div className={styles.card}><h3>Ongoing Jobs</h3><p>{jobs.length}</p></div>
          <div className={styles.card}><h3>Running Jobs</h3><p>{statusCounts.running || 0}</p></div>
          <div className={styles.card}><h3>Waiting Jobs</h3><p>{statusCounts.waiting || 0}</p></div>
          <div className={styles.card}><h3>Finished Jobs</h3><p>{statusCounts.finished || 0}</p></div>
          <div className={styles.card}><h3>Failed Jobs</h3><p>{statusCounts.failed || 0}</p></div>
        </div>
      </section>

      {/* Backend Status */}
      <section className={styles.backends}>
        <h2>Backend Status</h2>
        <ul className={styles.backendList}>
          {backends.map((b) => (
            <li key={b.name} className={b.status === 'online' ? styles.online : styles.offline}>
              <strong>{b.name}</strong> — {b.status} (Queue: {b.queue})
              {b.avgTime && <span> ⏱ Avg. Time: {b.avgTime}s</span>}
              {b.uptime && <span> 📈 Uptime: {b.uptime}%</span>}
              {b.errorRate !== null && <span> ⚠ Error Rate: {b.errorRate * 100}%</span>}
            </li>
          ))}
        </ul>
      </section>

      {/* Leaderboard */}
      <section className={styles.leaderboard}>
        <h2>🏆 Busiest Backend</h2>
        <p>
          {busiestBackend.name} with a queue of <strong>{busiestBackend.queue}</strong>
        </p>
      </section>

      {/* Recent Jobs */}
      <section className={styles.recentJobs}>
        <h2>Recent Jobs</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Status</th>
              <th>Backend</th>
              <th>Submitted At</th>
              <th>Duration</th>
              <th>Shots</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr
                key={job.id}
                className={job.status === 'failed' ? styles.failedRow : ''}
                onClick={() => setSelectedJob(job)}
              >
                <td>{job.id}</td>
                <td className={styles[job.status]}>{job.status}</td>
                <td>{job.backend}</td>
                <td>{job.created}</td>
                <td>{job.duration || '—'}</td>
                <td>{job.shots}</td>
                <td>
                  {job.status === 'running' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        alert(`❌ Cancelling job ${job.id}`)
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Charts */}
      <section className={styles.visuals}>
        <h2>Job Insights</h2>
        <div className={styles.charts}>
          <div className={styles.chartBox}>
            <h3>Status Distribution</h3>
            <PieChart width={300} height={250}>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}>
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042'][index % 4]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className={styles.chartBox}>
            <h3>Backend Queue Depth</h3>
            <BarChart width={400} height={250} data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="queue" fill="#8884d8" />
            </BarChart>
          </div>

          <div className={styles.chartBox}>
            <h3>Job Trends Over Time</h3>
            <LineChart width={500} height={250} data={mockTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="running" stroke="#8884d8" />
              <Line type="monotone" dataKey="finished" stroke="#82ca9d" />
              <Line type="monotone" dataKey="failed" stroke="#ff4d4d" />
            </LineChart>
          </div>
        </div>
      </section>

      {/* Job Modal */}
      {selectedJob && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Job Details: {selectedJob.id}</h2>
            <p><strong>Status:</strong> {selectedJob.status}</p>
            <p><strong>Backend:</strong> {selectedJob.backend}</p>
            <p><strong>Submitted:</strong> {selectedJob.created}</p>
            <p><strong>Duration:</strong> {selectedJob.duration || '—'}</p>
            <p><strong>Shots:</strong> {selectedJob.shots}</p>
            <button onClick={() => setSelectedJob(null)} className={styles.closeBtn}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
