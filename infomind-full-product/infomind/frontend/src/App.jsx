import { useEffect, useState, useCallback } from 'react'
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  GitCompare,
  BarChart3,
  Flag,
  CheckSquare,
  Shield,
  Search,
  LogOut,
  Bell,
  Settings,
  UserCircle
} from 'lucide-react'

import { api, hasToken, setToken } from './api'
import { Ctx, useData } from './ctx'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Attention from './pages/Attention'
import Documents from './pages/Documents'
import Compare from './pages/Compare'
import Ask from './pages/Ask'
import Actions from './pages/Actions'
import Insights from './pages/Insights'
import Admin from './pages/Admin'
import SettingsPage from './pages/Settings'

const NAV = [
  ['dashboard', 'Dashboard', LayoutDashboard, Dashboard],
  ['documents', 'Documents', FileText, Documents],
  ['ask', 'Ask AI', Sparkles, Ask],
  ['compare', 'Compare', GitCompare, Compare],
  ['insights', 'Connections', BarChart3, Insights],
  ['attention', 'Attention Center', Flag, Attention],
  ['actions', 'Actions', CheckSquare, Actions],
  ['settings', 'Settings', Settings, SettingsPage],
  ['admin', 'Users & Audit', Shield, Admin, 'user:manage']
]

