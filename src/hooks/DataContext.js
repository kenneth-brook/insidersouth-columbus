import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getGoogleReviews } from '../pages/components/googleReviews'; // Adjust the path as necessary

const DataContext = createContext();

const stage = "aws-test";
//const stage = "live";

export const useDataContext = () => useContext(DataContext);

const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    eat: [],
    stay: [],
    play: [],
    shop: [],
    events: [],
    combined: [],
  });
  const [filteredData, setFilteredData] = useState(data);
  const [typeCounts, setTypeCounts] = useState({
    menu_types: {},
    play_types: {},
    stay_types: {},
    shop_types: {},
  });
  const [typeNames, setTypeNames] = useState({
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAscending, setIsAscending] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [nearMe, setNearMe] = useState(false);

  const isValidCoordinate = (lat, lon) => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const valid = typeof latNum === 'number' && typeof lonNum === 'number' &&
                  !isNaN(latNum) && !isNaN(lonNum) &&
                  latNum >= -90 && latNum <= 90 &&
                  lonNum >= -180 && lonNum <= 180;
    if (!valid) {
      console.error(`Invalid coordinates: (${latNum}, ${lonNum})`);
    }
    return valid;
  };

  const fetchUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: parseFloat(position.coords.latitude),
              lon: parseFloat(position.coords.longitude),
            };
            if (isValidCoordinate(userLocation.lat, userLocation.lon)) {
              resolve(userLocation);
            } else {
              reject(new Error('Invalid user coordinates'));
            }
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const endpoints = {
        eat: `https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/data/eat`,
        stay: `https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/data/stay`,
        play: `https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/data/play`,
        shop: `https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/data/shop`,
        events: `https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/get-events`
      };

      const fetchEndpointData = async (endpoint) => {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      };

      const removeQuotesFromName = (name) => name.replace(/['"]/g, '');

      const results = await Promise.all(
        Object.keys(endpoints).map(async (key) => {
          try {
            const result = await fetchEndpointData(endpoints[key]);
            if (key !== 'events') {
              const updatedData = await Promise.all(
                result.map(async (item) => {
                  try {
                    const details = await getGoogleReviews(stage, item.lat, item.long, item.name);
                    return { 
                      ...item, 
                      ...details, 
                      type: key, 
                      name: removeQuotesFromName(item.name)
                    };
                  } catch (error) {
                    console.error(`Failed to fetch Google reviews for ${item.name}`, error);
                    return { 
                      ...item, 
                      type: key, 
                      name: removeQuotesFromName(item.name)
                    };
                  }
                })
              );
              return { key, data: updatedData };
            } else {
              const updatedEventsData = result.map((item) => ({
                ...item,
                type: 'events',
                name: removeQuotesFromName(item.name),
                start_date: new Date(item.start_date),
              }));
              return { key, data: updatedEventsData };
            }
          } catch (error) {
            console.error(`Failed to fetch data from ${endpoints[key]}`, error);
            throw error;
          }
        })
      );

      const dataMap = results.reduce((acc, { key, data }) => {
        if (key === 'events') {
          const today = new Date();
          acc[key] = data
            .filter((event) => {
              const startDate = event.start_date;
              return startDate >= today; // Filter out past events
            })
            .sort((a, b) => a.start_date - b.start_date); // Sort events by start_date
        } else {
          acc[key] = data.sort((a, b) => a.name.localeCompare(b.name));
        }
        return acc;
      }, {});

      dataMap.combined = [
        ...dataMap.eat,
        ...dataMap.stay,
        ...dataMap.play,
        ...dataMap.shop,
      ].sort((a, b) => a.name.localeCompare(b.name));

      const collectTypes = (data, typeKey) => {
        const typeCounts = {};
        data.forEach((item) => {
          if (item[typeKey]) {
            item[typeKey].forEach((type) => {
              if (typeCounts[type]) {
                typeCounts[type]++;
              } else {
                typeCounts[type] = 1;
              }
            });
          }
        });
        return typeCounts;
      };

      const newTypeCounts = {
        menu_types: collectTypes(dataMap.eat, 'menu_types'),
        play_types: collectTypes(dataMap.play, 'play_types'),
        stay_types: collectTypes(dataMap.stay, 'stay_types'),
        shop_types: collectTypes(dataMap.shop, 'shop_types'),
      };

      setData(dataMap);
      setFilteredData(dataMap);
      setTypeCounts(newTypeCounts);

      const response = await fetch(
        `https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/type-names/fetch-type-names`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ typeCounts: newTypeCounts }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const typeNamesData = await response.json();
      setTypeNames(typeNamesData);
    } catch (error) {
      setError(`Failed to fetch data: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [stage]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortByProximity = (data, userLocation) => {
    return data
      .filter((item) => {
        const valid = isValidCoordinate(item.lat, item.long);
        if (!valid) {
          console.error(
            `Invalid item coordinates for ${item.name}: (${item.lat}, ${item.long})`
          );
        }
        return valid;
      })
      .map((item) => ({
        ...item,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lon,
          parseFloat(item.lat),
          parseFloat(item.long)
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  const handleNearMe = () => {
    if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lon)) {
      setNearMe(true);
      const sortedData = {
        ...data,
        eat: sortByProximity(data.eat, userLocation),
        stay: sortByProximity(data.stay, userLocation),
        play: sortByProximity(data.play, userLocation),
        shop: sortByProximity(data.shop, userLocation),
        combined: sortByProximity(data.combined, userLocation),
      };
      setFilteredData(sortedData);
    } else {
      console.error('Invalid or missing user coordinates:', userLocation);
    }
  };

  const resetFilteredData = () => {
    setFilteredData(data);
  };

  const filterDataByTypes = useCallback(() => {
    const filterByTypes = (data, typeKey) => {
      if (selectedTypes[typeKey]?.length > 0) {
        return data.filter((item) =>
          item[typeKey]?.some((type) =>
            selectedTypes[typeKey].includes(parseInt(type))
          )
        );
      }
      return data;
    };

    const filtered = {
      eat: filterByTypes(data.eat, 'menu_types'),
      stay: filterByTypes(data.stay, 'stay_types'),
      play: filterByTypes(data.play, 'play_types'),
      shop: filterByTypes(data.shop, 'shop_types'),
      events: data.events,
      combined: [
        ...filterByTypes(data.eat, 'menu_types'),
        ...filterByTypes(data.stay, 'stay_types'),
        ...filterByTypes(data.play, 'play_types'),
        ...filterByTypes(data.shop, 'shop_types'),
      ],
    };
    setFilteredData(filtered);
  }, [selectedTypes, data]);

  const filterDataByKeyword = useCallback(() => {
    const filterByKeyword = (data) => {
      return data.filter((item) =>
        Object.values(item).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    };

    const filtered = {
      eat: filterByKeyword(data.eat),
      stay: filterByKeyword(data.stay),
      play: filterByKeyword(data.play),
      shop: filterByKeyword(data.shop),
      events: filterByKeyword(data.events),
      combined: [
        ...filterByKeyword(data.eat),
        ...filterByKeyword(data.stay),
        ...filterByKeyword(data.play),
        ...filterByKeyword(data.shop),
      ],
    };
    setFilteredData(filtered);
  }, [keyword, data]);

  useEffect(() => {
    fetchUserLocation()
      .then((location) => {
        setUserLocation(location);
        // If you want to automatically sort by proximity after fetching location:
        // handleNearMe();
      })
      .catch((error) => console.error('Failed to fetch user location:', error));
  }, [fetchUserLocation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    resetFilteredData(); // Reset the data to original before filtering
    filterDataByTypes();
  }, [selectedTypes, filterDataByTypes]);

  useEffect(() => {
    resetFilteredData(); // Reset the data to original before filtering
    filterDataByKeyword();
  }, [keyword, filterDataByKeyword]);

  useEffect(() => {
    if (selectedDate) {
      const filterEventsByDate = (events, date) => {
        return events
          .filter((event) => {
            if (!event.start_date) return false;
            const startDate = new Date(event.start_date);
            const endDate = event.end_date ? new Date(event.end_date) : null;
            return endDate
              ? startDate <= date && endDate >= date
              : startDate.toDateString() === date.toDateString();
          })
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      };

      const filtered = {
        ...data,
        events: filterEventsByDate(data.events, selectedDate),
      };
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [selectedDate, data]);

  const resetKeyword = () => {
    setKeyword('');
  };

  const sortData = useCallback(
    (ascending) => {
      const sortOrder = ascending ? 1 : -1;
      const sortedData = {
        eat: [...data.eat].sort((a, b) => a.name.localeCompare(b.name) * sortOrder),
        stay: [...data.stay].sort((a, b) => a.name.localeCompare(b.name) * sortOrder),
        play: [...data.play].sort((a, b) => a.name.localeCompare(b.name) * sortOrder),
        shop: [...data.shop].sort((a, b) => a.name.localeCompare(b.name) * sortOrder),
        events: [...data.events].sort((a, b) => (new Date(a.start_date) - new Date(b.start_date)) * sortOrder),
        combined: [...data.combined].sort((a, b) => a.name.localeCompare(b.name) * sortOrder),
      };
      setFilteredData(sortedData);
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
