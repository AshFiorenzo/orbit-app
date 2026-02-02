import { Sidebar, MobileHeader, MobileNavbar } from './sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col lg:flex-row overflow-hidden bg-background">
      {/* Mobile Header - visible only on mobile */}
      <MobileHeader />
      
      {/* Desktop Sidebar - hidden on mobile */}
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-8 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navbar - visible only on mobile */}
      <MobileNavbar />
    </div>
  )
}
