import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../../api/users', () => ({ listUsers: vi.fn() }))

import Navbar from '../Navbar'
import { useAuth } from '../../context/AuthContext'
import { listUsers } from '../../api/users'

describe('Navbar', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Login and Register links when no user is logged in', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn(), isAdmin: false })

    render(<MemoryRouter><Navbar /></MemoryRouter>)

    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument()
  })

  it('shows Logout button and email when a buyer is logged in', () => {
    useAuth.mockReturnValue({ user: { email: 'buyer@test.com', role: 'buyer' }, logout: vi.fn(), isAdmin: false })

    render(<MemoryRouter><Navbar /></MemoryRouter>)

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    expect(screen.getByText('buyer@test.com')).toBeInTheDocument()
  })

  it('shows a red badge with the pending count for an admin', async () => {
    useAuth.mockReturnValue({ user: { email: 'admin@test.com', role: 'admin' }, logout: vi.fn(), isAdmin: true })
    listUsers.mockResolvedValueOnce({
      data: [
        { id: 1, verificationStatus: 'pending' },
        { id: 2, verificationStatus: 'pending' },
        { id: 3, verificationStatus: 'verified' },
      ],
    })

    render(<MemoryRouter><Navbar /></MemoryRouter>)

    const badge = await screen.findByText('2')
    expect(badge).toHaveClass('bg-red-500')
  })

  it('shows no badge when there are no pending users', async () => {
    useAuth.mockReturnValue({ user: { email: 'admin@test.com', role: 'admin' }, logout: vi.fn(), isAdmin: true })
    listUsers.mockResolvedValueOnce({
      data: [{ id: 1, verificationStatus: 'verified' }],
    })

    render(<MemoryRouter><Navbar /></MemoryRouter>)

    await waitFor(() => expect(listUsers).toHaveBeenCalled())
    expect(document.querySelector('.bg-red-500')).not.toBeInTheDocument()
  })

  it('shows "9+" badge when more than 9 users are pending', async () => {
    useAuth.mockReturnValue({ user: { email: 'admin@test.com', role: 'admin' }, logout: vi.fn(), isAdmin: true })
    listUsers.mockResolvedValueOnce({
      data: Array.from({ length: 11 }, (_, i) => ({ id: i + 1, verificationStatus: 'pending' })),
    })

    render(<MemoryRouter><Navbar /></MemoryRouter>)

    const badge = await screen.findByText('9+')
    expect(badge).toHaveClass('bg-red-500')
  })
})
