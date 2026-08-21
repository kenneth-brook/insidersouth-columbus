import React, { createContext, useContext, useState, useLayoutEffect, useRef, useCallback } from 'react';

const HeightContext = createContext();

export const HeightProvider = ({ children }) => {
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const updateHeights = useCallback(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
    if (footerRef.current) {
      setFooterHeight(footerRef.current.offsetHeight);
    }
  }, []);

  useLayoutEffect(() => {
    updateHeights();
    window.addEventListener('resize', updateHeights);
    return () => window.removeEventListener('resize', updateHeights);
  }, [updateHeights]);

  useLayoutEffect(() => {
    const observer = new MutationObserver(updateHeights);
    if (headerRef.current) {
      observer.observe(headerRef.current, { childList: true, subtree: true, attributes: true, characterData: true });
    }
    if (footerRef.current) {
      observer.observe(footerRef.current, { childList: true, subtree: true, attributes: true, characterData: true });
    }
    return () => observer.disconnect();
  }, [headerRef, footerRef, updateHeights]);

  return (
    <HeightContext.Provider value={{ headerRef, footerRef, headerHeight, footerHeight, updateHeights }}>
      {children}
    </HeightContext.Provider>
  );
};

export const useHeightContext = () => useContext(HeightContext);
