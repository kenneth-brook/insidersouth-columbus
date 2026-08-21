import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useDataContext } from './DataContext';

const ItineraryContext = createContext();

export const ItineraryProvider = ({ children }) => {
  const { stage } = useDataContext();
  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [pendingLocations, setPendingLocations] = useState([]); // To store items selected before creating an itinerary

  useEffect(() => {
    // On component mount, check if there's a selected itinerary in localStorage
    const storedItineraryId = localStorage.getItem('selectedItineraryId');
    if (storedItineraryId) {
      selectItinerary(parseInt(storedItineraryId));
    }
  }, []);

  const updateItinerary = useCallback(async (itineraryId, itineraryData, itineraryName = null) => {
    try {
      const response = await axios.put(
        `https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/itinerary/update/${itineraryId}`,
        {
          itineraryData,
          itineraryName,
        }
      );

      const updatedItinerary = response.data;

      if (updatedItinerary && updatedItinerary.id) {
        setItineraries((prevItineraries) =>
          prevItineraries.map((it) => (it.id === itineraryId ? updatedItinerary : it))
        );
        setSelectedItinerary(updatedItinerary);
        return updatedItinerary;
      } else {
        throw new Error('Failed to get a valid updated itinerary');
      }
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw error;
    }
  }, [stage]);

  const saveItinerary = useCallback(async (userId, itineraryName, itineraryData) => {
    try {
      const response = await axios.post(`https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/itinerary/save`, {
        userId,
        itineraryName,
        itineraryData,
      });
      const newItinerary = response.data;

      if (newItinerary && newItinerary.id) {
        setItineraries((prevItineraries) => [...prevItineraries, newItinerary]);
        setSelectedItinerary(newItinerary); // Automatically select the newly created itinerary
        localStorage.setItem('selectedItineraryId', newItinerary.id); // Persist selected itinerary ID
        
        if (pendingLocations.length > 0) {
          const updatedData = [...newItinerary.itinerary_data, ...pendingLocations];
          const updatedItinerary = await updateItinerary(newItinerary.id, updatedData, newItinerary.itinerary_name);
          setSelectedItinerary(updatedItinerary);
          setPendingLocations([]); // Clear the pending locations
        }

        return newItinerary;
      } else {
        console.error('The server response did not include an ID.');
        return null;
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      return null;
    }
  }, [stage, pendingLocations, updateItinerary]);

  const fetchItineraries = useCallback(async (userId) => {
    try {
      const response = await axios.get(`https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/itinerary/user/${userId}`);
      setItineraries(response.data);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    }
  }, [stage]);

  const addToItinerary = useCallback(async (location) => {
    if (selectedItinerary) {
      const updatedData = [...selectedItinerary.itinerary_data, location];
      const response = await updateItinerary(selectedItinerary.id, updatedData, selectedItinerary.itinerary_name);
      setSelectedItinerary(response); // Update the selected itinerary with the new item
    } else {
      console.log('No itinerary selected. Storing location for later.');
      setPendingLocations((prevLocations) => [...prevLocations, location]); // Store the location in pending
    }
  }, [selectedItinerary, updateItinerary]);

  const removeFromItinerary = useCallback(async (itineraryId) => {
    try {
      await axios.delete(`https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/itinerary/delete/${itineraryId}`);
      setItineraries((prevItineraries) => prevItineraries.filter((it) => it.id !== itineraryId));
      setSelectedItinerary(null); // Reset the selected itinerary after deletion
      localStorage.removeItem('selectedItineraryId'); // Clear from localStorage
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  }, [stage]);

  const selectItinerary = useCallback((itineraryId) => {
    const itinerary = itineraries.find((it) => it.id === itineraryId);
    if (itinerary) {
      setSelectedItinerary(itinerary);
      localStorage.setItem('selectedItineraryId', itineraryId); // Persist selected itinerary ID
      if (pendingLocations.length > 0) {
        const updatedData = [...itinerary.itinerary_data, ...pendingLocations];
        updateItinerary(itinerary.id, updatedData, itinerary.itinerary_name).then((updatedItinerary) => {
          setSelectedItinerary(updatedItinerary);
          setPendingLocations([]); // Clear the pending locations
        });
      }
    } else {
      console.error('Itinerary not found.');
    }
  }, [itineraries, pendingLocations, updateItinerary]);

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
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItineraryContext = () => useContext(ItineraryContext);
