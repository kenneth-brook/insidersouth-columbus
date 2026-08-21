import React, { createContext, useContext, useState } from 'react';

const ViewModeContext = createContext();

export const useViewMode = () => useContext(ViewModeContext);

export const ViewModeProvider = ({ children }) => {
  const [isMapView, setIsMapView] = useState(false);

  return (
    <ViewModeContext.Provider value={{ isMapView, setIsMapView }}>
      {children}
    </ViewModeContext.Provider>
  );
};
