import { useState, useEffect } from 'react'
import { api } from '../api'
import { useApp } from '../ctx'
import { Sev } from '../components'
const SUG = ['What changed recently?', 'Which documents conflict?', 'What deadlines are coming?', 'Summarize all critical findings.', 'Which information needs verification?']
export default function Ask() {
  const { params, can, toast, bump } = useApp(), [q, setQ] = useState(''), [thread, setThread] = useState([]), [busy, setBusy] = useState(false)
  const ask = async text => { if (!text) return; setBusy(true); setQ(''); const r = await api('/ask', { method: 'POST', body: { question: text } }).catch(e => ({ answer: e.message, items: [] })); setThread(t => [...t, { text, r }]); setBusy(false) }
  useEffect(() => { if (params.q) ask(params.q) }, [])
  const act = async id => { try { await api(`/findings/${id}/action`, { method: 'POST' }); toast('Action created'); bump() } catch (e) { toast(e.message) } }
  return <div className="max-w-3xl mx-auto"><h1 className="text-3xl font-bold tracking-tight">Ask InfoMind</h1><p className="mut">Answers include sources, reasoning and confidence.</p>
    <form className="flex gap-2 my-4" onSubmit={e => { e.preventDefault(); ask(q) }}><input className="inp" aria-label="Question" placeholder="Ask anything about your documents…" value={q} onChange={e => setQ(e.target.value)} /><button className="btn btn-p" disabled={busy}>Ask</button></form>
    <div className="flex gap-2 flex-wrap mb-4">{SUG.map(s => <button key={s} className="btn" onClick={() => ask(s)}>{s}</button>)}</div>
    {thread.map((t, i) => <div key={i} className="space-y-2 mb-5"><div className="ml-auto w-fit bg-indigo-600 text-white rounded-2xl px-4 py-2">{t.text}</div>
      <div className="card"><b>{t.r.answer}</b>{t.r.items?.map(it => <div key={it.id} className="mt-3 border-t border-slate-200 dark:border-slate-800 pt-3 text-sm"><Sev s={it.severity} /> <b>{it.title}</b>
        <p>{it.what}</p><p className="mut">Why it matters: {it.why} · Next: {it.next}</p><p className="mut">Sources: {it.source.join('; ')}</p>
        {can('action:create') && <button className="btn mt-2" onClick={() => act(it.id)}>Create action</button>}</div>)}
        {t.r.reasoning && <p className="mut mt-3">Reasoning: {t.r.reasoning} · Confidence {t.r.confidence}%</p>}</div></div>)}</div>
}
