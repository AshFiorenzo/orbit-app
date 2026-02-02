export interface Expense {
  id: string
  amount: number
  category: string
  date: string
  note: string
  userId: string
}

export interface Income {
  id: string
  amount: number
  source: string
  date: string
  userId: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  userId: string
}

export interface Subscription {
  id: string
  name: string
  amount: number
  billingCycle: string
  nextPaymentDate: string
  userId: string
  color?: string
}

export interface SavingsGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string
  userId: string
  color?: string
}

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f97316', // orange-500
  Transport: '#3b82f6', // blue-500
  Housing: '#8b5cf6', // purple-500
  Entertainment: '#ec4899', // pink-500
  Shopping: '#eab308', // yellow-500
  Health: '#10b981', // emerald-500
  General: '#64748b', // slate-500
}
