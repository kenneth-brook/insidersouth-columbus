import { useState, useEffect } from 'react';

const useOrientation = () => {
  // This example uses window.screen.orientation.angle which should work in modern browsers
  const getOrientation = () => window.screen.orientation.angle;

  const [orientation, setOrientation] = useState(getOrientation());

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(getOrientation());
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
};

export default useOrientation;
