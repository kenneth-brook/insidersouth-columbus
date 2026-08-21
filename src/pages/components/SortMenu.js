import React from 'react';
import { ReactComponent as ShowAll } from '../../assets/icos/show-all.svg';
import { ReactComponent as NearMe } from '../../assets/icos/near-me.svg';
import { ReactComponent as Alpha } from '../../assets/icos/alphabetic.svg';
import { ReactComponent as Cuisine } from '../../assets/icos/cuisine.svg';
import { ReactComponent as Cross } from '../../assets/icos/cross.svg';
import { ReactComponent as Play } from '../../assets/icos/play.svg';
import { ReactComponent as Stay } from '../../assets/icos/stay.svg';
import { ReactComponent as Shop } from '../../assets/icos/shop.svg';
import '../../sass/componentsass/SortMenu.scss';

function SortMenu({ isOpen, top, menuList = [], orientation, toggleMenu2, selectedDate, setDate }) {
  const menuStyle2 =
    orientation === 'landscape-primary' ||
    orientation === 'landscape-secondary' ||
    orientation === 'desktop'
      ? {
          left: '0px',
          transform: isOpen ? 'translateX(0)' : 'translateX(-110%)',
        }
      : {
          top: `calc(${top}px + 30px)`,
          transform: isOpen ? 'translateY(0)' : 'translateY(-125%)',
        };

  const icons = {
    'Show All': ShowAll,
    'Near Me': NearMe,
    Alphabetical: Alpha,
    'Cuisine Type': Cuisine,
    'Play Type': Play, // Placeholder icon for Play Type
    'Stay Type': Stay, // Placeholder icon for Stay Type
    'Shop Type': Shop, // Placeholder icon for Shop Type
  };

  return (
    <div className="sort-menu" style={menuStyle2}>
      <button onClick={toggleMenu2}>
        <Cross />
      </button>
      {menuList.length > 0 ? (
        menuList.map((item, index) => {
          const IconComponent = icons[item.label];
          return (
            <div key={index} className="s-menu-item">
              {IconComponent && <IconComponent />}
              {item.type === 'dropdown' ? (
                <select onChange={item.onChange} defaultValue="">
                  <option value="" disabled>
                    {item.label}
                  </option>
                  {item.options.map((option, idx) => (
                    <option key={idx} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : item.type === 'date' ? (
                <div>
                  <label htmlFor="event-date">What is happening on?</label>
                  <input
                    id="event-date"
                    type="date"
                    value={
                      selectedDate
                        ? selectedDate.toISOString().substring(0, 10)
                        : ''
                    }
                    onChange={item.onChange}
                  />
                </div>
              ) : (
                <a href={item.link} onClick={item.onClick}>
                  {item.label}
                </a>
              )}
            </div>
          );
        })
      ) : (
        <div>No items to display</div>
      )}
    </div>
  );
}

export default SortMenu;
