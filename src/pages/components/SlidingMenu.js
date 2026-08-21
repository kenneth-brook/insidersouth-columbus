import React from 'react';
import '../../sass/componentsass/SlidingMenu.scss';
import { ReactComponent as Triangle } from '../../assets/icos/triangle.svg';
import { ReactComponent as Cross } from '../../assets/icos/cross.svg';
import { useViewMode } from '../../hooks/ViewModeContext';
import { useNavigate } from 'react-router-dom';

function SlidingMenu({
  isOpen,
  top,
  menuContent,
  orientation,
  toggleMenu,
}) {
  const { setIsMapView } = useViewMode();
  const navigate = useNavigate();

  const handleNavigation = (link, onClick) => {
    console.log('handleNavigation called with link:', link, 'onClick:', onClick);
    if (onClick) {
      console.log('Executing onClick handler');
      onClick();
    } else if (link === '/all') {
      setIsMapView(true);
      navigate(link);
    } else if (link && link.startsWith('http')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (link) {
      navigate(link);
    }
    toggleMenu();
  };

  const menuStyle =
    orientation === 'landscape-primary' ||
    orientation === 'landscape-secondary' ||
    orientation === 'desktop'
      ? {
          left: '0px',
          transform: isOpen ? 'translateX(0)' : 'translateX(-110%)',
        }
      : {
          top: `calc(${top}px + 30px)`,
          transform: isOpen ? 'translateY(0)' : 'translateY(-110%)',
        };

  return (
    <div className={`sliding-menu ${orientation}`} style={menuStyle}>
      <button onClick={toggleMenu} className="menu-close-button">
        <Cross />
      </button>
      <div className="menu-content">
        {orientation === 'landscape-primary' ||
        orientation === 'landscape-secondary' ||
        orientation === 'desktop' ? (
          <>
            <div className="column">
              {menuContent
                .slice(0, Math.ceil(menuContent.length / 2))
                .map((item, index) => (
                  <div
                    key={index}
                    className="menu-item"
                    onClick={() => {
                      console.log('Menu item clicked:', item.label);
                      handleNavigation(item.link, item.onClick);
                    }}
                  >
                    <Triangle />
                    {item.label}
                  </div>
                ))}
            </div>
            <div className="column">
              {menuContent
                .slice(Math.ceil(menuContent.length / 2))
                .map((item, index) => (
                  <div
                    key={index + Math.ceil(menuContent.length / 2)}
                    className="menu-item"
                    onClick={() => {
                      console.log('Menu item clicked:', item.label);
                      handleNavigation(item.link, item.onClick);
                    }}
                  >
                    <Triangle />
                    {item.label}
                  </div>
                ))}
            </div>
          </>
        ) : (
          menuContent.map((item, index) => (
            <div
              key={index}
              className="menu-item"
              onClick={() => {
                console.log('Menu item clicked:', item.label);
                handleNavigation(item.link, item.onClick);
              }}
            >
              <Triangle />
              {item.label}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SlidingMenu;
