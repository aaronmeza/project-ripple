// ============================================================
// 2) components/VideoCard.tsx – list item (small thumbnail)
// ------------------------------------------------------------
interface Video {
  id: number
  title: string
  provider: string
  provider_id: string
  upvote_count: number
}

export default function VideoCard({ video, isActive, onSelect }: { video: Video; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full space-x-3 p-2 rounded-lg text-left hover:bg-slate-50 ${
        isActive ? 'bg-slate-100 border' : ''
      }`}
    >
      <img
        src={`https://img.youtube.com/vi/${video.provider_id}/default.jpg`}
        alt="thumb"
        className="w-20 h-14 object-cover rounded"
      />
      <div className="flex-1">
        <p className="text-sm font-medium line-clamp-2">{video.title}</p>
        <p className="text-xs text-gray-500">▲ {video.upvote_count}</p>
      </div>
    </button>
  )
}