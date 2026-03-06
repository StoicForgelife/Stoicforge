import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Timer, Play, Pause, Square, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useCreateFocusSession, useUserStats, useUpdateUserStats } from "@/hooks/use-local-storage";

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
  const [showXpPopup, setShowXpPopup] = useState<{show: boolean, xp: number}>({ show: false, xp: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { data: stats } = useUserStats();
  const updateStats = useUpdateUserStats();
  const createSession = useCreateFocusSession();

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
      const sessionData = {
        date: format(new Date(), 'yyyy-MM-dd'),
        durationMinutes: mins,
        startTime: format(new Date(), 'HH:mm'),
        xpEarned: xp
      };
      
      createSession.mutate(sessionData, {
        onSuccess: (data) => {
          if (stats) {
            const newXp = stats.totalXp + xp;
            updateStats.mutate({ totalXp: newXp, level: Math.floor(newXp / 100) + 1 });
            setShowXpPopup({ show: true, xp: xp });
            setTimeout(() => setShowXpPopup({ show: false, xp: 0 }), 3000);
            toast({ title: "Focus Session Complete", description: `+${xp} XP Earned. Discipline grows.` });
          }
        }
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

  return (
    <>
      <AnimatePresence>
        {showXpPopup.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: -100, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 z-[200] pointer-events-none"
          >
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-cinzel font-bold text-2xl shadow-[0_0_30px_rgba(212,175,55,0.6)] border-2 border-white/20">
              +{showXpPopup.xp} XP
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMinimal ? (
        <motion.div layoutId="focus-container" className="fixed inset-0 z-[100] bg-[#0f0f0f] flex flex-col items-center justify-center text-center">
          <div className="text-[12rem] font-mono font-bold text-foreground leading-none drop-shadow-[0_0_30px_rgba(212,175,55,0.1)]">{displayTime()}</div>
          <div className="flex gap-8 mt-12">
            <button onClick={() => setIsActive(!isActive)} className="p-6 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
              {isActive ? <Pause size={48} /> : <Play size={48} />}
            </button>
            <button onClick={handleEnd} className="p-6 rounded-full bg-secondary/30 border border-border/50 text-muted-foreground hover:text-foreground transition-all">
              <Square size={48} />
            </button>
          </div>
          <p className="mt-12 text-muted-foreground font-serif italic text-lg opacity-60">"Focus is the art of saying no."</p>
        </motion.div>
      ) : (
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10">
             {isActive && <motion.div className="h-full bg-primary shadow-[0_0_10px_rgba(212,175,55,0.5)]" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />}
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-cinzel text-xl flex items-center gap-2"><Timer className="text-primary" size={20} />Focus Timer</CardTitle>
            <button onClick={() => setIsMinimal(true)} className="text-[10px] uppercase font-bold text-primary/60 hover:text-primary border border-primary/20 px-2 py-1 rounded transition-colors">Enter Fullscreen</button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-foreground tabular-nums tracking-tighter">{displayTime()}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-bold">Session in Progress</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsActive(!isActive)} className="flex-1 bg-primary/20 text-primary border border-primary/50 py-3 rounded-xl font-cinzel font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all">
                {isActive ? <Pause size={16} /> : <Play size={16} />}{isActive ? "Pause" : "Start Focus"}
              </button>
              <button onClick={handleEnd} className="p-3 bg-secondary/30 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground transition-all"><Square size={18} /></button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
