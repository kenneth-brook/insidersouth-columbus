import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { useHeightContext } from '../hooks/HeightContext';
import { useOrientation } from '../hooks/OrientationContext';
import { useAuth } from '../hooks/AuthContext';
import { useItineraryContext } from '../hooks/ItineraryContext';
import { useViewMode } from '../hooks/ViewModeContext';
import { ReactComponent as Intinerery } from '../assets/icos/intinerery.svg';
import { ReactComponent as EyeIcon } from '../assets/icos/eye.svg';
import { ReactComponent as PhoneIcon } from '../assets/icos/phone2.svg';
import { ReactComponent as WebIcon } from '../assets/icos/web.svg';
import { ReactComponent as MapIcon } from '../assets/icos/maps.svg';
import { ReactComponent as EditIcon } from '../assets/icos/edit.svg';
// import { ReactComponent as ShareIcon } from '../assets/icos/share.svg';  // Commented out since the file might be missing.
import '../sass/componentsass/Itinerary.scss';
import MapView from './components/MapView';
import Cookies from 'js-cookie';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Ensure the app element is set for accessibility

// Helper functions for formatting dates and times
const formatDate = (dateString) => {
  if (!dateString) {
    return ''; // Return an empty string if dateString is undefined or null
  }

  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day); // month is 0-indexed in JS
  const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
  const formattedDay = String(date.getDate()).padStart(2, '0');
  const yearShort = date.getFullYear().toString().slice(-2);
  return `${formattedMonth}/${formattedDay}/${yearShort}`;
};

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  const hours12 = date.getHours() % 12 || 12;
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${hours12}:${minutes} ${ampm}`;
};

// Sorting function for itinerary data
const sortItineraryData = (data) => {
  return data.sort((a, b) => {
    const dateA = a.visitDate ? new Date(a.visitDate) : null;
    const dateB = b.visitDate ? new Date(b.visitDate) : null;

    // If both dates are present, sort by date
    if (dateA && dateB) {
      const dateComparison = dateA - dateB;
      if (dateComparison !== 0) return dateComparison;

      // If dates are the same, sort by time
      const timeA = a.visitTime || '';
      const timeB = b.visitTime || '';
      return timeA.localeCompare(timeB);
    }

    // If only one date is present, the one with the date goes first
    if (dateA) return -1;
    if (dateB) return 1;

    // If neither date is present, consider them equal
    return 0;
  });
};

const Itinerary = ({ pageTitle }) => {
  const navigate = useNavigate();
  const { headerRef, footerRef, headerHeight, footerHeight, updateHeights } = useHeightContext();
  const orientation = useOrientation();
  const { userId, isAuthenticated, setUserId } = useAuth();
  const { itineraries, selectedItinerary, setSelectedItinerary, fetchItineraries, saveItinerary, updateItinerary, removeFromItinerary } = useItineraryContext();
  const [selectedItineraryId, setSelectedItineraryId] = useState(localStorage.getItem('selectedItineraryId') || '');
  const [newItineraryName, setNewItineraryName] = useState('');
  const [showNewItineraryPopup, setShowNewItineraryPopup] = useState(false);
  const [showEditItineraryPopup, setShowEditItineraryPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editLocationId, setEditLocationId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const { isMapView, setIsMapView } = useViewMode();

  const updateComponentHeights = useCallback(() => {
    updateHeights();
  }, [updateHeights]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
    } else {
      fetchItineraries(userId);
    }
  }, [isAuthenticated, userId, fetchItineraries, navigate]);

  useEffect(() => {
    updateComponentHeights();
  }, [updateComponentHeights]);

  useEffect(() => {
    if (selectedItineraryId) {
      const itinerary = itineraries.find(it => it.id === parseInt(selectedItineraryId));
      setSelectedItinerary(itinerary);
    }
  }, [selectedItineraryId, itineraries, setSelectedItinerary]);

  const handleSelectItineraryChange = (e) => {
    const itineraryId = e.target.value;
    setSelectedItineraryId(itineraryId);
    localStorage.setItem('selectedItineraryId', itineraryId);
  };

  const handleSelectItinerary = () => {
    if (selectedItineraryId === 'new') {
      setShowNewItineraryPopup(true);
    } else {
      const itinerary = itineraries.find(it => it.id === parseInt(selectedItineraryId));
      setSelectedItinerary(itinerary);
    }
  };

  const handleNewItinerarySave = async () => {
    try {
        let savedItinerary;

        if (selectedItinerary && selectedItinerary.id) {
            // This is an update to an existing itinerary
            const updatedItinerary = { ...selectedItinerary, itinerary_name: newItineraryName };
            savedItinerary = await updateItinerary(updatedItinerary.id, updatedItinerary.itinerary_data, updatedItinerary.itinerary_name);
        } else {
            // This is a new itinerary
            savedItinerary = await saveItinerary(userId, newItineraryName, []);
        }

        if (savedItinerary && savedItinerary.id) {
            await fetchItineraries(userId); // Refresh the itineraries list

            setSelectedItinerary(savedItinerary); // Set the new/updated itinerary as selected
            setSelectedItineraryId(savedItinerary.id.toString());

            setShowNewItineraryPopup(false); // Close the modal
            setNewItineraryName(''); // Clear the name input
        } else {
            console.error('Failed to save the itinerary or it didn’t return an ID.');
        }
    } catch (error) {
        console.error('Error saving or updating itinerary:', error);
    }
};




  const handleNewItineraryCancel = () => {
    setShowNewItineraryPopup(false);
    setNewItineraryName('');
  };

  const handleEditItinerary = () => {
    setShowEditItineraryPopup(true);
  };

  const handleDeleteItinerary = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteItinerary = async () => {
    if (!selectedItinerary || !selectedItinerary.id) return;

    try {
      await removeFromItinerary(selectedItinerary.id);
      setShowDeleteConfirmation(false);
      setShowEditItineraryPopup(false);
      setSelectedItineraryId('');
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setShowEditItineraryPopup(false);
  };

  const handleEditName = () => {
    setNewItineraryName(selectedItinerary.itinerary_name);
    setShowEditItineraryPopup(false);
    setShowNewItineraryPopup(true);
  };

  const handleEditLocation = async (location) => {
    setEditLocationId(location.id);
    setEditDate(location.visitDate || '');
    setEditTime(location.visitTime || '');

    const updatedLocation = {
      ...location,
      visitDate: editDate,
      visitTime: editTime
    };

    console.log("Raw visitDate:", location.visitDate);
    console.log("Formatted visitDate:", formatDate(location.visitDate));

    const updatedData = selectedItinerary.itinerary_data.map(loc =>
      loc.id === location.id ? updatedLocation : loc
    );
    const updatedItinerary = { ...selectedItinerary, itinerary_data: updatedData };
    setSelectedItinerary(updatedItinerary);
    await updateItinerary(updatedItinerary.id, updatedItinerary.itinerary_data, updatedItinerary.itinerary_name);
  };

  const handleCancelEdit = () => {
    setEditLocationId(null);
    setEditDate('');
    setEditTime('');
  };

  const handleUpdateLocation = async (location) => {
    const updatedLocation = {
      ...location,
      visitDate: editDate,
      visitTime: editTime
    };
    const updatedData = selectedItinerary.itinerary_data.map(loc =>
      loc.id === location.id ? updatedLocation : loc
    );
    const updatedItinerary = { ...selectedItinerary, itinerary_data: updatedData };
    setSelectedItinerary(updatedItinerary);
    await updateItinerary(updatedItinerary.id, updatedItinerary.itinerary_data, updatedItinerary.itinerary_name);
    handleCancelEdit();
  };

  const handleRemoveLocation = async (locationId) => {
    const updatedData = selectedItinerary.itinerary_data.filter(loc => loc.id !== locationId);
    const updatedItinerary = { ...selectedItinerary, itinerary_data: updatedData };
    setSelectedItinerary(updatedItinerary);
    await updateItinerary(updatedItinerary.id, updatedItinerary.itinerary_data, updatedItinerary.itinerary_name);
  };

  const handleMapView = (location) => {
    setIsMapView(true);
    navigate(`/${location.category}/${location.id}`, { state: { location } });
  };

  const calculateDayNumbers = (data) => {
    if (data.length === 0) return [];
  
    const firstDate = new Date(data[0].visitDate + 'T00:00:00');
    let currentDay = 1;
    let lastDate = firstDate;
    const dayNumbers = [];
  
    data.forEach((item, index) => {
      if (!item.visitDate) {
        dayNumbers.push(null);
        return;
      }
  
      const currentDate = new Date(item.visitDate + 'T00:00:00');
      const differenceInTime = currentDate - lastDate;
      const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  
      if (differenceInDays > 0) {
        currentDay += differenceInDays;
      }
  
      dayNumbers.push(currentDay);
      lastDate = currentDate;
    });
  
    return dayNumbers;
  };

  const renderLocationItem = (location, index, dayCount) => (
    <div key={index} className="location-item">
      <div className="left-side">
        <div className="day-box">
          <div className="day-label">DAY</div>
          <div className="day-number">{dayCount !== null ? String(dayCount).padStart(2, '0') : '--'}</div>
        </div>
        <div className="date-box">
          <div className="date-value">{location.visitDate ? formatDate(location.visitDate) : ''}</div>
        </div>
        <div className="time-box">
          <div className="time-value">{location.visitTime ? formatTime(location.visitTime) : '--:--'}</div>
        </div>
        <button className="details-button" onClick={() => navigate(`/detail/${location.id}`, { state: { location, category: location.category } })}>
          <EyeIcon />
          Details
        </button>
      </div>
      <div className="right-side">
        <div className="right-side-header">
          <div className='textBlock'>
            <h3>{location.name}</h3>
            <p>{location.street_address},</p>
            <p>{location.city}, {location.state} {location.zip}</p>
          </div>
          <button className="edit-button" onClick={() => handleEditLocation(location)}>
            <EditIcon />Edit</button>
        </div>
  
        <div className="button-group">
          {location.web && (
            <button onClick={() => window.open(location.web, '_blank')}>
              <WebIcon />
              Web
            </button>
          )}
          {location.phone && (
            <button onClick={() => window.open(`tel:${location.phone}`, '_blank')}>
              <PhoneIcon />
              Call
            </button>
          )}
          <button onClick={() => handleMapView(location)}>
            <MapIcon />
            Map
          </button>
        </div>
        {editLocationId === location.id && (
          <div className="edit-box">
            <label>Date:</label>
            <input 
              type="date" 
              value={editDate} 
              onChange={e => setEditDate(e.target.value)} 
            />
            <label>Time:</label>
            <input 
              type="time" 
              value={editTime} 
              onChange={e => setEditTime(e.target.value)} 
            />
            <button className="uBut" onClick={() => handleUpdateLocation(location)}>Update</button>
            <button className="rBut" onClick={() => handleRemoveLocation(location.id)}>Remove</button>
            <button className="cBut" onClick={handleCancelEdit}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );

  const pageTitleContent = (
    <div className="page-title">
      <div className="itinerery-title">
        <Intinerery />
        <h1>{pageTitle}</h1>
      </div>
    </div>
  );

  useEffect(() => {
    if (!showNewItineraryPopup) {
      console.log('Modal has been closed');
    }
  }, [showNewItineraryPopup]);

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
        className="internal-content itin"
        style={{
          paddingTop: `calc(${headerHeight}px + 30px)`,
          paddingBottom: `calc(${footerHeight}px + 50px)`,
        }}
      >
        {pageTitleContent}
        <Modal
          isOpen={showNewItineraryPopup}
          onRequestClose={handleNewItineraryCancel}
          contentLabel="Name your new itinerary"
          className="itinerary-modal"
          overlayClassName="itinerary-modal-overlay"
        >
          <h2>Please name your new itinerary</h2>
          <input
            type="text"
            value={newItineraryName}
            onChange={(e) => setNewItineraryName(e.target.value)}
            placeholder="Itinerary Name"
          />
          <div className="itinerary-popup-buttons">
            <button onClick={handleNewItinerarySave} className="itinerary-save-button">Save</button>
            <button onClick={handleNewItineraryCancel} className="itinerary-cancel-button">Cancel</button>
          </div>
        </Modal>

        <Modal
          isOpen={showEditItineraryPopup}
          onRequestClose={() => setShowEditItineraryPopup(false)}
          contentLabel="Edit Itinerary"
          className="itinerary-modal"
          overlayClassName="itinerary-modal-overlay"
        >
          {!showDeleteConfirmation ? (
            <>
              <h2>Edit Itinerary</h2>
              <div className="itinerary-popup-buttons">
                <button onClick={handleEditName} className="itinerary-save-button">Edit Name</button>
                <button onClick={handleDeleteItinerary} className="itinerary-delete-button rBut">Delete Itinerary</button>
              </div>
            </>
          ) : (
            <>
              <h2>Are you sure you want to delete this itinerary?</h2>
              <p>Once deleted, this cannot be undone.</p>
              <div className="itinerary-popup-buttons">
                <button onClick={confirmDeleteItinerary} className="itinerary-save-button">Yes</button>
                <button onClick={handleCancelDelete} className="itinerary-cancel-button">Cancel</button>
              </div>
            </>
          )}
        </Modal>

        <div className="itinerary-header">
          <div className="itinHeaderRow itinerary-select-container">
            <select className="itinerary-select" value={selectedItineraryId} onChange={handleSelectItineraryChange}>
              <option value="">Please Make A Selection</option>
              {itineraries.map(itinerary => (
                <option key={itinerary.id} value={itinerary.id}>
                  {itinerary.itinerary_name}
                </option>
              ))}
              <option value="new">New Itinerary</option>
            </select>
            <button className="itinerary-select-button" onClick={handleSelectItinerary}>Select</button>
          </div>
          {selectedItinerary && (
            <>
              <h2 className="itinerary-title">{selectedItinerary.itinerary_name}</h2>
              <button 
                onClick={handleEditItinerary} 
                className="edit-itinerary-button" 
                style={{ backgroundColor: '#006837', color: '#fff', fontSize: '1.2rem', padding: '5px 8px' }}
              >
                Edit Itinerary
              </button>
            </>
          )}
        </div>
        <div className="itinerary-content">
  {isMapView ? (
    <MapView data={selectedItinerary?.itinerary_data || []} />
  ) : selectedItinerary ? (
    selectedItinerary.itinerary_data.length > 0 ? (
      sortItineraryData(selectedItinerary.itinerary_data).map((location, index) => {
        const dayNumbers = calculateDayNumbers(sortItineraryData(selectedItinerary.itinerary_data));
        return renderLocationItem(location, index, dayNumbers[index]);
      })
    ) : (
      <p>This itinerary is empty.</p>
    )
  ) : (
    <p>Please select an itinerary or start a new one.</p>
  )}
</div>
      </main>
      <Footer ref={footerRef} showCircles={true} handleMapView={() => setIsMapView(true)} />
    </div>
  );
};

export default Itinerary;
