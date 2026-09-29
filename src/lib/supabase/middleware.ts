import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const url = request.nextUrl.clone()

  // Protect all /admin/* routes
  if (url.pathname.startsWith('/admin')) {
    let user = null
    try {
      const { data, error } = await supabase.auth.getUser()
      if (!error && data) {
        user = data.user
      }
    } catch (err) {
      console.warn('Auth getUser in middleware warning:', err)
    }

    if (url.pathname !== '/admin/login') {
      if (!user) {
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
    }

    // Redirect already-authenticated users away from login
    if (url.pathname === '/admin/login' && user) {
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
