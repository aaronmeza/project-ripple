// pages/outcome/[id].tsx – outcome detail with video player + playlist + upvote
//------------------------------------------------------------
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaThumbsUp,
  FaRegThumbsUp,
  FaThumbsDown,
  FaRegThumbsDown,
} from 'react-icons/fa';


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
  const [user, setUser] = useState<User | null>(null);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [votePending, setVotePending] = useState(false);


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
    })();
    
  }, [id, user]);
  
  useEffect(() => {
  if (!selectedVideo || !user) return;

  const fetchVoteStatus = async () => {
    const { data, error } = await supabase
      .from('video_votes')
      .select('vote_type')
      .eq('user_id', user.id)
      .eq('video_id', selectedVideo.id)
      .maybeSingle();

    if (!error) {
      setVoteStatus(data?.vote_type ?? null);
    } else {
      console.error('Failed to fetch vote status:', error);
    }
  };

  fetchVoteStatus();
}, [selectedVideo, user]);

    useEffect(() => {
        if (!selectedVideo || !user) return;

        (async () => {
          const { data: existingVote } = await supabase
            .from('video_votes')
            .select('vote_type')
            .eq('user_id', user.id)
            .eq('video_id', id)
            .maybeSingle();

    setVoteStatus(existingVote?.vote_type ?? null);
  })();
}, [selectedVideo, user, id]);

  
  // Handle upvote/downvote
  // This function updates the vote status and counts both locally and in Supabase
  // It uses optimistic updates to ensure a smooth user experience
  // It also handles the case where the user clicks the same vote type again to remove their vote
  // The function calculates the new vote status and updates the counts accordingly
  // It also handles the case where the user clicks the same vote type again to remove their vote
  // The function uses a helper function to calculate the vote delta based on the current and new vote types
  // Finally, it sends the updated vote status to Supabase using an upsert operation
  // This ensures that the user's vote is recorded or updated correctly in the database
  // The function also handles any errors that may occur during the update process
  // It sets a loading state to prevent multiple clicks while the vote is being processed
  // The function is called when the user clicks the upvote or downvote button
  // It checks if the user is logged in and if a video is selected before proceeding
  // If the user is not logged in or no video is selected, it returns early to prevent any action
  // The function uses the `votePending` state to prevent multiple clicks while the vote is being processed
  // It calculates the new vote status based on the current vote status and the type of vote clicked
  // It updates the local state for the vote status and counts, as well as the video list
  // It then sends the updated vote status to Supabase using an upsert operation
  // If the update is successful, it updates the local state with the new vote status and counts
  // If there is an error, it logs the error message to the console
  // Finally, it resets the `votePending` state to allow further actions  
const handleVote = async (type: 'up' | 'down') => {
  if (votePending || !user || !selectedVideo) return;
  setVotePending(true);
  const currentVote = voteStatus;
  const isSameVote = currentVote === type;
  const newVote = isSameVote ? null : type;

  const getVoteDelta = (from: typeof currentVote, to: typeof newVote) => {
    let upChange = 0;
    let downChange = 0;

    if (from === 'up') upChange -= 1;
    if (from === 'down') downChange -= 1;

    if (to === 'up') upChange += 1;
    if (to === 'down') downChange += 1;

    return { upChange, downChange };
  };

  const { upChange, downChange } = getVoteDelta(currentVote, newVote);

  // Calculate new vote status and counts
  const updatedVoteStatus = newVote;
  const updatedUpvotes = selectedVideo.upvote_count + upChange;
  const updatedDownvotes = selectedVideo.downvote_count + downChange;

  // Apply all updates atomically
  setVoteStatus(updatedVoteStatus);

  setSelectedVideo((prev) =>
    prev
      ? {
          ...prev,
          upvote_count: updatedUpvotes,
          downvote_count: updatedDownvotes,
        }
      : prev
  );

  setVideos((prev) =>
    prev.map((v) =>
      v.id === selectedVideo.id
        ? {
            ...v,
            upvote_count: updatedUpvotes,
            downvote_count: updatedDownvotes,
          }
        : v
    )
  );

  // Send to Supabase
  const { error } = await supabase
    .from('video_votes')
    .upsert({
      user_id: user.id,
      video_id: selectedVideo.id,
      vote_type: newVote,
    });

  if (error) {
    console.error('Vote update failed:', error.message);
  }
  setVotePending(false);
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
            <h1 className="mb-2 text-2xl font-semibold text-white">{outcome.title}</h1>
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
                  {user && selectedVideo && (
  <div className="flex items-center space-x-6 border border-gray-200 rounded-full px-4 py-2 bg-gray-50 w-fit">
                          <button
                            disabled={votePending}
                            className={`flex items-center space-x-1 ${
                              voteStatus === 'up' ? 'text-blue-600' : 'text-gray-600'
                            }`}
                            onClick={() => handleVote('up')}
                          >
                            {voteStatus === 'up' ? <FaThumbsUp /> : <FaRegThumbsUp />}
                            <span>{selectedVideo.upvote_count}</span>
                          </button>

    <div className="h-6 w-px bg-gray-300" />

    <button disabled={votePending}
      className={`flex items-center space-x-1 ${
        voteStatus === 'down' ? 'text-gray-600' : 'text-gray-400'
      }`}
      onClick={() => handleVote('down')}
    >
      {voteStatus === 'down' ? <FaThumbsDown /> : <FaRegThumbsDown />}
                          </button>
                        </div>
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
                        className={`cursor-pointer flex gap-3 p-2 border rounded hover:bg-gray-50 transition ${selectedVideo?.id === v.id ? 'bg-emerald-50 border-emerald-400' : ''
                      }`}
                    >
                      <Image
                        src={getYoutubeThumbnail(v.provider_id)}
                        alt={v.title}
                        width={80}
                        height={56} // keep 16:9 ratio
                        className="object-cover rounded"
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
