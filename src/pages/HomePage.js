import React from 'react'
import Header from './components/Header'
import HomeContent from './components/HomeContent'
import Footer from './components/Footer'
import { useOrientation } from '../hooks/OrientationContext'

const App = () => {
  const orientation = useOrientation()

  return (
    <div
      className={`app-container ${
        orientation === 'landscape-primary' ||
        orientation === 'landscape-secondary'
          ? 'landscape'
          : orientation === 'desktop'
          ? 'desktop'
          : 'portrait'
      }`}
    >
      
      <HomeContent />
      <Footer />
    </div>
  )
}

export default App
