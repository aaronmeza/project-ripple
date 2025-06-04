// 6) components/VoteButton.tsx – live voting logic
// ------------------------------------------------------------
import { useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { AuthContext } from '@/components/AuthProvider'

interface VoteButtonProps {
  videoId: number
  initialCount: number
}

export default function VoteButton({ videoId, initialCount }: VoteButtonProps) {
  const { session } = useContext(AuthContext)
  const userId = session?.user?.id
  const [count, setCount] = useState(initialCount)
  const [voted, setVoted] = useState(false)

  // fetch existing vote
  useEffect(() => {
    if (!userId) return
    supabase
      .from('votes')
      .select('value')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .single()
      .then(({ data }) => setVoted(!!data))
  }, [userId, videoId])

  // realtime subscription to vote changes for this video
  useEffect(() => {
    const channel = supabase
      .channel('public:videos')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'videos', filter: `id=eq.${videoId}` },
        (payload) => {

          setCount(payload.new.upvote_count)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [videoId])

  async function toggleVote() {
    if (!userId) return alert('Please sign in to vote.')
    if (voted) {
      // remove vote
      await supabase.from('votes').delete().eq('user_id', userId).eq('video_id', videoId)
      setVoted(false)
      setCount((c) => c - 1)
    } else {
      await supabase.from('votes').upsert({ user_id: userId, video_id: videoId, value: 1 })
      setVoted(true)
      setCount((c) => c + 1)
    }
  }

  return (
    <button
      onClick={toggleVote}
      className={`px-3 py-1 rounded-full text-sm border ${voted ? 'bg-green-600 text-white' : 'bg-white'} `}
    >
      ▲ {count}
    </button>
  )
}
