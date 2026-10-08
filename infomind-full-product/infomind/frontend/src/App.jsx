import { useEffect, useState, useCallback } from 'react'

import {
  LayoutDashboard,
  FileText,
  Sparkles,
  GitCompare,
  Network,
  BarChart3,
  Flag,
  CheckSquare,
  Shield,
  Search,
  LogOut,
  Bell,
  Settings,
  UserCircle,
  X,
  Command,
  ChevronRight,
  Activity
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


/* =========================================================
   NAVIGATION
========================================================= */

const NAV = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['documents', 'Documents', FileText],
  ['ask', 'Ask AI', Sparkles],
  ['compare', 'Compare', GitCompare],
  ['insights', 'Connections', Network],
  ['attention', 'Attention Center', Flag],
  ['actions', 'Actions', CheckSquare],
  ['settings', 'Settings', Settings],
  ['admin', 'Users & Audit', Shield, 'user:manage']
]


/* =========================================================
   LOGO
========================================================= */

function Logo() {
  return (
    <div className="flex items-center gap-3 px-2 py-4">

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


/* =========================================================
   APP
========================================================= */

export default function App() {

  const [authed, setAuthed] = useState(hasToken())

  const [me, setMe] = useState(null)

  const [page, setPage] = useState('dashboard')

  const [params, setParams] = useState({})

  const [tick, setTick] = useState(0)

  const [msg, setMsg] = useState('')

  const [searchOpen, setSearchOpen] = useState(false)

  const [mobileMenu, setMobileMenu] = useState(false)


  /* =====================================================
     HELPERS
  ===================================================== */

  const bump = useCallback(() => {
    setTick(t => t + 1)
  }, [])


  const toast = useCallback(message => {

    setMsg(message)

    setTimeout(() => {
      setMsg('')
    }, 2600)

  }, [])


  const nav = useCallback((nextPage, x = {}) => {

    setPage(nextPage)

    setParams(x)

    setSearchOpen(false)

    setMobileMenu(false)

    window.scrollTo(0, 0)

  }, [])


  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {

    if (!authed) return

    api('/auth/me')
      .then(setMe)
      .catch(() => {

        setToken(null)

        setAuthed(false)

        setMe(null)

      })

  }, [authed])


  /* =====================================================
     THEME
  ===================================================== */

  useEffect(() => {

    const theme =
      localStorage.getItem('infomind-theme') || 'light'

    const root = document.documentElement

    root.classList.remove(
      'dark',
      'theme-indigo',
      'theme-emerald',
      'theme-violet',
      'theme-rose'
    )

    if (theme === 'dark') {
      root.classList.add('dark')
    }

    if (theme === 'indigo') {
      root.classList.add('theme-indigo')
    }

    if (theme === 'emerald') {
      root.classList.add('theme-emerald')
    }

    if (theme === 'violet') {
      root.classList.add('theme-violet')
    }

    if (theme === 'rose') {
      root.classList.add('theme-rose')
    }

  }, [])


  /* =====================================================
     GLOBAL SEARCH SHORTCUT
  ===================================================== */

  useEffect(() => {

    const handler = event => {

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k'
      ) {

        event.preventDefault()

        setSearchOpen(value => !value)

      }

      if (event.key === 'Escape') {

        setSearchOpen(false)

        setMobileMenu(false)

      }

    }

    window.addEventListener('keydown', handler)

    return () => {
      window.removeEventListener('keydown', handler)
    }

  }, [])


  /* =====================================================
     LOGIN
  ===================================================== */

  if (!authed) {

    return (
      <Login
        onDone={() => setAuthed(true)}
      />
    )

  }


  /* =====================================================
     USER LOADING
  ===================================================== */

  if (!me) {

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 grid place-items-center">

        <div className="text-center">

          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600 text-white grid place-items-center animate-pulse">

            <Sparkles size={24} />

          </div>

          <div className="font-semibold mt-4">
            Loading InfoMind AI
          </div>

          <div className="mut mt-1">
            Preparing your intelligence workspace...
          </div>

        </div>

      </div>
    )

  }


  /* =====================================================
     PERMISSIONS
  ===================================================== */

  const can = permission =>
    Array.isArray(me.permissions)
      ? me.permissions.includes(permission)
      : false


  const items = NAV.filter(
    item => !item[3] || can(item[3])
  )


  const Page =
    (
      NAV.find(item => item[0] === page) ||
      NAV[0]
    )[3] === 'user:manage'
      ? Admin
      : (
          {
            dashboard: Dashboard,
            documents: Documents,
            ask: Ask,
            compare: Compare,
            insights: Insights,
            attention: Attention,
            actions: Actions,
            settings: SettingsPage,
            admin: Admin
          }[page] || Dashboard
        )


  /* =====================================================
     SIGN OUT
  ===================================================== */

  function logout() {

    setToken(null)

    setAuthed(false)

    setMe(null)

  }


  /* =====================================================
     RENDER
  ===================================================== */

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

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">


        {/* =================================================
           DESKTOP LAYOUT
        ================================================= */}

        <div className="md:grid md:grid-cols-[260px_1fr]">


          {/* =================================================
             SIDEBAR
          ================================================= */}

          <aside className="hidden md:flex flex-col gap-1 p-3 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen">

            <Logo />


            {/* Workspace label */}

            <div className="px-2 pb-3">

              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Workspace
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800" />

            </div>


            {/* Navigation */}

            <div className="space-y-1">

              {items.map(
                ([id, label, Icon]) => (

                  <button
                    key={id}
                    onClick={() => nav(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${
                      page === id
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >

                    <Icon size={17} />

                    <span className="flex-1">
                      {label}
                    </span>

                    {page === id && (
                      <ChevronRight size={14} />
                    )}

                  </button>

                )
              )}

            </div>


            {/* System status */}

            <div className="mt-4 px-2">

              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-3">

                <div className="flex items-center gap-2">

                  <Activity
                    size={15}
                    className="text-emerald-600"
                  />

                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    AI Monitoring Active
                  </span>

                </div>

                <div className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1">
                  Information systems are being monitored.
                </div>

              </div>

            </div>


            {/* Profile */}

            <div className="mt-auto card !p-3 text-sm">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center">

                  <UserCircle size={22} />

                </div>

                <div className="min-w-0">

                  <b className="block truncate">
                    {localStorage.getItem(
                      'infomind-display-name'
                    ) || me.name}
                  </b>

                  <div className="mut capitalize">
                    {me.role}
                  </div>

                </div>

              </div>


              <button
                className="btn mt-3 w-full flex items-center justify-center gap-2"
                onClick={logout}
              >

                <LogOut size={14} />

                Sign out

              </button>

            </div>

          </aside>


          {/* =================================================
             MAIN
          ================================================= */}

          <div className="min-w-0">


            {/* =================================================
               TOP HEADER
            ================================================= */}

            <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">


              {/* Mobile logo */}

              <div className="md:hidden">

                <Logo />

              </div>


              {/* Search */}

              <button
                className="flex-1 max-w-2xl flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-left"
                onClick={() => setSearchOpen(true)}
              >

                <Search size={17} />

                <span>
                  Search documents, findings, actions...
                </span>

                <kbd className="ml-auto hidden md:flex items-center gap-1 text-[10px] border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5">
                  <Command size={10} />
                  K
                </kbd>

              </button>


              {/* AI status */}

              <div className="hidden lg:flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">

                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                AI Active

              </div>


              {/* Notifications */}

              <NotificationBell />


              {/* Mobile menu */}

              <button
                className="md:hidden btn !px-2"
                onClick={() =>
                  setMobileMenu(true)
                }
              >
                <Command size={17} />
              </button>

            </header>


            {/* =================================================
               CONTENT
            ================================================= */}

            <main className="p-4 md:p-6 pb-24 md:pb-6 max-w-[1500px] mx-auto">

              <Page />

            </main>

          </div>

        </div>


        {/* =================================================
           MOBILE NAV
        ================================================= */}

        <nav className="md:hidden fixed bottom-0 inset-x-0 flex justify-around bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 z-20">

          {[
            ['dashboard', 'Home', LayoutDashboard],
            ['documents', 'Docs', FileText],
            ['ask', 'AI', Sparkles],
            ['insights', 'Graph', Network],
            ['settings', 'Settings', Settings]
          ].map(
            ([id, label, Icon]) => (

              <button
                key={id}
                onClick={() => nav(id)}
                className={`flex flex-col items-center gap-1 text-xs px-2 py-1 ${
                  page === id
                    ? 'text-indigo-600 font-semibold'
                    : 'mut'
                }`}
              >

                <Icon size={17} />

                {label}

              </button>

            )
          )}

        </nav>


        {/* =================================================
           TOAST
        ================================================= */}

        {msg && (

          <div className="fixed bottom-20 md:bottom-6 right-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl z-50 text-sm">

            {msg}

          </div>

        )}


        {/* =================================================
           GLOBAL SEARCH
        ================================================= */}

        {searchOpen && (

          <GlobalSearch
            items={items}
            nav={nav}
            close={() => setSearchOpen(false)}
          />

        )}


        {/* =================================================
           MOBILE MENU
        ================================================= */}

        {mobileMenu && (

          <MobileMenu
            items={items}
            page={page}
            nav={nav}
            close={() => setMobileMenu(false)}
          />

        )}

      </div>

    </Ctx.Provider>

  )
}


/* =========================================================
   NOTIFICATION BELL
========================================================= */

function NotificationBell() {

  const [findings] =
    useData(() => api('/findings'))

  const critical =
    findings?.filter(
      item => item.severity === 'CRITICAL'
    ).length || 0

  return (

    <button
      className="relative w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 grid place-items-center"
      title="Notifications"
    >

      <Bell size={18} />

      {critical > 0 && (

        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[9px] bg-red-600 text-white rounded-full grid place-items-center">
          {critical > 9 ? '9+' : critical}
        </span>

      )}

    </button>

  )
}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function GlobalSearch({
  items,
  nav,
  close
}) {

  const [query, setQuery] = useState('')

  const filtered =
    items.filter(
      ([id, label]) =>
        label
          .toLowerCase()
          .includes(query.toLowerCase())
    )

  return (

    <div
      className="fixed inset-0 bg-black/50 z-50 flex justify-center pt-[10vh] px-4"
      onClick={close}
    >

      <div
        className="w-full max-w-2xl"
        onClick={event =>
          event.stopPropagation()
        }
      >

        <div className="card !p-2 shadow-2xl">

          {/* Search input */}

          <div className="flex items-center gap-3 px-3 py-2">

            <Search size={19} />

            <input
              autoFocus
              value={query}
              onChange={event =>
                setQuery(event.target.value)
              }
              placeholder="Search InfoMind..."
              className="flex-1 bg-transparent outline-none text-sm"
            />

            <button
              className="btn !px-2 !py-1"
              onClick={close}
            >

              <X size={14} />

            </button>

          </div>


          <div className="border-t border-slate-200 dark:border-slate-800 my-2" />


          {/* Pages */}

          <div className="p-1">

            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-3 py-2">
              Pages
            </div>

            {filtered.map(
              ([id, label, Icon]) => (

                <button
                  key={id}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950 text-left"
                  onClick={() => nav(id)}
                >

                  <Icon size={17} />

                  <span className="flex-1">
                    {label}
                  </span>

                  <ChevronRight size={14} />

                </button>

              )
            )}

            {filtered.length === 0 && (

              <div className="p-6 text-center mut">
                No matching pages found.
              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  )
}


/* =========================================================
   MOBILE MENU
========================================================= */

function MobileMenu({
  items,
  page,
  nav,
  close
}) {

  return (

    <div
      className="fixed inset-0 bg-black/50 z-50 md:hidden"
      onClick={close}
    >

      <div
        className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 p-4"
        onClick={event =>
          event.stopPropagation()
        }
      >

        <div className="flex items-center justify-between mb-5">

          <Logo />

          <button
            className="btn !px-2"
            onClick={close}
          >

            <X size={17} />

          </button>

        </div>


        <div className="space-y-1">

          {items.map(
            ([id, label, Icon]) => (

              <button
                key={id}
                onClick={() => nav(id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left ${
                  page === id
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >

                <Icon size={18} />

                {label}

              </button>

            )
          )}

        </div>

      </div>

    </div>

  )
}
