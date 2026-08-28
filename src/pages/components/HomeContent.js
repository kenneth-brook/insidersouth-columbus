// src/pages/components/HomeContent.js
import React, { useEffect, useState } from 'react';
import Circle from './Circle';
import GeorgiaStateIcon from './GeorgiaStateIcon';
import { useOrientation } from '../../hooks/OrientationContext';
import { useHeightContext } from '../../hooks/HeightContext';
import Header from './Header'
import '../../sass/componentsass/HomeContent.scss'

const HomeContent = () => {
  const [circles, setCircles] = useState([]);
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  const orientation = useOrientation();
  const { headerRef, footerRef, updateHeights } = useHeightContext();

  useEffect(() => {
    updateHeights();
  }, [headerRef, footerRef, updateHeights]);

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      updateHeights();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateHeights]);

  useEffect(() => {
    const iconsKeys = ['dine', 'play', 'stay', 'maps', 'events', 'shop'];
    const texts = ['Dine', 'Play', 'Stay', 'Maps', 'Events', 'Shop'];

    const compactMobile = orientation !== 'desktop' && viewport.height <= 740;
    const circleSize = orientation === 'desktop' ? 147 : compactMobile ? 88 : 96;

    const calculateDistance = () => {
      if (orientation === 'desktop') {
        return 200;
      }

      // Keep the whole wheel inside the visible viewport. Width limits protect
      // narrow phones while height limits protect short kiosk/mobile screens.
      const widthDistance = Math.max(88, Math.min(114, (viewport.width - circleSize - 16) / 2));
      const heightDistance = viewport.height <= 650 ? 98 : viewport.height <= 740 ? 104 : 112;
      return Math.min(widthDistance, heightDistance);
    };

    const newCircles = texts.map((text, index) => {
      const angle = index * 60;
      const distance = calculateDistance();
      return { icon: iconsKeys[index], text, angle, distance, size: circleSize };
    });

    setCircles(newCircles);
  }, [orientation, viewport]);

  return (
    <>
      <Header ref={headerRef} />
      <main className="main-content homePage">
        <div className="homePage__brand">
          <h1 className="homePage__explore-prompt">Tap to begin exploring</h1>
        </div>
        <div id="main-container">
          <div className="background-circle2"></div>
          <div className="background-circle"></div>
          <div id="circle-container">
            <GeorgiaStateIcon className="home-nav-center__icon" decorative />
            {circles.map((circle, index) => (
              <Circle
                key={index}
                icon={circle.icon}
                text={circle.text}
                angle={circle.angle}
                distance={circle.distance}
                size={circle.size}
                className={circle.icon === 'play' ? 'rotated-icon' : ''}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default HomeContent;
