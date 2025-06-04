// pages/outcome/[id].tsx – outcome detail with video player + playlist + upvote
//------------------------------------------------------------
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface VideoRow {
  id: number;
  provider: string;
  provider_id: string;
  title: string;
  upvote_count: number;
}

export default function OutcomeDetailPage() {
  const router = useRouter();
  const { id, course: courseId } = router.query as { id?: string; course?: string };

  const [outcome, setOutcome] = useState<{ id: number; code: string; title: string; description?: string | null } | null>(null);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      setUser(currentUser?.user ?? null);
    })();
  }, []);

  useEffect(() => {
    if (!id) return;
   
    (async () => {
      // fetch outcome
      const { data: oRow, error: oErr } = await supabase
        .from('outcomes')
        .select('id, code, title, description')
        .eq('id', id)
        .single();
      if (!oErr) setOutcome(oRow);

      // fetch all videos for this outcome ordered by up‑votes desc
      const { data: vRows } = await supabase
        .from('videos')
        .select('id, provider, provider_id, title, upvote_count')
        .eq('outcome_id', id)
        .order('upvote_count', { ascending: false });

      setVideos(vRows ?? []);
      setSelectedVideo((vRows && vRows[0]) || null);
      setLoading(false);

      //fetch user upvote status
       if (!user) return;
  (async () => {
    const { data: upvotedRows } = await supabase
      .from('video_upvotes')
      .select('video_id')
      .eq('user_id', user.id);

    setHasUpvoted(new Set(upvotedRows?.map((r) => r.video_id)));
  })();
    })();
  }, [id, user]);
  const [hasUpvoted, setHasUpvoted] = useState<Set<number>>(new Set());
  const handleUpvote = async (videoId: number) => {
  if (!user) return;

  const { error } = await supabase.rpc('increment_upvote', {
    vid: videoId,
    uid: user.id,
  });

  if (!error) {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, upvote_count: v.upvote_count + 1 } : v
      )
    );
    if (selectedVideo?.id === videoId) {
      setSelectedVideo({ ...selectedVideo, upvote_count: selectedVideo.upvote_count + 1 });
    }
    setHasUpvoted((prev) => new Set(prev).add(videoId));
  }
};


  const getYoutubeEmbedUrl = (videoId: string) => `https://www.youtube.com/embed/${videoId}`;
  const getYoutubeThumbnail = (videoId: string) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <>
      <Head>
        <title>{`${outcome?.code ?? 'Outcome'} – Databrook`}</title>
      </Head>
      <div className="mx-auto max-w-7xl px-4 py-20">
        {/* Back button */}
        <Link href={courseId ? `/courses/${courseId}` : '/courses'} className="mb-6 inline-block text-emerald-700 hover:underline">
          ← Back to {courseId ? 'Course' : 'Courses'}
        </Link>

        {loading ? (
          <p>Loading…</p>
        ) : outcome ? (
          <>
            <h1 className="mb-2 text-2xl font-semibold text-emerald-800">{outcome.title}</h1>
            {outcome.description && <p className="mb-6 opacity-80">{outcome.description}</p>}

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Video player */}
              <div className="flex-1">
                {selectedVideo ? (
                  <>
                    <div className="aspect-video mb-4">
                      <iframe
                        className="w-full h-full"
                        src={getYoutubeEmbedUrl(selectedVideo.provider_id)}
                        title={selectedVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {user && (
                      <button
                        onClick={() => handleUpvote(selectedVideo.id)}
                        className="mb-4 inline-block text-sm text-emerald-600 hover:underline"
                      >
                        ▲ Upvote ({selectedVideo.upvote_count})
                      </button>
                    )}
                  </>
                ) : (
                  <p>No video selected.</p>
                )}
              </div>

              {/* Playlist */}
              <div className="w-full lg:w-80">
                <h2 className="mb-2 text-lg font-semibold">Video Playlist</h2>
                <ul className="space-y-3">
                  {videos.map((v) => (
                    <li
                      key={v.id}
                      onClick={() => setSelectedVideo(v)}
                      className={`cursor-pointer flex gap-3 p-2 border rounded hover:bg-gray-50 transition ${
                        selectedVideo?.id === v.id ? 'bg-emerald-50 border-emerald-400' : ''
                      }`}
                    >
                      <img
                        src={getYoutubeThumbnail(v.provider_id)}
                        alt={v.title}
                        className="w-20 h-14 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-snug">{v.title}</p>
                        <p className="text-xs opacity-70">Up‑votes: {v.upvote_count}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p>Outcome not found.</p>
        )}
      </div>
    </>
  );
}
