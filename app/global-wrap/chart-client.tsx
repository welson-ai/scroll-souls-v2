"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Sparkles, TrendingUp, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import CheckInButton from "@/components/check-in-button"
import BottomNav from "@/components/bottom-nav"
import AppHeader from "@/components/app-header"

const EMOTION_COLORS = { ...same as before }

export default function ChartClient({ user, checkIns, totalUsers, emotions }) {
  const emotionCounts = {}
  checkIns?.forEach((c) => {
    const name = c.emotions?.name
    if (name) {
      emotionCounts[name] = emotionCounts[name] || { name, count: 0 }
      emotionCounts[name].count++
    }
  })

  const chartData = Object.values(emotionCounts).map((item) => ({
    name: item.name,
    value: item.count,
    color: EMOTION_COLORS[item.name] || "#94a3b8",
  }))

  const totalCheckIns = checkIns?.length || 0
  const topEmotion =
    chartData.length > 0
      ? chartData.reduce((prev, curr) => (prev.value > curr.value ? prev : curr))
      : null

  return (
    <>
      {/* Your exact JSX here */}
    </>
  )
}
