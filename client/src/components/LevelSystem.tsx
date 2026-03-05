import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Progress } from "./ui/progress";
import { Trophy, Star } from "lucide-react";

const RANKS = [
  { level: 46, title: "Eternal" },
  { level: 41, title: "Ascendant" },
  { level: 36, title: "Stoic" },
  { level: 31, title: "Iron Mind" },
  { level: 26, title: "Spartan" },
  { level: 21, title: "Warrior" },
  { level: 16, title: "Practitioner" },
  { level: 11, title: "Disciplined" },
  { level: 6, title: "Initiate" },
  { level: 1, title: "Recruit" },
];

export function LevelSystem() {
  const { data: stats } = useQuery({ queryKey: [api.userStats.get.path], queryFn: async () => (await fetch(api.userStats.get.path)).json() });
  if (!stats) return null;
  const level = stats.level;
  const xpInLevel = stats.totalXp % 100;
  const rank = RANKS.find(r => level >= r.level)?.title || "Recruit";

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <CardHeader className="pb-2"><CardTitle className="font-cinzel text-xl flex items-center gap-2"><Trophy className="text-primary" size={20} /> Mastery</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-end">
          <div><div className="text-sm uppercase tracking-tighter text-muted-foreground font-bold">Rank: {rank}</div><div className="text-3xl font-bold font-cinzel">Level {level}</div></div>
          <div className="text-right text-xs font-bold text-primary">{stats.totalXp} Total XP</div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground"><span>Progress to Level {level + 1}</span><span>{xpInLevel}%</span></div>
          <Progress value={xpInLevel} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AchievementSystem() {
  const { data: achs } = useQuery({ queryKey: [api.achievements.list.path], queryFn: async () => (await fetch(api.achievements.list.path)).json() });
  return (
    <Card>
      <CardHeader><CardTitle className="font-cinzel text-xl flex items-center gap-2"><Star className="text-primary" size={20} /> Achievements</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {achs?.map((a: any) => (
          <div key={a.id} className={`p-3 rounded-lg border flex flex-col gap-1 transition-all ${a.unlockedAt ? 'bg-primary/10 border-primary/50' : 'bg-secondary/10 border-border/30 opacity-50'}`}>
            <span className="text-xs font-bold">{a.isSecret && !a.unlockedAt ? "???" : a.name}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{a.isSecret && !a.unlockedAt ? "Remain disciplined to uncover." : a.description}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
