import { useMemo } from 'react';
import { differenceInDays, parseISO, isPast, isFuture } from 'date-fns';
import {
  Activity, CalendarDays, BookOpen, Award, ListTodo,
  Clock, AlertTriangle, TrendingUp, Flame, BookMarked,
} from 'lucide-react';
import { useAcademic } from '@/context/AcademicContext';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { data } = useAcademic();
  const { semester, subjects, tasks } = data;

  const stats = useMemo(() => {
    const today = new Date();
    const start = semester.startDate ? parseISO(semester.startDate) : today;
    const end = semester.endDate ? parseISO(semester.endDate) : today;
    const daysRemaining = Math.max(0, differenceInDays(end, today));
    const totalDays = Math.max(1, differenceInDays(end, start));
    const elapsed = Math.min(100, Math.round(((totalDays - daysRemaining) / totalDays) * 100));

    const semesterStatus = !semester.endDate ? 'Not Set' : daysRemaining <= 14 ? 'Ending Soon' : 'Active';
    const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);

    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const overdue = tasks.filter(t => t.status === 'Overdue' || (t.status !== 'Completed' && t.dueDate && isPast(parseISO(t.dueDate)))).length;
    const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    // Most demanding = most tasks + highest difficulty
    const subjectTaskCount = subjects.map(sub => {
      const subTasks = tasks.filter(t => t.subjectId === sub.id);
      const diffScore = sub.difficulty === 'High' ? 3 : sub.difficulty === 'Medium' ? 2 : 1;
      return { ...sub, taskCount: subTasks.length, score: subTasks.length * diffScore, completedCount: subTasks.filter(t => t.status === 'Completed').length };
    });
    const mostDemanding = subjectTaskCount.sort((a, b) => b.score - a.score)[0];
    const leastFocused = subjectTaskCount.sort((a, b) => a.completedCount - b.completedCount)[0];

    const riskScore = overdue * 3 + pending * 0.5;
    const risk = riskScore > 10 ? 'High' : riskScore > 4 ? 'Medium' : 'Low';

    return { semesterStatus, daysRemaining, totalCredits, pending, overdue, completion, elapsed, mostDemanding, leastFocused, risk };
  }, [semester, subjects, tasks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Semester overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Semester Status" value={stats.semesterStatus} icon={Activity} variant={stats.semesterStatus === 'Active' ? 'success' : 'warning'} />
        <KpiCard title="Days Remaining" value={stats.daysRemaining} icon={CalendarDays} variant={stats.daysRemaining < 14 ? 'danger' : 'default'} />
        <KpiCard title="Total Subjects" value={subjects.length} icon={BookOpen} />
        <KpiCard title="Total Credits" value={stats.totalCredits} icon={Award} />
        <KpiCard title="Total Tasks" value={tasks.length} icon={ListTodo} />
        <KpiCard title="Pending Tasks" value={stats.pending} icon={Clock} variant={stats.pending > 5 ? 'warning' : 'default'} />
        <KpiCard title="Overdue Tasks" value={stats.overdue} icon={AlertTriangle} variant={stats.overdue > 0 ? 'danger' : 'success'} />
        <KpiCard title="Completion" value={`${stats.completion}%`} icon={TrendingUp} variant={stats.completion > 70 ? 'success' : stats.completion > 40 ? 'warning' : 'danger'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Semester Timeline</CardTitle></CardHeader>
          <CardContent>
            <Progress value={stats.elapsed} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">{stats.elapsed}% of semester elapsed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4 text-rose-500" /> Most Demanding</CardTitle></CardHeader>
          <CardContent>
            {stats.mostDemanding ? (
              <div>
                <p className="font-semibold">{stats.mostDemanding.name}</p>
                <p className="text-xs text-muted-foreground">{stats.mostDemanding.taskCount} tasks · {stats.mostDemanding.difficulty} difficulty</p>
              </div>
            ) : <p className="text-sm text-muted-foreground">No subjects yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BookMarked className="h-4 w-4 text-amber-500" /> Academic Risk</CardTitle></CardHeader>
          <CardContent>
            <StatusBadge status={stats.risk} />
            <p className="text-xs text-muted-foreground mt-1">Based on overdue & pending tasks</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
