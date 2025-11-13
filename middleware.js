import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  const isProtected = (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/eventos') ||
    pathname.startsWith('/fornecedores') ||
    pathname.startsWith('/contratantes') ||
    pathname.startsWith('/modelos')
  )

  if (isProtected && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/eventos/:path*',
    '/fornecedores/:path*',
    '/contratantes/:path*',
    '/modelos/:path*',
  ],
}