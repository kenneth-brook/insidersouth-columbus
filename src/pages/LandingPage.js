import React from 'react'
import '../sass/LandingPage.scss'
import RoundButton from './components/RoundButton'
import columbusRiverfront from '../assets/images/columbus-riverfront.png'

const LandingPage = () => {
  return (
    <main className="landing-page">
      <section className="landing-page__brand-panel">
        <div className="landing-page__brand">
          <div className="landing-page__inside">INSIDER</div>
          <div className="landing-page__south">SOUTH</div>

          <div className="landing-page__city">COLUMBUS</div>
          <div className="landing-page__location">GEORGIA'S RIVER CITY</div>
        </div>

        <div className="landing-page__guide-copy">
          <h1>TRIP GUIDE</h1>
          <p className="landing-page__tagline">Ride the River. Explore the City.</p>
          <p className="landing-page__official">Official Guide to Columbus, GA</p>
        </div>
      </section>

      <section
        className="landing-page__photo-panel"
        style={{ backgroundImage: `url(${columbusRiverfront})` }}
        aria-label="Columbus riverfront along the Chattahoochee River"
      >
        <div className="landing-page__start">
          <RoundButton />
        </div>
      </section>
    </main>
  )
}

export default LandingPage
