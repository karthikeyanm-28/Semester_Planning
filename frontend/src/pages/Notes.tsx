import { useState } from 'react';
import { Plus, Pencil, Trash2, StickyNote } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAcademic } from '@/context/AcademicContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Note } from '@/types/academic';

const emptyNote: Note = { id: '', title: '', subjectId: '', content: '', type: 'Note', timestamp: '' };

const colorOptions = [
  { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800/30', badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800/30', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800/30', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  { bg: 'bg-rose-50 dark:bg-rose-900/10', border: 'border-rose-200 dark:border-rose-800/30', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' },
  { bg: 'bg-purple-50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-800/30', badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
  { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800/30', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
];

export default function Notes() {
  const { data, addNote, updateNote, deleteNote } = useAcademic();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Note>(emptyNote);
  const [editing, setEditing] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

  const openAdd = () => { 
    setForm({ ...emptyNote, id: crypto.randomUUID(), timestamp: new Date().toISOString() }); 
    setEditing(false);
    setSelectedColor(Math.floor(Math.random() * colorOptions.length));
    setOpen(true); 
  };
  const openEdit = (n: Note) => { 
    setForm(n); 
    setEditing(true);
    setSelectedColor(0);
    setOpen(true); 
  };
  const save = () => {
    const note = { ...form, timestamp: editing ? form.timestamp : new Date().toISOString() };
    editing ? updateNote(note) : addNote(note);
    setOpen(false);
  };

  const types: Note['type'][] = ['Note', 'Strategy', 'Reflection'];
  const subjectName = (id: string) => data.subjects.find(s => s.id === id)?.name || 'General';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-page-title">Notes & Ideas</h1>
          <p className="text-muted-foreground mt-2">{data.notes.length} entries · {types.map(t => data.notes.filter(n => n.type === t).length).reduce((a, b) => a + b, 0)} total</p>
        </div>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="Note" className="w-full">
        <TabsList className="bg-muted/50 border border-border/50">
          {types.map(t => {
            const count = data.notes.filter(n => n.type === t).length;
            return (
              <TabsTrigger key={t} value={t} className="gap-2">
                <span>{t}</span>
                <span className="bg-muted px-2 py-0.5 rounded text-xs font-semibold">{count}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {types.map(type => {
          const typeNotes = data.notes.filter(n => n.type === type);
          return (
            <TabsContent key={type} value={type} className="mt-6">
              {typeNotes.length === 0 ? (
                <Card className="border border-dashed border-border/50">
                  <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <StickyNote className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground font-medium">No {type.toLowerCase()}s yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Create your first {type.toLowerCase()} to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeNotes.map((note, idx) => {
                    const color = colorOptions[idx % colorOptions.length];
                    return (
                      <div
                        key={note.id}
                        className={`${color.bg} border ${color.border} rounded-lg p-5 space-y-3 hover:shadow-md-soft transition-all duration-300 group`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm line-clamp-2">{note.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {subjectName(note.subjectId)} • {note.timestamp ? format(parseISO(note.timestamp), 'MMM d') : 'No date'}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 hover:bg-white/50 dark:hover:bg-black/20"
                              onClick={() => openEdit(note)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 hover:bg-rose-200/50 dark:hover:bg-rose-900/30 hover:text-rose-600"
                              onClick={() => deleteNote(note.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-sm line-clamp-4 whitespace-pre-wrap">{note.content}</p>

                        {/* Footer */}
                        <div className="pt-2 border-t border-black/5 dark:border-white/10">
                          <span className={`text-xs font-semibold px-2 py-1 rounded inline-block ${color.badge}`}>
                            {note.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Note' : 'Create New Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-semibold">Title</Label>
              <Input 
                id="title"
                value={form.title} 
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Give your note a title"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs font-semibold">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as Note['type'] }))}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Note', 'Strategy', 'Reflection'].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-semibold">Subject</Label>
                <Select value={form.subjectId} onValueChange={v => setForm(p => ({ ...p, subjectId: v }))}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="General" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General</SelectItem>
                    {data.subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-xs font-semibold">Content</Label>
              <Textarea 
                id="content"
                rows={5} 
                value={form.content} 
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="Write your thoughts here..."
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90">
              {editing ? 'Update Note' : 'Create Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
            </div>
            <div><Label>Content</Label><Textarea rows={5} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
