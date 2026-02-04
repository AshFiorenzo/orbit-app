import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  CheckSquare,
  Repeat,
  Wallet,
  Dumbbell,
  StickyNote,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  { icon: Repeat, label: 'Habits', href: '/habits' },
  { icon: Wallet, label: 'Finance', href: '/finance' },
  { icon: Dumbbell, label: 'Fitness', href: '/fitness' },
  { icon: StickyNote, label: 'Notes', href: '/notes' },
]

function SidebarContent({ className, isHorizontal }: { className?: string; isHorizontal?: boolean }) {
  const location = useLocation()
  const { logout, user } = useAuth()

  return (
    <div className={cn("flex h-full", isHorizontal ? "flex-row w-full" : "flex-col", className)}>
      <nav className={cn(
        "flex-1",
        isHorizontal 
          ? "flex flex-row items-center justify-around w-full" 
          : "space-y-1 p-2"
      )}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all group relative border-2',
                isHorizontal ? 'flex-col items-center justify-center flex-1 py-1 border-none' : '',
                isActive
                  ? 'border-primary/30 bg-primary/5 text-primary'
                  : 'border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              {!isHorizontal && (
                <item.icon className={cn('h-4 w-4 transition-transform group-hover:scale-110 mr-3')} />
              )}
              {isHorizontal && (
                <item.icon className={cn('h-5 w-5 transition-transform group-hover:scale-110')} />
              )}
              <span className={cn(isHorizontal && 'text-[10px] mt-1')}>{item.label}</span>
              {isActive && !isHorizontal && (
                <motion.div 
                  layoutId="active-nav-dot"
                  className="absolute right-2 h-1 w-1 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {!isHorizontal && (
        <div className="border-t p-2">
          {user && (
            <div className="mb-2 px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">Logged in as</p>
              <p className="truncate text-sm font-semibold">{user.displayName || user.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive px-3"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </div>
  )
}

// Desktop Sidebar
export function Sidebar() {
  return (
    <aside className="relative hidden lg:flex h-screen w-64 flex-col border-r-2 bg-card">
      <div className="flex h-16 items-center border-b-2 px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FYmeBbUvrcRXaiHna0yTTg1YAEnD2%2Forbitlogo__e6d256de.png?alt=media&token=6cafb6d1-aa01-47aa-bf45-2a59c3cd4d73" 
            alt="Orbit Logo" 
            className="h-8 w-8 transition-transform group-hover:scale-110"
          />
          <span className="text-xl font-black tracking-tighter italic">ORBIT</span>
        </Link>
      </div>
      <SidebarContent />
    </aside>
  )
}

// Mobile Bottom Navbar
export function MobileNavbar() {
  return (
    <nav className="flex lg:hidden fixed bottom-0 left-0 right-0 h-16 items-center border-t bg-card z-50">
      <SidebarContent isHorizontal className="w-full" />
    </nav>
  )
}

// Mobile Top Header (Just for the logo/title)
export function MobileHeader() {
  const { logout } = useAuth()
  return (
    <header className="flex lg:hidden h-14 items-center justify-between border-b bg-card px-4">
      <Link to="/" className="flex items-center gap-2">
        <img 
          src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FYmeBbUvrcRXaiHna0yTTg1YAEnD2%2Forbitlogo__e6d256de.png?alt=media&token=6cafb6d1-aa01-47aa-bf45-2a59c3cd4d73" 
          alt="Orbit Logo" 
          className="h-6 w-6"
        />
        <span className="text-lg font-bold tracking-tight">ORBIT</span>
      </Link>
      <Button variant="ghost" size="icon" onClick={logout} className="text-destructive">
        <LogOut size={18} />
      </Button>
    </header>
  )
}
