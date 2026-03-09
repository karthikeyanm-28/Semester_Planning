import { useMemo } from 'react';
import { differenceInDays, parseISO, isPast, isFuture, format } from 'date-fns';
import {
  Activity, CalendarDays, BookOpen, Award, ListTodo,
  Clock, AlertTriangle, TrendingUp, Flame, BookMarked,
  ArrowUpRight, Plus, ChevronRight,
} from 'lucide-react';
import { useAcademic } from '@/context/AcademicContext';
import { useUser } from '@/context/UserContext';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data } = useAcademic();
  const { user } = useUser();
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

    const subjectTaskCount = subjects.map(sub => {
      const subTasks = tasks.filter(t => t.subjectId === sub.id);
      const diffScore = sub.difficulty === 'High' ? 3 : sub.difficulty === 'Medium' ? 2 : 1;
      return { ...sub, taskCount: subTasks.length, score: subTasks.length * diffScore, completedCount: subTasks.filter(t => t.status === 'Completed').length };
    });
    const mostDemanding = subjectTaskCount.sort((a, b) => b.score - a.score)[0];
    const mostCompleted = subjectTaskCount.sort((a, b) => b.completedCount - a.completedCount)[0];
    const leastFocused = subjectTaskCount.filter(s => s.taskCount > 0).sort((a, b) => {
      const aComp = a.taskCount ? (a.completedCount / a.taskCount) * 100 : 100;
      const bComp = b.taskCount ? (b.completedCount / b.taskCount) * 100 : 100;
      return aComp - bComp;
    })[0];

    const riskScore = overdue * 3 + pending * 0.5;
    const risk = riskScore > 10 ? 'High' : riskScore > 4 ? 'Medium' : 'Low';

    return { semesterStatus, daysRemaining, totalCredits, pending, overdue, completion, elapsed, mostDemanding, mostCompleted, leastFocused, risk, inProgress, completed, totalDays };
  }, [semester, subjects, tasks]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'Completed' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [tasks]);

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unassigned';
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20';
      case 'Medium': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
      default: return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-2">
        <div>
          <h1 className="text-page-title">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground mt-2">Here's your semester overview</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Semester Status" 
          value={stats.semesterStatus} 
          icon={Activity} 
          trend={`${stats.daysRemaining} days left`}
          variant={stats.semesterStatus === 'Active' ? 'success' : 'warning'} 
        />
        <KpiCard 
          title="Days Remaining" 
          value={stats.daysRemaining} 
          icon={CalendarDays} 
          trend={`${stats.elapsed}% completed`}
          variant={stats.daysRemaining < 14 ? 'danger' : 'default'} 
        />
        <KpiCard 
          title="Total Subjects" 
          value={subjects.length} 
          icon={BookOpen}
          trend={`${stats.totalCredits} credits`}
        />
        <KpiCard 
          title="Task Completion" 
          value={`${stats.completion}%`} 
          icon={TrendingUp} 
          trend={`${stats.completed} / ${tasks.length} done`}
          variant={stats.completion > 70 ? 'success' : stats.completion > 40 ? 'warning' : 'danger'} 
        />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Pending Tasks" 
          value={stats.pending} 
          icon={Clock} 
          variant={stats.pending > 5 ? 'warning' : 'default'} 
        />
        <KpiCard 
          title="In Progress" 
          value={stats.inProgress} 
          icon={ListTodo}
        />
        <KpiCard 
          title="Overdue Tasks" 
          value={stats.overdue} 
          icon={AlertTriangle} 
          variant={stats.overdue > 0 ? 'danger' : 'success'} 
        />
        <KpiCard 
          title="Total Credits" 
          value={stats.totalCredits} 
          icon={Award}
          trend={`${subjects.length} subjects`}
        />
      </div>

      {/* Semester Progress & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semester Timeline */}
        <Card className="lg:col-span-1 border border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-section-title flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Semester Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Week {Math.ceil((stats.totalDays - stats.daysRemaining) / 7)} of {Math.ceil(stats.totalDays / 7)}</span>
                <span className="text-xs text-muted-foreground">{stats.elapsed}%</span>
              </div>
              <Progress value={stats.elapsed} className="h-2" />
            </div>
            <div className="pt-2 border-t border-border/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Days Remaining</span>
                <span className="font-semibold">{stats.daysRemaining} days</span>
              </div>
              {semester.endDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-semibold">{format(parseISO(semester.endDate), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Row - 3 Cards */}
        {stats.mostDemanding && (
          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-500" />
                Most Demanding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm">{stats.mostDemanding.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.mostDemanding.taskCount} tasks</p>
              </div>
              <div className="pt-2 border-t border-border/30">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">
                    {stats.mostDemanding.taskCount > 0 ? Math.round((stats.mostDemanding.completedCount / stats.mostDemanding.taskCount) * 100) : 0}%
                  </span>
                </div>
                <Progress value={stats.mostDemanding.taskCount > 0 ? (stats.mostDemanding.completedCount / stats.mostDemanding.taskCount) * 100 : 0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        )}

        {stats.mostCompleted && (
          <Card className="border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Best Performing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm">{stats.mostCompleted.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.mostCompleted.completedCount} of {stats.mostCompleted.taskCount} done</p>
              </div>
              <div className="pt-2 border-t border-border/30">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-semibold">
                    {stats.mostCompleted.taskCount > 0 ? Math.round((stats.mostCompleted.completedCount / stats.mostCompleted.taskCount) * 100) : 0}%
                  </span>
                </div>
                <Progress value={stats.mostCompleted.taskCount > 0 ? (stats.mostCompleted.completedCount / stats.mostCompleted.taskCount) * 100 : 0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <Card className="border border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-section-title">Upcoming Tasks</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {getSubjectName(task.subjectId)}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due {task.dueDate ? format(parseISO(task.dueDate), 'MMM d, yyyy') : 'No date'}
                    </p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
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
