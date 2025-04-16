import { createFileRoute, redirect } from '@tanstack/react-router'
import Dashboard from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
  beforeLoad: () => {
    const isAuthenticatedFlag = document.cookie.includes('isAuthenticated=true')

    if (!isAuthenticatedFlag) {
      throw redirect({ to: '/sign-in' })
    }
  },
})
