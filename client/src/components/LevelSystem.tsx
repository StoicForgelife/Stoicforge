import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Progress } from "./ui/progress";
import { Trophy, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <Card className="bg-gradient-to-br from-primary/10 via-transparent to-transparent border-primary/30 relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Trophy size={120} className="text-primary" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="font-cinzel text-xl flex items-center gap-2">
          <Trophy className="text-primary animate-pulse" size={20} /> 
          Identity & Rank
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-end relative z-10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-primary font-bold">{rank}</div>
            <div className="text-4xl font-bold font-cinzel text-foreground tracking-tighter">Level {level}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Total Discipline</div>
            <div className="text-lg font-mono font-bold text-primary">{stats.totalXp} XP</div>
          </div>
        </div>
        <div className="space-y-1 relative z-10">
          <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
            <span>Progress to Next Rank</span>
            <span>{xpInLevel}%</span>
          </div>
          <div className="h-3 bg-secondary/50 rounded-full overflow-hidden border border-white/5">
             <motion.div 
               className="h-full bg-gradient-to-r from-primary/40 to-primary shadow-[0_0_15px_rgba(212,175,55,0.4)]"
               initial={{ width: 0 }}
               animate={{ width: `${xpInLevel}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
             />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AchievementSystem() {
  const { data: achs } = useQuery({ queryKey: [api.achievements.list.path], queryFn: async () => (await fetch(api.achievements.list.path)).json() });
  
  return (
    <Card className="border-white/5">
      <CardHeader>
        <CardTitle className="font-cinzel text-xl flex items-center gap-2">
          <Star className="text-primary" size={20} /> 
          Honors & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {achs?.map((a: any) => (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            key={a.id} 
            className={`p-3 rounded-xl border flex flex-col gap-1 transition-all duration-500 relative overflow-hidden ${a.unlockedAt ? 'bg-primary/10 border-primary/50 shadow-[0_0_10px_rgba(212,175,55,0.1)]' : 'bg-secondary/10 border-border/30 opacity-40 grayscaled'}`}
          >
            {a.unlockedAt && <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/40" />}
            <span className="text-xs font-bold tracking-tight">{a.isSecret && !a.unlockedAt ? "???" : a.name}</span>
            <span className="text-[9px] text-muted-foreground leading-tight uppercase tracking-tighter">
              {a.isSecret && !a.unlockedAt ? "A hidden path of discipline." : a.description}
            </span>
            {a.unlockedAt && (
              <div className="mt-1 text-[8px] text-primary font-bold italic">Unlocked {format(new Date(a.unlockedAt), 'MMM d')}</div>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