function Logo() {
  return (
    <div className="flex items-center gap-2 px-2 py-3">
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-400 shadow-lg grid place-items-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/90" />
        <span className="absolute w-2 h-2 rounded-full bg-white" />
      </div>

      <div>
        <div className="font-bold text-lg leading-tight">
          InfoMind <span className="text-indigo-500">AI</span>
        </div>

        <div className="text-[10px] text-slate-500">
          Understand. Connect. Act.
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(hasToken())
  const [me, setMe] = useState(null)

  /* =========================================
     EDITABLE PROFILE NAME
     ========================================= */

  const [displayName, setDisplayName] = useState(
    localStorage.getItem('infomind-display-name') || ''
  )

  const [page, setPage] = useState('dashboard')
  const [params, setParams] = useState({})
  const [tick, setTick] = useState(0)
  const [msg, setMsg] = useState('')
  const [pal, setPal] = useState(false)

  const bump = useCallback(
    () => setTick(t => t + 1),
    []
  )

  const toast = useCallback(m => {
    setMsg(m)

    setTimeout(() => {
      setMsg('')
    }, 2600)
  }, [])

  const nav = useCallback((p, x = {}) => {
    setPage(p)
    setParams(x)
    window.scrollTo(0, 0)
  }, [])

  /* =========================================
     LOAD USER
     ========================================= */

  useEffect(() => {
    if (authed) {
      api('/auth/me')
        .then(user => {
          setMe(user)

          const savedName =
            localStorage.getItem(
              'infomind-display-name'
            )

          if (!savedName && user?.name) {
            setDisplayName(user.name)
          }
        })
        .catch(() => {
          setToken(null)
          setAuthed(false)
        })
    }
  }, [authed])

  /* =========================================
     THEME
     ========================================= */

  useEffect(() => {
    const theme =
      localStorage.getItem('infomind-theme') ||
      'light'

    document.documentElement.classList.remove(
      'dark',
      'theme-indigo',
      'theme-emerald',
      'theme-violet',
      'theme-rose'
    )

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme !== 'light') {
      document.documentElement.classList.add(
        `theme-${theme}`
      )
    }
  }, [])

  /* =========================================
     KEYBOARD COMMAND
     ========================================= */

  useEffect(() => {
    const k = e => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'k'
      ) {
        e.preventDefault()
        setPal(p => !p)
      }

      if (e.key === 'Escape') {
        setPal(false)
      }
    }

    addEventListener('keydown', k)

    return () =>
      removeEventListener('keydown', k)
  }, [])

  /* =========================================
     LOGIN
     ========================================= */

  if (!authed) {
    return (
      <Login
        onDone={() => setAuthed(true)}
      />
    )
  }

  /* =========================================
     LOADING
     ========================================= */

  if (!me) {
    return (
      <div className="p-10 mut">
        Loading workspace…
      </div>
    )
  }

  /* =========================================
     PERMISSIONS
     ========================================= */

  const can = p =>
    me.permissions.includes(p)

  const items = NAV.filter(
    n => !n[4] || can(n[4])
  )

  const Page =
    (NAV.find(n => n[0] === page) ||
      NAV[0])[3]

  /* =========================================
     FINAL DISPLAY NAME
     ========================================= */

  const sidebarName =
    displayName || me.name || 'User'

  return (
    <Ctx.Provider
      value={{
        me,
        can,
        tick,
        bump,
        toast,
        nav,
        params,

        /* Profile name controls */
        displayName,
        setDisplayName
      }}
    >
      <div className="md:grid md:grid-cols-[250px_1fr] min-h-screen">

        {/* =====================================
            SIDEBAR
            ===================================== */}

        <aside className="hidden md:flex flex-col gap-1 p-3 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen">

          <Logo />

          <div className="px-2 pb-3">
            <div className="h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {items.map(
            ([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => nav(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${
                  page === id
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            )
          )}

          {/* ===================================
              PROFILE
              =================================== */}

          <div className="mt-auto card !p-3 text-sm">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
                <UserCircle size={22} />
              </div>

              <div className="min-w-0">

                <b className="block truncate">
                  {me.role === 'admin'
                    ? 'Admin'
                    : sidebarName}
                </b>

                <div className="mut capitalize">
                  {me.role}
                </div>

              </div>

            </div>

            <button
              className="btn mt-3 w-full flex items-center justify-center gap-2"
              onClick={() => {
                setToken(null)
                setAuthed(false)
                setMe(null)
                setDisplayName('')
                localStorage.removeItem(
                  'infomind-display-name'
                )
              }}
            >
              <LogOut size={14} />
              Sign out
            </button>

          </div>

        </aside>

        {/* =====================================
            MAIN CONTENT
            ===================================== */}

        <div className="min-w-0">

          {/* HEADER */}

          <header className="sticky top-0 z-10 flex items-center gap-3 px-4 md:px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">

            <button
              className="flex-1 max-w-xl flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 mut text-left"
              onClick={() => setPal(true)}
            >
              <Search size={16} />

              Ask InfoMind anything…

              <kbd className="ml-auto hidden md:block text-xs">
                Ctrl K
              </kbd>
            </button>

            <span className="hidden md:flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

              AI monitoring active
            </span>

            <Bell size={18} />

            <BellCount />

          </header>

          {/* PAGE */}

          <main className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto">
            <Page />
          </main>

        </div>
      </div>

      {/* =====================================
          MOBILE NAVIGATION
          ===================================== */}

      <nav className="md:hidden fixed bottom-0 inset-x-0 flex justify-around bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 z-20">

        {[
          ['dashboard', 'Home'],
          ['documents', 'Docs'],
          ['ask', 'Ask AI'],
          ['insights', 'Graph'],
          ['settings', 'Settings']
        ].map(
          ([id, label]) => (
            <button
              key={id}
              onClick={() => nav(id)}
              className={`text-xs px-2 py-1 ${
                page === id
                  ? 'text-indigo-600 font-semibold'
                  : 'mut'
              }`}
            >
              {label}
            </button>
          )
        )}

      </nav>

      {/* =====================================
          TOAST
          ===================================== */}

      {msg && (
        <div className="fixed bottom-20 md:bottom-6 right-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl shadow-lg z-30">
          {msg}
        </div>
      )}

      {/* =====================================
          COMMAND BAR
          ===================================== */}

      {pal && (
        <div
          className="fixed inset-0 bg-black/50 z-40 grid place-items-start justify-center pt-[12vh]"
          onClick={() => setPal(false)}
        >

          <div
            className="card w-[92vw] max-w-lg !p-2"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <input
              autoFocus
              className="inp mb-2"
              placeholder="Go to a page or ask AI…"
              onKeyDown={e => {
                if (
                  e.key === 'Enter' &&
                  e.target.value
                ) {
                  nav('ask', {
                    q: e.target.value
                  })

                  setPal(false)
                }
              }}
            />

            {items.map(
              ([id, label]) => (
                <button
                  key={id}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  onClick={() => {
                    nav(id)
                    setPal(false)
                  }}
                >
                  {label}
                </button>
              )
            )}

          </div>

        </div>
      )}

    </Ctx.Provider>
  )
}

/* =========================================
   CRITICAL FINDINGS COUNT
   ========================================= */

function BellCount() {
  const [f] = useData(
    () => api('/findings')
  )

  const n = f
    ? f.filter(
        x => x.severity === 'CRITICAL'
      ).length
    : 0

  return n ? (
    <span className="text-xs bg-red-600 text-white rounded-full px-2">
      {n}
    </span>
  ) : null
}
