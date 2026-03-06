import { useState, useEffect } from "react";
import { format, differenceInDays, differenceInYears, addYears } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStats, useUpdateUserStats } from "@/hooks/use-local-storage";

export function MementoMori() {
  const { data: stats } = useUserStats();
  const updateStats = useUpdateUserStats();

  const [dobInput, setDobInput] = useState("");

  if (!stats) return null;

  if (!stats.dob) {
    return (
      <Card className="border-primary/50">
        <CardHeader><CardTitle className="font-cinzel text-xl">The Journey Begins</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground italic">"To live is the rarest thing in the world. Most people exist, that is all."</p>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Date of Birth</label>
            <input type="date" value={dobInput} onChange={(e) => setDobInput(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-sm" />
            <button onClick={() => updateStats.mutate({ dob: dobInput })} disabled={!dobInput} className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold text-xs uppercase tracking-widest">Inscribe</button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const birthDate = new Date(stats.dob);
  const today = new Date();
  const age = differenceInYears(today, birthDate);
  const daysLived = differenceInDays(today, birthDate);
  const deathDate = addYears(birthDate, 80);
  const daysRemaining = differenceInDays(deathDate, today);
  const yearsRemaining = differenceInYears(deathDate, today);
  const totalDays = differenceInDays(deathDate, birthDate);
  const progress = (daysLived / totalDays) * 100;

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="font-cinzel text-2xl text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">Memento Mori</CardTitle>
        <p className="text-xs text-muted-foreground italic font-serif">"Time is limited. Use it wisely."</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Age</div>
            <div className="text-xl font-bold font-cinzel">{age} Years</div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Days Lived</div>
            <div className="text-xl font-bold font-mono">{daysLived.toLocaleString()}</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground"><span>Life Progress</span><span>{progress.toFixed(1)}%</span></div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 2 }} className="h-full bg-primary" /></div>
        </div>
        <div className="text-center bg-secondary/20 p-3 rounded-lg border border-border/50">
          <div className="text-2xl font-bold font-mono text-primary">{daysRemaining.toLocaleString()}</div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Estimated Days Remaining</div>
        </div>
      </CardContent>
    </Card>
  );
}
