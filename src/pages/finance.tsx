import { useEffect, useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { SummaryCards } from '@/features/finance/components/summary-cards'
import { StatisticsSection } from '@/features/finance/components/statistics-section'
import { ExpensesSection } from '@/features/finance/components/expenses-section'
import { IncomeSection } from '@/features/finance/components/income-section'
import { BudgetSection } from '@/features/finance/components/budget-section'
import { SubscriptionsSection } from '@/features/finance/components/subscriptions-section'
import { SavingsSection } from '@/features/finance/components/savings-section'
import { Expense, Income, Budget, Subscription, SavingsGoal } from '@/features/finance/types'
import { Spinner } from '@/components/ui/spinner'

export function FinancePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Income[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [savings, setSavings] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [user])

  async function fetchData() {
    if (!user) return
    setIsLoading(true)
    try {
      const [exp, inc, bud, sub, sav] = await Promise.all([
        blink.db.expenses.list({ where: { userId: user.id }, orderBy: { date: 'desc' } }),
        blink.db.income.list({ where: { userId: user.id }, orderBy: { date: 'desc' } }),
        blink.db.budgets.list({ where: { userId: user.id } }),
        blink.db.subscriptions.list({ where: { userId: user.id }, orderBy: { nextPaymentDate: 'asc' } }),
        blink.db.savingsGoals.list({ where: { userId: user.id } }),
      ])
      setExpenses(exp as Expense[])
      setIncome(inc as Income[])
      setBudgets(bud as Budget[])
      setSubscriptions(sub as Subscription[])
      setSavings(sav as SavingsGoal[])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load finance data')
    } finally {
      setIsLoading(false)
    }
  }

  const totalIncome = income.reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  const totalSavings = savings.reduce((acc, curr) => acc + curr.currentAmount, 0)

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
        <p className="text-muted-foreground">Manage your budget, track expenses, and reach financial freedom.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-background/95 -mx-4 px-4 py-2 lg:mx-0 lg:px-0 lg:py-0">
          <div className="overflow-x-auto pb-2 scrollbar-none">
            <TabsList className="inline-flex w-auto lg:w-full lg:grid lg:grid-cols-6 h-auto p-1 bg-muted/50">
              <TabsTrigger value="overview" className="px-6 py-2">Overview</TabsTrigger>
              <TabsTrigger value="income" className="px-6 py-2">Income</TabsTrigger>
              <TabsTrigger value="expenses" className="px-6 py-2">Expenses</TabsTrigger>
              <TabsTrigger value="budgets" className="px-6 py-2">Budgets</TabsTrigger>
              <TabsTrigger value="subscriptions" className="px-6 py-2">Subscriptions</TabsTrigger>
              <TabsTrigger value="savings" className="px-6 py-2">Savings</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <SummaryCards 
            totalIncome={totalIncome} 
            totalExpenses={totalExpenses} 
            totalSavings={totalSavings} 
          />
          <StatisticsSection expenses={expenses} income={income} budgets={budgets} />
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <IncomeSection income={income} onUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesSection expenses={expenses} onUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <BudgetSection budgets={budgets} expenses={expenses} onUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionsSection subscriptions={subscriptions} onUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <SavingsSection savings={savings} onUpdate={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
