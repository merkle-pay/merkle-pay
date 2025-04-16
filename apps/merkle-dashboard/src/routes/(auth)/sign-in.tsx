import { createFileRoute, redirect } from '@tanstack/react-router'
import SignIn from '@/features/auth/sign-in'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
  beforeLoad: () => {
    const isAuthenticatedFlag = document.cookie.includes('isAuthenticated=true')

    if (isAuthenticatedFlag) {
      throw redirect({ to: '/' })
    }
  },
})
