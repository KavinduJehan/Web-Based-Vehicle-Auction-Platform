export default function TaproLogo({ variant = 'dark', className = 'h-10' }) {
  // variant="dark": for dark/charcoal backgrounds -> uses white TAPRO + red AUTO
  // variant="light": for light/white backgrounds -> uses dark TAPRO + red AUTO
  const isDark = variant === 'dark'
  const src = isDark ? '/taproauto_logo_white.png' : '/taproauto_logo_transparent.png'

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={src}
        alt="TAPROAUTO - Japanese Vehicle Exporter"
        className="h-full w-auto max-h-12 object-contain select-none drop-shadow-sm transition-all"
        loading="eager"
      />
    </div>
  )
}
