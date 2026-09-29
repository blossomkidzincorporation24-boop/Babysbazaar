'use server'

import { createClient } from '@/lib/supabase/server'

export async function logActivity(action: string, entity_type: string, entity_id: string | null, description: string) {
  const supabase = await createClient()
  
  // Get admin ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Insert log
  await supabase.from('activity_logs').insert({
    admin_id: user.id,
    action,
    entity_type,
    entity_id,
    description
  })
}
