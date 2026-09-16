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
  if (!timeString) return '';

  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  const hours12 = date.getHours() % 12 || 12;
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${hours12}:${minutes} ${ampm}`;
};

const resolveImageUrl = (image) => {
  let rawUrl = image || '';
  rawUrl = rawUrl.replace(/^\{+|\}+$/g, '').trim();
  rawUrl = rawUrl.replace(/^"+|"+$/g, '').trim();

  if (rawUrl.startsWith('https://') || rawUrl.startsWith('http://')) {
    return rawUrl;
  }

  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/images/columbus/${rawUrl}`;
  return `${process.env.PUBLIC_URL || ''}${cleanPath}`;
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

  const handleGetDirections = (location) => {
    const destination =
      location.lat && location.long
        ? `${location.lat},${location.long}`
        : [location.street_address, location.city, location.state, location.zip]
            .filter(Boolean)
            .join(', ');

    if (!destination) return;

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
  };

  const renderLocationItem = (location, index, dayCount) => {
    const image = location.images?.[0] || location.image || '';
    const categoryLabel = (location.category || '').toUpperCase();

    return (
      <div key={`${location.id}-${index}`} className="itinerary-card">
        <div className="itinerary-card__top">
          <div className="itinerary-card__image-wrap">
            {image ? (
              <img
                src={resolveImageUrl(image)}
                alt={location.name}
                className="itinerary-card__image"
              />
            ) : (
              <div className="itinerary-card__image itinerary-card__image--placeholder" />
            )}

            <div
              className="itinerary-card__day"
              role="button"
              tabIndex={0}
              aria-label={`Edit date and time for ${location.name}`}
              onClick={() => handleEditLocation(location)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleEditLocation(location);
                }
              }}
            >
              <span className="itinerary-card__day-label">DAY</span>
              <strong>{String(dayCount).padStart(2, '0')}</strong>
              {location.visitDate && (
                <span className="itinerary-card__date">{formatDate(location.visitDate)}</span>
              )}
              {location.visitTime && (
                <span className="itinerary-card__time">{formatTime(location.visitTime)}</span>
              )}
            </div>
          </div>

          <div className="itinerary-card__copy">
            {categoryLabel && <div className="itinerary-card__category">{categoryLabel}</div>}
            <h2>{location.name}</h2>
            {location.description && (
              <p dangerouslySetInnerHTML={{ __html: location.description }} />
            )}
          </div>
        </div>

        <div className="itinerary-card__actions">
          <button
            onClick={() =>
              navigate(`/detail/${location.id}`, {
                state: { location, category: location.category },
              })
            }
          >
            <EyeIcon />
            <span>Details</span>
          </button>

          {location.web && (
            <button onClick={() => window.open(location.web, '_blank', 'noopener,noreferrer')}>
              <WebIcon />
              <span>Website</span>
            </button>
          )}

          {location.phone && (
            <button onClick={() => window.open(`tel:${location.phone}`, '_self')}>
              <PhoneIcon />
              <span>Call</span>
            </button>
          )}

          <button onClick={() => handleGetDirections(location)}>
            <MapIcon />
            <span>Directions</span>
          </button>
        </div>

        {editLocationId === location.id && (
          <div className="edit-box itinerary-card__edit">
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
    );
  };

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
