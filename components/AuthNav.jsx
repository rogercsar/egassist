"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function AuthNav() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-slate-700 hover:text-slate-900">Entrar</Link>
        <Link href="/cadastro" className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">Criar conta</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/eventos" className="text-slate-700 hover:text-slate-900">Minha conta</Link>
      <button onClick={handleSignOut} className="px-3 py-2 rounded border border-slate-300 text-slate-800 hover:bg-slate-100">Sair</button>
    </div>
  );
}