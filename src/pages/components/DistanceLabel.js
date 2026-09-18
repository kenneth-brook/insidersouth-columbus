import React from 'react';
import { useDataContext } from '../../hooks/DataContext';
import '../../sass/componentsass/DistanceLabel.scss';

const isValidCoordinate = (lat, lon) => {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  return (
    !Number.isNaN(latNum) &&
    !Number.isNaN(lonNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lonNum >= -180 &&
    lonNum <= 180
  );
};

const calculateMiles = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
};

const DistanceLabel = ({ item }) => {
  const { userLocation } = useDataContext();

  if (
    !userLocation ||
    !isValidCoordinate(userLocation.lat, userLocation.lon) ||
    !isValidCoordinate(item?.lat, item?.long)
  ) {
    return null;
  }

  const miles = calculateMiles(
    parseFloat(userLocation.lat),
    parseFloat(userLocation.lon),
    parseFloat(item.lat),
    parseFloat(item.long)
  );

  const distanceText = miles < 10 ? miles.toFixed(1) : Math.round(miles).toString();

  return <div className="location-distance">{distanceText} mi</div>;
};

export default DistanceLabel;
