import { cookies } from 'next/headers'
import { createServerComponentClient, createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import Card from '../../../components/Card'
import BrandList from '../../../components/BrandList'
import SubmitButton from '../../../components/SubmitButton'
import FlashBanner from '../../../components/FlashBanner'
import ResetOnSaved from '../../../components/ResetOnSaved'

function toISODate(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  return d.toISOString().slice(0, 10)
}

export default async function EventosPage({ searchParams }) {
  const saved = (searchParams?.saved || '') === '1'
  const errorMsg = (searchParams?.error || '').toString()

  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: cookieStore })

  const now = new Date()
  const todayStr = toISODate(now)
  const next30 = new Date(now)
  next30.setDate(next30.getDate() + 30)
  const next30Str = toISODate(next30)

  let eventos = []
  let erroEventos = null
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('id, nome_evento, data_evento, valor_total_receber')
      .gte('data_evento', todayStr)
      .lte('data_evento', next30Str)
      .order('data_evento', { ascending: true })
    if (error) throw error
    eventos = data || []
  } catch (e) {
    erroEventos = e.message
    eventos = []
  }

  let contratantes = []
  try {
    const { data } = await supabase
      .from('contratantes')
      .select('id, nome')
      .order('nome', { ascending: true })
    contratantes = data || []
  } catch {}

  async function createEvento(formData) {
    'use server'
    const supabaseAction = createServerActionClient({ cookies })
    const { data: userRes } = await supabaseAction.auth.getUser()
    const uid = userRes?.user?.id

    const nome = formData.get('nome')?.toString() || ''
    const data = formData.get('data')?.toString() || ''
    const valor = parseFloat(formData.get('valor')?.toString() || '0')
    const contratanteId = formData.get('contratante_id')?.toString() || ''

    if (!uid || !nome || !data || !Number.isFinite(valor)) {
      redirect('/eventos?error=' + encodeURIComponent('Preencha os campos obrigatórios.'))
      return
    }

    const payload = { user_id: uid, nome_evento: nome, data_evento: data, valor_total_receber: valor }
    if (contratanteId) payload.contratante_id = contratanteId

    const { error } = await supabaseAction
      .from('eventos')
      .insert(payload)

    if (error) {
      redirect('/eventos?error=' + encodeURIComponent(error.message || 'Falha ao criar evento.'))
      return
    }

    redirect('/eventos?saved=1')
  }

  const proximos = eventos.map(ev => ({
    label: ev.nome_evento,
    value: `${new Date(ev.data_evento + 'T00:00:00').toLocaleDateString('pt-BR')} • ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(ev.valor_total_receber || 0))}`
  }))

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-brand-black">Eventos</h1>

      {saved && (
        <FlashBanner message="Evento criado com sucesso." variant="success" autoHideMs={4000} />
      )}
      {errorMsg && (
        <FlashBanner message={errorMsg} variant="error" autoHideMs={6000} />
      )}

      <Card title="Próximos Eventos" subtitle="30 dias">
        {erroEventos && (
          <div className="mb-2 text-xs text-red-600">Erro ao carregar: {erroEventos}</div>
        )}
        <BrandList items={proximos} emptyText="Nenhum evento próximo." />
      </Card>

      <Card title="Criar Evento">
        <ResetOnSaved saved={saved} formIds={["form-evento"]} />
        <form id="form-evento" action={createEvento} className="flex flex-col gap-2 max-w-md">
          <label className="text-sm text-brand-black">Nome do evento</label>
          <input name="nome" type="text" placeholder="Nome do evento" className="px-3 py-2 rounded border" />
          <label className="text-sm text-brand-black">Data</label>
          <input name="data" type="date" className="px-3 py-2 rounded border" />
          <label className="text-sm text-brand-black">Valor total a receber</label>
          <input name="valor" type="number" step="0.01" placeholder="0,00" className="px-3 py-2 rounded border" />
          <label className="text-sm text-brand-black">Contratante (opcional)</label>
          <select name="contratante_id" className="px-3 py-2 rounded border">
            <option value="">Selecionar...</option>
            {contratantes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <SubmitButton>Salvar</SubmitButton>
        </form>
      </Card>
    </div>
  )
}