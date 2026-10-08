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

const COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#d97706',
  LOW: '#64748b'
}

const ACTION_COLORS = [
  '#4f46e5',
  '#0891b2',
  '#16a34a',
  '#dc2626'
]

function toChartData(value) {
  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value).map(([name, value]) => ({
    name,
    value: Number(value) || 0
  }))
}

function getPosition(index, total) {
  const angle =
    (2 * Math.PI * index) / Math.max(total, 1) - Math.PI / 2

  const centerX = 180
  const centerY = 170
  const radiusX = 130
  const radiusY = 120

  return {
    x: centerX + radiusX * Math.cos(angle),
    y: centerY + radiusY * Math.sin(angle)
  }
}

export default function Insights() {
  const [ins, insError] = useData(() => api('/insights'))
  const [graph, graphError] = useData(() => api('/graph'))

  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [showConflicts, setShowConflicts] = useState(true)
  const [zoom, setZoom] = useState(1)

  /*
   * Loading
   */
  if (!ins || !graph) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Connections
        </h1>

        <Loading />
      </div>
    )
  }

  /*
   * Safe graph data
   */
  const nodes = Array.isArray(graph.nodes)
    ? graph.nodes
    : []

  const edges = Array.isArray(graph.edges)
    ? graph.edges
    : []

  /*
   * Safe insights data
   */
  const severityData = toChartData(
    ins.by_severity
  )

  const kindData = toChartData(
    ins.by_kind
  )

  const actionData = toChartData(
    ins.actions
  )

  /*
   * Search
   */
  const searchText = search
    .trim()
    .toLowerCase()

  const filteredNodes = nodes.filter(node => {
    const id = String(node.id || '').toLowerCase()

    return id.includes(searchText)
  })

  /*
   * Filter graph edges
   */
  const filteredEdges = edges.filter(edge => {
    if (!showConflicts && edge.conflict) {
      return false
    }

    if (!searchText) {
      return true
    }

    const a = String(edge.a || '').toLowerCase()
    const b = String(edge.b || '').toLowerCase()

    return (
      a.includes(searchText) ||
      b.includes(searchText)
    )
  })

  /*
   * Selected document connections
   */
  const selectedLinks = selected
    ? edges.filter(
        edge =>
          edge.a === selected ||
          edge.b === selected
      )
    : []

  /*
   * Graph positions
   */
  const positions = {}

  nodes.forEach((node, index) => {
    positions[node.id] = getPosition(
      index,
      nodes.length
    )
  })

  /*
   * API errors
   */
  const hasError =
    insError ||
    graphError

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Connections
        </h1>

        <p className="mut mt-1">
          Explore how your documents are connected
          and identify relationships and conflicts.
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {hasError && (
        <div className="card border-red-300 dark:border-red-900">
          <h2 className="font-semibold text-red-600 dark:text-red-400">
            Some information could not be loaded
          </h2>

          <p className="mut mt-1">
            The connection graph is still available,
            but some analytics may be unavailable.
          </p>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <div className="card">
          <div className="mut">
            Documents
          </div>

          <div className="text-3xl font-bold mt-1">
            {nodes.length}
          </div>
        </div>

        <div className="card">
          <div className="mut">
            Connections
          </div>

          <div className="text-3xl font-bold mt-1">
            {edges.length}
          </div>
        </div>

        <div className="card">
          <div className="mut">
            Conflicts
          </div>

          <div className="text-3xl font-bold mt-1 text-red-600">
            {
              edges.filter(
                edge => edge.conflict
              ).length
            }
          </div>
        </div>

        <div className="card">
          <div className="mut">
            Selected
          </div>

          <div className="text-lg font-semibold mt-2 truncate">
            {selected || 'None'}
          </div>
        </div>

      </div>

      {/* ANALYTICS */}
      <div className="grid md:grid-cols-3 gap-4">

        {/* SEVERITY */}
        <div className="card">

          <h2 className="font-semibold">
            Open findings by severity
          </h2>

          <div className="h-52 mt-3">

            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData}>

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
                    {severityData.map(item => (
                      <Cell
                        key={item.name}
                        fill={
                          COLORS[item.name] ||
                          '#6366f1'
                        }
                      />
                    ))}
                  </Bar>

                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center mut">
                No severity data
              </div>
            )}

          </div>
        </div>

        {/* FINDING TYPES */}
        <div className="card">

          <h2 className="font-semibold">
            Findings by type
          </h2>

          <div className="h-52 mt-3">

            {kindData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kindData}>

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
            ) : (
              <div className="h-full grid place-items-center mut">
                No finding type data
              </div>
            )}

          </div>
        </div>

        {/* ACTION STATUS */}
        <div className="card">

          <h2 className="font-semibold">
            Action status
          </h2>

          <div className="h-52 mt-3">

            {actionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                  <Pie
                    data={actionData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={70}
                    label
                  >
                    {actionData.map(
                      (item, index) => (
                        <Cell
                          key={item.name}
                          fill={
                            ACTION_COLORS[
                              index %
                                ACTION_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center mut">
                No action data
              </div>
            )}

          </div>
        </div>

      </div>

      {/* CONNECTION GRAPH */}
      <div className="card">

        {/* GRAPH HEADER */}
        <div className="flex items-center gap-3 flex-wrap">

          <div className="flex-1">

            <h2 className="text-xl font-semibold">
              Document Connection Graph
            </h2>

            <p className="mut mt-1">
              Click a document to see its
              relationships.
            </p>

          </div>

          <div className="flex gap-2">

            <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {nodes.length} documents
            </span>

            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
              {edges.length} connections
            </span>

          </div>

        </div>

        {/* CONTROLS */}
        <div className="flex gap-2 flex-wrap mt-5">

          <input
            className="inp max-w-sm"
            placeholder="Search documents..."
            value={search}
            onChange={event =>
              setSearch(event.target.value)
            }
          />

          <button
            className="btn"
            onClick={() =>
              setZoom(
                value =>
                  Math.min(
                    value + 0.2,
                    2
                  )
              )
            }
          >
            +
          </button>

          <button
            className="btn"
            onClick={() =>
              setZoom(
                value =>
                  Math.max(
                    value - 0.2,
                    0.6
                  )
              )
            }
          >
            −
          </button>

          <button
            className="btn"
            onClick={() =>
              setZoom(1)
            }
          >
            Reset
          </button>

          <button
            className={`btn ${
              showConflicts
                ? 'btn-p'
                : ''
            }`}
            onClick={() =>
              setShowConflicts(
                value => !value
              )
            }
          >
            {showConflicts
              ? 'Hide conflicts'
              : 'Show conflicts'}
          </button>

        </div>

        {/* GRAPH AREA */}
        <div className="grid lg:grid-cols-[500px_1fr] gap-6 mt-5">

          {/* SVG GRAPH */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden">

            {nodes.length === 0 ? (

              <div className="min-h-[360px] grid place-items-center p-8 text-center">

                <div>

                  <div className="text-5xl mb-4">
                    🔗
                  </div>

                  <h3 className="font-semibold text-lg">
                    No document connections yet
                  </h3>

                  <p className="mut mt-2">
                    There are currently no
                    documents available for
                    the connection graph.
                  </p>

                </div>

              </div>

            ) : (

              <svg
                viewBox="0 0 360 340"
                className="w-full min-h-[360px]"
                role="img"
                aria-label="Document connection graph"
              >

                <g
                  transform={`
                    translate(
                      ${180 - 180 * zoom}
                      ${170 - 170 * zoom}
                    )
                    scale(${zoom})
                  `}
                >

                  {/* EDGES */}
                  {filteredEdges.map(
                    (edge, index) => {

                      const start =
                        positions[edge.a]

                      const end =
                        positions[edge.b]

                      if (
                        !start ||
                        !end
                      ) {
                        return null
                      }

                      return (
                        <line
                          key={index}
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke={
                            edge.conflict
                              ? '#dc2626'
                              : '#6366f1'
                          }
                          strokeWidth={
                            edge.conflict
                              ? 3
                              : 1.5
                          }
                          strokeDasharray={
                            edge.type ===
                            'version'
                              ? '6 4'
                              : undefined
                          }
                        />
                      )
                    }
                  )}

                  {/* NODES */}
                  {filteredNodes.map(
                    node => {

                      const position =
                        positions[node.id]

                      if (!position) {
                        return null
                      }

                      const isSelected =
                        selected ===
                        node.id

                      return (
                        <g
                          key={node.id}
                          role="button"
                          tabIndex={0}
                          className="cursor-pointer"
                          onClick={() =>
                            setSelected(
                              node.id
                            )
                          }
                          onKeyDown={
                            event => {
                              if (
                                event.key ===
                                'Enter'
                              ) {
                                setSelected(
                                  node.id
                                )
                              }
                            }
                          }
                        >

                          {/* NODE CIRCLE */}
                          <circle
                            cx={position.x}
                            cy={position.y}
                            r={
                              node.findings
                                ? 18
                                : 14
                            }
                            className={
                              isSelected
                                ? 'fill-indigo-600'
                                : 'fill-white dark:fill-slate-900'
                            }
                            stroke="#6366f1"
                            strokeWidth="2.5"
                          />

                          {/* CENTER DOT */}
                          <circle
                            cx={position.x}
                            cy={position.y}
                            r="4"
                            className={
                              isSelected
                                ? 'fill-white'
                                : 'fill-indigo-500'
                            }
                          />

                          {/* LABEL */}
                          <text
                            x={position.x}
                            y={
                              position.y +
                              31
                            }
                            textAnchor="middle"
                            fontSize="9"
                            className="fill-current"
                          >
                            {String(
                              node.id
                            ).replace(
                              '.pdf',
                              ''
                            )}
                          </text>

                        </g>
                      )
                    }
                  )}

                </g>

              </svg>

            )}

          </div>

          {/* DETAILS PANEL */}
          <div>

            {selected ? (

              <div className="card">

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <div className="mut">
                      Selected document
                    </div>

                    <h3 className="font-semibold mt-1 break-all">
                      {selected}
                    </h3>

                  </div>

                  <button
                    className="btn"
                    onClick={() =>
                      setSelected(null)
                    }
                  >
                    Clear
                  </button>

                </div>

                <div className="mt-5">

                  <h4 className="font-semibold">
                    Connections
                  </h4>

                  {selectedLinks.length ===
                  0 ? (

                    <p className="mut mt-3">
                      No connections found for
                      this document.
                    </p>

                  ) : (

                    <div className="space-y-3 mt-3">

                      {selectedLinks.map(
                        (edge, index) => {

                          const other =
                            edge.a ===
                            selected
                              ? edge.b
                              : edge.a

                          return (
                            <div
                              key={index}
                              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4"
                            >

                              <div className="font-medium break-all">
                                ↔ {other}
                              </div>

                              <div className="mut mt-1">
                                Relationship:{' '}
                                {
                                  edge.type ||
                                  'related'
                                }
                              </div>

                              {edge.entity && (
                                <div className="mut mt-1">
                                  Entity:{' '}
                                  {
                                    edge.entity
                                  }
                                </div>
                              )}

                              {edge.conflict && (
                                <div className="text-red-600 dark:text-red-400 font-semibold mt-2">
                                  ⚠ Conflict detected
                                </div>
                              )}

                            </div>
                          )
                        }
                      )}

                    </div>

                  )}

                </div>

              </div>

            ) : (

              <div className="card">

                <h3 className="font-semibold text-lg">
                  How the graph works
                </h3>

                <div className="space-y-4 mt-5">

                  <div className="flex gap-3">

                    <span className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5 shrink-0" />

                    <div>
                      <b>Solid line</b>
                      <p className="mut">
                        Documents share a common
                        entity or relationship.
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-3">

                    <span className="w-3 h-3 rounded-full bg-indigo-300 mt-1.5 shrink-0" />

                    <div>
                      <b>Dashed line</b>
                      <p className="mut">
                        Documents are different
                        versions of the same
                        document.
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-3">

                    <span className="w-3 h-3 rounded-full bg-red-500 mt-1.5 shrink-0" />

                    <div>
                      <b>Red line</b>
                      <p className="mut">
                        InfoMind detected a
                        conflict between the
                        documents.
                      </p>
                    </div>

                  </div>

                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950 p-4 text-sm">

                    <b>Tip</b>

                    <p className="mut mt-1">
                      Click any document in the
                      graph to see all documents
                      connected to it.
                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  )
}
