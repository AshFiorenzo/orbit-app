import { useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, PiggyBank, Edit2, Wallet } from 'lucide-react'
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
import { Progress } from '@/components/ui/progress'
import { SavingsGoal } from '../types'

interface SavingsSectionProps {
  savings: SavingsGoal[]
  onUpdate: () => void
}

export function SavingsSection({ savings, onUpdate }: SavingsSectionProps) {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isContributeOpen, setIsContributeOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', currentAmount: '0', deadline: '' })
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null)
  const [contributionAmount, setContributionAmount] = useState('')

  async function handleAddGoal() {
    if (!user || !newGoal.title || !newGoal.targetAmount) return
    try {
      await blink.db.savingsGoals.create({
        ...newGoal,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: parseFloat(newGoal.currentAmount),
        userId: user.id,
      })
      onUpdate()
      setIsDialogOpen(false)
      resetForm()
      toast.success('Savings goal added')
    } catch (error) {
      toast.error('Failed to add goal')
    }
  }

  async function handleUpdateGoal() {
    if (!user || !editingGoal || !editingGoal.title || !editingGoal.targetAmount) return
    try {
      await blink.db.savingsGoals.update(editingGoal.id, {
        title: editingGoal.title,
        targetAmount: typeof editingGoal.targetAmount === 'string' ? parseFloat(editingGoal.targetAmount) : editingGoal.targetAmount,
        currentAmount: typeof editingGoal.currentAmount === 'string' ? parseFloat(editingGoal.currentAmount) : editingGoal.currentAmount,
        deadline: editingGoal.deadline,
      })
      onUpdate()
      setIsDialogOpen(false)
      resetForm()
      toast.success('Savings goal updated')
    } catch (error) {
      toast.error('Failed to update goal')
    }
  }

  async function handleContribute() {
    if (!user || !contributingGoal || !contributionAmount) return
    try {
      const current = parseFloat(contributingGoal.currentAmount as any)
      const additional = parseFloat(contributionAmount)
      const newTotal = current + additional

      await blink.db.savingsGoals.update(contributingGoal.id, {
        currentAmount: newTotal,
      })
      onUpdate()
      setIsContributeOpen(false)
      setContributionAmount('')
      setContributingGoal(null)
      toast.success('Contribution added!')
    } catch (error) {
      toast.error('Failed to add contribution')
    }
  }

  function resetForm() {
    setNewGoal({ title: '', targetAmount: '', currentAmount: '0', deadline: '' })
    setEditingGoal(null)
  }

  function openEditDialog(goal: SavingsGoal) {
    setEditingGoal(goal)
    setIsDialogOpen(true)
  }

  async function deleteGoal(id: string) {
    try {
      await blink.db.savingsGoals.delete(id)
      onUpdate()
      toast.success('Goal removed')
    } catch (error) {
      toast.error('Failed to remove goal')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Savings Goals</h3>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus size={16} /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Savings Goal' : 'Set Savings Goal'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="What are you saving for?"
                value={editingGoal ? editingGoal.title : newGoal.title}
                onChange={(e) => editingGoal
                  ? setEditingGoal({ ...editingGoal, title: e.target.value })
                  : setNewGoal({ ...newGoal, title: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Target Amount"
                value={editingGoal ? editingGoal.targetAmount : newGoal.targetAmount}
                onChange={(e) => editingGoal
                  ? setEditingGoal({ ...editingGoal, targetAmount: e.target.value as any })
                  : setNewGoal({ ...newGoal, targetAmount: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Starting Amount"
                value={editingGoal ? editingGoal.currentAmount : newGoal.currentAmount}
                onChange={(e) => editingGoal
                  ? setEditingGoal({ ...editingGoal, currentAmount: e.target.value as any })
                  : setNewGoal({ ...newGoal, currentAmount: e.target.value })
                }
              />
              <Input
                type="date"
                value={editingGoal ? editingGoal.deadline : newGoal.deadline}
                onChange={(e) => editingGoal
                  ? setEditingGoal({ ...editingGoal, deadline: e.target.value })
                  : setNewGoal({ ...newGoal, deadline: e.target.value })
                }
              />
              <Button className="w-full" onClick={editingGoal ? handleUpdateGoal : handleAddGoal}>
                {editingGoal ? 'Save Changes' : 'Create Goal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Savings: {contributingGoal?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              placeholder="Amount to add"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
            />
            <Button className="w-full" onClick={handleContribute}>
              Add to Savings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {savings.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><PiggyBank /></EmptyMedia>
            <EmptyTitle>No savings goals</EmptyTitle>
            <EmptyDescription>Dreaming of something? Set a goal and watch it grow.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {savings.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            return (
              <Card key={goal.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">{goal.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        onClick={() => {
                          setContributingGoal(goal)
                          setIsContributeOpen(true)
                        }}
                        title="Add Savings"
                      >
                        <Wallet size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(goal)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteGoal(goal.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold">฿{goal.currentAmount.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground"> / ฿{goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {goal.deadline && (
                    <p className="text-xs text-muted-foreground">Target Date: {goal.deadline}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
