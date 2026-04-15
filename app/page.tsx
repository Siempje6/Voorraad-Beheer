'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Categorie {
  id: string
  naam: string
  beschrijving: string
  afbeelding_url: string | null
}

interface Stelling {
  id: string
  naam: string
}

interface Product {
  id: string
  naam: string
  niveau: number
  plek: number
  voorraad: number
  min_voorraad: number
  stelling_id: string
}

export default function Dashboard() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [stellingen, setStellingen] = useState<Stelling[]>([])
  const [producten, setProducten] = useState<Product[]>([])
  const [actieveStelling, setActieveStelling] = useState<string>('')
  const [totaal, setTotaal] = useState(0)
  const [laag, setLaag] = useState(0)

  useEffect(() => {
    laadAlles()
  }, [])

  async function laadAlles() {
    const [catRes, stellRes, prodRes] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('stellingen').select('*').order('naam'),
      supabase.from('producten').select('*'),
    ])

    if (catRes.data) setCategories(catRes.data)
    if (stellRes.data) {
      setStellingen(stellRes.data)
      if (stellRes.data.length > 0) setActieveStelling(stellRes.data[0].id)
    }
    if (prodRes.data) {
      setProducten(prodRes.data)
      setTotaal(prodRes.data.length)
      setLaag(prodRes.data.filter((p) => p.voorraad <= p.min_voorraad).length)
    }
  }

  const productenInStelling = producten.filter(
    (p) => p.stelling_id === actieveStelling
  )

  const actieveStellingNaam = stellingen.find(
    (s) => s.id === actieveStelling
  )?.naam ?? ''

  function locatie(p: Product) {
    return `${actieveStellingNaam}.${p.niveau}.${String(p.plek).padStart(2, '0')}`
  }

  function voorraadStatus(p: Product) {
    if (p.voorraad <= p.min_voorraad) return 'laag'
    if (p.voorraad <= p.min_voorraad * 1.5) return 'bijna'
    return 'ok'
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl">

      {/* Paginatitel + knoppen */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Overzicht van je voorraad</p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-[#b7e4c7]"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M5 0v10M0 5h10" />
            </svg>
            Product toevoegen
          </button>
          <button className="text-xs px-3 py-2 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">
            Exporteren
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl p-4 text-[#b7e4c7]" style={{ background: 'var(--accent)' }}>
          <p className="text-[10px] uppercase tracking-wider opacity-70 mb-2">Totaal producten</p>
          <p className="text-3xl font-bold leading-none">{totaal}</p>
          <p className="text-[10px] opacity-50 mt-1.5">in het systeem</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Lage voorraad</p>
          <p className="text-3xl font-bold leading-none text-amber-500">{laag}</p>
          <p className="text-[10px] text-gray-300 mt-1.5">Onder minimumniveau</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Categorieën</p>
          <p className="text-3xl font-bold leading-none text-gray-800">{categories.length}</p>
          <p className="text-[10px] text-gray-300 mt-1.5">Actieve categorieën</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Stellingen</p>
          <p className="text-3xl font-bold leading-none text-gray-800">{stellingen.length}</p>
          <p className="text-[10px] text-gray-300 mt-1.5">
            {stellingen.length > 0 ? `A t/m ${stellingen[stellingen.length - 1].naam}` : '—'}
          </p>
        </div>
      </div>

      {/* Categorieën */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">Categorieën</h2>
          <button className="text-xs" style={{ color: 'var(--accent2)' }}>
            Alle categorieën
          </button>
        </div>
        {categories.length === 0 ? (
          <p className="text-xs text-gray-300 py-4 text-center">Geen categorieën gevonden</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-lg p-3 cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
                style={{ background: '#f9f9f7' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: 'var(--accent-bg)' }}
                >
                  {cat.afbeelding_url ? (
                    <img src={cat.afbeelding_url} alt={cat.naam} className="w-5 h-5 object-cover" />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent2)' }}>
                      <rect x="1" y="1" width="6" height="6" rx="1" />
                      <rect x="9" y="1" width="6" height="6" rx="1" />
                      <rect x="1" y="9" width="6" height="6" rx="1" />
                      <rect x="9" y="9" width="6" height="6" rx="1" />
                    </svg>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-800">{cat.naam}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{cat.beschrijving}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per stelling */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Per stelling</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          {stellingen.map((s) => (
            <button
              key={s.id}
              onClick={() => setActieveStelling(s.id)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                actieveStelling === s.id
                  ? 'font-semibold text-[#b7e4c7] border-transparent'
                  : 'text-gray-400 border-gray-200 bg-gray-50 hover:text-gray-600'
              }`}
              style={actieveStelling === s.id ? { background: 'var(--accent)', borderColor: 'var(--accent2)' } : {}}
            >
              {s.naam}
            </button>
          ))}
        </div>

        {/* Producten lijst */}
        {productenInStelling.length === 0 ? (
          <p className="text-xs text-gray-300 py-4 text-center">Geen producten in deze stelling</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {productenInStelling.map((p) => {
              const status = voorraadStatus(p)
              return (
                <div key={p.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-7 h-7 rounded-md bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{p.naam}</p>
                    <p className="text-[10px] text-gray-400">Stelling {actieveStellingNaam}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      status === 'laag'
                        ? 'bg-red-50 text-red-500'
                        : status === 'bijna'
                        ? 'bg-amber-50 text-amber-500'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {status === 'laag' ? 'Laag!' : locatie(p)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}