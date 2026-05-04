import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stub out child components so we only test App's own banner logic
vi.mock('../router', () => ({ default: () => null }))
vi.mock('../components/Navbar', () => ({ default: () => null }))

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/auctions', () => ({ getMyWonAuctions: vi.fn() }))

import App from '../App'
import { useAuth } from '../context/AuthContext'
import { getMyWonAuctions } from '../api/auctions'

const buyerUser = { sub: 1, role: 'buyer', email: 'buyer@test.com' }
const adminUser = { sub: 2, role: 'admin', email: 'admin@test.com' }

const wonAuction = {
  id: 42,
  title: 'Test Auction',
  vehicle_make: 'Toyota',
  vehicle_model: 'Camry',
  vehicle_year: 2020,
  winning_amount: '25000',
}

describe('App — won auction banners', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows a won banner for a buyer with undismissed wins', async () => {
    useAuth.mockReturnValue({ user: buyerUser, isAdmin: false })
    getMyWonAuctions.mockResolvedValueOnce({ data: [wonAuction] })

    render(<MemoryRouter><App /></MemoryRouter>)

    await waitFor(() => expect(screen.getByText(/Congratulations/i)).toBeInTheDocument())
    expect(screen.getByText(/Test Auction/)).toBeInTheDocument()
    expect(screen.getByText(/LKR/)).toBeInTheDocument()
  })

  it('does not show a banner for an admin', () => {
    useAuth.mockReturnValue({ user: adminUser, isAdmin: true })

    render(<MemoryRouter><App /></MemoryRouter>)

    // The effect returns early for admin — no API call, no banner
    expect(getMyWonAuctions).not.toHaveBeenCalled()
    expect(screen.queryByText(/Congratulations/i)).not.toBeInTheDocument()
  })

  it('hides banner and saves dismissal to localStorage when the ✕ button is clicked', async () => {
    useAuth.mockReturnValue({ user: buyerUser, isAdmin: false })
    getMyWonAuctions.mockResolvedValueOnce({ data: [wonAuction] })

    render(<MemoryRouter><App /></MemoryRouter>)

    const dismissBtn = await screen.findByRole('button', { name: /Dismiss/i })
    fireEvent.click(dismissBtn)

    expect(screen.queryByText(/Congratulations/i)).not.toBeInTheDocument()
    const dismissed = JSON.parse(localStorage.getItem('wonDismissed'))
    expect(dismissed).toContain(42)
  })

  it('does not show banner for a win that was previously dismissed', async () => {
    localStorage.setItem('wonDismissed', JSON.stringify([42]))
    useAuth.mockReturnValue({ user: buyerUser, isAdmin: false })
    getMyWonAuctions.mockResolvedValueOnce({ data: [wonAuction] })

    render(<MemoryRouter><App /></MemoryRouter>)

    // Wait for the API call to resolve
    await waitFor(() => expect(getMyWonAuctions).toHaveBeenCalled())
    expect(screen.queryByText(/Congratulations/i)).not.toBeInTheDocument()
  })
})
