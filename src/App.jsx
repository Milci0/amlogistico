import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import RequireAuth from './components/auth/RequireAuth'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import NewDocumentPage from './pages/NewDocumentPage'
import HistoryPage from './pages/HistoryPage'
import CompaniesPage from './pages/CompaniesPage'
import SubscriptionPage from './pages/SubscriptionPage'
import SettingsPage from './pages/SettingsPage'
import CalibratePage from './pages/CalibratePage'

// Root layout — AuthProvider wewnątrz routera, by trasy/hooki miały kontekst sesji
function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/calibrate', element: <CalibratePage /> },

      // Chronione trasy aplikacji — niezalogowany trafia na /login
      {
        element: <RequireAuth />,
        children: [
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
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
