import { useState, useMemo } from 'react';
import { differenceInWeeks, differenceInDays, parseISO, isWeekend, eachDayOfInterval } from 'date-fns';
import { useAcademic } from '@/context/AcademicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Semester } from '@/types/academic';

export default function SemesterConfig() {
  const { data, updateSemester } = useAcademic();
  const [form, setForm] = useState<Semester>(data.semester);
  const { toast } = useToast();

  const set = (key: keyof Semester, val: string) => setForm(p => ({ ...p, [key]: val }));

  const save = () => {
    updateSemester(form);
    toast({ title: 'Saved', description: 'Semester configuration updated.' });
  };

  const derived = useMemo(() => {
    if (!form.startDate || !form.endDate) return null;
    const start = parseISO(form.startDate);
    const end = parseISO(form.endDate);
    const totalWeeks = Math.max(0, differenceInWeeks(end, start));
    const remainingWeeks = Math.max(0, differenceInWeeks(end, new Date()));
    const allDays = eachDayOfInterval({ start, end });
    const activeDays = allDays.filter(d => !isWeekend(d)).length;
    return { totalWeeks, remainingWeeks, activeDays };
  }, [form.startDate, form.endDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Semester Configuration</h1>
        <p className="text-muted-foreground">Set up your semester details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Semester Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(['name', 'academicYear', 'department', 'institution'] as const).map(key => (
              <div key={key} className="space-y-1">
                <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                <Input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={`Enter ${key}`} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Date Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              ['startDate', 'Start Date'], ['endDate', 'End Date'],
              ['examStartDate', 'Exam Start'], ['examEndDate', 'Exam End'],
            ].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input type="date" value={form[key as keyof Semester]} onChange={e => set(key as keyof Semester, e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Derived Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {derived ? (
              <>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Weeks</span><span className="font-semibold">{derived.totalWeeks}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Remaining Weeks</span><span className="font-semibold">{derived.remainingWeeks}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Active Academic Days</span><span className="font-semibold">{derived.activeDays}</span></div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Set start and end dates to see derived info.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Button onClick={save}>Save Configuration</Button>
    </div>
  );
}
