import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { useHeightContext } from '../hooks/HeightContext';
import { useOrientation } from '../hooks/OrientationContext';
import { useAuth } from '../hooks/AuthContext';
import { useItineraryContext } from '../hooks/ItineraryContext';
import { useViewMode } from '../hooks/ViewModeContext';
import { ReactComponent as Intinerery } from '../assets/icos/intinerery.svg';
import { ReactComponent as EyeIcon } from '../assets/icos/eye.svg';
import { ReactComponent as PhoneIcon } from '../assets/icos/phone2.svg';
import { ReactComponent as WebIcon } from '../assets/icos/web.svg';
import { ReactComponent as MapIcon } from '../assets/icos/maps.svg';
import { ReactComponent as EditIcon } from '../assets/icos/edit.svg';
import '../sass/componentsass/Itinerary.scss';
import MapView from './components/MapView';

const formatDate = (dateString) => {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
  const formattedDay = String(date.getDate()).padStart(2, '0');
  const yearShort = date.getFullYear().toString().slice(-2);
  return `${formattedMonth}/${formattedDay}/${yearShort}`;
};

const formatTime = (timeString) => {
  if (!timeString) return '--:--';

  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  const hours12 = date.getHours() % 12 || 12;
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${hours12}:${minutes} ${ampm}`;
};

const sortItineraryData = (data) => {
  return [...data].sort((a, b) => {
    const dateA = a.visitDate ? new Date(a.visitDate) : null;
    const dateB = b.visitDate ? new Date(b.visitDate) : null;

    if (dateA && dateB) {
      const dateComparison = dateA - dateB;
      if (dateComparison !== 0) return dateComparison;

      const timeA = a.visitTime || '';
      const timeB = b.visitTime || '';
      return timeA.localeCompare(timeB);
    }

    if (dateA) return -1;
    if (dateB) return 1;
    return 0;
  });
};

const calculateDayNumbers = (data) => {
  if (data.length === 0) return [];

  const datedItems = data.filter((item) => item.visitDate);

  // Until the user starts assigning dates, every stop is Day 1.
  if (datedItems.length === 0) {
    return data.map(() => 1);
  }

  const firstDate = new Date(`${datedItems[0].visitDate}T00:00:00`);

  return data.map((item) => {
    if (!item.visitDate) return 1;

    const currentDate = new Date(`${item.visitDate}T00:00:00`);
    const differenceInDays = Math.floor(
      (currentDate - firstDate) / (1000 * 60 * 60 * 24)
    );

    return Math.max(1, differenceInDays + 1);
  });
};

const Itinerary = ({ pageTitle }) => {
  const navigate = useNavigate();
  const { headerRef, footerRef, headerHeight, footerHeight, updateHeights } = useHeightContext();
  const orientation = useOrientation();
  const { userId, isAuthenticated } = useAuth();
  const { selectedItinerary, setSelectedItinerary, fetchItineraries, updateItinerary } = useItineraryContext();
  const [editLocationId, setEditLocationId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const { isMapView, setIsMapView } = useViewMode();

  const updateComponentHeights = useCallback(() => {
    updateHeights();
  }, [updateHeights]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate('/login');
    } else {
      fetchItineraries(userId);
    }
  }, [isAuthenticated, userId, fetchItineraries, navigate]);

  useEffect(() => {
    updateComponentHeights();
  }, [updateComponentHeights]);

  const handleEditLocation = (location) => {
    setEditLocationId(location.id);
    setEditDate(location.visitDate || '');
    setEditTime(location.visitTime || '');
  };

  const handleCancelEdit = () => {
    setEditLocationId(null);
    setEditDate('');
    setEditTime('');
  };

  const handleUpdateLocation = async (location) => {
    const updatedLocation = {
      ...location,
      visitDate: editDate,
      visitTime: editTime,
    };

    const updatedData = selectedItinerary.itinerary_data.map((loc) =>
      loc.id === location.id ? updatedLocation : loc
    );

    const updatedItinerary = {
      ...selectedItinerary,
      itinerary_data: updatedData,
    };

    setSelectedItinerary(updatedItinerary);
    await updateItinerary(
      updatedItinerary.id,
      updatedItinerary.itinerary_data,
      updatedItinerary.itinerary_name
    );
    handleCancelEdit();
  };

  const handleRemoveLocation = async (locationId) => {
    const updatedData = selectedItinerary.itinerary_data.filter(
      (loc) => loc.id !== locationId
    );

    const updatedItinerary = {
      ...selectedItinerary,
      itinerary_data: updatedData,
    };

    setSelectedItinerary(updatedItinerary);
    await updateItinerary(
      updatedItinerary.id,
      updatedItinerary.itinerary_data,
      updatedItinerary.itinerary_name
    );
  };

  const handleMapView = (location) => {
    setIsMapView(true);
    navigate(`/${location.category}/${location.id}`, { state: { location } });
  };

  const renderLocationItem = (location, index, dayCount) => (
    <div key={`${location.id}-${index}`} className="location-item">
      <div className="left-side">
        <div className="day-box">
          <div className="day-label">DAY</div>
          <div className="day-number">{String(dayCount).padStart(2, '0')}</div>
        </div>
        <div className="date-box">
          <div className="date-value">
            {location.visitDate ? formatDate(location.visitDate) : ''}
          </div>
        </div>
        <div className="time-box">
          <div className="time-value">
            {location.visitTime ? formatTime(location.visitTime) : '--:--'}
          </div>
        </div>
        <button
          className="details-button"
          onClick={() =>
            navigate(`/detail/${location.id}`, {
              state: { location, category: location.category },
            })
          }
        >
          <EyeIcon />
          Details
        </button>
      </div>

      <div className="right-side">
        <div className="right-side-header">
          <div className="textBlock">
            <h3>{location.name}</h3>
            <p>{location.street_address},</p>
            <p>{location.city}, {location.state} {location.zip}</p>
          </div>
          <button className="edit-button" onClick={() => handleEditLocation(location)}>
            <EditIcon />Edit
          </button>
        </div>

        <div className="button-group">
          {location.web && (
            <button onClick={() => window.open(location.web, '_blank')}>
              <WebIcon />
              Web
            </button>
          )}
          {location.phone && (
            <button onClick={() => window.open(`tel:${location.phone}`, '_blank')}>
              <PhoneIcon />
              Call
            </button>
          )}
          <button onClick={() => handleMapView(location)}>
            <MapIcon />
            Map
          </button>
        </div>

        {editLocationId === location.id && (
          <div className="edit-box">
            <label>Date:</label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <label>Time:</label>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
            />
            <button className="uBut" onClick={() => handleUpdateLocation(location)}>Update</button>
            <button className="rBut" onClick={() => handleRemoveLocation(location.id)}>Remove</button>
            <button className="cBut" onClick={handleCancelEdit}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );

  const sortedData = sortItineraryData(selectedItinerary?.itinerary_data || []);
  const dayNumbers = calculateDayNumbers(sortedData);

  return (
    <div
      className={`app-container ${
        orientation === 'landscape-primary' || orientation === 'landscape-secondary'
          ? 'landscape'
          : orientation === 'desktop'
          ? 'desktop internal-desktop'
          : 'portrait'
      }`}
    >
      <Header ref={headerRef} />
      <main
        className="internal-content itin"
        style={{
          paddingTop: `calc(${headerHeight}px + 30px)`,
          paddingBottom: `calc(${footerHeight}px + 50px)`,
        }}
      >
        <div className="page-title">
          <div className="itinerery-title">
            <Intinerery />
            <h1>{pageTitle}</h1>
          </div>
        </div>

        <div className="itinerary-content">
          {isMapView ? (
            <MapView data={selectedItinerary?.itinerary_data || []} />
          ) : sortedData.length > 0 ? (
            sortedData.map((location, index) =>
              renderLocationItem(location, index, dayNumbers[index])
            )
          ) : (
            <p>Your itinerary is empty. Add places from Stay, Play, Dine, Shop, or Events.</p>
          )}
        </div>
      </main>
      <Footer ref={footerRef} showCircles={true} handleMapView={() => setIsMapView(true)} />
    </div>
  );
};

export default Itinerary;
