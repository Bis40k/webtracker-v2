import React from 'react'
import { 
  Outlet, 
  RouterProvider, 
  createRouter, 
  createRoute, 
  createRootRoute,
  Navigate,
} from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import Dashboard from '@/pages/dashboard'
import MapPage from '@/pages/map'
import HistoryPage from '@/pages/history'
import SecurityPage from '@/pages/security'
import SettingsPage from '@/pages/settings'
import LoginPage from '@/pages/login'
import { Toaster } from 'sonner'

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-right" />
    </>
  ),
})

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

// Index route (Dashboard)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AuthGuard(Dashboard),
})

// Map route
const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/map',
  component: AuthGuard(MapPage),
})

// History route
const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: AuthGuard(HistoryPage),
})

// Security route
const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/security',
  component: AuthGuard(SecurityPage),
})

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: AuthGuard(SettingsPage),
})

// Create router
const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  mapRoute,
  historyRoute,
  securityRoute,
  settingsRoute,
])

const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
})

// Auth Guard HOC
function AuthGuard(Component: React.ComponentType) {
  return function GuardedComponent() {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-primary font-medium animate-pulse">Инициализация QuantumGPS...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      return <Navigate to="/login" />
    }

    return <Component />
  }
}

function App() {
  return <RouterProvider router={router} />
}

export default App
