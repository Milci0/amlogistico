import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { NewsProvider } from '../../context/NewsContext'
import StepTransition from '../StepTransition'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <NewsProvider>
    <div className="h-dvh bg-slate-100 dark:bg-slate-950 md:p-4">
      <div className="flex h-full overflow-hidden bg-white dark:bg-slate-900 md:rounded-2xl md:border md:border-slate-200 dark:md:border-slate-700 md:shadow-sm">

        {/* Sidebar desktop */}
        <div className="hidden md:flex md:shrink-0">
          <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />
        </div>

        {/* Sidebar mobile — overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 flex md:hidden">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Treść */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-amber-50/60 dark:bg-slate-800/40">
            <StepTransition stepKey={location.pathname} className="h-full" slide={false}>
              <Outlet />
            </StepTransition>
          </main>
        </div>
      </div>
    </div>
    </NewsProvider>
  )
}
