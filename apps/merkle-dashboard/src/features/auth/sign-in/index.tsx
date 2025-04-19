import { useState } from 'react'
import { AntibotToken } from '@/types/antibot'
import { Card } from '@/components/ui/card'
import { CfTurnstile } from '../../../components/cf-turnstile'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
  const siteKey = window.mpGlobal?.turnstileSiteKey ?? ''

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
        <div className='flex flex-col space-y-2 text-left'>
          <h1 className='text-2xl font-semibold tracking-tight'>Login</h1>
          <p className='text-sm text-muted-foreground'>
            Enter email and password below to login
          </p>
        </div>
        <UserAuthForm antibotToken={antibotToken} />
        <div className='mt-4'>
          <CfTurnstile
            siteKey={siteKey}
            handleVerification={handleAntibotToken}
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
