import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Brain, Timer, Play, Pause, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./ui/progress";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function FocusMode() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime] = useState(25 * 60);
  const [isMinimal, setIsMinimal] = useState(false);
  const queryClient = useQueryClient();

  const saveSession = useMutation({
    mutationFn: async (minutes: number) => {
      const res = await fetch(api.focusSessions.create.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(new Date(), 'yyyy-MM-dd'),
          durationMinutes: minutes,
          startTime: format(new Date(), 'HH:mm')
        })
      });
      return res.json();
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      saveSession.mutate(25);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const percentage = ((totalTime - timeLeft) / totalTime) * 100;

  if (isMinimal) {
    return (
      <motion.div 
        layoutId="focus-container"
        className="fixed inset-0 z-[100] bg-[#0f0f0f] flex flex-col items-center justify-center p-8 text-center"
      >
        <button 
          onClick={() => setIsMinimal(false)}
          className="absolute top-8 right-8 text-muted-foreground hover:text-primary font-cinzel uppercase tracking-widest text-sm"
        >
          Exit Focus
        </button>

        <div className="space-y-12 max-w-xl">
          <p className="text-muted-foreground font-serif italic text-lg leading-relaxed">
            "You become what you give your attention to."
          </p>

          <div className="text-[12rem] font-mono font-bold text-foreground leading-none drop-shadow-[0_0_50px_rgba(212,175,55,0.1)]">
            {mins}:{secs < 10 ? `0${secs}` : secs}
          </div>

          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary" 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex gap-8 justify-center">
            <button onClick={toggle} className="p-6 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
              {isActive ? <Pause size={48} /> : <Play size={48} />}
            </button>
            <button onClick={reset} className="p-6 rounded-full bg-secondary/30 border border-border/50 text-muted-foreground hover:text-foreground transition-all">
              <RotateCcw size={48} />
            </button>
          </div>
          
          {timeLeft === 0 && (
            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="text-primary font-cinzel text-2xl font-bold tracking-widest"
            >
              Session complete. Discipline grows.
            </motion.p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-cinzel text-xl flex items-center gap-2">
          <Timer className="text-primary" size={20} />
          Focus Engine
        </CardTitle>
        <button 
          onClick={() => setIsMinimal(true)}
          className="text-[10px] uppercase font-bold text-primary/60 hover:text-primary border border-primary/20 px-2 py-1 rounded transition-colors"
        >
          Enter Focus Mode
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl font-mono font-bold text-foreground">
            {mins}:{secs < 10 ? `0${secs}` : secs}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Pomodoro Session</div>
        </div>

        <Progress value={percentage} className="h-1" />

        <div className="flex gap-3">
          <button 
            onClick={toggle}
            className="flex-1 bg-primary/20 text-primary border border-primary/50 py-3 rounded-xl font-cinzel font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
            {isActive ? "Pause" : "Ignite"}
          </button>
          <button 
            onClick={reset}
            className="p-3 bg-secondary/30 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground transition-all"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
