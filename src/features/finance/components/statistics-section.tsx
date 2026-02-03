import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts'
import { getNow, formatInAppTZ } from '@/lib/date-utils'
import { Expense, Income, Budget, CATEGORY_COLORS } from '../types'

interface StatisticsSectionProps {
  expenses: Expense[]
  income: Income[]
  budgets: Budget[]
}

export function StatisticsSection({ expenses, income, budgets }: StatisticsSectionProps) {
  // Category breakdown for pie chart
  const categoryData = expenses.reduce((acc: any[], curr) => {
    const existing = acc.find(i => i.name === curr.category)
    if (existing) {
      existing.value += curr.amount
    } else {
      acc.push({ name: curr.category, value: curr.amount })
    }
    return acc
  }, [])

  // Monthly trends for bar chart
  const getMonthlyData = () => {
    const months: any = {}
    
    expenses.forEach(e => {
      const month = e.date.substring(0, 7) // YYYY-MM
      if (!months[month]) months[month] = { name: month, expense: 0, income: 0 }
      months[month].expense += e.amount
    })

    income.forEach(i => {
      const month = i.date.substring(0, 7)
      if (!months[month]) months[month] = { name: month, expense: 0, income: 0 }
      months[month].income += i.amount
    })

    return Object.values(months).sort((a: any, b: any) => a.name.localeCompare(b.name))
  }

  // Daily trends for line chart (last 30 days)
  const getDailyData = () => {
    const last30Days = new Array(30).fill(0).map((_, i) => {
      const d = getNow()
      d.setDate(d.getDate() - (29 - i))
      return formatInAppTZ(d, 'yyyy-MM-dd')
    })

    return last30Days.map(date => {
      const dayExpenses = expenses
        .filter(e => e.date === date)
        .reduce((acc, curr) => acc + curr.amount, 0)
      return { name: date.substring(5), amount: dayExpenses }
    })
  }

  // Budget vs Actual data
  const getBudgetData = () => {
    return budgets.map(b => {
      const spending = expenses
        .filter(e => e.category === b.category)
        .reduce((acc, curr) => acc + curr.amount, 0)
      return {
        name: b.category,
        budget: b.amount,
        actual: spending
      }
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Distribution of your expenses</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `฿${value.toFixed(2)}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Spending</CardTitle>
          <CardDescription>Last 30 days expenses trend</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getDailyData()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                formatter={(value: number) => `฿${value.toFixed(2)}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#18181B" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4, strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
          <CardDescription>Compare your limits with real spending</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getBudgetData()} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
              <Tooltip 
                formatter={(value: number) => `฿${value.toFixed(2)}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar dataKey="budget" fill="#6366f1" name="Budget" radius={[0, 4, 4, 0]} opacity={0.6} />
              <Bar dataKey="actual" fill="#10b981" name="Actual" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Income vs Expenses over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getMonthlyData()}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `฿${value.toFixed(2)}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}