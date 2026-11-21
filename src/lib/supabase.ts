import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(rawUrl: string): string {
  return rawUrl
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '')
}

const rawEnvUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://nppbvfypztbsvleywctr.supabase.co'

const supabaseUrl = normalizeSupabaseUrl(rawEnvUrl)

const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_0XjNTrnRrVhXxmKKkEMB9g_CrxI0p94'
).trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null

export { supabaseUrl }
