'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  naam: string
  niveau: number
  plek: number
  voorraad: number
  min_voorraad: number
  stellingen: { naam: string } | null
  categories: { naam: string } | null
}

export default function ProductenPagina() {
  const [producten, setProducten] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') ?? ''
  const [zoekterm, setZoekterm] = useState(q)

  useEffect(() => {
    laadProducten(q)
  }, [q])

  async function laadProducten(filter: string) {
    setLoading(true)

    let query = supabase
      .from('producten')
      .select(`
        id, naam, niveau, plek, voorraad, min_voorraad,
        stellingen(naam),
        categories(naam)
      `)
      .order('naam')

    if (filter) query = query.ilike('naam', `%${filter}%`)

    const { data, error } = await query

    if (error) console.error('Fout bij laden producten:', error)
    if (data) setProducten(data as unknown as Product[])
    setLoading(false)
  }

  function zoek(e: React.FormEvent) {
    e.preventDefault()
    router.push(zoekterm ? `/producten?q=${zoekterm}` : '/producten')
  }

  function locatie(p: Product) {
    const s = p.stellingen?.naam ?? '?'
    return `${s}.${p.niveau}.${String(p.plek).padStart(2, '0')}`
  }

  function status(p: Product) {
    if (p.voorraad <= p.min_voorraad) return 'laag'
    if (p.voorraad <= p.min_voorraad * 1.5) return 'bijna'
    return 'ok'
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Producten</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? 'Laden...' : `${producten.length} producten`}
            {q && ` voor "${q}"`}
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-[#b7e4c7]"
          style={{ background: 'var(--accent)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 0v10M0 5h10" />
          </svg>
          Product toevoegen
        </button>
      </div>

      {/* Zoekbalk */}
      <form onSubmit={zoek} className="flex gap-2">
        <div className="flex items-center gap-2 flex-1 bg-white border border-gray-100 rounded-lg px-3 py-2">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path d="M10 10l4 4" />
          </svg>
          <input
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            placeholder="Zoek op naam..."
            className="bg-transparent text-xs text-gray-700 outline-none w-full placeholder:text-gray-400"
          />
          {zoekterm && (
            <button
              type="button"
              onClick={() => {
                setZoekterm('')
                router.push('/producten')
              }}
              className="text-gray-300 hover:text-gray-500"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          className="text-xs px-4 py-2 rounded-lg text-[#b7e4c7] font-medium"
          style={{ background: 'var(--accent)' }}
        >
          Zoeken
        </button>
      </form>

      {/* Skeleton loader */}
      {loading && (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leeg */}
      {!loading && producten.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-sm text-gray-400">
            {q ? `Geen producten gevonden voor "${q}"` : 'Nog geen producten toegevoegd'}
          </p>
          {q && (
            <button
              onClick={() => { setZoekterm(''); router.push('/producten') }}
              className="mt-3 text-xs underline"
              style={{ color: 'var(--accent2)' }}
            >
              Zoekfilter wissen
            </button>
          )}
        </div>
      )}

      {/* Producten grid */}
      {!loading && producten.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {producten.map((p) => {
            const s = status(p)
            return (
              <button
                key={p.id}
                onClick={() => router.push(`/producten/${p.id}`)}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:border-gray-200 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.naam}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {p.categories?.naam ?? '—'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] font-mono font-medium text-gray-500">
                    {locatie(p)}
                  </span>
                  {s === 'laag' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-400">
                      Laag!
                    </span>
                  )}
                  {s === 'bijna' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-400">
                      Bijna op
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}