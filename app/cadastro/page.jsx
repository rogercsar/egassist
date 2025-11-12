"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";



export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message || "Erro ao criar conta.");
      return;
    }
    setInfoMsg("Conta criada! Verifique seu e-mail para confirmar.");
    setTimeout(() => router.push("/login"), 2500);
  };

  const handleGoogle = async () => {
    setErrorMsg("");
    const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-center mb-4">
          <Image src="/egassist-logo.png" alt="EG Assist" width={160} height={42} />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 text-center">Criar conta</h1>
        <p className="mt-1 text-sm text-slate-600 text-center">Comece gratuitamente em poucos passos</p>

        <form className="mt-6 space-y-4" onSubmit={handleSignup}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome completo</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Seu nome" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="seu@email.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Senha</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">{loading ? "Criando..." : "Criar conta"}</button>
        </form>

        {errorMsg && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
        )}
        {infoMsg && (
          <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{infoMsg}</div>
        )}

        <div className="mt-4">
          <button onClick={handleGoogle} className="w-full border border-slate-300 text-slate-800 py-2 rounded-lg hover:bg-slate-100">Criar conta com Google</button>
        </div>

        <div className="mt-4 text-center text-sm text-slate-600">
          Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Entrar</Link>
        </div>
      </div>
    </div>
  );
}