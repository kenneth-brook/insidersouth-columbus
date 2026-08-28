import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SlidingMenu from './SlidingMenu';
import SortMenu from './SortMenu.js';
import '../../sass/componentsass/Header.scss';
import { ReactComponent as EyeIcon } from '../../assets/icos/eye.svg';
import { ReactComponent as Search } from '../../assets/icos/search.svg';
import { useHeightContext } from '../../hooks/HeightContext.js';
import { useOrientation } from '../../hooks/OrientationContext';
import { useDataContext } from '../../hooks/DataContext';
import { useResettingNavigate } from '../../hooks/useResettingNavigate';
import { useAuth } from '../../hooks/AuthContext';

const Header = forwardRef((props, ref) => {
  const { headerHeight, updateHeights } = useHeightContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const { setKeyword, resetKeyword, sortData, isAscending, setIsAscending, setSelectedDate, handleNearMe, setNearMe, resetFilteredData, typeNames, setSelectedTypes } = useDataContext();
  const orientation = useOrientation();
  const location = useLocation();
  const isHomePage = location.pathname === '/home';
  const isNotHomePage = !isHomePage && location.pathname !== '/itinerary';
  const keywordInputRef = useRef(null);
  const navigate = useResettingNavigate();
  const [selectedDate, setDate] = useState(null);
  const [dropdownItem, setDropdownItem] = useState(null);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    updateHeights();
  }, [updateHeights]);

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  const handleShowAllClick = () => {
    resetKeyword();
    resetFilteredData();
    if (keywordInputRef.current) {
      keywordInputRef.current.value = '';
    }
    setSortMenuOpen(false);
    setNearMe(false);
  };

  const handleAlphabeticalSort = () => {
    setIsAscending(!isAscending);
    sortData(!isAscending);
    setSortMenuOpen(false);
  };

  const handleDateChange = (event) => {
    const date = new Date(event.target.value);
    setDate(date);
    setSelectedDate(date);
    setSortMenuOpen(false);
  };

  const handleNearMeWithClose = () => {
    handleNearMe();
    setSortMenuOpen(false);
  };

  const handleDropdownChange = (e) => {
    const { options } = e.target;
    const selectedValues = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        selectedValues.push(parseInt(options[i].value, 10));
      }
    }

    switch (location.pathname) {
      case '/dine':
        setSelectedTypes(prev => ({ ...prev, menu_types: selectedValues }));
        break;
      case '/play':
        setSelectedTypes(prev => ({ ...prev, play_types: selectedValues }));
        break;
      case '/stay':
        setSelectedTypes(prev => ({ ...prev, stay_types: selectedValues }));
        break;
      case '/shop':
        setSelectedTypes(prev => ({ ...prev, shop_types: selectedValues }));
        break;
      default:
        break;
    }
    setSortMenuOpen(false);
  };

  const getDropdownLabel = () => {
    switch (location.pathname) {
      case '/dine': return 'Cuisine Type';
      case '/play': return 'Play Type';
      case '/stay': return 'Stay Type';
      case '/shop': return 'Shop Type';
      default: return '';
    }
  };

  const getDropdownOptions = (typeNames) => {
    return Object.entries(typeNames).map(([key, { name, count }]) => ({
      value: key,
      label: `${name} (${count})`,
    }));
  };

  useEffect(() => {
    const label = getDropdownLabel();
    if (label && typeNames) {
      let typeNamesData;
      switch (location.pathname) {
        case '/dine': typeNamesData = typeNames.menu_types; break;
        case '/play': typeNamesData = typeNames.play_types; break;
        case '/stay': typeNamesData = typeNames.stay_types; break;
        case '/shop': typeNamesData = typeNames.shop_types; break;
        default: typeNamesData = {};
      }

      if (typeNamesData && Object.keys(typeNamesData).length > 0) {
        setDropdownItem({
          label,
          type: 'dropdown',
          options: getDropdownOptions(typeNamesData),
          onChange: handleDropdownChange,
        });
      } else {
        setDropdownItem(null);
      }
    } else {
      setDropdownItem(null);
    }
  }, [location.pathname, typeNames]);

  const sortMenuContent = [
    { label: 'Show All', onClick: handleShowAllClick },
    { label: 'Near Me', onClick: handleNearMeWithClose },
    { label: 'Alphabetical', onClick: handleAlphabeticalSort },
    location.pathname === '/events' && {
      label: 'What is happening on?',
      type: 'date',
      onChange: handleDateChange,
    },
    dropdownItem,
  ].filter(Boolean);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate('/');
    } else {
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  const menuContent = [
    { label: isAuthenticated ? 'Logout' : 'Login', link: '#', onClick: handleAuthClick },
    { label: 'Stay', link: '/stay' },
    { label: 'Play', link: '/play' },
    { label: 'Dine', link: '/dine' },
    { label: 'Shop', link: '/shop' },
    { label: 'Events', link: '/events' },
    { label: 'View All Map', link: '/all' },
    { label: 'Follow Us', link: '#' },
    { label: 'Visitors Guide', link: 'https://365publicationsonline.com/ColumbusVG2026' },
    { label: 'Website', link: 'https://visitcolumbusga.com/' },
  ];

  return (
    <header ref={ref} className={isHomePage ? 'home-header' : undefined}>
      <div className="header-container">
        <Link to="/itinerary" className="square-button-link">
          <button className="square-button" to="/itinerary">
            <EyeIcon />
            <span>View</span>
            <span>Itinerary</span>
          </button>
        </Link>
        <div
          className={`centerWrap ${
            orientation === 'landscape-primary' ||
            orientation === 'landscape-secondary'
              ? 'landscape'
              : 'portrait'
          }`}
        >
          <Link to="/home" className="columbus-brand-link" aria-label="Visit Georgia Columbus home">
            <div className={`visit-georgia-lockup ${isHomePage ? 'visit-georgia-lockup--home' : 'visit-georgia-lockup--header'}`}>
              <span className="visit-georgia-lockup__visit">VISIT</span>
              <span className="visit-georgia-lockup__georgia">GEORGIA</span>
              <span className="visit-georgia-lockup__city">COLUMBUS</span>
              <span className="visit-georgia-lockup__tagline">GEORGIA'S RIVER CITY</span>
            </div>
          </Link>
        </div>
        <button
          className="circle-button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? 'X' : '☰'}
        </button>
      </div>
      {isNotHomePage && (
        <div className="search-container">
          <div className="inputBox">
            <input
              ref={keywordInputRef}
              type="text"
              placeholder="Keyword Search"
              className="search-box"
              onChange={handleKeywordChange}
            />
            <Search />
          </div>
          <div className="sort-box">
            <button
              className="sort-button"
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
            >
              Sort Options
            </button>
          </div>
        </div>
      )}
      <SlidingMenu
        isOpen={menuOpen}
        top={headerHeight}
        menuContent={menuContent}
        orientation={orientation}
        toggleMenu={() => setMenuOpen(!menuOpen)}
      />
      <SortMenu
        isOpen={sortMenuOpen}
        top={headerHeight}
        menuList={sortMenuContent}
        orientation={orientation}
        toggleMenu2={() => setSortMenuOpen(!sortMenuOpen)}
        selectedDate={selectedDate}
        setDate={setDate}
      />
    </header>
  );
});

export default Header;
