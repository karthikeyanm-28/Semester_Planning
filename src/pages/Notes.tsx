import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAcademic } from '@/context/AcademicContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Note } from '@/types/academic';

const emptyNote: Note = { id: '', title: '', subjectId: '', content: '', type: 'Note', timestamp: '' };

export default function Notes() {
  const { data, addNote, updateNote, deleteNote } = useAcademic();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Note>(emptyNote);
  const [editing, setEditing] = useState(false);

  const openAdd = () => { setForm({ ...emptyNote, id: crypto.randomUUID(), timestamp: new Date().toISOString() }); setEditing(false); setOpen(true); };
  const openEdit = (n: Note) => { setForm(n); setEditing(true); setOpen(true); };
  const save = () => {
    const note = { ...form, timestamp: editing ? form.timestamp : new Date().toISOString() };
    editing ? updateNote(note) : addNote(note);
    setOpen(false);
  };

  const types: Note['type'][] = ['Note', 'Strategy', 'Reflection'];
  const subjectName = (id: string) => data.subjects.find(s => s.id === id)?.name || 'General';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes & Reflections</h1>
          <p className="text-muted-foreground">{data.notes.length} entries</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Note</Button>
      </div>

      <Tabs defaultValue="Note">
        <TabsList>
          {types.map(t => <TabsTrigger key={t} value={t}>{t}s ({data.notes.filter(n => n.type === t).length})</TabsTrigger>)}
        </TabsList>
        {types.map(type => (
          <TabsContent key={type} value={type}>
            {data.notes.filter(n => n.type === type).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No {type.toLowerCase()}s yet</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.notes.filter(n => n.type === type).map(note => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{note.title}</p>
                          <p className="text-xs text-muted-foreground">{subjectName(note.subjectId)} · {note.timestamp ? format(parseISO(note.timestamp), 'MMM d, yyyy') : ''}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(note)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNote(note.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Note</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as Note['type'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Select value={form.subjectId} onValueChange={v => setForm(p => ({ ...p, subjectId: v }))}>
                  <SelectTrigger><SelectValue placeholder="General" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General</SelectItem>
                    {data.subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Content</Label><Textarea rows={5} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
