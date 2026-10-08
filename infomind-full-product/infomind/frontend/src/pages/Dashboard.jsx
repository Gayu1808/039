import { useMemo, useState } from 'react'
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Link2,
  ArrowRight,
  Upload,
  Sparkles,
  Activity,
  ShieldCheck,
  Clock3,
  TrendingUp,
  Search,
  RefreshCw
} from 'lucide-react'

import { api } from '../api'
import { useApp, useData } from '../ctx'

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  onClick,
  danger = false
}) {
  return (
    <button
      onClick={onClick}
      className={`
        card text-left w-full
        transition hover:-translate-y-0.5 hover:shadow-md
        ${danger ? 'border-red-200 dark:border-red-900' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-3">

        <div>
          <div className="mut mb-1">
            {title}
          </div>

          <div className="text-3xl font-bold tracking-tight">
            {value}
          </div>

          <div className="text-xs text-slate-500 mt-2">
            {subtitle}
          </div>
        </div>

        <div
          className={`
            w-10 h-10 rounded-xl grid place-items-center
            ${
              danger
                ? 'bg-red-50 dark:bg-red-950 text-red-600'
                : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
            }
          `}
        >
          <Icon size={20} />
        </div>

      </div>
    </button>
  )
}

function SectionTitle({
  title,
  subtitle,
  action
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">

      <div>
        <h2 className="font-semibold text-lg">
          {title}
        </h2>

        {subtitle && (
          <p className="mut mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {action}

    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action
}) {
  return (
    <div className="card text-center py-10">

      <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
        <Icon size={24} />
      </div>

      <h3 className="font-semibold mt-4">
        {title}
      </h3>

      <p className="mut max-w-md mx-auto mt-2">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}

    </div>
  )
}

function SeverityBadge({ severity }) {

  const value = String(severity || 'INFO').toUpperCase()

  const styles = {
    CRITICAL:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',

    HIGH:
      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',

    MEDIUM:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',

    LOW:
      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',

    INFO:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }

  return (
    <span
      className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
        styles[value] || styles.INFO
      }`}
    >
      {value}
    </span>
  )
}

