import { MementoMori } from "@/components/MementoMori";
import { DailyQuote } from "@/components/DailyQuote";
import { HabitTracker } from "@/components/HabitTracker";
import { DisciplineMode } from "@/components/DisciplineMode";
import { DistractionTracker } from "@/components/DistractionTracker";
import { DailyJournal } from "@/components/DailyJournal";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { FocusMode } from "@/components/FocusMode";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-foreground pb-20">
      {/* Top Navigation / Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="text-primary fill-primary/20" size={28} />
            <h1 className="font-cinzel text-2xl font-bold tracking-widest text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">FORGE</h1>
          </div>
          <p className="hidden md:block font-serif italic text-muted-foreground text-sm">
            Forge Discipline Daily.
          </p>
          <div className="flex gap-4 font-cinzel text-xs uppercase tracking-widest font-semibold">
            <span className="text-primary cursor-pointer border-b border-primary">Dashboard</span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">History</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          
          {/* Left Column (Focus & Action) */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div variants={itemVariants}>
              <FocusMode />
            </motion.div>

            <motion.div variants={itemVariants}>
              <HabitTracker />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DisciplineMode />
            </motion.div>
          </div>

          {/* Right Column (Reflection & Perspective) */}
          <div className="lg:col-span-7 space-y-8 flex flex-col">
            <motion.div variants={itemVariants}>
              <DailyQuote />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DistractionTracker />
            </motion.div>

            <motion.div variants={itemVariants} className="flex-1">
              <DailyJournal />
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <ProgressDashboard />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <MementoMori />
              </motion.div>
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
