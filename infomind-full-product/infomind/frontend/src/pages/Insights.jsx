import { useMemo, useState } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Network
} from 'lucide-react'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

import { api } from '../api'
import { useData } from '../ctx'
import { Loading } from '../components'

const COL = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#d97706',
  LOW: '#64748b'
}

const obj = o =>
  Object.entries(o || {}).map(([name, value]) => ({
    name,
    value
  }))

export default function Insights() {
  const [ins] = useData(() => api('/insights'))
  const [g] = useData(() => api('/graph'))

  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [showConflicts, setShowConflicts] = useState(true)
  const [zoom, setZoom] = useState(1)

  if (!ins || !g) {
    return <Loading />
  }

  const filteredNodes = useMemo(() => {
    return g.nodes.filter(n =>
      n.id.toLowerCase().includes(search.toLowerCase())
    )
  }, [g.nodes, search])

  const n = Math.max(g.nodes.length, 1)

  const pos = Object.fromEntries(
    g.nodes.map((d, i) => [
      d.id,
      [
        180 + 130 * Math.cos((2 * Math.PI * i) / n - 1.57),
        170 + 125 * Math.sin((2 * Math.PI * i) / n - 1.57)
      ]
    ])
  )

  const visibleEdges = g.edges.filter(e => {
    if (!showConflicts && e.conflict) return false

    if (selected) {
      return e.a === selected || e.b === selected
    }

    return true
  })

  const selectedConnections = selected
    ? g.edges.filter(
        e => e.a === selected || e.b === selected
      )
    : []

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Insights & Connections
        </h1>

        <p className="mut mt-1">
          Explore relationships, versions and conflicts across your documents.
        </p>
      </div>

      {/* ANALYTICS */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="card">
          <h2 className="font-semibold">
            Open findings by severity
          </h2>

          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={obj(ins.by_severity)}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />

                <Bar dataKey="value" radius={6}>
                  {obj(ins.by_severity).map(d => (
                    <Cell
                      key={d.name}
                      fill={COL[d.name]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold">
            Findings by type
          </h2>

          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={obj(ins.by_kind)}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#4f46e5"
                  radius={6}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold">
            Action status
          </h2>

          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={obj(ins.actions)}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                  label
                >
                  {obj(ins.actions).map((d, i) => (
                    <Cell
                      key={d.name}
                      fill={
                        ['#4f46e5', '#0891b2', '#16a34a', '#dc2626'][
                          i % 4
                        ]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* GRAPH */}
      <div className="card">

        <div className="flex flex-wrap gap-3 items-center justify-between mb-5">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
              <Network size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-lg">
                Document Connection Graph
              </h2>

              <p className="mut">
                {g.nodes.length} documents · {g.edges.length} connections
              </p>
            </div>
          </div>

          <div className="flex gap-2">

            <button
              className="btn"
              onClick={() =>
                setZoom(z => Math.min(z + 0.2, 2))
              }
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>

            <button
              className="btn"
              onClick={() =>
                setZoom(z => Math.max(z - 0.2, 0.6))
              }
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>

            <button
              className="btn"
              onClick={() => {
                setZoom(1)
                setSelected(null)
                setSearch('')
              }}
              title="Reset"
            >
              <RotateCcw size={16} />
            </button>

          </div>
        </div>

        {/* SEARCH */}
        <div className="flex flex-wrap gap-3 mb-4">

          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={16}
              className="absolute left-3 top-3 mut"
            />

            <input
              className="inp pl-9"
              placeholder="Search documents..."
              value={search}
              onChange={e =>
                setSearch(e.target.value)
              }
            />
          </div>

          <button
            className={`btn ${
              showConflicts
                ? 'border-red-500 text-red-600'
                : ''
            }`}
            onClick={() =>
              setShowConflicts(v => !v)
            }
          >
            {showConflicts
              ? 'Hide conflicts'
              : 'Show conflicts'}
          </button>

        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-5">

          {/* SVG GRAPH */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden">

            <svg
              viewBox="0 0 360 340"
              className="w-full h-[430px]"
            >

              <g
                transform={`translate(180 170) scale(${zoom}) translate(-180 -170)`}
              >

                {/* EDGES */}
                {visibleEdges.map((e, i) => {
                  const a = pos[e.a]
                  const b = pos[e.b]

                  if (!a || !b) return null

                  return (
                    <line
                      key={i}
                      x1={a[0]}
                      y1={a[1]}
                      x2={b[0]}
                      y2={b[1]}
                      stroke={
                        e.conflict
                          ? '#dc2626'
                          : '#6366f1'
                      }
                      strokeWidth={
                        e.conflict ? 3 : 1.5
                      }
                      strokeDasharray={
                        e.type === 'version'
                          ? '6 4'
                          : ''
                      }
                      opacity={
                        selected &&
                        e.a !== selected &&
                        e.b !== selected
                          ? 0.15
                          : 0.8
                      }
                    />
                  )
                })}

                {/* NODES */}
                {g.nodes.map(d => {
                  const p = pos[d.id]
                  const visible = filteredNodes.some(
                    x => x.id === d.id
                  )

                  if (!visible) return null

                  const active =
                    selected === d.id

                  return (
                    <g
                      key={d.id}
                      onClick={() =>
                        setSelected(d.id)
                      }
                      className="cursor-pointer"
                    >

                      <circle
                        cx={p[0]}
                        cy={p[1]}
                        r={
                          active
                            ? 21
                            : d.findings
                            ? 17
                            : 13
                        }
                        fill={
                          active
                            ? '#4f46e5'
                            : 'white'
                        }
                        stroke={
                          d.findings
                            ? '#dc2626'
                            : '#4f46e5'
                        }
                        strokeWidth="2.5"
                      />

                      <text
                        x={p[0]}
                        y={p[1] + 31}
                        textAnchor="middle"
                        fontSize="9"
                        className="fill-current"
                      >
                        {d.id
                          .replace('.pdf', '')
                          .slice(0, 18)}
                      </text>

                    </g>
                  )
                })}

              </g>

            </svg>

          </div>

          {/* DETAILS */}
          <div className="space-y-4">

            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
              <div className="font-semibold mb-2">
                Graph legend
              </div>

              <div className="text-sm space-y-2">
                <div>🔵 Document</div>
                <div>🔴 Conflict</div>
                <div>━━ Shared entity</div>
                <div>┄┄ Document version</div>
              </div>
            </div>

            {selected ? (
              <div>
                <h3 className="font-semibold">
                  Selected document
                </h3>

                <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {selected}
                </div>

                <h3 className="font-semibold mt-5">
                  Connections
                </h3>

                {selectedConnections.length ? (
                  <div className="space-y-2 mt-2">
                    {selectedConnections.map((e, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
                      >
                        ↔ {e.a === selected ? e.b : e.a}

                        <div className="mut mt-1">
                          {e.type}
                          {e.entity
                            ? ` · ${e.entity}`
                            : ''}
                        </div>

                        {e.conflict && (
                          <div className="text-red-600 text-xs mt-1 font-semibold">
                            Conflict detected
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mut mt-2">
                    No connections found.
                  </p>
                )}

              </div>
            ) : (
              <div className="card !bg-slate-50 dark:!bg-slate-900">
                <p className="mut">
                  Select a document node to inspect
                  its relationships and conflicts.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  )
}
