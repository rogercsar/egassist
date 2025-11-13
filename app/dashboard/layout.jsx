import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function DashboardLayout({ children }) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const nextPath = '/dashboard';
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <section>
      {children}
    </section>
  );
}