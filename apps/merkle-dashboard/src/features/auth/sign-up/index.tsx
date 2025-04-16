import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AntibotToken } from '@/types/antibot'
import { Card } from '@/components/ui/card'
import { CfTurnstile } from '../../../components/cf-turnstile'
import AuthLayout from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export default function SignUp() {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  const [antibotToken, setAntibotToken] = useState<AntibotToken>({
    token: '',
    error: '',
    isExpired: true,
    isInitialized: false,
  })
  const handleAntibotToken = (params: AntibotToken) => {
    setAntibotToken((prev) => ({ ...prev, ...params }))
  }

  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-lg font-semibold tracking-tight'>
            Create an account
          </h1>
          <p className='text-sm text-muted-foreground'>
            Enter your email and password to create an account. <br />
            Already have an account?{' '}
            <Link
              to='/sign-in'
              className='underline underline-offset-4 hover:text-primary'
            >
              Sign In
            </Link>
          </p>
        </div>
        <SignUpForm antibotToken={antibotToken} />
        <CfTurnstile
          siteKey={siteKey}
          handleVerification={handleAntibotToken}
        />
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          By creating an account, you agree to our{' '}
          <a
            href='/terms'
            className='underline underline-offset-4 hover:text-primary'
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href='/privacy'
            className='underline underline-offset-4 hover:text-primary'
          >
            Privacy Policy
          </a>
          .
        </p>
      </Card>
    </AuthLayout>
  )
}
