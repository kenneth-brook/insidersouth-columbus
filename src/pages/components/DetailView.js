import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useOrientation } from '../../hooks/OrientationContext';
import { useHeightContext } from '../../hooks/HeightContext';
import { useDataContext } from '../../hooks/DataContext';
import { useItineraryContext } from '../../hooks/ItineraryContext';
import { ReactComponent as Location } from '../../assets/icos/location.svg';
import { ReactComponent as DateIcon } from '../../assets/icos/date.svg';
import { ReactComponent as TimeIcon } from '../../assets/icos/time.svg';
import { ReactComponent as Phone } from '../../assets/icos/phone.svg';
import { ReactComponent as MapIcon } from '../../assets/icos/map-icon.svg';
import { ReactComponent as Share } from '../../assets/icos/share-icon.svg';
import { ReactComponent as AddItinerary } from '../../assets/icos/add-itinerary.svg';
import { ReactComponent as BackArrow } from '../../assets/icos/back-arrow.svg';
import Header from './Header';
import Footer from './Footer';
import MapView from './MapView';
import '../../sass/componentsass/DetailView.scss';
import { useViewMode } from '../../hooks/ViewModeContext';
import ShareModal from './ShareModal';

const formatDate = (dateTime) => {
  if (!dateTime) return 'N/A';

  const date = new Date(dateTime);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${month}/${day}/${year}`;
};

const formatTime = (dateTime) => {
  if (!dateTime) return 'N/A';

  const date = new Date(dateTime);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

const DetailView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, loading, error } = useDataContext();
  const { headerRef, footerRef, headerHeight, footerHeight, updateHeights } = useHeightContext();
  const orientation = useOrientation();
  const [item, setItem] = useState(null);
  const { isMapView, setIsMapView } = useViewMode();
  const category = location.pathname.split('/')[1];
  const { addToItinerary } = useItineraryContext();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const updateComponentHeights = useCallback(() => {
    updateHeights();
  }, [updateHeights]);

  useEffect(() => {
    updateComponentHeights();
  }, [updateComponentHeights]);

  useEffect(() => {
    if (location.state?.location) {
      setItem(location.state.location);
    } else if (data) {
      const actualCategory = category === 'dine' ? 'eat' : category;
      if (data[actualCategory]) {
        const selectedItem = data[actualCategory].find(
          (item) => item.id.toString() === id
        );
        setItem(selectedItem);
      }
    }
  }, [location.state, data, category, id]);

  useEffect(() => {
    console.log('Item:', item);
    if (item && item.start_date) {
      console.log('Formatted Date:', formatDate(item.start_date));
      console.log('Formatted Time:', formatTime(item.start_date));
    }
  }, [item]);

  if (loading) return <div className="loader"></div>;
  if (error) return <p>{error}</p>;
  if (!item) return <p>Not found</p>;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
      <>
        {Array.from({ length: fullStars }, (_, i) => (
          <span key={i} className="star full">
            ★
          </span>
        ))}
        {halfStar === 1 && <span className="star half">☆</span>}
        {Array.from({ length: emptyStars }, (_, i) => (
          <span key={i} className="star empty">
            ☆
          </span>
        ))}
      </>
    );
  };

  const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.long}`;

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddToItinerary = () => {
    addToItinerary(item);
    navigate('/itinerary');
  };

  const handleMapView = () => {
    setIsMapView(true);
    navigate(`/${category}/${item.id}`, { state: { location: item } });
  };

  const handleListView = () => {
    setIsMapView(false);
    navigate(`/${category}/${item.id}`, { state: { location: item } });
  };

  const handleShare = () => {
    setModalIsOpen(true);
  };

  const date = formatDate(item.start_date) || 'Date not available';
  const time = formatTime(item.start_date) || 'Time not available';

  return (
    <div
      className={`app-container ${
        orientation === 'landscape-primary' ||
        orientation === 'landscape-secondary'
          ? 'landscape'
          : orientation === 'desktop'
          ? 'desktop internal-desktop'
          : 'portrait'
      }`}
    >
      <Header ref={headerRef} />
      <main
        className="internal-content"
        style={{
          paddingTop: `calc(${headerHeight}px)`,
          paddingBottom: `calc(${footerHeight}px + 90px)`,
        }}
      >
        {isMapView ? (
          <MapView data={[item]} type={category} selectedLocation={item} />
        ) : (
          <div className="view-card content-item">
            <div className="top-image">
              <div className="img-back">
              {item.images && item.images.length > 0 && (() => {
                let rawUrl = item.images[0] || "";

                // Remove leading/trailing braces:
                rawUrl = rawUrl.replace(/^\{+|\}+$/g, "").trim();

                // Remove leading/trailing quotes:
                rawUrl = rawUrl.replace(/^"+|"+$/g, "").trim();

                // Now check if it's already a full URL:
                const isAbsolute =
                  rawUrl.startsWith("https://") || rawUrl.startsWith("http://");

                const finalUrl = isAbsolute
                  ? rawUrl
                  : `https://douglas.365easyflow.com/easyflow-images/${rawUrl}`;

                return (
                  <img
                    src={finalUrl}
                    alt={item.name}
                    className="content-image"
                  />
                );
              })()}
                {orientation === 'landscape-primary' ? (
                  <a onClick={handleBack} className="web-button-landscape">
                    <BackArrow />
                    back
                  </a>
                ) : (
                  ''
                )}
              </div>

              {orientation === 'landscape-primary' ? (
                <div className="contact-container">
                  {item.web && item.web.length > 0 && (
                    <a
                      href={item.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="web-button"
                    >
                      Website
                    </a>
                  )}

                  <div className="contact-btn">
                    {item.phone && item.phone.length > 0 && (
                      <a href={`tel:${item.phone}`} className="phone-button">
                        <Phone /> {item.phone}
                      </a>
                    )}
                    <a
                      href={googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-button"
                    >
                      <MapIcon /> Get Directions
                    </a>
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>

            <div className="text-container">
              <h2>{item.name}</h2>
              <p className={category === 'events' ? 'events-text' : ''}>
                {category === 'events' && <Location />}
                {`${item.street_address}, ${item.city}, ${item.state} ${item.zip}`}
              </p>
              {item.start_date && (
                <div className="date-container">
                  <p>
                    <DateIcon />
                    {date}
                  </p>
                  {time !== '00:00' && (
                    <p>
                      <TimeIcon />
                      {time}
                    </p>
                  )}
                </div>
              )}
              <p dangerouslySetInnerHTML={{ __html: item.description }}></p>
            </div>

            {orientation === 'landscape-primary' ? (
              ''
            ) : (
              <div className="contact-container">
                <div className="web-back">
                  {item.web && item.web.length > 0 && (
                    <a
                      href={item.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="web-button"
                    >
                      Website
                    </a>
                  )}
                  <a onClick={handleBack} className="web-button">
                    <BackArrow />
                    Back
                  </a>
                </div>

                <div className="contact-btn">
                  {item.phone && item.phone.length > 0 && (
                    <a href={`tel:${item.phone}`} className="phone-button">
                      <Phone /> {item.phone}
                    </a>
                  )}
                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-button"
                  >
                    <MapIcon /> Get Directions
                  </a>
                </div>
              </div>
            )}

            {item.rating && (
              <div className="reviews-container">
                <div className="reviews-block">
                  <div className="stars">{renderStars(item.rating)}</div>
                  <p className="reviews-text">
                    {item.rating.toFixed(1)} - Google review
                  </p>
                </div>
              </div>
            )}
            <div className="bottom-button">
              <button onClick={handleShare}>
                <Share />
                Share
              </button>
              <button onClick={handleMapView}>
                <MapIcon />
                Map
              </button>
              <button onClick={handleAddToItinerary}>
                <AddItinerary />
                Add to Itinerary
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer ref={footerRef} showCircles={true} />
      <ShareModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        url={window.location.href}
        title={item.name}
      />
    </div>
  );
};

export default DetailView;
