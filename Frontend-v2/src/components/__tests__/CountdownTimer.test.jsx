import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import CountdownTimer from '../CountdownTimer'

describe('CountdownTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('shows "Ended" when endsAt is in the past', () => {
    render(<CountdownTimer endsAt={new Date(Date.now() - 5000).toISOString()} />)
    expect(screen.getByText('Ended')).toBeInTheDocument()
  })

  it('zero-pads hours, minutes, and seconds', () => {
    // 2h 05m 09s in the future
    const endsAt = new Date(Date.now() + 2 * 3_600_000 + 5 * 60_000 + 9_000).toISOString()
    render(<CountdownTimer endsAt={endsAt} />)
    expect(screen.getByText('02h 05m 09s')).toBeInTheDocument()
  })

  it('includes a days segment when more than 24 hours remain', () => {
    // 1d 02h in the future
    const endsAt = new Date(Date.now() + 26 * 3_600_000).toISOString()
    render(<CountdownTimer endsAt={endsAt} />)
    expect(screen.getByText(/1d/)).toBeInTheDocument()
  })

  it('omits the days segment when under 24 hours remain', () => {
    const endsAt = new Date(Date.now() + 23 * 3_600_000).toISOString()
    render(<CountdownTimer endsAt={endsAt} />)
    expect(screen.queryByText(/\dd/)).not.toBeInTheDocument()
  })

  it('decrements every second', () => {
    const endsAt = new Date(Date.now() + 10_000).toISOString()
    render(<CountdownTimer endsAt={endsAt} />)
    expect(screen.getByText('00h 00m 10s')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByText('00h 00m 09s')).toBeInTheDocument()
  })

  it('transitions to "Ended" once the timer reaches zero', () => {
    const endsAt = new Date(Date.now() + 2_000).toISOString()
    render(<CountdownTimer endsAt={endsAt} />)
    expect(screen.getByText('00h 00m 02s')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByText('Ended')).toBeInTheDocument()
  })
})
