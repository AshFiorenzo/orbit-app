import { useEffect, useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { getNow, getTodayStr, formatInAppTZ, toAppTZ } from '@/lib/date-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Trash2,
  Flame,
  RotateCcw,
  CheckCircle2,
  Circle,
  Repeat,
  Trophy,
  Target,
  Calendar,
  Activity,
  Book,
  Coffee,
  Dumbbell,
  GlassWater,
  Moon,
  Sun,
  Brain,
  Timer,
  Bell,
  Edit2
} from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

const PREDEFINED_COLORS = [
  { name: 'Blue', value: 'border-blue-500/50 text-blue-500 bg-blue-500/5', border: 'border-blue-500/50', text: 'text-blue-500' },
  { name: 'Green', value: 'border-emerald-500/50 text-emerald-500 bg-emerald-500/5', border: 'border-emerald-500/50', text: 'text-emerald-500' },
  { name: 'Rose', value: 'border-rose-500/50 text-rose-500 bg-rose-500/5', border: 'border-rose-500/50', text: 'text-rose-500' },
  { name: 'Amber', value: 'border-amber-500/50 text-amber-500 bg-amber-500/5', border: 'border-amber-500/50', text: 'text-amber-500' },
  { name: 'Purple', value: 'border-purple-500/50 text-purple-500 bg-purple-500/5', border: 'border-purple-500/50', text: 'text-purple-500' },
  { name: 'Teal', value: 'border-teal-500/50 text-teal-500 bg-teal-500/5', border: 'border-teal-500/50', text: 'text-teal-500' },
]

const PREDEFINED_ICONS = [
  { name: 'Activity', icon: Activity },
  { name: 'Book', icon: Book },
  { name: 'Coffee', icon: Coffee },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Water', icon: GlassWater },
  { name: 'Moon', icon: Moon },
  { name: 'Sun', icon: Sun },
  { name: 'Brain', icon: Brain },
  { name: 'Timer', icon: Timer },
]

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Habit {
  id: string
  title: string
  frequency: string
  streak: number
  lastCompletedAt: string | null
  color: string | null
  icon: string | null
  userId: string
  createdAt: string
  reminders: boolean
}

interface Completion {
  id: string
  habitId: string
  completedAt: string
}

