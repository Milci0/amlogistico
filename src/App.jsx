import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './auth/AuthContext'
import RequireAuth from './components/auth/RequireAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import NewDocumentPage from './pages/NewDocumentPage'
import HistoryPage from './pages/HistoryPage'
import CompaniesPage from './pages/CompaniesPage'
import SubscriptionPage from './pages/SubscriptionPage'
import SettingsPage from './pages/SettingsPage'
import CalibratePage from './pages/CalibratePage'
import PlaceholderPage from './pages/PlaceholderPage'

// Root layout — AuthProvider wewnątrz routera, by trasy/hooki miały kontekst sesji
function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ThemeProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Strona główna = publiczny layout aplikacji (widoczny też bez logowania)
      { path: '/', element: <Navigate to="/app" replace /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/calibrate', element: <CalibratePage /> },

      {
        path: '/app',
        element: <AppShell />, // layout publiczny — sam wygląd nie wymaga logowania
        children: [
          { index: true, element: <HomePage /> }, // hero dostępny dla każdego

          // Funkcje wymagające konta — niezalogowany trafia na /login
          {
            element: <RequireAuth />,
            children: [
              { path: 'new-document', element: <NewDocumentPage /> },
              { path: 'history', element: <HistoryPage /> },
              { path: 'companies', element: <CompaniesPage /> },
              { path: 'subscription', element: <SubscriptionPage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'profile', element: <PlaceholderPage title="Profil" description="Twoje dane konta i ustawienia profilu." /> },
              { path: 'drafts', element: <PlaceholderPage title="Wersje robocze" description="Niedokończone dokumenty i zapisane szkice." /> },
              { path: 'insurance', element: <PlaceholderPage title="Ubezpieczenia" description="Polisy i ubezpieczenia ładunków." /> },
              { path: 'routes', element: <PlaceholderPage title="Trasy handlowe" description="Planowanie i analiza tras transportowych." /> },
              { path: 'incoterms', element: <PlaceholderPage title="Incoterms" description="Reguły handlowe Incoterms 2020." /> },
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
