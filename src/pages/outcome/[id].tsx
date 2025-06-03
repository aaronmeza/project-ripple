// ============================================================
// 3) pages/outcome/[id].tsx – playlist UI (top voted default)
// ------------------------------------------------------------
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import MainPlayer from '@/components/MainPlayer'
import VideoCard from '@/components/VideoCard'

interface Outcome {
  id: number
  title: string
  description: string | null
}
interface Video {
  id: number
  title: string
  provider: string
  provider_id: string
  upvote_count: number
}

export default function OutcomePage() {
  const { query } = useRouter()
  const { id } = query
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [selected, setSelected] = useState<Video | null>(null)

  // fetch outcome + videos (no need to filter – DB enforces uniqueness)
  useEffect(() => {
    if (!id) return
    ;(async () => {
      const { data: out } = await supabase.from<Outcome>('outcomes').select('*').eq('id', id).single()
      setOutcome(out)

      const { data: vids } = await supabase
        .from<Video>('videos')
        .select('*')
        .eq('outcome_id', id)
        .order('upvote_count', { ascending: false })
      setVideos(vids ?? [])
      if (vids && vids.length > 0) setSelected(vids[0])
    })()
  }, [id])

  if (!outcome) return null

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold mb-1">{outcome.title}</h1>
        {outcome.description && (
          <p className="text-gray-600 max-w-prose whitespace-pre-line">{outcome.description}</p>
        )}
      </header>

      <div className="md:flex md:space-x-8">
        {/* Main player */}
        <div className="md:flex-1">
          {selected ? <MainPlayer video={selected} /> : <p>No videos yet—be the first to upload!</p>}
        </div>

        {/* Playlist */}
        {videos.length > 0 && (
          <aside className="mt-8 md:mt-0 md:w-72 space-y-2 h-[70vh] overflow-y-auto">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                isActive={v.id === selected?.id}
                onSelect={() => setSelected(v)}
              />
            ))}
          </aside>
        )}
      </div>
    </div>
  )
}
