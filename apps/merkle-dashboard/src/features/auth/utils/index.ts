const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8888' : ''

export const signIn = async (
  data: { email?: string; username?: string; password: string },
  antibotToken: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/boss-auth/sign-in`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'mp-antibot-token': antibotToken,
    },
    credentials: 'include',
  })

  const json = await response.json()

  return json as {
    code: number
    message: string
    data: {
      boss: {
        username: string
        email: string
        avatar_image_url: string | null
        role: string
      }
    }
  }
}

export const signUp = async (
  data: {
    username: string
    email: string
    password: string
    confirmPassword: string
  },
  antibotToken: string
) => {
  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match')
  }

  if (data.username.length < 4) {
    throw new Error('Username must be at least 4 characters long')
  }

  const response = await fetch(`${API_BASE_URL}/api/boss-auth/sign-up`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'mp-antibot-token': antibotToken,
    },
  })

  const json = await response.json()

  return json
}
