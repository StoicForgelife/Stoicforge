import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { ShieldCheck, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
import { useHabits, useHabitLogs, useToggleHabitLog, useHabitStreak } from "@/hooks/use-local-storage";

export function NoFapTracker() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: habits } = useHabits();
  const habit = habits?.find(h => h.name.toLowerCase().includes("nofap"));
  const { data: logs } = useHabitLogs(today);
  const log = logs?.find(l => l.habitId === habit?.id);
  const toggleLog = useToggleHabitLog();
  const { data: streakData } = useHabitStreak(habit?.id || 0);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

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
          <button onClick={handleClean} className={`p-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 border ${log?.completed ? 'bg-green-500/20 border-green-500/50 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-secondary/30 border-border/50 text-muted-foreground'}`}><ShieldCheck size={16} /> Clean Day</button>
          <button onClick={handleRelapse} className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase text-red-500 flex flex-col items-center gap-1 hover:bg-red-500 hover:text-white transition-all"><XCircle size={16} /> Relapse</button>
          <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
            <DialogTrigger asChild><button className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-[10px] font-bold uppercase text-yellow-500 flex flex-col items-center gap-1"><AlertTriangle size={16} /> Emergency</button></DialogTrigger>
            <DialogContent className="bg-[#1c1c1c] border-primary/30">
              <DialogHeader><DialogTitle className="font-cinzel text-primary text-center text-2xl">RESIST</DialogTitle></DialogHeader>
              <div className="space-y-6 py-4 text-center">
                <p className="font-serif italic text-lg">"You are stronger than your impulses. Urges pass. Discipline stays."</p>
                <div className="space-y-3">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Suggested Actions</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 text-xs font-bold">Do 10 pushups</div>
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 text-xs font-bold">Take a cold shower</div>
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 text-xs font-bold">Go for a walk</div>
                  </div>
                </div>
                <button onClick={() => setEmergencyOpen(false)} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold uppercase text-xs">I am in control</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
