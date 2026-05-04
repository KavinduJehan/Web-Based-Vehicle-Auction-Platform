import client from './client'

export const login = (email, password) =>
  client.post('/auth/login', { email, password })

export const register = (name, email, password) =>
  client.post('/auth/register', { name, email, password, role: 'buyer' })

export const logout = () =>
  client.post('/auth/logout')

export const me = () =>
  client.get('/auth/me')
