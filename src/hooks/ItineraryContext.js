import React, { createContext, useState, useContext, useCallback } from 'react';

const ItineraryContext = createContext();

const createDefaultItinerary = () => ({
  id: 1,
  user_id: 'demo-user',
  itinerary_name: 'My Itinerary',
  itinerary_data: [],
});

export const ItineraryProvider = ({ children }) => {
  const [itineraries, setItineraries] = useState(() => [createDefaultItinerary()]);
  const [selectedItinerary, setSelectedItinerary] = useState(() => createDefaultItinerary());

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
    // Demo mode uses one in-memory itinerary and never calls the backend.
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
