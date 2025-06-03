// components/CourseCard.tsx  (safe destructuring)
// ------------------------------------------------------------
import Link from 'next/link';

export interface CourseSummary {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  outcomesCount?: number;
}

interface Props {
  course?: CourseSummary | null;
}

export default function CourseCard({ course }: Props) {
  if (!course) return null; // guard against undefined

  const { id, code, title, description, outcomesCount } = course;

  return (
    <Link href={`/courses/${id}`} className="block rounded-lg border border-gray-200 bg-white p-4 shadow hover:shadow-md">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500">{code}</p>
      {description && <p className="mt-2 line-clamp-3 text-sm text-gray-600">{description}</p>}
      {outcomesCount !== undefined && (
        <p className="mt-2 text-xs text-gray-400">{outcomesCount} outcomes</p>
      )}
    </Link>
  );
}
