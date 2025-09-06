import React, { useState, useEffect } from 'react';
import { Form, Link, useActionData, useNavigation, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import illustration from '../assets/illustration.jpg';
import darkIllustration from '../assets/dark.webp';
import wave from '../assets/wave.svg';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SocialLogin from '../components/SocialLogin';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="layout">
      <main>
        <div className="intro">
          <div className="signin-container">
            <h1>Sign In</h1>
            <p>Welcome back</p>
            <Form method="post" className="grid-sm">
              <div className="form-group">
                <label htmlFor="identifier">Email or Username</label>
                <div className="input-with-icon">
                  {/* <UserIcon className="input-icon" /> */}
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    required
                    placeholder="Enter your email or username"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  {/* <LockClosedIcon className="input-icon" /> */}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {actionData?.error && (
                <div className="error-message">
                  {actionData.error}
                </div>
              )}

              <input type="hidden" name="_action" value="login" />
              
              <button type="submit" className="btn btn--dark" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </Form>
            
            <p className="auth-link-text">
              Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
            </p>
            
            <SocialLogin />
            
            <div className="auth-footer">
              <p className="auth-link-text">
                New user? Just use Google login to create an account automatically
              </p>
            </div>
            
            <div className="login-encouragement">
              <div className="encouragement-icon">🌟</div>
              <p className="encouragement-text">
                Welcome back! Ready to continue your financial success story?
              </p>
            </div>
          </div>
          <img src={isDark ? darkIllustration : illustration} alt="Person with money" width={500} height={400} style={{objectFit: 'cover'}} />
        </div>
      </main>
      <img src={wave} alt="Decorative wave pattern" />
    </div>
  );
};

export default Login;