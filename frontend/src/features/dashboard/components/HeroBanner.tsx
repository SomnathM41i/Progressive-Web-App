interface HeroBannerProps {
  name: string
}

export function HeroBanner({ name }: HeroBannerProps) {
  return (
    <section
      aria-label="Wedding inspiration"
      className="relative min-h-52 overflow-hidden rounded-2xl bg-cream shadow-card"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1100&q=90')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h1 className="sr-only">Welcome, {name}</h1>
    </section>
  )
}
