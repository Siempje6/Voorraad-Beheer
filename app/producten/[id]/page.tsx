'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  naam: string
  beschrijving: string | null
  afbeelding_url: string | null
  voorraad: number
  min_voorraad: number
  niveau: number
  plek: number
  stellingen: { naam: string } | null
  categories: { naam: string } | null
}

export default function ProductDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [opslaan, setOpslaan] = useState(false)
  const [melding, setMelding] = useState<'succes' | 'fout' | null>(null)
  const [meldingTekst, setMeldingTekst] = useState('')
  const [besteld, setBesteld] = useState('')
  const [ontvangen, setOntvangen] = useState('')

  useEffect(() => {
    laadProduct()
  }, [id])

  async function laadProduct() {
    const { data, error } = await supabase
      .from('producten')
      .select(`
        id, naam, beschrijving, afbeelding_url,
        voorraad, min_voorraad, niveau, plek,
        stellingen(naam),
        categories(naam)
      `)
      .eq('id', id)
      .single()

    if (error) console.error('Fout bij laden product:', error)
    if (data) setProduct(data as unknown as Product)
    setLoading(false)
  }

  async function updateVoorraad(nieuw: number, tekst: string) {
    if (!product || nieuw < 0) return
    setOpslaan(true)

    const { error } = await supabase
      .from('producten')
      .update({ voorraad: nieuw })
      .eq('id', product.id)

    if (error) {
      setMelding('fout')
      setMeldingTekst('Opslaan mislukt, probeer opnieuw')
    } else {
      setProduct({ ...product, voorraad: nieuw })
      setMelding('succes')
      setMeldingTekst(tekst)
    }

    setOpslaan(false)
    setTimeout(() => setMelding(null), 3000)
  }

  function verwerkOntvangen() {
    if (!product) return
    const aantal = parseInt(ontvangen)
    if (isNaN(aantal) || aantal <= 0) return
    updateVoorraad(product.voorraad + aantal, `+${aantal} ontvangen → voorraad is nu ${product.voorraad + aantal}`)
    setOntvangen('')
  }

  function verwerkBesteld() {
    if (!product) return
    const aantal = parseInt(besteld)
    if (isNaN(aantal) || aantal <= 0) return
    updateVoorraad(product.voorraad - aantal, `−${aantal} besteld → voorraad is nu ${product.voorraad - aantal}`)
    setBesteld('')
  }

  function locatie() {
    if (!product) return '—'
    const s = product.stellingen?.naam ?? '?'
    return `${s}.${product.niveau}.${String(product.plek).padStart(2, '0')}`
  }

  function voorraadStatus() {
    if (!product) return 'ok'
    if (product.voorraad <= product.min_voorraad) return 'laag'
    if (product.voorraad <= product.min_voorraad * 1.5) return 'bijna'
    return 'ok'
  }

  if (loading) {
    return (
      <div className="max-w-2xl animate-pulse flex flex-col gap-4">
        <div className="h-5 bg-gray-100 rounded w-1/3" />
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex gap-6">
          <div className="w-40 h-40 rounded-xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-3">
            <div className="h-5 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-gray-400">Product niet gevonden.</p>
        <button
          onClick={() => router.push('/producten')}
          className="mt-3 text-xs underline"
          style={{ color: 'var(--accent2)' }}
        >
          Terug naar producten
        </button>
      </div>
    )
  }

  const status = voorraadStatus()

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Terug knop */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors w-fit"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 2L4 7l5 5" />
        </svg>
        Terug
      </button>

      {/* Product kaart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex gap-6">
          <div className="w-40 h-40 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {product.afbeelding_url ? (
              <img src={product.afbeelding_url} alt={product.naam} className="w-full h-full object-cover" />
            ) : (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <rect x="4" y="4" width="24" height="24" rx="3" />
                <circle cx="12" cy="12" r="3" />
                <path d="M4 22l7-7 5 5 4-4 8 8" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">{product.naam}</h1>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {product.beschrijving ?? 'Geen beschrijving'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-[10px] px-2 py-1 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                {product.categories?.naam ?? '—'}
              </span>
              <span className="text-[10px] px-2 py-1 rounded-lg bg-gray-50 font-mono text-gray-500 border border-gray-100">
                {locatie()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voorraad overzicht */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Huidige voorraad</p>
          <p className={`text-3xl font-bold leading-none ${
            status === 'laag' ? 'text-red-400' :
            status === 'bijna' ? 'text-amber-400' :
            'text-gray-800'
          }`}>
            {product.voorraad}
          </p>
          {status === 'laag' && <p className="text-[10px] text-red-400 mt-1.5 font-medium">Onder minimum!</p>}
          {status === 'bijna' && <p className="text-[10px] text-amber-400 mt-1.5 font-medium">Bijna op</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Minimum</p>
          <p className="text-3xl font-bold leading-none text-gray-800">{product.min_voorraad}</p>
          <p className="text-[10px] text-gray-300 mt-1.5">Minimumniveau</p>
        </div>
      </div>

      {/* Voorraad aanpassen */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
        <h2 className="text-sm font-semibold text-gray-800">Voorraad aanpassen</h2>

        {/* Handmatig + en - */}
        <div>
          <p className="text-xs text-gray-400 mb-3">Handmatig</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateVoorraad(product.voorraad - 1, `−1 → voorraad is nu ${product.voorraad - 1}`)}
              disabled={product.voorraad <= 0 || opslaan}
              className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 text-lg font-medium hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-gray-800">{product.voorraad}</span>
              <span className="text-xs text-gray-400 ml-1">stuks</span>
            </div>
            <button
              onClick={() => updateVoorraad(product.voorraad + 1, `+1 → voorraad is nu ${product.voorraad + 1}`)}
              disabled={opslaan}
              className="w-10 h-10 rounded-xl text-[#b7e4c7] text-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              +
            </button>
          </div>
        </div>

        <div className="border-t border-gray-50" />

        {/* Ontvangen */}
        <div>
          <p className="text-xs text-gray-400 mb-3">Ontvangen — voegt toe aan huidige voorraad</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={ontvangen}
              onChange={(e) => setOntvangen(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verwerkOntvangen()}
              placeholder="Aantal ontvangen..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-300 placeholder:text-gray-300"
            />
            <button
              onClick={verwerkOntvangen}
              disabled={!ontvangen || opslaan}
              className="px-4 py-2.5 rounded-lg text-xs font-medium text-[#b7e4c7] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90 flex items-center gap-1.5"
              style={{ background: 'var(--accent)' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M5 0v10M0 5h10" />
              </svg>
              Toevoegen
            </button>
          </div>
        </div>

        <div className="border-t border-gray-50" />

        {/* Besteld / verbruikt */}
        <div>
          <p className="text-xs text-gray-400 mb-3">Besteld / verbruikt — trekt af van huidige voorraad</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={besteld}
              onChange={(e) => setBesteld(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verwerkBesteld()}
              placeholder="Aantal besteld of verbruikt..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-300 placeholder:text-gray-300"
            />
            <button
              onClick={verwerkBesteld}
              disabled={!besteld || opslaan}
              className="px-4 py-2.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:bg-gray-200 flex items-center gap-1.5"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M0 5h10" />
              </svg>
              Aftrekken
            </button>
          </div>
        </div>

        {/* Melding */}
        {melding && (
          <div className={`text-xs px-3 py-2.5 rounded-lg ${
            melding === 'succes'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-500'
          }`}>
            {melding === 'succes' ? `✓ ${meldingTekst}` : `✗ ${meldingTekst}`}
          </div>
        )}
      </div>
    </div>
  )
}