// src/pages/components/HomeContent.js
import React, { useEffect, useState } from 'react';
import Circle from './Circle';
import { useOrientation } from '../../hooks/OrientationContext';
import { useHeightContext } from '../../hooks/HeightContext';
import Header from './Header'
import '../../sass/componentsass/HomeContent.scss'

const HomeContent = () => {
  const [circles, setCircles] = useState([]);
  const orientation = useOrientation();
  const { headerRef, footerRef, updateHeights } = useHeightContext();

  useEffect(() => {
    updateHeights();
  }, [headerRef, footerRef, updateHeights]);

  useEffect(() => {
    const iconsKeys = ['dine', 'play', 'stay', 'maps', 'events', 'shop'];
    const texts = ['Dine', 'Play', 'Stay', 'Maps', 'Events', 'Shop'];

    const calculateDistance = () => {
      if (orientation === 'desktop') {
        return 200;
      } else {
        return 128;
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
        <div className="homePage__brand">
          <img
            src={`${process.env.PUBLIC_URL}/images/visit-georgia.png`}
            alt=""
            aria-label="Visit Georgia"
            className="homePage__brand-image"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div id="main-container">
          <div className="background-circle2"></div>
          <div className="background-circle"></div>
          <div id="circle-container">
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
