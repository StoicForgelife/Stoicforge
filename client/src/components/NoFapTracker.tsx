import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { ShieldCheck, XCircle, AlertTriangle, Droplets } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
import { useNoFap, useUpdateNoFap } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";

const NOFAP_STAGES = [
  { days: 100, stage: "Monk Mind", message: "Your mind is calm and in command." },
  { days: 60, stage: "Warrior Discipline", message: "Your discipline separates you from the crowd." },
  { days: 30, stage: "Self Mastery", message: "You have taken control of your impulses." },
  { days: 21, stage: "Breaking Patterns", message: "Old habits are weakening." },
  { days: 14, stage: "Mental Control", message: "The mind is gaining control." },
  { days: 7, stage: "First Victory", message: "You are stronger than yesterday." },
  { days: 3, stage: "Urge Resistance", message: "Urges will appear. Stay aware." },
  { days: 1, stage: "Fresh Start", message: "Your discipline journey begins." },
];

const RELAPSE_REASONS = [
  "Boredom",
  "Loneliness",
  "Stress",
  "Trigger Content",
  "Lack of Motivation",
  "Late Night Scrolling",
  "Other",
];

const MOTIVATIONAL_LINES = [
  "One moment of weakness erased progress. Start again. Forge yourself.",
  "Fall seven times, stand eight. The warrior continues.",
  "Discipline is not punishment. It is freedom from weakness.",
  "Your body does not define your will. Master your impulses.",
  "The pain of discipline is nothing compared to the pain of regret.",
];

export function NoFapTracker() {
  const { data: nofapData } = useNoFap();
  const updateNoFap = useUpdateNoFap();
  const { toast } = useToast();
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [relapseDialogOpen, setRelapseDialogOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const streak = nofapData?.streak || 0;
  const bestStreak = nofapData?.bestStreak || 0;
  const lastCleanDay = nofapData?.lastCleanDay || null;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const getStreakStage = () => {
    const stage = NOFAP_STAGES.find(s => streak >= s.days);
    return stage || NOFAP_STAGES[NOFAP_STAGES.length - 1];
  };

  const handleClean = () => {
    if (lastCleanDay === todayStr) {
      toast({
        title: "Already Logged",
        description: "You have already recorded your victory for today.",
      });
      return;
    }

    const newStreak = streak + 1;
    const newBest = Math.max(bestStreak, newStreak);
    updateNoFap.mutate({ streak: newStreak, bestStreak: newBest, lastCleanDay: todayStr });
    toast({
      title: "Clean Day Recorded",
      description: "Discipline grows stronger.",
      className: "bg-green-500/20 border-green-500/50 text-green-500",
    });
  };

  const handleRelapseSubmit = () => {
    const brokePrevious = streak > 0;
    const streakBrokenMsg = brokePrevious 
      ? `You broke a ${streak} day streak.\n\nRemember the discipline it took to reach there.\n\n` 
      : "";
    const reflectionMsg = MOTIVATIONAL_LINES[Math.floor(Math.random() * MOTIVATIONAL_LINES.length)];
    
    // Save relapse to history
    const history = storage.getDailyHistory();
    const todayEntry = history.find(e => e.date === todayStr);
    if (todayEntry) {
      todayEntry.noFapStatus = `Relapse (${selectedReason || "Unknown"})`;
      todayEntry.relapseReason = selectedReason;
    }
    storage.saveDailyHistory(history);
    
    updateNoFap.mutate({ streak: 0, bestStreak, lastCleanDay: null });
    toast({
      title: "Relapse Recorded",
      description: `${streakBrokenMsg}${reflectionMsg}`,
      variant: "destructive",
    });
    setRelapseDialogOpen(false);
    setSelectedReason(null);
  };

  return (
    <Card className="border-orange-500/20 overflow-hidden">
      <CardHeader><CardTitle className="font-cinzel text-xl flex items-center gap-2"><ShieldCheck className="text-orange-500" size={20} /> NoFap Discipline</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-around text-center py-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
          <div><div className="text-2xl font-bold text-orange-500">{streak}</div><div className="text-[10px] uppercase font-bold text-muted-foreground">Current Streak</div></div>
          <div><div className="text-2xl font-bold text-orange-500">{bestStreak}</div><div className="text-[10px] uppercase font-bold text-muted-foreground">Best Streak</div></div>
        </div>
        <div className="text-center py-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <div className="text-sm font-bold text-orange-500">{getStreakStage().stage}</div>
          <div className="text-[10px] text-muted-foreground italic mt-1">{getStreakStage().message}</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={handleClean} 
            className={`p-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 border ${lastCleanDay === todayStr ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-500'}`}
          >
            <ShieldCheck size={16} /> Clean Day
          </button>
          <Dialog open={relapseDialogOpen} onOpenChange={setRelapseDialogOpen}>
            <DialogTrigger asChild>
              <button className="p-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 border bg-secondary/30 border-border/50 text-muted-foreground hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500">
                <XCircle size={16} /> Relapse
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#1c1c1c] border-primary/30">
              <DialogHeader><DialogTitle className="font-cinzel text-primary text-center">Why Did This Happen?</DialogTitle></DialogHeader>
              <div className="space-y-3 py-4">
                {RELAPSE_REASONS.map(reason => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full p-3 rounded-lg border text-left font-semibold text-sm transition-all ${selectedReason === reason ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary/30 border-border/50 text-foreground hover:border-primary/50'}`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleRelapseSubmit}
                disabled={!selectedReason}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Reflect
              </button>
            </DialogContent>
          </Dialog>
          <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
            <DialogTrigger asChild>
              <button className="p-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 border bg-secondary/30 border-border/50 text-muted-foreground hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-500">
                <AlertTriangle size={16} /> Emergency
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#1c1c1c] border-primary/30">
              <DialogHeader><DialogTitle className="font-cinzel text-primary text-center text-2xl">RESIST</DialogTitle></DialogHeader>
              <div className="space-y-6 py-4 text-center">
                <p className="font-serif italic text-lg text-foreground">"Urges are temporary. Discipline is permanent."</p>
                <div className="space-y-3">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Suggested Actions</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 text-xs font-bold flex items-center justify-center gap-2 text-foreground">Do 10 pushups</div>
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 text-xs font-bold flex items-center justify-center gap-2 text-foreground">Take a cold shower</div>
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 text-xs font-bold flex items-center justify-center gap-2 text-foreground">Go for a walk</div>
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 text-xs font-bold flex items-center justify-center gap-2 text-foreground"><Droplets size={14} className="text-blue-400" /> Drink water</div>
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
