import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, Filter, Check, Clock, AlertCircle, ListTodo, ChevronRight } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Auto-mark overdue
  const tasks = useMemo(() => data.tasks.map(t => {
    if (t.status !== 'Completed' && t.dueDate && isPast(parseISO(t.dueDate))) return { ...t, status: 'Overdue' as const };
    return t;
  }), [data.tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = !filterSubject || t.subjectId === filterSubject;
      const matchesPriority = !filterPriority || t.priority === filterPriority;
      const matchesStatus = !filterStatus || t.status === filterStatus;
      return matchesSearch && matchesSubject && matchesPriority && matchesStatus;
    });
  }, [tasks, searchQuery, filterSubject, filterPriority, filterStatus]);

  const statusGroups = useMemo(() => {
    return {
      Pending: filteredTasks.filter(t => t.status === 'Pending'),
      'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
      Completed: filteredTasks.filter(t => t.status === 'Completed'),
      Overdue: filteredTasks.filter(t => t.status === 'Overdue'),
    };
  }, [filteredTasks]);

  const openAdd = () => { setForm({ ...emptyTask, id: crypto.randomUUID() }); setEditing(false); setOpen(true); };
  const openEdit = (t: Task) => { setForm(t); setEditing(true); setOpen(true); };
  const save = () => { editing ? updateTask(form) : addTask(form); setOpen(false); };
  const set = (key: keyof Task, val: any) => setForm(p => ({ ...p, [key]: val }));

  const subjectName = (id: string) => data.subjects.find(s => s.id === id)?.name || 'Unassigned';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <Check className="h-4 w-4 text-emerald-600" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Overdue': return <AlertCircle className="h-4 w-4 text-rose-600" />;
      default: return <ListTodo className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="hover:shadow-md-soft border border-border/50 hover:border-primary/20 transition-all duration-300 group">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {getStatusIcon(task.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{task.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{subjectName(task.subjectId)}</p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(task)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600" onClick={() => deleteTask(task.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {task.type}
          </span>
        </div>

        {/* Meta Info */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border/30">
          <span>Due {task.dueDate ? format(parseISO(task.dueDate), 'MMM d') : 'No date'}</span>
          <span className="font-semibold">{task.estimatedEffort}h</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-page-title">Tasks & Exams</h1>
          <p className="text-muted-foreground mt-2">{filteredTasks.length} tasks · {filteredTasks.filter(t => t.status === 'Completed').length} completed</p>
        </div>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-48 pl-10">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {data.subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="Pending" className="w-full">
        <TabsList className="bg-muted/50 border border-border/50">
          {Object.entries(statusGroups).map(([key, arr]) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              <span>{key}</span>
              <span className="bg-muted px-2 py-0.5 rounded text-xs font-semibold">{arr.length}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(statusGroups).map(([key, arr]) => (
          <TabsContent key={key} value={key} className="mt-6">
            {arr.length === 0 ? (
              <Card className="border border-dashed border-border/50">
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <ListTodo className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground font-medium">No {key.toLowerCase()} tasks</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Add a task to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {arr.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-semibold">Task Title</Label>
              <Input 
                id="title"
                value={form.title} 
                onChange={e => set('title', e.target.value)}
                placeholder="e.g., Complete assignment 3"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs font-semibold">Type</Label>
                <Select value={form.type} onValueChange={v => set('type', v)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Assignment', 'Exam', 'Quiz', 'Lab', 'Project'].map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-semibold">Subject</Label>
                <Select value={form.subjectId} onValueChange={v => set('subjectId', v)}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-xs font-semibold">Due Date</Label>
                <Input 
                  id="dueDate"
                  type="date" 
                  value={form.dueDate} 
                  onChange={e => set('dueDate', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effort" className="text-xs font-semibold">Effort (hours)</Label>
                <Input 
                  id="effort"
                  type="number" 
                  value={form.estimatedEffort} 
                  onChange={e => set('estimatedEffort', +e.target.value)}
                  min="0.5"
                  step="0.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs font-semibold">Priority</Label>
                <Select value={form.priority} onValueChange={v => set('priority', v)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Low', 'Medium', 'High'].map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-semibold">Status</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Pending', 'In Progress', 'Completed'].map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90">
              {editing ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
