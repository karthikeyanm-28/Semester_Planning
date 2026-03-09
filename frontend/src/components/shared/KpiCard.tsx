import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  success: {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    accent: 'text-amber-600 dark:text-amber-400',
  },
  danger: {
    icon: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    accent: 'text-rose-600 dark:text-rose-400',
  },
};

export function KpiCard({ title, value, icon: Icon, description, trend, variant = 'default' }: KpiCardProps) {
  const styles = variantStyles[variant];
  
  return (
    <Card className="hover:shadow-md-soft hover:border-primary/20 transition-all duration-300 border border-border/50 group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with Icon */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
              <p className="text-card-number font-bold tracking-tight">{value}</p>
            </div>
            <div className={cn('p-3 rounded-lg', styles.icon)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>

          {/* Description and Trend */}
          {(description || trend) && (
            <div className="space-y-2 pt-2 border-t border-border/30">
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              {trend && (
                <p className={cn('text-xs font-semibold', styles.accent)}>
                  {trend}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
