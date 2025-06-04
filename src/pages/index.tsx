// ============================================================
// Project Ripple – Next.js + Supabase starter  (v1.3 – marketing index)
// ============================================================
// File: src/pages/index.tsx
// Description: Public landing page + inline Sign‑In/Sign‑Up using @supabase/auth-ui-react.
// ============================================================
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function Home() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <>
      <Head>
        <title>Databrook | Knowledge in Motion</title>
        <meta name="description" content="Graduate‑level learning meets community explainers and AI‑adaptive paths." />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white py-24">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Knowledge in Motion</h1>
          <p className="text-lg md:text-2xl mb-10">
            Graduate‑school rigor meets Khan Academy simplicity—powered by a community of mentors and adaptive AI.
          </p>
          {!session ? (
            <button
              onClick={() => setShowAuth(true)}
              className="px-8 py-4 bg-white text-emerald-800 font-semibold rounded-lg shadow-lg hover:shadow-xl transition"
            >
              Join the Flow
            </button>
          ) : (
            <Link
              href="/outcome/1" // TODO: maybe redirect to first outcome list
              className="px-8 py-4 bg-white text-emerald-800 font-semibold rounded-lg shadow-lg hover:shadow-xl transition"
            >
              Enter Databrook
            </Link>
          )}
        </div>
      </section>

      {/* Inline Auth Modal */}
      {showAuth && !session && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={["google"]}
              redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/` : ''}
            />
          </div>
        </div>
      )}

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl text-white font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="font-semibold text-xl mb-4">Micro‑Outcomes</h3>
              <p>Each formal curriculum is distilled into bite‑size learning outcomes—so you can master concepts one ripple at a time.</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="font-semibold text-xl mb-4">Community Explainers</h3>
              <p>Upload or link concise videos; up‑votes surface the clearest explanations so everyone benefits.</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="font-semibold text-xl mb-4">AI‑Adaptive Paths</h3>
              <p>Our engine learns your style—visual, verbal, practice‑driven—and recommends the next best explainer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-8 text-center text-sm">
        © {new Date().getFullYear()} Databrook – Pursuing full accreditation
      </footer>
    </>
  );
}
