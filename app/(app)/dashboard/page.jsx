import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

function toISODate(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  return d.toISOString().slice(0, 10)
}

function formatCurrencyBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: cookieStore })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const todayStr = toISODate(now)
  const startMonthStr = toISODate(startOfMonth)
  const endMonthStr = toISODate(endOfMonth)
  const next30 = new Date(now)
  next30.setDate(next30.getDate() + 30)
  const next30Str = toISODate(next30)

  // A Receber (Mês)
  let totalReceberMes = 0
  let erroReceberMes = null
  try {
    const { data: receberMes, error } = await supabase
      .from('vencimentos_receber')
      .select('valor')
      .eq('status_pagamento', 'Pendente')
      .gte('data_vencimento', startMonthStr)
      .lte('data_vencimento', endMonthStr)

    if (error) throw error
    totalReceberMes = (receberMes || []).reduce((acc, cur) => acc + Number(cur.valor || 0), 0)
  } catch (e) {
    erroReceberMes = e.message
    totalReceberMes = 0
  }

  // Pagamentos Atrasados (COUNT + SUM)
  let pagamentosAtrasadosCount = 0
  let pagamentosAtrasadosTotal = 0
  let erroAtrasados = null
  try {
    const { data: atrasados, error } = await supabase
      .from('vencimentos_receber')
      .select('valor, data_vencimento')
      .eq('status_pagamento', 'Pendente')
      .lt('data_vencimento', todayStr)

    if (error) throw error
    pagamentosAtrasadosCount = (atrasados || []).length
    pagamentosAtrasadosTotal = (atrasados || []).reduce((acc, cur) => acc + Number(cur.valor || 0), 0)
  } catch (e) {
    erroAtrasados = e.message
    pagamentosAtrasadosCount = 0
    pagamentosAtrasadosTotal = 0
  }

  // Próximos Eventos (30 dias)
  let proximosEventos = []
  let erroEventos = null
  try {
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('id, nome_evento, data_evento')
      .gte('data_evento', todayStr)
      .lte('data_evento', next30Str)
      .order('data_evento', { ascending: true })

    if (error) throw error
    proximosEventos = eventos || []
  } catch (e) {
    erroEventos = e.message
    proximosEventos = []
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-brand-black">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: A Receber (Mês) */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">A Receber (Mês)</div>
          <div className="mt-2 text-3xl font-bold text-brand-black">{formatCurrencyBRL(totalReceberMes)}</div>
          {erroReceberMes && (
            <div className="mt-2 text-xs text-red-600">Erro ao carregar: {erroReceberMes}</div>
          )}
        </div>

        {/* Card: Pagamentos Atrasados */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Pagamentos Atrasados</div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="text-3xl font-bold text-brand-black">{pagamentosAtrasadosCount}</div>
            <div className="text-gray-600">itens</div>
          </div>
          <div className="mt-1 text-lg">Total: <span className="text-brand-gold font-semibold">{formatCurrencyBRL(pagamentosAtrasadosTotal)}</span></div>
          {erroAtrasados && (
            <div className="mt-2 text-xs text-red-600">Erro ao carregar: {erroAtrasados}</div>
          )}
        </div>

        {/* Card: Próximos Eventos (30 dias) */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Próximos Eventos (30 dias)</div>
          <ul className="mt-3 space-y-2">
            {proximosEventos.length === 0 && (
              <li className="text-sm text-gray-400">Nenhum evento nos próximos 30 dias.</li>
            )}
            {proximosEventos.map((ev) => (
              <li key={ev.id} className="flex justify-between text-sm">
                <span className="font-medium text-brand-black">{ev.nome_evento}</span>
                <span className="text-brand-gold">{new Date(ev.data_evento + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              </li>
            ))}
          </ul>
          {erroEventos && (
            <div className="mt-2 text-xs text-red-600">Erro ao carregar: {erroEventos}</div>
          )}
        </div>
      </div>
    </div>
  )
}