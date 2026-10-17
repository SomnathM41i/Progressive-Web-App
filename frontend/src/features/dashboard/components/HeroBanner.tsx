import { useEffect, useState } from 'react'

const slides = [
  {
    src: '/images/wedding-hero-generated.webp',
    alt: 'A newlywed Marathi couple in ivory and maroon wedding attire',
  },
  {
    src: '/images/wedding-hero-generated-2.webp',
    alt: 'A newlywed couple smiling together in traditional wedding attire',
  },
  {
    src: '/images/wedding-hero-generated-3.webp',
    alt: 'A newlywed Marathi couple sharing a joyful moment',
  },
]

interface HeroBannerProps {
  name: string
}

export function HeroBanner({ name }: HeroBannerProps) {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section
      aria-label="Wedding inspiration"
      aria-roledescription="carousel"
      className="relative h-52 overflow-hidden rounded-2xl bg-cream shadow-card"
    >
      <h1 className="sr-only">Welcome, {name}</h1>
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={index === activeSlide ? slide.alt : ''}
          aria-hidden={index !== activeSlide}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      ))}
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2" aria-label="Choose a slide">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === activeSlide}
            onClick={() => setActiveSlide(index)}
            className={`size-2.5 rounded-full border border-white shadow-sm transition ${index === activeSlide ? 'scale-110 bg-white' : 'bg-white/45 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </section>
  )
}
