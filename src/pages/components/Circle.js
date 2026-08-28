// src/pages/components/Circle.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as DineIcon } from '../../assets/icos/dine.svg';
import { ReactComponent as PlayIcon } from '../../assets/icos/play.svg';
import { ReactComponent as StayIcon } from '../../assets/icos/stay.svg';
import { ReactComponent as MapsIcon } from '../../assets/icos/maps.svg';
import { ReactComponent as EventsIcon } from '../../assets/icos/events.svg';
import { ReactComponent as ShopIcon } from '../../assets/icos/shop.svg';
import { useViewMode } from '../../hooks/ViewModeContext';

const icons = {
  dine: DineIcon,
  play: PlayIcon,
  stay: StayIcon,
  maps: MapsIcon,
  events: EventsIcon,
  shop: ShopIcon,
};

const Circle = ({ icon, text, angle, distance, size = 105, className }) => {
  const navigate = useNavigate();
  const IconComponent = icons[icon];
  const { setIsMapView } = useViewMode();

  const positionCircle = () => {
    const radian = (angle * Math.PI) / 180;
    const offsetLeft = distance * Math.cos(radian);
    const offsetTop = distance * Math.sin(radian);
    const radius = size / 2;

    return {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      left: `calc(50% + ${offsetLeft}px - ${radius}px)`,
      top: `calc(50% - ${offsetTop}px - ${radius}px)`,
    };
  };

  const handleNavigation = () => {
    if (icon === 'maps') {
      setIsMapView(true);
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