export function HabitsPage() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newHabit, setNewHabit] = useState({
    title: '',
    frequency: 'daily',
    color: PREDEFINED_COLORS[0].value,
    icon: PREDEFINED_ICONS[0].name,
    reminders: false,
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  useEffect(() => {
    fetchHabits()
  }, [user])

  async function fetchHabits() {
    if (!user) return
    setIsLoading(true)
    try {
      const [habitsData, completionsData] = await Promise.all([
        blink.db.habits.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        }),
        blink.db.habitCompletions.list({
          where: { userId: user.id },
          orderBy: { completedAt: 'desc' },
          limit: 100
        })
      ])
      setHabits(habitsData as Habit[])
      setCompletions(completionsData as Completion[])
    } catch (error) {
      toast.error('Failed to load habits')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddHabit() {
    if (!user || !newHabit.title) return
    try {
      const habit = await blink.db.habits.create({
        title: newHabit.title,
        frequency: newHabit.frequency,
        color: newHabit.color,
        icon: newHabit.icon,
        reminders: newHabit.reminders ? 1 : 0,
        streak: 0,
        lastCompletedAt: null,
        userId: user.id,
      })
      setHabits([habit as Habit, ...habits])
      resetForm()
      setIsDialogOpen(false)
      toast.success('Habit added')
    } catch (error) {
      toast.error('Failed to add habit')
    }
  }

  async function handleUpdateHabit() {
    if (!user || !editingHabit || !editingHabit.title) return
    try {
      const updatedHabit = await blink.db.habits.update(editingHabit.id, {
        title: editingHabit.title,
        frequency: editingHabit.frequency,
        color: editingHabit.color,
        icon: editingHabit.icon,
        reminders: editingHabit.reminders ? 1 : 0,
      })
      setHabits(habits.map((h) => (h.id === editingHabit.id ? { ...h, ...updatedHabit } : h)))
      resetForm()
      setIsDialogOpen(false)
      toast.success('Habit updated')
    } catch (error) {
      toast.error('Failed to update habit')
    }
  }

  function resetForm() {
    setNewHabit({ 
      title: '', 
      frequency: 'daily', 
      color: PREDEFINED_COLORS[0].value, 
      icon: PREDEFINED_ICONS[0].name,
      reminders: false
    })
    setEditingHabit(null)
  }

  function openEditDialog(habit: Habit) {
    setEditingHabit({
      ...habit,
      reminders: Number(habit.reminders) > 0
    })
    setIsDialogOpen(true)
  }

  async function completeHabit(habit: Habit) {
    const today = getTodayStr()
    if (habit.lastCompletedAt === today) {
      toast.info('Habit already completed today')
      return
    }

    try {
      const newStreak = habit.streak + 1
      setHabits(habits.map((h) => (h.id === habit.id ? { ...h, streak: newStreak, lastCompletedAt: today } : h)))
      
      // Update habit
      await blink.db.habits.update(habit.id, {
        streak: newStreak,
        lastCompletedAt: today,
      })

      // Record completion
      const completion = await blink.db.habitCompletions.create({
        habitId: habit.id,
        completedAt: today,
        userId: user!.id,
      })
      
      setCompletions([completion as Completion, ...completions])

      toast.success('Habit completed! Keep it up!')
    } catch (error) {
      toast.error('Failed to update habit')
      fetchHabits()
    }
  }

  async function deleteHabit(id: string) {
    try {
      setHabits(habits.filter((h) => h.id !== id))
      await blink.db.habits.delete(id)
      toast.success('Habit deleted')
    } catch (error) {
      toast.error('Failed to delete habit')
      fetchHabits()
    }
  }

  const isCompletedToday = (lastCompletedAt: string | null) => {
    if (!lastCompletedAt) return false
    const today = getTodayStr()
    return lastCompletedAt === today
  }

  const totalHabits = habits.length
  const activeHabits = habits.filter(h => isCompletedToday(h.lastCompletedAt)).length
  const completionRate = totalHabits > 0 ? Math.round((activeHabits / totalHabits) * 100) : 0
  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0)
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = getNow()
    d.setDate(d.getDate() - i)
    return formatInAppTZ(d, 'yyyy-MM-dd')
  }).reverse()

  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const d = getNow()
    d.setDate(d.getDate() - i)
    return formatInAppTZ(d, 'yyyy-MM-dd')
  }).reverse()

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">Build consistency with daily routines.</p>
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
              <Plus size={18} /> Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHabit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Habit Name</Label>
                <Input
                  placeholder="e.g. Morning Meditation"
                  value={editingHabit ? editingHabit.title : newHabit.title}
                  onChange={(e) => editingHabit 
                    ? setEditingHabit({ ...editingHabit, title: e.target.value })
                    : setNewHabit({ ...newHabit, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={editingHabit ? editingHabit.frequency : newHabit.frequency}
                    onValueChange={(val) => editingHabit 
                      ? setEditingHabit({ ...editingHabit, frequency: val })
                      : setNewHabit({ ...newHabit, frequency: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={editingHabit ? editingHabit.icon || PREDEFINED_ICONS[0].name : newHabit.icon}
                    onValueChange={(val) => editingHabit 
                      ? setEditingHabit({ ...editingHabit, icon: val })
                      : setNewHabit({ ...newHabit, icon: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_ICONS.map((icon) => (
                        <SelectItem key={icon.name} value={icon.name}>
                          <div className="flex items-center gap-2">
                            <icon.icon size={16} />
                            <span>{icon.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color Category</Label>
                <div className="flex gap-2 flex-wrap">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => editingHabit 
                        ? setEditingHabit({ ...editingHabit, color: color.value })
                        : setNewHabit({ ...newHabit, color: color.value })
                      }
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        color.value,
                        (editingHabit ? editingHabit.color : newHabit.color) === color.value ? "border-black scale-110 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                      )}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t mt-2">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label className="text-sm">Reminders</Label>
                    <p className="text-[10px] text-muted-foreground italic">Notify when habit is due</p>
                  </div>
                </div>
                <Button 
                  variant={(editingHabit ? editingHabit.reminders : newHabit.reminders) ? "default" : "outline"} 
                  size="sm"
                  onClick={() => editingHabit 
                    ? setEditingHabit({ ...editingHabit, reminders: !editingHabit.reminders })
                    : setNewHabit({ ...newHabit, reminders: !newHabit.reminders })
                  }
                >
                  {(editingHabit ? editingHabit.reminders : newHabit.reminders) ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <Button className="w-full" onClick={editingHabit ? handleUpdateHabit : handleAddHabit}>
                {editingHabit ? 'Save Changes' : 'Create Habit'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHabits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Done Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeHabits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Streaks</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStreaks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestStreak}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Repeat /></EmptyMedia>
            <EmptyTitle>No habits tracked</EmptyTitle>
            <EmptyDescription>Start building a better you by adding your first habit.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => {
            const completed = isCompletedToday(habit.lastCompletedAt)
            const selectedColor = PREDEFINED_COLORS.find(c => c.value === habit.color) || PREDEFINED_COLORS[0]
            const selectedIcon = PREDEFINED_ICONS.find(i => i.name === habit.icon) || PREDEFINED_ICONS[0]
            return (
              <Card key={habit.id} className="relative transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold tracking-tight">{habit.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{habit.frequency}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      onClick={() => openEditDialog(habit)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      onClick={() => deleteHabit(habit.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full border', selectedColor.value)}>
                      <selectedIcon.icon className={cn('h-4 w-4', habit.streak > 0 ? selectedColor.text : 'text-muted-foreground')} />
                      <span className="text-base font-black tracking-tighter">{habit.streak}</span>
                      <Flame size={14} className={cn(habit.streak > 0 ? "text-orange-500 animate-pulse" : "text-muted-foreground/30")} />
                    </div>
                  </div>

                  {/* Weekly Progress */}
                  <div className="flex justify-between items-center py-2">
                    {last7Days.map((date) => {
                      const isCompleted = completions.some(c => c.habitId === habit.id && c.completedAt === date)
                      const dayName = formatInAppTZ(date, 'EEEEE')
                      return (
                        <div key={date} className="flex flex-col items-center gap-1">
                          <span className="text-[10px] text-muted-foreground uppercase">{dayName}</span>
                          <div 
                            className={cn(
                              "h-3 w-3 rounded-full border transition-colors",
                              isCompleted ? selectedColor.value : "bg-transparent border-muted"
                            )} 
                          />
                        </div>
                      )
                    })}
                  </div>

                  <Button
                    className={cn('w-full gap-2 border-2 transition-all', completed ? 'bg-secondary text-secondary-foreground border-secondary' : cn('hover:scale-105 shadow-sm hover:text-white', selectedColor.value))}
                    variant={completed ? 'secondary' : 'default'}
                    onClick={() => completeHabit(habit)}
                    disabled={completed}
                  >
                    {completed ? (
                      <>
                        <CheckCircle2 size={18} className="text-green-500" />
                        Completed Today
                      </>
                    ) : (
                      <>
                        <Circle size={18} />
                        Mark as Done
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Activity Heatmap */}
      {!isLoading && habits.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="text-primary" size={20} />
              Overall Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {heatmapDays.map((date) => {
                const dayCompletions = completions.filter(c => c.completedAt === date).length
                const intensity = dayCompletions === 0 ? 0 : dayCompletions >= 3 ? 3 : dayCompletions
                const dateObj = new Date(date)
                const label = `${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getDate()}`
                
                return (
                  <div 
                    key={date}
                    className={cn(
                      "h-4 w-4 rounded-sm transition-all hover:scale-125 cursor-help",
                      intensity === 0 && "bg-muted",
                      intensity === 1 && "bg-primary/20",
                      intensity === 2 && "bg-primary/50",
                      intensity === 3 && "bg-primary"
                    )}
                    title={`${label}: ${dayCompletions} habits completed`}
                  />
                )
              })}
            </div>
            <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-sm bg-muted" />
                <div className="h-2 w-2 rounded-sm bg-primary/20" />
                <div className="h-2 w-2 rounded-sm bg-primary/50" />
                <div className="h-2 w-2 rounded-sm bg-primary" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
