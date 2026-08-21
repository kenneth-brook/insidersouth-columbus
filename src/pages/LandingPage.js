import React from 'react'
import { Link } from 'react-router-dom'
import '../sass/LandingPage.scss'
import { useOrientation } from '../hooks/OrientationContext'

const LandingPage = () => {
  const orientation = useOrientation()

  const orientationClass =
    orientation === 'landscape-primary' ||
    orientation === 'landscape-secondary'
      ? 'landscape'
      : orientation === 'desktop'
      ? 'desktop'
      : 'portrait'

  return (
    <main className={`landing-page ${orientationClass}`}>
      <div className="landing-page__river" aria-hidden="true" />

      <header className="landing-page__brand">
        <span className="landing-page__brand-inside">INSIDE</span>
        <span className="landing-page__brand-south">SOUTH</span>
      </header>

      <section className="landing-page__content">
        <p className="landing-page__eyebrow">Explore Georgia</p>

        <h1>COLUMBUS</h1>

        <p className="landing-page__subtitle">
          Georgia's River City
        </p>

        <p className="landing-page__intro">
          Adventure flows through Columbus, where the Chattahoochee River
          meets a vibrant downtown filled with history, culture and Southern
          hospitality.
        </p>

        <Link to="/home" className="landing-page__explore">
          <span>Explore Columbus</span>
          <span className="landing-page__arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </section>

      <footer className="landing-page__footer">
        Go all out in Columbus, GA
      </footer>
    </main>
  )
}

export default LandingPage