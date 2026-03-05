import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Timer, Play, Pause, Square, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

const XP_STAGES = [
  { mins: 120, xp: 60 },
  { mins: 90, xp: 40 },
  { mins: 60, xp: 25 },
  { mins: 30, xp: 12 },
  { mins: 15, xp: 5 },
];

export function FocusMode() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isMinimal, setIsMinimal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSession = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.focusSessions.create.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.userStats.get.path] });
      toast({
        title: "Focus Session Complete",
        description: `+${data.xpEarned} XP Earned. Discipline grows.`,
      });
    }
  });

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive]);

  const handleEnd = () => {
    setIsActive(false);
    const mins = Math.floor(seconds / 60);
    let xp = 0;
    for (const stage of XP_STAGES) {
      if (mins >= stage.mins) { xp = stage.xp; break; }
    }
    if (mins > 0) {
      createSession.mutate({
        date: format(new Date(), 'yyyy-MM-dd'),
        durationMinutes: mins,
        startTime: format(new Date(), 'HH:mm'),
        xpEarned: xp
      });
    }
    setSeconds(0);
    setIsMinimal(false);
  };

  const displayTime = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isMinimal) {
    return (
      <motion.div layoutId="focus-container" className="fixed inset-0 z-[100] bg-[#0f0f0f] flex flex-col items-center justify-center text-center">
        <div className="text-[12rem] font-mono font-bold text-foreground leading-none">{displayTime()}</div>
        <div className="flex gap-8 mt-12">
          <button onClick={() => setIsActive(!isActive)} className="p-6 rounded-full bg-primary/10 border border-primary/30 text-primary">
            {isActive ? <Pause size={48} /> : <Play size={48} />}
          </button>
          <button onClick={handleEnd} className="p-6 rounded-full bg-secondary/30 border border-border/50 text-muted-foreground">
            <Square size={48} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-cinzel text-xl flex items-center gap-2"><Timer className="text-primary" size={20} />Focus Timer</CardTitle>
        <button onClick={() => setIsMinimal(true)} className="text-[10px] uppercase font-bold text-primary/60 hover:text-primary">Enter Fullscreen</button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center"><div className="text-5xl font-mono font-bold text-foreground">{displayTime()}</div></div>
        <div className="flex gap-3">
          <button onClick={() => setIsActive(!isActive)} className="flex-1 bg-primary/20 text-primary border border-primary/50 py-3 rounded-xl font-cinzel font-bold text-xs flex items-center justify-center gap-2">
            {isActive ? <Pause size={16} /> : <Play size={16} />}{isActive ? "Pause" : "Start"}
          </button>
          <button onClick={handleEnd} className="p-3 bg-secondary/30 border border-border/50 rounded-xl text-muted-foreground"><Square size={18} /></button>
        </div>
      </CardContent>
    </Card>
  );
}
