import { useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { getTodayStr } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty'
import { Income } from '../types'

interface IncomeSectionProps {
  income: Income[]
  onUpdate: () => void
}

export function IncomeSection({ income, onUpdate }: IncomeSectionProps) {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newIncome, setNewIncome] = useState({ amount: '', source: '', date: getTodayStr() })

  async function handleAddIncome() {
    if (!user || !newIncome.amount || !newIncome.source) return
    try {
      await blink.db.income.create({
        amount: parseFloat(newIncome.amount),
        source: newIncome.source,
        date: newIncome.date,
        userId: user.id,
      })
      onUpdate()
      setIsDialogOpen(false)
      setNewIncome({ amount: '', source: '', date: getTodayStr() })
      toast.success('Income added')
    } catch (error) {
      toast.error('Failed to add income')
    }
  }

  async function deleteIncome(id: string) {
    try {
      await blink.db.income.delete(id)
      onUpdate()
      toast.success('Income record deleted')
    } catch (error) {
      toast.error('Failed to delete income')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Income Sources</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus size={16} /> Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Income</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newIncome.amount}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Source (e.g. Salary, Freelance)"
                  value={newIncome.source}
                  onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={newIncome.date}
                  onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleAddIncome}>
                Save Income
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {income.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><ArrowUpRight /></EmptyMedia>
            <EmptyTitle>No income records</EmptyTitle>
            <EmptyDescription>Track your earnings to see your total balance.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {income.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-4 bg-card hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                  <ArrowUpRight size={18} />
                </div>
                <div>
                  <p className="font-semibold">{item.source}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-emerald-600">+฿{item.amount.toFixed(2)}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteIncome(item.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}