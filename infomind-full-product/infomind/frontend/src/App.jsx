import { useCallback, useEffect, useState } from 'react'
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
  UserCircle,
  Menu,
  X
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
    <div className="flex items-center gap-3 px-2 py-3">
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-400 shadow-lg grid place-items-center">
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

function Sidebar({
  items,
  page,
  nav,
  me,
  onLogout
}) {
  return (
    <aside className="hidden md:flex flex-col gap-1 p-3 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen">

      <Logo />

      <div className="px-2 pb-3">
        <div className="h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="space-y-1">
        {items.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => nav(id)}
            className={`
              w-full flex items-center gap-3
              px-3 py-2.5 rounded-xl
              text-left text-sm transition
              ${
                page === id
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }
            `}
          >
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto card !p-3 text-sm">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
            <UserCircle size={22} />
          </div>

          <div className="min-w-0">
            <b className="block truncate">
              {me?.name || 'User'}
            </b>

            <div className="mut capitalize">
              {me?.role || 'User'}
            </div>
          </div>

        </div>

        <button
          className="btn mt-3 w-full flex items-center justify-center gap-2"
          onClick={onLogout}
        >
          <LogOut size={14} />
          Sign out
        </button>

      </div>
    </aside>
  )
}

function MobileNav({
  page,
  nav
}) {
  const mobileItems = [
    ['dashboard', 'Home'],
    ['documents', 'Docs'],
    ['ask', 'Ask AI'],
    ['insights', 'Graph'],
    ['settings', 'Settings']
  ]

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 flex justify-around bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 z-20">

      {mobileItems.map(([id, label]) => (
        <button
          key={id}
          onClick={() => nav(id)}
          className={`
            text-xs px-2 py-1
            ${
              page === id
                ? 'text-indigo-600 font-semibold'
                : 'mut'
            }
          `}
        >
          {label}
        </button>
      ))}

    </nav>
  )
}

function GlobalSearch({
  open,
  close,
  items,
  nav
}) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (open) {
      setQuery('')
    }
  }, [open])

  if (!open) return null

  const filtered = items.filter(item =>
    item[1].toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 grid place-items-start justify-center pt-[10vh]"
      onClick={close}
    >

      <div
        className="card w-[92vw] max-w-xl !p-3 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >

        <div className="flex items-center gap-2 mb-3">

          <Search size={18} className="mut" />

          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="inp !border-0 !ring-0"
            placeholder="Search pages..."
            onKeyDown={e => {
              if (e.key === 'Escape') {
                close()
              }

              if (e.key === 'Enter' && filtered.length) {
                nav(filtered[0][0])
                close()
              }
            }}
          />

          <button
            className="btn !p-2"
            onClick={close}
          >
            <X size={16} />
          </button>

        </div>

        <div className="space-y-1">

          {filtered.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => {
                nav(id)
                close()
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              <Icon size={17} />
              {label}
            </button>
          ))}

          {!filtered.length && (
            <div className="p-4 text-center mut">
              No pages found.
            </div>
          )}

        </div>

      </div>

    </div>
  )
}

function BellCount() {
  const [findings] = useData(() => api('/findings'))

  if (!Array.isArray(findings)) {
    return null
  }

  const count = findings.filter(
    item => item?.severity === 'CRITICAL'
  ).length

  if (!count) return null

  return (
    <span className="text-xs bg-red-600 text-white rounded-full px-2 py-0.5">
      {count}
    </span>
  )
}

