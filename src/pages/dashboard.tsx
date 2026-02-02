import { useEffect, useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Repeat, Wallet, Dumbbell, Library, TrendingUp, StickyNote } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

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

  useEffect(() => {
    async function fetchStats() {
      if (!user) return
      setIsLoading(true)
      try {
        const [tasks, habits, expenses, savings, workouts, media] = await Promise.all([
          blink.db.tasks.count({ where: { userId: user.id, status: 'todo' } }),
          blink.db.habits.count({ where: { userId: user.id } }),
          blink.db.expenses.list({ where: { userId: user.id } }), // Sum this manually
          blink.db.savingsGoals.list({ where: { userId: user.id } }),
          blink.db.workouts.count({ where: { userId: user.id } }),
          blink.db.mediaItems.count({ where: { userId: user.id, status: 'in-progress' } }),
        ])

        const totalSpending = expenses.reduce((acc, curr) => acc + (curr.amount as number), 0)
        const totalSavings = savings.reduce((acc, curr) => acc + (curr.currentAmount as number), 0)

        setStats({
          tasks: tasks || 0,
          habits: habits || 0,
          spending: totalSpending,
          savings: totalSavings,
          workouts: workouts || 0,
          media: media || 0,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          {greeting()}, <span className="text-primary">{user?.displayName || 'User'}</span>
        </h1>
        <p className="text-lg text-muted-foreground">Here is your life at a glance.</p>
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
        <Card className="border-2 border-primary/20 relative overflow-hidden group bg-card/50 backdrop-blur-sm shadow-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.1] group-hover:opacity-[0.15] transition-opacity" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-md border border-primary/30 bg-primary/5">
                <CheckSquare className="h-4 w-4 text-primary" />
              </div>
              Today's Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
              <div className="rounded-full border-2 border-dashed border-primary/30 p-4">
                <CheckSquare className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-lg">No tasks for today</p>
                <p className="text-sm text-muted-foreground">Enjoy your free time or add a new task!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-500/20 relative overflow-hidden group bg-card/50 backdrop-blur-sm shadow-none">
          <div className="absolute inset-0 bg-dots-pattern opacity-[0.1] group-hover:opacity-[0.15] transition-opacity" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5">
                <Repeat className="h-4 w-4 text-emerald-500" />
              </div>
              Habit Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Daily Progress</span>
                <span className="font-bold text-emerald-500">0%</span>
              </div>
              <Progress value={0} className="h-2 bg-emerald-500/10" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "Consistency is the key to all success."
            </p>
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
