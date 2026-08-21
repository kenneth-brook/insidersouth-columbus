// src/pages/components/Circle.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as DineIcon } from '../../assets/icos/dine.svg';
import { ReactComponent as PlayIcon } from '../../assets/icos/play.svg';
import { ReactComponent as StayIcon } from '../../assets/icos/stay.svg';
import { ReactComponent as MapsIcon } from '../../assets/icos/maps.svg';
import { ReactComponent as EventsIcon } from '../../assets/icos/events.svg';
import { ReactComponent as ShopIcon } from '../../assets/icos/shop.svg';
import { useOrientation } from '../../hooks/OrientationContext';
import { useViewMode } from '../../hooks/ViewModeContext';

const icons = {
  dine: DineIcon,
  play: PlayIcon,
  stay: StayIcon,
  maps: MapsIcon,
  events: EventsIcon,
  shop: ShopIcon,
};

const Circle = ({ icon, text, angle, distance, className }) => {
  const navigate = useNavigate();
  const IconComponent = icons[icon];
  const orientation = useOrientation();
  const { setIsMapView } = useViewMode();

  const positionCircle = () => {
    const radian = (angle * Math.PI) / 180;
    const offsetLeft = distance * Math.cos(radian);
    const offsetTop = distance * Math.sin(radian);

    let styles = {
      position: 'absolute',
    };

    if (orientation === 'desktop') {
      styles.left = `calc(50% + ${offsetLeft}px - 78px)`;
      styles.top = `calc(50% - ${offsetTop}px - 78px)`;
    } else {
      styles.left = `calc(50% + ${offsetLeft}px - 58px)`;
      styles.top = `calc(50% - ${offsetTop}px - 58px)`;
    }

    return styles;
  };

  const handleNavigation = () => {
    if (icon === 'maps') {
      setIsMapView(true); // Set the view mode to map before navigating
      navigate('/all');
    } else {
      navigate(`/${icon}`);
    }
  };

  return (
    <div
      className={`white-circle ${className}`}
      style={positionCircle()}
      onClick={handleNavigation}
    >
      {IconComponent ? <IconComponent /> : null}
      <span className="circle-text">{text}</span>
    </div>
  );
};

export default Circle;
