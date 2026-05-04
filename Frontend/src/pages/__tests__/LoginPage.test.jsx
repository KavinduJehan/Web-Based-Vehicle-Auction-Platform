import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '../LoginPage'

// useAuth mock — login fn is not called in error/banner tests, but needed to satisfy the hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
}))

// Mock the login API call
vi.mock('../../api/auth', () => ({
  login: vi.fn(),
}))

import { login as mockLogin } from '../../api/auth'

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders email and password fields', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows the session-expired yellow banner when location.state.message is set', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { message: 'Your session expired. Please log in again.' } }]}>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Your session expired. Please log in again.')).toBeInTheDocument()
  })

  it('shows the "Account created" green banner when ?registered param is present', () => {
    render(
      <MemoryRouter initialEntries={['/login?registered=1']}>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByText(/Account created/i)).toBeInTheDocument()
  })

  it('shows an error when the login API rejects', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    })
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument())
  })

  it('shows a fallback error when the API rejects with no response body', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'))
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText(/Login failed/i)).toBeInTheDocument())
  })
})
