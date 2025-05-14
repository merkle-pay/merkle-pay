export const baseFetch = async (
  url: string,
  options: RequestInit
): Promise<{
  code: number
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any
  message: string
}> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  })
  const json = (await response.json()) as {
    code: number
    data: any // eslint-disable-line @typescript-eslint/no-explicit-any
    message: string
  }

  // ! 499 is the code for expired token
  if (json.code === 499) {
    const refreshTokenResponse = await fetch('/api/boss-auth/refresh-token', {
      method: 'POST',
      credentials: 'include',
    })
    const refreshTokenJson = await refreshTokenResponse.json()
    if (refreshTokenJson.code === 201) {
      const result = await baseFetch(url, options)
      return result
    }
  }

  const result = {
    ...json,
  }

  return result
}