export default function App() {

  const [authed, setAuthed] = useState(hasToken())
  const [me, setMe] = useState(null)

  const [page, setPage] = useState('dashboard')
  const [params, setParams] = useState({})

  const [tick, setTick] = useState(0)
  const [msg, setMsg] = useState('')

  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const bump = useCallback(() => {
    setTick(value => value + 1)
  }, [])

  const toast = useCallback(message => {
    setMsg(message)

    setTimeout(() => {
      setMsg('')
    }, 2600)
  }, [])

  const nav = useCallback((targetPage, extraParams = {}) => {

    setPage(targetPage)
    setParams(extraParams)

    setMobileOpen(false)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

  }, [])

  const logout = useCallback(() => {

    setToken(null)
    setMe(null)
    setAuthed(false)
    setPage('dashboard')

  }, [])

  useEffect(() => {

    if (!authed) {
      setMe(null)
      return
    }

    api('/auth/me')
      .then(user => {
        setMe(user)
      })
      .catch(() => {

        setToken(null)
        setMe(null)
        setAuthed(false)

      })

  }, [authed])

  useEffect(() => {

    const savedTheme =
      localStorage.getItem('infomind-theme') || 'light'

    const root = document.documentElement

    root.classList.remove(
      'dark',
      'theme-indigo',
      'theme-emerald',
      'theme-violet',
      'theme-rose'
    )

    if (savedTheme === 'dark') {

      root.classList.add('dark')

    } else if (savedTheme !== 'light') {

      root.classList.add(`theme-${savedTheme}`)

    }

  }, [])

  useEffect(() => {

    const handleKey = event => {

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k'
      ) {

        event.preventDefault()
        setSearchOpen(value => !value)

      }

      if (event.key === 'Escape') {

        setSearchOpen(false)
        setMobileOpen(false)

      }

    }

    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('keydown', handleKey)
    }

  }, [])

  if (!authed) {

    return (
      <Login
        onDone={() => {
          setAuthed(true)
        }}
      />
    )

  }

  if (!me) {

    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">

        <div className="text-center">

          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />

          <p className="mut">
            Loading InfoMind AI...
          </p>

        </div>

      </div>
    )

  }

  const can = permission => {

    if (!Array.isArray(me.permissions)) {
      return false
    }

    return me.permissions.includes(permission)
  }

  const items = NAV.filter(item => {

    const permission = item[4]

    if (!permission) {
      return true
    }

    return can(permission)

  })

  const pageMap = {
    dashboard: Dashboard,
    documents: Documents,
    ask: Ask,
    compare: Compare,
    insights: Insights,
    attention: Attention,
    actions: Actions,
    settings: SettingsPage,
    admin: Admin
  }

  const Page = pageMap[page] || Dashboard

  return (
    <Ctx.Provider
      value={{
        me,
        can,
        tick,
        bump,
        toast,
        nav,
        params
      }}
    >

      <div className="md:grid md:grid-cols-[250px_1fr] min-h-screen">

        <Sidebar
          items={items}
          page={page}
          nav={nav}
          me={me}
          onLogout={logout}
        />

        <div className="min-w-0">

          <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">

            <button
              className="md:hidden btn !p-2"
              onClick={() => setMobileOpen(value => !value)}
            >
              {mobileOpen
                ? <X size={18} />
                : <Menu size={18} />
              }
            </button>

            <button
              className="flex-1 max-w-xl flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 mut text-left"
              onClick={() => setSearchOpen(true)}
            >

              <Search size={16} />

              <span className="truncate">
                Ask InfoMind anything...
              </span>

              <kbd className="ml-auto hidden md:block text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded">
                Ctrl K
              </kbd>

            </button>

            <span className="hidden lg:flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">

              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

              AI monitoring active

            </span>

            <button
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => nav('attention')}
              title="Attention Center"
            >

              <Bell size={18} />

              <span className="absolute -top-1 -right-1">
                <BellCount />
              </span>

            </button>

          </header>

          {mobileOpen && (

            <div className="md:hidden fixed inset-x-0 top-[61px] bottom-0 z-20 bg-white dark:bg-slate-900 p-4 overflow-y-auto">

              <div className="space-y-1">

                {items.map(([id, label, Icon]) => (

                  <button
                    key={id}
                    onClick={() => nav(id)}
                    className={`
                      w-full flex items-center gap-3
                      px-4 py-3 rounded-xl text-left
                      ${
                        page === id
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    `}
                  >

                    <Icon size={18} />

                    {label}

                  </button>

                ))}

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <LogOut size={18} />
                  Sign out
                </button>

              </div>

            </div>

          )}

          <main className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto">

            <Page />

          </main>

        </div>

      </div>

      <MobileNav
        page={page}
        nav={nav}
      />

      {msg && (

        <div className="fixed bottom-20 md:bottom-6 right-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl shadow-lg z-50">
          {msg}
        </div>

      )}

      <GlobalSearch
        open={searchOpen}
        close={() => setSearchOpen(false)}
        items={items}
        nav={nav}
      />

    </Ctx.Provider>
  )
}
