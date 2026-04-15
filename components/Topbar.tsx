'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  naam: string
  niveau: number
  plek: number
  stellingen: { naam: string } | null
}

export default function Topbar() {
  const [query, setQuery] = useState('')
  const [resultaten, setResultaten] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) zoek(query)
      else { setResultaten([]); setOpen(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function klikBuiten(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', klikBuiten)
    return () => document.removeEventListener('mousedown', klikBuiten)
  }, [])

  async function zoek(q: string) {
    const { data, error } = await supabase
      .from('producten')
      .select('id, naam, niveau, plek, stellingen(naam)')
      .ilike('naam', `%${q}%`)
      .limit(6)

    if (error) console.error('Zoekfout:', error)
    if (data) {
      setResultaten(data as unknown as Product[])
      setOpen(true)
    }
  }

  function naarProduct(id: string) {
    setOpen(false)
    setQuery('')
    router.push(`/producten/${id}`)
  }

  function locatie(p: Product) {
    const s = p.stellingen?.naam ?? '?'
    return `${s}.${p.niveau}.${String(p.plek).padStart(2, '0')}`
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-3 px-5">
      <div className="relative flex-1 max-w-xs" ref={ref}>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path d="M10 10l4 4" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek een product..."
            className="bg-transparent text-xs text-gray-700 outline-none w-full placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setOpen(false) }}
              className="text-gray-300 hover:text-gray-500"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          )}
        </div>

        {/* Zoekresultaten dropdown */}
        {open && resultaten.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
            {resultaten.map((p) => (
              <button
                key={p.id}
                onClick={() => naarProduct(p.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-6 h-6 rounded bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{p.naam}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                  {locatie(p)}
                </span>
              </button>
            ))}
            <button
              onClick={() => { router.push(`/producten?q=${query}`); setOpen(false) }}
              className="w-full px-3 py-2 text-xs text-center border-t border-gray-50 hover:bg-gray-50 transition-colors"
              style={{ color: 'var(--accent2)' }}
            >
              Alle resultaten voor "{query}" bekijken
            </button>
          </div>
        )}

        {/* Geen resultaten */}
        {open && query.length >= 2 && resultaten.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 px-3 py-4 text-center">
            <p className="text-xs text-gray-400">Geen producten gevonden</p>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#b7e4c7]"
          style={{ background: 'var(--accent)' }}
        >
          SV
        </div>
        <div>
          <p className="text-xs font-medium text-gray-800 leading-tight">Siem</p>
          <p className="text-[10px] text-gray-400 leading-tight">Admin</p>
        </div>
      </div>
    </header>
  )
}