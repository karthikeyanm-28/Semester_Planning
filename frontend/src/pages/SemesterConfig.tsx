import { useState, useMemo } from 'react';
import { differenceInWeeks, differenceInDays, parseISO, isWeekend, eachDayOfInterval, format } from 'date-fns';
import { GraduationCap, Calendar, BarChart3, Check, ChevronRight } from 'lucide-react';
import { useAcademic } from '@/context/AcademicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { Semester } from '@/types/academic';

export default function SemesterConfig() {
  const { data, updateSemester } = useAcademic();
  const [form, setForm] = useState<Semester>(data.semester);
  const [currentStep, setCurrentStep] = useState(1);
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

  const isStep1Valid = form.name && form.academicYear && form.institution;
  const isStep2Valid = form.startDate && form.endDate;
  const canProceed = currentStep === 1 ? isStep1Valid : currentStep === 2 ? isStep2Valid : true;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-page-title">Semester Setup</h1>
        <p className="text-muted-foreground mt-2">Configure your academic semester details</p>
      </div>

      {/* Step Indicator */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Step {currentStep} of 3</span>
          <span className="text-muted-foreground">{Math.round((currentStep / 3) * 100)}%</span>
        </div>
        <Progress value={(currentStep / 3) * 100} className="h-2" />
      </div>

      {/* Step 1: Semester Information */}
      <div className={currentStep === 1 ? 'space-y-6' : 'hidden'}>
        <Card className="border border-border/50">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-section-title">Semester Information</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Basic details about your semester</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold">Semester Name</Label>
                <Input 
                  id="name"
                  value={form.name} 
                  onChange={e => set('name', e.target.value)} 
                  placeholder="e.g., Fall 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-xs font-semibold">Academic Year</Label>
                <Input 
                  id="year"
                  value={form.academicYear} 
                  onChange={e => set('academicYear', e.target.value)} 
                  placeholder="e.g., 2024-2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution" className="text-xs font-semibold">Institution</Label>
                <Input 
                  id="institution"
                  value={form.institution} 
                  onChange={e => set('institution', e.target.value)} 
                  placeholder="e.g., Your University"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept" className="text-xs font-semibold">Department</Label>
                <Input 
                  id="dept"
                  value={form.department} 
                  onChange={e => set('department', e.target.value)} 
                  placeholder="e.g., Computer Science"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 2: Dates */}
      <div className={currentStep === 2 ? 'space-y-6' : 'hidden'}>
        <Card className="border border-border/50">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-section-title">Semester Dates</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Set the start and end dates</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-semibold">Semester Start</Label>
                <Input 
                  id="startDate"
                  type="date" 
                  value={form.startDate} 
                  onChange={e => set('startDate', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs font-semibold">Semester End</Label>
                <Input 
                  id="endDate"
                  type="date" 
                  value={form.endDate} 
                  onChange={e => set('endDate', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examStart" className="text-xs font-semibold">Exam Start</Label>
                <Input 
                  id="examStart"
                  type="date" 
                  value={form.examStartDate} 
                  onChange={e => set('examStartDate', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examEnd" className="text-xs font-semibold">Exam End</Label>
                <Input 
                  id="examEnd"
                  type="date" 
                  value={form.examEndDate} 
                  onChange={e => set('examEndDate', e.target.value)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 3: Derived Information */}
      <div className={currentStep === 3 ? 'space-y-6' : 'hidden'}>
        <Card className="border border-border/50">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-section-title">Semester Overview</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Calculated insights from your dates</p>
            </div>
          </CardHeader>
          <CardContent>
            {derived ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Weeks</p>
                  <p className="text-card-number text-emerald-600">{derived.totalWeeks}</p>
                  <p className="text-xs text-muted-foreground">weeks in semester</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Remaining Weeks</p>
                  <p className="text-card-number text-blue-600">{derived.remainingWeeks}</p>
                  <p className="text-xs text-muted-foreground">weeks left</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active Days</p>
                  <p className="text-card-number text-purple-600">{derived.activeDays}</p>
                  <p className="text-xs text-muted-foreground">weekdays</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Configure the date range to see semester insights</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg p-4">
          <div className="flex gap-3">
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">All set!</p>
              <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">Your semester configuration is ready. Click save to finalize.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between pt-4 border-t border-border/30">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        <div className="flex gap-3">
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed}
              className="bg-primary hover:bg-primary/90"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={save}
              className="bg-primary hover:bg-primary/90"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
