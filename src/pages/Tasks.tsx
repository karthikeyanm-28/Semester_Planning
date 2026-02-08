import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { useAcademic } from '@/context/AcademicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Task } from '@/types/academic';

const emptyTask: Task = { id: '', title: '', type: 'Assignment', subjectId: '', dueDate: '', priority: 'Medium', estimatedEffort: 1, status: 'Pending' };

export default function Tasks() {
  const { data, addTask, updateTask, deleteTask } = useAcademic();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Task>(emptyTask);
  const [editing, setEditing] = useState(false);

  // Auto-mark overdue
  const tasks = useMemo(() => data.tasks.map(t => {
    if (t.status !== 'Completed' && t.dueDate && isPast(parseISO(t.dueDate))) return { ...t, status: 'Overdue' as const };
    return t;
  }), [data.tasks]);

  const sections = {
    Pending: tasks.filter(t => t.status === 'Pending'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    Completed: tasks.filter(t => t.status === 'Completed'),
    Overdue: tasks.filter(t => t.status === 'Overdue'),
  };

  const openAdd = () => { setForm({ ...emptyTask, id: crypto.randomUUID() }); setEditing(false); setOpen(true); };
  const openEdit = (t: Task) => { setForm(t); setEditing(true); setOpen(true); };
  const save = () => { editing ? updateTask(form) : addTask(form); setOpen(false); };
  const set = (key: keyof Task, val: any) => setForm(p => ({ ...p, [key]: val }));

  const subjectName = (id: string) => data.subjects.find(s => s.id === id)?.name || 'Unassigned';

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-sm">{task.title}</p>
            <p className="text-xs text-muted-foreground">{subjectName(task.subjectId)}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(task)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTask(task.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={task.type} />
          <StatusBadge status={task.priority} />
          <StatusBadge status={task.status} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{task.dueDate ? format(parseISO(task.dueDate), 'MMM d, yyyy') : 'No date'}</span>
          <span>{task.estimatedEffort}h effort</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks & Exams</h1>
          <p className="text-muted-foreground">{tasks.length} total tasks</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Task</Button>
      </div>

      <Tabs defaultValue="Pending">
        <TabsList>
          {Object.entries(sections).map(([key, arr]) => (
            <TabsTrigger key={key} value={key}>{key} ({arr.length})</TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(sections).map(([key, arr]) => (
          <TabsContent key={key} value={key}>
            {arr.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No {key.toLowerCase()} tasks</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {arr.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => set('title', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Assignment','Exam','Quiz','Lab'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Select value={form.subjectId} onValueChange={v => set('subjectId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{data.subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} /></div>
              <div><Label>Effort (hrs)</Label><Input type="number" value={form.estimatedEffort} onChange={e => set('estimatedEffort', +e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => set('priority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Low','Medium','High'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Pending','In Progress','Completed','Overdue'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
