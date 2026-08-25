import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, Popup } from 'react-map-gl';
import { useItineraryContext } from '../../hooks/ItineraryContext';
import mapboxgl from 'mapbox-gl';
import { useDataContext } from '../../hooks/DataContext';
import { ReactComponent as Phone } from '../../assets/icos/phone2.svg';
import { ReactComponent as Share } from '../../assets/icos/share-icon2.svg';
import { ReactComponent as AddItinerary } from '../../assets/icos/add-itinerary2.svg';
import { useViewMode } from '../../hooks/ViewModeContext';

import eatPin from '../../assets/icos/eatPin.png';
import shopPin from '../../assets/icos/shopPin.png';
import stayPin from '../../assets/icos/stayPin.png';
import playPin from '../../assets/icos/playPin.png';
import eventPin from '../../assets/icos/eventPin.png';

const markerIcons = {
  eat: eatPin,
  shop: shopPin,
  stay: stayPin,
  play: playPin,
  events: eventPin,
};

const resolveImageUrl = (value) => {
  if (!value) return '';

  let rawUrl = String(value)
    .replace(/^\{+|\}+$/g, '')
    .replace(/^"+|"+$/g, '')
    .trim();

  if (rawUrl.startsWith('https://') || rawUrl.startsWith('http://')) {
    return rawUrl;
  }

  const publicUrl = process.env.PUBLIC_URL || '';
  const localPath = rawUrl.startsWith('/')
    ? rawUrl
    : `/images/columbus/${rawUrl}`;

  return `${publicUrl}${localPath}`;
};

const isValidCoordinate = (lat, lon) => {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  const valid =
    !isNaN(latNum) &&
    !isNaN(lonNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lonNum >= -180 &&
    lonNum <= 180;
  if (!valid) {
    console.error(`Invalid coordinates: lat=${lat}, lon=${lon}`);
  }
  return valid;
};

const centerMap = (map, data, userLocation, nearMe) => {
  const padding = window.innerWidth < 768
    ? { top: 50, bottom: 150, left: 50, right: 50 }
    : { top: 50, bottom: 50, left: 50, right: 50 };
  const bounds = new mapboxgl.LngLatBounds();

  if (nearMe && userLocation) {
    const userLat = parseFloat(userLocation.lat);
    const userLon = parseFloat(userLocation.lon);

    if (!isNaN(userLat) && !isNaN(userLon)) {
      bounds.extend([userLon, userLat]);
    }
  }

  data.forEach((item) => {
    if (item.valid) {
      const itemLat = parseFloat(item.lat);
      const itemLon = parseFloat(item.long);
      bounds.extend([itemLon, itemLat]);
    }
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding,
      maxZoom: 14,
      duration: 500,
    });
  } else {
    console.error('Bounds are empty, cannot fit map to bounds.');
  }
};

const addMarkers = (data, handleMarkerClick) => {
  return data.map((item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.long);
    if (!isNaN(lat) && !isNaN(lon)) {
      return (
        <Marker
          key={item.id}
          longitude={lon}
          latitude={lat}
          anchor="bottom"
          onClick={() => handleMarkerClick(item)}
        >
          <img
            src={markerIcons[item.type]}
            alt={`${item.type} marker`}
            className="marker-icon"
          />
        </Marker>
      );
    }

    console.error(
      `Skipping marker for ${item.name} due to invalid coordinates: lat=${lat}, lon=${lon}`
    );
    return null;
  });
};

