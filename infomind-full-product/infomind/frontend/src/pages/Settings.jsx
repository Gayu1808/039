import { useState } from 'react'
import {
  Sun,
  Moon,
  Palette,
  User,
  ShieldCheck,
  Users,
  Sparkles
} from 'lucide-react'

const themes = [
  { id: 'light', name: 'Light', icon: Sun },
  { id: 'dark', name: 'Dark', icon: Moon },
  { id: 'indigo', name: 'Indigo', icon: Palette },
  { id: 'emerald', name: 'Emerald', icon: Palette },
  { id: 'violet', name: 'Violet', icon: Palette },
  { id: 'rose', name: 'Rose', icon: Palette }
]

const team = [
  'Gayathri K T',
  'Darshan S',
  'Dharshini S',
  'Miruthula M'
]

export default function Settings() {
  const [theme, setTheme] = useState(
    localStorage.getItem('infomind-theme') || 'light'
  )

  const [confidence, setConfidence] = useState(
    Number(localStorage.getItem('ai-confidence') || 70)
  )

  function applyTheme(id) {
    setTheme(id)
    localStorage.setItem('infomind-theme', id)

    document.documentElement.classList.remove(
      'dark',
      'theme-indigo',
      'theme-emerald',
      'theme-violet',
      'theme-rose'
    )

    if (id === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (id !== 'light') {
      document.documentElement.classList.add(`theme-${id}`)
    }
  }

  function changeConfidence(value) {
    setConfidence(value)
    localStorage.setItem('ai-confidence', value)
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Settings
        </h1>
        <p className="mut mt-1">
          Customize your InfoMind AI workspace.
        </p>
      </div>

      {/* PROFILE */}
      <section className="card">
        <div className="flex items-center gap-3 mb-5">
          <User size={22} className="text-indigo-600" />
          <div>
            <h2 className="font-semibold text-lg">
              User Profile
            </h2>
            <p className="mut">
              Account and access information
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-400 text-white grid place-items-center text-xl font-bold">
            IM
          </div>

          <div>
            <h3 className="font-semibold text-lg">
              InfoMind User
            </h3>
            <p className="mut">
              AI document intelligence workspace
            </p>
          </div>
        </div>
      </section>

      {/* APPEARANCE */}
      <section className="card">
        <div className="flex items-center gap-3 mb-5">
          <Palette size={22} className="text-indigo-600" />
          <div>
            <h2 className="font-semibold text-lg">
              Appearance
            </h2>
            <p className="mut">
              Choose light, dark or custom theme
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => applyTheme(id)}
              className={`p-4 rounded-xl border text-left transition ${
                theme === id
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              <Icon size={20} className="mb-2" />
              <div className="font-medium">
                {name}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* AI */}
      <section className="card">
        <div className="flex items-center gap-3 mb-5">
          <Sparkles size={22} className="text-indigo-600" />

          <div>
            <h2 className="font-semibold text-lg">
              AI Analysis
            </h2>

            <p className="mut">
              Control the minimum confidence displayed for AI findings.
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Confidence threshold
            </span>

            <span className="text-sm font-bold text-indigo-600">
              {confidence}%
            </span>
          </div>

          <input
            type="range"
            min="50"
            max="100"
            value={confidence}
            onChange={e =>
              changeConfidence(Number(e.target.value))
            }
            className="w-full"
          />

          <p className="mut mt-2">
            Higher values show only higher-confidence AI findings.
          </p>
        </div>
      </section>

      {/* SECURITY */}
      <section className="card">
        <div className="flex items-center gap-3">
          <ShieldCheck
            size={22}
            className="text-emerald-600"
          />

          <div>
            <h2 className="font-semibold text-lg">
              Security
            </h2>

            <p className="mut">
              Authentication and role-based access are enabled.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="card">
        <div className="flex items-center gap-3 mb-5">
          <Users size={22} className="text-indigo-600" />

          <div>
            <h2 className="font-semibold text-lg">
              Our Team
            </h2>

            <p className="mut">
              InfoMind AI development team
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {team.map((name, index) => (
            <div
              key={name}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white grid place-items-center font-semibold">
                {index + 1}
              </div>

              <span className="font-medium">
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="card">
        <h2 className="font-semibold text-lg">
          About InfoMind AI
        </h2>

        <p className="mut mt-2 leading-6">
          InfoMind AI helps organizations understand,
          connect and act on information by detecting
          important changes, conflicts and relationships
          across documents.
        </p>

        <div className="mt-4 inline-flex px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-sm">
          AI Document Intelligence
        </div>
      </section>

    </div>
  )
}
