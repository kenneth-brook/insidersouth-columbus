import React, { useEffect, useState, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { ReactComponent as StayIcon } from '../assets/icos/stay.svg';
import { ReactComponent as MapsIcon } from '../assets/icos/maps.svg';
import { useHeightContext } from '../hooks/HeightContext';
import { useOrientation } from '../hooks/OrientationContext';
import { useDataContext } from '../hooks/DataContext';
import { useViewMode } from '../hooks/ViewModeContext';
import MapView from './components/MapView';
import { useNavigate } from 'react-router-dom';
import DetailViewCard from './components/DetailViewCard';
import ShareModal from './components/ShareModal'; // Import ShareModal

const Stay = ({ pageTitle }) => {
  const { headerRef, footerRef, headerHeight, footerHeight, updateHeights } = useHeightContext();
  const { data, loading, error } = useDataContext();
  const { isMapView, setIsMapView } = useViewMode();
  const stayData = data.stay;
  const navigate = useNavigate();
  const orientation = useOrientation();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareTitle, setShareTitle] = useState('');

  const displayOrder = [
    "Fairfield Inn & Suites", "Hampton Inn",
    "Holiday Inn Express", "Jameson Inn",
    "Super 8 By Wyndham", "Western Inn and Suites",
    "General Coffee State Park Cabin Rentals", "Blueberry Pointe",
    "Econo Lodge", "Comfortel Suites",
    "Benton’s Motel", "OYO Hotel"
];

const sortedStayData = useMemo(() => {
  if (!Array.isArray(stayData)) return [];

  const mapped = displayOrder
    .map(name => stayData.find(item => item.name === name))
    .filter(Boolean);

  const remaining = stayData.filter(item => !displayOrder.includes(item.name));
  
  return [...mapped, ...remaining];
}, [stayData]);

  useEffect(() => {
    updateHeights();
  }, [headerRef, footerRef, updateHeights]);

  const handleShare = (url, title) => {
    console.log('handleShare called with:', { url, title }); // Log the URL and title
    setShareUrl(url);
    setShareTitle(title);
    setModalIsOpen(true);
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

  const pageTitleContent = (
    <div className="page-title">
      <StayIcon className="stay-icon" />
      <h1>
        {pageTitle} {isMapView && 'Map'}
      </h1>
      {isMapView && <MapsIcon className="icon-svg" />}
    </div>
  );

  const renderStayContent = () => (
    <div className="two-column-layout">
      {sortedStayData.map((item) => (
        <div key={item.id} className="content-item">
          <h2>{item.name}</h2>
          <div className="content-box">
            <div className='box-top'>
              {item.images && item.images.length > 0 && (
                <img
                  src={`https://douglas.365easyflow.com/easyflow-images/${item.images[0]}`}
                  alt={item.name}
                  className="content-image"
                />
              )}
              <div className="text-box">
                <p dangerouslySetInnerHTML={{ __html: item.description }}></p>
              </div>
            </div>
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
                onClick={() => navigate(`/stay/${item.id}`)}
              >
                more
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStayDesktopContent = () => (
    <div className="two-column-layout-desk">
      {sortedStayData.map((item) => (
        <DetailViewCard
          key={item.id}
          item={item}
          category="stay"
          navigate={navigate}
          handleShare={orientation === 'desktop' ? handleShare : null} // Pass handleShare function conditionally
        />
      ))}
    </div>
  );

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
          paddingTop: `calc(${headerHeight}px + 30px)`,
          paddingBottom: `calc(${footerHeight}px + 50px)`,
        }}
      >
        {pageTitleContent}
        {loading && <div className="loader"></div>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <div className="content">
            {isMapView ? (
              <MapView data={stayData} type="stay" />
            ) : orientation === 'desktop' ? (
              renderStayDesktopContent()
            ) : (
              renderStayContent()
            )}
          </div>
        )}
      </main>
      <Footer ref={footerRef} showCircles={true} />
      <ShareModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        url={shareUrl}
        title={shareTitle}
      />
    </div>
  );
};

export default Stay;
