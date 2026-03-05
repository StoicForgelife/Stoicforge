import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Flame, Clock } from "lucide-react";
import { MementoMori } from "@/components/MementoMori";
import { DailyQuote } from "@/components/DailyQuote";
import { HabitTracker, SpartanMode } from "@/components/HabitTracker";
import { DailyJournal } from "@/components/DailyJournal";
import { LevelSystem, AchievementSystem } from "@/components/LevelSystem";
import { FocusMode } from "@/components/FocusMode";
import { NoFapTracker } from "@/components/NoFapTracker";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: habits } = useQuery({ queryKey: [api.habits.list.path], queryFn: async () => (await fetch(api.habits.list.path)).json() });
  const { data: logs } = useQuery({ queryKey: [api.habitLogs.list.path, today], queryFn: async () => (await fetch(`${api.habitLogs.list.path}?date=${today}`)).json() });
  const { data: stats } = useQuery({ queryKey: [api.userStats.get.path], queryFn: async () => (await fetch(api.userStats.get.path)).json() });

  const completedCount = logs?.filter((l: any) => l.completed).length || 0;
  const totalCount = habits?.length || 0;
  const score = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-foreground pb-20 font-inter">
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><Flame className="text-primary" size={28} /><h1 className="font-cinzel text-2xl font-bold tracking-widest text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">STOICFORGE</h1></div>
          
          <div className="hidden md:flex flex-col items-center">
            <div className="text-xl font-mono font-bold text-primary leading-none">{format(time, 'hh:mm:ss a')}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{format(time, 'MMMM do, yyyy')}</div>
          </div>

          <div className="flex items-center gap-6">
             <div className="text-right"><div className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Discipline Score</div><div className="text-xl font-bold font-mono text-primary">{score}%</div></div>
             <div className="font-cinzel text-xs uppercase tracking-widest font-semibold flex gap-4"><span className="text-primary border-b border-primary cursor-pointer">Dashboard</span><span className="text-muted-foreground hover:text-foreground cursor-pointer">History</span></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <LevelSystem />
            <FocusMode />
            <HabitTracker />
            <SpartanMode />
          </div>
          <div className="lg:col-span-5 space-y-8">
            <DailyQuote />
            <NoFapTracker />
            <ProgressDashboard />
            <DailyJournal />
          </div>
          <div className="lg:col-span-3 space-y-8">
            <AchievementSystem />
            <MementoMori />
            <div className="p-6 bg-secondary/10 border border-border/50 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-4">Daily Stats</div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-xs text-muted-foreground">Disciplines</span><span className="text-xs font-bold">{completedCount} / {totalCount}</span></div>
                <div className="flex justify-between"><span className="text-xs text-muted-foreground">Focus Level</span><span className="text-xs font-bold">{stats?.level}</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
