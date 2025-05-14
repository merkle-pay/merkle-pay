import { useRef } from 'react'
import { Card } from '@/components/ui/card'
import {
  CfTurnstile,
  CfTurnstileHandle,
} from '../../../components/cf-turnstile'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
  const siteKey = import.meta.env.VITE_CF_TURNSTILE_SITE_KEY ?? ''

  const turnstileRef = useRef<CfTurnstileHandle>(null)

  const getAntibotToken = async () => {
    const antibotToken = await turnstileRef.current?.getResponseAsync()
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
          <p className='text-sm text-muted-foreground'>
            Use your email OR username below to login
          </p>
        </div>
        <UserAuthForm
          getAntibotToken={getAntibotToken}
          resetTurnstileToken={resetTurnstileToken}
        />
        <div className='mt-4'>
          <CfTurnstile
            siteKey={siteKey}
            ref={turnstileRef}
            options={{
              size: 'flexible',
            }}
          />
        </div>
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          By clicking login, you agree to our{' '}
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
