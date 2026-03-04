import { useState } from "react";
import { ShieldAlert, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { motion } from "framer-motion";

const hardChallenges = [
  { id: 1, text: "Cold Shower (3+ mins)" },
  { id: 2, text: "Intermittent Fasting (16h+)" },
  { id: 3, text: "No Sugar / Processed Food" },
  { id: 4, text: "Intense Physical Training" },
];

export function DisciplineMode() {
  const [enabled, setEnabled] = useState(false);
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  const toggleChallenge = (id: number) => {
    setCompletedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const score = completedIds.length;
  const isPerfect = score === hardChallenges.length && enabled;

  return (
    <Card className={`transition-all duration-500 ${enabled ? 'border-primary shadow-[0_0_30px_rgba(212,175,55,0.1)]' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50 mb-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className={enabled ? "text-primary" : "text-muted-foreground"} size={24} />
          <CardTitle className="font-cinzel text-xl">Spartan Mode</CardTitle>
        </div>
        
        {/* Toggle Switch */}
        <button 
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary' : 'bg-secondary'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </CardHeader>
      
      <CardContent>
        {!enabled ? (
          <div className="text-center py-6 text-muted-foreground font-serif italic">
            "We must undergo a hard winter training and not rush into things unprepared."
            <br />
            <span className="text-xs uppercase tracking-widest mt-4 block text-primary/50">Toggle to awaken</span>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-6 bg-secondary/50 p-4 rounded-xl border border-primary/20">
              <span className="font-cinzel font-bold text-lg">Daily Score</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${isPerfect ? 'text-gold-gradient' : 'text-foreground'}`}>
                  {score}/{hardChallenges.length}
                </span>
                {isPerfect && <Zap className="text-primary fill-primary" size={20} />}
              </div>
            </div>

            <div className="space-y-3">
              {hardChallenges.map(challenge => {
                const isChecked = completedIds.includes(challenge.id);
                return (
                  <label 
                    key={challenge.id} 
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${isChecked ? 'bg-primary/5 border-primary/30' : 'bg-transparent border-border hover:border-primary/50'}
                    `}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors
                      ${isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}
                    `}>
                      {isChecked && <Zap size={12} className="fill-current" />}
                    </div>
                    <span className={`font-medium ${isChecked ? 'text-primary' : 'text-foreground'}`}>
                      {challenge.text}
                    </span>
                  </label>
                );
              })}
            </div>
            
            {isPerfect && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-6 text-center text-primary font-cinzel tracking-widest uppercase text-sm font-bold bg-primary/10 py-2 rounded border border-primary/20"
              >
                Honor Forged
              </motion.div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
