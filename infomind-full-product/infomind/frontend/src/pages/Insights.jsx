import { useState } from 'react'
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

  const [sel, setSel] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [showConflicts, setShowConflicts] = useState(true)
  const [search, setSearch] = useState('')

  if (!ins || !g) {
    return <Loading />
  }

  // Safety checks
  const nodes = Array.isArray(g.nodes) ? g.nodes : []
  const edges = Array.isArray(g.edges) ? g.edges : []

  // No documents available
  if (nodes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Connections
        </h1>

        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔗</div>

          <h2 className="text-xl font-semibold">
            No document connections yet
          </h2>

          <p className="mut mt-2">
            Upload or add more documents to see how they are
            connected.
          </p>
        </div>
      </div>
    )
  }

  const n = nodes.length

  const positions = Object.fromEntries(
    nodes.map((d, i) => [
      d.id,
      [
        180 +
          130 *
            Math.cos(
              (2 * Math.PI * i) / n - 1.57
            ),
        170 +
          125 *
            Math.sin(
              (2 * Math.PI * i) / n - 1.57
            )
      ]
    ])
  )

  const filteredNodes = nodes.filter(node =>
    node.id.toLowerCase().includes(search.toLowerCase())
  )

  const filteredEdges = edges.filter(edge => {
    if (!showConflicts && edge.conflict) {
      return false
    }

    if (!search) {
      return true
    }

    return (
      edge.a.toLowerCase().includes(search.toLowerCase()) ||
      edge.b.toLowerCase().includes(search.toLowerCase())
    )
  })

  const selectedLinks = sel
    ? edges.filter(
        e => e.a === sel || e.b === sel
      )
    : []

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Connections
        </h1>

        <p className="mut mt-1">
          Explore how your documents are connected.
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
                <XAxis
                  dataKey="name"
                  fontSize={11}
                />

                <YAxis
                  allowDecimals={false}
                  fontSize={11}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  radius={6}
                >
                  {obj(ins.by_severity).map(d => (
                    <Cell
                      key={d.name}
                      fill={COL[d.name] || '#6366f1'}
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
                <XAxis
                  dataKey="name"
                  fontSize={11}
                />

                <YAxis
                  allowDecimals={false}
                  fontSize={11}
                />

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
                        [
                          '#4f46e5',
                          '#0891b2',
                          '#16a34a',
                          '#dc2626'
                        ][i % 4]
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

      {/* CONNECTION GRAPH */}
      <div className="card">

        <div className="flex items-center gap-3 flex-wrap">

          <div className="flex-1">
            <h2 className="text-xl font-semibold">
              Document Connection Graph
            </h2>

            <p className="mut">
              Select a document to explore its
              relationships.
            </p>
          </div>

          <span className="text-sm px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            {nodes.length} documents
          </span>

          <span className="text-sm px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            {edges.length} connections
          </span>

        </div>

        {/* CONTROLS */}
        <div className="flex gap-2 flex-wrap mt-4">

          <input
            className="inp max-w-xs"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <button
            className="btn"
            onClick={() =>
              setZoom(z => Math.min(z + 0.2, 2))
            }
          >
            +
          </button>

          <button
            className="btn"
            onClick={() =>
              setZoom(z => Math.max(z - 0.2, 0.6))
            }
          >
            −
          </button>

          <button
            className="btn"
            onClick={() => setZoom(1)}
          >
            Reset
          </button>

          <button
            className={`btn ${
              showConflicts ? 'btn-p' : ''
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

        {/* GRAPH */}
        <div className="mt-5 grid lg:grid-cols-[420px_1fr] gap-6">

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden">

            <svg
              viewBox="0 0 360 340"
              className="w-full"
              role="img"
              aria-label="Document relationship graph"
            >

              <g
                transform={`translate(${
                  180 - 180 * zoom
                } ${
                  170 - 170 * zoom
                }) scale(${zoom})`}
              >

                {/* CONNECTION LINES */}
                {filteredEdges.map((e, i) => {

                  const a = positions[e.a]
                  const b = positions[e.b]

                  if (!a || !b) {
                    return null
                  }

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
                          ? '5 3'
                          : ''
                      }
                    />
                  )
                })}

                {/* DOCUMENT NODES */}
                {filteredNodes.map(d => {

                  const p = positions[d.id]

                  if (!p) {
                    return null
                  }

                  const selected =
                    sel === d.id

                  return (
                    <g
                      key={d.id}
                      tabIndex={0}
                      role="button"
                      onClick={() =>
                        setSel(d.id)
                      }
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setSel(d.id)
                        }
                      }}
                      className="cursor-pointer"
                    >

                      <circle
                        cx={p[0]}
                        cy={p[1]}
                        r={
                          d.findings
                            ? 18
                            : 13
                        }
                        className={
                          selected
                            ? 'fill-indigo-600'
                            : 'fill-white dark:fill-slate-900'
                        }
                        stroke="#6366f1"
                        strokeWidth="2.5"
                      />

                      <text
                        x={p[0]}
                        y={p[1] + 32}
                        textAnchor="middle"
                        fontSize="9"
                        className="fill-current"
                      >
                        {d.id.replace(
                          '.pdf',
                          ''
                        )}
                      </text>

                    </g>
                  )
                })}

              </g>

            </svg>

          </div>

          {/* DETAILS */}
          <div>

            {sel ? (
              <div className="card">

                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    Selected document
                  </h3>

                  <button
                    className="btn"
                    onClick={() =>
                      setSel(null)
                    }
                  >
                    Clear
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950">
                  <b>{sel}</b>
                </div>

                {selectedLinks.length > 0 ? (
                  <div className="mt-4 space-y-3">

                    <div className="mut">
                      Connected documents
                    </div>

                    {selectedLinks.map(
                      (e, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800"
                        >

                          <div className="font-medium">
                            ↔{' '}
                            {e.a === sel
                              ? e.b
                              : e.a}
                          </div>

                          <div className="mut mt-1">
                            Relationship:{' '}
                            {e.type}
                          </div>

                          {e.entity && (
                            <div className="mut">
                              Entity:{' '}
                              {e.entity}
                            </div>
                          )}

                          {e.conflict && (
                            <div className="text-red-600 dark:text-red-400 font-semibold mt-1">
                              ⚠ Conflict detected
                            </div>
                          )}

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <p className="mut mt-4">
                    No connections found for
                    this document.
                  </p>
                )}

              </div>
            ) : (
              <div className="card">

                <h3 className="font-semibold">
                  How the graph works
                </h3>

                <div className="space-y-3 mt-4 text-sm">

                  <p>
                    🔵 <b>Solid line</b> — shared
                    entity
                  </p>

                  <p>
                    🔵 <b>Dashed line</b> —
                    document version
                  </p>

                  <p>
                    🔴 <b>Red line</b> — detected
                    conflict
                  </p>

                  <p className="mut">
                    Click any document node to
                    see its relationships.
                  </p>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}
