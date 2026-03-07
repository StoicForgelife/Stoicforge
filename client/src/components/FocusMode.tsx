import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Timer, Play, Pause, Square, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInMinutes, startOfDay, endOfDay, addDays, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useCreateFocusSession, useUserStats, useUpdateUserStats, useRunningFocus, useSaveRunningFocus } from "@/hooks/use-local-storage";

const XP_STAGES = [
  { mins: 120, xp: 60 },
  { mins: 90, xp: 40 },
  { mins: 60, xp: 25 },
  { mins: 30, xp: 12 },
  { mins: 15, xp: 5 },
];

const MOTIVATIONAL_MESSAGES = [
  { mins: 90, text: "Elite focus." },
  { mins: 60, text: "Deep work achieved." },
  { mins: 45, text: "Momentum building." },
  { mins: 30, text: "Half an hour. Keep going." },
  { mins: 15, text: "Stay focused." },
  { mins: 5, text: "Good start." },
  { mins: 0, text: "Begin your ascent." }
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
  
  const { data: runningSession } = useRunningFocus();
  const saveRunningFocus = useSaveRunningFocus();

  // Restore session on load
  useEffect(() => {
    if (runningSession?.startTime) {
      const elapsed = Math.floor((Date.now() - runningSession.startTime) / 1000);
      setSeconds(elapsed);
      setIsActive(true);
    }
  }, [runningSession]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (runningSession?.startTime) {
          const elapsed = Math.floor((Date.now() - runningSession.startTime) / 1000);
          setSeconds(elapsed);
        } else {
          // If for some reason we don't have a start time but active, start one
          const now = Date.now() - (seconds * 1000);
          saveRunningFocus.mutate({ startTime: now });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, runningSession, seconds]);

  const handleStart = () => {
    const now = Date.now() - (seconds * 1000);
    saveRunningFocus.mutate({ startTime: now });
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
    saveRunningFocus.mutate(null);
  };

  const handleEnd = () => {
    const endTime = Date.now();
    const startTime = runningSession?.startTime || (endTime - (seconds * 1000));
    
    setIsActive(false);
    saveRunningFocus.mutate(null);

    const totalMins = Math.floor(seconds / 60);
    if (totalMins <= 0) {
      setSeconds(0);
      setIsMinimal(false);
      return;
    }

    // Handle midnight crossing
    const startD = new Date(startTime);
    const endD = new Date(endTime);
    
    let xpToAward = 0;
    for (const stage of XP_STAGES) {
      if (totalMins >= stage.mins) { xpToAward = stage.xp; break; }
    }

    if (!isSameDay(startD, endD)) {
      // Split session
      const endOfStartDay = endOfDay(startD);
      const minsFirstDay = differenceInMinutes(endOfStartDay, startD) + 1;
      const minsSecondDay = totalMins - minsFirstDay;

      // Save yesterday's part
      createSession.mutate({
        date: format(startD, 'yyyy-MM-dd'),
        durationMinutes: minsFirstDay,
        startTime: format(startD, 'HH:mm'),
        xpEarned: 0 // We'll award all XP to the total completion for simplicity or split it?
        // Requirement says: "XP and daily focus totals should be distributed according to the time belonging to each day."
      });

      // Save today's part
      createSession.mutate({
        date: format(endD, 'yyyy-MM-dd'),
        durationMinutes: minsSecondDay,
        startTime: "00:00",
        xpEarned: xpToAward
      });
    } else {
      createSession.mutate({
        date: format(startD, 'yyyy-MM-dd'),
        durationMinutes: totalMins,
        startTime: format(startD, 'HH:mm'),
        xpEarned: xpToAward
      });
    }

    if (stats && xpToAward > 0) {
      const newXp = stats.totalXp + xpToAward;
      updateStats.mutate({ totalXp: newXp, level: Math.floor(newXp / 100) + 1 });
      setShowXpPopup({ show: true, xp: xpToAward });
      setTimeout(() => setShowXpPopup({ show: false, xp: 0 }), 3000);
      toast({ title: "Focus Session Complete", description: `+${xpToAward} XP Earned. Discipline grows.` });
    }

    setSeconds(0);
    setIsMinimal(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleMinimal = async () => {
    if (!isMinimal) {
      try {
        await document.documentElement.requestFullscreen();
        setIsMinimal(true);
      } catch (e) {
        setIsMinimal(true);
      }
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsMinimal(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) setIsMinimal(false);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const displayTime = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentMins = Math.floor(seconds / 60);
  const motivationalMessage = MOTIVATIONAL_MESSAGES.find(m => currentMins >= m.mins)?.text || "";

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
        <motion.div layoutId="focus-container" className="fixed inset-0 z-[100] bg-[#0f0f0f] flex flex-col items-center justify-center text-center p-8">
          <button 
            onClick={toggleMinimal} 
            className="absolute top-8 right-8 p-2 rounded-full bg-secondary/20 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            <X size={24} />
            <span className="text-xs font-cinzel uppercase tracking-widest hidden md:inline">Exit Focus Mode</span>
          </button>

          <div className="text-[12rem] font-mono font-bold text-foreground leading-none drop-shadow-[0_0_30px_rgba(212,175,55,0.1)] tabular-nums">{displayTime()}</div>
          
          <div className="mt-8 text-primary font-cinzel text-2xl tracking-widest h-8">
            {isActive && motivationalMessage}
          </div>

          <div className="flex gap-8 mt-12">
            <button onClick={isActive ? handlePause : handleStart} className="p-6 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
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
          {/* Border Animation */}
          {isActive && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              <motion.div 
                className="absolute inset-0 border-2 border-primary rounded-xl"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ 
                  clipPath: 'inset(0 0 0 0 round 0.75rem)',
                  boxShadow: 'inset 0 0 15px rgba(212,175,55,0.2)'
                }}
              />
              <div className="absolute inset-0 animate-border-glow border-2 border-primary/30 rounded-xl" />
            </div>
          )}

          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="font-cinzel text-xl flex items-center gap-2"><Timer className="text-primary" size={20} />Focus Timer</CardTitle>
            <button onClick={toggleMinimal} className="text-[10px] uppercase font-bold text-primary/60 hover:text-primary border border-primary/20 px-2 py-1 rounded transition-colors">Enter Fullscreen</button>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-foreground tabular-nums tracking-tighter">{displayTime()}</div>
              <div className="text-[10px] uppercase tracking-widest text-primary mt-2 font-bold h-4">
                {isActive ? motivationalMessage : "Session Paused"}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={isActive ? handlePause : handleStart} className="flex-1 bg-primary/20 text-primary border border-primary/50 py-3 rounded-xl font-cinzel font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all">
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
