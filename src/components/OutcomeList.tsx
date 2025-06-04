// ============================================================
// 5) components/OutcomeList.tsx – simple viewer
// ------------------------------------------------------------
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface Outcome {
  id: number
  code: string
  title: string
}

export default function OutcomeList() {
  const [outcomes, setOutcomes] = useState<Outcome[]>([])

  useEffect(() => {
    supabase
      .from('outcomes')
      .select<Outcome>('id, code, title')
      .order('code')
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setOutcomes(data ?? [])
      })
  }, [])

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Outcome Explorer</h1>
      <ul className="space-y-3">
        {outcomes.map((o) => (
          <li key={o.id} className="border p-4 rounded-xl hover:bg-slate-50">
            <Link href={`/outcome/${o.id}`}>{o.code} – {o.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}