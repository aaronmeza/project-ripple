// pages/login.tsx – dedicated sign‑in page
//------------------------------------------------------------
import Head from 'next/head';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Sign In – Databrook</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <Auth
            supabaseClient={supabase}
            providers={["google"]}
            appearance={{ theme: ThemeSupa }}
            theme="default"
          />
        </div>
      </div>
    </>
  );
}
