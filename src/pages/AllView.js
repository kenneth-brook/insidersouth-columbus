import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { useHeightContext } from '../hooks/HeightContext'
import { useOrientation } from '../hooks/OrientationContext'
import { useDataContext } from '../hooks/DataContext'
import { useViewMode } from '../hooks/ViewModeContext'
import MapView from './components/MapView'
import { ReactComponent as DineIcon } from '../assets/icos/dine.svg'
import { ReactComponent as PlayIcon } from '../assets/icos/play.svg'
import { ReactComponent as StayIcon } from '../assets/icos/stay.svg'
import { ReactComponent as ShopIcon } from '../assets/icos/shop.svg'
import { useNavigate } from 'react-router-dom'
import DetailViewCard from './components/DetailViewCard'

const AllView = ({ pageTitle }) => {
  const { headerHeight, footerHeight, footerRef } = useHeightContext()
  const orientation = useOrientation()
  const { data, loading, error } = useDataContext()
  const { isMapView, setIsMapView } = useViewMode()
  const combinedData = data.combined // Assuming combined data structure similar to stayData
  const navigate = useNavigate()

  const currentTitle = isMapView ? 'View All Map' : 'View All'

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 !== 0 ? 1 : 0
    const emptyStars = 5 - fullStars - halfStar

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
    )
  }

  const pageTitleContent = (
    <div className="page-title">
      <div className="icon-group">
        <DineIcon className="icon-svg" />
        <PlayIcon className="icon-svg" />
      </div>
      <h1>{currentTitle}</h1>
      <div className="icon-group">
        <StayIcon className="icon-svg" />
        <ShopIcon className="icon-svg" />
      </div>
    </div>
  )

  const renderContent = () => {
    if (isMapView) {
      return <MapView data={combinedData} type="combined" />
    } else if (orientation === 'desktop') {
      return (
        <div className="two-column-layout-desk">
          {combinedData.map((item) => (
            <DetailViewCard
              key={item.id}
              item={item}
              category={item.type}
              navigate={navigate}
            />
          ))}
        </div>
      )
    } else {
      return (
        <div className="content">
          {combinedData.map((item) => (
            <div key={item.id} className="content-item">
              <h2>{item.name}</h2>
              <div className="content-box">
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
                <div className="text-box">
                  <p dangerouslySetInnerHTML={{ __html: item.description }}></p>
                  <div className="reviews-container">
                    {item.rating && (
                      <div className="reviews-block">
                        <div className="stars">{renderStars(item.rating)}</div>
                        <p className="reviews-text">
                          {item.rating.toFixed(1)} Google reviews
                        </p>
                      </div>
                    )}
                    <button
                      className="more-button"
                      onClick={() => navigate(`/${item.type}/${item.id}`)}
                    >
                      more
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }
  }

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
      <Header />
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
        {!loading && !error && renderContent()}
      </main>
      <Footer ref={footerRef} showCircles={true} />
    </div>
  )
}

export default AllView
