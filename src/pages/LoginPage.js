import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { useHeightContext } from '../hooks/HeightContext';
import { useOrientation } from '../hooks/OrientationContext';
import { useAuth } from '../hooks/AuthContext';
import Cookies from 'js-cookie';
import '../sass/componentsass/LoginPage.scss';
import { useDataContext } from '../hooks/DataContext';

const LoginPage = () => {
  const { headerRef, footerRef, headerHeight, footerHeight, updateHeights } = useHeightContext();
  const orientation = useOrientation();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, userId } = useAuth();
  const { stage } = useDataContext();

  useEffect(() => {
    updateHeights();
  }, [headerRef, footerRef, updateHeights]);

  useEffect(() => {
    const token = Cookies.get('token');
    const storedUserId = Cookies.get('userId');
    if (token && storedUserId && isAuthenticated) {
      const redirectTo = location.state?.from || '/itinerary';
      console.log('Redirecting to:', redirectTo);
      navigate(redirectTo);
    } else {
      console.log('No token or userId or not authenticated');
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
  
    if (mode === 'register' && password !== repeatPassword) {
      setError('Passwords do not match');
      return;
    }
  
    const url = mode === 'login'
      ? `https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/auth/login`
      : `https://8pz5kzj96d.execute-api.us-east-1.amazonaws.com/${stage}/auth/register`;
  
    const payload = { email, password };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Error from server:', errorMessage);
        setError(errorMessage);
        return;
      }
  
      const data = await response.json();
      console.log('Token received:', data.token);
      console.log('User ID received:', data.userId);
  
      if (mode === 'login') {
        // Only login user if mode is 'login'
        login(data.userId, data.token);
        const redirectTo = location.state?.from || '/itinerary';
        console.log('Redirecting to:', redirectTo);
        navigate(redirectTo);
      } else {
        // If registration is successful, redirect to login page
        console.log('Registration successful, redirecting to login');
        setMode('login');
        setEmail('');
        setPassword('');
        setRepeatPassword('');
        setError('Registration successful! Please log in.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again later.');
    }
  };  

  const renderForm = () => {
    return (
      <>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {mode === 'register' && (
          <div className="form-group">
            <label htmlFor="repeat-password">Repeat Password</label>
            <input type="password" id="repeat-password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />
          </div>
        )}
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
        {error && <p className="error">{error}</p>}
        {mode === 'login' ? (
          <>
            <p>
              Don't have an account? <span className="register-link" onClick={() => setMode('register')}>Register</span>
            </p>
            <p>
              Can't remember your password? <span className="reset-link" onClick={() => setMode('reset')}>Reset</span>
            </p>
          </>
        ) : (
          <p>
            Already have an account? <span className="login-link" onClick={() => setMode('login')}>Login</span>
          </p>
        )}
      </>
    );
  };

  const pageTitle = mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Reset Password';

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
        className="internal-content"
        style={{
          paddingTop: `calc(${headerHeight}px + 30px)`,
          paddingBottom: `calc(${footerHeight}px + 50px)`,
        }}
      >
        <div className="page-title">
          <h1>{pageTitle}</h1>
        </div>
        <div className="login-container">
          <form onSubmit={handleSubmit}>
            {renderForm()}
          </form>
        </div>
      </main>
      <Footer ref={footerRef} showCircles={true} />
    </div>
  );
};

export default LoginPage;
