import { useState, useRef } from 'react'
import { Upload, Lock } from 'lucide-react'
import { api } from '../api'
import { useApp, useData } from '../ctx'
import { Sev, Empty, Loading } from '../components'
export default function Documents() {
  const { can, bump, toast, nav, me } = useApp()
  const [docs] = useData(() => api('/documents')), [fs] = useData(() => api('/findings'))
  const [stage, setStage] = useState(''), [result, setResult] = useState(null), [err, setErr] = useState(''), ref = useRef()
  const [cls, setCls] = useState('')
  const upload = async files => {
    setErr(''); setResult(null); const sum = { findings: 0, conflicts: 0, deadlines: 0 }
    for (const file of files) {
      for (const s of ['Extracting information…', 'Finding entities…', 'Connecting documents…', 'Checking conflicts…']) { setStage(s); await new Promise(r => setTimeout(r, 350)) }
      const form = new FormData(); form.append('file', file); if (cls) form.append('classification', cls)
      try { const r = await api('/documents', { method: 'POST', form }); for (const k in sum) sum[k] += r.summary[k] }
      catch (e) { setErr(`Unable to analyze ${file.name}: ${e.message}`) }
    }
    setStage(''); setResult(sum); bump(); toast('Analysis complete')
  }
  const sevOf = n => { const x = (fs || []).filter(f => f.docs.includes(n)); return [x.length, x.sort((a, b) => b.score - a.score)[0]?.severity] }
  return <div><div className="flex items-center gap-3 flex-wrap"><h1 className="text-3xl font-bold tracking-tight flex-1">Documents <span className="mut">{docs?.length}</span></h1>
    {can('doc:upload') && <><select aria-label="Classification" className="inp !w-auto" value={cls} onChange={e => setCls(e.target.value)}><option value="">Auto-classify</option><option value="internal">Internal</option>
      {me.clearance >= 2 && <option value="confidential">Confidential</option>}{me.clearance >= 3 && <option value="restricted">Restricted</option>}</select>
      <input ref={ref} type="file" multiple hidden accept=".pdf,.docx,.txt" onChange={e => upload([...e.target.files])} />
      <button className="btn btn-p flex items-center gap-2" onClick={() => ref.current.click()}><Upload size={15} />Upload documents</button></>}</div>
    {stage && <div className="card my-4" role="status"><span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-pulse mr-2" />{stage}</div>}
    {result && <div className="card my-4 bg-indigo-50 dark:bg-indigo-950/50"><b>Analysis complete</b> — {result.findings} findings · {result.conflicts} conflicts · {result.deadlines} deadlines</div>}
    {err && <div role="alert" className="card my-4 text-red-700 dark:text-red-400">{err}</div>}
    {!can('doc:upload') && <p className="mut mt-2">Your role can view documents but not upload.</p>}
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">{!docs ? <Loading /> : docs.length ? docs.map(d => { const [n, s] = sevOf(d.name)
      return <div key={d.id} className="card"><div className="flex items-center gap-2"><b className="truncate">{d.name}</b>{d.classification !== 'internal' && <Lock size={14} aria-label={d.classification} />}{s && <span className="ml-auto"><Sev s={s} /></span>}</div>
        <div className="mut mt-1">{d.doc_type?.toUpperCase()} · {d.classification} · by {d.uploaded_by}</div>
        <div className="mut mt-2">{n ? `${n} open finding${n > 1 ? 's' : ''}` : 'No open findings'}{d.entity ? ` · ${d.entity}` : ''}</div>
        <div className="flex gap-2 mt-3"><button className="btn" onClick={() => nav('compare', { a: d.name })}>Compare</button>
          {can('doc:delete') && <button className="btn" onClick={async () => { await api('/documents/' + d.id, { method: 'DELETE' }); toast('Document deleted'); bump() }}>Delete</button>}</div></div> })
      : <div className="col-span-full"><Empty title="No documents yet" text="Upload your first document to start building your information map." /></div>}</div></div>
}
