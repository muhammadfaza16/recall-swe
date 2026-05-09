import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { ACADEMY_DATA } from './data'
import type { Pillar, Topic } from './data'

const ReactMarkdown = lazy(() => import('react-markdown'))

const MarkdownRenderer = ({ children }: { children: string }) => (
  <Suspense fallback={<div style={{ opacity: 0.5, padding: '0.5rem 0' }}>Loading content...</div>}>
    <ReactMarkdown>{children}</ReactMarkdown>
  </Suspense>
)

import { 
  Home, 
  BookOpen, 
  Cpu, 
  Globe, 
  Database, 
  Monitor, 
  Server, 
  Terminal, 
  Settings,
  CheckCircle2,
  Circle,
  Menu,
  Book,
  Lightbulb,
  AlertTriangle,
  Code,
  Target,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react'

const PILLAR_ICONS: Record<number, React.ReactNode> = {
  0: <BookOpen size={18} />, 
  1: <Cpu size={18} />, 
  2: <Globe size={18} />, 
  3: <Database size={18} />,
  4: <Monitor size={18} />, 
  5: <Server size={18} />, 
  6: <Terminal size={18} />, 
  7: <Settings size={18} />,
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
  const [currentView, setCurrentView] = useState<'home' | 'topic' | 'pillar'>('home')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light')
  const [deliveryTone, setDeliveryTone] = useState<'formal' | 'casual'>(() => (localStorage.getItem('tone') as 'formal' | 'casual') || 'formal')

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
      localStorage.setItem('theme', 'light')
    } else {
      document.body.classList.remove('light-theme')
      localStorage.setItem('theme', 'dark')
    }
  }, [isLight])

  useEffect(() => {
    localStorage.setItem('tone', deliveryTone)
  }, [deliveryTone])

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

  function selectPillar(pillar: Pillar) {
    setActivePillar(pillar)
    setCurrentView('pillar')
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
          <button className="collapse-btn" onClick={() => setIsLight(!isLight)} aria-label="Toggle theme">
            {isLight ? <Moon size={18} /> : <Sun size={18} />}
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
            <span className="nav-icon"><Home size={18} /></span>
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
                    <span className="nav-check" style={{ display: 'flex', alignItems: 'center' }}>
                      {isDone ? <CheckCircle2 size={14} /> : <Circle size={14} />}
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
            <Menu size={24} />
          </button>
          <span className="mobile-brand" onClick={goHome} style={{ cursor: 'pointer', flex: 1 }}>SWE Pro Academy</span>
          <button className="mobile-menu-btn" onClick={() => setIsLight(!isLight)} aria-label="Toggle theme">
            {isLight ? <Moon size={22} /> : <Sun size={22} />}
          </button>
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
                    <div key={p.id} className="home-card" onClick={() => selectPillar(p)} style={{ cursor: 'pointer' }}>
                      <div className="card-top">
                        <span className="card-icon">{PILLAR_ICONS[i]}</span>
                        {percent === 100 && (
                          <span className="card-badge-done" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Complete
                          </span>
                        )}
                      </div>
                      <h3>{p.title.split('—')[1]?.trim() || p.title}</h3>
                      <ul className="card-topics">
                        {p.topics.map(t => (
                          <li key={t.id}
                            className={completed.has(t.id) ? 'done' : ''}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectTopic(p, t);
                            }}
                          >
                            <span className="card-topic-check" style={{ display: 'inline-flex', alignItems: 'center' }}>
                              {completed.has(t.id) ? <CheckCircle2 size={16} /> : <Circle size={16} />}
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
          ) : currentView === 'pillar' ? (
            /* ───────────── PILLAR VIEW ───────────── */
            <div className="topic-view">
              <nav className="breadcrumb">
                <button onClick={goHome}>Home</button>
                <span className="bc-sep">/</span>
                <span className="bc-current">{activePillar.title.split('—')[1]?.trim() || activePillar.title}</span>
              </nav>

              <header className="topic-header">
                <div className="topic-pillar">Learning Pillar</div>
                <h1>{activePillar.title}</h1>
                <p className="topic-depth" style={{ marginTop: '1rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                  A core pillar of the SWE Academy. Master these fundamental topics to build a robust engineering foundation.
                </p>
              </header>

              <section className="section" style={{ marginTop: '2rem' }}>
                <div className="section-tag tag-blue">
                  <Book size={14} />
                  Curriculum Topics
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activePillar.topics.map(t => {
                    const isDone = completed.has(t.id)
                    return (
                      <div 
                        key={t.id} 
                        className={`topic-list-card ${isDone ? 'done' : ''}`}
                        onClick={() => selectTopic(activePillar, t)}
                      >
                        <div>
                          <h3>{t.title}</h3>
                          <p>{t.depth}</p>
                        </div>
                        <div className="icon-status">
                          {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          ) : (
            /* ───────────── TOPIC VIEW ───────────── */
            <div className="topic-view">
              {/* Breadcrumb */}
              <nav className="breadcrumb">
                <button onClick={goHome}>Home</button>
                <span className="bc-sep">/</span>
                <button onClick={() => selectPillar(activePillar)}>
                  {activePillar.title.split('—')[1]?.trim() || activePillar.title}
                </button>
                <span className="bc-sep">/</span>
                <span className="bc-current">{activeTopic.title}</span>
              </nav>

              <header className="topic-header">
                <div className="topic-pillar">{activePillar.title}</div>
                <h1>{activeTopic.title}</h1>
                <p className="topic-depth">{activeTopic.depth}</p>

                <div className="tone-toggler" style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  marginTop: '1.5rem', 
                  background: 'var(--bg-card)',
                  padding: '0.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  width: 'fit-content'
                }}>
                  <button 
                    onClick={() => setDeliveryTone('formal')}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      borderRadius: '8px', 
                      background: deliveryTone === 'formal' ? 'var(--bg-elevated)' : 'transparent',
                      color: deliveryTone === 'formal' ? 'var(--text)' : 'var(--text-secondary)',
                      border: deliveryTone === 'formal' ? '1px solid var(--border)' : '1px solid transparent',
                      fontWeight: deliveryTone === 'formal' ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Academic Tone
                  </button>
                  <button 
                    onClick={() => setDeliveryTone('casual')}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      borderRadius: '8px', 
                      background: deliveryTone === 'casual' ? 'var(--bg-elevated)' : 'transparent',
                      color: deliveryTone === 'casual' ? 'var(--text)' : 'var(--text-secondary)',
                      border: deliveryTone === 'casual' ? '1px solid var(--border)' : '1px solid transparent',
                      fontWeight: deliveryTone === 'casual' ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Senior Eng Tone (Edgy)
                  </button>
                </div>
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
                  <Book size={14} />
                  Theory &amp; Internals
                </div>
                <div className="prose">
                  <MarkdownRenderer>{deliveryTone === 'casual' && activeTopic.content_casual ? activeTopic.content_casual : activeTopic.content}</MarkdownRenderer>
                </div>
              </section>

              {/* Why */}
              <section className="section">
                <div className="section-tag tag-amber">
                  <Lightbulb size={14} />
                  Why It Matters
                </div>
                <div className="callout callout-amber">
                  <MarkdownRenderer>{deliveryTone === 'casual' && activeTopic.why_casual ? activeTopic.why_casual : activeTopic.why}</MarkdownRenderer>
                </div>
              </section>

              {/* Anti-pattern */}
              <section className="section">
                <div className="section-tag tag-red">
                  <AlertTriangle size={14} />
                  Common Mistake
                </div>
                <div className="callout callout-red">
                  <MarkdownRenderer>{deliveryTone === 'casual' && activeTopic.mistake_casual ? activeTopic.mistake_casual : activeTopic.mistake}</MarkdownRenderer>
                </div>
              </section>

              {/* Code */}
              <section className="section">
                <div className="section-tag tag-green">
                  <Code size={14} />
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
                  <Target size={14} />
                  Interview Q&amp;A
                </div>
                <div className="qa-list">
                  {activeTopic.interview.map((item, i) => (
                    <div key={i} className={`qa-item ${openQA.has(i) ? 'open' : ''}`}>
                      <button className="qa-question" onClick={() => toggleQA(i)}>
                        <span className="qa-num">{String(i + 1).padStart(2, '0')}</span>
                        <span>{item.q}</span>
                        <ChevronDown className="qa-chevron" size={16} />
                      </button>
                      {openQA.has(i) && (
                        <div className="qa-answer">
                          <MarkdownRenderer>{item.a}</MarkdownRenderer>
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
