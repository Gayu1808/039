const BASE = '/api'
let token = localStorage.getItem('im_token')
export const setToken = t => { token = t; t ? localStorage.setItem('im_token', t) : localStorage.removeItem('im_token') }
export const hasToken = () => !!token

export async function api(path, { method = 'GET', body, form, params } = {}) {
  const h = {}
  if (token) h.Authorization = 'Bearer ' + token
  let b
  if (form) b = form
  else if (body) { h['Content-Type'] = 'application/json'; b = JSON.stringify(body) }
  const r = await fetch(BASE + path + (params ? '?' + new URLSearchParams(params) : ''), { method, headers: h, body: b })
  if (r.status === 401 && path !== '/auth/login') { setToken(null); location.reload() }
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(typeof d.detail === 'string' ? d.detail : 'Request failed')
  return d
}
export async function login(username, password) {
  const r = await fetch(BASE + '/auth/login', { method: 'POST', body: new URLSearchParams({ username, password }) })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.detail || 'Login failed')
  setToken(d.access_token)
}
