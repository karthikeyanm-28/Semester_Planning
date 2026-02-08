import { useMemo } from 'react';
import { isPast, parseISO, differenceInDays, isFuture } from 'date-fns';
import { format } from 'date-fns';
import { AlertTriangle, Clock, BookOpen, ShieldAlert } from 'lucide-react';
import { useAcademic } from '@/context/AcademicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'overdue' | 'upcoming' | 'risk';
  severity: 'High' | 'Medium' | 'Low';
}

export default function Alerts() {
  const { data } = useAcademic();

  const alerts = useMemo(() => {
    const result: Alert[] = [];
    const today = new Date();

    // Overdue tasks
    data.tasks.forEach(t => {
      if (t.status !== 'Completed' && t.dueDate && isPast(parseISO(t.dueDate))) {
        result.push({
          id: `overdue-${t.id}`,
          title: `Overdue: ${t.title}`,
          description: `Due ${format(parseISO(t.dueDate), 'MMM d')} · ${data.subjects.find(s => s.id === t.subjectId)?.name || 'Unassigned'}`,
          type: 'overdue',
          severity: 'High',
        });
      }
    });

    // Upcoming exams (within 7 days)
    data.tasks.filter(t => t.type === 'Exam' && t.status !== 'Completed' && t.dueDate).forEach(t => {
      const d = parseISO(t.dueDate);
      const days = differenceInDays(d, today);
      if (days >= 0 && days <= 7) {
        result.push({
          id: `exam-${t.id}`,
          title: `Upcoming Exam: ${t.title}`,
          description: `In ${days} day${days !== 1 ? 's' : ''} · ${data.subjects.find(s => s.id === t.subjectId)?.name || ''}`,
          type: 'upcoming',
          severity: days <= 2 ? 'High' : 'Medium',
        });
      }
    });

    // High-risk subjects
    data.subjects.forEach(sub => {
      const subTasks = data.tasks.filter(t => t.subjectId === sub.id);
      const overdue = subTasks.filter(t => t.status !== 'Completed' && t.dueDate && isPast(parseISO(t.dueDate))).length;
      const completed = subTasks.filter(t => t.status === 'Completed').length;
      const pct = subTasks.length ? (completed / subTasks.length) * 100 : 100;
      if (overdue >= 2 || pct < 30) {
        result.push({
          id: `risk-${sub.id}`,
          title: `High Risk: ${sub.name}`,
          description: `${overdue} overdue · ${Math.round(pct)}% complete`,
          type: 'risk',
          severity: overdue >= 3 || pct < 20 ? 'High' : 'Medium',
        });
      }
    });

    return result;
  }, [data]);

  const counts = {
    overdue: alerts.filter(a => a.type === 'overdue').length,
    upcoming: alerts.filter(a => a.type === 'upcoming').length,
    risk: alerts.filter(a => a.type === 'risk').length,
  };

  const icons = { overdue: Clock, upcoming: AlertTriangle, risk: ShieldAlert };
  const labels = { overdue: 'Overdue Alerts', upcoming: 'Exam Alerts', risk: 'Risk Alerts' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alerts & Risk Management</h1>
        <p className="text-muted-foreground">{alerts.length} active alerts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Overdue Tasks" value={counts.overdue} icon={Clock} variant={counts.overdue > 0 ? 'danger' : 'success'} />
        <KpiCard title="Upcoming Exams" value={counts.upcoming} icon={AlertTriangle} variant={counts.upcoming > 0 ? 'warning' : 'default'} />
        <KpiCard title="At-Risk Subjects" value={counts.risk} icon={ShieldAlert} variant={counts.risk > 0 ? 'danger' : 'success'} />
      </div>

      {alerts.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">🎉 No active alerts. Everything looks good!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg ${alert.type === 'overdue' ? 'bg-rose-100 text-rose-700' : alert.type === 'upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                  {alert.type === 'overdue' ? <Clock className="h-5 w-5" /> : alert.type === 'upcoming' ? <AlertTriangle className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
                <StatusBadge status={alert.severity} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
