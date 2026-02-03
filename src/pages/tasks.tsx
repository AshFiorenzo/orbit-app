import { useEffect, useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { formatInAppTZ } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Calendar, Clock, Filter, Search, CheckSquare, Tag, Edit2, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty'

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'todo' | 'completed'
  priority: 'low' | 'medium' | 'high'
  category: string
  estimatedMinutes?: number
  userId: string
  createdAt: string
}

const TASK_CATEGORIES = [
  { value: 'general', label: 'General', color: 'border-zinc-500/50 text-zinc-700 dark:text-zinc-300 bg-zinc-500/5' },
  { value: 'work', label: 'Work', color: 'border-blue-500/50 text-blue-700 dark:text-blue-400 bg-blue-500/5' },
  { value: 'personal', label: 'Personal', color: 'border-purple-500/50 text-purple-700 dark:text-purple-400 bg-purple-500/5' },
  { value: 'health', label: 'Health', color: 'border-teal-500/50 text-teal-700 dark:text-teal-400 bg-teal-500/5' },
  { value: 'finance', label: 'Finance', color: 'border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5' },
  { value: 'learning', label: 'Learning', color: 'border-amber-500/50 text-amber-700 dark:text-amber-400 bg-amber-500/5' },
  { value: 'shopping', label: 'Shopping', color: 'border-pink-500/50 text-pink-700 dark:text-pink-400 bg-pink-500/5' },
  { value: 'errands', label: 'Errands', color: 'border-orange-500/50 text-orange-700 dark:text-orange-400 bg-orange-500/5' },
]

export function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt')

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as const,
    category: 'general',
    estimatedMinutes: 0,
  })
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [user])

  async function fetchTasks() {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await blink.db.tasks.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      })
      setTasks(data as Task[])
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddTask() {
    if (!user || !newTask.title) return
    try {
      const task = await blink.db.tasks.create({
        ...newTask,
        status: 'todo',
        userId: user.id,
      })
      setTasks([task as Task, ...tasks])
      resetForm()
      setIsDialogOpen(false)
      toast.success('Task added')
    } catch (error) {
      toast.error('Failed to add task')
    }
  }

  async function handleUpdateTask() {
    if (!user || !editingTask || !editingTask.title) return
    try {
      const updatedTask = await blink.db.tasks.update(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        dueDate: editingTask.dueDate,
        priority: editingTask.priority,
        category: editingTask.category,
        estimatedMinutes: editingTask.estimatedMinutes,
      })
      setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...editingTask } : t)))
      resetForm()
      setIsDialogOpen(false)
      toast.success('Task updated')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  function resetForm() {
    setNewTask({ title: '', description: '', dueDate: '', priority: 'medium', category: 'general', estimatedMinutes: 0 })
    setEditingTask(null)
  }

  function openEditDialog(task: Task) {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  async function toggleTaskStatus(task: Task) {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed'
    try {
      // Optimistic update
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus as any } : t)))
      await blink.db.tasks.update(task.id, { status: newStatus })
    } catch (error) {
      toast.error('Failed to update task')
      fetchTasks() // Rollback
    }
  }

  async function deleteTask(id: string) {
    try {
      setTasks(tasks.filter((t) => t.id !== id))
      await blink.db.tasks.delete(id)
      toast.success('Task deleted')
    } catch (error) {
      toast.error('Failed to delete task')
      fetchTasks() // Rollback
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  }).sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.priority] - order[b.priority]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const priorityColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
  }

  const getCategoryColor = (category: string) => {
    return TASK_CATEGORIES.find(c => c.value === category)?.color || TASK_CATEGORIES[0].color
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your daily goals and long-term projects.</p>
        </div>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  placeholder="Task title"
                  value={editingTask ? editingTask.title : newTask.title}
                  onChange={(e) => editingTask 
                    ? setEditingTask({ ...editingTask, title: e.target.value })
                    : setNewTask({ ...newTask, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Description (optional)"
                  value={editingTask ? editingTask.description : newTask.description}
                  onChange={(e) => editingTask 
                    ? setEditingTask({ ...editingTask, description: e.target.value })
                    : setNewTask({ ...newTask, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={editingTask ? editingTask.category : newTask.category}
                    onValueChange={(val) => editingTask 
                      ? setEditingTask({ ...editingTask, category: val })
                      : setNewTask({ ...newTask, category: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <span className={cn('h-2 w-2 rounded-full', cat.color.split(' ')[0])} />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Time (min)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Duration"
                    value={editingTask ? editingTask.estimatedMinutes : newTask.estimatedMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0
                      editingTask 
                        ? setEditingTask({ ...editingTask, estimatedMinutes: val })
                        : setNewTask({ ...newTask, estimatedMinutes: val })
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={editingTask ? editingTask.dueDate : newTask.dueDate}
                    onChange={(e) => editingTask 
                      ? setEditingTask({ ...editingTask, dueDate: e.target.value })
                      : setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={editingTask ? editingTask.priority : newTask.priority}
                    onValueChange={(val) => editingTask 
                      ? setEditingTask({ ...editingTask, priority: val as any })
                      : setNewTask({ ...newTask, priority: val as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-yellow-500" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          High
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={editingTask ? handleUpdateTask : handleAddTask}>
                {editingTask ? 'Save Changes' : 'Add Task'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest First</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="w-[calc(50%-4px)] sm:w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[calc(50%-4px)] sm:w-[140px]">
              <Tag className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {TASK_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', cat.color.split(' ')[0])} />
                    {cat.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-24 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><CheckSquare /></EmptyMedia>
            <EmptyTitle>No tasks found</EmptyTitle>
            <EmptyDescription>Try changing your filters or add a new task to get started.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className={cn(
              'group transition-all hover:shadow-sm', 
              task.status === 'completed' ? 'opacity-50' : ''
            )}>
              <CardContent className="flex items-center gap-4 p-4">
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => toggleTaskStatus(task)}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn('font-medium', task.status === 'completed' && 'line-through text-muted-foreground')}>
                      {task.title}
                    </h3>
                    <Badge variant="outline" className={cn('text-[10px]', priorityColors[task.priority])}>
                      {task.priority}
                    </Badge>
                    {task.category && task.category !== 'general' && (
                      <Badge variant="outline" className="text-[10px]">
                        {TASK_CATEGORIES.find(c => c.value === task.category)?.label || task.category}
                      </Badge>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatInAppTZ(task.dueDate, 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {task.estimatedMinutes ? (
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{task.estimatedMinutes}m</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                    onClick={() => openEditDialog(task)}
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
