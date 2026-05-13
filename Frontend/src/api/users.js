import client from './client'

export const listUsers      = ()                          => client.get('/users')
export const getMe          = ()                          => client.get('/users/me')
export const setStatus      = (id, status)                => client.patch(`/users/${id}/status`, { status })
export const changePassword = (currentPassword, newPassword) =>
  client.patch('/users/me/password', { currentPassword, newPassword })
