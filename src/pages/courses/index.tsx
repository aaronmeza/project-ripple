// pages/courses/index.tsx
// ------------------------------------------------------------
// Course catalogue page → routes to /courses
// ------------------------------------------------------------
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import CourseCard, { CourseSummary } from '@/components/CourseCard';

type CourseWithOutcomeCount = {
  id: number;
  title: string;
  description?: string;
  outcomesCount?: {
    count: number;
  } | null;
};


export default function CourseListPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select(
          `id, code, title, description, outcomesCount:course_outcomes(count)`
        )
        .order('code');

      if (error) {
        setError(error.message);
      } else if (data) {
        // Map Supabase nested count to flat number
        const mapped = data.map((c: CourseWithOutcomeCount) => ({
          ...c,
          outcomesCount: c.outcomesCount?.count ?? 0,
        }));
        setCourses(mapped as CourseSummary[]);
      }
      setLoading(false);
    }

    fetchCourses();
  }, []);

  return (
    <>
      <Head>
        <title>Courses | Databrook</title>
      </Head>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Courses</h1>

        {loading && <p>Loading…</p>}
        {error && (
          <p className="text-red-600">Error loading courses: {error}</p>
        )}

        {!loading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
