import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subjects & Credits</h1>
          <p className="text-muted-foreground">{data.subjects.length} subjects · {data.subjects.reduce((s, sub) => s + sub.credits, 0)} credits</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Subject</Button>
      </div>

      {data.subjects.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No subjects added yet. Click "Add Subject" to get started.</CardContent></Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.subjects.map(sub => {
          const subTasks = data.tasks.filter(t => t.subjectId === sub.id);
          const completed = subTasks.filter(t => t.status === 'Completed').length;
          const pct = subTasks.length ? Math.round((completed / subTasks.length) * 100) : 0;
          const status = pct >= 70 ? 'On Track' : subTasks.some(t => t.status === 'Overdue') ? 'At Risk' : 'On Track';

          return (
            <Card key={sub.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{sub.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{sub.code}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(sub)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteSubject(sub.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Credits:</span> {sub.credits}</div>
                  <div><span className="text-muted-foreground">Hours/wk:</span> {sub.weeklyHours}</div>
                  <div><span className="text-muted-foreground">Faculty:</span> {sub.faculty || '—'}</div>
                  <div><span className="text-muted-foreground">Target:</span> {sub.targetGrade}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={sub.difficulty} />
                  <StatusBadge status={status} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{completed}/{subTasks.length} tasks</span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Subject</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
              <div><Label>Code</Label><Input value={form.code} onChange={e => set('code', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Credits</Label><Input type="number" value={form.credits} onChange={e => set('credits', +e.target.value)} /></div>
              <div><Label>Hours/wk</Label><Input type="number" value={form.weeklyHours} onChange={e => set('weeklyHours', +e.target.value)} /></div>
              <div><Label>Target Grade</Label><Input value={form.targetGrade} onChange={e => set('targetGrade', e.target.value)} /></div>
            </div>
            <div><Label>Faculty</Label><Input value={form.faculty} onChange={e => set('faculty', e.target.value)} /></div>
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={v => set('difficulty', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
