import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Sparkles, TrendingUp, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import CheckInButton from "@/components/check-in-button"
import BottomNav from "@/components/bottom-nav"
import AppHeader from "@/components/app-header"

const EMOTION_COLORS = {
  Joy: "#fde047",
  Sadness: "#60a5fa",
  Anger: "#f87171",
  Fear: "#a78bfa",
  Stress: "#fb923c",
  Peace: "#14b8a6",
  Love: "#f472b6",
  Tired: "#a8a29e",
}

export default async function GlobalWrapPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get global emotion stats
  const { data: globalStats } = await supabase.rpc("get_global_emotion_stats")

  // Get all emotions for check-in
  const { data: emotions } = await supabase.from("emotions").select("*").order("name")

  // Get total users and check-ins
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalCheckIns } = await supabase.from("check_ins").select("*", { count: "exact", head: true })

  // Transform data for pie chart
  const chartData =
    globalStats?.map((stat: any) => ({
      name: stat.emotion_name,
      value: stat.count,
      color: EMOTION_COLORS[stat.emotion_name as keyof typeof EMOTION_COLORS] || "#94a3b8",
    })) || []

  const topEmotion =
    chartData.length > 0
      ? chartData.reduce((prev: any, current: any) => (prev.value > current.value ? prev : current))
      : null

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
        <AppHeader title="Global Emotion Wrap" showBack={false} />

        <div className="mx-auto max-w-4xl space-y-6 p-4">
          {/* Hero Section */}
          <div className="glass rounded-3xl p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-3">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-balance">How is the world feeling today?</h1>
            <p className="text-muted-foreground text-balance">Real-time emotional pulse from our global community</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="glass border-0 p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{totalUsers?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Soul Members</p>
                </div>
              </div>
            </Card>

            <Card className="glass border-0 p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{totalCheckIns?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Emotions Logged</p>
                </div>
              </div>
            </Card>

            <Card className="glass border-0 p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{topEmotion?.name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">Top Emotion</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Pie Chart */}
          {chartData.length > 0 ? (
            <Card className="glass border-0 p-6">
              <h2 className="mb-6 text-center text-xl font-bold">Global Emotion Distribution</h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          ) : (
            <Card className="glass border-0 p-12 text-center">
              <p className="text-muted-foreground">No global data yet. Be the first to check in!</p>
            </Card>
          )}

          {/* CTA */}
          <div className="glass rounded-3xl p-8 text-center">
            <h3 className="mb-2 text-xl font-bold">How are you feeling today?</h3>
            <p className="mb-6 text-muted-foreground text-balance">Your emotions matter. Share them with the world.</p>
            <CheckInButton emotions={emotions || []} userId={user.id} label="Check in Now" />
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  )
}
