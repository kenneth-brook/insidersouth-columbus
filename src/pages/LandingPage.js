import React from 'react'
import '../sass/LandingPage.scss'
import RoundButton from './components/RoundButton'
import { useOrientation } from '../hooks/OrientationContext'

const LandingPage = () => {
  const orientation = useOrientation()

  return (
    <div
      className={`landing-page ${
        orientation === 'landscape-primary' ||
        orientation === 'landscape-secondary'
          ? 'landscape'
          : orientation === 'desktop'
          ? 'desktop'
          : 'portrait'
      }`}
    >
      <div className="container">
        <RoundButton />
      </div>
    </div>
  )
}

export default LandingPage
