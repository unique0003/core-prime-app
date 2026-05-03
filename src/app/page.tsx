// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { saveWorkoutLog } from "./actions/workout";

type Phase = "idle" | "ready" | "squeeze" | "rest" | "break" | "finished";
type ExerciseType = "Kegel" | "Plank" | "Glute Bridge" | null;

export default function CorePrimeApp() {
  // --- States ---
  const [exercise, setExercise] = useState<ExerciseType>(null);
  const [holdTime, setHoldTime] = useState(5);
  const [restTime, setRestTime] = useState(5);
  const [totalReps, setTotalReps] = useState(10);
  const [totalSets, setTotalSets] = useState(3);

  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- Logic Timer ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      transitionPhase();
    }
    return () => clearTimeout(timer);
  }, [isRunning, timeLeft]);

  const transitionPhase = async () => {
    switch (phase) {
      case "ready":
        setPhase("squeeze");
        setTimeLeft(holdTime);
        break;
      case "squeeze":
        setPhase("rest");
        setTimeLeft(restTime);
        break;
      case "rest":
        if (currentRep < totalReps) {
          setCurrentRep((r) => r + 1);
          setPhase("squeeze");
          setTimeLeft(holdTime);
        } else {
          if (currentSet < totalSets) {
            setPhase("break");
            setTimeLeft(30);
          } else {
            // จบการออกกำลังกาย
            setPhase("finished");
            setIsRunning(false);
            setIsSaving(true);
            
            // ส่งข้อมูลไปบันทึกที่ Database
            if (exercise) {
              await saveWorkoutLog({
                exerciseName: exercise,
                sets: totalSets,
                reps: totalReps,
                holdTimeSec: holdTime,
              });
            }
            setIsSaving(false);
          }
        }
        break;
      case "break":
        setCurrentSet((s) => s + 1);
        setCurrentRep(1);
        setPhase("ready");
        setTimeLeft(3);
        break;
    }
  };

  // --- Controls ---
  const selectExercise = (name: ExerciseType) => {
    setExercise(name);
    // ปรับค่าตั้งต้นตามท่า
    if (name === "Plank") { setHoldTime(30); setTotalReps(1); }
    if (name === "Kegel") { setHoldTime(5); setTotalReps(15); }
    if (name === "Glute Bridge") { setHoldTime(3); setTotalReps(12); }
  };

  const startWorkout = () => {
    if (phase === "idle" || phase === "finished") {
      setCurrentRep(1); setCurrentSet(1); setPhase("ready"); setTimeLeft(3);
    }
    setIsRunning(true);
  };

  const resetWorkout = () => {
    setIsRunning(false); setPhase("idle"); setTimeLeft(0); setCurrentRep(0); setCurrentSet(1);
  };

  // --- UI Colors ---
  const getPhaseStyles = () => {
    switch (phase) {
      case "ready": return "bg-amber-400 text-white";
      case "squeeze": return "bg-rose-500 text-white";
      case "rest": return "bg-emerald-500 text-white";
      case "break": return "bg-sky-500 text-white";
      case "finished": return "bg-indigo-600 text-white";
      default: return "bg-slate-900 text-white"; // Dark mode theme
    }
  };

  // --- Views ---
  // View 1: หน้าเลือกท่า (Dashboard)
  if (!exercise) {
    return (
      <main className="min-h-screen bg-slate-900 flex flex-col items-center p-6 text-slate-100">
        <h1 className="text-3xl font-extrabold mt-10 mb-2 bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">CorePrime</h1>
        <p className="text-slate-400 mb-10 text-center">เลือกระบบปฏิบัติการของร่างกายคุณ</p>
        
        <div className="w-full max-w-md space-y-4">
          <button onClick={() => selectExercise("Kegel")} className="w-full p-6 bg-slate-800 rounded-2xl border border-slate-700 hover:border-orange-500 transition-all text-left group">
            <h2 className="text-xl font-bold group-hover:text-orange-400">1. Kegel Exercise</h2>
            <p className="text-sm text-slate-400 mt-2">บริหารอุ้งเชิงกราน (หัวใจสำคัญของความอึด)</p>
          </button>
          <button onClick={() => selectExercise("Glute Bridge")} className="w-full p-6 bg-slate-800 rounded-2xl border border-slate-700 hover:border-orange-500 transition-all text-left group">
            <h2 className="text-xl font-bold group-hover:text-orange-400">2. Glute Bridge</h2>
            <p className="text-sm text-slate-400 mt-2">สร้างความแข็งแกร่งและแรงส่ง (Thrust Power)</p>
          </button>
          <button onClick={() => selectExercise("Plank")} className="w-full p-6 bg-slate-800 rounded-2xl border border-slate-700 hover:border-orange-500 transition-all text-left group">
            <h2 className="text-xl font-bold group-hover:text-orange-400">3. Plank Core</h2>
            <p className="text-sm text-slate-400 mt-2">สร้างความทนทานแกนกลาง ไม่เหนื่อยง่าย</p>
          </button>
        </div>
      </main>
    );
  }

  // View 2: หน้า Tracker
  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-700 ease-in-out ${getPhaseStyles()}`}>
      <div className="absolute top-6 left-6">
        {phase === "idle" && (
          <button onClick={() => setExercise(null)} className="text-sm font-bold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            ← กลับ
          </button>
        )}
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <h2 className="text-2xl font-bold text-center mb-6">{exercise} Tracker</h2>

        {phase === "idle" && (
          <div className="grid grid-cols-2 gap-4 mb-6 text-slate-900">
            <div>
               <label className="block text-xs font-semibold text-white/70 mb-1">เวลาเกร็ง (วิ)</label>
               <input type="number" min="1" value={holdTime} onChange={(e) => setHoldTime(Number(e.target.value))} className="w-full p-3 rounded-xl outline-none" />
            </div>
            <div>
               <label className="block text-xs font-semibold text-white/70 mb-1">เวลาพัก (วิ)</label>
               <input type="number" min="1" value={restTime} onChange={(e) => setRestTime(Number(e.target.value))} className="w-full p-3 rounded-xl outline-none" />
            </div>
            <div>
               <label className="block text-xs font-semibold text-white/70 mb-1">ครั้ง/เซต</label>
               <input type="number" min="1" value={totalReps} onChange={(e) => setTotalReps(Number(e.target.value))} className="w-full p-3 rounded-xl outline-none" />
            </div>
            <div>
               <label className="block text-xs font-semibold text-white/70 mb-1">จำนวนเซต</label>
               <input type="number" min="1" value={totalSets} onChange={(e) => setTotalSets(Number(e.target.value))} className="w-full p-3 rounded-xl outline-none" />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl mb-6 text-white/90">
          <div className="text-center w-full">
            <p className="text-xs font-semibold opacity-70">ครั้งที่</p>
            <p className="text-xl font-bold">{phase === "idle" ? 0 : currentRep} / {totalReps}</p>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center w-full">
            <p className="text-xs font-semibold opacity-70">เซตที่</p>
            <p className="text-xl font-bold">{currentSet} / {totalSets}</p>
          </div>
        </div>

        <div className="text-center py-10 mb-6 rounded-3xl bg-black/10">
          <h2 className="text-3xl font-black tracking-widest mb-2 uppercase">
            {phase === "idle" ? "พร้อมลุย?" : phase === "squeeze" ? "เกร็ง!" : phase === "rest" ? "พัก" : phase === "finished" ? "เยี่ยมมาก!" : "เตรียมตัว"}
          </h2>
          <div className="text-8xl font-bold tabular-nums">
            {phase === "idle" ? holdTime : timeLeft}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {!isRunning ? (
            <button onClick={startWorkout} disabled={isSaving} className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 disabled:opacity-50">
              {isSaving ? "กำลังบันทึกข้อมูล..." : phase === "idle" ? "เริ่มออกกำลังกาย" : phase === "finished" ? "เริ่มใหม่" : "ทำต่อ"}
            </button>
          ) : (
            <button onClick={() => setIsRunning(false)} className="w-full py-4 bg-white/20 text-white font-bold rounded-2xl">
              หยุดชั่วคราว
            </button>
          )}

          {phase !== "idle" && (
            <button onClick={resetWorkout} className="w-full py-3 text-white/70 font-bold rounded-2xl border border-white/20 hover:bg-white/10">
              ยกเลิกและรีเซ็ต
            </button>
          )}
        </div>
      </div>
    </main>
  );
}