const renderPopup = (selectedPlace, setSelectedPlace, addToItinerary, navigate, setIsMapView) => {
  const handleAddToItinerary = () => {
    addToItinerary(selectedPlace);
    setIsMapView(false);
    navigate('/itinerary');
  };

  const lat = parseFloat(selectedPlace.lat);
  const lon = parseFloat(selectedPlace.long);
  if (!isNaN(lat) && !isNaN(lon)) {
    return (
      <Popup
        className="popCard"
        longitude={selectedPlace.long}
        latitude={selectedPlace.lat}
        onClose={() => {
          setSelectedPlace(null);
        }}
        closeOnClick={false}
        anchor="top"
      >
        <div className="popWrap">
          <div className="popTop">
            {selectedPlace.images && selectedPlace.images.length > 0 && (
              <img
                src={resolveImageUrl(selectedPlace.images[0])}
                alt={selectedPlace.name}
              />
            )}
            <h2>{selectedPlace.name}</h2>
          </div>
          <div className="addyText">
            <p>{selectedPlace.street_address}</p>
            <p>
              {selectedPlace.city}, {selectedPlace.state} {selectedPlace.zip}
            </p>
          </div>
          <div className="popButtonsWrap">
            <div className="popButtonDevide">
              <a href={`tel:${selectedPlace.phone}`} className="popButtonLink">
                <div className="popButton">
                  <Phone />
                </div>
                <p>CALL</p>
              </a>
            </div>
            <div className="popButtonDevide none">
              <div className="popButton">
                <Share />
              </div>
              <p>SHARE</p>
            </div>
            <div className="popButtonDevide" onClick={handleAddToItinerary}>
              <div className="popButton">
                <AddItinerary />
              </div>
              <p>ITINERARY</p>
            </div>
          </div>
        </div>
      </Popup>
    );
  }

  console.error(`Invalid coordinates for popup: lat=${lat}, lon=${lon}`);
  return null;
};

const MapView = ({ data, type, selectedLocation }) => {
  const { setIsMapView } = useViewMode();
  const [selectedPlace, setSelectedPlace] = useState(selectedLocation || null);
  const mapRef = useRef();
  const { nearMe, userLocation } = useDataContext();
  const [userPin, setUserPin] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { addToItinerary } = useItineraryContext();
  const navigate = useNavigate();
  const [mapHeight, setMapHeight] = useState('70vh');

  const validatedData = data.map((item) => ({
    ...item,
    valid: isValidCoordinate(item.lat, item.long),
  }));

  useEffect(() => {
    const updateMapHeight = () => {
      if (window.innerWidth > window.innerHeight) {
        setMapHeight('85vh');
      } else {
        setMapHeight('70vh');
      }
    };

    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);

    return () => {
      window.removeEventListener('resize', updateMapHeight);
    };
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      const map = mapRef.current.getMap();
      if (selectedLocation && isValidCoordinate(selectedLocation.lat, selectedLocation.long)) {
        const lat = parseFloat(selectedLocation.lat);
        const lon = parseFloat(selectedLocation.long);
        const offsetY = window.innerHeight * 0.25;

        map.flyTo({
          center: [lon, lat],
          zoom: 14,
          speed: 2,
          offset: [0, -offsetY],
        });
        setSelectedPlace(selectedLocation);
      } else {
        centerMap(map, validatedData, userLocation, nearMe);
      }
      console.log('Markers added to map:', validatedData.length);
    }
  }, [validatedData, userLocation, nearMe, mapLoaded, selectedLocation]);

  useEffect(() => {
    if (nearMe && userLocation) {
      const lat = parseFloat(userLocation.lat);
      const lon = parseFloat(userLocation.lon);
      if (!isNaN(lat) && !isNaN(lon)) {
        setUserPin({ lat, lon });
      } else {
        setUserPin(null);
      }
    }
  }, [nearMe, userLocation]);

  const handleMarkerClick = (item) => {
    setSelectedPlace(item);
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      if (item.valid) {
        const offsetY = window.innerHeight * 0.25;

        map.flyTo({
          center: [parseFloat(item.long), parseFloat(item.lat)],
          zoom: 14,
          speed: 2,
          offset: [0, -offsetY],
        });
      } else {
        console.error(
          `Invalid coordinates for marker click: (${item.lat}, ${item.long})`
        );
      }
    }
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: userLocation?.lon || -100,
          latitude: userLocation?.lat || 40,
          zoom: 5,
        }}
        style={{ width: '100%', height: mapHeight }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onLoad={() => setMapLoaded(true)}
      >
        {addMarkers(validatedData, handleMarkerClick)}
        {selectedPlace && renderPopup(
          selectedPlace,
          setSelectedPlace,
          addToItinerary,
          navigate,
          setIsMapView
        )}
        {userPin && (
          <Marker
            longitude={userPin.lon}
            latitude={userPin.lat}
            anchor="bottom"
            color="red"
          />
        )}
      </Map>
    </div>
  );
};

export default MapView;
