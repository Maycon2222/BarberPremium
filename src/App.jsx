import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Spinner } from './design-system'
import { Shell } from './components/shared/AppLayout'
import { PrivateRoute } from './components/shared/PrivateRoute'

const Landing = lazy(() => import('./pages/Landing').then((module) => ({ default: module.Landing })))
const Explore = lazy(() => import('./pages/Explore').then((module) => ({ default: module.Explore })))
const ShopPage = lazy(() => import('./pages/ShopPage').then((module) => ({ default: module.ShopPage })))
const Login = lazy(() => import('./pages/Auth').then((module) => ({ default: module.Login })))
const Register = lazy(() => import('./pages/Auth').then((module) => ({ default: module.Register })))
const ShopRegister = lazy(() => import('./pages/ShopRegister').then((module) => ({ default: module.ShopRegister })))
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard').then((module) => ({ default: module.ClientDashboard })))
const BookingWizard = lazy(() => import('./pages/client/BookingWizard').then((module) => ({ default: module.BookingWizard })))
const Receipt = lazy(() => import('./pages/client/Receipt').then((module) => ({ default: module.Receipt })))
const ClientHistory = lazy(() => import('./pages/client/ClientHistory').then((module) => ({ default: module.ClientHistory })))
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })))
const BarberDashboard = lazy(() => import('./pages/barber/BarberDashboard').then((module) => ({ default: module.BarberDashboard })))
const BarberWeek = lazy(() => import('./pages/barber/BarberDashboard').then((module) => ({ default: module.BarberWeek })))
const BarberHistory = lazy(() => import('./pages/barber/BarberDashboard').then((module) => ({ default: module.BarberHistory })))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard })))
const AdminBarbers = lazy(() => import('./pages/admin/AdminBarbers').then((module) => ({ default: module.AdminBarbers })))
const AdminServices = lazy(() => import('./pages/admin/AdminServices').then((module) => ({ default: module.AdminServices })))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then((module) => ({ default: module.AdminProducts })))
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments').then((module) => ({ default: module.AdminAppointments })))
const AdminReports = lazy(() => import('./pages/admin/AdminReports').then((module) => ({ default: module.AdminReports })))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then((module) => ({ default: module.AdminSettings })))
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard').then((module) => ({ default: module.OwnerDashboard })))

export default function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/shop/:slug" element={<ShopPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cadastro/cliente" element={<Register />} />
        <Route path="/cadastro/barbearia" element={<ShopRegister />} />

        <Route element={<PrivateRoute role="client" />}>
          <Route path="/client" element={<Shell role="client" />}>
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="book" element={<BookingWizard />} />
            <Route path="booking/:id" element={<Receipt />} />
            <Route path="history" element={<ClientHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute role="barber" />}>
          <Route path="/barber" element={<Shell role="barber" />}>
            <Route index element={<Navigate to="/barber/dashboard" replace />} />
            <Route path="dashboard" element={<BarberDashboard />} />
            <Route path="week" element={<BarberWeek />} />
            <Route path="services" element={<AdminServices mode="barber" />} />
            <Route path="history" element={<BarberHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute role="admin" />}>
          <Route path="/admin" element={<Shell role="admin" />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="barbers" element={<AdminBarbers />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute role="owner" />}>
          <Route path="/owner" element={<Shell role="owner" />}>
            <Route index element={<Navigate to="/owner/dashboard" replace />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="barbers" element={<AdminBarbers />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

function RouteLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3">
        <Spinner />
        <span className="text-sm font-semibold">Carregando...</span>
      </div>
    </div>
  )
}
