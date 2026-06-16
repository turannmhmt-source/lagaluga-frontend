import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ffbtiktwzrlzlndfnyzy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmYnRpa3R3enJsemxuZGZueXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDUwMzgsImV4cCI6MjA5NjkyMTAzOH0.88tvA2bJF3pv3TaUwOMTkn4PFGHjZcI8otUGJhZm8pk'

let _client: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return _client
}
