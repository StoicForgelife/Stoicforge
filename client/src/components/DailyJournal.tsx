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
  const { data: history } = useQuery({ queryKey: [api.journalEntries.list.path], queryFn: async () => (await fetch(api.journalEntries.list.path)).json() });
  const saveEntry = useSaveJournalEntry();
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { if (entry) setContent(entry.content); }, [entry]);
  const handleSave = () => { if (!content.trim()) return; saveEntry.mutate({ date: today, content }, { onSuccess: () => setIsSaved(true) }); };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between"><div className="flex items-center gap-3"><BookOpen className="text-primary" size={24} /><CardTitle className="font-cinzel text-xl">Evening Reflection</CardTitle></div></CardHeader>
        <CardContent className="space-y-4">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What did you do well today?..." className="w-full bg-background border border-border rounded-xl p-4 min-h-[150px] focus:border-primary transition-all resize-none" />
          <div className="flex justify-between items-center">
            <div className="text-xs text-primary">{isSaved && "Recorded for history"}</div>
            <button onClick={handleSave} disabled={saveEntry.isPending || isSaved} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold uppercase text-xs">Commit Entry</button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="font-cinzel text-lg flex items-center gap-2"><History size={18} /> Past Reflections</CardTitle></CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
          {history?.map((h: any) => (
            <div key={h.id} className="p-3 bg-secondary/20 rounded-lg border border-border/50">
              <div className="text-[10px] font-bold text-primary mb-1">{h.date}</div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">{h.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