export default function Dashboard() {

  const { me, nav, toast } = useApp()

  const [search, setSearch] = useState('')

  const [documents, documentsLoading, documentsError] =
    useData(() => api('/documents'))

  const [findings, findingsLoading, findingsError] =
    useData(() => api('/findings'))

  const [actions, actionsLoading, actionsError] =
    useData(() => api('/actions'))

  const [dashboard] =
    useData(() => api('/dashboard'))

  const docs = Array.isArray(documents)
    ? documents
    : []

  const findingList = Array.isArray(findings)
    ? findings
    : []

  const actionList = Array.isArray(actions)
    ? actions
    : []

  const criticalCount = useMemo(
    () =>
      findingList.filter(
        item =>
          String(item?.severity || '').toUpperCase() ===
          'CRITICAL'
      ).length,
    [findingList]
  )

  const highCount = useMemo(
    () =>
      findingList.filter(
        item =>
          String(item?.severity || '').toUpperCase() ===
          'HIGH'
      ).length,
    [findingList]
  )

  const openActions = useMemo(
    () =>
      actionList.filter(item => {
        const status = String(
          item?.status || ''
        ).toUpperCase()

        return ![
          'DONE',
          'COMPLETED',
          'CLOSED'
        ].includes(status)
      }).length,
    [actionList]
  )

  const recentFindings = useMemo(() => {

    const sorted = [...findingList].sort((a, b) => {

      const da = new Date(
        a?.created_at ||
        a?.updated_at ||
        0
      ).getTime()

      const db = new Date(
        b?.created_at ||
        b?.updated_at ||
        0
      ).getTime()

      return db - da
    })

    if (!search.trim()) {
      return sorted.slice(0, 6)
    }

    const q = search.toLowerCase()

    return sorted
      .filter(item => {

        const text = [
          item?.title,
          item?.description,
          item?.summary,
          item?.type,
          item?.severity
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return text.includes(q)

      })
      .slice(0, 6)

  }, [findingList, search])

  const recentDocuments = useMemo(() => {

    const sorted = [...docs].sort((a, b) => {

      const da = new Date(
        a?.created_at ||
        a?.uploaded_at ||
        0
      ).getTime()

      const db = new Date(
        b?.created_at ||
        b?.uploaded_at ||
        0
      ).getTime()

      return db - da
    })

    return sorted.slice(0, 5)

  }, [docs])

  const loading =
    documentsLoading ||
    findingsLoading ||
    actionsLoading

  const error =
    documentsError ||
    findingsError ||
    actionsError

  const greetingName =
    localStorage.getItem('infomind-display-name') ||
    me?.name ||
    'there'

  const displayName =
    String(greetingName)
      .split(' ')
      .filter(Boolean)[0] ||
    'there'

  const informationHealth = useMemo(() => {

    const total =
      criticalCount +
      highCount +
      openActions

    if (total === 0) {
      return 100
    }

    const penalty =
      criticalCount * 15 +
      highCount * 7 +
      Math.min(openActions * 2, 20)

    return Math.max(
      0,
      Math.min(100, 100 - penalty)
    )

  }, [
    criticalCount,
    highCount,
    openActions
  ])

  const healthLabel =
    informationHealth >= 85
      ? 'Healthy'
      : informationHealth >= 65
        ? 'Needs attention'
        : 'At risk'

  const healthIcon =
    informationHealth >= 85
      ? CheckCircle2
      : AlertTriangle

  const HealthIcon = healthIcon

  return (
    <div className="space-y-6">

      {/* HERO */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white p-6 md:p-8 shadow-lg">

        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute -left-16 -bottom-24 w-64 h-64 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                <Sparkles size={16} />
                Intelligent Information Command Center
              </div>

              <h1 className="text-2xl md:text-3xl font-bold">
                Good day, {displayName} 👋
              </h1>

              <p className="text-white/80 mt-2 max-w-2xl">
                InfoMind AI is continuously turning your
                organizational information into connected,
                understandable and actionable intelligence.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                className="px-4 py-2 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition flex items-center gap-2"
                onClick={() => nav('documents')}
              >
                <Upload size={16} />
                Add document
              </button>

              <button
                className="px-4 py-2 rounded-xl bg-white/15 border border-white/30 text-white font-semibold text-sm hover:bg-white/20 transition flex items-center gap-2"
                onClick={() => nav('ask')}
              >
                <Sparkles size={16} />
                Ask AI
              </button>

            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <div className="text-white/70 text-xs">
                Documents
              </div>
              <div className="text-2xl font-bold mt-1">
                {docs.length}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <div className="text-white/70 text-xs">
                Critical
              </div>
              <div className="text-2xl font-bold mt-1">
                {criticalCount}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <div className="text-white/70 text-xs">
                Open actions
              </div>
              <div className="text-2xl font-bold mt-1">
                {openActions}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <div className="text-white/70 text-xs">
                Information health
              </div>
              <div className="text-2xl font-bold mt-1">
                {informationHealth}%
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* SEARCH */}

      <div className="card !p-3 flex items-center gap-3">

        <Search
          size={18}
          className="text-slate-400"
        />

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none text-sm"
          placeholder="Search findings, risks, changes or information..."
        />

        {search && (
          <button
            className="text-xs text-indigo-600 font-semibold"
            onClick={() => setSearch('')}
          >
            Clear
          </button>
        )}

      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm text-red-700 dark:text-red-300">
          Some dashboard information could not be loaded.
          The available information is still shown below.
        </div>
      )}

      {/* STATS */}

      <section>

        <SectionTitle
          title="Information health"
          subtitle="A quick view of the current knowledge environment."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <StatCard
            title="Total documents"
            value={docs.length}
            subtitle="Knowledge sources available"
            icon={FileText}
            onClick={() => nav('documents')}
          />

          <StatCard
            title="Critical findings"
            value={criticalCount}
            subtitle="Require immediate attention"
            icon={AlertTriangle}
            danger={criticalCount > 0}
            onClick={() => nav('attention')}
          />

          <StatCard
            title="Open actions"
            value={openActions}
            subtitle="Items waiting for action"
            icon={CheckSquare}
            onClick={() => nav('actions')}
          />

          <StatCard
            title="Connections"
            value={
              dashboard?.connections ??
              dashboard?.relationships ??
              '—'
            }
            subtitle="Knowledge relationships discovered"
            icon={Link2}
            onClick={() => nav('insights')}
          />

        </div>

      </section>

      {/* HEALTH + INTELLIGENCE */}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="card">

          <div className="flex items-center justify-between">

            <div>
              <div className="mut">
                Information Health
              </div>

              <div className="text-3xl font-bold mt-1">
                {informationHealth}%
              </div>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 grid place-items-center">
              <HealthIcon size={22} />
            </div>

          </div>

          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-5 overflow-hidden">

            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{
                width: `${informationHealth}%`
              }}
            />

          </div>

          <div className="flex items-center justify-between mt-3 text-xs">

            <span className="font-semibold">
              {healthLabel}
            </span>

            <span className="mut">
              Based on active findings
            </span>

          </div>

        </div>

        <div className="card">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
              <Activity size={20} />
            </div>

            <div>
              <h3 className="font-semibold">
                AI Intelligence
              </h3>

              <p className="mut">
                What InfoMind is doing
              </p>
            </div>

          </div>

          <div className="space-y-3 mt-5">

            <div className="flex gap-3">
              <CheckCircle2
                size={16}
                className="text-emerald-500 mt-0.5"
              />
              <span className="text-sm">
                Monitoring organizational information
              </span>
            </div>

            <div className="flex gap-3">
              <Link2
                size={16}
                className="text-indigo-500 mt-0.5"
              />
              <span className="text-sm">
                Connecting related information
              </span>
            </div>

            <div className="flex gap-3">
              <AlertTriangle
                size={16}
                className="text-orange-500 mt-0.5"
              />
              <span className="text-sm">
                Detecting conflicts and risks
              </span>
            </div>

          </div>

        </div>

        <div className="card">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 grid place-items-center">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h3 className="font-semibold">
                Priority status
              </h3>

              <p className="mut">
                Items requiring attention
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">

            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-3">
              <div className="text-xs text-red-600 dark:text-red-300">
                Critical
              </div>
              <div className="text-xl font-bold mt-1">
                {criticalCount}
              </div>
            </div>

            <div className="rounded-xl bg-orange-50 dark:bg-orange-950/40 p-3">
              <div className="text-xs text-orange-600 dark:text-orange-300">
                High
              </div>
              <div className="text-xl font-bold mt-1">
                {highCount}
              </div>
            </div>

          </div>

          <button
            className="btn w-full mt-4 flex items-center justify-center gap-2"
            onClick={() => nav('attention')}
          >
            Open Attention Center
            <ArrowRight size={15} />
          </button>

        </div>

      </section>

      {/* FINDINGS */}

      <section>

        <SectionTitle
          title="What needs attention?"
          subtitle="The most important findings detected by InfoMind AI."
          action={
            <button
              className="btn flex items-center gap-2"
              onClick={() => nav('attention')}
            >
              View all
              <ArrowRight size={15} />
            </button>
          }
        />

        {loading && (
          <div className="card flex items-center gap-3">
            <RefreshCw
              size={18}
              className="animate-spin text-indigo-600"
            />
            <span className="mut">
              Loading intelligence...
            </span>
          </div>
        )}

        {!loading && recentFindings.length === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title="No urgent findings"
            description="InfoMind AI has not detected any important findings matching your current view."
            action={
              <button
                className="btn btn-p"
                onClick={() => nav('documents')}
              >
                Add documents
              </button>
            }
          />
        )}

        {!loading && recentFindings.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {recentFindings.map((finding, index) => (

              <button
                key={
                  finding?.id ||
                  finding?.finding_id ||
                  index
                }
                onClick={() =>
                  nav('attention', {
                    findingId:
                      finding?.id ||
                      finding?.finding_id
                  })
                }
                className="card text-left hover:shadow-md transition group"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-start gap-3 min-w-0">

                    <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
                      <AlertTriangle size={18} />
                    </div>

                    <div className="min-w-0">

                      <h3 className="font-semibold truncate">
                        {
                          finding?.title ||
                          finding?.name ||
                          'Detected finding'
                        }
                      </h3>

                      <p className="mut mt-1 line-clamp-2">
                        {
                          finding?.description ||
                          finding?.summary ||
                          finding?.message ||
                          'InfoMind detected an item that may require review.'
                        }
                      </p>

                    </div>

                  </div>

                  <SeverityBadge
                    severity={finding?.severity}
                  />

                </div>

                <div className="flex items-center justify-between mt-4 text-xs text-slate-500">

                  <span>
                    {finding?.type || 'AI finding'}
                  </span>

                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition"
                  />

                </div>

              </button>

            ))}

          </div>

        )}

      </section>

      {/* RECENT DOCUMENTS */}

      <section>

        <SectionTitle
          title="Recent documents"
          subtitle="The latest information added to your knowledge base."
          action={
            <button
              className="btn flex items-center gap-2"
              onClick={() => nav('documents')}
            >
              Documents
              <ArrowRight size={15} />
            </button>
          }
        />

        {recentDocuments.length === 0 ? (

          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload your first organizational document and let InfoMind AI understand and connect it."
            action={
              <button
                className="btn btn-p flex items-center gap-2"
                onClick={() => nav('documents')}
              >
                <Upload size={15} />
                Upload document
              </button>
            }
          />

        ) : (

          <div className="card !p-0 overflow-hidden">

            {recentDocuments.map((doc, index) => (

              <div
                key={
                  doc?.id ||
                  doc?.document_id ||
                  index
                }
                className="flex items-center gap-4 p-4 border-b last:border-b-0 border-slate-200 dark:border-slate-800"
              >

                <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 grid place-items-center">

                  <FileText size={18} />

                </div>

                <div className="min-w-0 flex-1">

                  <div className="font-medium truncate">

                    {
                      doc?.name ||
                      doc?.filename ||
                      doc?.title ||
                      'Untitled document'
                    }

                  </div>

                  <div className="mut truncate">

                    {
                      doc?.classification ||
                      doc?.doc_type ||
                      'Document'
                    }

                  </div>

                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">

                  <Clock3 size={14} />

                  {doc?.created_at
                    ? new Date(
                        doc.created_at
                      ).toLocaleDateString()
                    : 'Recently added'}

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* QUICK ACTIONS */}

      <section>

        <SectionTitle
          title="Quick actions"
          subtitle="Move directly to the task you want to perform."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <button
            className="card text-left hover:shadow-md transition group"
            onClick={() => nav('documents')}
          >

            <Upload
              size={20}
              className="text-indigo-600"
            />

            <h3 className="font-semibold mt-4">
              Add information
            </h3>

            <p className="mut mt-1">
              Upload a document for AI processing.
            </p>

            <ArrowRight
              size={16}
              className="mt-4 text-indigo-600 group-hover:translate-x-1 transition"
            />

          </button>

          <button
            className="card text-left hover:shadow-md transition group"
            onClick={() => nav('ask')}
          >

            <Sparkles
              size={20}
              className="text-violet-600"
            />

            <h3 className="font-semibold mt-4">
              Ask InfoMind
            </h3>

            <p className="mut mt-1">
              Ask questions about your organizational knowledge.
            </p>

            <ArrowRight
              size={16}
              className="mt-4 text-violet-600 group-hover:translate-x-1 transition"
            />

          </button>

          <button
            className="card text-left hover:shadow-md transition group"
            onClick={() => nav('compare')}
          >

            <GitCompareIcon />

            <h3 className="font-semibold mt-4">
              Compare information
            </h3>

            <p className="mut mt-1">
              Identify differences and potential conflicts.
            </p>

            <ArrowRight
              size={16}
              className="mt-4 text-emerald-600 group-hover:translate-x-1 transition"
            />

          </button>

          <button
            className="card text-left hover:shadow-md transition group"
            onClick={() => nav('insights')}
          >

            <Link2
              size={20}
              className="text-cyan-600"
            />

            <h3 className="font-semibold mt-4">
              Explore connections
            </h3>

            <p className="mut mt-1">
              Discover relationships across your information.
            </p>

            <ArrowRight
              size={16}
              className="mt-4 text-cyan-600 group-hover:translate-x-1 transition"
            />

          </button>

        </div>

      </section>

      {/* PRODUCT FLOW */}

      <section className="card">

        <SectionTitle
          title="How InfoMind AI works"
          subtitle="From scattered information to actionable intelligence."
        />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

          {[
            ['01', 'Understand', 'AI reads and understands documents.'],
            ['02', 'Connect', 'Related information is connected.'],
            ['03', 'Detect', 'Conflicts, risks and changes are detected.'],
            ['04', 'Explain', 'Important findings are explained with context.'],
            ['05', 'Act', 'Findings become prioritized actions.']
          ].map(([number, title, description]) => (

            <div
              key={number}
              className="relative rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4"
            >

              <div className="text-xs font-bold text-indigo-600">
                {number}
              </div>

              <div className="font-semibold mt-2">
                {title}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  )
}

function GitCompareIcon() {
  return (
    <div className="text-emerald-600">
      <GitCompare size={20} />
    </div>
  )
}
