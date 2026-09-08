import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const ItineraryContext = createContext();

export const ItineraryProvider = ({ children }) => {
  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [pendingLocations, setPendingLocations] = useState([]);

  useEffect(() => {
    // Demo itinerary data is intentionally session-only.
    localStorage.removeItem('selectedItineraryId');
  }, []);

  const updateItinerary = useCallback(async (itineraryId, itineraryData, itineraryName = null) => {
    const currentItinerary = itineraries.find((itinerary) => itinerary.id === itineraryId)
      || (selectedItinerary?.id === itineraryId ? selectedItinerary : null);

    if (!currentItinerary) return null;

    const updatedItinerary = {
      ...currentItinerary,
      itinerary_data: itineraryData,
      itinerary_name: itineraryName || currentItinerary.itinerary_name,
    };

    setItineraries((prevItineraries) =>
      prevItineraries.map((itinerary) =>
        itinerary.id === itineraryId ? updatedItinerary : itinerary
      )
    );
    setSelectedItinerary(updatedItinerary);

    return updatedItinerary;
  }, [itineraries, selectedItinerary]);

  const saveItinerary = useCallback(async (userId, itineraryName, itineraryData = []) => {
    const newItinerary = {
      id: Date.now(),
      user_id: userId,
      itinerary_name: itineraryName || 'My Itinerary',
      itinerary_data: [...itineraryData, ...pendingLocations],
    };

    setItineraries((prevItineraries) => [...prevItineraries, newItinerary]);
    setSelectedItinerary(newItinerary);
    setPendingLocations([]);

    return newItinerary;
  }, [pendingLocations]);

  const fetchItineraries = useCallback(async () => {
    // No backend request in demo mode. State already contains this session's itineraries.
  }, []);

  const addToItinerary = useCallback(async (location) => {
    if (selectedItinerary) {
      const updatedData = [...selectedItinerary.itinerary_data, location];
      return updateItinerary(
        selectedItinerary.id,
        updatedData,
        selectedItinerary.itinerary_name
      );
    }

    setPendingLocations((prevLocations) => [...prevLocations, location]);
    return null;
  }, [selectedItinerary, updateItinerary]);

  const removeFromItinerary = useCallback(async (itineraryId) => {
    setItineraries((prevItineraries) =>
      prevItineraries.filter((itinerary) => itinerary.id !== itineraryId)
    );

    if (selectedItinerary?.id === itineraryId) {
      setSelectedItinerary(null);
    }
  }, [selectedItinerary]);

  const selectItinerary = useCallback((itineraryId) => {
    const itinerary = itineraries.find((it) => it.id === itineraryId);

    if (!itinerary) return;

    if (pendingLocations.length > 0) {
      const updatedItinerary = {
        ...itinerary,
        itinerary_data: [...itinerary.itinerary_data, ...pendingLocations],
      };

      setItineraries((prevItineraries) =>
        prevItineraries.map((it) =>
          it.id === itineraryId ? updatedItinerary : it
        )
      );
      setSelectedItinerary(updatedItinerary);
      setPendingLocations([]);
      return;
    }

    setSelectedItinerary(itinerary);
  }, [itineraries, pendingLocations]);

  return (
    <ItineraryContext.Provider
      value={{
        itineraries,
        selectedItinerary,
        setSelectedItinerary,
        addToItinerary,
        removeFromItinerary,
        saveItinerary,
        updateItinerary,
        fetchItineraries,
        selectItinerary,
        isDemoMode: true,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItineraryContext = () => useContext(ItineraryContext);
