// ============================================================
// 3) components/AuthProvider.tsx – simple session context
// ------------------------------------------------------------
import { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session } from '@supabase/supabase-js'

export const AuthContext = createContext<{ session: Session | null }>({ session: null })

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(supabase.auth.getSession() || null)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
    })
    return () => listener?.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
}