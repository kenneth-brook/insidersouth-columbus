// src/pages/components/HomeContent.js
import React, { useEffect, useState } from 'react';
import Circle from './Circle';
import chair from '../../assets/images/chair.png';
import { useOrientation } from '../../hooks/OrientationContext';
import { useHeightContext } from '../../hooks/HeightContext';
import Header from './Header'

const HomeContent = () => {
  const [circles, setCircles] = useState([]);
  const orientation = useOrientation();
  const { headerRef, footerRef, headerHeight, footerHeight, updateHeights } = useHeightContext();

  useEffect(() => {
    updateHeights();
  }, [headerRef, footerRef, updateHeights]);

  useEffect(() => {
    const iconsKeys = ['dine', 'play', 'stay', 'maps', 'events', 'shop'];
    const texts = ['Dine', 'Play', 'Stay', 'Maps', 'Events', 'Shop'];

    const calculateDistance = () => {
      if (orientation === 'desktop') {
        return 200; // Distance for desktop
      } else {
        return 128; // Distance for mobile version
      }
    };

    const newCircles = texts.map((text, index) => {
      const angle = index * 60;
      const distance = calculateDistance();
      return { icon: iconsKeys[index], text, angle, distance };
    });

    setCircles(newCircles);
  }, [orientation]);

  return (
    <>
    <Header ref={headerRef} />
    <main className="main-content homePage">
      <h1 className="exploring-header">Tap to begin exploring</h1>
      <div id="main-container">
        <div className="background-circle2"></div>
        <div className="background-circle"></div>
        <div id="circle-container">
          <img
            src={chair}
            alt="Centered"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '78%',
              maxHeight: '78%',
              zIndex: 1,
            }}
          />
          {circles.map((circle, index) => (
            <Circle
              key={index}
              icon={circle.icon}
              text={circle.text}
              angle={circle.angle}
              distance={circle.distance}
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
