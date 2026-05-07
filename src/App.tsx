import React, { useState, useEffect, useRef } from 'react'
import { ACADEMY_DATA } from './data'
import type { Pillar, Topic } from './data'
import ReactMarkdown from 'react-markdown'

const PILLAR_ICONS: Record<number, string> = {
  0: '🧱', 1: '⚙️', 2: '🌐', 3: '🗄️',
  4: '🖥️', 5: '🟢', 6: '🐹', 7: '🚀',
}

function App() {
  const [activePillar, setActivePillar] = useState<Pillar>(ACADEMY_DATA.pillars[0])
  const [activeTopic, setActiveTopic] = useState<Topic>(ACADEMY_DATA.pillars[0].topics[0])
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('swe-completed')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768)
  const [openQA, setOpenQA] = useState<Set<number>>(new Set())
  const [currentView, setCurrentView] = useState<'home' | 'topic'>('home')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  // Persist completed topics
  useEffect(() => {
    localStorage.setItem('swe-completed', JSON.stringify([...completed]))
  }, [completed])

  // Scroll-to-top button visibility
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const onScroll = () => setShowScrollTop(el.scrollTop > 400)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function toggleQA(i: number) {
    setOpenQA(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const totalTopics = ACADEMY_DATA.pillars.reduce((s, p) => s + p.topics.length, 0)
  const progress = Math.round((completed.size / totalTopics) * 100)

  function selectTopic(pillar: Pillar, topic: Topic) {
    setActivePillar(pillar)
    setActiveTopic(topic)
    setCurrentView('topic')
    setOpenQA(new Set())
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    if (window.innerWidth <= 768) setSidebarOpen(false)
  }

  function goHome() {
    setCurrentView('home')
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    if (window.innerWidth <= 768) setSidebarOpen(false)
  }

  function toggleComplete(id: string) {
    setCompleted(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allTopics = ACADEMY_DATA.pillars.flatMap(p => p.topics.map(t => ({ pillar: p, topic: t })))
  const currentIndex = allTopics.findIndex(x => x.topic.id === activeTopic.id)
  const prev = currentIndex > 0 ? allTopics[currentIndex - 1] : null
  const next = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-top">
          <div className="brand" onClick={goHome} style={{ cursor: 'pointer' }}>
            <div className="brand-mark" />
            <span className="brand-name">SWE Pro Academy</span>
          </div>
          <button className="collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="4" width="12" height="1.5" rx="1" />
              <rect x="2" y="7.25" width="12" height="1.5" rx="1" />
              <rect x="2" y="10.5" width="12" height="1.5" rx="1" />
            </svg>
          </button>
        </div>

        <div className="progress-section">
          <div className="progress-row">
            <span className="progress-label">Progress</span>
            <span className="progress-value">{completed.size}/{totalTopics}</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <nav className="nav">
          <button
            className={`nav-item nav-home ${currentView === 'home' ? 'active' : ''}`}
            onClick={goHome}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-title">Academy Home</span>
          </button>

          {ACADEMY_DATA.pillars.map((pillar, pi) => (
            <div key={pillar.id} className="pillar-group">
              <div className="pillar-label">
                <span className="pillar-icon">{PILLAR_ICONS[pi]}</span>
                {pillar.title.split('—')[1]?.trim() || pillar.title}
              </div>
              {pillar.topics.map(topic => {
                const isActive = topic.id === activeTopic.id && currentView === 'topic'
                const isDone = completed.has(topic.id)
                return (
                  <button
                    key={topic.id}
                    className={`nav-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                    onClick={() => selectTopic(pillar, topic)}
                  >
                    <span className="nav-check">
                      {isDone ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="6" cy="6" r="4" />
                        </svg>
                      )}
                    </span>
                    <span className="nav-title">{topic.title}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* MOBILE OVERLAY */}
      <div className={`mobile-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* MAIN */}
      <main className="main" ref={mainRef}>
        {/* MOBILE HEADER */}
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="mobile-brand" onClick={goHome} style={{ cursor: 'pointer' }}>SWE Pro Academy</span>
        </div>

        <div className="content">
          {currentView === 'home' ? (
            /* ───────────── HOME VIEW ───────────── */
            <div className="home-view">
              <header className="home-hero">
                <div className="hero-badge">The Roadmap</div>
                <h1>Master the<br /><span className="hero-gradient">Engineering Craft</span></h1>
                <p className="hero-sub">Deep-dive into systems internals, architecture patterns, and production-grade engineering — curated for senior-level mastery.</p>

                <div className="home-stats">
                  <div className="stat-box">
                    <div className="stat-ring">
                      <svg viewBox="0 0 36 36">
                        <path className="stat-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="stat-ring-fill" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="stat-ring-text">{progress}%</span>
                    </div>
                    <div className="stat-meta">
                      <span className="stat-value">{completed.size}<span> / {totalTopics}</span></span>
                      <span className="stat-label">Topics Completed</span>
                    </div>
                  </div>
                  <div className="stat-box stat-pillars">
                    <span className="stat-value">{ACADEMY_DATA.pillars.length}</span>
                    <span className="stat-label">Learning Pillars</span>
                  </div>
                  <div className="stat-box stat-pillars">
                    <span className="stat-value">{allTopics.reduce((a, t) => a + t.topic.interview.length, 0)}</span>
                    <span className="stat-label">Interview Q&amp;As</span>
                  </div>
                </div>
              </header>

              <div className="home-grid">
                {ACADEMY_DATA.pillars.map((p, i) => {
                  const pCompleted = p.topics.filter(t => completed.has(t.id)).length
                  const pTotal = p.topics.length
                  const percent = Math.round((pCompleted / pTotal) * 100)
                  return (
                    <div key={p.id} className="home-card">
                      <div className="card-top">
                        <span className="card-icon">{PILLAR_ICONS[i]}</span>
                        {percent === 100 && (
                          <span className="card-badge-done">✓ Complete</span>
                        )}
                      </div>
                      <h3>{p.title.split('—')[1]?.trim() || p.title}</h3>
                      <ul className="card-topics">
                        {p.topics.map(t => (
                          <li key={t.id}
                            className={completed.has(t.id) ? 'done' : ''}
                            onClick={() => selectTopic(p, t)}
                          >
                            <span className="card-topic-check">
                              {completed.has(t.id) ? '✓' : '○'}
                            </span>
                            {t.title}
                          </li>
                        ))}
                      </ul>

                      <div className="card-progress">
                        <div className="progress-track">
                          <div className="progress-bar" style={{ width: `${percent}%` }} />
                        </div>
                        <small>{pCompleted}/{pTotal}</small>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* ───────────── TOPIC VIEW ───────────── */
            <div className="topic-view">
              {/* Breadcrumb */}
              <nav className="breadcrumb">
                <button onClick={goHome}>Home</button>
                <span className="bc-sep">/</span>
                <button onClick={() => selectTopic(activePillar, activePillar.topics[0])}>
                  {activePillar.title.split('—')[1]?.trim() || activePillar.title}
                </button>
                <span className="bc-sep">/</span>
                <span className="bc-current">{activeTopic.title}</span>
              </nav>

              <header className="topic-header">
                <div className="topic-pillar">{activePillar.title}</div>
                <h1>{activeTopic.title}</h1>
                <p className="topic-depth">{activeTopic.depth}</p>
              </header>

              {/* Illustration */}
              {activeTopic.image && (
                <div className="topic-illustration">
                  <img src={activeTopic.image} alt={`Illustration for ${activeTopic.title}`} />
                </div>
              )}

              {/* Theory */}
              <section className="section">
                <div className="section-tag tag-blue">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  Theory &amp; Internals
                </div>
                <div className="prose">
                  <ReactMarkdown>{activeTopic.content}</ReactMarkdown>
                </div>
              </section>

              {/* Why */}
              <section className="section">
                <div className="section-tag tag-amber">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Why It Matters
                </div>
                <div className="callout callout-amber">
                  <ReactMarkdown>{activeTopic.why}</ReactMarkdown>
                </div>
              </section>

              {/* Anti-pattern */}
              <section className="section">
                <div className="section-tag tag-red">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Common Mistake
                </div>
                <div className="callout callout-red">
                  <ReactMarkdown>{activeTopic.mistake}</ReactMarkdown>
                </div>
              </section>

              {/* Code */}
              <section className="section">
                <div className="section-tag tag-green">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  Implementation
                </div>
                <div className="code-block">
                  <div className="code-header">
                    <div className="code-dots">
                      <span /><span /><span />
                    </div>
                    <span className="code-lang">Code</span>
                  </div>
                  <pre className="code-body">{activeTopic.code}</pre>
                </div>
              </section>

              {/* Interview Q&A */}
              <section className="section">
                <div className="section-tag tag-purple">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  Interview Q&amp;A
                </div>
                <div className="qa-list">
                  {activeTopic.interview.map((item, i) => (
                    <div key={i} className={`qa-item ${openQA.has(i) ? 'open' : ''}`}>
                      <button className="qa-question" onClick={() => toggleQA(i)}>
                        <span className="qa-num">{String(i + 1).padStart(2, '0')}</span>
                        <span>{item.q}</span>
                        <svg className="qa-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      {openQA.has(i) && (
                        <div className="qa-answer">
                          <ReactMarkdown>{item.a}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Footer nav */}
              <div className="topic-footer">
                <button
                  className={`complete-btn ${completed.has(activeTopic.id) ? 'done' : ''}`}
                  onClick={() => toggleComplete(activeTopic.id)}
                >
                  {completed.has(activeTopic.id) ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,8 6,11 13,4"/></svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                      Mark as Complete
                    </>
                  )}
                </button>

                <div className="page-nav">
                  {prev && (
                    <button className="page-btn" onClick={() => selectTopic(prev.pillar, prev.topic)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                      <span>
                        <small>Previous</small>
                        <strong>{prev.topic.title}</strong>
                      </span>
                    </button>
                  )}
                  {next && (
                    <button className="page-btn next" onClick={() => selectTopic(next.pillar, next.topic)}>
                      <span>
                        <small>Next</small>
                        <strong>{next.topic.title}</strong>
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll-to-top */}
        <button
          className={`scroll-top ${showScrollTop ? 'visible' : ''}`}
          onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
      </main>
    </div>
  )
}

export default App
