import { useMemo } from 'react';
import { isPast, parseISO } from 'date-fns';
import { useAcademic } from '@/context/AcademicContext';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, ListTodo, CheckCircle, XCircle, Flame, Trophy } from 'lucide-react';

export default function Summary() {
  const { data } = useAcademic();

  const stats = useMemo(() => {
    const { subjects, tasks } = data;
    const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const missed = tasks.filter(t => t.status !== 'Completed' && t.dueDate && isPast(parseISO(t.dueDate))).length;

    const subjectStats = subjects.map(sub => {
      const subTasks = tasks.filter(t => t.subjectId === sub.id);
      const subCompleted = subTasks.filter(t => t.status === 'Completed').length;
      const pct = subTasks.length ? Math.round((subCompleted / subTasks.length) * 100) : 0;
      const diffScore = sub.difficulty === 'High' ? 3 : sub.difficulty === 'Medium' ? 2 : 1;
      return { ...sub, taskCount: subTasks.length, completedCount: subCompleted, pct, demandScore: subTasks.length * diffScore };
    });

    const mostDemanding = [...subjectStats].sort((a, b) => b.demandScore - a.demandScore)[0];
    const bestManaged = [...subjectStats].sort((a, b) => b.pct - a.pct)[0];

    return { totalCredits, completed, missed, mostDemanding, bestManaged };
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Summary & Insights</h1>
        <p className="text-muted-foreground">Read-only overview of your semester</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Subjects" value={data.subjects.length} icon={BookOpen} />
        <KpiCard title="Total Credits" value={stats.totalCredits} icon={Award} />
        <KpiCard title="Tasks Created" value={data.tasks.length} icon={ListTodo} />
        <KpiCard title="Tasks Completed" value={stats.completed} icon={CheckCircle} variant="success" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Missed Deadlines" value={stats.missed} icon={XCircle} variant={stats.missed > 0 ? 'danger' : 'success'} />
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4 text-rose-500" /> Most Demanding</CardTitle></CardHeader>
          <CardContent>
            {stats.mostDemanding ? (
              <div>
                <p className="font-semibold">{stats.mostDemanding.name}</p>
                <p className="text-xs text-muted-foreground">{stats.mostDemanding.taskCount} tasks · {stats.mostDemanding.difficulty} difficulty</p>
              </div>
            ) : <p className="text-sm text-muted-foreground">No data</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Best Managed</CardTitle></CardHeader>
          <CardContent>
            {stats.bestManaged ? (
              <div>
                <p className="font-semibold">{stats.bestManaged.name}</p>
                <p className="text-xs text-muted-foreground">{stats.bestManaged.pct}% complete · {stats.bestManaged.completedCount}/{stats.bestManaged.taskCount} tasks</p>
              </div>
            ) : <p className="text-sm text-muted-foreground">No data</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
