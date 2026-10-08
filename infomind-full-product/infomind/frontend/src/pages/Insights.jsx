import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api } from '../api'
import { useData } from '../ctx'
import { Loading } from '../components'
const COL = { CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#64748b' }
const obj = o => Object.entries(o || {}).map(([name, value]) => ({ name, value }))
export default function Insights() {
  const [ins] = useData(() => api('/insights')), [g] = useData(() => api('/graph')), [sel, setSel] = useState(null)
  if (!ins || !g) return <Loading />
  const n = g.nodes.length, pos = Object.fromEntries(g.nodes.map((d, i) => [d.id, [180 + 130 * Math.cos(2 * Math.PI * i / n - 1.57), 170 + 125 * Math.sin(2 * Math.PI * i / n - 1.57)]]))
  const links = sel ? g.edges.filter(e => e.a === sel || e.b === sel) : []
  return <div className="space-y-6"><h1 className="text-3xl font-bold tracking-tight">Insights</h1>
    <div className="grid md:grid-cols-3 gap-4">
      <div className="card"><h2 className="font-semibold">Open findings by severity</h2><div className="h-48"><ResponsiveContainer><BarChart data={obj(ins.by_severity)}><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip />
        <Bar dataKey="value" radius={6}>{obj(ins.by_severity).map(d => <Cell key={d.name} fill={COL[d.name]} />)}</Bar></BarChart></ResponsiveContainer></div></div>
      <div className="card"><h2 className="font-semibold">Findings by type</h2><div className="h-48"><ResponsiveContainer><BarChart data={obj(ins.by_kind)}><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="value" fill="#4f46e5" radius={6} /></BarChart></ResponsiveContainer></div></div>
      <div className="card"><h2 className="font-semibold">Action status</h2><div className="h-48"><ResponsiveContainer><PieChart><Pie data={obj(ins.actions)} dataKey="value" nameKey="name" outerRadius={70} label>{obj(ins.actions).map((d, i) => <Cell key={d.name} fill={['#4f46e5', '#0891b2', '#16a34a', '#dc2626'][i % 4]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div></div>
    <div className="card"><h2 className="font-semibold">How your information is connected</h2><p className="mut">Select a document to see its connections. Red lines mark conflicts.</p>
      <div className="grid md:grid-cols-[360px_1fr] gap-4 items-start"><svg viewBox="0 0 360 340" role="img" aria-label="Document relationship graph" className="w-full max-w-sm">
        {g.edges.map((e, i) => <line key={i} x1={pos[e.a][0]} y1={pos[e.a][1]} x2={pos[e.b][0]} y2={pos[e.b][1]} stroke={e.conflict ? '#dc2626' : '#6366f1'} strokeWidth={e.conflict ? 3 : 1.5} strokeDasharray={e.type === 'version' ? '5 3' : ''} />)}
        {g.nodes.map(d => <g key={d.id} tabIndex={0} role="button" aria-label={d.id} className="cursor-pointer" onClick={() => setSel(d.id)} onKeyDown={e => e.key === 'Enter' && setSel(d.id)}>
          <circle cx={pos[d.id][0]} cy={pos[d.id][1]} r={d.findings ? 17 : 12} className={sel === d.id ? 'fill-indigo-600' : 'fill-white dark:fill-slate-900'} stroke="#4f46e5" strokeWidth="2.5" />
          <text x={pos[d.id][0]} y={pos[d.id][1] + 30} textAnchor="middle" fontSize="9.5" className="fill-current">{d.id.replace('.pdf', '')}</text></g>)}</svg>
        <div className="text-sm">{sel ? <><b>{sel}</b>{links.length ? links.map((e, i) => <p key={i} className="mt-2">↔ {e.a === sel ? e.b : e.a} <span className="mut">({e.type}{e.entity ? `: ${e.entity}` : ''})</span>{e.conflict && <b className="text-red-700 dark:text-red-400"> · conflict</b>}</p>) : <p className="mut">No connections found.</p>}</> : <p className="mut">Dashed lines: versions of the same document. Solid: shared entity.</p>}</div></div></div></div>
}
