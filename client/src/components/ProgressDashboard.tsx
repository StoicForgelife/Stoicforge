import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays } from "date-fns";
import { Activity } from "lucide-react";

// For MVP, we will mock the last 7 days of data since fetching and aggregating 
// requires a slightly more complex backend endpoint than provided in the scope.
// This demonstrates the visual capability required.
const generateMockData = () => {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      name: format(d, 'EEE'),
      score: Math.floor(Math.random() * 8) + 2 // Random score between 2-10
    };
  });
};

const data = generateMockData();

export function ProgressDashboard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-6">
        <Activity className="text-primary" size={24} />
        <CardTitle className="font-cinzel text-xl">Consistency Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
