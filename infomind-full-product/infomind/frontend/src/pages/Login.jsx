import { useState } from 'react'
import { login } from '../api'
export default function Login({ onDone }) {
  const [u, setU] = useState('manager'), [p, setP] = useState('demo1234'), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const go = async e => { e.preventDefault(); setBusy(true); setErr(''); try { await login(u, p); onDone() } catch (x) { setErr(x.message) } setBusy(false) }
  return <div className="min-h-screen grid place-items-center p-4"><form onSubmit={go} className="card w-full max-w-sm space-y-4">
    <div><div className="flex items-center gap-2 text-xl font-bold"><span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500" />InfoMind AI</div>
      <div className="mut mt-1">Understand. Connect. Act.</div></div>
    <label className="block text-sm">Username<input className="inp mt-1" value={u} onChange={e => setU(e.target.value)} autoComplete="username" /></label>
    <label className="block text-sm">Password<input className="inp mt-1" type="password" value={p} onChange={e => setP(e.target.value)} autoComplete="current-password" /></label>
    {err && <div role="alert" className="text-sm text-red-700 dark:text-red-400">{err}</div>}
    <button className="btn btn-p w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    <div className="mut">Demo roles: {['admin', 'manager', 'analyst', 'viewer'].map(r => <button type="button" key={r} className="underline mr-2" onClick={() => setU(r)}>{r}</button>)}</div>
  </form></div>
}
