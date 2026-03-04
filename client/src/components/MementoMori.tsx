import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { motion } from "framer-motion";

export function MementoMori() {
  // Assume an average lifespan of 80 years = 4160 weeks
  const totalWeeks = 4160;
  // Let's assume the user is 25 for visual demonstration purposes
  // In a real app, you'd ask for their birthdate.
  const assumedAge = 25; 
  const livedWeeks = assumedAge * 52;
  const percentage = (livedWeeks / totalWeeks) * 100;

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="font-cinzel flex items-center justify-between">
          <span className="text-gold-gradient text-2xl">Memento Mori</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground italic font-serif">
          "You could leave life right now. Let that determine what you do and say and think."
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          <div className="flex justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <span>Time Lived</span>
            <span>Time Remaining</span>
          </div>
          
          <div className="h-4 w-full bg-secondary rounded-full overflow-hidden flex shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary/60 to-primary relative"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-30" />
            </motion.div>
          </div>
          
          <div className="text-right text-xs text-muted-foreground">
            Approx. {Math.max(0, totalWeeks - livedWeeks).toLocaleString()} weeks left.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
