'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Profiel {
    id: string
    rol: 'medewerker' | 'admin' | 'werkgever'
}

interface AuthContext {
    user: User | null
    profiel: Profiel | null
    loading: boolean
    uitloggen: () => Promise<void>
}

const AuthContext = createContext<AuthContext>({
    user: null,
    profiel: null,
    loading: true,
    uitloggen: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profiel, setProfiel] = useState<Profiel | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null)
            if (data.session?.user) laadProfiel(data.session.user.id)
            else setLoading(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) laadProfiel(session.user.id)
            else { setProfiel(null); setLoading(false) }
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    async function laadProfiel(userId: string) {
        const { data } = await supabase
            .from('profielen')
            .select('*')
            .eq('id', userId)
            .single()

        setProfiel(data ?? null)
        setLoading(false)
    }

    async function uitloggen() {
        await supabase.auth.signOut({ scope: 'local' })
        setProfiel(null)
        setUser(null)
        // Wis alle cookies door naar een speciale route te gaan
        window.location.href = '/uitloggen'
    }

    return (
        <AuthContext.Provider value={{ user, profiel, loading, uitloggen }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}