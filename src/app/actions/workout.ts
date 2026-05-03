// src/app/actions/workout.ts
"use server"

import prisma from "@/src/lib/prisma"

interface WorkoutData {
  exerciseName: string;
  sets: number;
  reps: number;
  holdTimeSec: number;
}

export async function saveWorkoutLog(data: WorkoutData) {
  try {
    // สูตรคำนวณความก้าวหน้าเบื้องต้น
    const volumeScore = (data.reps * data.holdTimeSec * data.sets) / 10;

    const log = await prisma.workoutLog.create({
      data: {
        userId: "demo-user-01", // เปลี่ยนเป็นระบบ Auth จริงในอนาคต
        exerciseName: data.exerciseName,
        sets: data.sets,
        reps: data.reps,
        holdTimeSec: data.holdTimeSec,
        volumeScore: volumeScore,
      }
    });

    console.log("Saved to DB:", log);
    return { success: true, log };
  } catch (error) {
    console.error("Failed to save workout:", error);
    return { success: false, error: "ไม่สามารถบันทึกข้อมูลได้" };
  }
}