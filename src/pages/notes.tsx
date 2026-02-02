import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Pin, PinOff, Palette, MoreVertical, StickyNote, Edit2 } from 'lucide-react'
import { blink } from '@/lib/blink'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Note {
  id: string
  title: string
  content: string
  color: string
  isPinned: boolean | string // SQLite returns "0"/"1"
  createdAt: string
}

const COLORS = [
  { name: 'Default', value: 'border-primary/10' },
  { name: 'Red', value: 'border-red-500/50 text-red-700 dark:text-red-400' },
  { name: 'Orange', value: 'border-orange-500/50 text-orange-700 dark:text-orange-400' },
  { name: 'Yellow', value: 'border-yellow-500/50 text-yellow-700 dark:text-yellow-400' },
  { name: 'Green', value: 'border-emerald-500/50 text-emerald-700 dark:text-emerald-400' },
  { name: 'Teal', value: 'border-teal-500/50 text-teal-700 dark:text-teal-400' },
  { name: 'Blue', value: 'border-blue-500/50 text-blue-700 dark:text-blue-400' },
  { name: 'Purple', value: 'border-purple-500/50 text-purple-700 dark:text-purple-400' },
  { name: 'Pink', value: 'border-pink-500/50 text-pink-700 dark:text-pink-400' },
  { name: 'Brown', value: 'border-amber-500/50 text-amber-700 dark:text-amber-400' },
  { name: 'Gray', value: 'border-zinc-500/50 text-zinc-700 dark:text-zinc-400' },
]

