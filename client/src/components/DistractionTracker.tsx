import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { useDistractionLog, useSaveDistractionLog } from "@/hooks/use-distractions";
import { Clock, Save, Plus } from "lucide-react";
import { motion } from "framer-motion";

export function DistractionTracker() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: log, isLoading } = useDistractionLog(today);
  const saveLog = useSaveDistractionLog();

  const [mins, setMins] = useState({
    instagram: 0,
    youtube: 0,
    gaming: 0,
    other: 0
  });

  const [appStartTime] = useState(Date.now());
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - appStartTime) / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [appStartTime]);

  useEffect(() => {
    if (log) {
      setMins({
        instagram: log.instagramMinutes,
        youtube: log.youtubeMinutes,
        gaming: log.gamingMinutes,
        other: log.otherMinutes
      });
    }
  }, [log]);

  const total = mins.instagram + mins.youtube + mins.gaming + mins.other;
  const isDanger = total > 120; // More than 2 hours is considered bad

  const handleSave = (updatedMins = mins) => {
    saveLog.mutate({
      date: today,
      instagramMinutes: updatedMins.instagram,
      youtubeMinutes: updatedMins.youtube,
      gamingMinutes: updatedMins.gaming,
      otherMinutes: updatedMins.other,
    });
  };

  const addMins = (field: keyof typeof mins, amount: number) => {
    const updated = { ...mins, [field]: mins[field] + amount };
    setMins(updated);
    handleSave(updated);
  };

  const handleInputChange = (field: keyof typeof mins, value: string) => {
    const num = parseInt(value) || 0;
    setMins(prev => ({ ...prev, [field]: num }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-cinzel text-xl flex items-center gap-2">
          <Clock className="text-primary" size={20} />
          Wasted Time
        </CardTitle>
        <div className="flex items-center gap-3">
          <div className="text-[10px] uppercase font-bold text-primary/60 bg-primary/5 px-2 py-1 rounded">
            Session: {sessionTime}m
          </div>
          <button 
            onClick={() => handleSave()}
            disabled={saveLog.isPending}
            className="text-primary hover:text-primary-foreground hover:bg-primary p-2 rounded-full transition-colors disabled:opacity-50"
            title="Save Log"
          >
            <Save size={18} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 pb-4 border-b border-border/50 text-center">
          <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Lost Today</div>
          <motion.div 
            key={total}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-cinzel font-bold text-4xl ${isDanger ? 'text-destructive' : 'text-foreground'}`}
          >
            {Math.floor(total / 60)}h {total % 60}m
          </motion.div>
        </div>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground font-cinzel animate-pulse">Consulting the Records...</div>
        ) : (
          <div className="space-y-4">
            {[
              { id: 'instagram', label: 'Social Media', quick: 5 },
              { id: 'youtube', label: 'YouTube/Video', quick: 10 },
              { id: 'gaming', label: 'Gaming', quick: 15 },
              { id: 'other', label: 'Other Mindless', quick: 5 }
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                    {item.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={mins[item.id as keyof typeof mins] || ''}
                      onChange={(e) => handleInputChange(item.id as keyof typeof mins, e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2 pl-3 pr-8 text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors font-mono text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m</span>
                  </div>
                </div>
                <button 
                  onClick={() => addMins(item.id as keyof typeof mins, item.quick)}
                  className="mt-5 p-2 bg-secondary/50 border border-border/50 rounded-lg hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={14} /> {item.quick}m
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-xs text-center font-serif italic text-muted-foreground bg-secondary/30 p-3 rounded-lg leading-relaxed">
          "It is not that we have a short time to live, but that we waste a lot of it." — Seneca
        </div>
      </CardContent>
    </Card>
  );
}
