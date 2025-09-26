import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { performOAuthLogin } from '../utils/socialAuthHelpers';
import { toast } from 'react-toastify';

const SocialLogin = ({ compact = false }) => {
  const [loading, setLoading] = useState('');
  const { login } = useAuth();

  const handleSocialLogin = async (provider) => {
    setLoading(provider);
    try {
      const userData = await performOAuthLogin(provider);
      login(userData);
      toast.success(`Welcome back, ${userData.fullName}!`);
    } catch (error) {
      console.error('Social login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className={`social-login ${compact ? 'social-login--compact' : ''}`}>
      <div className="social-divider">
        <span className="divider-line"></span>
        <span className="divider-text">or</span>
        <span className="divider-line"></span>
      </div>
      
      <div className="social-buttons">
        <button 
          className={`social-btn google-btn ${loading === 'google' ? 'loading' : ''}`}
          onClick={() => handleSocialLogin('google')}
          disabled={!!loading}
          type="button"
        >
          <div className="social-btn__content">
            <div className="social-btn__icon">
              {loading === 'google' ? (
                <div className="loading-spinner">
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                </div>
              ) : (
                <svg viewBox="0 0 24 24" className="google-icon">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
            </div>
            <span className="social-btn__text">
              {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
            </span>
          </div>
          <div className="social-btn__ripple"></div>
        </button>
      </div>
      
      {!compact && (
        <div className="social-login__footer">
          <p className="social-login__hint">
            <span className="hint-icon">🔒</span>
            Secure authentication powered by Google
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialLogin;