import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, X, Check, Droplets, Flame, Brain, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { useHabits, useCreateHabit, useDeleteHabit } from "@/hooks/use-habits";
import { useHabitLogs, useToggleHabitLog } from "@/hooks/use-habit-logs";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./ui/progress";
import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function HabitTracker() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: habits, isLoading: isLoadingHabits } = useHabits();
  const { data: logs, isLoading: isLoadingLogs } = useHabitLogs(today);
  
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const toggleLog = useToggleHabitLog();

  const [newHabitName, setNewHabitName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    createHabit.mutate({ name: newHabitName, isCustom: true }, {
      onSuccess: () => {
        setNewHabitName("");
        setIsAdding(false);
      }
    });
  };

  const handleToggle = (habitId: number, currentStatus: boolean, currentValue: number = 0) => {
    toggleLog.mutate({
      habitId,
      date: today,
      completed: !currentStatus,
      currentValue: currentStatus ? 0 : (currentValue || 1)
    });
  };

  const handleProgress = (habitId: number, goal: number, current: number, increment: number) => {
    const newValue = Math.min(goal, current + increment);
    toggleLog.mutate({
      habitId,
      date: today,
      completed: newValue >= goal,
      currentValue: newValue
    });
  };

  if (isLoadingHabits || isLoadingLogs) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </Card>
    );
  }

  const waterHabit = habits?.find(h => h.name.toLowerCase().includes("water"));
  const noFapHabit = habits?.find(h => h.name.toLowerCase().includes("nofap"));
  const otherHabits = habits?.filter(h => h.id !== waterHabit?.id && h.id !== noFapHabit?.id);

  return (
    <div className="space-y-6">
      {/* Water Tracker */}
      {waterHabit && (
        <WaterTracker habit={waterHabit} log={logs?.find(l => l.habitId === waterHabit.id)} onProgress={handleProgress} />
      )}

      {/* NoFap Tracker */}
      {noFapHabit && (
        <NoFapTracker habit={noFapHabit} log={logs?.find(l => l.habitId === noFapHabit.id)} onToggle={handleToggle} />
      )}

      {/* Other Habits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-cinzel text-xl text-foreground">Daily Disciplines</CardTitle>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
          </button>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {isAdding && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddHabit}
                className="mb-4 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="E.g., Read 10 pages..."
                    className="flex-1 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    disabled={createHabit.isPending}
                    className="bg-primary/20 text-primary border border-primary/50 px-4 py-2 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 text-sm"
                  >
                    Add
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-3 mt-4">
            {otherHabits?.map((habit) => {
              const log = logs?.find(l => l.habitId === habit.id);
              const isCompleted = log?.completed || false;
              const currentValue = log?.currentValue || 0;
              const goal = habit.goalValue || 1;

              return (
                <motion.div 
                  layout
                  key={habit.id} 
                  className={`
                    p-3 rounded-xl border transition-all duration-300
                    ${isCompleted 
                      ? 'bg-primary/10 border-primary/30 shadow-[inset_0_0_15px_rgba(212,175,55,0.05)]' 
                      : 'bg-secondary/30 border-border/50 hover:border-border'}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleToggle(habit.id, isCompleted, currentValue)}>
                      <div className={`
                        w-6 h-6 rounded border flex items-center justify-center transition-all duration-300
                        ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/50 text-transparent'}
                      `}>
                        <Check size={14} className={isCompleted ? "opacity-100" : "opacity-0"} />
                      </div>
                      <span className={`font-medium transition-colors ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {habit.name}
                      </span>
                    </div>
                    
                    {habit.isCustom && (
                      <button 
                        onClick={() => deleteHabit.mutate(habit.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {habit.goalValue && habit.goalValue > 1 && (
                    <div className="pl-9 pr-2 space-y-2">
                      <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        <span>{currentValue}{habit.unit} / {habit.goalValue}{habit.unit}</span>
                        <span>{Math.round((currentValue / habit.goalValue) * 100)}%</span>
                      </div>
                      <Progress value={(currentValue / habit.goalValue) * 100} className="h-1" />
                      {!isCompleted && (
                         <div className="flex gap-2">
                            <button 
                              onClick={() => handleProgress(habit.id, habit.goalValue!, currentValue, 1)}
                              className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20"
                            >
                              +1 {habit.unit}
                            </button>
                         </div>
                      )}
                    </div>
                  )}
                  
                  {isCompleted && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pl-9 text-[10px] text-primary font-bold italic uppercase tracking-tighter"
                    >
                      Discipline grows.
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WaterTracker({ habit, log, onProgress }: { habit: any, log: any, onProgress: any }) {
  const current = log?.currentValue || 0;
  const goal = habit.goalValue || 2000;
  const percentage = Math.min(100, (current / goal) * 100);
  const isGoalReached = current >= goal;

  return (
    <Card className="border-primary/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Droplets size={80} className="text-primary" />
      </div>
      <CardHeader>
        <CardTitle className="font-cinzel text-xl flex items-center gap-2">
          <Droplets className="text-blue-500" size={20} />
          Hydration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono text-foreground">{current} <span className="text-sm font-normal text-muted-foreground">/ {goal}ml</span></div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Daily Intake</div>
          </div>
          {isGoalReached && (
            <div className="text-primary font-bold italic text-sm text-right animate-pulse">
              Body disciplined. Mind sharpened.
            </div>
          )}
        </div>
        
        <Progress value={percentage} className="h-2 bg-blue-950/30" indicatorClassName="bg-blue-500" />
        
        <div className="flex gap-2">
          <button 
            onClick={() => onProgress(habit.id, goal, current, 250)}
            className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-2 rounded-lg text-sm font-bold transition-all"
          >
            +250ml
          </button>
          <button 
            onClick={() => onProgress(habit.id, goal, current, 500)}
            className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-2 rounded-lg text-sm font-bold transition-all"
          >
            +500ml
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function NoFapTracker({ habit, log, onToggle }: { habit: any, log: any, onToggle: any }) {
  const isCompletedToday = log?.completed || false;
  
  const { data: streakData } = useQuery({
    queryKey: [api.habitLogs.streaks.path, habit.id],
    queryFn: async () => {
      const res = await fetch(buildUrl(api.habitLogs.streaks.path, { id: habit.id }));
      return await res.json();
    }
  });

  const streak = streakData?.streak || 0;

  return (
    <Card className="border-orange-500/20 relative overflow-hidden">
      <div className="absolute -bottom-4 -right-4 opacity-5">
        <Flame size={120} className="text-orange-500" />
      </div>
      <CardHeader>
        <CardTitle className="font-cinzel text-xl flex items-center gap-2">
          <Flame className="text-orange-500" size={20} />
          Primal Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
          <div className="text-orange-500 font-cinzel text-4xl font-bold mb-1 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            Day {streak}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Of Discipline</div>
        </div>

        <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-[11px] text-center font-serif italic text-muted-foreground leading-relaxed">
          "Momentary pleasure. Long-term weakness. Control yourself."
        </div>

        <button 
          onClick={() => onToggle(habit.id, isCompletedToday)}
          className={`
            w-full py-3 rounded-xl font-cinzel font-bold tracking-widest uppercase text-xs transition-all duration-500 border
            ${isCompletedToday 
              ? 'bg-green-500/20 border-green-500/50 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
              : 'bg-primary/20 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground'}
          `}
        >
          {isCompletedToday ? "Victorious Today" : "Claim Today's Victory"}
        </button>

        {!isCompletedToday && streak > 0 && (
          <p className="text-[9px] text-center text-muted-foreground uppercase tracking-tighter">
            Discipline breaks, rise again tomorrow.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
