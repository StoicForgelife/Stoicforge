import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { useDistractionLog, useSaveDistractionLog } from "@/hooks/use-distractions";
import { Clock, Save } from "lucide-react";

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

  const handleSave = () => {
    saveLog.mutate({
      date: today,
      instagramMinutes: mins.instagram,
      youtubeMinutes: mins.youtube,
      gamingMinutes: mins.gaming,
      otherMinutes: mins.other,
    });
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
        <button 
          onClick={handleSave}
          disabled={saveLog.isPending}
          className="text-primary hover:text-primary-foreground hover:bg-primary p-2 rounded-full transition-colors disabled:opacity-50"
          title="Save Log"
        >
          <Save size={18} />
        </button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 pb-4 border-b border-border/50 text-center">
          <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Lost Today</div>
          <div className={`font-cinzel font-bold text-4xl ${isDanger ? 'text-destructive' : 'text-foreground'}`}>
            {Math.floor(total / 60)}h {total % 60}m
          </div>
        </div>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'instagram', label: 'Social Media', color: 'text-pink-500' },
              { id: 'youtube', label: 'YouTube/Video', color: 'text-red-500' },
              { id: 'gaming', label: 'Gaming', color: 'text-purple-500' },
              { id: 'other', label: 'Other Mindless', color: 'text-muted-foreground' }
            ].map((item) => (
              <div key={item.id} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={mins[item.id as keyof typeof mins] || ''}
                    onChange={(e) => handleInputChange(item.id as keyof typeof mins, e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2 pl-3 pr-8 text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-xs text-center font-serif italic text-muted-foreground bg-secondary/30 p-3 rounded-lg">
          "It is not that we have a short time to live, but that we waste a lot of it." — Seneca
        </div>
      </CardContent>
    </Card>
  );
}
