import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url === 'your_supabase_project_url') {
    // Return a stub during build time — will be replaced with real client at runtime
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    )
  }

  return createBrowserClient(url, key)
}
