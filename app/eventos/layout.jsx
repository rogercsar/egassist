import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export default async function EventosLayout({ children }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const nextPath = '/eventos';
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <section>
      {children}
    </section>
  );
}