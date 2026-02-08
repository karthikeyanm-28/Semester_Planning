import { useState, useMemo } from 'react';
import { useAcademic } from '@/context/AcademicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KpiCard } from '@/components/shared/KpiCard';
import { Clock, AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PERIODS: ('Morning' | 'Afternoon' | 'Evening')[] = ['Morning', 'Afternoon', 'Evening'];

export default function WeeklyPlanner() {
  const { data, addWeeklyPlan, updateWeeklyPlan } = useAcademic();
  const { toast } = useToast();

  const currentPlan = data.weeklyPlans[0] || { id: crypto.randomUUID(), weekStart: new Date().toISOString().slice(0, 10), blocks: [] };
  const [blocks, setBlocks] = useState(currentPlan.blocks);

  const getBlock = (day: string, period: string) => blocks.find(b => b.day === day && b.period === period);

  const setBlock = (day: string, period: 'Morning' | 'Afternoon' | 'Evening', subjectId: string) => {
    setBlocks(prev => {
      const filtered = prev.filter(b => !(b.day === day && b.period === period));
      if (subjectId) filtered.push({ day, period, subjectId, actual: false });
      return filtered;
    });
  };

  const toggleActual = (day: string, period: string) => {
    setBlocks(prev => prev.map(b => b.day === day && b.period === period ? { ...b, actual: !b.actual } : b));
  };

  const savePlan = () => {
    const plan = { ...currentPlan, blocks };
    if (data.weeklyPlans.length) updateWeeklyPlan(plan);
    else addWeeklyPlan(plan);
    toast({ title: 'Saved', description: 'Weekly plan updated.' });
  };

  const stats = useMemo(() => {
    const planned = blocks.length * 2; // 2 hrs per block
    const actual = blocks.filter(b => b.actual).length * 2;
    const overloaded = DAYS.filter(d => blocks.filter(b => b.day === d).length >= 3);
    const underused = DAYS.filter(d => blocks.filter(b => b.day === d).length === 0);
    return { planned, actual, overloaded, underused };
  }, [blocks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weekly Study Planner</h1>
          <p className="text-muted-foreground">Plan and track your study blocks</p>
        </div>
        <Button onClick={savePlan}>Save Plan</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Planned Hours" value={stats.planned} icon={Clock} />
        <KpiCard title="Actual Hours" value={stats.actual} icon={CheckCircle} variant="success" />
        <KpiCard title="Overloaded Days" value={stats.overloaded.length} icon={AlertTriangle} variant={stats.overloaded.length > 0 ? 'warning' : 'default'} description={stats.overloaded.join(', ') || 'None'} />
        <KpiCard title="Underutilized Days" value={stats.underused.length} icon={TrendingDown} variant={stats.underused.length > 2 ? 'danger' : 'default'} description={stats.underused.join(', ') || 'None'} />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground w-24">Period</th>
                {DAYS.map(d => <th key={d} className="p-3 text-center text-sm font-medium text-muted-foreground">{d.slice(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period} className="border-b last:border-0">
                  <td className="p-3 text-sm font-medium">{period}</td>
                  {DAYS.map(day => {
                    const block = getBlock(day, period);
                    return (
                      <td key={day} className="p-2">
                        <div className="space-y-1">
                          <Select value={block?.subjectId || ''} onValueChange={v => setBlock(day, period, v)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {data.subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {block && (
                            <button
                              onClick={() => toggleActual(day, period)}
                              className={`w-full text-[10px] rounded py-0.5 ${block.actual ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}`}
                            >
                              {block.actual ? '✓ Done' : 'Mark done'}
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
