import { useEffect, useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Repeat, Wallet, Dumbbell, TrendingUp, StickyNote, Flame, Circle, CheckCircle2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'todo' | 'completed'
  priority: 'low' | 'medium' | 'high'
  userId: string
}

interface Habit {
  id: string
  title: string
  frequency: string
  streak: number
  lastCompletedAt: string | null
  color: string | null
  icon: string | null
  userId: string
}

export function DashboardHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    tasks: 0,
    habits: 0,
    spending: 0,
    savings: 0,
    workouts: 0,
    notes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  useEffect(() => {
    async function fetchStats() {
      if (!user) return
      setIsLoading(true)
      try {
        const [tasks, habitsData, expenses, savings, workouts, notes] = await Promise.all([
          blink.db.tasks.list({ where: { userId: user.id, status: 'todo' } }),
          blink.db.habits.list({ where: { userId: user.id } }),
          blink.db.expenses.list({ where: { userId: user.id } }),
          blink.db.savingsGoals.list({ where: { userId: user.id } }),
          blink.db.workouts.count({ where: { userId: user.id } }),
          blink.db.notes.count({ where: { userId: user.id } }),
        ])

        const totalSpending = expenses.reduce((acc, curr) => acc + (curr.amount as number), 0)
        const totalSavings = savings.reduce((acc, curr) => acc + (curr.currentAmount as number), 0)

        // Filter tasks due today
        const tasksForToday = (tasks as Task[]).filter(task => task.dueDate === todayStr)
        setTodayTasks(tasksForToday)
        setHabits(habitsData as Habit[])

        setStats({
          tasks: (tasks as Task[]).length || 0,
          habits: (habitsData as Habit[]).length || 0,
          spending: totalSpending,
          savings: totalSavings,
          workouts: workouts || 0,
          notes: notes || 0,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user, todayStr])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isCompletedToday = (lastCompletedAt: string | null) => {
    if (!lastCompletedAt) return false
    return lastCompletedAt === todayStr
  }

  const completedHabitsToday = habits.filter(h => isCompletedToday(h.lastCompletedAt)).length
  const habitCompletionRate = habits.length > 0 ? Math.round((completedHabitsToday / habits.length) * 100) : 0

  async function toggleTaskStatus(task: Task) {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed'
    try {
      setTodayTasks(todayTasks.map((t) => (t.id === task.id ? { ...t, status: newStatus as any } : t)))
      await blink.db.tasks.update(task.id, { status: newStatus })
      if (newStatus === 'completed') {
        toast.success('Task completed!')
      }
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  async function completeHabit(habit: Habit) {
    if (isCompletedToday(habit.lastCompletedAt)) {
      toast.info('Habit already completed today')
      return
    }

    try {
      const newStreak = habit.streak + 1
      setHabits(habits.map((h) => (h.id === habit.id ? { ...h, streak: newStreak, lastCompletedAt: todayStr } : h)))

      await blink.db.habits.update(habit.id, {
        streak: newStreak,
        lastCompletedAt: todayStr,
      })

      await blink.db.habitCompletions.create({
        habitId: habit.id,
        completedAt: todayStr,
        userId: user!.id,
      })

      toast.success('Habit completed! Keep it up!')
    } catch (error) {
      toast.error('Failed to complete habit')
    }
  }

  const priorityColors = {
    low: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          {greeting()}, <span className="text-primary">{user?.displayName || 'User'}</span>
        </h1>
        <p className="text-lg text-muted-foreground">Here is your life at a glance for {formatDate(today)}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Tasks to do"
          value={stats.tasks}
          icon={<CheckSquare className="h-5 w-5" />}
          description="Pending in your list"
          isLoading={isLoading}
          color="blue"
        />
        <StatCard
          title="Daily Habits"
          value={stats.habits}
          icon={<Repeat className="h-5 w-5" />}
          description="Active streaks today"
          isLoading={isLoading}
          color="emerald"
        />
        <StatCard
          title="Monthly Spending"
          value={`฿${stats.spending.toFixed(2)}`}
          icon={<Wallet className="h-5 w-5" />}
          description="Total this month"
          isLoading={isLoading}
          color="rose"
        />
        <StatCard
          title="Savings Progress"
          value={`฿${stats.savings.toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Towards your goals"
          isLoading={isLoading}
          color="amber"
        />
        <StatCard
          title="Workouts"
          value={stats.workouts}
          icon={<Dumbbell className="h-5 w-5" />}
          description="Completed sessions"
          isLoading={isLoading}
          color="purple"
        />
        <StatCard
          title="Personal Notes"
          value={stats.notes}
          icon={<StickyNote className="h-5 w-5" />}
          description="Ideas and thoughts"
          isLoading={isLoading}
          color="indigo"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <Card className="border-2 border-primary/20 relative overflow-hidden group bg-card/50 backdrop-blur-sm shadow-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.1] group-hover:opacity-[0.15] transition-opacity" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-md border border-primary/30 bg-primary/5">
                <CheckSquare className="h-4 w-4 text-primary" />
              </div>
              Today's Focus
              {todayTasks.length > 0 && (
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {todayTasks.filter(t => t.status === 'completed').length}/{todayTasks.length} done
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
                <div className="rounded-full border-2 border-dashed border-primary/30 p-4">
                  <CheckSquare className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-lg">No tasks for today</p>
                  <p className="text-sm text-muted-foreground">Enjoy your free time or add a new task!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border bg-background/50 transition-all hover:bg-background/80",
                      task.status === 'completed' && "opacity-60"
                    )}
                  >
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => toggleTaskStatus(task)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate",
                        task.status === 'completed' && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                      )}
                    </div>
                    <span className={cn("text-xs font-medium", priorityColors[task.priority])}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Habits for Today */}
        <Card className="border-2 border-emerald-500/20 relative overflow-hidden group bg-card/50 backdrop-blur-sm shadow-none">
          <div className="absolute inset-0 bg-dots-pattern opacity-[0.1] group-hover:opacity-[0.15] transition-opacity" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5">
                <Repeat className="h-4 w-4 text-emerald-500" />
              </div>
              Today's Habits
              {habits.length > 0 && (
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {completedHabitsToday}/{habits.length} done
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Daily Progress</span>
                <span className="font-bold text-emerald-500">{habitCompletionRate}%</span>
              </div>
              <Progress value={habitCompletionRate} className="h-2 bg-emerald-500/10" />
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : habits.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-6 text-center">
                <p className="text-sm text-muted-foreground">No habits set up yet.</p>
                <p className="text-xs text-muted-foreground">Add habits to start tracking!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {habits.map((habit) => {
                  const completed = isCompletedToday(habit.lastCompletedAt)
                  return (
                    <button
                      key={habit.id}
                      onClick={() => completeHabit(habit)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border bg-background/50 transition-all hover:bg-background/80 text-left",
                        completed && "opacity-60"
                      )}
                      disabled={completed}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium truncate",
                          completed && "line-through text-muted-foreground"
                        )}>
                          {habit.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{habit.frequency}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className={cn(
                          "h-4 w-4",
                          habit.streak > 0 ? "text-orange-500" : "text-muted-foreground/30"
                        )} />
                        <span className="font-bold">{habit.streak}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {habitCompletionRate === 100 && habits.length > 0 && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium text-center py-2">
                🎉 All habits completed today!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  description,
  isLoading,
  color = "primary"
}: {
  title: string,
  value: string | number,
  icon: React.ReactNode,
  description: string,
  isLoading: boolean,
  color?: "blue" | "emerald" | "rose" | "amber" | "purple" | "indigo" | "primary"
}) {
  const colorMap = {
    blue: "border-blue-500/50 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
    emerald: "border-emerald-500/50 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
    rose: "border-rose-500/50 text-rose-600 dark:border-rose-500/30 dark:text-rose-400",
    amber: "border-amber-500/50 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
    purple: "border-purple-500/50 text-purple-600 dark:border-purple-500/30 dark:text-purple-400",
    indigo: "border-indigo-500/50 text-indigo-600 dark:border-indigo-500/30 dark:text-indigo-400",
    primary: "border-primary/50 text-primary",
  }

  const iconColorMap = {
    blue: "text-blue-500",
    emerald: "text-emerald-500",
    rose: "text-rose-500",
    amber: "text-amber-500",
    purple: "text-purple-500",
    indigo: "text-indigo-500",
    primary: "text-primary",
  }

  return (
    <Card className={cn(
      "transition-all hover:scale-[1.02] bg-card/50 backdrop-blur-sm border-2 shadow-none",
      colorMap[color as keyof typeof colorMap]
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg border", colorMap[color as keyof typeof colorMap])}>{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
        )}
        <p className="text-xs font-medium text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
