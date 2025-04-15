const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8888' : ''

export const signIn = async (data: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/boss-auth/sign-in`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  const json = await response.json()

  return json
}

export const signUp = async (data: {
  business_name: string
  name: string
  email: string
  password: string
  confirmPassword: string
}) => {
  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match')
  }

  const response = await fetch(`${API_BASE_URL}/api/boss-auth/sign-up`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const json = await response.json()

  return json
}
