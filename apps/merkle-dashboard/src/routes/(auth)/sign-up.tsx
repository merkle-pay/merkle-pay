import { createFileRoute, redirect } from '@tanstack/react-router'
import SignUp from '@/features/auth/sign-up'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUp,
  beforeLoad: () => {
    const isAuthenticatedFlag = document.cookie.includes('isAuthenticated=true')

    if (isAuthenticatedFlag) {
      throw redirect({ to: '/' })
    }
  },
})
