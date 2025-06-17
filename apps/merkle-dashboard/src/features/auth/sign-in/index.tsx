import { useRef } from 'react'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
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
        <div className='flex flex-col space-y-2 text-left'>
          <h1 className='text-2xl font-semibold tracking-tight'>Login</h1>
          <p className='text-muted-foreground text-sm'>
            Use your email OR username below to login
          </p>
        </div>
        <UserAuthForm
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
          By clicking login, you agree to our{' '}
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
