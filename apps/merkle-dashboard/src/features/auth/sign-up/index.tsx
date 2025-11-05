import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export default function SignUp() {
  const siteKey = import.meta.env.VITE_CF_TURNSTILE_SITE_KEY ?? ''

  const turnstileRef = useRef<TurnstileInstance | null>(null)

  const getAntibotToken = async () => {
    const antibotToken = await turnstileRef.current?.getResponsePromise()
    return antibotToken
  }

  const resetTurnstileToken = () => {
    turnstileRef.current?.reset()
  }

  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-lg font-semibold tracking-tight'>
            Create an account
          </h1>
          <p className='text-muted-foreground text-sm'>
            Enter your email and password to create an account. <br />
            Already have an account?{' '}
            <Link
              to='/sign-in'
              className='hover:text-primary underline underline-offset-4'
            >
              Sign In
            </Link>
          </p>
        </div>
        <SignUpForm
          getAntibotToken={getAntibotToken}
          resetTurnstileToken={resetTurnstileToken}
        />
        <div className='mt-4'>
          <Turnstile
            siteKey={siteKey}
            ref={turnstileRef}
            options={{
              size: 'flexible',
            }}
          />
        </div>
        <p className='text-muted-foreground mt-4 px-8 text-center text-sm'>
          By creating an account, you agree to our{' '}
          <a
            href='/terms'
            className='hover:text-primary underline underline-offset-4'
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href='/privacy'
            className='hover:text-primary underline underline-offset-4'
          >
            Privacy Policy
          </a>
          .
        </p>
      </Card>
    </AuthLayout>
  )
}
