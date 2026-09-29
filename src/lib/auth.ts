import { createClient } from '@/lib/supabase/server'

/**
 * Server-side authorization guard for Server Actions and Route Handlers.
 * Verifies that the user has an active Supabase session before allowing sensitive mutations.
 */
export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      authorized: false as const,
      user: null,
      error: 'Unauthorized: Admin authentication required.',
    }
  }

  return {
    authorized: true as const,
    user,
    error: null,
  }
}
