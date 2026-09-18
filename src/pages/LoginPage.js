import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { useHeightContext } from '../hooks/HeightContext';
import { useOrientation } from '../hooks/OrientationContext';
import { useAuth } from '../hooks/AuthContext';
import '../sass/componentsass/LoginPage.scss';

const LoginPage = () => {
  const { headerRef, footerRef, headerHeight, footerHeight, updateHeights } = useHeightContext();
  const orientation = useOrientation();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('demo@visitcolumbusga.com');
  const [password, setPassword] = useState('demo1234');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  const resumeDestination = location.state?.from || '/itinerary';
  const resumeState = location.state?.returnState || null;

  const resumeAfterLogin = () => {
    navigate(resumeDestination, {
      replace: true,
      state: resumeState,
    });
  };

  useEffect(() => {
    updateHeights();
  }, [headerRef, footerRef, updateHeights]);

  useEffect(() => {
    if (isAuthenticated) {
      resumeAfterLogin();
    }
  }, [isAuthenticated]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (mode === 'register') {
      if (password !== repeatPassword) {
        setError('Passwords do not match');
        return;
      }

      setMode('login');
      setPassword('demo1234');
      setRepeatPassword('');
      setStatus('Registration successful! Please sign in.');
      return;
    }

    if (mode === 'reset') {
      setMode('login');
      setStatus('Password reset instructions sent. Please sign in.');
      return;
    }

    login('demo-user');
    resumeAfterLogin();
  };

  const renderForm = () => (
    <>
      <div className="demo-mode-notice">
        <strong>Demo Mode</strong>
        <span>Sign-in is simulated. Login and itinerary data persist through page refreshes on this device.</span>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      {mode !== 'reset' && (
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      )}

      {mode === 'register' && (
        <div className="form-group">
          <label htmlFor="repeat-password">Repeat Password</label>
          <input type="password" id="repeat-password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />
        </div>
      )}

      <button type="submit">
        {mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Send Reset Link'}
      </button>

      {error && <p className="error">{error}</p>}
      {status && <p className="status">{status}</p>}

      {mode === 'login' ? (
        <>
          <p>
            Don't have an account? <span className="register-link" onClick={() => { setMode('register'); setError(null); setStatus(null); }}>Register</span>
          </p>
          <p>
            Can't remember your password? <span className="reset-link" onClick={() => { setMode('reset'); setError(null); setStatus(null); }}>Reset</span>
          </p>
        </>
      ) : (
        <p>
          Already have an account? <span className="login-link" onClick={() => { setMode('login'); setError(null); setStatus(null); }}>Login</span>
        </p>
      )}
    </>
  );

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
