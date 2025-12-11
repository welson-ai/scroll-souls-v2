import { createClient } from "@supabase/supabase-js"

// Service client bypasses RLS for admin operations
export function createServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
