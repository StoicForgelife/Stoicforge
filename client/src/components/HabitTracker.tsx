import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, X, Check, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { useHabits, useCreateHabit, useDeleteHabit } from "@/hooks/use-habits";
import { useHabitLogs, useToggleHabitLog } from "@/hooks/use-habit-logs";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function HabitTracker() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: habits, isLoading: isLoadingHabits } = useHabits();
  const { data: logs, isLoading: isLoadingLogs } = useHabitLogs(today);
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const toggleLog = useToggleHabitLog();
  const [newHabitName, setNewHabitName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const updateXp = useMutation({
    mutationFn: async (xp: number) => {
      const stats = await (await fetch('/api/user-stats')).json();
      return fetch('/api/user-stats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalXp: stats.totalXp + xp, level: Math.floor((stats.totalXp + xp) / 100) + 1 })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
      toast({ title: "XP Earned", description: "+10 XP Recorded" });
    }
  });

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    createHabit.mutate({ name: newHabitName, isCustom: true, xpReward: 10, isSpartan: false }, { onSuccess: () => { setNewHabitName(""); setIsAdding(false); } });
  };

  const handleToggle = (habit: any, isCompleted: boolean) => {
    toggleLog.mutate({ habitId: habit.id, date: today, completed: !isCompleted, currentValue: isCompleted ? 0 : 1 }, {
      onSuccess: () => {
        if (!isCompleted) updateXp.mutate(habit.xpReward);
      }
    });
  };

  if (isLoadingHabits || isLoadingLogs) return <Card className="min-h-[300px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></Card>;

  const normalHabits = habits?.filter(h => !h.isSpartan);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-cinzel text-xl text-foreground">Daily Disciplines</CardTitle>
        <button onClick={() => setIsAdding(!isAdding)} className="p-2 rounded-full hover:bg-primary/10 text-primary">{isAdding ? <X size={20} /> : <Plus size={20} />}</button>
      </CardHeader>
      <CardContent>
        <AnimatePresence>{isAdding && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddHabit} className="mb-4 overflow-hidden">
            <div className="flex gap-2">
              <input type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="New task..." className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm" />
              <button type="submit" disabled={createHabit.isPending} className="bg-primary/20 text-primary border border-primary/50 px-4 py-2 rounded-lg font-semibold text-sm">Add</button>
            </div>
          </motion.form>
        )}</AnimatePresence>
        <div className="space-y-3">
          {normalHabits?.map((habit) => {
            const log = logs?.find(l => l.habitId === habit.id);
            const isCompleted = log?.completed || false;
            return (
              <motion.div key={habit.id} onClick={() => handleToggle(habit, isCompleted)} 
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-300 ${isCompleted ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-secondary/30 border-border/50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/50'}`}><Check size={14} /></div>
                  <span className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{habit.name}</span>
                </div>
                <span className="text-[10px] font-bold text-primary">+{habit.xpReward} XP</span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function SpartanMode() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: habits } = useHabits();
  const { data: logs } = useHabitLogs(today);
  const toggleLog = useToggleHabitLog();
  const spartanHabits = habits?.filter(h => h.isSpartan);

  const updateXp = useMutation({
    mutationFn: async (xp: number) => {
      const stats = await (await fetch('/api/user-stats')).json();
      return fetch('/api/user-stats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalXp: stats.totalXp + xp, level: Math.floor((stats.totalXp + xp) / 100) + 1 })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
      toast({ title: "Spartan XP Earned", description: "Extra discipline recorded." });
    }
  });

  const handleToggle = (habit: any, isCompleted: boolean) => {
    toggleLog.mutate({ habitId: habit.id, date: today, completed: !isCompleted, currentValue: isCompleted ? 0 : 1 }, {
      onSuccess: () => {
        if (!isCompleted) updateXp.mutate(habit.xpReward);
      }
    });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader><CardTitle className="font-cinzel text-xl flex items-center gap-2"><Shield className="text-primary" size={20} /> Spartan Mode</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {spartanHabits?.map((habit) => {
          const log = logs?.find(l => l.habitId === habit.id);
          const isCompleted = log?.completed || false;
          return (
            <motion.div key={habit.id} onClick={() => handleToggle(habit, isCompleted)}
              className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-300 ${isCompleted ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'bg-secondary/30 border-border/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isCompleted ? 'bg-primary border-primary text-white' : 'border-muted-foreground/50'}`}><Check size={14} /></div>
                <span className="font-bold tracking-wide uppercase text-xs">{habit.name}</span>
              </div>
              <span className="text-xs font-bold text-primary">+{habit.xpReward} XP</span>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
