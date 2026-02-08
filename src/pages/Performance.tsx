import { useMemo } from 'react';
import { isPast, parseISO } from 'date-fns';
import { useAcademic } from '@/context/AcademicContext';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TrendingUp, Target, Zap, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(215, 55%, 28%)', 'hsl(152, 60%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(280, 60%, 50%)'];

export default function Performance() {
  const { data } = useAcademic();

  const stats = useMemo(() => {
    const { tasks, subjects } = data;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const total = tasks.length;
    const completion = total ? Math.round((completed / total) * 100) : 0;

    // Deadline adherence: completed tasks that were completed before due date (simplified: all completed = adhered)
    const adherence = total ? Math.round((completed / total) * 100) : 100;

    // Weekly productivity: completed tasks this week (simplified)
    const weeklyScore = Math.min(100, completed * 10);

    const subjectPerf = subjects.map(sub => {
      const subTasks = tasks.filter(t => t.subjectId === sub.id);
      const subCompleted = subTasks.filter(t => t.status === 'Completed').length;
      const subOverdue = subTasks.filter(t => t.status === 'Overdue' || (t.status !== 'Completed' && t.dueDate && isPast(parseISO(t.dueDate)))).length;
      const productivity = subTasks.length ? Math.round((subCompleted / subTasks.length) * 100) : 0;
      const consistency = subTasks.length ? Math.round(((subTasks.length - subOverdue) / subTasks.length) * 100) : 100;
      return { name: sub.name, productivity, delayFrequency: subOverdue, consistency, total: subTasks.length, completed: subCompleted };
    });

    const statusData = [
      { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length },
      { name: 'Pending', value: tasks.filter(t => t.status === 'Pending').length },
      { name: 'Overdue', value: tasks.filter(t => t.status === 'Overdue').length },
    ].filter(d => d.value > 0);

    return { completion, adherence, weeklyScore, subjectPerf, statusData };
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Performance & Analytics</h1>
        <p className="text-muted-foreground">Track your academic performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Semester Completion" value={`${stats.completion}%`} icon={TrendingUp} variant={stats.completion > 60 ? 'success' : 'warning'} />
        <KpiCard title="Deadline Adherence" value={`${stats.adherence}%`} icon={Target} variant={stats.adherence > 70 ? 'success' : 'danger'} />
        <KpiCard title="Productivity Score" value={stats.weeklyScore} icon={Zap} variant={stats.weeklyScore > 50 ? 'success' : 'warning'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Subject Performance</CardTitle></CardHeader>
          <CardContent>
            {stats.subjectPerf.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects to analyze</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.subjectPerf}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="productivity" fill="hsl(215, 55%, 28%)" radius={[4, 4, 0, 0]} name="Productivity %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Task Distribution</CardTitle></CardHeader>
          <CardContent>
            {stats.statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks to analyze</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats.statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {stats.statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.subjectPerf.map(sub => (
          <Card key={sub.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{sub.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Productivity</span><span className="font-medium">{sub.productivity}%</span></div>
              <Progress value={sub.productivity} className="h-2" />
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delay Frequency</span><span className="font-medium">{sub.delayFrequency}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Consistency</span><StatusBadge status={sub.consistency > 70 ? 'On Track' : 'At Risk'} /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
