import { useState } from 'react'
import { blink } from '@/lib/blink'
import { useAuth } from '@/hooks/use-auth'
import { formatInAppTZ } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Trash2, Calendar, Edit2 } from 'lucide-react'
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
import { Subscription } from '../types'

const SUB_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Pink', value: '#ec4899' },
]

interface SubscriptionsSectionProps {
  subscriptions: Subscription[]
  onUpdate: () => void
}

export function SubscriptionsSection({ subscriptions, onUpdate }: SubscriptionsSectionProps) {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSub, setNewSub] = useState({ name: '', amount: '', billingCycle: 'monthly', nextPaymentDate: '', color: SUB_COLORS[0].value })
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)

  async function handleAddSub() {
    if (!user || !newSub.name || !newSub.amount) return
    try {
      await blink.db.subscriptions.create({
        ...newSub,
        amount: parseFloat(newSub.amount),
        userId: user.id,
      })
      onUpdate()
      setIsDialogOpen(false)
      resetForm()
      toast.success('Subscription added')
    } catch (error) {
      toast.error('Failed to add subscription')
    }
  }

  async function handleUpdateSub() {
    if (!user || !editingSub || !editingSub.name || !editingSub.amount) return
    try {
      await blink.db.subscriptions.update(editingSub.id, {
        name: editingSub.name,
        amount: typeof editingSub.amount === 'string' ? parseFloat(editingSub.amount) : editingSub.amount,
        billingCycle: editingSub.billingCycle,
        nextPaymentDate: editingSub.nextPaymentDate,
        color: editingSub.color,
      })
      onUpdate()
      setIsDialogOpen(false)
      resetForm()
      toast.success('Subscription updated')
    } catch (error) {
      toast.error('Failed to update subscription')
    }
  }

  function resetForm() {
    setNewSub({ name: '', amount: '', billingCycle: 'monthly', nextPaymentDate: '', color: SUB_COLORS[0].value })
    setEditingSub(null)
  }

  function openEditDialog(sub: Subscription) {
    setEditingSub(sub)
    setIsDialogOpen(true)
  }

  async function deleteSub(id: string) {
    try {
      await blink.db.subscriptions.delete(id)
      onUpdate()
      toast.success('Subscription removed')
    } catch (error) {
      toast.error('Failed to remove subscription')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recurring Payments</h3>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus size={16} /> Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSub ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input 
                placeholder="Service Name (e.g. Netflix)" 
                value={editingSub ? editingSub.name : newSub.name} 
                onChange={(e) => editingSub 
                  ? setEditingSub({ ...editingSub, name: e.target.value })
                  : setNewSub({ ...newSub, name: e.target.value })
                } 
              />
              <Input 
                type="number" 
                placeholder="Amount" 
                value={editingSub ? editingSub.amount : newSub.amount} 
                onChange={(e) => editingSub 
                  ? setEditingSub({ ...editingSub, amount: e.target.value as any })
                  : setNewSub({ ...newSub, amount: e.target.value })
                } 
              />
              <Select 
                value={editingSub ? editingSub.billingCycle : newSub.billingCycle} 
                onValueChange={(val) => editingSub 
                  ? setEditingSub({ ...editingSub, billingCycle: val })
                  : setNewSub({ ...newSub, billingCycle: val })
                }
              >
                <SelectTrigger><SelectValue placeholder="Billing Cycle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                type="date" 
                value={editingSub ? editingSub.nextPaymentDate : newSub.nextPaymentDate} 
                onChange={(e) => editingSub 
                  ? setEditingSub({ ...editingSub, nextPaymentDate: e.target.value })
                  : setNewSub({ ...newSub, nextPaymentDate: e.target.value })
                } 
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Subscription Color</p>
                <div className="flex flex-wrap gap-2">
                  {SUB_COLORS.map((c) => (
                    <button
                      key={c.value}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        (editingSub ? editingSub.color : newSub.color) === c.value
                          ? "border-primary scale-110 shadow-sm"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: c.value }}
                      onClick={() => editingSub
                        ? setEditingSub({ ...editingSub, color: c.value })
                        : setNewSub({ ...newSub, color: c.value })
                      }
                      type="button"
                    />
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={editingSub ? handleUpdateSub : handleAddSub}>
                {editingSub ? 'Save Changes' : 'Save Subscription'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {subscriptions.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Calendar /></EmptyMedia>
            <EmptyTitle>No subscriptions</EmptyTitle>
            <EmptyDescription>Keep track of your recurring payments here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => {
            const subColor = sub.color || SUB_COLORS[0].value
            return (
              <Card key={sub.id} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                <div 
                  className="h-1.5 w-full" 
                  style={{ backgroundColor: subColor }}
                />
                <CardHeader className="pb-2 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: subColor }}
                      />
                      <CardTitle className="text-base font-bold">{sub.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(sub)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteSub(sub.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="capitalize">{sub.billingCycle} billing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">฿{Number(sub.amount).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Next: {formatInAppTZ(sub.nextPaymentDate, 'MMM d, yyyy')}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}