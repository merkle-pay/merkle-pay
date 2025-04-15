export const signIn = async (data: { email: string; password: string }) => {
  const response = await fetch('http://localhost:8888/api/boss-auth/sign-in', {
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
