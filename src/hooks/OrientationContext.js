import React, { createContext, useContext, useState, useEffect } from 'react'

const OrientationContext = createContext(null)

export const OrientationProvider = ({ children }) => {
  const [orientation, setOrientation] = useState(
    getInitialOrientation(window.innerWidth)
  )

  function getInitialOrientation(width) {
    if (width > 1000) {
      return 'desktop'
    } else {
      return window.screen.orientation?.type
    }
  }

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(getInitialOrientation(window.innerWidth))
    }

    const handleResize = () => {
      const isDesktop = window.innerWidth > 1000
      setOrientation(
        isDesktop ? 'desktop' : getInitialOrientation(window.innerWidth)
      )
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <OrientationContext.Provider value={orientation}>
      {children}
    </OrientationContext.Provider>
  )
}

export const useOrientation = () => useContext(OrientationContext)
