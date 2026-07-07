import { useState } from 'react'
import { Link } from 'react-router-dom'

const principles = [
  {
    title: 'Operational Transparency',
    text: 'Every bid action is captured and reviewable, helping buyers and admins trust outcomes with confidence.',
  },
  {
    title: 'Governed Participation',
    text: 'Role-based controls and buyer verification workflows keep auction activity focused on serious participants.',
  },
  {
    title: 'Scalable Delivery',
    text: 'A modern web architecture supports growth without returning to manual messaging workflows.',
  },
]

const contactCards = [
  {
    label: 'Office Address',
    detail: '1-1-14 Kamiikedai, Ota-ku\nTokyo 145-0064, Japan',
    href: 'https://maps.google.com/?q=1-1-14+Kamiikedai+Ota-ku+Tokyo+145-0064+Japan',
    cta: 'Open in Google Maps',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
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
    note: 'Mon – Fri, 9:00 AM – 6:00 PM JST',
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    detail: 'info@taprojapan.co.jp',
    href: 'mailto:info@taprojapan.co.jp',
    cta: 'Send an email',
    note: 'Response within 1 business day',
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
]

export default function AboutPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(form.subject || 'Taproauto Enquiry')
    const body = encodeURIComponent(`Name: ${form.name}\nFrom: ${form.email}\n\n${form.message}`)
    window.open(`mailto:info@taprojapan.co.jp?subject=${subject}&body=${body}`)
    setSent(true)
  }

  return (
    <div className="about-page">

      {/* ── About hero ── */}
      <section className="about-hero">
        <p className="eyebrow">About Taproauto</p>
        <h1>Trusted export auction operations between Sri Lanka and Japan</h1>
        <p>
          Taproauto is the digital vehicle auction platform operated under Tapro Japan Co., Ltd., built to
          replace informal bid collection with a secure and transparent enterprise process. The platform gives
          administrators full control over listing, timing, verification, and winner assignment while giving
          buyers a fair and auditable marketplace experience.
        </p>
        <div className="about-hero-actions">
          <Link to="/auctions" className="btn-primary">Browse Auctions</Link>
          <Link to="/register" className="btn-secondary">Register as Buyer</Link>
        </div>
      </section>

      {/* ── Principles ── */}
      <div className="about-principles">
        {principles.map((item) => (
          <article key={item.title} className="about-principle-card">
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      {/* ── Company info ── */}
      <section className="about-info-band">
        <div className="about-info-left">
          <p className="eyebrow">Company Information</p>
          <h2>Tapro Japan Co., Ltd.</h2>
          <dl className="about-dl">
            <div><dt>Legal Entity</dt><dd>Tapro Japan Co., Ltd.</dd></div>
            <div><dt>Address</dt><dd>1-1-14 Kamiikedai, Ota-ku, Tokyo 145-0064</dd></div>
            <div>
              <dt>Phone</dt>
              <dd><a href="tel:+81364267620">+81 3-6426-7620</a></dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd><a href="mailto:info@taprojapan.co.jp">info@taprojapan.co.jp</a></dd>
            </div>
            <div><dt>Office Hours</dt><dd>Mon-Fri, 9:00 AM – 6:00 PM JST</dd></div>
          </dl>
        </div>

        <div className="about-info-right">
          <p className="eyebrow">Company Group</p>
          <h3>Tapro Japan Export Desk</h3>
          <p>Taproauto is the vehicle auction arm of Tapro Japan. Explore the main company and its tea export operations below.</p>
          <div className="about-group-links">
            <a href="https://tea-export-website-g32a.vercel.app/about" target="_blank" rel="noreferrer">About</a>
            <a href="https://tea-export-website-g32a.vercel.app/teaproducts" target="_blank" rel="noreferrer">Products</a>
            <a href="https://tea-export-website-g32a.vercel.app/contact" target="_blank" rel="noreferrer">Contact</a>
          </div>
        </div>
      </section>

      {/* ── Contact us ── */}
      <section className="about-contact-section" id="contact">
        <div className="about-contact-heading">
          <p className="eyebrow">Contact Us</p>
          <h2>Get in touch with our team</h2>
          <p>Reach us through any of the channels below. We respond to all enquiries within one business day.</p>
        </div>

        {/* Three cards */}
        <div className="about-contact-cards">
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </article>
          ))}
        </div>

        {/* Form + hours */}
        <div className="about-contact-body">
          <div className="contact-form-panel">
            <p className="eyebrow">Write to us</p>
            <h3 style={{ marginTop: 8, marginBottom: 8, color: '#0b1724', fontSize: '1.25rem', fontWeight: 800 }}>Send a message</h3>
            <p className="contact-form-intro">Your email client will open with the message pre-filled.</p>

            {sent ? (
              <div className="contact-sent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="36" height="36" style={{ margin: '0 auto 10px', stroke: '#059669' }}>
                  <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
                </svg>
                <h3 style={{ color: '#065f46' }}>Email client opened</h3>
                <p>Send the pre-filled email from your email client to reach our team.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }} className="btn-secondary" style={{ marginTop: 12 }}>
                  Send another
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-row">
                  <div>
                    <label className="label" htmlFor="ac-name">Full name</label>
                    <input id="ac-name" name="name" type="text" required value={form.name} onChange={onChange} className="input" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="label" htmlFor="ac-email">Your email</label>
                    <input id="ac-email" name="email" type="email" required value={form.email} onChange={onChange} className="input" placeholder="you@company.com" />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="ac-subject">Subject</label>
                  <input id="ac-subject" name="subject" type="text" required value={form.subject} onChange={onChange} className="input" placeholder="Buyer registration / Vehicle enquiry / Other" />
                </div>
                <div>
                  <label className="label" htmlFor="ac-message">Message</label>
                  <textarea id="ac-message" name="message" rows={4} required value={form.message} onChange={onChange} className="input" style={{ resize: 'vertical' }} placeholder="How can we help?" />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', paddingTop: 11, paddingBottom: 11 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Send Message
                </button>
              </form>
            )}
          </div>

          <aside className="about-hours-aside">
            <div className="contact-hours-card">
              <p className="eyebrow">Availability</p>
              <h3 style={{ marginTop: 8, color: '#0b1724', fontWeight: 800, fontSize: '1rem' }}>Office hours</h3>
              <ul className="contact-hours-list">
                <li><span>Mon – Fri</span><strong>9:00 AM – 6:00 PM JST</strong></li>
                <li><span>Sat – Sun</span><strong>Closed</strong></li>
                <li><span>Email</span><strong>Within 1 business day</strong></li>
              </ul>
            </div>
            <a
              href="https://maps.google.com/?q=1-1-14+Kamiikedai+Ota-ku+Tokyo+145-0064+Japan"
              target="_blank"
              rel="noreferrer"
              className="about-map-block"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <div>
                <strong>View on Google Maps</strong>
                <span>1-1-14 Kamiikedai, Ota-ku, Tokyo</span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </aside>
        </div>
      </section>

    </div>
  )
}
