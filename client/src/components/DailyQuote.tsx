import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const quotes = [
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "It is not death that a man should fear, but he should fear never beginning to live.", author: "Marcus Aurelius" },
  { text: "If it is not right do not do it; if it is not true do not say it.", author: "Marcus Aurelius" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "He who fears death will never do anything worth of a man who is alive.", author: "Seneca" },
];

export function DailyQuote() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // Pick a quote based on the day of the year so it stays consistent for the day
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    setQuote(quotes[dayOfYear % quotes.length]);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative p-8 rounded-2xl bg-gradient-to-br from-[#1c1c1c] to-[#0f0f0f] border border-primary/20 overflow-hidden flex flex-col justify-center min-h-[200px]"
    >
      <div className="absolute top-4 left-4 opacity-10">
        <Quote size={80} className="text-primary" />
      </div>
      
      <div className="relative z-10">
        <p className="font-cinzel text-xl md:text-2xl text-foreground/90 leading-relaxed italic mb-4">
          "{quote.text}"
        </p>
        <p className="font-inter text-primary tracking-widest text-sm font-semibold uppercase">
          — {quote.author}
        </p>
      </div>
      
      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-1/3 bg-gradient-to-r from-primary/50 to-transparent" />
    </motion.div>
  );
}
