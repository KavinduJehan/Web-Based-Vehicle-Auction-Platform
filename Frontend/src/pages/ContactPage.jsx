import { useState } from 'react'
import { Link } from 'react-router-dom'

const contactCards = [
  {
    label: 'Office Address',
    detail: '1-1-14 Kamiikedai, Ota-ku\nTokyo 145-0064, Japan',
    href: 'https://maps.google.com/?q=1-1-14+Kamiikedai+Ota-ku+Tokyo+145-0064+Japan',
    cta: 'Open in Google Maps',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="contact-card-icon">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    label: 'Phone',
    detail: '+81 3-6426-7620',
    href: 'tel:+81364267620',
    cta: 'Call us now',
    external: false,
    note: 'Mon – Fri, 9:00 AM – 6:00 PM JST',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="contact-card-icon">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    detail: 'info@taprojapan.co.jp',
    href: 'mailto:info@taprojapan.co.jp',
    cta: 'Send an email',
    external: false,
    note: 'Response within 1 business day',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="contact-card-icon">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(form.subject || 'Taproauto Enquiry')
    const body = encodeURIComponent(
      `Name: ${form.name}\nFrom: ${form.email}\n\n${form.message}`
    )
    window.open(`mailto:info@taprojapan.co.jp?subject=${subject}&body=${body}`)
    setSent(true)
  }

  return (
    <div className="contact-page">

      {/* ── Hero ── */}
      <section className="contact-hero">
        <div className="contact-hero-copy">
          <p className="eyebrow">Get in touch</p>
          <h1>We're here to help with your auction enquiry</h1>
          <p>
            Our team at Tapro Japan Export Desk is ready to assist with buyer registration,
            vehicle enquiries, and auction access. Reach us through any of the channels below.
          </p>
        </div>
      </section>

      {/* ── Contact cards ── */}
      <div className="contact-cards">
        {contactCards.map((card) => (
          <article key={card.label} className="contact-card">
            <div className="contact-card-icon-wrap">{card.icon}</div>
            <p className="contact-card-label">{card.label}</p>
            <p className="contact-card-detail">{card.detail}</p>
            {card.note && <p className="contact-card-note">{card.note}</p>}
            <a
              href={card.href}
              target={card.external ? '_blank' : undefined}
              rel={card.external ? 'noreferrer' : undefined}
              className="contact-card-link"
            >
              {card.cta}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </article>
        ))}
      </div>

      {/* ── Main content: form + info ── */}
      <div className="contact-body">

        {/* Contact form */}
        <section className="contact-form-panel">
          <p className="eyebrow">Send a message</p>
          <h2>Write to us directly</h2>
          <p className="contact-form-intro">
            Fill in the form below and your email client will open with the message pre-filled,
            ready to send to our team.
          </p>

          {sent ? (
            <div className="contact-sent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="36" height="36">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <h3>Email client opened</h3>
              <p>Your message was prepared. Send it from your email client to reach our team.</p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }} className="btn-secondary" style={{ marginTop: '12px' }}>
                Send another
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div>
                  <label className="label" htmlFor="cf-name">Full name</label>
                  <input id="cf-name" name="name" type="text" required value={form.name} onChange={onChange} className="input" placeholder="Kavindu Hamid" />
                </div>
                <div>
                  <label className="label" htmlFor="cf-email">Your email</label>
                  <input id="cf-email" name="email" type="email" required value={form.email} onChange={onChange} className="input" placeholder="you@company.com" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="cf-subject">Subject</label>
                <input id="cf-subject" name="subject" type="text" required value={form.subject} onChange={onChange} className="input" placeholder="Buyer registration / Vehicle enquiry / Other" />
              </div>
              <div>
                <label className="label" htmlFor="cf-message">Message</label>
                <textarea id="cf-message" name="message" rows={5} required value={form.message} onChange={onChange} className="input" style={{ resize: 'vertical' }} placeholder="Tell us what you need help with..." />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', paddingTop: '11px', paddingBottom: '11px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send Message
              </button>
            </form>
          )}
        </section>

        {/* Office & hours info */}
        <aside className="contact-aside">
          <section className="contact-office-card">
            <p className="eyebrow">Head office</p>
            <h2>Tapro Japan Co., Ltd.</h2>
            <address className="contact-address">
              <p>1-1-14 Kamiikedai</p>
              <p>Ota-ku, Tokyo 145-0064</p>
              <p>Japan</p>
            </address>
            <a
              href="https://maps.google.com/?q=1-1-14+Kamiikedai+Ota-ku+Tokyo+145-0064+Japan"
              target="_blank"
              rel="noreferrer"
              className="contact-map-link"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              View location on Google Maps
            </a>
          </section>

          <section className="contact-hours-card">
            <p className="eyebrow">Availability</p>
            <h3>Office hours</h3>
            <ul className="contact-hours-list">
              <li><span>Monday – Friday</span><strong>9:00 AM – 6:00 PM JST</strong></li>
              <li><span>Saturday – Sunday</span><strong>Closed</strong></li>
              <li><span>Email response</span><strong>Within 1 business day</strong></li>
            </ul>
          </section>

          <section className="contact-group-card">
            <p className="eyebrow">Company group</p>
            <h3>Also part of Tapro Japan</h3>
            <p>Explore the main company site for tea export operations and general business information.</p>
            <div className="contact-group-links">
              <a href="https://tea-export-website-g32a.vercel.app/about" target="_blank" rel="noreferrer">About</a>
              <a href="https://tea-export-website-g32a.vercel.app/teaproducts" target="_blank" rel="noreferrer">Products</a>
              <a href="https://tea-export-website-g32a.vercel.app/contact" target="_blank" rel="noreferrer">Contact</a>
            </div>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/auctions" className="btn-primary" style={{ justifyContent: 'center' }}>Browse Auctions</Link>
            <Link to="/register" className="btn-secondary" style={{ justifyContent: 'center' }}>Register as Buyer</Link>
          </div>
        </aside>
      </div>

    </div>
  )
}
