import { useState } from 'react'
import { api } from '../api'
import { useApp, useData } from '../ctx'
export default function Admin() {
  const { bump, toast } = useApp(), [users] = useData(() => api('/users')), [log] = useData(() => api('/audit'))
  const [f, setF] = useState({ username: '', password: '', role: 'analyst', name: '' })
  const patch = async (id, params) => { try { await api('/users/' + id, { method: 'PATCH', params }); toast('User updated'); bump() } catch (e) { toast(e.message) } }
  const add = async e => { e.preventDefault(); try { await api('/users', { method: 'POST', params: f }); toast('User created'); setF({ ...f, username: '', password: '', name: '' }); bump() } catch (x) { toast(x.message) } }
  return <div className="space-y-6"><h1 className="text-3xl font-bold tracking-tight">Users & audit</h1>
    <div className="card overflow-x-auto"><table className="w-full text-sm min-w-[520px]"><thead><tr className="text-left mut"><th>User</th><th>Role</th><th>Status</th></tr></thead><tbody>
      {users?.map(u => <tr key={u.id} className="border-t border-slate-200 dark:border-slate-800"><td className="py-2">{u.name} <span className="mut">@{u.username}</span></td>
        <td><select aria-label={`Role for ${u.username}`} className="inp !w-auto" value={u.role} onChange={e => patch(u.id, { role: e.target.value })}>{['viewer', 'analyst', 'manager', 'admin'].map(r => <option key={r}>{r}</option>)}</select></td>
        <td><button className="btn" onClick={() => patch(u.id, { active: !u.active })}>{u.active ? 'Disable' : 'Enable'}</button></td></tr>)}</tbody></table>
      <form onSubmit={add} className="flex gap-2 flex-wrap mt-4">{['username', 'name', 'password'].map(k => <input key={k} required={k !== 'name'} className="inp !w-auto flex-1 min-w-32" placeholder={k} type={k === 'password' ? 'password' : 'text'} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />)}
        <select className="inp !w-auto" aria-label="New user role" value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>{['viewer', 'analyst', 'manager', 'admin'].map(r => <option key={r}>{r}</option>)}</select><button className="btn btn-p">Add user</button></form></div>
    <div className="card"><h2 className="font-semibold mb-2">Audit log</h2><div className="text-sm space-y-1 max-h-96 overflow-auto">{log?.map(l => <div key={l.id} className="flex gap-3 flex-wrap"><span className="mut w-40">{new Date(l.at).toLocaleString()}</span><b>{l.username}</b><span>{l.event}</span><span className="mut">{l.target}</span></div>)}</div></div></div>
}
