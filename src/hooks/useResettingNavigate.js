import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDataContext } from './DataContext';

export const useResettingNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetSortOrder } = useDataContext();

  useEffect(() => {
    resetSortOrder();
  }, [location.pathname, resetSortOrder]);

  return navigate;
};
