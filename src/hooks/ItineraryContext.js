import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const ItineraryContext = createContext();
const ITINERARY_STORAGE_KEY = 'columbus-demo-itinerary';

const createDefaultItinerary = () => ({
  id: 1,
  user_id: 'demo-user',
  itinerary_name: 'My Itinerary',
  itinerary_data: [],
});

const loadStoredItinerary = () => {
  try {
    const stored = localStorage.getItem(ITINERARY_STORAGE_KEY);
    if (!stored) return createDefaultItinerary();

    const parsed = JSON.parse(stored);
    if (!parsed || !Array.isArray(parsed.itinerary_data)) {
      return createDefaultItinerary();
    }

    return {
      ...createDefaultItinerary(),
      ...parsed,
      itinerary_data: parsed.itinerary_data,
    };
  } catch (error) {
    console.warn('Unable to restore itinerary from local storage:', error);
    return createDefaultItinerary();
  }
};

export const ItineraryProvider = ({ children }) => {
  const [selectedItinerary, setSelectedItinerary] = useState(() => loadStoredItinerary());
  const [itineraries, setItineraries] = useState(() => [loadStoredItinerary()]);

  useEffect(() => {
    try {
      localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(selectedItinerary));
    } catch (error) {
      console.warn('Unable to persist itinerary to local storage:', error);
    }
  }, [selectedItinerary]);

  const updateItinerary = useCallback(async (itineraryId, itineraryData, itineraryName = null) => {
    const updatedItinerary = {
      ...selectedItinerary,
      id: itineraryId,
      itinerary_data: itineraryData,
      itinerary_name: itineraryName || selectedItinerary.itinerary_name || 'My Itinerary',
    };

    setSelectedItinerary(updatedItinerary);
    setItineraries([updatedItinerary]);
    return updatedItinerary;
  }, [selectedItinerary]);

  const saveItinerary = useCallback(async (userId, itineraryName, itineraryData = []) => {
    const updatedItinerary = {
      ...selectedItinerary,
      user_id: userId || selectedItinerary.user_id,
      itinerary_name: itineraryName || selectedItinerary.itinerary_name || 'My Itinerary',
      itinerary_data: itineraryData,
    };

    setSelectedItinerary(updatedItinerary);
    setItineraries([updatedItinerary]);
    return updatedItinerary;
  }, [selectedItinerary]);

  const fetchItineraries = useCallback(async () => {
    // Demo mode uses one locally persisted itinerary and never calls the backend.
  }, []);

  const addToItinerary = useCallback(async (location) => {
    const dayOneLocation = {
      ...location,
      visitDate: location.visitDate || '',
      visitTime: location.visitTime || '',
    };

    const updatedItinerary = {
      ...selectedItinerary,
      itinerary_data: [...selectedItinerary.itinerary_data, dayOneLocation],
    };

    setSelectedItinerary(updatedItinerary);
    setItineraries([updatedItinerary]);
    return updatedItinerary;
  }, [selectedItinerary]);

  const removeFromItinerary = useCallback(async () => {
    const resetItinerary = createDefaultItinerary();
    setSelectedItinerary(resetItinerary);
    setItineraries([resetItinerary]);
    localStorage.removeItem(ITINERARY_STORAGE_KEY);
  }, []);

  const selectItinerary = useCallback(() => {
    // There is only one itinerary in demo mode, so selection is unnecessary.
    return selectedItinerary;
  }, [selectedItinerary]);

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
