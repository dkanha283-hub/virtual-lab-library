import { useNavigate, useSearchParams } from 'react-router-dom'
import { AdminLoginCard } from '../components/auth/AdminLoginCard'
import { useLabStore } from '../context/LabStoreContext'
import { useEffect } from 'react'

export function AdminLoginPage() {
  const { isAdminAuthenticated } = useLabStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/admin'

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate(redirectTarget, { replace: true })
    }
  }, [isAdminAuthenticated, navigate, redirectTarget])

  return (
    <AdminLoginCard
      onSuccess={() => navigate(redirectTarget, { replace: true })}
    />
  )
}
