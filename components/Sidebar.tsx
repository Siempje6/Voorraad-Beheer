'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: 'Menu',
    items: [
      {
        href: '/',
        label: 'Dashboard',
        icon: (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
        ),
      },
      {
        href: '/producten',
        label: 'Producten',
        badge: '248',
        icon: (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4" />
            <path d="M10 10l4 4" />
          </svg>
        ),
      },
      {
        href: '/stellingen',
        label: 'Stellingen',
        icon: (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="2" rx="1" />
            <rect x="1" y="7" width="14" height="2" rx="1" />
            <rect x="1" y="12" width="14" height="2" rx="1" />
          </svg>
        ),
      },
      {
        href: '/categorieen',
        label: 'Categorieën',
        icon: (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4h12M2 8h8M2 12h10" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        href: '/inloggen',
        label: 'Inloggen',
        icon: (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="5" r="3" />
            <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" />
          </svg>
        ),
      },
      {
        href: '/instellingen',
        label: 'Instellingen',
        icon: (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" />
          </svg>
        ),
      },
    ],
  },
]

export default function Sidebar() {
  const [mini, setMini] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-gray-100 transition-all duration-200
        ${mini ? 'w-14' : 'w-56'}
      `}
    >
      {/* Logo + toggle knop */}
      <div className={`flex items-center border-b border-gray-100 h-14 px-3 ${mini ? 'justify-center' : 'justify-between'}`}>
        {!mini && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="#b7e4c7">
                <rect x="0" y="0" width="5.5" height="5.5" rx="1" />
                <rect x="8.5" y="0" width="5.5" height="5.5" rx="1" />
                <rect x="0" y="8.5" width="5.5" height="5.5" rx="1" />
                <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">Voorraad</span>
          </div>
        )}
        <button
          onClick={() => setMini(!mini)}
          className="w-6 h-6 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            width="10" height="10" viewBox="0 0 10 10"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ transform: mini ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M7 2L3 5l4 3" />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-5 overflow-hidden">
        {navItems.map((section) => (
          <div key={section.label}>
            {!mini && (
              <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest px-2 pt-3 pb-1">
                {section.label}
              </p>
            )}
            {mini && <div className="h-3" />}

            {section.items.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-4 rounded-lg px-3 py-2.5 text-[13px] transition-colors
                    ${mini ? 'justify-center' : ''}
                    ${active
                      ? 'font-medium'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                    }
                  `}
                  style={active ? {
                    background: 'var(--accent-bg)',
                    color: 'var(--accent-text)',
                  } : {}}
                  title={mini ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!mini && (
                    <>
                      <span>{item.label}</span>
                      {'badge' in item && item.badge && (
                        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-[#b7e4c7]" style={{ background: 'var(--accent)' }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}