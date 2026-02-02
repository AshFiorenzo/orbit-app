import { useEffect, useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Dumbbell, Calendar, Clock, Activity, Edit2 } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Workout {
  id: string
  type: string
  duration: number
  intensity: string
  notes: string
  date: string
  userId: string
}

const PREDEFINED_WORKOUT_TYPES = [
  'Running',
  'Swimming',
  'Yoga',
  'Cycling',
  'Strength Training',
  'Walking',
  'HIIT',
  'Pilates',
  'Boxing',
]

export function FitnessPage() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newWorkout, setNewWorkout] = useState({
    type: '',
    duration: '',
    intensity: 'medium',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [customType, setCustomType] = useState('')
  const [isCustomType, setIsCustomType] = useState(false)

  useEffect(() => {
    fetchWorkouts()
  }, [user])

  async function fetchWorkouts() {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await blink.db.workouts.list({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
      })
      setWorkouts(data as Workout[])
    } catch (error) {
      toast.error('Failed to load workouts')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddWorkout() {
    const workoutType = isCustomType ? customType : newWorkout.type
    if (!user || !workoutType) {
      if (!workoutType) toast.error('Please select or enter a workout type')
      return
    }
    try {
      await blink.db.workouts.create({
        ...newWorkout,
        type: workoutType,
        duration: parseInt(newWorkout.duration) || 0,
        userId: user.id,
      })
      fetchWorkouts()
      setIsDialogOpen(false)
      resetForm()
      toast.success('Workout logged')
    } catch (error) {
      toast.error('Failed to log workout')
    }
  }

  async function handleUpdateWorkout() {
    if (!user || !editingWorkout) return
    const workoutType = isCustomType ? customType : editingWorkout.type
    if (!workoutType) {
      toast.error('Please select or enter a workout type')
      return
    }

    try {
      await blink.db.workouts.update(editingWorkout.id, {
        type: workoutType,
        duration: typeof editingWorkout.duration === 'string' ? parseInt(editingWorkout.duration) : editingWorkout.duration,
        intensity: editingWorkout.intensity,
        notes: editingWorkout.notes,
        date: editingWorkout.date,
      })
      fetchWorkouts()
      setIsDialogOpen(false)
      resetForm()
      toast.success('Workout updated')
    } catch (error) {
      toast.error('Failed to update workout')
    }
  }

  function resetForm() {
    setNewWorkout({
      type: '',
      duration: '',
      intensity: 'medium',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    })
    setEditingWorkout(null)
    setCustomType('')
    setIsCustomType(false)
  }

  function openEditDialog(workout: Workout) {
    setEditingWorkout(workout)
    const isPredefined = PREDEFINED_WORKOUT_TYPES.includes(workout.type)
    if (isPredefined) {
      setIsCustomType(false)
      setCustomType('')
    } else {
      setIsCustomType(true)
      setCustomType(workout.type)
    }
    setIsDialogOpen(true)
  }

  async function deleteWorkout(id: string) {
    try {
      await blink.db.workouts.delete(id)
      setWorkouts(workouts.filter((w) => w.id !== id))
      toast.success('Workout deleted')
    } catch (error) {
      toast.error('Failed to delete workout')
    }
  }

  const intensityColors = {
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fitness</h1>
          <p className="text-muted-foreground">Track your workouts and stay consistent with your fitness goals.</p>
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
              <Plus size={18} /> Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingWorkout ? 'Edit Workout' : 'Log Workout'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Select
                  value={isCustomType ? 'custom' : (editingWorkout ? editingWorkout.type : newWorkout.type)}
                  onValueChange={(val) => {
                    if (val === 'custom') {
                      setIsCustomType(true)
                    } else {
                      setIsCustomType(false)
                      if (editingWorkout) {
                        setEditingWorkout({ ...editingWorkout, type: val })
                      } else {
                        setNewWorkout({ ...newWorkout, type: val })
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_WORKOUT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>

                {isCustomType && (
                  <Input
                    placeholder="Enter custom workout type"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="animate-in fade-in slide-in-from-top-1 duration-200"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Duration (min)"
                  value={editingWorkout ? editingWorkout.duration : newWorkout.duration}
                  onChange={(e) => editingWorkout
                    ? setEditingWorkout({ ...editingWorkout, duration: e.target.value as any })
                    : setNewWorkout({ ...newWorkout, duration: e.target.value })
                  }
                />
                <Select
                  value={editingWorkout ? editingWorkout.intensity : newWorkout.intensity}
                  onValueChange={(val) => editingWorkout
                    ? setEditingWorkout({ ...editingWorkout, intensity: val })
                    : setNewWorkout({ ...newWorkout, intensity: val })
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Intensity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="date"
                value={editingWorkout ? editingWorkout.date : newWorkout.date}
                onChange={(e) => editingWorkout
                  ? setEditingWorkout({ ...editingWorkout, date: e.target.value })
                  : setNewWorkout({ ...newWorkout, date: e.target.value })
                }
              />
              <Textarea
                placeholder="Notes (optional)"
                value={editingWorkout ? editingWorkout.notes : newWorkout.notes}
                onChange={(e) => editingWorkout
                  ? setEditingWorkout({ ...editingWorkout, notes: e.target.value })
                  : setNewWorkout({ ...newWorkout, notes: e.target.value })
                }
              />
              <Button className="w-full" onClick={editingWorkout ? handleUpdateWorkout : handleAddWorkout}>
                {editingWorkout ? 'Save Changes' : 'Save Workout'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workouts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workouts.reduce((acc, curr) => acc + curr.duration, 0)} <span className="text-sm font-normal text-muted-foreground">min</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Dumbbell /></EmptyMedia>
            <EmptyTitle>No workouts logged</EmptyTitle>
            <EmptyDescription>Time to break a sweat! Log your first workout session.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {workouts.map((workout) => (
            <Card key={workout.id} className="group overflow-hidden transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-6 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                  <Activity size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{workout.type}</h3>
                    <Badge variant="secondary" className={cn('text-[10px] uppercase', intensityColors[workout.intensity as keyof typeof intensityColors])}>
                      {workout.intensity}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{workout.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{workout.duration} min</span>
                    </div>
                  </div>
                  {workout.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{workout.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => openEditDialog(workout)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => deleteWorkout(workout.id)}
                  >
                    <Trash2 size={16} />
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
