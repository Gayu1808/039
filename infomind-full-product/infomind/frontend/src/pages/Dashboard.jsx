import {
  FileText,
  AlertTriangle,
  GitCompare,
  CheckSquare,
  Activity,
  ArrowRight,
  Clock,
  ShieldCheck
} from 'lucide-react'

import { api } from '../api'
import { useApp, useData } from '../ctx'
export default function Dashboard() {
  const { me, nav } = useApp()

  const displayName =
    localStorage.getItem('infomind-display-name') ||
    me?.name ||
    'User'

export default function Dashboard() {
  const {
    me,
    displayName,
    nav
  } = useApp()

  const [dashboard] = useData(
    () => api('/dashboard')
  )

  const [findings] = useData(
    () => api('/findings')
  )

  const [actions] = useData(
    () => api('/actions')
  )

  const stats = dashboard || {}

  const documents =
    stats.documents ??
    stats.document_count ??
    0

  const criticalFindings =
    stats.critical_findings ??
    (findings
      ? findings.filter(
          item =>
            item.severity === 'CRITICAL'
        ).length
      : 0)

  const conflicts =
    stats.conflicts ??
    stats.conflict_count ??
    0

  const completedActions =
    stats.actions_completed ??
    stats.completed_actions ??
    (actions
      ? actions.filter(
          item =>
            item.status === 'COMPLETED' ||
            item.status === 'completed'
        ).length
      : 0)

  const informationHealth =
    stats.information_health ??
    stats.health ??
    0

  const attentionItems =
    findings || []

  const userName =
    displayName ||
    me?.name ||
    'User'

  return (
    <div className="space-y-8">

      {/* =========================================
          HEADER
          ========================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold tracking-tight">
            Good day, {userName}
          </h1>

          <p className="mut mt-1">
            Here’s what changed and what needs your attention.
          </p>

        </div>

        <button
          className="btn btn-p flex items-center gap-2 w-fit"
          onClick={() =>
            nav('attention')
          }
        >
          Review changes
          <ArrowRight size={16} />
        </button>

      </div>

      {/* =========================================
          SUMMARY CARDS
          ========================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Documents */}

        <div className="card !p-5">

          <div className="flex items-center justify-between">

            <div className="mut">
              Documents
            </div>

            <FileText
              size={20}
              className="text-indigo-500"
            />

          </div>

          <div className="text-4xl font-bold mt-3">
            {documents}
          </div>

        </div>

        {/* Critical Findings */}

        <div className="card !p-5">

          <div className="flex items-center justify-between">

            <div className="mut">
              Critical findings
            </div>

            <AlertTriangle
              size={20}
              className="text-red-500"
            />

          </div>

          <div className="text-4xl font-bold mt-3">
            {criticalFindings}
          </div>

        </div>

        {/* Conflicts */}

        <div className="card !p-5">

          <div className="flex items-center justify-between">

            <div className="mut">
              Conflicts
            </div>

            <GitCompare
              size={20}
              className="text-amber-500"
            />

          </div>

          <div className="text-4xl font-bold mt-3">
            {conflicts}
          </div>

        </div>

        {/* Completed Actions */}

        <div className="card !p-5">

          <div className="flex items-center justify-between">

            <div className="mut">
              Actions completed
            </div>

            <CheckSquare
              size={20}
              className="text-emerald-500"
            />

          </div>

          <div className="text-4xl font-bold mt-3">
            {completedActions}
          </div>

        </div>

        {/* Information Health */}

        <div className="card !p-5">

          <div className="flex items-center justify-between">

            <div className="mut">
              Information health
            </div>

            <Activity
              size={20}
              className="text-indigo-500"
            />

          </div>

          <div className="text-4xl font-bold mt-3">
            {informationHealth}
            {typeof informationHealth === 'number'
              ? '/100'
              : ''}
          </div>

        </div>

      </div>

      {/* =========================================
          MAIN DASHBOARD AREA
          ========================================= */}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* =======================================
            ATTENTION
            ======================================= */}

        <section className="card">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="text-xl font-bold">
                What needs your attention
              </h2>

              <p className="mut mt-1">
                Important findings detected across your documents.
              </p>

            </div>

            <AlertTriangle
              size={22}
              className="text-amber-500"
            />

          </div>

          {attentionItems.length === 0 ? (

            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">

              <ShieldCheck
                size={32}
                className="mx-auto text-emerald-500 mb-2"
              />

              <div className="font-semibold">
                No critical findings
              </div>

              <p className="mut mt-1">
                Your documents are currently clear.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {attentionItems
                .slice(0, 4)
                .map((item, index) => {

                  const severity =
                    item.severity ||
                    'INFO'

                  const severityClass =
                    severity === 'CRITICAL'
                      ? 'text-red-600 bg-red-50 border-red-200'
                      : severity === 'HIGH'
                        ? 'text-orange-600 bg-orange-50 border-orange-200'
                        : severity === 'MEDIUM'
                          ? 'text-amber-600 bg-amber-50 border-amber-200'
                          : 'text-blue-600 bg-blue-50 border-blue-200'

                  return (
                    <div
                      key={
                        item.id ||
                        item.finding_id ||
                        index
                      }
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-4"
                    >

                      <div className="flex items-start gap-3">

                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-md border ${severityClass}`}
                        >
                          {severity}
                        </span>

                        <div className="min-w-0 flex-1">

                          <div className="font-semibold truncate">
                            {item.title ||
                              item.message ||
                              item.description ||
                              'Finding detected'}
                          </div>

                          {item.document_name && (
                            <div className="mut text-xs mt-1">
                              {item.document_name}
                            </div>
                          )}

                        </div>

                      </div>

                    </div>
                  )
                })}

            </div>

          )}

          <button
            className="btn mt-5 w-full flex items-center justify-center gap-2"
            onClick={() =>
              nav('attention')
            }
          >
            View attention center
            <ArrowRight size={15} />
          </button>

        </section>

        {/* =======================================
            INFORMATION HEALTH
            ======================================= */}

        <section className="card">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold">
                Information health
              </h2>

              <p className="mut mt-1">
                Overall quality of your information.
              </p>

            </div>

            <Activity
              size={22}
              className="text-indigo-500"
            />

          </div>

          <div className="flex flex-col items-center justify-center py-8">

            <div className="relative w-44 h-44">

              <svg
                viewBox="0 0 120 120"
                className="w-full h-full -rotate-90"
              >

                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-200 dark:text-slate-800"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="text-indigo-600"
                  strokeDasharray="301.6"
                  strokeDashoffset={
                    301.6 -
                    (Math.min(
                      Number(informationHealth) || 0,
                      100
                    ) /
                      100) *
                      301.6
                  }
                />

              </svg>

              <div className="absolute inset-0 grid place-items-center">

                <div className="text-center">

                  <div className="text-3xl font-bold">
                    {informationHealth}
                  </div>

                  <div className="mut text-xs">
                    / 100
                  </div>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-2 mt-4">

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />

              <span className="text-sm font-medium">
                Information quality is being monitored
              </span>

            </div>

          </div>

        </section>

      </div>

      {/* =========================================
          QUICK ACTIONS
          ========================================= */}

      <section>

        <div className="flex items-center justify-between mb-4">

          <div>

            <h2 className="text-xl font-bold">
              Quick actions
            </h2>

            <p className="mut mt-1">
              Continue working with your information.
            </p>

          </div>

        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Documents */}

          <button
            className="card text-left hover:border-indigo-400 transition"
            onClick={() =>
              nav('documents')
            }
          >

            <FileText
              size={24}
              className="text-indigo-600"
            />

            <div className="font-semibold mt-3">
              Documents
            </div>

            <div className="mut mt-1">
              Browse and manage documents.
            </div>

          </button>

          {/* Ask AI */}

          <button
            className="card text-left hover:border-indigo-400 transition"
            onClick={() =>
              nav('ask')
            }
          >

            <Sparkles
              size={24}
              className="text-violet-600"
            />

            <div className="font-semibold mt-3">
              Ask AI
            </div>

            <div className="mut mt-1">
              Ask questions about your documents.
            </div>

          </button>

          {/* Compare */}

          <button
            className="card text-left hover:border-indigo-400 transition"
            onClick={() =>
              nav('compare')
            }
          >

            <GitCompare
              size={24}
              className="text-emerald-600"
            />

            <div className="font-semibold mt-3">
              Compare
            </div>

            <div className="mut mt-1">
              Compare important document versions.
            </div>

          </button>

          {/* Actions */}

          <button
            className="card text-left hover:border-indigo-400 transition"
            onClick={() =>
              nav('actions')
            }
          >

            <CheckSquare
              size={24}
              className="text-amber-600"
            />

            <div className="font-semibold mt-3">
              Actions
            </div>

            <div className="mut mt-1">
              Track and complete follow-up actions.
            </div>

          </button>

        </div>

      </section>

      {/* =========================================
          RECENT ACTIVITY
          ========================================= */}

      <section className="card">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
            <Clock size={20} />
          </div>

          <div>

            <h2 className="text-lg font-semibold">
              Recent activity
            </h2>

            <p className="mut">
              Latest activity in your workspace.
            </p>

          </div>

        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-5 text-center">

          <Clock
            size={28}
            className="mx-auto text-slate-400"
          />

          <p className="font-medium mt-2">
            Your workspace is up to date
          </p>

          <p className="mut mt-1">
            Recent document changes and actions will appear here.
          </p>

        </div>

      </section>

    </div>
  )
}
