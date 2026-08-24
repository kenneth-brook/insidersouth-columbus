import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import eatData from '../data/columbus/eat.json';
import stayData from '../data/columbus/stay.json';
import playData from '../data/columbus/play.json';
import shopData from '../data/columbus/shop.json';
import eventsData from '../data/columbus/events.json';

const DataContext = createContext();
const stage = 'static-columbus';

export const useDataContext = () => useContext(DataContext);

const collectTypes = (items, typeKey) => {
  const counts = {};
  items.forEach((item) => {
    (item[typeKey] || []).forEach((type) => {
      counts[type] = (counts[type] || 0) + 1;
    });
  });
  return counts;
};

const normalizeData = () => {
  const addType = (items, type) =>
    [...items]
      .map((item) => ({ ...item, type }))
      .sort((a, b) => a.name.localeCompare(b.name));

  const eat = addType(eatData, 'eat');
  const stay = addType(stayData, 'stay');
  const play = addType(playData, 'play');
  const shop = addType(shopData, 'shop');
  const events = [...eventsData]
    .map((item) => ({
      ...item,
      type: 'events',
      start_date: item.start_date ? new Date(item.start_date) : null,
    }))
    .filter((item) => !item.start_date || item.start_date >= new Date())
    .sort((a, b) => (a.start_date || 0) - (b.start_date || 0));

  return {
    eat,
    stay,
    play,
    shop,
    events,
    combined: [...eat, ...stay, ...play, ...shop].sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  };
};

const DataProvider = ({ children }) => {
  const initialData = normalizeData();
  const [data] = useState(initialData);
  const [filteredData, setFilteredData] = useState(initialData);
  const [typeCounts] = useState({
    menu_types: collectTypes(initialData.eat, 'menu_types'),
    play_types: collectTypes(initialData.play, 'play_types'),
    stay_types: collectTypes(initialData.stay, 'stay_types'),
    shop_types: collectTypes(initialData.shop, 'shop_types'),
  });
  const [typeNames] = useState({
    menu_types: {},
    play_types: {},
    stay_types: {},
    shop_types: {},
  });
  const [selectedTypes, setSelectedTypes] = useState({
    menu_types: [],
    play_types: [],
    stay_types: [],
    shop_types: [],
  });
  const [loading] = useState(false);
  const [error] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAscending, setIsAscending] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [nearMe, setNearMe] = useState(false);

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

  const fetchUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: parseFloat(position.coords.latitude),
            lon: parseFloat(position.coords.longitude),
          });
        },
        reject
      );
    });
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortByProximity = (items, location) =>
    items
      .filter((item) => isValidCoordinate(item.lat, item.long))
      .map((item) => ({
        ...item,
        distance: calculateDistance(
          location.lat,
          location.lon,
          parseFloat(item.lat),
          parseFloat(item.long)
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

  const handleNearMe = () => {
    if (!userLocation || !isValidCoordinate(userLocation.lat, userLocation.lon)) {
      return;
    }

    setNearMe(true);
    setFilteredData({
      ...data,
      eat: sortByProximity(data.eat, userLocation),
      stay: sortByProximity(data.stay, userLocation),
      play: sortByProximity(data.play, userLocation),
      shop: sortByProximity(data.shop, userLocation),
      combined: sortByProximity(data.combined, userLocation),
    });
  };

  const resetFilteredData = useCallback(() => {
    setFilteredData(data);
  }, [data]);

  const filterDataByTypes = useCallback(() => {
    const filterByTypes = (items, typeKey) => {
      if (!selectedTypes[typeKey]?.length) return items;
      return items.filter((item) =>
        item[typeKey]?.some((type) =>
          selectedTypes[typeKey].includes(parseInt(type, 10))
        )
      );
    };

    const eat = filterByTypes(data.eat, 'menu_types');
    const stay = filterByTypes(data.stay, 'stay_types');
    const play = filterByTypes(data.play, 'play_types');
    const shop = filterByTypes(data.shop, 'shop_types');

    setFilteredData({
      eat,
      stay,
      play,
      shop,
      events: data.events,
      combined: [...eat, ...stay, ...play, ...shop],
    });
  }, [selectedTypes, data]);

  const filterDataByKeyword = useCallback(() => {
    if (!keyword.trim()) {
      setFilteredData(data);
      return;
    }

    const filterByKeyword = (items) =>
      items.filter((item) =>
        Object.values(item).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(keyword.toLowerCase())
        )
      );

    const eat = filterByKeyword(data.eat);
    const stay = filterByKeyword(data.stay);
    const play = filterByKeyword(data.play);
    const shop = filterByKeyword(data.shop);

    setFilteredData({
      eat,
      stay,
      play,
      shop,
      events: filterByKeyword(data.events),
      combined: [...eat, ...stay, ...play, ...shop],
    });
  }, [keyword, data]);

  useEffect(() => {
    fetchUserLocation()
      .then(setUserLocation)
      .catch(() => {});
  }, [fetchUserLocation]);

  useEffect(() => {
    filterDataByTypes();
  }, [selectedTypes, filterDataByTypes]);

  useEffect(() => {
    filterDataByKeyword();
  }, [keyword, filterDataByKeyword]);

  useEffect(() => {
    if (!selectedDate) return;

    const filteredEvents = data.events
      .filter((event) => {
        if (!event.start_date) return false;
        const startDate = new Date(event.start_date);
        const endDate = event.end_date ? new Date(event.end_date) : null;
        return endDate
          ? startDate <= selectedDate && endDate >= selectedDate
          : startDate.toDateString() === selectedDate.toDateString();
      })
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    setFilteredData((current) => ({ ...current, events: filteredEvents }));
  }, [selectedDate, data.events]);

  const resetKeyword = () => setKeyword('');

  const sortData = useCallback(
    (ascending) => {
      const sortOrder = ascending ? 1 : -1;
      setFilteredData({
        eat: [...data.eat].sort((a, b) => a.name.localeCompare(b.name) * sortOrder),
        stay: [...data.stay].sort((a, b) => a.name.localeCompare(b.name) * sortOrder),
        play: [...data.play].sort((a, b) => a.name.localeCompare(b.name) * sortOrder),
        shop: [...data.shop].sort((a, b) => a.name.localeCompare(b.name) * sortOrder),
        events: [...data.events].sort(
          (a, b) =>
            (new Date(a.start_date) - new Date(b.start_date)) * sortOrder
        ),
        combined: [...data.combined].sort(
          (a, b) => a.name.localeCompare(b.name) * sortOrder
        ),
      });
    },
    [data]
  );

  const resetSortOrder = useCallback(() => {
    setIsAscending(true);
    sortData(true);
  }, [sortData]);

  return (
    <DataContext.Provider
      value={{
        data: filteredData,
        loading,
        error,
        setKeyword,
        resetKeyword,
        sortData,
        resetSortOrder,
        isAscending,
        setIsAscending,
        setSelectedDate,
        handleNearMe,
        userLocation,
        nearMe,
        setNearMe,
        resetFilteredData,
        typeCounts,
        typeNames,
        selectedTypes,
        setSelectedTypes,
        stage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
