import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, eachMonthOfInterval, isSameMonth } from "date-fns";
import { Activity } from "lucide-react";
import { useState } from "react";
import { useFocusSessions } from "@/hooks/use-local-storage";

export function ProgressDashboard() {
  const [range, setRange] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Week');
  const { data: sessions } = useFocusSessions();

  const getData = () => {
    if (!sessions) return [];
    const now = new Date();
    if (range === 'Day') {
      const todaySessions = sessions.filter((s: any) => s.date === format(now, 'yyyy-MM-dd'));
      return [{ name: format(now, 'EEE'), value: todaySessions.reduce((acc: number, s: any) => acc + s.durationMinutes, 0) }];
    }
    if (range === 'Week') {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end: now }).map(d => ({
        name: format(d, 'EEE'),
        value: sessions.filter((s: any) => s.date === format(d, 'yyyy-MM-dd')).reduce((acc: number, s: any) => acc + s.durationMinutes, 0)
      }));
    }
    if (range === 'Month') {
      const start = startOfMonth(now);
      return eachDayOfInterval({ start, end: now }).map(d => ({
        name: format(d, 'd'),
        value: sessions.filter((s: any) => s.date === format(d, 'yyyy-MM-dd')).reduce((acc: number, s: any) => acc + s.durationMinutes, 0)
      }));
    }
    if (range === 'Year') {
      const start = startOfYear(now);
      return eachMonthOfInterval({ start, end: now }).map(m => ({
        name: format(m, 'MMM'),
        value: sessions.filter((s: any) => isSameMonth(new Date(s.date), m)).reduce((acc: number, s: any) => acc + s.durationMinutes, 0)
      }));
    }
    return [];
  };

  const chartData = getData();

  const formatYAxis = (value: number) => {
    if (value === 0) return '0';
    if (value < 60) return `${value}m`;
    const hours = Math.floor(value / 60);
    const mins = value % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="flex items-center gap-3"><Activity className="text-primary" size={24} /><CardTitle className="font-cinzel text-xl">Focus Trends</CardTitle></div>
        <div className="flex bg-secondary/30 p-1 rounded-lg">
          {['Day', 'Week', 'Month', 'Year'].map(r => (
            <button key={r} onClick={() => setRange(r as any)} className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${range === r ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>{r}</button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                tickFormatter={formatYAxis}
                width={40}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                formatter={(value: number) => [formatYAxis(value), 'Focus Time']}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
