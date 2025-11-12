import { cookies } from 'next/headers'
import { createServerComponentClient, createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import Card from '../../../components/Card'
import BrandList from '../../../components/BrandList'
import SubmitButton from '../../../components/SubmitButton'
import FlashBanner from '../../../components/FlashBanner'
import ResetOnSaved from '../../../components/ResetOnSaved'

export default async function FornecedoresPage({ searchParams }) {
  const saved = (searchParams?.saved || '') === '1'
  const errorMsg = (searchParams?.error || '').toString()

  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: cookieStore })

  const q = (searchParams?.q || '').toString()
  const page = parseInt((searchParams?.page || '1').toString()) || 1
  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let fornecedores = []
  let erro = null
  try {
    let query = supabase
      .from('fornecedores')
      .select('id, nome')
      .order('created_at', { ascending: false })

    if (q) {
      query = query.ilike('nome', `%${q}%`)
    }

    const { data, error } = await query.range(from, to)
    if (error) throw error
    fornecedores = data || []
  } catch (e) {
    erro = e.message
    fornecedores = []
  }

  async function createFornecedor(formData) {
    'use server'
    const supabaseAction = createServerActionClient({ cookies })
    const { data: userRes } = await supabaseAction.auth.getUser()
    const uid = userRes?.user?.id

    const nome = formData.get('nome')?.toString() || ''
    if (!uid || !nome) {
      redirect('/fornecedores?error=' + encodeURIComponent('Preencha o nome.'))
      return
    }

    const { error } = await supabaseAction
      .from('fornecedores')
      .insert({ user_id: uid, nome })

    if (error) {
      redirect('/fornecedores?error=' + encodeURIComponent(error.message || 'Falha ao criar fornecedor.'))
      return
    }

    redirect('/fornecedores?saved=1')
  }

  const items = fornecedores.map(f => ({ label: f.nome, value: '' }))

  const nextPage = page + 1
  const prevPage = page - 1

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-brand-black">Fornecedores</h1>

      {saved && (
        <FlashBanner message="Fornecedor criado com sucesso." variant="success" autoHideMs={4000} />
      )}
      {errorMsg && (
        <FlashBanner message={errorMsg} variant="error" autoHideMs={6000} />
      )}

      <Card title="Lista">
        <form className="mb-3 flex gap-2">
          <input defaultValue={q} name="q" placeholder="Buscar por nome" className="px-3 py-2 rounded border" />
          <button className="px-3 py-2 rounded bg-brand-black text-white" type="submit">Buscar</button>
        </form>
        {erro && <div className="mb-2 text-xs text-red-600">Erro ao carregar: {erro}</div>}
        <BrandList items={items} emptyText="Nenhum fornecedor encontrado." />
        <div className="mt-3 flex items-center gap-2">
          <a className="px-2 py-1 rounded border" href={`?q=${encodeURIComponent(q)}&page=${Math.max(prevPage, 1)}`}>Anterior</a>
          <span className="text-sm">Página {page}</span>
          <a className="px-2 py-1 rounded border" href={`?q=${encodeURIComponent(q)}&page=${nextPage}`}>Próxima</a>
        </div>
      </Card>

      <Card title="Criar Fornecedor">
        <ResetOnSaved saved={saved} formIds={["form-fornecedor"]} />
        <form id="form-fornecedor" action={createFornecedor} className="flex flex-col gap-2 max-w-md">
          <label className="text-sm text-brand-black">Nome</label>
          <input name="nome" type="text" placeholder="Nome" className="px-3 py-2 rounded border" />
          <SubmitButton>Salvar</SubmitButton>
        </form>
      </Card>
    </div>
  )
}