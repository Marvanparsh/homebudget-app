import React, { useState, useEffect } from 'react';
import { Form, Link, useActionData, useNavigation, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, EnvelopeIcon, IdentificationIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import illustration from '../assets/illustration.jpg';
import darkIllustration from '../assets/dark.webp';
import wave from '../assets/wave.svg';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SocialLogin from '../components/SocialLogin';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === 'submitting';
  const { isDark } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="layout auth-layout">
      <main>
        <div className="intro auth-intro">
          <div className="auth-card modern-auth-card signup-card">
            <div className="auth-header">
              <h1>Get Started</h1>
              <p>Create your account and take control of your finances</p>
            </div>
            <Form method="post" className="auth-form signup-form">
              {/* Row 1: Full Name */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <div className="input-with-icon">
                   
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email and Username */}
              <div className="form-row form-row-two">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      required
                      placeholder="Choose username"
                      autoComplete="username"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Password and Confirm Password */}
              <div className="form-row form-row-two">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-with-icon">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      required
                      placeholder="Create password"
                      autoComplete="new-password"
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password visibility"
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              </div>

              {actionData?.error && (
                <div className="error-message">
                  {actionData.error}
                </div>
              )}

              <input type="hidden" name="_action" value="signup" />
              
              <button type="submit" className="btn btn--dark" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </Form>
            
            <SocialLogin compact />
            
            <div className="auth-footer">
              <p className="auth-link-text">
                Already have an account? <Link to="/login" className="auth-link">Sign in here</Link>
              </p>
            </div>
          </div>
          <div className="auth-illustration">
            <img src={isDark ? darkIllustration : illustration} alt="Person with money" />
          </div>
        </div>
      </main>
      <img src={wave} alt="Decorative wave pattern" />
    </div>
  );
};

export default Signup;