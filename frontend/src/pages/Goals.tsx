import { useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAcademic } from '@/context/AcademicContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import type { Goal } from '@/types/academic';

const emptyGoal: Goal = { id: '', title: '', category: 'Short-term', targetDate: '', progress: 0, completed: false };

export default function Goals() {
  const { data, addGoal, updateGoal, deleteGoal } = useAcademic();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Goal>(emptyGoal);
  const [editing, setEditing] = useState(false);

  const openAdd = () => { setForm({ ...emptyGoal, id: crypto.randomUUID() }); setEditing(false); setOpen(true); };
  const openEdit = (g: Goal) => { setForm(g); setEditing(true); setOpen(true); };
  const save = () => { editing ? updateGoal(form) : addGoal(form); setOpen(false); };
  const toggle = (g: Goal) => updateGoal({ ...g, completed: !g.completed, progress: g.completed ? g.progress : 100 });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-page-title">Goals & Aspirations</h1>
          <p className="text-muted-foreground mt-2">{data.goals.length} goals · {data.goals.filter(g => g.completed).length} completed</p>
        </div>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      <div className="space-y-6">
        {data.goals.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No goals yet. Set your first academic goal!</CardContent></Card>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.goals.map(g => (
          <Card key={g.id} className={`hover:shadow-md transition-shadow ${g.completed ? 'opacity-75' : ''}`}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-semibold ${g.completed ? 'line-through' : ''}`}>{g.title}</p>
                  <p className="text-xs text-muted-foreground">{g.targetDate ? format(parseISO(g.targetDate), 'MMM d, yyyy') : 'No date'}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggle(g)}>
                    <CheckCircle className={`h-4 w-4 ${g.completed ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteGoal(g.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
              <StatusBadge status={g.category} />
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span><span>{g.progress}%</span>
                </div>
                <Progress value={g.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Goal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v as Goal['category'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short-term">Short-term</SelectItem>
                  <SelectItem value="Mid-sem">Mid-sem</SelectItem>
                  <SelectItem value="Exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Target Date</Label><Input type="date" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} /></div>
            <div>
              <Label>Progress: {form.progress}%</Label>
              <Slider value={[form.progress]} onValueChange={([v]) => setForm(p => ({ ...p, progress: v }))} max={100} step={5} className="mt-2" />
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
