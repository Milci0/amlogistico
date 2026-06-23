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
import IncotermsPage from './pages/IncotermsPage'
import BlankTemplatesPage from './pages/BlankTemplatesPage'
import NewsPage from './pages/NewsPage'

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
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/calibrate', element: <CalibratePage /> },

      {
        path: '/',
        element: <AppShell />, // layout publiczny — sam wygląd nie wymaga logowania
        children: [
          { index: true, element: <HomePage /> }, // hero dostępny dla każdego

          // Funkcje wymagające konta — niezalogowany trafia na /login
          {
            element: <RequireAuth />,
            children: [
              { path: 'new-document', element: <NewDocumentPage /> },
              { path: 'quotation', element: <PlaceholderPage title="Wycena" description="Wycena frachtu i kosztów transportu." /> },
              { path: 'history', element: <HistoryPage /> },
              { path: 'companies', element: <CompaniesPage /> },
              { path: 'subscription', element: <SubscriptionPage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'profile', element: <PlaceholderPage title="Profil" description="Twoje dane konta i ustawienia profilu." /> },
              { path: 'drafts', element: <PlaceholderPage title="Wersje robocze" description="Niedokończone dokumenty i zapisane szkice." /> },
              { path: 'insurance', element: <PlaceholderPage title="Ubezpieczenia" description="Polisy i ubezpieczenia ładunków." /> },
              { path: 'routes', element: <PlaceholderPage title="Trasy handlowe" description="Planowanie i analiza tras transportowych." /> },
              { path: 'news', element: <NewsPage /> },
              { path: 'incoterms', element: <IncotermsPage /> },
              { path: 'blank-templates', element: <BlankTemplatesPage /> },
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
