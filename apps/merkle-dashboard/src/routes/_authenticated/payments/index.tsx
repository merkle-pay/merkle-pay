import { createFileRoute, redirect } from '@tanstack/react-router'
import Payments from '@/features/payments'

export const Route = createFileRoute('/_authenticated/payments/')({
  component: Payments,
  beforeLoad: () => {
    const isAuthenticatedFlag = document.cookie.includes('isAuthenticated=true')

    if (!isAuthenticatedFlag) {
      throw redirect({ to: '/sign-in' })
    }
  },
})
