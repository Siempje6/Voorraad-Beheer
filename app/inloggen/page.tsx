'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function Inloggen() {
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [fout, setFout] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function inloggen(e: React.FormEvent) {
    e.preventDefault()
    setFout('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord,
    })

    if (error) {
      setFout('Email of wachtwoord klopt niet')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="#b7e4c7">
              <rect x="0" y="0" width="5.5" height="5.5" rx="1" />
              <rect x="8.5" y="0" width="5.5" height="5.5" rx="1" />
              <rect x="0" y="8.5" width="5.5" height="5.5" rx="1" />
              <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">Voorraadbeheer</span>
        </div>

        {/* Formulier */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Inloggen</h1>
            <p className="text-xs text-gray-400 mt-0.5">Vul je gegevens in om verder te gaan</p>
          </div>

          <form onSubmit={inloggen} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@bedrijf.nl"
                required
                className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-300 placeholder:text-gray-300 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Wachtwoord</label>
              <input
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-300 placeholder:text-gray-300 transition-colors"
              />
            </div>

            {fout && (
              <p className="text-xs text-red-400 bg-red-50 px-3 py-2 rounded-lg">{fout}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-[#b7e4c7] disabled:opacity-50 transition-opacity hover:opacity-90 mt-1"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}