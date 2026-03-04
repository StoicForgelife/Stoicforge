import { useState } from "react";
import { format } from "date-fns";
import { Plus, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { useHabits, useCreateHabit, useDeleteHabit } from "@/hooks/use-habits";
import { useHabitLogs, useToggleHabitLog } from "@/hooks/use-habit-logs";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleToggle = (habitId: number, currentStatus: boolean) => {
    toggleLog.mutate({
      habitId,
      date: today,
      completed: !currentStatus
    });
  };

  if (isLoadingHabits || isLoadingLogs) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </Card>
    );
  }

  return (
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

        <div className="space-y-2 mt-4">
          {habits?.map((habit) => {
            const log = logs?.find(l => l.habitId === habit.id);
            const isCompleted = log?.completed || false;

            return (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={habit.id} 
                className={`
                  flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer
                  ${isCompleted 
                    ? 'bg-primary/10 border-primary/30 shadow-[inset_0_0_15px_rgba(212,175,55,0.05)]' 
                    : 'bg-secondary/30 border-border/50 hover:border-border'}
                `}
                onClick={() => handleToggle(habit.id, isCompleted)}
              >
                <div className="flex items-center gap-4">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHabit.mutate(habit.id);
                    }}
                    className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                    title="Remove custom habit"
                  >
                    <X size={16} />
                  </button>
                )}
              </motion.div>
            );
          })}

          {habits?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground font-serif italic">
              No disciplines forged yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
