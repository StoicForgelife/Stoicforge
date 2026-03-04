import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { useJournalEntry, useSaveJournalEntry } from "@/hooks/use-journal";
import { BookOpen, CheckCircle2 } from "lucide-react";

export function DailyJournal() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: entry, isLoading } = useJournalEntry(today);
  const saveEntry = useSaveJournalEntry();
  
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
    }
  }, [entry]);

  // Reset saved state when content changes
  useEffect(() => {
    setIsSaved(false);
  }, [content]);

  const handleSave = () => {
    if (!content.trim()) return;
    saveEntry.mutate({ date: today, content }, {
      onSuccess: () => setIsSaved(true)
    });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="text-primary" size={24} />
          <CardTitle className="font-cinzel text-xl">Evening Reflection</CardTitle>
        </div>
        <span className="text-sm font-mono text-muted-foreground">{today}</span>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="bg-primary/5 border-l-2 border-primary p-4 rounded-r-lg">
          <p className="font-serif italic text-sm text-foreground/80 leading-relaxed">
            "What did you do well today? Where did your discipline fail? What must improve tomorrow?"
          </p>
        </div>

        {isLoading ? (
          <div className="flex-1 min-h-[200px] bg-secondary/20 animate-pulse rounded-xl" />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your honest assessment here..."
            className="flex-1 min-h-[200px] w-full bg-background border border-border rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none font-inter text-foreground/90 leading-relaxed"
          />
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            {isSaved && (
              <>
                <CheckCircle2 size={14} className="text-primary" />
                <span className="text-primary">Recorded for history</span>
              </>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={saveEntry.isPending || !content.trim() || isSaved}
            className="px-6 py-2 rounded-lg font-semibold uppercase tracking-wider text-sm
              bg-primary text-primary-foreground 
              hover:bg-[#f9f295] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-primary disabled:hover:shadow-none
              transition-all duration-200"
          >
            {saveEntry.isPending ? "Inscribing..." : "Commit Entry"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