export function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({ title: '', content: '' })

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  const fetchNotes = async () => {
    try {
      const data = await blink.db.notes.list({
        where: { userId: user?.id },
        orderBy: { createdAt: 'desc' }
      })
      setNotes(data as Note[])
    } catch (error) {
      console.error('Failed to fetch notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.content.trim() && !newNote.title.trim()) {
      setIsAdding(false)
      return
    }

    try {
      const noteData = {
        title: newNote.title,
        content: newNote.content,
        userId: user?.id,
        createdAt: new Date().toISOString()
      }
      
      const created = await blink.db.notes.create(noteData)
      setNotes([created as Note, ...notes])
      setNewNote({ title: '', content: '' })
      setIsAdding(false)
      toast.success('Note added')
    } catch (error) {
      console.error('Failed to add note:', error)
      toast.error('Failed to add note')
    }
  }

  const handleUpdateNote = async () => {
    if (!editingNote) return
    if (!editingNote.content.trim() && !editingNote.title.trim()) {
      handleDeleteNote(editingNote.id)
      setEditingNote(null)
      return
    }

    try {
      const updated = await blink.db.notes.update(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        color: editingNote.color
      })
      setNotes(notes.map(n => n.id === editingNote.id ? updated as Note : n))
      setEditingNote(null)
      toast.success('Note updated')
    } catch (error) {
      console.error('Failed to update note:', error)
      toast.error('Failed to update note')
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await blink.db.notes.delete(id)
      setNotes(notes.filter(n => n.id !== id))
      if (editingNote?.id === id) {
        setEditingNote(null)
      }
      toast.success('Note deleted')
    } catch (error) {
      console.error('Failed to delete note:', error)
      toast.error('Failed to delete note')
    }
  }

  const togglePin = async (note: Note) => {
    try {
      const isCurrentlyPinned = Number(note.isPinned) > 0
      const updated = await blink.db.notes.update(note.id, { isPinned: isCurrentlyPinned ? "0" : "1" })
      setNotes(notes.map(n => n.id === note.id ? updated as Note : n))
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const updateColor = async (id: string, color: string) => {
    try {
      const updated = await blink.db.notes.update(id, { color })
      setNotes(notes.map(n => n.id === id ? updated as Note : n))
    } catch (error) {
      console.error('Failed to update color:', error)
    }
  }

  const filteredNotes = notes.filter(n => 
    (n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content?.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    const aPinned = Number(a.isPinned) > 0
    const bPinned = Number(b.isPinned) > 0
    if (aPinned !== bPinned) return aPinned ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const pinnedNotes = filteredNotes.filter(n => Number(n.isPinned) > 0)
  const otherNotes = filteredNotes.filter(n => Number(n.isPinned) === 0)

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Search & Add Section */}
        <div className="w-full max-w-2xl space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card className={cn(
            "transition-all",
            isAdding ? "ring-2 ring-primary/20" : ""
          )}>
            {!isAdding ? (
              <div 
                className="px-4 py-2 cursor-text text-muted-foreground flex items-center justify-between"
                onClick={() => setIsAdding(true)}
              >
                <span className="text-sm">Take a note...</span>
                <Plus className="h-5 w-5 opacity-50" />
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <Input
                  placeholder="Title"
                  className="border-none focus-visible:ring-0 p-0 text-lg font-semibold"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  autoFocus
                />
                <textarea
                  placeholder="Take a note..."
                  className="w-full bg-transparent border-none focus:outline-none resize-none min-h-[100px] text-sm"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                />
                <div className="flex justify-end pt-2 gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Close</Button>
                  <Button size="sm" onClick={handleAddNote} disabled={!newNote.content.trim() && !newNote.title.trim()}>Save</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {pinnedNotes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Pinned</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min">
                {pinnedNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onDelete={handleDeleteNote} 
                    onPin={togglePin} 
                    onColorChange={updateColor}
                    onEdit={setEditingNote}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {pinnedNotes.length > 0 && <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Others</h3>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min">
              {otherNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onDelete={handleDeleteNote} 
                  onPin={togglePin} 
                  onColorChange={updateColor}
                  onEdit={setEditingNote}
                />
              ))}
            </div>
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                <StickyNote className="h-10 w-10" />
              </div>
              <p className="text-muted-foreground">No notes found</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className={cn("sm:max-w-[525px] border-none shadow-2xl", editingNote?.color && editingNote.color !== 'transparent' ? editingNote.color : 'bg-card')}>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Title"
              className="border-none focus-visible:ring-0 p-0 text-xl font-semibold bg-transparent"
              value={editingNote?.title || ''}
              onChange={(e) => editingNote && setEditingNote({ ...editingNote, title: e.target.value })}
            />
            <Textarea
              placeholder="Take a note..."
              className="w-full bg-transparent border-none focus-visible:ring-0 resize-none min-h-[200px] text-base p-0"
              value={editingNote?.content || ''}
              onChange={(e) => editingNote && setEditingNote({ ...editingNote, content: e.target.value })}
            />
          </div>
          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between w-full">
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="grid grid-cols-4 gap-1 p-2">
                  {COLORS.map((c) => (
                    <Button
                      key={c.value}
                      variant="outline"
                      className={cn(
                        "h-6 w-6 rounded-full p-0 border-border/20",
                        c.value === 'transparent' ? "bg-card" : c.value
                      )}
                      onClick={() => editingNote && setEditingNote({ ...editingNote, color: c.value })}
                    />
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => editingNote && handleDeleteNote(editingNote.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => setEditingNote(null)}>Cancel</Button>
              <Button onClick={handleUpdateNote}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NoteCard({ 
  note, 
  onDelete, 
  onPin, 
  onColorChange,
  onEdit
}: { 
  note: Note
  onDelete: (id: string) => void
  onPin: (note: Note) => void
  onColorChange: (id: string, color: string) => void
  onEdit: (note: Note) => void
}) {
  const isPinned = Number(note.isPinned) > 0
  const currentColor = COLORS.find(c => c.value === note.color) || COLORS[0]

  return (
    <Card 
      className={cn(
        "group transition-all hover:shadow-md cursor-pointer",
        note.color !== 'transparent' && note.color
      )}
      onClick={() => onEdit(note)}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-base font-semibold line-clamp-2 pr-6">
          {note.title || (note.content ? '' : 'Untitled')}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isPinned && "opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation()
            onPin(note)
          }}
        >
          {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm whitespace-pre-wrap text-muted-foreground line-clamp-6">
          {note.content}
        </p>
      </CardContent>
      <CardFooter className="p-2 px-3 flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-secondary" onClick={(e) => e.stopPropagation()}>
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="grid grid-cols-4 gap-1 p-2" onClick={(e) => e.stopPropagation()}>
            {COLORS.map((c) => (
              <Button
                key={c.value}
                variant="outline"
                className={cn(
                  "h-6 w-6 rounded-full p-0 border-2",
                  c.value === 'border-primary/10' ? "bg-card border-primary/10" : c.value
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onColorChange(note.id, c.value)
                }}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-secondary" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onEdit(note)
              }}
            >
              <Edit2 className="mr-2 h-3.5 w-3.5" />
              Edit note
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(note.id)
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
