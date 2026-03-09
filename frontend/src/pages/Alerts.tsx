import { useMemo } from 'react';
import { isPast, parseISO, differenceInDays, isFuture } from 'date-fns';
import { format } from 'date-fns';
import { AlertTriangle, Clock, BookOpen, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAcademic } from '@/context/AcademicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/shared/KpiCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const alertsByType = {
    overdue: alerts.filter(a => a.type === 'overdue'),
    upcoming: alerts.filter(a => a.type === 'upcoming'),
    risk: alerts.filter(a => a.type === 'risk'),
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'overdue':
        return {
          bg: 'bg-rose-50 dark:bg-rose-900/10',
          border: 'border-rose-200 dark:border-rose-800/30',
          icon: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
          icon_component: Clock,
        };
      case 'upcoming':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/10',
          border: 'border-amber-200 dark:border-amber-800/30',
          icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
          icon_component: AlertTriangle,
        };
      case 'risk':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/10',
          border: 'border-purple-200 dark:border-purple-800/30',
          icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
          badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
          icon_component: ShieldAlert,
        };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-page-title">Alerts & Risk Management</h1>
        <p className="text-muted-foreground mt-2">{alerts.length} active alerts</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard 
          title="Overdue Tasks" 
          value={counts.overdue} 
          icon={Clock} 
          variant={counts.overdue > 0 ? 'danger' : 'success'}
          trend={counts.overdue > 0 ? 'Requires action' : 'All good'}
        />
        <KpiCard 
          title="Upcoming Exams" 
          value={counts.upcoming} 
          icon={AlertTriangle} 
          variant={counts.upcoming > 0 ? 'warning' : 'default'}
          trend={counts.upcoming > 0 ? 'Prepare now' : 'None due soon'}
        />
        <KpiCard 
          title="At-Risk Subjects" 
          value={counts.risk} 
          icon={ShieldAlert} 
          variant={counts.risk > 0 ? 'danger' : 'success'}
          trend={counts.risk > 0 ? 'Focus needed' : 'On track'}
        />
      </div>

      {/* Alerts */}
      {alerts.length === 0 ? (
        <Card className="border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-900/10">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-3" />
            <p className="font-semibold text-emerald-900 dark:text-emerald-100">Everything looks great!</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">No active alerts at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overdue" className="w-full">
          <TabsList className="bg-muted/50 border border-border/50">
            {['overdue', 'upcoming', 'risk'].map(type => {
              const count = type === 'overdue' ? counts.overdue : type === 'upcoming' ? counts.upcoming : counts.risk;
              const label = type === 'overdue' ? 'Overdue' : type === 'upcoming' ? 'Exams' : 'At Risk';
              return (
                <TabsTrigger key={type} value={type} className="gap-2">
                  <span>{label}</span>
                  {count > 0 && <span className="bg-destructive/20 text-destructive px-2 py-0.5 rounded text-xs font-semibold">{count}</span>}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {['overdue', 'upcoming', 'risk'].map(typeKey => {
            const typeAlerts = alertsByType[typeKey as keyof typeof alertsByType];
            const styles = getAlertStyles(typeKey);
            const Icon = styles.icon_component;

            return (
              <TabsContent key={typeKey} value={typeKey} className="mt-6">
                {typeAlerts.length === 0 ? (
                  <Card className="border border-dashed border-border/50">
                    <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                      <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="text-muted-foreground">No {typeKey} alerts</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {typeAlerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`${styles.bg} border ${styles.border} rounded-lg p-4 flex items-start gap-4 hover:shadow-md-soft transition-all duration-300`}
                      >
                        <div className={`p-3 rounded-lg flex-shrink-0 ${styles.icon}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded flex-shrink-0 whitespace-nowrap ${styles.badge}`}>
                          {alert.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
