import { useState } from 'react'
import { api } from '../api'
import { useData } from '../ctx'
import { FindingCard, Empty, Loading } from '../components'
const FILTERS = [['All', null], ['Critical', f => f.severity === 'CRITICAL'], ['High', f => f.severity === 'HIGH'], ['Medium', f => f.severity === 'MEDIUM'],
  ['Deadlines', f => f.kind === 'deadline'], ['Conflicts', f => f.kind === 'conflict'], ['Missing information', f => f.kind === 'missing'], ['Changes', f => f.kind === 'change']]
export default function Attention() {
  const [fl, setFl] = useState('All'), [sort, setSort] = useState('score'), [data] = useData(() => api('/findings'))
  const fn = FILTERS.find(x => x[0] === fl)[1]
  const list = data && (fn ? data.filter(fn) : data).slice().sort((a, b) => sort === 'score' ? b.score - a.score : b.id - a.id)
  return <div><h1 className="text-3xl font-bold tracking-tight">Attention Center</h1><p className="mut">Focus on what matters most.</p>
    <div className="flex gap-2 flex-wrap my-4">{FILTERS.map(([l]) => <button key={l} className={`btn ${fl === l ? 'btn-p' : ''}`} onClick={() => setFl(l)}>{l}</button>)}
      <select aria-label="Sort" className="inp !w-auto ml-auto" value={sort} onChange={e => setSort(e.target.value)}><option value="score">Priority</option><option value="new">Newest</option></select></div>
    {!list ? <Loading /> : list.length ? <div className="space-y-3">{list.map(f => <FindingCard key={f.id} f={f} />)}</div> : <Empty title="Nothing here" text="No findings match this filter." />}</div>
}
