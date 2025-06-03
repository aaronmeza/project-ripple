// ============================================================
// 1) components/MainPlayer.tsx – large embed for selected video
// ------------------------------------------------------------
import VoteButton from '@/components/VoteButton'

interface Video {
  id: number
  title: string
  provider: string
  provider_id: string
  upvote_count: number
}

export default function MainPlayer({ video }: { video: Video }) {
  if (!video) return null
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{video.title}</h3>
        <VoteButton videoId={video.id} initialCount={video.upvote_count} />
      </div>
      <div className="aspect-video w-full overflow-hidden rounded-lg border">
        {video.provider === 'youtube' && (
          <iframe
            src={`https://www.youtube.com/embed/${video.provider_id}`}
            className="w-full h-full"
            allowFullScreen
          />
        )}
      </div>
    </div>
  )
}
