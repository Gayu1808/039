import { api } from '../api'
import { useApp, useData } from '../ctx'
import { Sev, Empty, Loading } from '../components'
const COLS = ['To Do', 'In Progress', 'Completed']
export default function Actions() {
  const { can, me, bump, toast } = useApp(), [acts] = useData(() => api('/actions'))
  const patch = async (id, params, msg) => { try { await api('/actions/' + id, { method: 'PATCH', params }); toast(msg); bump() } catch (e) { toast(e.message) } }
  const mine = a => can('action:update_any') || (can('action:update_own') && [a.created_by, a.assignee].includes(me.username))
  return <div><h1 className="text-3xl font-bold tracking-tight">Actions</h1><p className="mut">Created from findings. Completing one updates the dashboard.</p>
    {!acts ? <Loading /> : !acts.length ? <div className="mt-4"><Empty title="You’re all caught up" text="Create actions from findings in the Attention Center." /></div> :
      <div className="grid md:grid-cols-3 gap-4 mt-4">{COLS.map(c => <div key={c}><h2 className="font-semibold mb-2">{c} <span className="mut">{acts.filter(a => a.status === c).length}</span></h2>
        <div className="space-y-3">{acts.filter(a => a.status === c).map(a => <div key={a.id} className="card !p-4"><div className="flex items-center gap-2"><Sev s={a.priority} /><span className="mut ml-auto">Due {a.due || '—'}</span></div>
          <b className="block mt-2">{a.title}</b><div className="mut">Owner {a.assignee || '—'}</div>
          {mine(a) && c !== 'Completed' && <div className="flex gap-2 flex-wrap mt-3">
            {c === 'To Do' && <button className="btn" onClick={() => patch(a.id, { status: 'In Progress' }, 'Started')}>Start</button>}
            <button className="btn btn-p" onClick={() => patch(a.id, { status: 'Completed' }, 'Action completed')}>Complete</button>
            <button className="btn" onClick={() => patch(a.id, { snooze_days: 2 }, 'Snoozed 2 days')}>Snooze</button>
            {can('action:assign') && <button className="btn" onClick={() => { const u = prompt('Assign to username'); if (u) patch(a.id, { assignee: u }, 'Assigned to ' + u) }}>Assign</button>}</div>}</div>)}</div></div>)}</div>}</div>
}
