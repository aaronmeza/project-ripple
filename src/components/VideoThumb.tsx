// components/VideoThumb.tsx
// ------------------------------------------------------------
// Small clickable thumbnail used in playlists / outcome lists.
// ------------------------------------------------------------
import Image from 'next/image';
import Link from 'next/link';
import VoteButton from '@/components/VoteButton';

// Type mirrors a row in public.videos joined with outcomes (optional)
export interface VideoRow {
  id: number;
  outcome_id: number;
  title: string;
  thumbnail?: string | null;
  provider: string;
  upvote_count: number;
}

interface Props {
  video: VideoRow;
  showVotes?: boolean;
  small?: boolean; // if true, renders 80px thumb instead of 160px
}

export default function VideoThumb({ video, showVotes = true, small = false }: Props) {
  const thumbSrc = video.thumbnail ?? "/placeholder-thumb.png";
  const size = small ? 80 : 160;

  return (
    <Link
      href={`/videos/${video.id}`}
      title={video.title}
      className="group flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <Image
          src={thumbSrc}
          alt={video.title}
          width={size}
          height={size}
          className="rounded-md object-cover group-hover:opacity-90"
        />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <h3 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {video.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {video.provider}
        </p>
        {showVotes && (
          <div className="mt-1">
            <VoteButton videoId={video.id} small />

          </div>
        )}
      </div>
    </Link>
  );
}
