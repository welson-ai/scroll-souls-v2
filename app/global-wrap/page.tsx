import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ChartClient from "./chart-client"

export const dynamic = "force-dynamic"

export default async function GlobalWrapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("emotion_id, emotions(id, name)")

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { data: emotions } = await supabase
    .from("emotions")
    .select("*")
    .order("name")

  return (
    <ChartClient
      user={user}
      checkIns={checkIns}
      totalUsers={totalUsers}
      emotions={emotions}
    />
  )
}
