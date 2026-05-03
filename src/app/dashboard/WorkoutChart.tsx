// src/app/dashboard/WorkoutChart.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  date: string;
  volume: number;
}

export default function WorkoutChart({ data }: { data: ChartData[] }) {
  // หากยังไม่มีข้อมูล
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-500 py-10">ยังไม่มีข้อมูลการออกกำลังกาย เริ่มต้นเซตแรกของคุณเลย!</div>;
  }

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          {/* ซ่อนเส้น Grid เพื่อความคลีน (Premium & Transparent) */}
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} hide />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="volume" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}