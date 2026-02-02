import { useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Trash2, 
  Receipt, 
  ArrowDownRight, 
  Edit2,
  Utensils,
  Car,
  Home,
  Film,
  ShoppingBag,
  Heart
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
import { Expense, CATEGORY_COLORS } from '../types'

interface ExpensesSectionProps {
  expenses: Expense[]
  onUpdate: () => void
}

export function ExpensesSection({ expenses, onUpdate }: ExpensesSectionProps) {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({ amount: '', category: 'General', date: new Date().toISOString().split('T')[0], note: '' })
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  async function handleAddExpense() {
    if (!user || !newExpense.amount) return
    try {
      await blink.db.expenses.create({
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date,
        note: newExpense.note,
        userId: user.id,
      })
      onUpdate()
      setIsDialogOpen(false)
      resetForm()
      toast.success('Expense added')
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  async function handleUpdateExpense() {
    if (!user || !editingExpense || !editingExpense.amount) return
    try {
      await blink.db.expenses.update(editingExpense.id, {
        amount: typeof editingExpense.amount === 'string' ? parseFloat(editingExpense.amount) : editingExpense.amount,
        category: editingExpense.category,
        date: editingExpense.date,
        note: editingExpense.note,
      })
      onUpdate()
      setIsDialogOpen(false)
      resetForm()
      toast.success('Expense updated')
    } catch (error) {
      toast.error('Failed to update expense')
    }
  }

  function resetForm() {
    setNewExpense({ amount: '', category: 'General', date: new Date().toISOString().split('T')[0], note: '' })
    setEditingExpense(null)
  }

  function openEditDialog(expense: Expense) {
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  async function deleteExpense(id: string) {
    try {
      await blink.db.expenses.delete(id)
      onUpdate()
      toast.success('Expense deleted')
    } catch (error) {
      toast.error('Failed to delete expense')
    }
  }

  const categoryIcons: Record<string, React.ReactNode> = {
    Food: <Utensils size={18} />,
    Transport: <Car size={18} />,
    Housing: <Home size={18} />,
    Entertainment: <Film size={18} />,
    Shopping: <ShoppingBag size={18} />,
    Health: <Heart size={18} />,
    General: <Receipt size={18} />,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus size={16} /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={editingExpense ? editingExpense.amount : newExpense.amount}
                  onChange={(e) => editingExpense 
                    ? setEditingExpense({ ...editingExpense, amount: e.target.value as any })
                    : setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Select 
                  value={editingExpense ? editingExpense.category : newExpense.category} 
                  onValueChange={(val) => editingExpense 
                    ? setEditingExpense({ ...editingExpense, category: val })
                    : setNewExpense({ ...newExpense, category: val })
                  }
                >
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
                  type="date"
                  value={editingExpense ? editingExpense.date : newExpense.date}
                  onChange={(e) => editingExpense 
                    ? setEditingExpense({ ...editingExpense, date: e.target.value })
                    : setNewExpense({ ...newExpense, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Note (optional)"
                  value={editingExpense ? editingExpense.note : newExpense.note}
                  onChange={(e) => editingExpense 
                    ? setEditingExpense({ ...editingExpense, note: e.target.value })
                    : setNewExpense({ ...newExpense, note: e.target.value })
                  }
                />
              </div>
              <Button className="w-full" onClick={editingExpense ? handleUpdateExpense : handleAddExpense}>
                {editingExpense ? 'Save Changes' : 'Save Expense'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {expenses.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Receipt /></EmptyMedia>
            <EmptyTitle>No expenses yet</EmptyTitle>
            <EmptyDescription>Start tracking your spending to see your patterns.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between rounded-lg border p-4 bg-card transition-colors hover:bg-secondary/20">
              <div className="flex items-center gap-4">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ 
                    backgroundColor: `${CATEGORY_COLORS[expense.category] || '#64748b'}20`,
                    color: CATEGORY_COLORS[expense.category] || '#64748b' 
                  }}
                >
                  {categoryIcons[expense.category] || <Receipt size={18} />}
                </div>
                <div>
                  <p className="font-semibold">{expense.category}</p>
                  <p className="text-xs text-muted-foreground">{expense.date} • {expense.note || 'No note'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-rose-600">-฿{expense.amount.toFixed(2)}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(expense)}>
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteExpense(expense.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
