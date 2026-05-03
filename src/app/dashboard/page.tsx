// src/app/dashboard/page.tsx
import prisma from "@/src/lib/prisma";
import WorkoutChart from "./WorkoutChart";
import Link from "next/link";

// ปิดระบบ Cache ของหน้านี้ เพื่อให้ดึงข้อมูลใหม่ทุกครั้งที่กดเข้ามาดู
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. ดึงข้อมูล 30 รายการล่าสุดของ User นี้
  const logs = await prisma.workoutLog.findMany({
    where: { userId: "demo-user-01" }, // ตรงกับตอนที่เราเซฟไว้ในหน้าหลัก
    orderBy: { date: "asc" }, // เรียงจากเก่าไปใหม่เพื่อเข้ากราฟ
  });

  // 2. คำนวณสถิติภาพรวม (Analytics Logic)
  const totalWorkouts = logs.length;
  // เติม : number ให้กับ sum เพื่อแก้ Error Type
const totalVolume = logs.reduce<number>((sum, log) => sum + log.volumeScore, 0);
const totalSets = logs.reduce<number>((sum, log) => sum + log.sets, 0);

  // 3. จัดกลุ่มข้อมูลสำหรับทำกราฟรายวัน (รวม Volume Score ของแต่ละวันเข้าด้วยกัน)
  const chartDataMap = new Map<string, number>();
  
  logs.forEach(log => {
    // ฟอร์แมตวันที่แบบไทยสั้นๆ เช่น "4 พ.ค."
    const dateStr = log.date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    const currentVolume = chartDataMap.get(dateStr) || 0;
    chartDataMap.set(dateStr, currentVolume + log.volumeScore);
  });

  // แปลงจาก Map กลับเป็น Array ตามฟอร์แมตของ Recharts
  const chartData = Array.from(chartDataMap).map(([date, volume]) => ({
    date,
    volume: Number(volume.toFixed(1)) // ปัดทศนิยม 1 ตำแหน่ง
  }));

  // เลือกแค่ 7 วันล่าสุดมาแสดงในกราฟ
  const recentChartData = chartData.slice(-7);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="flex justify-between items-center mt-6 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">
              ภาพรวมของคุณ
            </h1>
            <p className="text-sm text-slate-400">สรุปผลความแข็งแกร่ง (Volume Score)</p>
          </div>
          <Link href="/" className="px-4 py-2 text-sm font-bold bg-white/10 hover:bg-white/20 rounded-full transition text-white">
            ← กลับหน้าหลัก
          </Link>
        </div>

        {/* Highlight Stats (การ์ดสรุปผลแบบโปร่งใส ไม่มี Blur) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
            <p className="text-xs text-slate-400 font-semibold mb-1">พลังรวม (Total Volume)</p>
            <p className="text-3xl font-black text-white">{totalVolume.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
            <p className="text-xs text-slate-400 font-semibold mb-1">จำนวนเซตที่ทำได้</p>
            <p className="text-3xl font-black text-white">{totalSets.toLocaleString()}</p>
          </div>
          <div className="col-span-2 bg-slate-800/80 border border-slate-700 p-5 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-1">จำนวนครั้งที่เข้าฝึก</p>
              <p className="text-xl font-bold text-white">{totalWorkouts} Sessions</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-semibold mb-1">ระดับความอึด</p>
              <p className="text-xl font-bold text-emerald-400">
                {totalVolume > 5000 ? "Master 🔥" : totalVolume > 1000 ? "Advanced ⚡" : "Beginner 🌱"}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl mb-8">
          <h2 className="text-sm font-bold text-white mb-2">พัฒนาการย้อนหลัง 7 วัน</h2>
          <WorkoutChart data={recentChartData} />
        </div>

      </div>
    </main>
  );
}