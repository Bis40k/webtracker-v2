import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  History, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Menu,
  X,
  Radio
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { appClient } from '@/lib/app-client'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { label: 'Панель', icon: LayoutDashboard, href: '/' },
  { label: 'Карта', icon: MapIcon, href: '/map' },
  { label: 'История', icon: History, href: '/history' },
  { label: 'Безопасность', icon: ShieldCheck, href: '/security' },
  { label: 'Настройки', icon: Settings, href: '/settings' },
]

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10">
            <Radio className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <span className="font-bold text-lg tracking-tight">QuantumGPS</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                location.pathname === item.href 
                  ? "bg-primary text-primary-foreground font-medium" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
              {user?.displayName?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">{user?.displayName || 'Пользователь'}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => appClient.auth.logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-background flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Radio className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">QuantumGPS</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-border z-50 transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <Radio className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">QuantumGPS</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                location.pathname === item.href 
                  ? "bg-primary text-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive"
            onClick={() => appClient.auth.logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen pt-16 lg:pt-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

