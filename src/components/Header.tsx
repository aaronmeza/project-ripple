// components/Header.tsx  (v2 – wired search)
// ------------------------------------------------------------
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // track auth state
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    // initial load
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch('');
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-emerald-800 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold tracking-wide hover:text-gray-200">
          Databrook
        </Link>

        {/* Nav links */}
        <nav className="hidden gap-6 md:flex">
          <Link href="/diplomas" className="hover:text-gray-200">Diplomas</Link>
          <Link href="/courses" className="hover:text-gray-200">Courses</Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSubmit} className="hidden md:block">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="bg-transparent text-white placeholder-white border border-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-white w-56"
          />
        </form>

        {/* Auth */}
        {session ? (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="rounded border border-white px-3 py-1 text-sm hover:bg-white hover:text-emerald-600"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="rounded border border-white px-3 py-1 text-sm hover:bg-white hover:text-emerald-600"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
