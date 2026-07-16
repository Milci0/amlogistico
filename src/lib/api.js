// Cienki wrapper na fetch dla naszego API.
// credentials:'include' → httpOnly cookie (token) leci z każdym żądaniem.
// Błędy rzucane jako ApiError ze statusem i danymi (do rozróżnienia 401/409/400 w UI).

const BASE = '/api'

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.error || `Błąd żądania (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    // brak połączenia z serwerem
    throw new ApiError(0, { error: 'Brak połączenia z serwerem' })
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* odpowiedź bez treści */
  }

  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}
