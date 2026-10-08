import { useEffect, useState } from 'react'
import {
  User,
  Sun,
  Moon,
  Palette,
  Shield,
  Users,
  Info,
  Pencil,
  Check,
  X,
  Lock
} from 'lucide-react'
import { useApp } from '../ctx'

const TEAM = [
  'Gayathri K T',
  'Mithun Raj M',
  'Moneshwaran R',
  'Mokkul'
]

const THEMES = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright interface',
    icon: Sun
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark interface for low-light use',
    icon: Moon
  },
  {
    id: 'indigo',
    name: 'Indigo',
    description: 'Professional indigo theme',
    icon: Palette
  },
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Fresh green theme',
    icon: Palette
  },
  {
    id: 'violet',
    name: 'Violet',
    description: 'Modern violet theme',
    icon: Palette
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Warm rose theme',
    icon: Palette
  }
]

function applyTheme(theme) {
  const root = document.documentElement

  root.classList.remove(
    'dark',
    'theme-indigo',
    'theme-emerald',
    'theme-violet',
    'theme-rose'
  )

  if (theme === 'dark') {
    root.classList.add('dark')
  }

  if (theme === 'indigo') {
    root.classList.add('theme-indigo')
  }

  if (theme === 'emerald') {
    root.classList.add('theme-emerald')
  }

  if (theme === 'violet') {
    root.classList.add('theme-violet')
  }

  if (theme === 'rose') {
    root.classList.add('theme-rose')
  }

  localStorage.setItem(
    'infomind-theme',
    theme
  )
}

export default function Settings() {
  const { me } = useApp()

  const [theme, setTheme] = useState(
    localStorage.getItem(
      'infomind-theme'
    ) || 'light'
  )

  const [name, setName] = useState(
    localStorage.getItem(
      'infomind-display-name'
    ) || me?.name || ''
  )

  const [editName, setEditName] =
    useState(false)

  const [tempName, setTempName] =
    useState(name)

  const [confidence, setConfidence] =
    useState(
      Number(
        localStorage.getItem(
          'infomind-confidence'
        )
      ) || 80
    )

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function changeTheme(value) {
    setTheme(value)
    applyTheme(value)
  }

  function saveName() {
    const cleanName =
      tempName.trim()

    if (!cleanName) {
      return
    }

    setName(cleanName)

    localStorage.setItem(
      'infomind-display-name',
      cleanName
    )

    setEditName(false)
  }

  function cancelNameEdit() {
    setTempName(name)
    setEditName(false)
  }

  function changeConfidence(value) {
    setConfidence(value)

    localStorage.setItem(
      'infomind-confidence',
      value
    )
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Settings
        </h1>

        <p className="mut mt-1">
          Customize your InfoMind AI workspace.
        </p>
      </div>

      {/* USER PROFILE */}
      <section className="card">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
            <User size={23} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              User Profile
            </h2>

            <p className="mut">
              Manage your profile information.
            </p>
          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          {/* NAME */}
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">

            <div className="flex items-center justify-between">

              <div className="mut">
                Name
              </div>

              {!editName && (
                <button
                  className="btn !px-2 !py-1 flex items-center gap-1"
                  onClick={() => {
                    setTempName(name)
                    setEditName(true)
                  }}
                >
                  <Pencil size={13} />
                  Edit
                </button>
              )}

            </div>

            {!editName ? (

              <div className="font-semibold mt-2">
                {name || 'User'}
              </div>

            ) : (

              <div className="mt-2">

                <input
                  className="inp"
                  value={tempName}
                  onChange={event =>
                    setTempName(
                      event.target.value
                    )
                  }
                  autoFocus
                />

                <div className="flex gap-2 mt-2">

                  <button
                    className="btn btn-p flex items-center gap-1"
                    onClick={saveName}
                  >
                    <Check size={14} />
                    Save
                  </button>

                  <button
                    className="btn flex items-center gap-1"
                    onClick={cancelNameEdit}
                  >
                    <X size={14} />
                    Cancel
                  </button>

                </div>

              </div>

            )}

          </div>

          {/* ROLE - LOCKED */}
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">

            <div className="flex items-center justify-between">

              <div className="mut">
                Role
              </div>

              <Lock
                size={15}
                className="text-slate-400"
              />

            </div>

            <div className="font-semibold mt-2 capitalize">
              {me?.role || 'User'}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Role is controlled by the administrator.
            </p>

          </div>

        </div>

      </section>

      {/* APPEARANCE */}
      <section className="card">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
            <Palette size={23} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Appearance
            </h2>

            <p className="mut">
              Choose the look and feel of InfoMind.
            </p>
          </div>

        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">

          {THEMES.map(item => {

            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() =>
                  changeTheme(item.id)
                }
                className={`text-left rounded-xl border p-4 transition ${
                  theme === item.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                }`}
              >

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 grid place-items-center">
                    <Icon size={18} />
                  </div>

                  <div>
                    <div className="font-semibold">
                      {item.name}
                    </div>

                    <div className="mut text-xs">
                      {item.description}
                    </div>
                  </div>

                </div>

              </button>
            )
          })}

        </div>

      </section>

      {/* AI CONFIDENCE */}
      <section className="card">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
            <Shield size={23} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              AI Confidence
            </h2>

            <p className="mut">
              Set the minimum confidence level
              shown in the interface.
            </p>
          </div>

        </div>

        <div className="max-w-xl">

          <div className="flex items-center justify-between mb-2">

            <span className="text-sm font-medium">
              Confidence threshold
            </span>

            <span className="font-bold text-indigo-600">
              {confidence}%
            </span>

          </div>

          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={confidence}
            onChange={event =>
              changeConfidence(
                Number(
                  event.target.value
                )
              )
            }
            className="w-full accent-indigo-600"
          />

          <div className="flex justify-between mut text-xs mt-1">
            <span>50%</span>
            <span>100%</span>
          </div>

        </div>

        <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-4 text-sm">

          <b>Note:</b>

          <span className="mut ml-1">
            This controls the confidence threshold
            displayed by the interface. It does not
            retrain the underlying AI model.
          </span>

        </div>

      </section>

      {/* OUR TEAM */}
      <section className="card">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
            <Users size={23} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Our Team
            </h2>

            <p className="mut">
              InfoMind AI development team
            </p>
          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          {TEAM.map(
            (member, index) => (
              <div
                key={member}
                className="flex items-center gap-4 rounded-xl bg-slate-100 dark:bg-slate-800 p-4"
              >

                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white grid place-items-center font-bold text-lg shrink-0">
                  {index + 1}
                </div>

                <div className="font-semibold text-lg">
                  {member}
                </div>

              </div>
            )
          )}

        </div>

      </section>

      {/* ABOUT */}
      <section className="card">

        <div className="flex items-center gap-3 mb-4">

          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center">
            <Info size={23} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              About InfoMind AI
            </h2>

            <p className="mut">
              Understand. Connect. Act.
            </p>
          </div>

        </div>

        <p className="mut leading-6">
          InfoMind AI is an intelligent document
          intelligence platform designed to analyze,
          connect, compare and monitor important
          information across documents.
        </p>

        <div className="mt-4 text-sm">
          <span className="mut">
            Version
          </span>

          <span className="font-semibold ml-2">
            1.0
          </span>
        </div>

      </section>

    </div>
  )
}
