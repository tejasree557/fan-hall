import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ensureSupabaseConfigured } from './supabaseClient'

export async function getStoryById(id: string) {
  const supabase = ensureSupabaseConfigured()
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Failed to fetch story:', error)
    return null
  }

  return data
}

