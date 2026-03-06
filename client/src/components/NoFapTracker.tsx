import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { ShieldCheck, XCircle, AlertTriangle, Droplets } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
import { useNoFap, useUpdateNoFap } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";

export function NoFapTracker() {
  const { data: nofapData } = useNoFap();
  const updateNoFap = useUpdateNoFap();
  const { toast } = useToast();
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const streak = nofapData?.streak || 0;
  const bestStreak = nofapData?.bestStreak || 0;

  const handleClean = () => {
    const newStreak = streak + 1;
    const newBest = Math.max(bestStreak, newStreak);
    updateNoFap.mutate({ streak: newStreak, bestStreak: newBest });
    toast({
      title: "Clean Day Recorded",
      description: "Discipline grows stronger.",
      className: "bg-green-500/20 border-green-500/50 text-green-500",
    });
  };

  const handleRelapse = () => {
    updateNoFap.mutate({ streak: 0, bestStreak });
    toast({
      title: "Relapse Recorded",
      description: "Rise again. The path remains.",
      variant: "destructive",
    });
  };

  return (
    <Card className="border-orange-500/20 overflow-hidden">
      <CardHeader><CardTitle className="font-cinzel text-xl flex items-center gap-2"><ShieldCheck className="text-orange-500" size={20} /> NoFap Discipline</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-around text-center py-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
          <div><div className="text-2xl font-bold text-orange-500">{streak}</div><div className="text-[10px] uppercase font-bold text-muted-foreground">Current Streak</div></div>
          <div><div className="text-2xl font-bold text-orange-500">{bestStreak}</div><div className="text-[10px] uppercase font-bold text-muted-foreground">Best Streak</div></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={handleClean} 
            className="p-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 border bg-secondary/30 border-border/50 text-muted-foreground hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-500"
          >
            <ShieldCheck size={16} /> Clean Day
          </button>
          <button 
            onClick={handleRelapse} 
            className="p-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 border bg-secondary/30 border-border/50 text-muted-foreground hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500"
          >
            <XCircle size={16} /> Relapse
          </button>
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
