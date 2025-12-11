"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CheckInData {
  userId: string
  emotionId: string
  intensity: number
  triggers: string[]
}

export async function saveCheckIn(data: CheckInData) {
  const supabase = await createClient()

  try {
    // Insert check-in
    const { data: checkIn, error: checkInError } = await supabase
      .from("check_ins")
      .insert({
        user_id: data.userId,
        emotion_id: data.emotionId,
        intensity: data.intensity,
        triggers: data.triggers,
      })
      .select()
      .single()

    if (checkInError) throw checkInError

    // Update streak and XP
    const { data: streakResult, error: streakError } = await supabase.rpc("update_user_streak", {
      p_user_id: data.userId,
    })

    if (streakError) {
      console.error("[v0] Error updating streak:", streakError)
    }

    // Add XP for check-in (10 XP per check-in)
    const { data: xpResult, error: xpError } = await supabase.rpc("add_user_xp", {
      p_user_id: data.userId,
      p_xp_amount: 10,
    })

    if (xpError) {
      console.error("[v0] Error adding XP:", xpError)
    }

    // Check and award badges
    const { data: badges, error: badgesError } = await supabase.rpc("check_and_award_badges", {
      p_user_id: data.userId,
    })

    if (badgesError) {
      console.error("[v0] Error checking badges:", badgesError)
    }

    revalidatePath("/check-in")
    revalidatePath("/analytics")
    revalidatePath("/profile")

    return {
      success: true,
      checkInId: checkIn.id,
      newBadges: badges || [],
      levelUp: xpResult?.[0]?.level_up || false,
    }
  } catch (error) {
    console.error("[v0] Error in saveCheckIn:", error)
    return { success: false, error: "Failed to save check-in" }
  }
}
