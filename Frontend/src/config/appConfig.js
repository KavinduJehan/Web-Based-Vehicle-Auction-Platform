/**
 * Application-wide configuration and feature toggles.
 * When VITE_ENABLE_AUCTION is false, the app runs in Direct Sales / Dealership Showroom mode.
 * When true, it runs in Live Auction mode.
 */
export const isAuctionEnabled = import.meta.env.VITE_ENABLE_AUCTION === 'true'

export const DEALER_CONFIG = {
  name: import.meta.env.VITE_DEALER_NAME || 'TAPRO AUTO',
  tagline: import.meta.env.VITE_DEALER_TAGLINE || 'Premier Japanese Vehicle Exporters',
  whatsapp: import.meta.env.VITE_DEALER_WHATSAPP || '+819012345678',
  email: import.meta.env.VITE_DEALER_EMAIL || 'sales@taproauto.com',
  location: 'Yokohama & Kobe Ports, Japan',
  phone: '+81 (0) 45 123 4567',
  workingHours: 'Mon - Sat: 9:00 AM - 7:00 PM JST'
}
