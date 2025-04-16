import { Turnstile } from '@marsidev/react-turnstile'
import { AntibotToken } from '../../types/antibot'

export function CfTurnstile({
  siteKey,
  handleVerification,
  options,
}: {
  siteKey: string
  handleVerification: (params: AntibotToken) => void
  options?: {
    size?: 'flexible'
  }
}) {
  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={(token) => {
        handleVerification({
          token,
          error: '',
          isExpired: false,
          isInitialized: true,
        })
      }}
      onError={(error) => {
        handleVerification({
          token: '',
          error,
          isExpired: false,
          isInitialized: true,
        })
      }}
      onExpire={() => {
        handleVerification({
          token: '',
          error: '',
          isExpired: true,
          isInitialized: true,
        })
      }}
      options={options && options}
    />
  )
}
