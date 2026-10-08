import { api } from '../api'
import { useApp, useData } from '../ctx'
import { FindingCard, Empty, Loading, DecisionChain } from '../components'

function Ring({ v }) { const c = 2 * Math.PI * 52
  return <svg width="130" height="130" viewBox="0 0 130 130" role="img" aria-label={`Information health ${v} of 100`}>
    <circle cx="65" cy="65" r="52" fill="none" strokeWidth="11" className="stroke-slate-200 dark:stroke-slate-700" />
    <circle cx="65" cy="65" r="52" fill="none" strokeWidth="11" strokeLinecap="round" className="stroke-indigo-600" strokeDasharray={`${c * v / 100} ${c}`} transform="rotate(-90 65 65)" style={{ transition: 'all .8s' }} />
    <text x="65" y="72" textAnchor="middle" className="fill-current text-3xl font-bold">{v}</text></svg> }

export default function Dashboard() {
  const { me, nav } = useApp()
  const [d] = useData(() => api('/dashboard')), [f] = useData(() => api('/findings'))
  const M = d && [['Documents', d.documents, 'documents'], ['Critical findings', d.critical, 'attention'], ['Conflicts', d.conflicts, 'attention'], ['Actions completed', d.actions_completed, 'actions'], ['Information health', d.health + '/100', 'insights']]
  return <div className="space-y-6">
    <div className="flex items-center gap-3 flex-wrap"><div className="flex-1"><h1 className="text-3xl font-bold tracking-tight">
  Good day, {me.role === 'admin' ? 'Admin' : me.name.split(' ')[0]}
</h1>
      <p className="mut">Here’s what changed and what needs your attention.</p></div><button className="btn btn-p" onClick={() => nav('attention')}>Review changes</button></div>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{M ? M.map(([l, v, to]) => <button key={l} className="card text-left hover:-translate-y-0.5 transition" onClick={() => nav(to)}><div className="mut">{l}</div><div className="text-3xl font-bold">{v}</div></button>) : <div className="col-span-5"><Loading /></div>}</div>
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <section><h2 className="text-lg font-semibold mb-3">What needs your attention</h2>
        {!f ? <Loading /> : f.length ? <div className="space-y-3">{f.slice(0, 4).map(x => <FindingCard key={x.id} f={x} />)}</div> : <Empty title="You’re all caught up" text="No open findings for your access level." />}</section>
      <aside className="space-y-4">
        <div className="card"><h2 className="font-semibold mb-2">Information health</h2><div className="flex justify-center">{d && <Ring v={d.health} />}</div>
          <p className="mut text-center">{d && (d.health >= 85 ? 'Healthy' : d.health >= 75 ? 'Needs attention' : 'At risk')}</p></div>
        {f?.[0] && <div className="card"><h2 className="font-semibold">AI decision chain</h2><div className="mut">For: {f[0].title}</div><DecisionChain f={f[0]} /></div>}
      </aside></div></div>
}
