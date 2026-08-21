import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './sass/componentsass/App.scss';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import Itinerary from './pages/Itinerary'; // Correct the import
import DetailView from './pages/components/DetailView';
import Stay from './pages/Stay';
import Play from './pages/Play';
import Dine from './pages/Dine';
import Shop from './pages/Shop';
import Events from './pages/Events';
import AllView from './pages/AllView'; // Import AllView
import LoginPage from './pages/LoginPage'; // Import your login page
import ProtectedRoute from './pages/components/ProtectedRoute'; // Import the ProtectedRoute component
import { HeightProvider } from './hooks/HeightContext';
import { OrientationProvider } from './hooks/OrientationContext';
import DataProvider from './hooks/DataContext';
import { ViewModeProvider } from './hooks/ViewModeContext';
import { AuthProvider, useAuth } from './hooks/AuthContext'; // Import the AuthProvider and useAuth hook
import { ItineraryProvider } from './hooks/ItineraryContext';
import 'mapbox-gl/dist/mapbox-gl.css';
import initializeAnalytics from './analytics';

function App() {
  initializeAnalytics();
  
  useEffect(() => {
    const adjustViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    adjustViewportHeight();
    window.addEventListener('resize', adjustViewportHeight);
    window.addEventListener('orientationchange', adjustViewportHeight);

    return () => {
      window.removeEventListener('resize', adjustViewportHeight);
      window.removeEventListener('orientationchange', adjustViewportHeight);
    };
  }, []);

  return (
    <Router>
      <OrientationProvider>
        <HeightProvider>
          <DataProvider>
            <ViewModeProvider>
              <ItineraryProvider>
                <AuthProvider>
                  <div className="mainWrap">
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/stay" element={<Stay pageTitle="Stay" />} />
                      <Route path="/play" element={<Play pageTitle="Play" />} />
                      <Route path="/dine" element={<Dine pageTitle="Dine" />} />
                      <Route path="/shop" element={<Shop pageTitle="Shop" />} />
                      <Route path="/events" element={<Events pageTitle="Events" />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route element={<ProtectedRoute />}>
                        <Route path="/itinerary" element={<Itinerary pageTitle="Itinerary" />} />
                      </Route>
                      <Route path="/all" element={<AllView pageTitle="All View" />} />
                      <Route path="/:category/:id" element={<DetailView />} />
                    </Routes>
                  </div>
                </AuthProvider>
              </ItineraryProvider>
            </ViewModeProvider>
          </DataProvider>
        </HeightProvider>
      </OrientationProvider>
    </Router>
  );
}

export default App;
