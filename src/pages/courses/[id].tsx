// pages/courses/[id].tsx  – v1.3 with Back button
//------------------------------------------------------------
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface VideoRow {
  id: number;
  outcome_id: number;
  provider: string;
  provider_id: string;
  title: string;
  upvote_count: number;
}

interface OutcomeRow {
  id: number;
  code: string;
  title: string;
  top_video?: VideoRow | null;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [outcomes, setOutcomes] = useState<OutcomeRow[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);

      // 1. fetch course info
      const { data: courseRow, error: cErr } = await supabase
        .from('courses')
        .select('title')
        .eq('id', id)
        .single();
      if (cErr) console.error(cErr);
      setCourseTitle(courseRow?.title ?? '');

      // 2. fetch linked outcomes
      const { data: outcomeRows, error: ocErr } = await supabase
        .from('course_outcomes')
        .select(`outcome:outcome_id(id, code, title)`) // FK join
        .eq('course_id', id);
      if (ocErr) console.error(ocErr);

      const basic: OutcomeRow[] = (outcomeRows ?? [])
        .map((row: any) => {
          const o = row.outcome;
          if (!o) return null;
          return {
            id: o.id,
            code: o.code,
            title: o.title,
            top_video: null,
          } as OutcomeRow;
        })
        .filter(Boolean) as OutcomeRow[];

      // 3. fetch top‑voted video per outcome (if any)
      if (basic.length) {
        const outcomeIds = basic.map((o) => o.id);

        const { data: videoRows, error: vErr } = await supabase
          .from('videos')
          .select('id, outcome_id, provider, provider_id, title, upvote_count')
          .in('outcome_id', outcomeIds)
          .order('outcome_id', { ascending: true })
          .order('upvote_count', { ascending: false });

        if (vErr) console.error(vErr);

        // Reduce to top video per outcome
        const topMap = new Map<number, VideoRow>();
        (videoRows ?? []).forEach((v: VideoRow) => {
          if (!topMap.has(v.outcome_id)) topMap.set(v.outcome_id, v);
        });

        // merge into outcomes
        basic.forEach((o) => {
          o.top_video = topMap.get(o.id) ?? null;
        });
      }

      setOutcomes(basic);
      setLoading(false);
    })();
  }, [id]);

  return (
    <>
      <Head>
        <title>{`${courseTitle || 'Course'} – Databrook`}</title>
      </Head>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back to all courses */}
        <Link
          href="/courses"
          className="mb-4 inline-flex items-center text-sm text-emerald-700 hover:underline"
        >
          ← All Courses
        </Link>

        {loading && <p>Loading…</p>}

        {!loading && (
          <>
            <h1 className="mb-6 text-2xl font-bold text-gray-800">
              {courseTitle}
            </h1>

            {outcomes.length === 0 && <p>No outcomes linked yet.</p>}

            <ul className="space-y-4">
              {outcomes.map((o) => (
                <li key={o.id} className="rounded border p-4 hover:shadow">
                  <Link href={`/outcome/${o.id}?course=${id}`}>
                    <span className="font-medium text-emerald-700 hover:underline">
                      {o.code}: {o.title}
                    </span>
                  </Link>
                  {o.top_video && (
                    <p className="mt-2 text-sm text-gray-600">
                      📹 Top video: {o.top_video.title} ({o.top_video.upvote_count}
                      ×👍)
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
