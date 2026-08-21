import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { ReactComponent as PlayIcon } from '../assets/icos/play.svg';
import { ReactComponent as MapsIcon } from '../assets/icos/maps.svg';
import { useHeightContext } from '../hooks/HeightContext';
import { useOrientation } from '../hooks/OrientationContext';
import { useDataContext } from '../hooks/DataContext';
import { useViewMode } from '../hooks/ViewModeContext';
import MapView from './components/MapView';
import DetailViewCard from './components/DetailViewCard';
import ShareModal from './components/ShareModal'; // Import ShareModal

const Play = ({ pageTitle }) => {
  const { headerRef, footerRef, headerHeight, footerHeight, updateHeights } = useHeightContext();
  const { data, loading, error } = useDataContext();
  const { isMapView, setIsMapView } = useViewMode();
  const navigate = useNavigate();
  const orientation = useOrientation();
  const playData = data.play;
  const filteredPlayData = playData.filter((item) => {
    const { play_types } = item;
    
    // When play_types is an array, check if it includes 86
    if (Array.isArray(play_types)) {
      return !play_types.includes(86) && !play_types.includes("86");
    }
    
    // When play_types is an object, check if it has a key "86"
    if (play_types && typeof play_types === 'object') {
      return !Object.keys(play_types).includes("86");
    }
    
    // If play_types is missing or not one of the expected types, keep the item
    return true;
  });
  console.log(filteredPlayData)

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareTitle, setShareTitle] = useState('');

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
      <PlayIcon className="play-icon" />
      <h1>
        {pageTitle} {isMapView && 'Map'}
      </h1>
      {isMapView && <MapsIcon className="icon-svg" />}
    </div>
  );

  const renderPlayContent = () => (
    <div className="two-column-layout">
      {playData.map((item) => (
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
                onClick={() => navigate(`/play/${item.id}`)}
              >
                more
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPlayDesktopContent = () => (
    <div className="two-column-layout-desk">
      {filteredPlayData.map((item) => (
        <DetailViewCard
          key={item.id}
          item={item}
          category="play"
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
              <MapView data={filteredPlayData} type="play" />
            ) : orientation === 'desktop' ? (
              renderPlayDesktopContent()
            ) : (
              renderPlayContent()
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

export default Play;
