import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Phone } from '../../assets/icos/phone.svg';
import { ReactComponent as MapIcon } from '../../assets/icos/map-icon.svg';
import { ReactComponent as Share } from '../../assets/icos/share-icon.svg';
import { ReactComponent as AddItinerary } from '../../assets/icos/add-itinerary.svg';
import '../../sass/componentsass/DetailViewCard.scss';
import { useViewMode } from '../../hooks/ViewModeContext';
import { useItineraryContext } from '../../hooks/ItineraryContext';

const DetailViewCard = ({ item, category, handleShare }) => {
  const { isMapView, setIsMapView } = useViewMode();
  const { addToItinerary } = useItineraryContext();
  const navigate = useNavigate();

  if (!item) {
    return <div>Loading...</div>;
  }

  const handleAddToItinerary = () => {
    addToItinerary(item);
    navigate('/itinerary');
  };

  const handleMapView = () => {
    setIsMapView(true);
    navigate(`/${category}/${item.id}`, { state: { location: item } });
  };

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

  const googleMapsLink =
    item.lat && item.long
      ? `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.long}`
      : '#';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const [year, month, day] = [
      date.getUTCFullYear(),
      date.getUTCMonth() + 1, // Months are zero-indexed
      date.getUTCDate(),
    ];
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="content-item">
      <div className="top-container">
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
        <div className="text-container">
          <h2>{item.name}</h2>
          {item.start_date && <h3>{formatDate(item.start_date)}</h3>}
          <div className="content-box">
            <div className="text-box">
              <p dangerouslySetInnerHTML={{ __html: item.description }}></p>
              <div className="reviews-container">
                {item.rating && (
                  <div className="reviews-block">
                    <div className="stars">{renderStars(item.rating)}</div>
                    <p className="reviews-text">
                      {item.rating.toFixed(1)} Google review
                    </p>
                  </div>
                )}
                <button
                  className="more-button"
                  onClick={() => navigate(`/${category}/${item.id}`)}
                >
                  more
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="view-card">
        <div className="top-image">
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

            {item.phone && item.phone.length > 0 && (
              <a href={`tel:${item.phone}`} className="phone-button">
                <Phone /> {item.phone}
              </a>
            )}
            {item.lat && item.long && (
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="map-button"
              >
                <MapIcon /> Get Directions
              </a>
            )}
          </div>
        </div>
        <div className="bottom-button">
          {handleShare && (
            <button onClick={() => {
              const baseUrl = window.location.origin;
              const shareUrl = `${baseUrl}/${category}/${item.id}`;
              handleShare(shareUrl, item.name);
            }}>
              <Share />
              Share
            </button>
          )}
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
    </div>
  );
};

export default DetailViewCard;
