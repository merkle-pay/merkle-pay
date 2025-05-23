const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8888' : ''

export const mpFetch = async (
  url: string,
  options: RequestInit
): Promise<{
  code: number
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any
  message: string
}> => {
  const _url =
    API_BASE_URL && url.startsWith(API_BASE_URL) ? url : `${API_BASE_URL}${url}`
  const _refreshTokenUrl = `${API_BASE_URL}/api/boss-auth/refresh-token`

  const response = await fetch(_url, {
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
    const refreshTokenResponse = await fetch(_refreshTokenUrl, {
      method: 'POST',
      credentials: 'include',
    })
    const refreshTokenJson = await refreshTokenResponse.json()
    // ! here is 201, not 200
    if (refreshTokenJson.code === 201) {
      const result = await mpFetch(_url, options)
      return result
    }
  }

  const result = {
    ...json,
  }

  return result
}
