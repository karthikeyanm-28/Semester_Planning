import { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, GraduationCap, Clock, Target, AlertCircle } from 'lucide-react';
import { useAcademic } from '@/context/AcademicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Progress } from '@/components/ui/progress';
import type { Subject } from '@/types/academic';

const empty: Subject = { id: '', name: '', code: '', credits: 3, faculty: '', weeklyHours: 3, difficulty: 'Medium', targetGrade: 'A' };

export default function Subjects() {
  const { data, addSubject, updateSubject, deleteSubject } = useAcademic();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Subject>(empty);
  const [editing, setEditing] = useState(false);

  const openAdd = () => { setForm({ ...empty, id: crypto.randomUUID() }); setEditing(false); setOpen(true); };
  const openEdit = (s: Subject) => { setForm(s); setEditing(true); setOpen(true); };
  const save = () => {
    editing ? updateSubject(form) : addSubject(form);
    setOpen(false);
  };
  const set = (key: keyof Subject, val: any) => setForm(p => ({ ...p, [key]: val }));

  const totalCredits = data.subjects.reduce((s, sub) => s + sub.credits, 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'High':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'At Risk':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-page-title">Subjects & Credits</h1>
          <div className="flex gap-4 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">{data.subjects.length} subjects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent"></div>
              <span className="text-muted-foreground">{totalCredits} total credits</span>
            </div>
          </div>
        </div>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {data.subjects.length === 0 ? (
        <Card className="border border-dashed border-border/50">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No subjects added yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Click "Add Subject" to get started with your semester</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.subjects.map(sub => {
            const subTasks = data.tasks.filter(t => t.subjectId === sub.id);
            const completed = subTasks.filter(t => t.status === 'Completed').length;
            const pct = subTasks.length ? Math.round((completed / subTasks.length) * 100) : 0;
            const status = pct >= 70 ? 'On Track' : subTasks.some(t => t.status === 'Overdue') ? 'At Risk' : 'On Track';

            return (
              <Card key={sub.id} className="hover:shadow-md-soft border border-border/50 hover:border-primary/20 transition-all duration-300 group flex flex-col">
                {/* Header */}
                <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 border-b border-border/30">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{sub.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{sub.code}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => openEdit(sub)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400" onClick={() => deleteSubject(sub.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="flex-1 py-4 space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Credits
                      </div>
                      <p className="text-sm font-semibold">{sub.credits}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Hours/wk
                      </div>
                      <p className="text-sm font-semibold">{sub.weeklyHours}h</p>
                    </div>
                    {sub.faculty && (
                      <div className="space-y-1 col-span-2">
                        <p className="text-xs text-muted-foreground truncate">{sub.faculty}</p>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(sub.difficulty)}`}>
                      {sub.difficulty}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                      {sub.targetGrade}
                    </span>
                  </div>

                  {/* Task Progress */}
                  {subTasks.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground text-xs">Task Progress</span>
                        <span className="font-semibold text-xs">{completed}/{subTasks.length}</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">{pct}% complete</p>
                    </div>
                  )}
                </CardContent>

                {/* Action Buttons */}
                <div className="border-t border-border/30 p-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Task
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-xs text-primary hover:bg-primary/10">
                    Manage
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold">Subject Name</Label>
                <Input 
                  id="name"
                  value={form.name} 
                  onChange={e => set('name', e.target.value)} 
                  placeholder="e.g., Data Structures"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-xs font-semibold">Code</Label>
                <Input 
                  id="code"
                  value={form.code} 
                  onChange={e => set('code', e.target.value)} 
                  placeholder="e.g., CS101"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="credits" className="text-xs font-semibold">Credits</Label>
                <Input 
                  id="credits"
                  type="number" 
                  value={form.credits} 
                  onChange={e => set('credits', +e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours" className="text-xs font-semibold">Hours/wk</Label>
                <Input 
                  id="hours"
                  type="number" 
                  value={form.weeklyHours} 
                  onChange={e => set('weeklyHours', +e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade" className="text-xs font-semibold">Target Grade</Label>
                <Input 
                  id="grade"
                  value={form.targetGrade} 
                  onChange={e => set('targetGrade', e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty" className="text-xs font-semibold">Faculty/Instructor</Label>
              <Input 
                id="faculty"
                value={form.faculty} 
                onChange={e => set('faculty', e.target.value)} 
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-xs font-semibold">Difficulty Level</Label>
              <Select value={form.difficulty} onValueChange={v => set('difficulty', v)}>
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90">
              {editing ? 'Update Subject' : 'Add Subject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
