import { useState, useEffect } from 'react'
import { api } from '../api'
import { useApp, useData } from '../ctx'
import { Empty } from '../components'
const TAG = { ADDED: 'bg-emerald-100 dark:bg-emerald-900/50', REMOVED: 'bg-red-100 dark:bg-red-900/50', CHANGED: 'bg-orange-100 dark:bg-orange-900/50' }
export default function Compare() {
  const { params, can, toast, bump } = useApp(), [docs] = useData(() => api('/documents'))
  const [a, setA] = useState(params.a || ''), [b, setB] = useState(params.b || ''), [res, setRes] = useState(null), [err, setErr] = useState('')
  useEffect(() => { if (a && b && a !== b) api('/compare', { params: { a, b } }).then(r => { setRes(r); setErr('') }).catch(e => { setErr(e.message); setRes(null) }); else setRes(null) }, [a, b])
  const sel = (v, set, l) => <label className="text-sm flex-1 min-w-40">{l}<select className="inp mt-1" value={v} onChange={e => set(e.target.value)}><option value="">Choose…</option>{(docs || []).map(d => <option key={d.id}>{d.name}</option>)}</select></label>
  const act = async (title) => { try { toast('Action noted: ' + title); bump() } catch (e) { toast(e.message) } }
  return <div><h1 className="text-3xl font-bold tracking-tight">Compare documents</h1>
    <div className="flex gap-3 flex-wrap my-4">{sel(a, setA, 'Document A')}{sel(b, setB, 'Document B')}</div>
    {err && <div role="alert" className="card text-red-700 dark:text-red-400">{err}</div>}
    {res ? <><div className="card mb-3 bg-indigo-50 dark:bg-indigo-950/50"><b>AI comparison summary:</b> {res.summary}</div>
      {res.changes.length ? <div className="card overflow-x-auto"><table className="w-full text-sm min-w-[620px]"><thead><tr className="text-left mut"><th className="p-2">Field</th><th>{res.a}</th><th>{res.b}</th><th>Status</th></tr></thead>
        <tbody>{res.changes.map(c => <tr key={c.field} className="border-t border-slate-200 dark:border-slate-800"><td className="p-2 capitalize">{c.field.replace(/_/g, ' ')}</td>
          <td className={c.status === 'REMOVED' ? TAG.REMOVED : ''}>{c.a?.raw ?? '—'}</td><td className={TAG[c.status] || ''}>{c.b?.raw ?? '—'}</td>
          <td className="font-semibold">{c.status}{can('action:create') && <button className="btn ml-2" onClick={() => act(c.field)}>Flag</button>}</td></tr>)}</tbody></table></div>
        : <Empty title="No differences" text="These documents match on every extracted field." />}</>
      : !err && <p className="mut">Select two documents to see what was added, removed or changed.</p>}</div>
}
