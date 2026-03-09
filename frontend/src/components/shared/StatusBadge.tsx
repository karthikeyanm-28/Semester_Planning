import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'On Track': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
  'Upcoming': 'bg-amber-100 text-amber-800 border-amber-200',
  'Overdue': 'bg-rose-100 text-rose-800 border-rose-200',
  'At Risk': 'bg-rose-100 text-rose-800 border-rose-200',
  'Low': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Medium': 'bg-amber-100 text-amber-800 border-amber-200',
  'High': 'bg-rose-100 text-rose-800 border-rose-200',
  'Active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Ending Soon': 'bg-amber-100 text-amber-800 border-amber-200',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusColors[status] || 'bg-muted text-muted-foreground', className)}>
      {status}
    </Badge>
  );
}
