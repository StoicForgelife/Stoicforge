import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Check, X } from "lucide-react";
import { useLocation } from "wouter";
import { storage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";

export default function History() {
  const [, navigate] = useLocation();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const dailyHistory = storage.getDailyHistory();
    setHistory(dailyHistory.sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-foreground pb-20 font-inter">
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-secondary/30 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-cinzel text-2xl font-bold tracking-widest text-primary">Discipline History</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No history recorded yet. Complete your daily disciplines to build your record.
              </CardContent>
            </Card>
          ) : (
            history.map((entry, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-primary">{formatDate(entry.date)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {entry.completedTasks && entry.completedTasks.length > 0 ? (
                    <div className="space-y-2">
                      {entry.completedTasks.map((task: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {task.completed ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <X size={16} className="text-red-500" />
                          )}
                          <span className={task.completed ? 'text-foreground' : 'text-muted-foreground line-through'}>
                            {task.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No disciplines recorded</div>
                  )}
                  
                  <div className="pt-3 border-t border-border/30 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Focus Time:</span>
                      <span className="font-semibold">{entry.focusTime || '0h 0m'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">NoFap Status:</span>
                      <span className={`font-semibold ${entry.noFapStatus?.includes('Relapse') ? 'text-red-500' : 'text-green-500'}`}>
                        {entry.noFapStatus || 'Not recorded'}
                      </span>
                    </div>
                    {entry.relapseReason && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Reason:</span>
                        <span className="text-red-500">{entry.relapseReason}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
