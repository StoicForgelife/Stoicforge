import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { useJournalEntry, useSaveJournalEntry } from "@/hooks/use-journal";
import { BookOpen, CheckCircle2, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function DailyJournal() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: entry, isLoading } = useJournalEntry(today);
  const { data: history, refetch: refetchHistory } = useQuery({ queryKey: [api.journalEntries.list.path], queryFn: async () => (await fetch(api.journalEntries.list.path)).json() });
  const saveEntry = useSaveJournalEntry();
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { if (entry) setContent(entry.content); }, [entry]);

  const handleSave = () => {
    if (!content.trim()) return;
    const now = new Date();
    saveEntry.mutate({
      date: today,
      content,
      timestamp: format(now, 'MMMM d, yyyy — h:mm a')
    }, {
      onSuccess: () => {
        setIsSaved(true);
        refetchHistory();
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="text-primary" size={24} />
            <CardTitle className="font-cinzel text-xl">Evening Reflection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setIsSaved(false); }}
            placeholder="What did you do well today? Where did your discipline fail? What must improve tomorrow?"
            className="w-full bg-background border border-border rounded-xl p-4 min-h-[150px] focus:border-primary transition-all resize-none font-inter text-sm leading-relaxed"
          />
          <div className="flex justify-between items-center">
            <div className="text-[10px] text-primary font-bold uppercase tracking-widest">
              {isSaved && <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Recorded for history</span>}
            </div>
            <button
              onClick={handleSave}
              disabled={saveEntry.isPending || !content.trim() || isSaved}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold uppercase text-xs tracking-widest hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
            >
              {saveEntry.isPending ? "Inscribing..." : "Commit Entry"}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-cinzel text-lg flex items-center gap-2">
            <History size={18} className="text-primary" />
            Reflection History
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {history?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground italic text-xs font-serif">"The unexamined life is not worth living."</div>
          ) : (
            history?.map((h: any) => (
              <div key={h.id} className="p-4 bg-secondary/20 rounded-xl border border-border/50 space-y-2">
                <div className="text-[10px] font-bold text-primary uppercase tracking-tighter">{h.timestamp || h.date}</div>
                <p className="text-xs text-foreground/80 italic leading-relaxed whitespace-pre-wrap">{h.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
