import { createFileRoute, redirect } from '@tanstack/react-router'
import Businesses from '@/features/businesses'

export const Route = createFileRoute('/_authenticated/businesses/')({
  component: Businesses,
  beforeLoad: () => {
    const isAuthenticatedFlag = document.cookie.includes('isAuthenticated=true')

    if (!isAuthenticatedFlag) {
      throw redirect({ to: '/sign-in' })
    }
  },
})
