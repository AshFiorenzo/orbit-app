import { useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, PieChart, Pencil } from 'lucide-react'
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
import { Progress } from '@/components/ui/progress'
import { Budget, Expense, CATEGORY_COLORS } from '../types'

interface BudgetSectionProps {
  budgets: Budget[]
  expenses: Expense[]
  onUpdate: () => void
}

export function BudgetSection({ budgets, expenses, onUpdate }: BudgetSectionProps) {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [newBudget, setNewBudget] = useState({ amount: '', category: 'Food' })

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget)
      setNewBudget({ amount: budget.amount.toString(), category: budget.category })
    } else {
      setEditingBudget(null)
      setNewBudget({ amount: '', category: 'Food' })
    }
    setIsDialogOpen(true)
  }

  async function handleSaveBudget() {
    if (!user || !newBudget.amount) return
    try {
      if (editingBudget) {
        await blink.db.budgets.update(editingBudget.id, {
          amount: parseFloat(newBudget.amount),
          category: newBudget.category,
        })
        toast.success('Budget updated')
      } else {
        await blink.db.budgets.create({
          amount: parseFloat(newBudget.amount),
          category: newBudget.category,
          userId: user.id,
        })
        toast.success('Budget set')
      }
      onUpdate()
      setIsDialogOpen(false)
      setNewBudget({ amount: '', category: 'Food' })
      setEditingBudget(null)
    } catch (error) {
      toast.error(editingBudget ? 'Failed to update budget' : 'Failed to set budget')
    }
  }

  async function deleteBudget(id: string) {
    try {
      await blink.db.budgets.delete(id)
      onUpdate()
      toast.success('Budget removed')
    } catch (error) {
      toast.error('Failed to remove budget')
    }
  }

  const getCategorySpending = (category: string) => {
    return expenses
      .filter(e => e.category === category)
      .reduce((acc, curr) => acc + curr.amount, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Monthly Budgets</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2" onClick={() => handleOpenDialog()}>
              <Plus size={16} /> Set Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? 'Edit' : 'Set'} Category Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Select value={newBudget.category} onValueChange={(val) => setNewBudget({ ...newBudget, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food & Drink</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Monthly Limit"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleSaveBudget}>
                {editingBudget ? 'Update' : 'Save'} Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {budgets.map((budget) => {
          const spending = getCategorySpending(budget.category)
          const percentage = Math.min((spending / budget.amount) * 100, 100)
          const isOver = spending > budget.amount

          return (
            <Card key={budget.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{budget.category}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDialog(budget)}>
                    <Pencil size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBudget(budget.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Spent: ฿{spending.toFixed(2)}</span>
                  <span>Limit: ฿{budget.amount.toFixed(2)}</span>
                </div>
                <Progress 
                  value={percentage} 
                  className={cn("h-2", isOver && "bg-rose-100 [&>div]:bg-rose-600")}
                />
                <p className="text-[10px] text-right text-muted-foreground">{percentage.toFixed(0)}% used</p>
              </CardContent>
            </Card>
          )
        })}
        {budgets.length === 0 && (
          <div className="col-span-2 text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
            <PieChart className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No budgets set. Set limits for categories to track spending.</p>
          </div>
        )}
      </div>
    </div>
  )
}
