import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import NewDocumentPage from './pages/NewDocumentPage'
import HistoryPage from './pages/HistoryPage'
import CompaniesPage from './pages/CompaniesPage'
import SubscriptionPage from './pages/SubscriptionPage'
import SettingsPage from './pages/SettingsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'new-document', element: <NewDocumentPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'subscription', element: <SubscriptionPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
