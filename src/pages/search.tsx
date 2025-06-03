// pages/search.tsx – fixed ILIKE syntax
//------------------------------------------------------------
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import CourseCard, { CourseSummary } from '@/components/CourseCard';
import Link from 'next/link';

interface OutcomeRow {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  course?: {
    id: number;
    title: string;
  } | null;
}

export default function SearchResultsPage() {
  const router = useRouter();
  const { q } = router.query;
  const term = Array.isArray(q) ? q[0] : q ?? '';

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRow[]>([]);

  useEffect(() => {
    if (!term) return;

    const fetch = async () => {
      setLoading(true);

      // Courses ----------------------------------------------------------------
      const pattern = `*${term}*`;              // <-- star wildcards

      const { data: courseRows, error: courseErr } = await supabase
        .from('courses')
        .select('id, code, title, description')
        .or(
          `title.ilike.${pattern},description.ilike.${pattern},code.ilike.${pattern}`
        )
        .limit(20);


      if (courseErr) console.error(courseErr);
      setCourses(courseRows ?? []);

      // Outcomes ---------------------------------------------------------------
      const { data: outcomeRows, error: oErr } = await supabase
        .from('outcomes')
        .select(
          'id, code, title, description, course:course_outcomes!inner(course_id(id,title))'
        )
        .or(
          `title.ilike.${pattern},description.ilike.${pattern},code.ilike.${pattern}`
        );
      if (oErr) console.error(oErr);
      setOutcomes(outcomeRows ?? []);

      setLoading(false);
    };

    fetch();
  }, [term]);

  return (
    <>
      <Head>
        <title>Search – {term}</title>
      </Head>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800">
          Search results for “{term}”
        </h1>

        {loading && <p>Searching…</p>}

        {!loading && courses.length === 0 && outcomes.length === 0 && (
          <p>No matches found.</p>
        )}

        {courses.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Courses</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </section>
        )}

        {outcomes.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Outcomes</h2>
            <ul className="space-y-3">
              {outcomes.map((o) => (
                <li
                  key={o.id}
                  className="rounded border border-gray-200 p-3 hover:shadow"
                >
                  <Link href={`/outcomes/${o.id}`}>
                    <span className="font-medium text-emerald-700 hover:underline">
                      {o.title}
                    </span>
                  </Link>
                  {o.course && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Course: {o.course.title})
                    </span>
                  )}
                  {o.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {o.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
