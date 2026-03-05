import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { ShieldCheck, XCircle, AlertTriangle } from "lucide-react";
import { useHabitLogs, useToggleHabitLog } from "@/hooks/use-habit-logs";
import { format } from "date-fns";
import { useHabits } from "@/hooks/use-habits";

export function NoFapTracker() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: habits } = useHabits();
  const habit = habits?.find(h => h.name.toLowerCase().includes("nofap"));
  const { data: logs } = useHabitLogs(today);
  const log = logs?.find(l => l.habitId === habit?.id);
  const toggleLog = useToggleHabitLog();
  const { data: streakData } = useQuery({ queryKey: [api.habitLogs.streaks.path, habit?.id], queryFn: async () => (await fetch(buildUrl(api.habitLogs.streaks.path, { id: habit!.id }))).json(), enabled: !!habit });

  if (!habit) return null;

  const handleClean = () => toggleLog.mutate({ habitId: habit.id, date: today, completed: true, currentValue: 1 });
  const handleRelapse = () => toggleLog.mutate({ habitId: habit.id, date: today, completed: false, currentValue: 0 });

  return (
    <Card className="border-orange-500/20 overflow-hidden">
      <CardHeader><CardTitle className="font-cinzel text-xl flex items-center gap-2"><ShieldCheck className="text-orange-500" size={20} /> NoFap Discipline</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-around text-center py-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
          <div><div className="text-2xl font-bold text-orange-500">{streakData?.streak || 0}</div><div className="text-[10px] uppercase font-bold text-muted-foreground">Current Streak</div></div>
          <div><div className="text-2xl font-bold text-orange-500">?</div><div className="text-[10px] uppercase font-bold text-muted-foreground">Best Streak</div></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={handleClean} className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-[10px] font-bold uppercase text-green-500 flex flex-col items-center gap-1"><ShieldCheck size={16} /> Clean Day</button>
          <button onClick={handleRelapse} className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase text-red-500 flex flex-col items-center gap-1"><XCircle size={16} /> Relapse</button>
          <button onClick={() => alert("Urges pass. Discipline stays. Go do pushups instead.")} className="p-2 bg-primary/10 border border-primary/30 rounded-lg text-[10px] font-bold uppercase text-primary flex flex-col items-center gap-1"><AlertTriangle size={16} /> Emergency</button>
        </div>
      </CardContent>
    </Card>
  );
}
