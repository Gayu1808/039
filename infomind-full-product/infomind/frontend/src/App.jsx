import { useEffect, useState, useCallback } from 'react'
import { LayoutDashboard, FileText, Sparkles, GitCompare, BarChart3, Flag, CheckSquare, Shield, Search, LogOut, Bell } from 'lucide-react'
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

const NAV = [['dashboard', 'Dashboard', LayoutDashboard, Dashboard], ['documents', 'Documents', FileText, Documents], ['ask', 'Ask AI', Sparkles, Ask],
  ['compare', 'Compare', GitCompare, Compare], ['insights', 'Insights', BarChart3, Insights], ['attention', 'Attention Center', Flag, Attention],
  ['actions', 'Actions', CheckSquare, Actions], ['admin', 'Users & Audit', Shield, Admin, 'user:manage']]

export default function App() {
  const [authed, setAuthed] = useState(hasToken()), [me, setMe] = useState(null)
  const [page, setPage] = useState('dashboard'), [params, setParams] = useState({}), [tick, setTick] = useState(0)
  const [msg, setMsg] = useState(''), [pal, setPal] = useState(false)
  const bump = useCallback(() => setTick(t => t + 1), [])
  const toast = useCallback(m => { setMsg(m); setTimeout(() => setMsg(''), 2600) }, [])
  const nav = useCallback((p, x = {}) => { setPage(p); setParams(x); window.scrollTo(0, 0) }, [])
  useEffect(() => { if (authed) api('/auth/me').then(setMe).catch(() => { setToken(null); setAuthed(false) }) }, [authed])
  useEffect(() => { const k = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setPal(p => !p) } if (e.key === 'Escape') setPal(false) }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  if (!authed) return <Login onDone={() => setAuthed(true)} />
  if (!me) return <div className="p-10 mut">Loading workspace…</div>
  const can = p => me.permissions.includes(p)
  const items = NAV.filter(n => !n[4] || can(n[4]))
  const Page = (NAV.find(n => n[0] === page) || NAV[0])[3]
  return <Ctx.Provider value={{ me, can, tick, bump, toast, nav, params }}>
    <div className="md:grid md:grid-cols-[230px_1fr] min-h-screen">
      <aside className="hidden md:flex flex-col gap-1 p-3 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen" aria-label="Sidebar">
        <div className="font-bold text-lg flex items-center gap-2 px-2 py-3"><span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500" />InfoMind AI</div>
        {items.map(([id, label, Icon]) => <button key={id} onClick={() => nav(id)} aria-current={page === id ? 'page' : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm ${page === id ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Icon size={17} aria-hidden />{label}</button>)}
        <div className="mt-auto card !p-3 text-sm"><b>{me.name}</b><div className="mut capitalize">{me.role} · clearance {me.clearance}</div>
          <button className="btn mt-2 w-full flex items-center justify-center gap-2" onClick={() => { setToken(null); setAuthed(false); setMe(null) }}><LogOut size={14} />Sign out</button></div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 md:px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
          <button className="flex-1 max-w-xl flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 mut text-left" onClick={() => setPal(true)} aria-label="Open command bar"><Search size={16} />Ask InfoMind anything… <kbd className="ml-auto hidden md:block text-xs">Ctrl K</kbd></button>
          <span className="hidden md:flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />AI monitoring active</span>
          <Bell size={18} aria-label="Notifications" /><BellCount />
        </header>
        <main className="p-4 md:p-6 pb-24 md:pb-6 max-w-6xl mx-auto"><Page /></main>
      </div>
    </div>
    <nav className="md:hidden fixed bottom-0 inset-x-0 flex justify-around bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2" aria-label="Mobile">
      {[['dashboard', 'Home'], ['documents', 'Docs'], ['ask', 'Ask AI'], ['attention', 'Alerts'], ['actions', 'Actions']].map(([id, l]) =>
        <button key={id} onClick={() => nav(id)} className={`text-xs px-2 py-1 ${page === id ? 'text-indigo-600 font-semibold' : 'mut'}`}>{l}</button>)}
    </nav>
    {msg && <div role="status" className="fixed bottom-20 md:bottom-6 right-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl shadow-lg z-30">{msg}</div>}
    {pal && <div className="fixed inset-0 bg-black/50 z-20 grid place-items-start justify-center pt-[12vh]" onClick={() => setPal(false)}><div className="card w-[92vw] max-w-lg !p-2" role="dialog" aria-modal onClick={e => e.stopPropagation()}>
      <input autoFocus className="inp mb-2" placeholder="Go to a page, or press Enter to ask AI…" onKeyDown={e => { if (e.key === 'Enter' && e.target.value) { nav('ask', { q: e.target.value }); setPal(false) } }} />
      {items.map(([id, l]) => <button key={id} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950" onClick={() => { nav(id); setPal(false) }}>{l}</button>)}</div></div>}
  </Ctx.Provider>
}
function BellCount() { const [f] = useData(() => api('/findings')); const n = f ? f.filter(x => x.severity === 'CRITICAL').length : 0
  return n ? <span className="text-xs bg-red-600 text-white rounded-full px-2" aria-label={`${n} critical`}>{n}</span> : null }
