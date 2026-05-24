import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function PrivateRoute({ role }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />
  if (role === 'owner' && !user.shopId) return <Navigate to="/cadastro/barbearia" replace />
  return <Outlet />
}
